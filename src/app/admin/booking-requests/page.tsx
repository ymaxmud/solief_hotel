import { AdminShell } from "@/components/admin/AdminShell";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";
import { buildWhatsAppBookingLink } from "@/lib/crm/whatsapp";
import { AdminListControls, AdminPagination } from "@/components/admin/AdminListControls";
import { adminPageSize, getPage, getParam, getRange, searchTerm } from "@/lib/crm/pagination";
import { tashkentDayStart, tashkentDayEnd } from "@/lib/datetime";
import { adminEnumLabel } from "@/i18n/admin";

const BOOKING_STATUSES = ["new", "contacted", "confirmed", "rejected", "cancelled", "no_show"];

export const dynamic = "force-dynamic";

export default async function BookingRequestsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t, service } = await getAdminPageContext();
  const params = await searchParams;
  const page = getPage(params);
  const { from: rangeFrom, to: rangeTo } = getRange(page);
  const q = getParam(params, "q");
  const status = getParam(params, "status");
  const from = getParam(params, "from");
  const to = getParam(params, "to");
  let bookingQuery = service
    .from("booking_requests")
    .select("*, notifications(status,channel,error), assigned_staff:staff_members(full_name), stays(id)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo);
  if (q) {
    const term = searchTerm(q);
    bookingQuery = bookingQuery.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,public_reference.ilike.%${term}%`);
  }
  if (status) bookingQuery = bookingQuery.eq("status", status);
  if (from) bookingQuery = bookingQuery.gte("created_at", tashkentDayStart(from));
  if (to) bookingQuery = bookingQuery.lte("created_at", tashkentDayEnd(to));
  const [{ data, count, error }, { data: staff }] = await Promise.all([
    bookingQuery,
    service.from("staff_members").select("id,full_name").eq("status", "active").order("full_name")
  ]);
  const staffOptions = (staff || []).map((member) => ({ value: member.id, label: member.full_name }));
  const canManage = user.role === "admin" || user.role === "manager";
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.bookingRequests}</h1>
      <div className="mt-6">
        <AdminListControls t={t} search={q} status={status} from={from} to={to} statusOptions={BOOKING_STATUSES.map((value) => ({ value, label: adminEnumLabel(t, "bookingStatus", value) }))} />
        {error ? <p className="rounded-lg bg-coralBase/10 p-4 text-sm font-semibold text-coralBase">{t.loadError}</p> : (
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
              <span key="status">
                <span className="font-bold">{adminEnumLabel(t, "bookingStatus", row.status)}</span>
                <br />
                <span className="text-xs text-greenGray">{(row.assigned_staff as { full_name?: string } | null)?.full_name || t.unassigned}</span>
              </span>,
              <span key="email">
                {((row.notifications || []) as Array<{ status: string }>).map((n) => n.status).join(", ") || "-"}
                {((row.notifications || []) as Array<{ error?: string | null }>).find((n) => n.error) ? (
                  <span className="block text-xs text-coralBase">{((row.notifications || []) as Array<{ error?: string | null }>).find((n) => n.error)?.error}</span>
                ) : null}
              </span>,
              whatsappLink ? <a key="wa" className="font-bold text-coralBase" href={whatsappLink} target="_blank" rel="noopener noreferrer">{t.whatsapp}</a> : "-",
              <div key="actions" className="flex min-w-64 flex-wrap gap-2">
                <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "contacted" }} label={t.markContacted} />
                {canManage ? (
                  <>
                    <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "confirmed" }} label={t.confirm} />
                    <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "rejected" }} label={t.reject} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
                    <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "cancelled" }} label={t.cancel} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
                    <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "no_show" }} label={t.setNoShow} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
                    {["rejected", "cancelled", "no_show"].includes(row.status) ? (
                      <AdminActionButton endpoint="/api/admin/booking-requests" body={{ id: row.id, status: "new" }} label={t.reopen} />
                    ) : null}
                    {((row.stays as Array<{ id: string }> | null)?.length ?? 0) > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-hotelBlue/12 px-3 py-2 text-xs font-semibold text-greenGray">{t.convertedToStay}</span>
                    ) : row.guest_id ? (
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
        )}
        <AdminPagination pathname="/admin/booking-requests" searchParams={params} page={page} total={count || 0} pageSize={adminPageSize} t={t} />
      </div>
    </AdminShell>
  );
}
