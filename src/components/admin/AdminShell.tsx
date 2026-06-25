import Link from "next/link";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import type { Locale } from "@/types";
import type { AppUser } from "@/types/crm";
import { getAdminDictionary } from "@/i18n/admin";
import { AdminLanguageSwitcher } from "./AdminLanguageSwitcher";
import { LogoutButton } from "./LogoutButton";
import { AdminMobileNav } from "./AdminMobileNav";

const links = [
  ["dashboard", "/admin/dashboard"],
  ["bookingRequests", "/admin/booking-requests"],
  ["guests", "/admin/guests"],
  ["stays", "/admin/stays"],
  ["services", "/admin/services"],
  ["rooms", "/admin/rooms"],
  ["staff", "/admin/staff"],
  ["attendance", "/admin/attendance"],
  ["attendanceQr", "/admin/attendance/qr"],
  ["users", "/admin/users"],
  ["reports", "/admin/reports"],
  ["auditLog", "/admin/audit-log"]
] as const;

export async function AdminShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const cookieStore = await cookies();
  const locale = ((cookieStore.get("solief-admin-locale")?.value || "en") as Locale);
  const t = getAdminDictionary(locale);
  const visibleLinks = links.filter(([key]) => {
    if (["users", "auditLog"].includes(key)) return user.role === "admin";
    if (key === "attendanceQr") return user.role === "admin" || user.role === "manager";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-charcoal">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-charcoal/10 bg-treeGreen p-5 text-white lg:block">
        <Link href="/admin/dashboard" className="font-display text-3xl">Solief CRM</Link>
        <p className="mt-2 text-sm text-white/65">{t.protected}</p>
        <nav className="mt-8 grid gap-1">
          {visibleLinks.map(([key, href]) => (
            <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-semibold text-white/78 hover:bg-white/10 hover:text-white">
              {t[key]}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-charcoal/10 bg-white/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <AdminMobileNav links={visibleLinks.map(([key, href]) => ({ href, label: t[key] }))} menuLabel={t.menu} />
            <div>
            <p className="font-bold">{user.full_name}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-greenGray">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AdminLanguageSwitcher locale={locale} />
            <LogoutButton label={t.logout} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
