# Solief Hotel Website and CRM

Production Next.js site and Supabase-backed hotel CRM for Solief Hotel in Tashkent, Uzbekistan.

## Run

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

## Images

Hotel images live in `public/images/` as numeric PNG files. Edit `src/content/images.ts` to set the hero image, categories, priority loading, and alt text. The provided set is missing `14.png`, so it is not referenced.

## Supabase Setup

1. Create a Supabase Free project.
2. Run migrations in `supabase/migrations`.
3. Optionally run `supabase/seed/seed.sql` for development room/staff data.
4. Add environment variables from `.env.example` to local `.env.local` and Vercel.
5. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://soliefhotel.vercel.app
```

## First Admin

Set:

```bash
INITIAL_ADMIN_EMAIL=
INITIAL_ADMIN_PASSWORD=
```

Then run:

```bash
npm run create-initial-admin
```

The script is idempotent and will not duplicate an existing admin.

## Resend Email

Set:

```bash
RESEND_API_KEY=
BOOKING_EMAIL_TO=
BOOKING_EMAIL_CC=
HOTEL_OWNER_EMAIL=
```

New public booking requests are always saved first. If Resend is missing or fails, the request remains in Supabase and a `notifications` row records `manual_required` or `failed`.

## WhatsApp

V1 uses click-to-chat only:

```bash
HOTEL_OWNER_WHATSAPP_E164=
```

No paid WhatsApp API is required. Automated Meta WhatsApp Cloud API integration is intentionally not enabled in this version.

## Admin CRM

Routes:

- `/admin/login`
- `/admin/dashboard`
- `/admin/users`
- `/admin/staff`
- `/admin/attendance`
- `/admin/attendance/qr`
- `/admin/guests`
- `/admin/booking-requests`
- `/admin/rooms`
- `/admin/stays`
- `/admin/services`
- `/admin/reports`
- `/admin/audit-log`

Roles:

- `admin`
- `manager`
- `receptionist`

All mutations verify roles server-side. CRM data is stored in Supabase, not localStorage.

## QR Attendance

QR attendance tokens:

- expire after 60 seconds
- are hashed in the database
- are single-use
- require browser geolocation
- must be within `NEXT_PUBLIC_ATTENDANCE_RADIUS_METERS` of the hotel coordinates

Manual overrides are admin/manager-only and require a correction reason. Overrides write audit logs.

## Exports

CSV exports are available from `/admin/reports` for attendance, booking requests, service assignments, guests, and stays.

## Public Content

Editable public content lives in:

- `src/content/siteContent.ts`
- `src/content/contact.ts`
- `src/content/rooms.ts`
- `src/content/amenities.ts`
- `src/content/reviews.ts`
- `src/content/faq.ts`
- `src/content/images.ts`

Translations live in:

- `src/i18n/en.ts`
- `src/i18n/ru.ts`
- `src/i18n/uz.ts`
- `src/i18n/admin.ts`

## Vercel

Add all variables from `.env.example` in Vercel Project Settings. The app is compatible with Vercel serverless functions.

## Owner Confirmation Needed

- Official email/domain
- Official WhatsApp/Telegram links
- Exact room pricing
- Breakfast, parking, transfer, restaurant/kitchen, laundry details
- Official booking platform and social links
- Missing `14.png` if a complete 35-image set is required
