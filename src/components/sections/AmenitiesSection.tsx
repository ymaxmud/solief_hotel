import * as Icons from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { amenities } from "@/content/amenities";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AmenitiesSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="amenities" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={t.sections.amenities} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((amenity) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[amenity.icon] || Icons.Circle;
            return (
              <article key={amenity.id} className="rounded-2xl border border-line bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist text-oxford">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl text-ink">{amenity.title[locale]}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{amenity.description[locale]}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
