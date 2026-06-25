import { NextResponse } from "next/server";
import { bookingUpdateSchema } from "@/lib/crm/validation";
import { withRole, insertAudit } from "@/lib/crm/api";
import { buildWhatsAppBookingLink } from "@/lib/crm/whatsapp";
import { assertCan, bookingStatusAction } from "@/lib/crm/permissions";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service
      .from("booking_requests")
      .select("*, notifications(status, channel, error), assigned_staff:staff_members(full_name)")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({
      ok: true,
      data: (data || []).map((row) => ({
        ...row,
        whatsapp_link: buildWhatsAppBookingLink(row.public_reference, {
          name: row.full_name,
          phone: row.phone || "",
          email: row.email || "",
          checkIn: row.check_in,
          checkOut: row.check_out,
          guests: row.guests_count,
          roomType: row.room_type,
          language: row.preferred_language,
          contactMethod: row.preferred_contact,
          message: row.message || ""
        })
      }))
    });
  });
}

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ profile, service }) => {
    const parsed = bookingUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid update", errors: parsed.error.flatten() }, { status: 400 });
    const { id } = parsed.data;
    const statusAction = bookingStatusAction(parsed.data.status);
    if (statusAction) {
      const allowed = assertCan(profile.role, statusAction);
      if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    }
    if (parsed.data.assignedStaffId !== undefined) {
      const allowed = assertCan(profile.role, "booking:assign_staff");
      if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    }
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    if (parsed.data.status) update.status = parsed.data.status;
    if (parsed.data.assignedStaffId !== undefined) update.assigned_staff_id = parsed.data.assignedStaffId;
    const { data, error } = await service.from("booking_requests").update(update).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "update", "booking_requests", id, data);
    return NextResponse.json({ ok: true, data });
  });
}
