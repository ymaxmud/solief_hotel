"use client";

import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uz: "O‘zbekcha"
};

export function LanguageSwitcher({
  locale,
  onChange,
  compact = false
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  compact?: boolean;
}) {
  return (
    // role="group" so the aria-label is actually announced — a bare <div> with
    // an aria-label exposes nothing to assistive technology.
    <div
      role="group"
      aria-label="Language"
      className={cn("flex rounded-full border border-white/25 bg-white/15 backdrop-blur", compact ? "p-0.5" : "p-1")}
    >
      {(["en", "ru", "uz"] as Locale[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          // The visible label is uppercased by CSS only, so the accessible name
          // carries the real language name, and aria-pressed conveys which one
          // is active — colour alone did not.
          aria-pressed={locale === item}
          aria-label={LANGUAGE_NAMES[item]}
          className={cn(
            "focus-ring rounded-full font-bold uppercase transition",
            compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-xs",
            locale === item ? "bg-white text-navy" : "text-white hover:bg-white/15"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
