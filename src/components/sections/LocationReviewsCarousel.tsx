"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Star } from "lucide-react";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { reviews } from "@/content/reviews";
import { siteConfig } from "@/content/siteContent";
import { contact } from "@/content/contact";
import { ButtonLink } from "@/components/ui/Button";

export function LocationReviewsCarousel({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [active, setActive] = useState(0);
  const review = reviews[active];

  function move(direction: 1 | -1) {
    setActive((current) => (current + direction + reviews.length) % reviews.length);
  }

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-charcoal/10 bg-white/82 shadow-soft backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[22rem_1fr]">
        <div className="bg-treeGreen p-6 text-white md:p-8">
          <div className="flex items-center gap-1 text-warmSand">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={20} fill="currentColor" />
            ))}
          </div>
          <p className="mt-4 font-display text-6xl leading-none">{siteConfig.rating}</p>
          <p className="mt-2 text-white/70">{siteConfig.reviewCount} {t.hero.reviews.toLowerCase()}</p>
          <ButtonLink href={contact.googleMapsProfileUrl || contact.googleMapsUrl} target="_blank" variant="ghost" className="mt-6 border-white/20">
            <ExternalLink size={16} /> {t.actions.readReviews}
          </ButtonLink>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-coralBase">{t.location.reviewsTitle}</p>
              <h3 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-charcoal md:text-4xl">
                {review.theme[locale]}
              </h3>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => move(-1)} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-charcoal/10 bg-softWhite text-charcoal" aria-label={t.actions.previous}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => move(1)} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-charcoal/10 bg-softWhite text-charcoal" aria-label={t.actions.next}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <blockquote className="mt-6 max-w-3xl text-xl leading-9 text-greenGray">
            “{review.text[locale]}”
          </blockquote>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-hotelBlue">{review.label[locale]}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-greenGray/75">{t.location.reviewsSubtitle}</p>

          <div className="mt-6 flex gap-2">
            {reviews.map((item, index) => (
              <button
                key={item.label.en}
                type="button"
                onClick={() => setActive(index)}
                className={`focus-ring h-2.5 rounded-full transition-all ${index === active ? "w-10 bg-coralBase" : "w-2.5 bg-charcoal/20"}`}
                aria-label={`${t.actions.openPhoto} ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
