import { NextResponse } from "next/server";
import { serviceAssignmentSchema, serviceUpdateSchema } from "@/lib/crm/validation";
import { withRole, insertAudit } from "@/lib/crm/api";
import { assertCan } from "@/lib/crm/permissions";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service
      .from("service_assignments")
      .select("*, guests(full_name), staff_members(full_name), stays(id)")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "service:create");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = serviceAssignmentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const row = {
      guest_id: input.guestId,
      staff_member_id: input.staffMemberId,
      stay_id: input.stayId || null,
      booking_request_id: input.bookingRequestId || null,
      service_type: input.serviceType,
      status: input.status,
      notes: input.notes || null,
      created_by: profile.id,
      updated_by: profile.id
    };
    const { data, error } = await service.from("service_assignments").insert(row).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "create", "service_assignments", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "service:update");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = serviceUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
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
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "update", "service_assignments", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
