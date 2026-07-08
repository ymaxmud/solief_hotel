import { ExternalLink, MapPin, Navigation, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { contact } from "@/content/contact";
import { nearbyHighlights } from "@/content/siteContent";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LocationSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="location" className="bg-canvas px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={t.sections.location} />
        <div className="grid gap-6 md:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <MapPin className="text-champagne" />
            <h3 className="mt-4 font-display text-3xl text-ink">{contact.address}</h3>
            <p className="mt-2 text-slate">{contact.district}</p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{t.location.mapNote}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-champagne">{t.location.nearbyTitle}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {nearbyHighlights.map((item) => <span key={item.en} className="rounded-full bg-mist px-3 py-2 text-sm text-slate">{item[locale]}</span>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={contact.googleMapsUrl} target="_blank"><MapPin size={17} /> {t.actions.map}</ButtonLink>
              <ButtonLink href={contact.directionsUrl} target="_blank" variant="secondary"><Navigation size={17} /> {t.actions.directions}</ButtonLink>
              <ButtonLink href={contact.googleMapsProfileUrl || contact.googleMapsUrl} target="_blank" variant="light"><ExternalLink size={17} /> {t.actions.googleProfile}</ButtonLink>
              <ButtonLink href={`tel:${contact.phone.replaceAll(" ", "")}`} variant="light"><Phone size={17} /> {t.actions.call}</ButtonLink>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-slate shadow-glow">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-navy px-5 py-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-champagne">{t.nav.location}</p>
                <h3 className="mt-1 font-display text-2xl">{t.location.mapTitle}</h3>
              </div>
              <a href={contact.googleMapsProfileUrl || contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label={t.actions.googleProfile}>
                <ExternalLink size={18} />
              </a>
            </div>
            <div className="relative min-h-[420px] bg-mist">
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
      </div>
    </section>
  );
}
