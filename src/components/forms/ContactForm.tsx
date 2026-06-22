"use client";

import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { BookingRequestForm } from "./BookingRequestForm";

export function ContactForm({ t, locale }: { t: Dictionary; locale: Locale }) {
  return <BookingRequestForm t={t} locale={locale} />;
}
