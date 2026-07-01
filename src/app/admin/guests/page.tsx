import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminListControls, AdminPagination } from "@/components/admin/AdminListControls";
import { adminPageSize, getPage, getParam, getRange, searchTerm } from "@/lib/crm/pagination";

export const dynamic = "force-dynamic";

export default async function GuestsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t, service } = await getAdminPageContext();
  const params = await searchParams;
  const page = getPage(params);
  const { from: rangeFrom, to: rangeTo } = getRange(page);
  const q = getParam(params, "q");
  const from = getParam(params, "from");
  const to = getParam(params, "to");
  let query = service.from("guests").select("*, stays(id,status)", { count: "exact" }).order("created_at", { ascending: false }).range(rangeFrom, rangeTo);
  if (q) {
    const term = searchTerm(q);
    query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (from) query = query.gte("created_at", `${from}T00:00:00.000Z`);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);
  const { data, count } = await query;
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.guests}</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <AdminCard title={t.create}>
          <AdminMutationForm endpoint="/api/admin/guests" submitLabel={t.create} savedLabel={t.saved} saveFailedLabel={t.saveFailed} loadingLabel={t.loading} fields={[
            { name: "fullName", label: t.fullName, required: true },
            { name: "phone", label: t.phone },
            { name: "email", label: t.email, type: "email" },
            { name: "preferredLanguage", label: t.language, options: ["EN", "RU", "UZ"] }
          ]} />
        </AdminCard>
        <AdminCard title={t.guests}>
          <AdminListControls t={t} search={q} from={from} to={to} />
          <SimpleTable headers={[t.fullName, t.phone, t.email, t.status]} emptyLabel={t.noData} rows={(data || []).map((row) => [row.full_name, row.phone || "-", row.email || "-", ((row.stays || []) as Array<{ status: string }>).map((stay) => stay.status).join(", ") || t.lead])} />
          <AdminPagination pathname="/admin/guests" searchParams={params} page={page} total={count || 0} pageSize={adminPageSize} t={t} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
