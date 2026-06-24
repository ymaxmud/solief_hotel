import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";

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
          <SimpleTable headers={[t.email, t.fullName, t.role, t.status]} emptyLabel={t.noData} rows={(data || []).map((row) => [row.email, row.full_name, row.role, row.is_active ? t.active : t.inactive])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
