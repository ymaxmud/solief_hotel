"use client";

import { useMemo, useState } from "react";
import type { Currency, Locale } from "@/types";
import type { QuickBookingValues } from "@/lib/schema";
import { getDictionary } from "@/i18n/dictionary";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { Modal } from "@/components/ui/Modal";
import { BookingRequestForm } from "@/components/forms/BookingRequestForm";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Hero } from "./Hero";
import { BookingBar } from "./BookingBar";
import { StorySection } from "./StorySection";
import { RoomsSection } from "./RoomsSection";
import { GallerySection } from "./GallerySection";
import { AmenitiesSection } from "./AmenitiesSection";
import { LocationSection } from "./LocationSection";
import { TrustSection } from "./TrustSection";
import { FAQSection } from "./FAQSection";
import { ContactSection } from "./ContactSection";

/**
 * The language is fixed by the route that rendered this page — `/` is English,
 * `/ru` and `/uz` are their own documents — so there is no locale state and no
 * stored preference to reconcile. Switching language navigates, which is what
 * lets each language be indexed and shared on its own URL.
 */
export function HomePage({ locale }: { locale: Locale }) {
  const [currency, setCurrency] = useState<Currency>("UZS");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDefaults, setBookingDefaults] = useState<Partial<QuickBookingValues> | undefined>();
  const t = useMemo(() => getDictionary(locale), [locale]);

  function openBooking(defaults?: Partial<QuickBookingValues>) {
    setBookingDefaults(defaults);
    setBookingOpen(true);
  }

  return (
    <>
      <Header t={t} locale={locale} currency={currency} setCurrency={setCurrency} onBook={() => openBooking()} />
      <main>
        <Hero t={t} locale={locale} onBook={() => openBooking()} />
        <BookingBar t={t} locale={locale} onSubmit={(values) => openBooking(values)} />
        <StorySection t={t} locale={locale} />
        <RoomsSection t={t} locale={locale} currency={currency} onBook={openBooking} />
        <GallerySection t={t} locale={locale} />
        <AmenitiesSection t={t} locale={locale} />
        <LocationSection t={t} locale={locale} />
        <TrustSection t={t} />
        <FAQSection t={t} locale={locale} />
        <ContactSection t={t} locale={locale} />
      </main>
      <Footer t={t} locale={locale} />
      <FloatingCTA t={t} onBook={() => openBooking()} />
      <Chatbot t={t} locale={locale} onBook={() => openBooking()} />
      <CookieConsent locale={locale} />
      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title={t.booking.title} closeLabel={t.actions.close}>
        <BookingRequestForm t={t} locale={locale} defaults={bookingDefaults} />
      </Modal>
    </>
  );
}
