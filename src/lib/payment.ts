// Payment-readiness layer.
//
// This module defines the pricing/payment shapes the booking flow will need when
// a real provider (Click, Payme, Stripe, etc.) is connected later. It performs NO
// charges and has NO provider dependency — it only computes totals and models the
// intended data. See PAYMENT_READINESS_NOTES.md for the backend/DB work required
// to persist these fields.

export type PaymentStatus = "not_required" | "pending" | "paid" | "failed" | "refunded";

export type PaymentProvider = "click" | "payme" | "stripe" | "manual_cash" | "bank_transfer";

/** Prices are quoted in UZS today; kept as a field so multi-currency is a small change. */
export type PaymentCurrency = "UZS";

export type BookingQuote = {
  roomId: string;
  roomName: string;
  nightlyUzs: number;
  nights: number;
  guests: number;
  currency: PaymentCurrency;
  totalUzs: number;
};

/**
 * Future payment record shape (not persisted yet). When payments are enabled,
 * this maps to a `payments` table / booking columns — see PAYMENT_READINESS_NOTES.md.
 */
export type PaymentIntent = {
  bookingReference: string;
  quote: BookingQuote;
  status: PaymentStatus;
  provider?: PaymentProvider;
  /** Provider-side transaction id / receipt reference. */
  providerReference?: string;
};

/** Whole nights between two ISO/date strings; 0 if invalid or non-positive. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.round(diff / 86_400_000);
}

export function quoteBooking(input: {
  roomId: string;
  roomName: string;
  nightlyUzs: number;
  nights: number;
  guests: number;
}): BookingQuote {
  const nights = Math.max(0, Math.floor(input.nights));
  const guests = Math.max(1, Math.floor(input.guests));
  return {
    roomId: input.roomId,
    roomName: input.roomName,
    nightlyUzs: input.nightlyUzs,
    nights,
    guests,
    currency: "UZS",
    totalUzs: input.nightlyUzs * nights
  };
}
