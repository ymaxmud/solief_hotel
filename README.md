# Solief Hotel Website Demo

Production-quality Next.js demo for Solief Hotel in Tashkent, Uzbekistan. The site is designed to show how a modern direct-booking website can improve trust, presentation, multilingual access, and booking request conversion.

## Run

```bash
npm install
npm run dev
npm run build
```

## Images

Place hotel images in `public/images/` as numeric PNG files. This project currently uses the provided files from `1.png` to `35.png`, excluding missing `14.png`.

Edit `src/content/images.ts` to set the hero image, categories, priority loading, and alt text. By default, `/images/2.png` is marked as the hero exterior image.

## Edit Hotel Data

Editable hotel facts and links live in:

- `src/content/siteContent.ts`
- `src/content/contact.ts`
- `src/content/rooms.ts`
- `src/content/amenities.ts`
- `src/content/reviews.ts`
- `src/content/faq.ts`
- `src/content/images.ts`

Unconfirmed services and links are marked with comments or placeholder flags.

## Translations

All visible public UI labels are in:

- `src/i18n/en.ts`
- `src/i18n/ru.ts`
- `src/i18n/uz.ts`
- `src/i18n/dictionary.ts`

Default language is configured in `src/content/siteContent.ts`.

## Booking Email

The booking API route is `src/app/api/booking-request/route.ts`.

Environment variables:

```bash
BOOKING_EMAIL_TO=info@soliefhotel.uz
EMAIL_PROVIDER=
```

If no provider is configured, the API returns a `mailto:` fallback. It never confirms bookings; it only prepares or sends a booking request.

## Contact Links

Configure phone, email, Google Maps, WhatsApp, Telegram, Booking.com, MyBooking.uz, Instagram, and Facebook in `src/content/contact.ts`. Empty URLs are handled gracefully and not shown as broken public links.

The Google Maps profile, coordinates, directions URL, and map embed are also configured in `src/content/contact.ts`. The current profile link is `https://maps.app.goo.gl/QTJVejTBReA73t3u9`.

## Admin Demo

Visit `/admin`.

Default development passcode:

```bash
solief-demo
```

Override it with:

```bash
NEXT_PUBLIC_ADMIN_DEMO_PASSCODE=your-passcode
```

The admin demo saves JSON to `localStorage`, supports import/export/reset, and is intentionally not a production database. Production should connect to a CMS or database.

## Currency

Static demo rates are in `src/lib/currency.ts`. They are demo values only; connect a real exchange-rate API for production.

## Deploy

Use any Next.js-compatible host. Before deployment, set the canonical domain in `src/content/siteContent.ts`, configure environment variables, and confirm official owner details.

## Needs Owner Confirmation

- Official email and domain
- Official WhatsApp and Telegram links
- Exact room pricing
- Breakfast details
- Parking availability
- Airport transfer availability
- Restaurant/kitchen details
- Laundry and non-smoking room details
- Official booking platform and social links
- Missing `14.png` asset, if a full 35-image set is required
