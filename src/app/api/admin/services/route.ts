import { NextResponse } from "next/server";
import { serviceAssignmentSchema } from "@/lib/crm/validation";
import { withRole, insertAudit } from "@/lib/crm/api";

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
