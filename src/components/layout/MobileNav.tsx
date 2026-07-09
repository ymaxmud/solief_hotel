"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Currency, Locale } from "@/types";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";

const links = ["rooms", "gallery", "amenities", "location", "reviews", "faq", "contact"] as const;

export function MobileNav({
  t,
  onBook,
  locale,
  setLocale,
  currency,
  setCurrency
}: {
  t: Dictionary;
  onBook: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button className="focus-ring rounded-full bg-white/15 p-2 text-white backdrop-blur" onClick={() => setOpen(true)} aria-label={t.nav.openMenu}>
        <Menu size={22} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[1000] h-dvh overflow-y-auto bg-navy text-white" role="dialog" aria-modal="true" aria-label={t.nav.mobileMenu}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,68,92,0.35),transparent_38%),linear-gradient(180deg,rgba(13,27,42,0.98),rgba(19,35,58,1))]" />
          <div className="relative min-h-dvh px-5 pb-28 pt-5">
            <div className="flex items-center justify-between">
              <Wordmark tone="light" className="text-2xl" />
              <button className="focus-ring rounded-full bg-white/12 p-3 text-white shadow-soft backdrop-blur" onClick={() => setOpen(false)} aria-label={t.nav.closeMenu}>
                <X size={24} />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-white/12 bg-white/[0.04] p-3">
              <LanguageSwitcher locale={locale} onChange={setLocale} />
              <CurrencySwitcher currency={currency} onChange={setCurrency} />
            </div>

            <nav className="mt-6 grid gap-2" aria-label={t.nav.mobileMenu}>
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link}`}
                  onClick={() => setOpen(false)}
                  className="focus-ring rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3.5 text-lg font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.1]"
                >
                  {t.nav[link]}
                </a>
              ))}
            </nav>

            <div className="mt-6 grid gap-3">
              <Button
                variant="light"
                className="w-full justify-center py-4 text-base"
                onClick={() => {
                  setOpen(false);
                  onBook();
                }}
              >
                {t.nav.book}
              </Button>
              <a
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="focus-ring block rounded-xl border border-white/12 bg-white/[0.04] p-3 text-center text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                {t.footer.staffPortal}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
