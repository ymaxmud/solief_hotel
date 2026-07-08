"use client";

import { motion } from "framer-motion";
import { MapPin, MessageCircle, Phone, Send, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { contact } from "@/content/contact";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { HeroCarousel } from "./HeroCarousel";

export function Hero({ t, locale, onBook }: { t: Dictionary; locale: Locale; onBook: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden bg-canvas pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-xl"
        >
          <Wordmark tone="dark" className="text-2xl" />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-champagne">{t.hero.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">{t.hero.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate sm:text-xl">{t.hero.subtitle}</p>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">{t.hero.supporting}</p>

          <div className="mt-7 flex flex-wrap gap-2.5">
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

          <div className="mt-8 flex items-center gap-2 border-t border-line pt-5 text-sm text-muted">
            <Star size={15} className="shrink-0 fill-champagne text-champagne" />
            <span>{t.hero.trustLine}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="w-full lg:pl-6"
        >
          <HeroCarousel t={t} locale={locale} />
        </motion.div>
      </div>
    </section>
  );
}
