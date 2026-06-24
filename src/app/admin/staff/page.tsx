import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const { user, t, service } = await getAdminPageContext();
  const { data } = await service.from("staff_members").select("*").order("created_at", { ascending: false });
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.staff}</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        {user.role !== "receptionist" ? (
          <AdminCard title={t.create}>
            <AdminMutationForm
              endpoint="/api/admin/staff"
              submitLabel={t.create}
              savedLabel={t.saved}
              saveFailedLabel={t.saveFailed}
              loadingLabel={t.loading}
              fields={[
                { name: "fullName", label: t.fullName, required: true },
                { name: "email", label: t.email, type: "email" },
                { name: "phone", label: t.phone },
                { name: "role", label: t.role, options: ["manager", "receptionist"], required: true },
                { name: "status", label: t.status, options: ["active", "inactive"], required: true }
              ]}
            />
          </AdminCard>
        ) : null}
        <AdminCard title={t.staff}>
          <SimpleTable headers={[t.fullName, t.email, t.phone, t.role, t.status]} emptyLabel={t.noData} rows={(data || []).map((row) => [row.full_name, row.email || "-", row.phone || "-", row.role, row.status])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
