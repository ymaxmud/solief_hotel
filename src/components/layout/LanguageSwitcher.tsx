"use client";

import Link from "next/link";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";
import { LOCALES, localeHref } from "@/lib/i18n/routing";

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uz: "O‘zbekcha"
};

/**
 * Each language is its own URL, so switching language is navigation rather than
 * component state. That is what makes /ru and /uz indexable, and it means a
 * shared or bookmarked link keeps the language it was copied in.
 */
export function LanguageSwitcher({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  return (
    // role="group" so the aria-label is actually announced — a bare <div> with
    // an aria-label exposes nothing to assistive technology.
    <div
      role="group"
      aria-label="Language"
      className={cn("flex rounded-full border border-white/25 bg-white/15 backdrop-blur", compact ? "p-0.5" : "p-1")}
    >
      {LOCALES.map((item) => {
        const active = locale === item;
        return (
          <Link
            key={item}
            href={localeHref(item)}
            // hreflang tells crawlers (and Safari) what each link leads to, and
            // aria-current marks the active language for assistive technology —
            // the uppercase code and colour alone did not convey either.
            hrefLang={item}
            aria-current={active ? "page" : undefined}
            // The visible label is uppercased by CSS only, so the accessible
            // name carries the real language name.
            aria-label={LANGUAGE_NAMES[item]}
            className={cn(
              "focus-ring rounded-full font-bold uppercase transition",
              compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-xs",
              active ? "bg-white text-navy" : "text-white hover:bg-white/15"
            )}
          >
            {item}
          </Link>
        );
      })}
    </div>
  );
}
