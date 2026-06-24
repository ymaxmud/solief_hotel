import { NextResponse } from "next/server";
import { qrAttendanceSchema } from "@/lib/crm/validation";
import { hashAttendanceToken, isWithinAttendanceRadius } from "@/lib/crm/attendance";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = qrAttendanceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const service = createSupabaseServiceClient();
  const tokenHash = hashAttendanceToken(input.token);

  const { data: token, error: tokenError } = await service
    .from("attendance_qr_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .eq("purpose", input.purpose)
    .maybeSingle();

  if (tokenError || !token) return NextResponse.json({ ok: false, error: "Invalid QR token." }, { status: 400 });
  if (token.used_at) return NextResponse.json({ ok: false, error: "This QR token has already been used." }, { status: 400 });
  if (new Date(token.expires_at).getTime() < Date.now()) return NextResponse.json({ ok: false, error: "This QR token has expired." }, { status: 400 });

  const geo = isWithinAttendanceRadius({ lat: input.lat, lng: input.lng });
  if (!geo.ok) {
    return NextResponse.json({ ok: false, error: `Outside attendance radius (${Math.round(geo.distance)}m / ${geo.radius}m).` }, { status: 400 });
  }

  if (input.purpose === "check_in") {
    const { data: existing } = await service
      .from("attendance_records")
      .select("id")
      .eq("staff_member_id", input.staffMemberId)
      .eq("status", "open")
      .is("check_out_at", null)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: false, error: "This staff member already has an open attendance record." }, { status: 400 });

    const { data, error } = await service
      .from("attendance_records")
      .insert({
        staff_member_id: input.staffMemberId,
        check_in_at: new Date().toISOString(),
        check_in_method: "qr",
        check_in_lat: input.lat,
        check_in_lng: input.lng,
        check_in_distance_meters: geo.distance,
        status: "open"
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await markTokenUsed(service, token.id, input.staffMemberId);
    return NextResponse.json({ ok: true, attendanceRecordId: data.id, status: "checked_in" });
  }

  const { data: openRecord } = await service
    .from("attendance_records")
    .select("id")
    .eq("staff_member_id", input.staffMemberId)
    .eq("status", "open")
    .is("check_out_at", null)
    .maybeSingle();
  if (!openRecord) return NextResponse.json({ ok: false, error: "No open attendance record found for this staff member." }, { status: 400 });

  const { data, error } = await service
    .from("attendance_records")
    .update({
      check_out_at: new Date().toISOString(),
      check_out_method: "qr",
      check_out_lat: input.lat,
      check_out_lng: input.lng,
      check_out_distance_meters: geo.distance,
      status: "closed"
    })
    .eq("id", openRecord.id)
    .select("id")
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  await markTokenUsed(service, token.id, input.staffMemberId);
  return NextResponse.json({ ok: true, attendanceRecordId: data.id, status: "checked_out" });
}

async function markTokenUsed(service: ReturnType<typeof createSupabaseServiceClient>, tokenId: string, staffMemberId: string) {
  await service
    .from("attendance_qr_tokens")
    .update({ used_at: new Date().toISOString(), used_by_staff_id: staffMemberId })
    .eq("id", tokenId)
    .is("used_at", null);
}
