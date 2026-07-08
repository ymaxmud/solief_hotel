"use client";

import { motion } from "framer-motion";
import { MapPin, MessageCircle, Phone, Send, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { contact } from "@/content/contact";
import { Button, ButtonLink } from "@/components/ui/Button";
import { HeroCarousel } from "./HeroCarousel";

export function Hero({ t, locale, onBook }: { t: Dictionary; locale: Locale; onBook: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden bg-canvas pb-16 pt-28 md:pb-20 md:pt-32">
      {/* Ghost serif monogram — quiet depth behind the copy. */}
      <div aria-hidden className="pointer-events-none absolute -left-10 top-16 select-none font-display text-[15rem] leading-none text-navy/[0.045] md:text-[22rem]">
        S
      </div>
      {/* Faint champagne glow behind the frame column. */}
      <div aria-hidden className="pointer-events-none absolute right-[-10%] top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,169,106,0.14),transparent_62%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-champagne">
            <span aria-hidden className="h-px w-10 bg-champagne/70" />
            {t.hero.eyebrow}
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.04] text-ink sm:text-6xl xl:text-7xl">
            {t.hero.titlePre}
            <em className="italic">{t.hero.titleAccent}</em>
            {t.hero.titlePost}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate sm:text-xl">{t.hero.subtitle}</p>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">{t.hero.supporting}</p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <Button onClick={onBook}>
              <Send size={17} /> {t.actions.request}
            </Button>
            <ButtonLink href={`tel:${contact.phone.replaceAll(" ", "")}`} variant="light">
              <Phone size={17} /> {t.actions.call}
            </ButtonLink>
            {contact.whatsappUrl ? (
              <ButtonLink href={contact.whatsappUrl} target="_blank" variant="light">
                <MessageCircle size={17} /> {t.actions.whatsapp}
              </ButtonLink>
            ) : null}
            {contact.telegramUrl ? (
              <ButtonLink href={contact.telegramUrl} target="_blank" variant="light">
                <Send size={17} /> {t.actions.telegram}
              </ButtonLink>
            ) : null}
            <ButtonLink href={contact.googleMapsUrl} target="_blank" variant="light">
              <MapPin size={17} /> {t.actions.map}
            </ButtonLink>
          </div>

          <div className="mt-9 flex items-center gap-2.5 border-t border-champagne/30 pt-5 text-sm font-medium text-ink">
            <Star size={17} className="shrink-0 fill-champagne text-champagne" />
            <span>{t.hero.trustLine}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="w-full lg:pl-4"
        >
          <HeroCarousel t={t} locale={locale} />
        </motion.div>
      </div>
    </section>
  );
}
