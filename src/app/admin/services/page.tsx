import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const { user, t, service } = await getAdminPageContext();
  const { data } = await service.from("service_assignments").select("*, guests(full_name), staff_members(full_name)").order("created_at", { ascending: false });
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.services}</h1>
      <div className="mt-6">
        <AdminCard title={t.exactGuestServed}>
          <SimpleTable headers={[t.exactGuestServed, t.staff, t.serviceType, t.status]} emptyLabel={t.noData} rows={(data || []).map((row) => [(row.guests as { full_name?: string } | null)?.full_name || "-", (row.staff_members as { full_name?: string } | null)?.full_name || "-", row.service_type, row.status])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
