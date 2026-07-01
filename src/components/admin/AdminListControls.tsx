import Link from "next/link";
import type { AdminDictionary } from "@/i18n/admin";
import { buildPageHref } from "@/lib/crm/pagination";

export function AdminListControls({
  t,
  search,
  status,
  statusOptions = [],
  from,
  to,
  showDateFilters = true
}: {
  t: AdminDictionary;
  search?: string;
  status?: string;
  statusOptions?: string[];
  from?: string;
  to?: string;
  showDateFilters?: boolean;
}) {
  return (
    <form className="mb-4 grid gap-3 rounded-lg border border-charcoal/10 bg-white/80 p-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
      <label className="grid gap-1 text-xs font-bold text-greenGray">
        {t.search}
        <input name="q" defaultValue={search} className="focus-ring min-h-10 rounded-lg border border-charcoal/15 bg-white px-3 text-sm" />
      </label>
      {statusOptions.length ? (
        <label className="grid gap-1 text-xs font-bold text-greenGray">
          {t.status}
          <select name="status" defaultValue={status} className="focus-ring min-h-10 rounded-lg border border-charcoal/15 bg-white px-3 text-sm">
            <option value="">{t.all}</option>
            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      ) : null}
      {showDateFilters ? (
        <>
          <label className="grid gap-1 text-xs font-bold text-greenGray">
            {t.from}
            <input name="from" defaultValue={from} type="date" className="focus-ring min-h-10 rounded-lg border border-charcoal/15 bg-white px-3 text-sm" />
          </label>
          <label className="grid gap-1 text-xs font-bold text-greenGray">
            {t.to}
            <input name="to" defaultValue={to} type="date" className="focus-ring min-h-10 rounded-lg border border-charcoal/15 bg-white px-3 text-sm" />
          </label>
        </>
      ) : null}
      <div className="flex items-end gap-2">
        <button className="min-h-10 rounded-full bg-greenGray px-4 text-sm font-bold text-white">{t.applyFilters}</button>
        <Link href="?" className="inline-flex min-h-10 items-center rounded-full border border-charcoal/15 px-4 text-sm font-bold text-greenGray">{t.clear}</Link>
      </div>
    </form>
  );
}

export function AdminPagination({
  pathname,
  searchParams,
  page,
  total,
  pageSize,
  t
}: {
  pathname: string;
  searchParams: Record<string, string | string[] | undefined>;
  page: number;
  total: number;
  pageSize: number;
  t: AdminDictionary;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-greenGray">
      <p>{t.page} {page} / {pages} · {total} {t.records}</p>
      <div className="flex gap-2">
        {page > 1 ? <Link className="rounded-full border border-charcoal/15 px-4 py-2 font-bold" href={buildPageHref(pathname, searchParams, page - 1)}>{t.previous}</Link> : null}
        {page < pages ? <Link className="rounded-full border border-charcoal/15 px-4 py-2 font-bold" href={buildPageHref(pathname, searchParams, page + 1)}>{t.next}</Link> : null}
      </div>
    </div>
  );
}
