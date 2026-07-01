import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";
import { AdminListControls, AdminPagination } from "@/components/admin/AdminListControls";
import { adminPageSize, getPage, getParam, getRange, searchTerm } from "@/lib/crm/pagination";

export const dynamic = "force-dynamic";

export default async function ServicesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t, service } = await getAdminPageContext();
  const params = await searchParams;
  const page = getPage(params);
  const { from: rangeFrom, to: rangeTo } = getRange(page);
  const q = getParam(params, "q");
  const status = getParam(params, "status");
  const from = getParam(params, "from");
  const to = getParam(params, "to");
  let servicesQuery = service.from("service_assignments").select("*, guests(full_name), staff_members(full_name)", { count: "exact" }).order("created_at", { ascending: false }).range(rangeFrom, rangeTo);
  if (status) servicesQuery = servicesQuery.eq("status", status);
  if (q) {
    const term = searchTerm(q);
    servicesQuery = servicesQuery.or(`notes.ilike.%${term}%`);
  }
  if (from) servicesQuery = servicesQuery.gte("created_at", `${from}T00:00:00.000Z`);
  if (to) servicesQuery = servicesQuery.lte("created_at", `${to}T23:59:59.999Z`);
  const [{ data, count }, { data: guests }, { data: staff }] = await Promise.all([
    servicesQuery,
    service.from("guests").select("id,full_name").order("created_at", { ascending: false }).limit(100),
    service.from("staff_members").select("id,full_name").eq("status", "active").order("full_name")
  ]);
  const canManage = user.role === "admin" || user.role === "manager";
  const guestOptions = (guests || []).map((guest) => ({ value: guest.id, label: guest.full_name }));
  const staffOptions = (staff || []).map((member) => ({ value: member.id, label: member.full_name }));
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.services}</h1>
      <div className="mt-6 grid gap-6">
        {canManage ? (
          <AdminCard title={t.create}>
            <AdminMutationForm endpoint="/api/admin/services" submitLabel={t.create} savedLabel={t.saved} saveFailedLabel={t.saveFailed} loadingLabel={t.loading} fields={[
              { name: "guestId", label: t.exactGuestServed, options: guestOptions, required: true },
              { name: "staffMemberId", label: t.staff, options: staffOptions, required: true },
              { name: "serviceType", label: t.serviceType, options: ["reception", "cleaning", "luggage", "airport_transfer", "maintenance", "complaint", "room_service", "other"], required: true },
              { name: "status", label: t.status, options: ["open", "in_progress"], required: true },
              { name: "notes", label: t.notes }
            ]} />
          </AdminCard>
        ) : null}
        <AdminCard title={t.exactGuestServed}>
          <AdminListControls t={t} search={q} status={status} from={from} to={to} statusOptions={["open", "in_progress", "done", "cancelled"]} />
          <SimpleTable headers={[t.exactGuestServed, t.staff, t.serviceType, t.status, t.action]} emptyLabel={t.noData} rows={(data || []).map((row) => [
            (row.guests as { full_name?: string } | null)?.full_name || "-",
            (row.staff_members as { full_name?: string } | null)?.full_name || "-",
            row.service_type,
            row.status,
            canManage ? (
              <div key="actions" className="flex min-w-56 flex-wrap gap-2">
                <AdminActionButton endpoint="/api/admin/services" body={{ id: row.id, status: "in_progress" }} label={t.start} />
                <AdminActionButton endpoint="/api/admin/services" body={{ id: row.id, status: "done" }} label={t.complete} />
                <AdminActionButton endpoint="/api/admin/services" body={{ id: row.id, status: "cancelled" }} label={t.cancel} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
                <AdminSelectAction endpoint="/api/admin/services" id={row.id} field="staffMemberId" options={staffOptions} placeholder={t.assignStaff} buttonLabel={t.save} />
              </div>
            ) : "-"
          ])} />
          <AdminPagination pathname="/admin/services" searchParams={params} page={page} total={count || 0} pageSize={adminPageSize} t={t} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
