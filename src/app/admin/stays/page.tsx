import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

export default async function StaysPage() {
  const { user, t, service } = await getAdminPageContext();
  const { data } = await service.from("stays").select("*, guests(full_name), rooms(room_number)").order("created_at", { ascending: false });
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.stays}</h1>
      <div className="mt-6">
        <AdminCard title={t.stays}>
          <SimpleTable headers={[t.fullName, t.room, t.status, t.expected]} emptyLabel={t.noData} rows={(data || []).map((row) => [(row.guests as { full_name?: string } | null)?.full_name || "-", (row.rooms as { room_number?: string } | null)?.room_number || "-", row.status, `${row.expected_check_in || "-"} → ${row.expected_check_out || "-"}`])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
