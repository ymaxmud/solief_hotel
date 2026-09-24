# Solief Hotel Website and CRM

Production Next.js site and Supabase-backed hotel CRM for Solief Hotel in Tashkent, Uzbekistan.

## Run

```bash
npm ci
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run e2e
```

### Lockfile and npm version

CI pins **npm 10.9.8** and the lockfile is generated with that version. This is not
cosmetic: npm major versions disagree about which optional transitive entries belong in
the lockfile. npm 11 omits `@emnapi/runtime` (reached via the `sharp` override), and
npm 10 then refuses `npm ci` with "Missing: @emnapi/runtime from lock file". A lockfile
written by npm 10 is accepted by both.

If you change dependencies, regenerate and verify with both:

```bash
npx -y npm@10.9.8 install --package-lock-only
rm -rf node_modules && npx -y npm@10.9.8 ci
rm -rf node_modules && npm ci
```

## Images

Hotel images live in `public/images/` as numeric PNG files. Edit `src/content/images.ts` to set the hero image, categories, priority loading, and alt text. The provided set is missing `14.png`, so it is not referenced.

## Supabase Setup

1. Create a Supabase Free project.
2. Run migrations in `supabase/migrations`.
3. Run `supabase/seed/seed.sql` to create the hotel row and the four room
   categories. It contains real launch configuration only — no sample staff, no
   sample guests, and no invented room numbers.
4. Add environment variables from `.env.example` to local `.env.local` and Vercel.
5. Never expose `SUPABASE_SECRET_KEY` to the browser.

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=https://soliefhotel.com
```

The legacy names `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are
still accepted as a fallback so an un-rotated environment keeps working. Remove them
once every deployment target uses the names above.

### Site URL

Production is **https://soliefhotel.com**. `www.soliefhotel.com` returns a 308 to the
apex, and `soliefhotel.vercel.app` remains as the underlying Vercel deployment hostname.

`NEXT_PUBLIC_SITE_URL` is the single source of truth for the public origin: metadata
base, canonical URL, sitemap, robots, OpenGraph, booking-notification links and staff QR
links all derive from it (`src/lib/site.ts`). Changing the domain is a change to this
variable plus a redeploy — no code change.

`NEXT_PUBLIC_*` values are inlined at build time. The optional server-only `SITE_URL`
is read at request time, so set it too if server-rendered links need to follow a domain
change before the next build.

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

## Booking Notification Email

Production sends booking notifications over Gmail SMTP with a Google App Password —
no third-party email API.

```bash
SMTP_USER=hsolief@gmail.com
SMTP_PASS=<Google App Password, never the account password>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
BOOKING_EMAIL_TO=hsolief@gmail.com,fayzullayevquvonch00@gmail.com
```

`BOOKING_EMAIL_TO` accepts a comma-separated list. Recipients are de-duplicated
server-side (case-insensitively) across `BOOKING_EMAIL_TO`, `BOOKING_EMAIL_CC` and
`HOTEL_OWNER_EMAIL`, and one email is sent to all of them.

`RESEND_API_KEY` remains supported as a fallback transport and is used only when SMTP
is not configured.

**Booking requests are saved before any notification is attempted.** If email is not
configured or delivery fails, the request still exists in Supabase, a `notifications`
row records `manual_required` or `failed`, the guest still receives a booking
reference, and staff can see the request in `/admin/booking-requests`. A guest is never
told their request was received unless it was actually stored.

## Supabase Auth SMTP

Supabase's built-in Auth email sender is rate-limited and should not be used for production password resets/invites. Configure custom SMTP in Supabase Dashboard:

1. Open Supabase Dashboard → Authentication → SMTP Settings.
2. Enable custom SMTP.
3. Use a verified provider/domain, for example Resend SMTP.
4. Send a test email from Supabase.
5. Keep SMTP credentials in Supabase, not in this repository.

This is separate from the booking-notification transport above.

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
- `/admin/website`
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

## Supabase Migrations

Apply migrations in `supabase/migrations/` in filename order, before deploying code
that calls the RPCs below. Never edit an applied migration — add a new forward one.

