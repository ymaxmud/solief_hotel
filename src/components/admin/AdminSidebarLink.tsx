"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  // Exact match only: admin routes are flat list pages, and /admin/attendance is
  // a sibling of /admin/attendance/qr — a prefix match would light up both.
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-white/15 text-white" : "text-white/78 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}
