# Payment Readiness Notes

The site is **payment-ready in structure but charges nothing**. No payment gateway is
connected. This document describes what exists today and the exact steps to enable
real payments later (Click, Payme, Stripe, etc.).

## What exists today

- **Room pricing data** — `src/content/rooms.ts`. Each room has a stable `id` (slug)
  and `priceUzs` (nightly rate). These are the canonical price/identifier for booking.
- **Payment layer** — `src/lib/payment.ts`. Pure types + calculations, no provider:
  - `PaymentStatus` = `not_required | pending | paid | failed | refunded`
  - `PaymentProvider` = `click | payme | stripe | manual_cash | bank_transfer`
  - `BookingQuote` — room id/name, nightly UZS, nights, guests, currency, total UZS
  - `PaymentIntent` — future record shape (quote + status + provider + reference)
  - `nightsBetween(checkIn, checkOut)` and `quoteBooking(...)`
- **Booking form** (`src/components/forms/BookingRequestForm.tsx`) computes and shows an
  estimated total from the selected room + dates, and sends `roomId` (room slug) in the
  POST body for forward compatibility.
- **`roomId`** is accepted by `bookingSchema` (`src/lib/schema.ts`) but **not yet
  persisted** — the public booking RPC currently stores only `roomType` (the name).

## What is NOT done (intentionally)

- No provider SDK, no checkout, no webhooks, no charge.
- `roomId`, price, nights, and totals are **not stored** in the database.

## Database work required to enable payments

The project uses Supabase migrations under `supabase/migrations/`. Add a **new** migration
(do not edit existing ones). Suggested changes:

1. **`booking_requests`** — add nullable columns:
   - `room_id text` (room slug)
   - `nightly_price_uzs bigint`
   - `nights int`
   - `total_uzs bigint`
   - `currency text default 'UZS'`
2. **`payments`** table (new):
   - `id uuid pk default gen_random_uuid()`
   - `booking_request_id uuid references booking_requests(id)`
   - `status text` (matches `PaymentStatus`)
   - `provider text null` (matches `PaymentProvider`)
   - `provider_reference text null`
   - `amount_uzs bigint`, `currency text default 'UZS'`
   - `created_at timestamptz default now()`, `updated_at timestamptz`
   - RLS: writes via service role only (consistent with the rest of the app).
3. Update `create_public_booking_request(...)` (new migration, `create or replace`) to
   accept and store `p_room_id`, `p_nightly_price_uzs`, `p_nights`, `p_total_uzs`.

## Backend/API work required

1. In `src/app/api/booking-request/route.ts`, pass the new fields to the RPC.
2. Add a provider integration module (e.g. `src/lib/providers/click.ts`) implementing:
   - create transaction / prepare
   - verify / complete (webhook handler under `src/app/api/payments/<provider>/route.ts`)
   - map provider callbacks to `PaymentStatus` and update the `payments` row.
3. Keep the current request-only flow working when payment is `not_required`.

## Invariant

The website must remain fully functional with **no** payment provider connected. All of
the above is additive.
