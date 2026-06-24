import { NextResponse } from "next/server";
import { bookingUpdateSchema } from "@/lib/crm/validation";
import { withRole, insertAudit } from "@/lib/crm/api";
import { buildWhatsAppBookingLink } from "@/lib/crm/whatsapp";

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
    const body = await request.json();
    const id = body.id;
    const parsed = bookingUpdateSchema.safeParse(body);
    if (!id || !parsed.success) return NextResponse.json({ ok: false, error: "Invalid update" }, { status: 400 });
    const update = {
      status: parsed.data.status,
      assigned_staff_id: parsed.data.assignedStaffId,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await service.from("booking_requests").update(update).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "update", "booking_requests", id, data);
    return NextResponse.json({ ok: true, data });
  });
}