Every migration is **non-destructive to business data**. Removing development seed data
is a separate, audited step (see below) rather than something that happens silently on
deploy.

### Testing migrations before applying them

`supabase/tests/run-migrations.sh` stands up a throwaway PostgreSQL 16 database, applies
the Supabase-shaped harness, runs every migration and the seed in order, and asserts the
resulting schema — columns, tables, RLS policies, the RPC signature swap, the storage
bucket, the four confirmed room categories, and that the range constraints actually
reject bad values.

```bash
brew install postgresql@16
./supabase/tests/run-migrations.sh
```

Run this before touching a real project. It catches SQL that only looks correct when
read — an earlier revision of these migrations created a unique index before the
de-duplication that index would have rejected.

### Removing development seed data

```bash
npm run cleanup-demo-data              # preview, changes nothing
node scripts/cleanup-demo-data.mjs --apply
```

Preview first, and back up before applying. A seeded record is deleted only if it still
carries the exact original fingerprint **and** nothing references it. References are
checked across all five tables that can point at a staff member before anything is
removed; a dependent row is never deleted to make a parent deletable, and
`booking_requests.assigned_staff_id` is never nulled out. Anything referenced is
reported as preserved for human review. The decision logic lives in
`scripts/seed-fingerprints.mjs` and is unit-tested in `tests/unit/seed-cleanup.test.ts`.

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

Operational content the hotel changes regularly is **owner-editable in
`/admin/website`** and needs no deploy:

- contact details (phone, email, address, WhatsApp, Telegram, Google Maps)
- check-in / check-out times
- Google rating, review count and reviews link
- room category names, descriptions, nightly UZS price, capacity, active state
- which amenities are currently offered
- UZS→USD and UZS→EUR display rates
- hotel photography (upload/remove, stored in the `hotel-media` Supabase bucket)

Admin and manager can change these; receptionist has read-only access. Every change is
authorized server-side and written to the audit log.

The public site reads this through `src/lib/public/siteData.ts`, a server-only module
that returns a sanitized, visitor-safe shape. If the database is unreachable, the page
falls back to the bundled launch content rather than returning a 500 — but a booking
submission has no such fallback and fails loudly instead.

Design content (photography, long-form copy, FAQ, amenity catalogue and icons) stays in
the repository:

- `src/content/siteContent.ts`
- `src/content/contact.ts`
- `src/content/rooms.ts`
- `src/content/amenities.ts`
- `src/content/faq.ts`
- `src/content/images.ts`

Translations live in:

- `src/i18n/en.ts`
- `src/i18n/ru.ts`
- `src/i18n/uz.ts`
- `src/i18n/admin.ts`

## Vercel

Add all variables from `.env.example` in Vercel Project Settings. The app is compatible with Vercel serverless functions.

## Booking RPC compatibility

`src/app/api/booking-request/route.ts` calls `create_public_booking_request` with the
16-argument signature introduced in migration `202609220001`. If that migration has not
been applied yet, the call fails with PostgREST `PGRST202` and the booking would be lost,
so the route retries once with the original 12-argument signature — on a
signature-missing error only. Any other database error still fails closed, and a guest is
never told a request was received when it was not.

While the fallback is active the booking persists without its price snapshot. Once
`202609220001` is applied the fallback stops firing (a `console.warn` marks each time it
does) and can be removed.

## Booking Model

This is **not** an instant reservation engine and has no payment integration:

```
booking request → hotel reviews manually → hotel confirms with the guest
```

The site never tells a guest a room is confirmed. Any displayed total is labelled an
estimate, and the server calculates it from the configured category price rather than
trusting anything the browser sends. See `PAYMENT_READINESS_NOTES.md`.

## Still With the Owner

- Real physical room numbers for `/admin/rooms`. The seeded sample rooms were removed
  rather than replaced with invented ones; the table is intentionally empty until the
  hotel enters its own.
- Booking.com, Instagram and Facebook profiles. These are empty in
  `src/content/contact.ts` and are hidden in the UI rather than rendered as dead links.
  No profile is invented.
- `public/images/14.png` is absent and excluded via `missingImageIds`; supply it only if
  a complete 1–35 set is wanted.
