import { MapPin, Navigation, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { contact } from "@/content/contact";
import { nearbyHighlights } from "@/content/siteContent";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LocationSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="location" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={t.sections.location} />
        <div className="grid gap-6 md:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-lg border border-charcoal/10 bg-white/78 p-6 shadow-soft">
            <MapPin className="text-coralBase" />
            <h3 className="mt-4 font-display text-3xl">{contact.address}</h3>
            <p className="mt-2 text-greenGray">{contact.district}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {nearbyHighlights.map((item) => <span key={item.en} className="rounded-full bg-softWhite px-3 py-2 text-sm text-greenGray">{item[locale]}</span>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={contact.googleMapsUrl} target="_blank"><MapPin size={17} /> {t.actions.map}</ButtonLink>
              <ButtonLink href={contact.directionsUrl} target="_blank" variant="secondary"><Navigation size={17} /> {t.actions.directions}</ButtonLink>
              <ButtonLink href={`tel:${contact.phone.replaceAll(" ", "")}`} variant="light"><Phone size={17} /> {t.actions.call}</ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-charcoal/10 bg-greenGray shadow-glow">
            <div className="absolute inset-0 ornament-bg opacity-30" />
            <div className="absolute inset-8 rounded-lg border border-white/20 bg-treeGreen/50 p-6 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-warmSand">{t.nav.location}</p>
              <p className="mt-8 font-display text-4xl">Tashkent</p>
              <p className="mt-3 max-w-sm text-white/72">{contact.address}</p>
              <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full border border-warmSand/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
