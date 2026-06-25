import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";
import { AdminPatchForm } from "@/components/admin/AdminPatchForm";

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
          <SimpleTable headers={[t.fullName, t.email, t.phone, t.role, t.status, t.action]} emptyLabel={t.noData} rows={(data || []).map((row) => [
            row.full_name,
            row.email || "-",
            row.phone || "-",
            row.role,
            row.status,
            user.role !== "receptionist" ? (
              <div key="actions" className="flex min-w-64 flex-wrap gap-2">
                <AdminSelectAction endpoint="/api/admin/staff" id={row.id} field="status" options={["active", "inactive"].map((value) => ({ value, label: value }))} placeholder={t.status} buttonLabel={t.save} />
                <AdminSelectAction endpoint="/api/admin/staff" id={row.id} field="role" options={["manager", "receptionist"].map((value) => ({ value, label: value }))} placeholder={t.role} buttonLabel={t.save} />
                <AdminPatchForm endpoint="/api/admin/staff" id={row.id} submitLabel={t.setPin} savedLabel={t.saved} saveFailedLabel={t.saveFailed} loadingLabel={t.loading} fields={[{ name: "attendancePin", label: t.attendancePin, type: "password", required: true }]} />
              </div>
            ) : "-"
          ])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
