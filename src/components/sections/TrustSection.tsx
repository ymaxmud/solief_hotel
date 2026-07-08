import { BadgeCheck, ExternalLink, MapPin, PhoneCall, Star, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import { contact } from "@/content/contact";
import { siteConfig } from "@/content/siteContent";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function TrustSection({ t }: { t: Dictionary }) {
  const cards: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: BadgeCheck, title: t.trust.verified.title, desc: t.trust.verified.desc },
    { icon: PhoneCall, title: t.trust.contact.title, desc: t.trust.contact.desc },
    { icon: Tags, title: t.trust.prices.title, desc: t.trust.prices.desc },
    { icon: MapPin, title: t.trust.location.title, desc: t.trust.location.desc }
  ];

  return (
    <section id="reviews" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={t.trust.eyebrow} title={t.sections.reviews}>
          {t.trust.subtitle}
        </SectionHeading>
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-center rounded-2xl bg-navy p-8 text-white shadow-glow">
            <div className="flex items-center gap-1.5 text-champagne">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} fill="currentColor" size={20} />
              ))}
            </div>
            <p className="mt-5 font-display text-6xl leading-none">{siteConfig.rating}</p>
            <p className="mt-2 text-sm text-white/70">
              {t.trust.ratingLabel} · {t.hero.reviews}
            </p>
            <a
              href={contact.googleMapsProfileUrl || contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <ExternalLink size={16} /> {t.actions.readReviews}
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist text-oxford">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
