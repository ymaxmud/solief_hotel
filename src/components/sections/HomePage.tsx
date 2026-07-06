"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Currency, Locale } from "@/types";
import type { QuickBookingValues } from "@/lib/schema";
import { getDictionary } from "@/i18n/dictionary";
import { siteConfig } from "@/content/siteContent";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { Modal } from "@/components/ui/Modal";
import { BookingRequestForm } from "@/components/forms/BookingRequestForm";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Hero } from "./Hero";
import { BookingBar } from "./BookingBar";
import { OwnerPitchSection } from "./OwnerPitchSection";
import { StorySection } from "./StorySection";
import { RoomsSection } from "./RoomsSection";
import { GallerySection } from "./GallerySection";
import { AmenitiesSection } from "./AmenitiesSection";
import { LocationSection } from "./LocationSection";
import { ReviewsSection } from "./ReviewsSection";
import { BenefitsSection } from "./BenefitsSection";
import { FAQSection } from "./FAQSection";
import { ContactSection } from "./ContactSection";

const SUPPORTED_LOCALES: Locale[] = ["en", "ru", "uz"];

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as string[]).includes(value);
}

export function HomePage() {
  const [locale, setLocaleState] = useState<Locale>(siteConfig.defaultLocale);
  const [currency, setCurrency] = useState<Currency>("UZS");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDefaults, setBookingDefaults] = useState<Partial<QuickBookingValues> | undefined>();
  const t = useMemo(() => getDictionary(locale), [locale]);

  // Resolve the initial locale from ?lang= (so the hreflang alternates actually
  // serve their language) or a previously saved choice, then keep the document
  // language and persistence in sync on every change.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    const stored = window.localStorage.getItem("solief-locale");
    const initial = isLocale(fromUrl) ? fromUrl : isLocale(stored) ? stored : siteConfig.defaultLocale;
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem("solief-locale", next);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState(null, "", url.toString());
    } catch {
      // Non-fatal: locale still applies in-memory if storage/history is unavailable.
    }
  }, []);

  function openBooking(defaults?: Partial<QuickBookingValues>) {
    setBookingDefaults(defaults);
    setBookingOpen(true);
  }

  return (
    <>
      <Header t={t} locale={locale} setLocale={setLocale} currency={currency} setCurrency={setCurrency} onBook={() => openBooking()} />
      <main>
        <Hero t={t} locale={locale} onBook={() => openBooking()} />
        <BookingBar t={t} locale={locale} onSubmit={(values) => openBooking(values)} />
        <OwnerPitchSection t={t} />
        <StorySection t={t} locale={locale} />
        <RoomsSection t={t} locale={locale} currency={currency} onBook={() => openBooking()} />
        <GallerySection t={t} locale={locale} />
        <AmenitiesSection t={t} locale={locale} />
        <LocationSection t={t} locale={locale} />
        <ReviewsSection t={t} locale={locale} />
        <BenefitsSection t={t} />
        <FAQSection t={t} locale={locale} />
        <ContactSection t={t} locale={locale} />
      </main>
      <Footer t={t} />
      <FloatingCTA t={t} onBook={() => openBooking()} />
      <Chatbot t={t} locale={locale} onBook={() => openBooking()} />
      <CookieConsent locale={locale} />
      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title={t.booking.title} closeLabel={t.actions.close}>
        <BookingRequestForm t={t} locale={locale} defaults={bookingDefaults} />
      </Modal>
    </>
  );
}
