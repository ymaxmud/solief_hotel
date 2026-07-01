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
ALLOW_INITIAL_ADMIN_BOOTSTRAP=false
```

Then run:

```bash
npm run create-initial-admin
```

The script is idempotent and will not duplicate an existing admin. In production it refuses to run unless `ALLOW_INITIAL_ADMIN_BOOTSTRAP=true` is explicitly set. It rejects weak/default passwords and never prints the password.

Production operator checklist:

- Rotate the previously shared temporary admin password immediately in Supabase Auth.
- Enable MFA for privileged Supabase/Auth users where available.
- Remove `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, and `ALLOW_INITIAL_ADMIN_BOOTSTRAP` after the first bootstrap.
- Verify no temporary or demo admin credentials remain active.
- Use `/admin/users` to deactivate unused users, change roles, and send password reset links.

## Resend Email

Set:

```bash
RESEND_API_KEY=
BOOKING_EMAIL_FROM=
BOOKING_EMAIL_TO=
BOOKING_EMAIL_CC=
HOTEL_OWNER_EMAIL=
```

`BOOKING_EMAIL_FROM` must be a verified Resend sender/domain for production. New public booking requests are always saved first. If Resend, sender, or recipients are missing, or if email fails, the request remains in Supabase and a `notifications` row records `manual_required` or `failed`.

## Supabase Auth SMTP

Supabase's built-in Auth email sender is rate-limited and should not be used for production password resets/invites. Configure custom SMTP in Supabase Dashboard:

1. Open Supabase Dashboard → Authentication → SMTP Settings.
2. Enable custom SMTP.
3. Use a verified provider/domain, for example Resend SMTP.
4. Send a test email from Supabase.
5. Keep SMTP credentials in Supabase, not in this repository.

This is separate from `RESEND_API_KEY`, which is used by the app for booking request notifications.

## Public Booking Spam Protection

Public booking requests use durable Supabase-backed rate limits. Optional Cloudflare Turnstile can be enabled with:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

When `TURNSTILE_SECRET_KEY` is configured, booking submissions without a valid Turnstile token are rejected server-side.

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
- require a staff email/phone plus attendance PIN
- record accuracy, IP, user agent, distance, and anomaly flags

Set or rotate staff attendance PINs from `/admin/staff`. PINs are hashed in Supabase and are never displayed. Browser geolocation is treated as an anti-fraud signal, not proof of identity.

Manual overrides are admin/manager-only and require a correction reason. Overrides write audit logs.

## Supabase Migrations Added

The hardening migration adds:

- atomic `redeem_attendance_qr(...)` RPC
- atomic `create_public_booking_request(...)` RPC
- durable `check_public_rate_limit(...)` RPC
- attendance attempt/anomaly logging
- staff attendance PIN hash fields
- app user password-reset/deactivation fields
- attendance metadata and indexes

Apply migrations before deploying code that calls these RPCs.

## Exports

CSV exports are available from `/admin/reports` for attendance, booking requests, service assignments, guests, and stays. Use the date/status filters before exporting sensitive data. Exports are role-checked, audited, row-limited, and neutralize spreadsheet formula injection.

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
