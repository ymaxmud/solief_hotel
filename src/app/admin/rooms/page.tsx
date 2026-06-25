import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const { user, t, service } = await getAdminPageContext();
  const { data } = await service.from("rooms").select("*, room_categories(name_en)").order("room_number");
  const canManage = user.role === "admin" || user.role === "manager";
  const statusOptions = ["available", "occupied", "cleaning", "maintenance", "out_of_service"].map((value) => ({ value, label: value }));
  const cleaningOptions = ["clean", "dirty", "in_progress", "inspected"].map((value) => ({ value, label: value }));
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.rooms}</h1>
      <div className="mt-6">
        <AdminCard title={t.rooms}>
          <SimpleTable headers={[t.room, t.category, t.status, t.cleaning, t.action]} emptyLabel={t.noData} rows={(data || []).map((row) => [
            row.room_number,
            (row.room_categories as { name_en?: string } | null)?.name_en || "-",
            row.status,
            row.cleaning_status,
            canManage ? (
              <div key="actions" className="flex min-w-56 flex-wrap gap-2">
                <AdminSelectAction endpoint="/api/admin/rooms" id={row.id} field="status" options={statusOptions} placeholder={t.status} buttonLabel={t.save} />
                <AdminSelectAction endpoint="/api/admin/rooms" id={row.id} field="cleaningStatus" options={cleaningOptions} placeholder={t.cleaning} buttonLabel={t.save} />
              </div>
            ) : "-"
          ])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
