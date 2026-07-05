import { NextResponse } from "next/server";
import { manualAttendanceSchema } from "@/lib/crm/validation";
import { withRole, insertAudit } from "@/lib/crm/api";
import { localInputToIso } from "@/lib/datetime";

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const parsed = manualAttendanceSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const method = profile.role === "admin" ? "manual_admin" : "manual_manager";
    let at = new Date().toISOString();
    if (input.at) {
      const iso = localInputToIso(input.at);
      if (!iso) return NextResponse.json({ ok: false, error: "Invalid date/time." }, { status: 400 });
      at = iso;
    }

    if (input.action === "check_in") {
      const { data: existing } = await service
        .from("attendance_records")
        .select("id")
        .eq("staff_member_id", input.staffMemberId)
        .is("check_out_at", null)
        .maybeSingle();
      if (existing) return NextResponse.json({ ok: false, error: "Open attendance record already exists." }, { status: 400 });
      const { data, error } = await service
        .from("attendance_records")
        .insert({
          staff_member_id: input.staffMemberId,
          check_in_at: at,
          check_in_method: method,
          status: "open",
          correction_reason: input.correctionReason,
          corrected_by: profile.id,
          created_by: profile.id
        })
        .select("*")
        .single();
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      await insertAudit(request, profile.id, "manual_check_in", "attendance_records", data.id, data);
      return NextResponse.json({ ok: true, data });
    }

    const { data: openRecord } = await service
      .from("attendance_records")
      .select("*")
      .eq("staff_member_id", input.staffMemberId)
      .is("check_out_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!openRecord) return NextResponse.json({ ok: false, error: "No attendance record to close." }, { status: 400 });
    const { data, error } = await service
        .from("attendance_records")
        .update({
          check_out_at: at,
          check_out_method: method,
          status: "closed",
          correction_reason: input.correctionReason,
          corrected_by: profile.id,
          updated_by: profile.id
      })
      .eq("id", openRecord.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "manual_check_out", "attendance_records", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
