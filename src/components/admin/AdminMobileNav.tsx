"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminMobileNav({ links, menuLabel }: { links: Array<{ href: string; label: string }>; menuLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change, lock body scroll while open, and close on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-charcoal/10 bg-white"
        aria-expanded={open}
        aria-label={menuLabel}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label={menuLabel}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-treeGreen/40 backdrop-blur-sm"
          />
          <div className="absolute left-3 right-3 top-16 z-40 max-h-[75vh] overflow-y-auto rounded-xl border border-charcoal/10 bg-white p-3 shadow-2xl">
            <nav className="grid gap-1">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-sm font-bold ${active ? "bg-greenGray text-white" : "text-charcoal hover:bg-charcoal/5"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
