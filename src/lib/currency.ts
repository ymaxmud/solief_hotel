import type { Currency, Locale } from "@/types";

/**
 * UZS is the authoritative currency: every stored price and every booking
 * request snapshot is in UZS. USD and EUR are display-only conversions shown to
 * help international guests estimate cost — they are never stored as the
 * booking price.
 *
 * A rate is "how many UZS make one unit of that currency". Rates are owner
 * maintained in /admin/website rather than pulled from a paid exchange-rate
 * provider; a small hotel changes them a few times a year and an external
 * dependency is not worth the operational burden.
 */
export type CurrencyRates = Record<Currency, number>;

/** Owner-confirmed launch rates, used when the database has no override. */
export const defaultCurrencyRates: CurrencyRates = {
  UZS: 1,
  USD: 12600,
  EUR: 13700
};

/** A rate must be a finite positive number, or conversion produces NaN/Infinity. */
export function isValidRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Discard any non-positive or non-finite override so a bad stored value can
 * never render "NaN" or a divide-by-zero price on the public site.
 */
export function normalizeCurrencyRates(input?: Partial<Record<Currency, unknown>> | null): CurrencyRates {
  return {
    UZS: 1,
    USD: isValidRate(input?.USD) ? input.USD : defaultCurrencyRates.USD,
    EUR: isValidRate(input?.EUR) ? input.EUR : defaultCurrencyRates.EUR
  };
}

export function convertFromUzs(amountUzs: number, currency: Currency, rates: CurrencyRates = defaultCurrencyRates) {
  if (currency === "UZS") return Math.round(amountUzs);
  const rate = isValidRate(rates[currency]) ? rates[currency] : defaultCurrencyRates[currency];
  return Math.round(amountUzs / rate);
}

export function formatPrice(
  amountUzs: number,
  currency: Currency,
  locale: Locale,
  rates: CurrencyRates = defaultCurrencyRates
) {
  const safeAmount = Number.isFinite(amountUzs) ? amountUzs : 0;
  const value = convertFromUzs(safeAmount, currency, rates);
  const localeMap = { en: "en-US", ru: "ru-RU", uz: "uz-UZ" } satisfies Record<Locale, string>;
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}
