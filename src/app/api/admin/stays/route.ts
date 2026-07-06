import { NextResponse } from "next/server";
import { withRole, insertAudit, apiError } from "@/lib/crm/api";
import { staySchema, stayUpdateSchema } from "@/lib/crm/validation";
import { assertCan } from "@/lib/crm/permissions";

type StayRow = { id: string } & Record<string, unknown>;

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service
      .from("stays")
      .select("*, guests(full_name,phone,email), rooms(room_number)")
      .order("created_at", { ascending: false });
    if (error) return apiError("stays:list", error);
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
    if (body.bookingRequestId) {
      const { data, error } = await service
        .rpc("create_stay_from_booking", {
          p_booking_request_id: body.bookingRequestId,
          p_room_id: body.roomId || null,
          p_actor_user_id: profile.id
        })
        .single();
      if (error) return apiError("stays:convert", error, { status: 400, message: lifecycleErrorMessage(error.message) });
      const stay = data as StayRow;
      await insertAudit(request, profile.id, "convert_booking_to_stay", "stays", stay.id, stay);
      return NextResponse.json({ ok: true, data: stay });
    }

    const { data, error } = await service
      .rpc("create_manual_stay", {
        p_guest_id: body.guestId,
        p_room_id: body.roomId || null,
        p_status: body.status,
        p_expected_check_in: body.expectedCheckIn || null,
        p_expected_check_out: body.expectedCheckOut || null,
        p_adults: body.adults,
        p_children: body.children,
        p_notes: body.notes || null,
        p_actor_user_id: profile.id
      })
      .single();
    if (error) return apiError("stays:create", error, { status: 400, message: lifecycleErrorMessage(error.message) });
    const stay = data as StayRow;
    await insertAudit(request, profile.id, "create", "stays", stay.id, stay);
    return NextResponse.json({ ok: true, data: stay });
  });
}

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "stay:update");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = stayUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const { data, error } = await service
      .rpc("update_stay_lifecycle", {
        p_stay_id: input.id,
        p_room_id: input.roomId === undefined ? null : input.roomId,
        p_status: input.status || null,
        p_expected_check_in: input.expectedCheckIn || null,
        p_expected_check_out: input.expectedCheckOut || null,
        p_notes: input.notes === undefined ? null : input.notes,
        p_actor_user_id: profile.id
      })
      .single();
    if (error) return apiError("stays:update", error, { status: 400, message: lifecycleErrorMessage(error.message) });
    const stay = data as StayRow;
    await insertAudit(request, profile.id, "update", "stays", stay.id, stay);
    return NextResponse.json({ ok: true, data: stay });
  });
}

function lifecycleErrorMessage(message: string) {
  if (message.includes("room_required_for_check_in")) return "Assign a room before checking in the guest.";
  if (message.includes("room_not_available")) return "Selected room is not available.";
  if (message.includes("booking_not_found")) return "Booking request was not found.";
  if (message.includes("booking_missing_guest")) return "Booking request is missing a linked guest.";
  if (message.includes("guest_not_found")) return "Guest was not found.";
  return "Could not complete the stay update. Please check the details and try again.";
}
