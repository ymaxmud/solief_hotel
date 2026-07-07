import { NextResponse } from "next/server";
import { serviceAssignmentSchema, serviceUpdateSchema } from "@/lib/crm/validation";
import { withRole, insertAudit, apiError } from "@/lib/crm/api";
import { assertCan } from "@/lib/crm/permissions";

type ServiceAssignmentRow = { id: string } & Record<string, unknown>;

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service
      .from("service_assignments")
      .select("*, guests(full_name), staff_members(full_name), stays(id)")
      .order("created_at", { ascending: false });
    if (error) return apiError("services:list", error);
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "service:create");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = serviceAssignmentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
    const input = parsed.data;
    // Guard against accidental duplicates (e.g. a double-submit / retry): reject if an
    // open or in-progress service of the same type already exists for this guest.
    const { data: existing } = await service
      .from("service_assignments")
      .select("id")
      .eq("guest_id", input.guestId)
      .eq("service_type", input.serviceType)
      .in("status", ["open", "in_progress"])
      .limit(1)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: false, error: "An active service of this type already exists for this guest." }, { status: 409 });
    }
    const { data, error } = await service
      .rpc("create_service_assignment_for_checked_in_guest", {
        p_guest_id: input.guestId,
        p_staff_member_id: input.staffMemberId,
        p_stay_id: input.stayId || null,
        p_booking_request_id: input.bookingRequestId || null,
        p_service_type: input.serviceType,
        p_status: input.status,
        p_notes: input.notes || null,
        p_actor_user_id: profile.id
      })
      .single();
    if (error) return apiError("services:create", error, { status: 400, message: serviceErrorMessage(error.message) });
    const assignment = data as ServiceAssignmentRow;
    await insertAudit(request, profile.id, "create", "service_assignments", assignment.id, assignment);
    return NextResponse.json({ ok: true, data: assignment });
  });
}

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "service:update");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = serviceUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
    const input = parsed.data;
    const update: Record<string, unknown> = {
      updated_by: profile.id,
      updated_at: new Date().toISOString()
    };
    if (input.staffMemberId) update.staff_member_id = input.staffMemberId;
    if (input.notes !== undefined) update.notes = input.notes || null;
    if (input.status) {
      update.status = input.status;
      if (input.status === "in_progress") update.started_at = new Date().toISOString();
      if (input.status === "done") update.completed_at = new Date().toISOString();
    }
    const { data, error } = await service.from("service_assignments").update(update).eq("id", input.id).select("*").single();
    if (error) return apiError("services:update", error);
    await insertAudit(request, profile.id, "update", "service_assignments", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}

function serviceErrorMessage(message: string) {
  if (message.includes("checked_in_stay_required")) return "Service assignments require a checked-in guest stay.";
  if (message.includes("staff_not_active")) return "Selected staff member is not active.";
  return "Could not create the service assignment. Please check the details and try again.";
}
