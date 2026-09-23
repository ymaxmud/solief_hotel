import { describe, expect, it } from "vitest";
import {
  convertFromUzs,
  defaultCurrencyRates,
  formatPrice,
  isValidRate,
  normalizeCurrencyRates
} from "@/lib/currency";

describe("currency", () => {
  it("treats UZS as authoritative and never converts it", () => {
    expect(convertFromUzs(500_000, "UZS")).toBe(500_000);
    expect(defaultCurrencyRates.UZS).toBe(1);
  });

  it("converts UZS to USD and EUR using the configured rate", () => {
    const rates = normalizeCurrencyRates({ USD: 12_500, EUR: 13_000 });
    expect(convertFromUzs(500_000, "USD", rates)).toBe(40);
    expect(convertFromUzs(650_000, "EUR", rates)).toBe(50);
  });

  it("rejects non-positive and non-finite rates", () => {
    expect(isValidRate(0)).toBe(false);
    expect(isValidRate(-1)).toBe(false);
    expect(isValidRate(Number.NaN)).toBe(false);
    expect(isValidRate(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidRate(12_600)).toBe(true);
  });

  it("falls back to the default rate when a stored value is invalid", () => {
    const rates = normalizeCurrencyRates({ USD: 0, EUR: -5 });
    expect(rates.USD).toBe(defaultCurrencyRates.USD);
    expect(rates.EUR).toBe(defaultCurrencyRates.EUR);
  });

  it("never renders NaN, even for an invalid amount or a zero rate", () => {
    for (const currency of ["UZS", "USD", "EUR"] as const) {
      expect(formatPrice(Number.NaN, currency, "en")).not.toContain("NaN");
      expect(formatPrice(500_000, currency, "en", { UZS: 1, USD: 0, EUR: 0 })).not.toContain("NaN");
      expect(formatPrice(500_000, currency, "ru")).not.toContain("NaN");
      expect(formatPrice(500_000, currency, "uz")).not.toContain("NaN");
    }
  });

  it("formats a UZS price without fractional digits", () => {
    expect(formatPrice(500_000, "UZS", "en")).not.toMatch(/[.,]\d\d\b/);
  });
});
