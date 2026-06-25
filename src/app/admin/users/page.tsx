import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { user, t, service } = await getAdminPageContext(["admin"]);
  const { data } = await service.from("app_users").select("*").order("created_at", { ascending: false });
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
          <SimpleTable headers={[t.email, t.fullName, t.role, t.status, t.action]} emptyLabel={t.noData} rows={(data || []).map((row) => [
            row.email,
            row.full_name,
            row.role,
            row.is_active ? t.active : t.inactive,
            <div key="actions" className="flex min-w-56 flex-wrap gap-2">
              <AdminSelectAction endpoint="/api/admin/users" id={row.id} field="role" options={["admin", "manager", "receptionist"].map((value) => ({ value, label: value }))} placeholder={t.role} buttonLabel={t.save} />
              {row.is_active ? (
                <AdminActionButton endpoint="/api/admin/users" body={{ id: row.id, isActive: false }} label={t.deactivate} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
              ) : (
                <AdminActionButton endpoint="/api/admin/users" body={{ id: row.id, isActive: true }} label={t.reactivate} />
              )}
              <AdminActionButton endpoint="/api/admin/users" body={{ id: row.id, resetPassword: true, forcePasswordChange: true }} label={t.resetPassword} confirm={t.confirmDangerousAction} />
            </div>
          ])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
