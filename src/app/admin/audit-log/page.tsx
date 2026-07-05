import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { formatTashkent } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const { user, t, service } = await getAdminPageContext(["admin"]);
  const { data } = await service.from("audit_logs").select("*, app_users(email)").order("created_at", { ascending: false }).limit(200);
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.auditLog}</h1>
      <div className="mt-6">
        <AdminCard title={t.auditLog}>
          <SimpleTable
            headers={[t.actor, t.action, t.entity, t.date]}
            emptyLabel={t.noData}
            rows={(data || []).map((row) => [(row.app_users as { email?: string } | null)?.email || row.actor_user_id || "server", row.action, row.entity_type, formatTashkent(row.created_at)])}
          />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
