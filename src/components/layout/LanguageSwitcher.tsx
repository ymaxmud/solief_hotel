"use client";

import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

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
    <div className={cn("flex rounded-full border border-white/25 bg-white/15 backdrop-blur", compact ? "p-0.5" : "p-1")} aria-label="Language">
      {(["en", "ru", "uz"] as Locale[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
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
