import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { getAdminPageContext } from "@/lib/crm/adminPage";

export const dynamic = "force-dynamic";

const exports = [
  ["attendance", "Attendance CSV"],
  ["bookings", "Booking requests CSV"],
  ["services", "Service assignments CSV"],
  ["guests", "Guests CSV"],
  ["stays", "Stays CSV"]
];

export default async function ReportsPage() {
  const { user, t } = await getAdminPageContext(["admin", "manager"]);
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.reports}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exports.map(([type, label]) => (
          <AdminCard key={type} title={label}>
            <a href={`/api/admin/exports/${type}`} className="inline-flex rounded-full bg-coralBase px-5 py-3 text-sm font-bold text-white">
              {t.exportCsv}
            </a>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
