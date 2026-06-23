import { ExternalLink, MapPin, Navigation, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { contact } from "@/content/contact";
import { nearbyHighlights } from "@/content/siteContent";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LocationReviewsCarousel } from "./LocationReviewsCarousel";

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
            <p className="mt-4 max-w-xl text-sm leading-6 text-greenGray/78">{t.location.mapNote}</p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-coralBase">{t.location.nearbyTitle}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {nearbyHighlights.map((item) => <span key={item.en} className="rounded-full bg-softWhite px-3 py-2 text-sm text-greenGray">{item[locale]}</span>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={contact.googleMapsUrl} target="_blank"><MapPin size={17} /> {t.actions.map}</ButtonLink>
              <ButtonLink href={contact.directionsUrl} target="_blank" variant="secondary"><Navigation size={17} /> {t.actions.directions}</ButtonLink>
              <ButtonLink href={contact.googleMapsProfileUrl || contact.googleMapsUrl} target="_blank" variant="light"><ExternalLink size={17} /> {t.actions.googleProfile}</ButtonLink>
              <ButtonLink href={`tel:${contact.phone.replaceAll(" ", "")}`} variant="light"><Phone size={17} /> {t.actions.call}</ButtonLink>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-charcoal/10 bg-greenGray shadow-glow">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-treeGreen px-5 py-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-warmSand">{t.nav.location}</p>
                <h3 className="mt-1 font-display text-2xl">{t.location.mapTitle}</h3>
              </div>
              <a href={contact.googleMapsProfileUrl || contact.googleMapsUrl} target="_blank" className="focus-ring rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label={t.actions.googleProfile}>
                <ExternalLink size={18} />
              </a>
            </div>
            <div className="relative min-h-[420px] bg-softWhite">
              <iframe
                title={t.location.mapTitle}
                src={contact.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
        <LocationReviewsCarousel t={t} locale={locale} />
      </div>
    </section>
  );
}
