import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { QrGenerator } from "@/components/admin/QrGenerator";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

export default async function AttendanceQrPage() {
  const { user, t } = await getAdminPageContext(["admin", "manager"]);
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.attendanceQr}</h1>
      <div className="mt-6 max-w-xl">
        <AdminCard title={t.attendanceQr}>
          <QrGenerator generateLabel={t.generateQr} errorLabel={t.couldNotGenerateQr} qrAlt={t.qrAttendanceAlt} expiresLabel={t.expires} />
        </AdminCard>
      </div>
    </AdminShell>
  );
}
