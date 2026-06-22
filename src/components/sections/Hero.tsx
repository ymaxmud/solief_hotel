"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, MessageCircle, Phone, Send, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { heroImage } from "@/content/images";
import { contact } from "@/content/contact";
import { Button, ButtonLink } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Ornament } from "@/components/ui/Ornament";

export function Hero({ t, locale, onBook }: { t: Dictionary; locale: Locale; onBook: () => void }) {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-treeGreen text-white">
      <Image src={heroImage.src} alt={heroImage.alt[locale]} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-treeGreen/88 via-treeGreen/48 to-hotelBlue/24" />
      <div className="absolute inset-0 bg-gradient-to-t from-treeGreen via-transparent to-treeGreen/24" />
      <Ornament className="absolute right-[-8rem] top-24 h-80 w-80 opacity-25" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-20 pt-28">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-warmSand">{t.hero.kicker}</p>
          <h1 className="font-display text-6xl leading-none md:text-8xl">{t.hero.title}</h1>
          <p className="mt-5 max-w-2xl font-display text-3xl leading-tight text-softWhite md:text-5xl">{t.hero.subtitle}</p>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">{t.hero.body}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {[t.hero.rating, t.hero.reviews, t.hero.checkIn, t.hero.checkOut, t.hero.district].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-2 text-sm backdrop-blur">
                <Star size={14} className="text-warmSand" /> {badge}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={onBook}><Send size={17} /> {t.actions.request}</Button>
            <ButtonLink href={`tel:${contact.phone.replaceAll(" ", "")}`} variant="ghost"><Phone size={17} /> {t.actions.call}</ButtonLink>
            {contact.whatsappUrl ? <ButtonLink href={contact.whatsappUrl} variant="ghost"><MessageCircle size={17} /> {t.actions.whatsapp}</ButtonLink> : null}
            {contact.telegramUrl ? <ButtonLink href={contact.telegramUrl} variant="ghost"><Send size={17} /> {t.actions.telegram}</ButtonLink> : null}
            <ButtonLink href={contact.googleMapsUrl} target="_blank" variant="ghost"><MapPin size={17} /> {t.actions.map}</ButtonLink>
          </div>
          <GlassPanel className="mt-10 max-w-2xl p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-xs text-white/60">{t.booking.checkIn}</p><p className="text-2xl font-bold">14:00</p></div>
              <div><p className="text-xs text-white/60">{t.booking.checkOut}</p><p className="text-2xl font-bold">12:00</p></div>
              <div><p className="text-xs text-white/60">{t.booking.noInstant}</p><button onClick={onBook} className="mt-1 font-bold text-warmSand underline underline-offset-4">{t.booking.openForm}</button></div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-white/60 md:block">{t.hero.scroll}</div>
    </section>
  );
}
