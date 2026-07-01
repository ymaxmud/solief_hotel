import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSelectAction } from "@/components/admin/AdminSelectAction";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { AdminListControls, AdminPagination } from "@/components/admin/AdminListControls";
import { adminPageSize, getPage, getParam, getRange, searchTerm } from "@/lib/crm/pagination";

export const dynamic = "force-dynamic";

export default async function StaysPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t, service } = await getAdminPageContext();
  const params = await searchParams;
  const page = getPage(params);
  const { from: rangeFrom, to: rangeTo } = getRange(page);
  const q = getParam(params, "q");
  const status = getParam(params, "status");
  const from = getParam(params, "from");
  const to = getParam(params, "to");
  let staysQuery = service.from("stays").select("*, guests(full_name), rooms(room_number)", { count: "exact" }).order("created_at", { ascending: false }).range(rangeFrom, rangeTo);
  if (status) staysQuery = staysQuery.eq("status", status);
  if (q) staysQuery = staysQuery.or(`notes.ilike.%${searchTerm(q)}%`);
  if (from) staysQuery = staysQuery.gte("created_at", `${from}T00:00:00.000Z`);
  if (to) staysQuery = staysQuery.lte("created_at", `${to}T23:59:59.999Z`);
  const [{ data, count }, { data: guests }, { data: rooms }] = await Promise.all([
    staysQuery,
    service.from("guests").select("id,full_name").order("created_at", { ascending: false }).limit(100),
    service.from("rooms").select("id,room_number,status").eq("is_active", true).order("room_number")
  ]);
  const canManage = user.role === "admin" || user.role === "manager";
  const guestOptions = (guests || []).map((guest) => ({ value: guest.id, label: guest.full_name }));
  const roomOptions = (rooms || []).map((room) => ({ value: room.id, label: `${room.room_number} (${room.status})` }));
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.stays}</h1>
      <div className="mt-6 grid gap-6">
        {canManage ? (
          <AdminCard title={t.create}>
            <AdminMutationForm endpoint="/api/admin/stays" submitLabel={t.create} savedLabel={t.saved} saveFailedLabel={t.saveFailed} loadingLabel={t.loading} fields={[
              { name: "guestId", label: t.fullName, options: guestOptions, required: true },
              { name: "roomId", label: t.room, options: roomOptions },
              { name: "status", label: t.status, options: ["expected", "checked_in"], required: true },
              { name: "expectedCheckIn", label: t.checkIn, type: "date" },
              { name: "expectedCheckOut", label: t.checkOut, type: "date" }
            ]} />
          </AdminCard>
        ) : null}
        <AdminCard title={t.stays}>
          <AdminListControls t={t} search={q} status={status} from={from} to={to} statusOptions={["lead", "expected", "checked_in", "checked_out", "cancelled"]} />
          <SimpleTable headers={[t.fullName, t.room, t.status, t.expected, t.action]} emptyLabel={t.noData} rows={(data || []).map((row) => [
            (row.guests as { full_name?: string } | null)?.full_name || "-",
            (row.rooms as { room_number?: string } | null)?.room_number || "-",
            row.status,
            `${row.expected_check_in || "-"} → ${row.expected_check_out || "-"}`,
            canManage ? (
              <div key="actions" className="flex min-w-56 flex-wrap gap-2">
                <AdminActionButton endpoint="/api/admin/stays" body={{ id: row.id, status: "checked_in" }} label={t.checkIn} />
                <AdminActionButton endpoint="/api/admin/stays" body={{ id: row.id, status: "checked_out" }} label={t.checkOut} />
                <AdminActionButton endpoint="/api/admin/stays" body={{ id: row.id, status: "cancelled" }} label={t.cancel} confirm={t.confirmDangerousAction} className="rounded-full bg-charcoal px-3 py-2 text-xs font-bold text-white disabled:opacity-60" />
                <AdminSelectAction endpoint="/api/admin/stays" id={row.id} field="roomId" options={roomOptions} placeholder={t.room} buttonLabel={t.save} />
              </div>
            ) : "-"
          ])} />
          <AdminPagination pathname="/admin/stays" searchParams={params} page={page} total={count || 0} pageSize={adminPageSize} t={t} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
