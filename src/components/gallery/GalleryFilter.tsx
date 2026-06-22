"use client";

import type { ImageCategory } from "@/types";
import type { Dictionary } from "@/i18n/dictionary";

export type GalleryFilterValue = "all" | ImageCategory;

export function GalleryFilter({ t, active, onChange }: { t: Dictionary; active: GalleryFilterValue; onChange: (value: GalleryFilterValue) => void }) {
  const filters: GalleryFilterValue[] = ["all", "exterior", "rooms", "bathroom", "kitchen", "dining", "lobby", "amenities", "details"];
  return (
    <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`focus-ring whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
            active === filter ? "border-coralBase bg-coralBase text-white" : "border-charcoal/10 bg-white/70 text-greenGray hover:bg-white"
          }`}
        >
          {t.gallery[filter]}
        </button>
      ))}
    </div>
  );
}
