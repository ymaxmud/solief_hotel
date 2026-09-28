import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";
import { AdminListControls, AdminPagination } from "@/components/admin/AdminListControls";
import { adminPageSize, getPage, getParam, getRange, searchTerm } from "@/lib/crm/pagination";
import { adminEnumLabel } from "@/i18n/admin";

const ROLE_OPTIONS = ["admin", "manager", "receptionist"];

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t, service } = await getAdminPageContext(["admin"]);
  const params = await searchParams;
  const page = getPage(params);
  const { from: rangeFrom, to: rangeTo } = getRange(page);
  const q = getParam(params, "q");
  const status = getParam(params, "status");
  let query = service.from("app_users").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(rangeFrom, rangeTo);
  if (q) {
    const term = searchTerm(q);
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (status === "active") query = query.eq("is_active", true);
  if (status === "inactive") query = query.eq("is_active", false);
  const { data, count, error } = await query;
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.users}</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <AdminCard title={t.create}>
          <AdminMutationForm
            endpoint="/api/admin/users"
            submitLabel={t.create}
            savedLabel={t.saved}
            saveFailedLabel={t.saveFailed}
            loadingLabel={t.loading}
            fields={[
              { name: "email", label: t.email, type: "email", required: true },
              { name: "fullName", label: t.fullName, required: true },
              { name: "role", label: t.role, options: ["admin", "manager", "receptionist"], required: true },
              { name: "password", label: t.temporaryPassword, type: "password", required: true }
            ]}
          />
        </AdminCard>
        <AdminCard title={t.users}>
          <AdminListControls t={t} search={q} status={status} statusOptions={["active", "inactive"]} showDateFilters={false} />
          {error ? (
            <p className="rounded-lg bg-coralBase/10 p-4 text-sm font-semibold text-coralBase">{t.loadError}</p>
          ) : (
          <SimpleTable headers={[t.email, t.fullName, t.role, t.status, t.action]} emptyLabel={t.noData} rows={(data || []).map((row) => [
            row.email,
            row.full_name,
            adminEnumLabel(t, "role", row.role),
            row.is_active ? t.active : t.inactive,
            <div key="actions" className="flex min-w-56 flex-wrap gap-2">
              <AdminSelectAction endpoint="/api/admin/users" id={row.id} field="role" options={ROLE_OPTIONS.map((value) => ({ value, label: adminEnumLabel(t, "role", value) }))} placeholder={t.role} buttonLabel={t.save} confirm={t.confirmDangerousAction} />
              {row.is_active ? (
                <AdminActionButton endpoint="/api/admin/users" body={{ id: row.id, isActive: false }} label={t.deactivate} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
              ) : (
                <AdminActionButton endpoint="/api/admin/users" body={{ id: row.id, isActive: true }} label={t.reactivate} />
              )}
              <AdminActionButton endpoint="/api/admin/users" body={{ id: row.id, resetPassword: true, forcePasswordChange: true }} label={t.resetPassword} confirm={t.confirmDangerousAction} resultField="tempPassword" resultLabel={t.tempPasswordShare} />
            </div>
          ])} />
          )}
          <AdminPagination pathname="/admin/users" searchParams={params} page={page} total={count || 0} pageSize={adminPageSize} t={t} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
