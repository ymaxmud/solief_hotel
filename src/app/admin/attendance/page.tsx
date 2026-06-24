import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminMutationForm } from "@/components/admin/AdminMutationForm";
import { SimpleTable } from "@/components/admin/SimpleTable";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const { user, t, service } = await getAdminPageContext(["admin", "manager"]);
  const { data } = await service.from("attendance_records").select("*, staff_members(full_name)").order("created_at", { ascending: false }).limit(100);
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.attendance}</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <AdminCard title={t.attendanceManualTitle}>
          <AdminMutationForm endpoint="/api/admin/attendance/manual" submitLabel={t.save} savedLabel={t.saved} saveFailedLabel={t.saveFailed} loadingLabel={t.loading} fields={[
            { name: "staffMemberId", label: t.staffUuid, required: true },
            { name: "action", label: t.action, options: ["check_in", "check_out"], required: true },
            { name: "correctionReason", label: t.correctionReason, required: true }
          ]} />
        </AdminCard>
        <AdminCard title={t.attendanceHistory}>
          <SimpleTable headers={[t.staff, t.checkIn, t.checkOut, t.status]} emptyLabel={t.noData} rows={(data || []).map((row) => [(row.staff_members as { full_name?: string } | null)?.full_name || row.staff_member_id, row.check_in_at || "-", row.check_out_at || "-", row.status])} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
