import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";
import { AdminPatchForm } from "@/components/admin/AdminPatchForm";
import { AdminListControls, AdminPagination } from "@/components/admin/AdminListControls";
import { adminPageSize, getPage, getParam, getRange, searchTerm } from "@/lib/crm/pagination";

export const dynamic = "force-dynamic";

export default async function StaffPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t, service } = await getAdminPageContext();
  const params = await searchParams;
  const page = getPage(params);
  const { from: rangeFrom, to: rangeTo } = getRange(page);
  const q = getParam(params, "q");
  const status = getParam(params, "status");
  let query = service
    .from("staff_members")
    .select("id,full_name,email,phone,role,status,attendance_pin_set_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo);
  if (q) {
    const term = searchTerm(q);
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
  }
  if (status) query = query.eq("status", status);
  const { data, count } = await query;
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
          <AdminListControls t={t} search={q} status={status} statusOptions={["active", "inactive"]} showDateFilters={false} />
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
          <AdminPagination pathname="/admin/staff" searchParams={params} page={page} total={count || 0} pageSize={adminPageSize} t={t} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
