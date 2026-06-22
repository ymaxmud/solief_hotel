import { Star } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { reviews } from "@/content/reviews";
import { siteConfig } from "@/content/siteContent";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ReviewsSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="reviews" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={t.sections.reviews} />
        <div className="grid gap-5 md:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-lg bg-treeGreen p-8 text-white shadow-glow">
            <div className="flex items-center gap-2 text-warmSand">{Array.from({ length: 5 }).map((_, i) => <Star key={i} fill="currentColor" size={22} />)}</div>
            <p className="mt-5 font-display text-6xl">{siteConfig.rating}</p>
            <p className="text-white/70">{siteConfig.reviewCount} {t.hero.reviews.toLowerCase()}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.label.en} className="rounded-lg border border-charcoal/10 bg-white/78 p-5 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-coralBase">{review.label[locale]}</p>
                <p className="mt-4 text-sm leading-6 text-greenGray">{review.text[locale]}</p>
                <p className="mt-5 font-bold text-charcoal">{review.theme[locale]}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
