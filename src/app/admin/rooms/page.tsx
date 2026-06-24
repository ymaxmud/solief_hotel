import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const { user, t, service } = await getAdminPageContext();
  const { data } = await service.from("rooms").select("*, room_categories(name_en)").order("room_number");
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.rooms}</h1>
      <div className="mt-6">
        <AdminCard title={t.rooms}>
          <SimpleTable headers={[t.room, t.category, t.status, t.cleaning]} emptyLabel={t.noData} rows={(data || []).map((row) => [row.room_number, (row.room_categories as { name_en?: string } | null)?.name_en || "-", row.status, row.cleaning_status])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
