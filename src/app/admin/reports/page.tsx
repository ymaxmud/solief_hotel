import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { getParam } from "@/lib/crm/pagination";

export const dynamic = "force-dynamic";

const exports = [
  ["attendance", "Attendance CSV"],
  ["bookings", "Booking requests CSV"],
  ["services", "Service assignments CSV"],
  ["guests", "Guests CSV"],
  ["stays", "Stays CSV"]
];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, t } = await getAdminPageContext(["admin", "manager"]);
  const params = await searchParams;
  const from = getParam(params, "from");
  const to = getParam(params, "to");
  const status = getParam(params, "status");
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  if (status) query.set("status", status);
  const queryString = query.toString();
  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.reports}</h1>
      <form className="mt-6 grid gap-3 rounded-lg border border-charcoal/10 bg-white/80 p-4 md:grid-cols-[auto_auto_auto_auto_auto]">
        <p className="self-end text-sm font-bold text-greenGray">{t.exportFilters}</p>
        <label className="grid gap-1 text-xs font-bold text-greenGray">
          {t.from}
          <input name="from" defaultValue={from} type="date" className="focus-ring min-h-10 rounded-lg border border-charcoal/15 bg-white px-3 text-sm" />
        </label>
        <label className="grid gap-1 text-xs font-bold text-greenGray">
          {t.to}
          <input name="to" defaultValue={to} type="date" className="focus-ring min-h-10 rounded-lg border border-charcoal/15 bg-white px-3 text-sm" />
        </label>
        <label className="grid gap-1 text-xs font-bold text-greenGray">
          {t.status}
          <select name="status" defaultValue={status} className="focus-ring min-h-10 rounded-lg border border-charcoal/15 bg-white px-3 text-sm">
            <option value="">{t.all}</option>
            {["new", "contacted", "confirmed", "rejected", "cancelled", "open", "in_progress", "done", "checked_in", "checked_out"].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="min-h-10 rounded-full bg-greenGray px-4 text-sm font-bold text-white">{t.applyFilters}</button>
          <a href="/admin/reports" className="inline-flex min-h-10 items-center rounded-full border border-charcoal/15 px-4 text-sm font-bold text-greenGray">{t.clear}</a>
        </div>
      </form>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exports.map(([type, label]) => (
          <AdminCard key={type} title={label}>
            <a href={`/api/admin/exports/${type}${queryString ? `?${queryString}` : ""}`} className="inline-flex rounded-full bg-coralBase px-5 py-3 text-sm font-bold text-white">
              {t.exportCsv}
            </a>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
