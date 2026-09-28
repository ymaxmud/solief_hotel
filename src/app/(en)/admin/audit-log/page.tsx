import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { formatTashkent } from "@/lib/datetime";
import { AdminPagination } from "@/components/admin/AdminListControls";
import { adminPageSize, getPage, getRange } from "@/lib/crm/pagination";

export const dynamic = "force-dynamic";

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t, service } = await getAdminPageContext(["admin"]);
  const params = await searchParams;
  const page = getPage(params);
  const { from, to } = getRange(page);
  const { data, count, error } = await service
    .from("audit_logs")
    .select("*, app_users(email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.auditLog}</h1>
      <div className="mt-6">
        <AdminCard title={t.auditLog}>
          {error ? (
            <p className="rounded-lg bg-coralBase/10 p-4 text-sm font-semibold text-coralBase">{t.loadError}</p>
          ) : (
            <SimpleTable
              headers={[t.actor, t.action, t.entity, t.date]}
              emptyLabel={t.noData}
              rows={(data || []).map((row) => [
                (row.app_users as { email?: string } | null)?.email || row.actor_user_id || "server",
                row.action,
                <span key="entity">
                  {row.entity_type}
                  {row.entity_id ? <><br /><span className="text-xs text-greenGray">{String(row.entity_id).slice(0, 8)}</span></> : null}
                </span>,
                formatTashkent(row.created_at)
              ])}
            />
          )}
          <AdminPagination pathname="/admin/audit-log" searchParams={params} page={page} total={count || 0} pageSize={adminPageSize} t={t} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
