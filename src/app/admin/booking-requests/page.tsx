import { AdminShell } from "@/components/admin/AdminShell";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

export default async function BookingRequestsPage() {
  const { user, t, service } = await getAdminPageContext();
  const { data } = await service
    .from("booking_requests")
    .select("*, notifications(status,channel,error), assigned_staff:staff_members(full_name)")
    .order("created_at", { ascending: false });
  const whatsappPhone = process.env.HOTEL_OWNER_WHATSAPP_E164?.replace(/[^\d]/g, "");
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.bookingRequests}</h1>
      <div className="mt-6">
        <SimpleTable
          headers={[t.reference, t.fullName, t.dates, t.room, t.status, t.emailNotification, t.whatsapp]}
          emptyLabel={t.noData}
          rows={(data || []).map((row) => [
            row.public_reference,
            <span key="guest">{row.full_name}<br /><span className="text-xs text-greenGray">{row.phone || row.email || "-"}</span></span>,
            `${row.check_in} → ${row.check_out}`,
            row.room_type,
            row.status,
            ((row.notifications || []) as Array<{ status: string }>).map((n) => n.status).join(", ") || "-",
            whatsappPhone ? <a key="wa" className="font-bold text-coralBase" href={`https://wa.me/${whatsappPhone}`} target="_blank">{t.whatsapp}</a> : "-"
          ])}
        />
      </div>
    </AdminShell>
  );
}
