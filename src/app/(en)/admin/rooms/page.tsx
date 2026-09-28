import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";
import { AdminListControls, AdminPagination } from "@/components/admin/AdminListControls";
import { adminPageSize, getPage, getParam, getRange, searchTerm } from "@/lib/crm/pagination";
import { adminEnumLabel } from "@/i18n/admin";

const ROOM_STATUSES = ["available", "occupied", "cleaning", "maintenance", "out_of_service"];
const CLEANING_STATUSES = ["clean", "dirty", "in_progress", "inspected"];

export const dynamic = "force-dynamic";

export default async function RoomsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t, service } = await getAdminPageContext();
  const params = await searchParams;
  const page = getPage(params);
  const { from: rangeFrom, to: rangeTo } = getRange(page);
  const q = getParam(params, "q");
  const status = getParam(params, "status");
  let query = service.from("rooms").select("*, room_categories(name_en)", { count: "exact" }).order("room_number").range(rangeFrom, rangeTo);
  if (q) query = query.or(`room_number.ilike.%${searchTerm(q)}%,floor.ilike.%${searchTerm(q)}%`);
  if (status) query = query.eq("status", status);
  const { data, count, error } = await query;
  const canManage = user.role === "admin" || user.role === "manager";
  const statusOptions = ROOM_STATUSES.map((value) => ({ value, label: adminEnumLabel(t, "roomStatus", value) }));
  const cleaningOptions = CLEANING_STATUSES.map((value) => ({ value, label: adminEnumLabel(t, "cleaningStatus", value) }));
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.rooms}</h1>
      <div className="mt-6">
        <AdminCard title={t.rooms}>
          <AdminListControls t={t} search={q} status={status} statusOptions={statusOptions} showDateFilters={false} />
          {error ? (
            <p className="rounded-lg bg-coralBase/10 p-4 text-sm font-semibold text-coralBase">{t.loadError}</p>
          ) : (
          <SimpleTable headers={[t.room, t.category, t.status, t.cleaning, t.action]} emptyLabel={t.noData} rows={(data || []).map((row) => [
            row.room_number,
            (row.room_categories as { name_en?: string } | null)?.name_en || "-",
            adminEnumLabel(t, "roomStatus", row.status),
            adminEnumLabel(t, "cleaningStatus", row.cleaning_status),
            canManage ? (
              <div key="actions" className="flex min-w-56 flex-wrap gap-2">
                <AdminSelectAction endpoint="/api/admin/rooms" id={row.id} field="status" options={statusOptions} placeholder={t.status} buttonLabel={t.save} />
                <AdminSelectAction endpoint="/api/admin/rooms" id={row.id} field="cleaningStatus" options={cleaningOptions} placeholder={t.cleaning} buttonLabel={t.save} />
              </div>
            ) : "-"
          ])} />
          )}
          <AdminPagination pathname="/admin/rooms" searchParams={params} page={page} total={count || 0} pageSize={adminPageSize} t={t} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
