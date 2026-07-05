import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { tashkentToday, tashkentDayStart, formatTashkent } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, t, service } = await getAdminPageContext();
  const today = tashkentToday();
  const [
    bookingsToday,
    checkedInStaff,
    checkedInGuests,
    openServices,
    latestBookings,
    latestAttendance,
    rooms
  ] = await Promise.all([
    service.from("booking_requests").select("id", { count: "exact", head: true }).gte("created_at", tashkentDayStart(today)),
    service.from("attendance_records").select("id", { count: "exact", head: true }).eq("status", "open").is("check_out_at", null),
    service.from("stays").select("id", { count: "exact", head: true }).eq("status", "checked_in"),
    service.from("service_assignments").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    service.from("booking_requests").select("public_reference,full_name,status,created_at").order("created_at", { ascending: false }).limit(5),
    service.from("attendance_records").select("check_in_at,staff_members(full_name)").order("created_at", { ascending: false }).limit(5),
    service.from("rooms").select("status")
  ]);

  const roomCounts = (rooms.data || []).reduce<Record<string, number>>((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.dashboard}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminCard title={t.newBookingRequestsToday} value={bookingsToday.count || 0} />
        <AdminCard title={t.checkedInStaff} value={checkedInStaff.count || 0} />
        <AdminCard title={t.guestsCheckedIn} value={checkedInGuests.count || 0} />
        <AdminCard title={t.openServices} value={openServices.count || 0} />
        <AdminCard title={t.roomSnapshot}>{Object.entries(roomCounts).map(([status, count]) => <p key={status}>{status}: {count}</p>)}</AdminCard>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminCard title={t.latestBookings}>
          <SimpleTable
            headers={[t.reference, t.fullName, t.status]}
            emptyLabel={t.noData}
            rows={(latestBookings.data || []).map((booking) => [booking.public_reference, booking.full_name, booking.status])}
          />
        </AdminCard>
        <AdminCard title={t.latestAttendance}>
          <SimpleTable
            headers={[t.staff, t.checkIn]}
            emptyLabel={t.noData}
            rows={(latestAttendance.data || []).map((row) => [(row.staff_members as { full_name?: string } | null)?.full_name || "-", formatTashkent(row.check_in_at)])}
          />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
