# Payment Readiness Notes

**No payment system is connected, and connecting one is not planned.** Solief Hotel
takes booking *requests* and confirms them with the guest directly; nothing on the site
charges a card, collects a deposit, or depends on a payment provider.

This file exists only to record the pricing shapes already in the codebase and what
would be involved if the hotel ever decided otherwise. It is not a roadmap, and no work
here is outstanding.

## What exists today

- **Room pricing data** — `src/content/rooms.ts`. Each room has a stable `id` (slug)
  and `priceUzs` (nightly rate). These are the canonical price/identifier for booking.
- **Payment layer** — `src/lib/payment.ts`. Pure types + calculations, no provider:
  - `PaymentStatus` = `not_required | pending | paid | failed | refunded`
  - `PaymentProvider` = `click | payme | stripe | manual_cash | bank_transfer`
  - `BookingQuote` — room id/name, nightly UZS, nights, guests, currency, total UZS
  - `PaymentIntent` — future record shape (quote + status + provider + reference)
  - `nightsBetween(checkIn, checkOut)` and `quoteBooking(...)`
- **Booking form** (`src/components/forms/BookingRequestForm.tsx`) shows a non-binding
  estimated total from the selected room + dates, labelled as an estimate, and sends
  `roomId` (the room-category slug) in the POST body.

## What the server now does (implemented)

- The booking API resolves `roomId` against the **active** room categories in the
  database, rejects anything that does not match, and recalculates the price itself. A
  price sent by the browser is ignored.
- `booking_requests` stores a price snapshot: `room_category_id`, `nightly_price_uzs`,
  `nights`, `estimated_total_uzs`. Changing a room price later never rewrites what an
  existing request was quoted.
- These values are an **estimate**, not a payment and not a confirmed reservation. The
  public site, the notification email and the CRM all say so.

## What is NOT done (intentionally, and not planned)

- No provider SDK, no checkout page, no webhooks, no charge, no deposit.
- No Stripe, Click or Payme dependency anywhere in the project.

## If payments were ever added (reference only)

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
