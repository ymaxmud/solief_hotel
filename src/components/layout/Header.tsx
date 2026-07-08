"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import type { Currency, Locale } from "@/types";
import type { Dictionary } from "@/i18n/dictionary";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

const links = ["rooms", "gallery", "amenities", "location", "reviews", "faq", "contact"] as const;

export function Header({
  t,
  locale,
  setLocale,
  currency,
  setCurrency,
  onBook
}: {
  t: Dictionary;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  onBook: () => void;
}) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition", solid ? "bg-navy/95 shadow-soft backdrop-blur-xl" : "bg-navy/85 backdrop-blur-md")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <a href="#top" className="focus-ring" aria-label="Solief Hotel — home">
          <Wordmark tone="light" className="text-xl sm:text-2xl" />
        </a>
        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((link) => (
            <a key={link} href={`#${link}`} className="focus-ring text-sm font-medium text-white/80 transition hover:text-white">
              {t.nav[link]}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher locale={locale} onChange={setLocale} />
          <CurrencySwitcher currency={currency} onChange={setCurrency} />
          <Button onClick={onBook} variant="light" className="px-4">
            <CalendarCheck size={17} /> {t.nav.book}
          </Button>
        </div>
        <MobileNav t={t} onBook={onBook} />
      </div>
    </header>
  );
}
