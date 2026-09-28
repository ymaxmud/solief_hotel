import type { Locale } from "@/types";

/**
 * Locale routing. English is served from the bare root because
 * soliefhotel.com is the established canonical URL and the target of branded
 * search; moving it to /en would discard that. The other two languages get
 * their own path prefix.
 */

export const LOCALES: Locale[] = ["en", "ru", "uz"];

/** Locales that live behind a /:lang prefix — i.e. everything except English. */
export const INTL_LOCALES = ["ru", "uz"] as const;

export type IntlLocale = (typeof INTL_LOCALES)[number];

export function isIntlLocale(value: string | null | undefined): value is IntlLocale {
  return value === "ru" || value === "uz";
}

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

/** Where a given locale's homepage lives. */
export function localeHref(locale: Locale) {
  return locale === "en" ? "/" : `/${locale}`;
}

/**
 * Link to a legal page in the reader's language.
 *
 * Unlike the homepage, /privacy and /terms are a single URL that switches
 * language in the browser: they carry little search value, so giving them three
 * URLs each would triple the surface area for no gain. The language therefore
 * travels as a query parameter, which LegalPage reads on mount.
 */
export function legalHref(doc: "privacy" | "terms", locale: Locale) {
  return locale === "en" ? `/${doc}` : `/${doc}?lang=${locale}`;
}
