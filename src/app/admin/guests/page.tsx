import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const { user, t, service } = await getAdminPageContext();
  const { data } = await service.from("guests").select("*, stays(id,status)").order("created_at", { ascending: false });
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
          <SimpleTable headers={[t.fullName, t.phone, t.email, t.status]} emptyLabel={t.noData} rows={(data || []).map((row) => [row.full_name, row.phone || "-", row.email || "-", ((row.stays || []) as Array<{ status: string }>).map((stay) => stay.status).join(", ") || t.lead])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
