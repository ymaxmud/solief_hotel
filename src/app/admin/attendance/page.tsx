import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { formatTashkent } from "@/lib/datetime";
import { adminEnumLabel } from "@/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const { user, t, service } = await getAdminPageContext(["admin", "manager"]);
  const [{ data }, { data: staff }, { data: attempts }] = await Promise.all([
    service.from("attendance_records").select("*, staff_members(full_name)").order("created_at", { ascending: false }).limit(100),
    service.from("staff_members").select("id,full_name,status").order("full_name"),
    service.from("attendance_attempts").select("*, staff_members(full_name)").order("created_at", { ascending: false }).limit(30)
  ]);
  const staffOptions = (staff || []).map((member) => ({ value: member.id, label: `${member.full_name} (${member.status})` }));
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.attendance}</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <AdminCard title={t.attendanceManualTitle}>
          <AdminMutationForm endpoint="/api/admin/attendance/manual" submitLabel={t.save} savedLabel={t.saved} saveFailedLabel={t.saveFailed} loadingLabel={t.loading} fields={[
            { name: "staffMemberId", label: t.staff, options: staffOptions, required: true },
            { name: "action", label: t.action, options: [{ value: "check_in", label: t.enumLabels.attendanceAction.check_in }, { value: "check_out", label: t.enumLabels.attendanceAction.check_out }], required: true },
            { name: "at", label: `${t.date} · Asia/Tashkent`, type: "datetime-local" },
            { name: "correctionReason", label: t.correctionReason, required: true }
          ]} />
        </AdminCard>
        <AdminCard title={t.attendanceHistory}>
          <SimpleTable headers={[t.staff, t.checkIn, t.checkOut, t.status, t.anomalies]} emptyLabel={t.noData} rows={(data || []).map((row) => [
            (row.staff_members as { full_name?: string } | null)?.full_name || row.staff_member_id,
            formatTashkent(row.check_in_at),
            formatTashkent(row.check_out_at),
            row.status,
            Array.isArray(row.anomaly_flags) && row.anomaly_flags.length ? row.anomaly_flags.join(", ") : "-"
          ])} />
        </AdminCard>
        <div className="xl:col-span-2">
          <AdminCard title={t.suspiciousAttempts}>
            <SimpleTable headers={[t.staff, t.action, t.status, t.reason, t.date]} emptyLabel={t.noData} rows={(attempts || []).map((row) => [
              (row.staff_members as { full_name?: string } | null)?.full_name || "-",
              row.purpose ? adminEnumLabel(t, "attendanceAction", row.purpose) : "-",
              row.success ? t.success : t.attendanceFailed,
              row.error_code || (Array.isArray(row.anomaly_flags) ? row.anomaly_flags.join(", ") : "-"),
              formatTashkent(row.created_at)
            ])} />
          </AdminCard>
        </div>
      </div>
    </AdminShell>
  );
}
