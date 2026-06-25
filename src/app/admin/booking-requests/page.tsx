import { AdminShell } from "@/components/admin/AdminShell";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";
import { buildWhatsAppBookingLink } from "@/lib/crm/whatsapp";

export const dynamic = "force-dynamic";

export default async function BookingRequestsPage() {
  const { user, t, service } = await getAdminPageContext();
  const [{ data }, { data: staff }] = await Promise.all([
    service
    .from("booking_requests")
    .select("*, notifications(status,channel,error), assigned_staff:staff_members(full_name)")
      .order("created_at", { ascending: false })
      .limit(100),
    service.from("staff_members").select("id,full_name").eq("status", "active").order("full_name")
  ]);
  const staffOptions = (staff || []).map((member) => ({ value: member.id, label: member.full_name }));
  const canManage = user.role === "admin" || user.role === "manager";
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.bookingRequests}</h1>
      <div className="mt-6">
        <SimpleTable
          headers={[t.reference, t.fullName, t.dates, t.room, t.status, t.emailNotification, t.whatsapp, t.action]}
          emptyLabel={t.noData}
          rows={(data || []).map((row) => {
            const whatsappLink = buildWhatsAppBookingLink(row.public_reference, {
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
            });
            return [
              row.public_reference,
              <span key="guest">{row.full_name}<br /><span className="text-xs text-greenGray">{row.phone || row.email || "-"}</span></span>,
              `${row.check_in} → ${row.check_out}`,
              row.room_type,
              <span key="status" className="font-bold">{row.status}</span>,
              ((row.notifications || []) as Array<{ status: string }>).map((n) => n.status).join(", ") || "-",
              whatsappLink ? <a key="wa" className="font-bold text-coralBase" href={whatsappLink} target="_blank">{t.whatsapp}</a> : "-",
              <div key="actions" className="flex min-w-64 flex-wrap gap-2">
                <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "contacted" }} label={t.markContacted} />
                {canManage ? (
                  <>
                    <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "confirmed" }} label={t.confirm} />
                    <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "rejected" }} label={t.reject} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
                    <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "cancelled" }} label={t.cancel} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
                    {row.guest_id ? (
                      <AdminActionButton
                        endpoint="/api/admin/stays"
                        method="POST"
                        body={{ guestId: row.guest_id, bookingRequestId: row.id, expectedCheckIn: row.check_in, expectedCheckOut: row.check_out, adults: row.guests_count, status: "expected" }}
                        label={t.convertToStay}
                      />
                    ) : null}
                    <AdminSelectAction endpoint="/api/admin/booking-requests" id={row.id} field="assignedStaffId" options={staffOptions} placeholder={t.assignStaff} buttonLabel={t.save} />
                  </>
                ) : null}
              </div>
            ];
          })}
        />
      </div>
    </AdminShell>
  );
}
