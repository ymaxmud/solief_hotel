"use client";

import type { Locale } from "@/types";

export function AdminLanguageSwitcher({ locale }: { locale: Locale }) {
  function setLocale(next: Locale) {
    localStorage.setItem("solief-admin-locale", next);
    document.cookie = `solief-admin-locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <div className="flex rounded-full border border-charcoal/10 bg-white p-1">
      {(["en", "ru", "uz"] as Locale[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${locale === item ? "bg-treeGreen text-white" : "text-greenGray"}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
