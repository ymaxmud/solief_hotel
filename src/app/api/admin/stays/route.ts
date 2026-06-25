import { NextResponse } from "next/server";
import { withRole, insertAudit } from "@/lib/crm/api";
import { staySchema, stayUpdateSchema } from "@/lib/crm/validation";
import { assertCan } from "@/lib/crm/permissions";

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
    const allowed = assertCan(profile.role, "stay:create");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = staySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const body = parsed.data;
    const row = {
      guest_id: body.guestId,
      booking_request_id: body.bookingRequestId || null,
      room_id: body.roomId || null,
      status: body.status,
      expected_check_in: body.expectedCheckIn || null,
      expected_check_out: body.expectedCheckOut || null,
      adults: body.adults,
      children: body.children,
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

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "stay:update");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = stayUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const update: Record<string, unknown> = {
      updated_by: profile.id,
      updated_at: new Date().toISOString()
    };
    if (input.roomId !== undefined) update.room_id = input.roomId;
    if (input.expectedCheckIn !== undefined) update.expected_check_in = input.expectedCheckIn || null;
    if (input.expectedCheckOut !== undefined) update.expected_check_out = input.expectedCheckOut || null;
    if (input.notes !== undefined) update.notes = input.notes || null;
    if (input.status) {
      update.status = input.status;
      if (input.status === "checked_in") update.check_in_at = new Date().toISOString();
      if (input.status === "checked_out") update.check_out_at = new Date().toISOString();
    }
    const { data, error } = await service.from("stays").update(update).eq("id", input.id).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "update", "stays", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
