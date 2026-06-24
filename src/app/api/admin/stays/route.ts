import { NextResponse } from "next/server";
import { withRole, insertAudit } from "@/lib/crm/api";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service
      .from("stays")
      .select("*, guests(full_name,phone,email), rooms(room_number)")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ profile, service }) => {
    const body = await request.json();
    if (!body.guestId) return NextResponse.json({ ok: false, error: "Guest id required" }, { status: 400 });
    const row = {
      guest_id: body.guestId,
      booking_request_id: body.bookingRequestId || null,
      room_id: body.roomId || null,
      status: body.status || "expected",
      expected_check_in: body.expectedCheckIn || null,
      expected_check_out: body.expectedCheckOut || null,
      adults: Number(body.adults || 1),
      children: Number(body.children || 0),
      notes: body.notes || null,
      created_by: profile.id,
      updated_by: profile.id
    };
    const { data, error } = await service.from("stays").insert(row).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "create", "stays", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
