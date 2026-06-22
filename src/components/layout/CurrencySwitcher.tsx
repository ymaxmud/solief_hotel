"use client";

import type { Currency } from "@/types";

export function CurrencySwitcher({ currency, onChange }: { currency: Currency; onChange: (currency: Currency) => void }) {
  return (
    <select
      value={currency}
      onChange={(event) => onChange(event.target.value as Currency)}
      className="focus-ring h-9 rounded-full border border-white/25 bg-white/15 px-3 text-xs font-bold text-white backdrop-blur [color-scheme:dark]"
      aria-label="Currency"
    >
      <option value="UZS">UZS</option>
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
    </select>
  );
}
