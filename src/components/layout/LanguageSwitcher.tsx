"use client";

import type { Locale } from "@/types";

export function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className="flex rounded-full border border-white/25 bg-white/15 p-1 backdrop-blur" aria-label="Language">
      {(["en", "ru", "uz"] as Locale[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`focus-ring rounded-full px-3 py-1 text-xs font-bold uppercase transition ${
            locale === item ? "bg-white text-charcoal" : "text-white hover:bg-white/15"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
