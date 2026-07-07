import { NextResponse } from "next/server";
import { bookingUpdateSchema } from "@/lib/crm/validation";
import { withRole, insertAudit, apiError } from "@/lib/crm/api";
import { buildWhatsAppBookingLink } from "@/lib/crm/whatsapp";
import { assertCan, bookingStatusAction } from "@/lib/crm/permissions";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service
      .from("booking_requests")
      .select("*, notifications(status, channel, error), assigned_staff:staff_members(full_name)")
      .order("created_at", { ascending: false });
    if (error) return apiError("booking-requests:list", error);
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
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid update" }, { status: 400 });
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
    // Guard transitions: a finalized request (rejected/cancelled/no_show) can only be
    // reopened (set back to "new"), not re-confirmed or re-rejected from a stale button.
    if (parsed.data.status) {
      const { data: current } = await service.from("booking_requests").select("status").eq("id", id).single();
      const terminal = ["rejected", "cancelled", "no_show"];
      if (current && terminal.includes(current.status) && parsed.data.status !== "new") {
        return NextResponse.json({ ok: false, error: "This request is closed. Reopen it to “New” before changing its status." }, { status: 409 });
      }
    }
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    if (parsed.data.status) update.status = parsed.data.status;
    if (parsed.data.assignedStaffId !== undefined) update.assigned_staff_id = parsed.data.assignedStaffId;
    const { data, error } = await service.from("booking_requests").update(update).eq("id", id).select("*").single();
    if (error) return apiError("booking-requests:update", error);
    await insertAudit(request, profile.id, "update", "booking_requests", id, data);
    return NextResponse.json({ ok: true, data });
  });
}
