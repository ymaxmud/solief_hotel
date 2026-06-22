import type { Currency, Locale } from "@/types";

// These rates are demo values. Connect a real exchange-rate API for production.
export const demoRates: Record<Currency, number> = {
  UZS: 1,
  USD: 12600,
  EUR: 13700
};

export function convertFromUzs(amountUzs: number, currency: Currency) {
  return Math.round(amountUzs / demoRates[currency]);
}

export function formatPrice(amountUzs: number, currency: Currency, locale: Locale) {
  const value = currency === "UZS" ? amountUzs : convertFromUzs(amountUzs, currency);
  const localeMap = { en: "en-US", ru: "ru-RU", uz: "uz-UZ" } satisfies Record<Locale, string>;
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "UZS" ? 0 : 0
  }).format(value);
}
