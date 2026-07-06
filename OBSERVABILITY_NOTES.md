# Observability

## Enabled now (no action needed on Vercel)
- **Vercel Analytics** — `@vercel/analytics`, mounted in `src/app/layout.tsx`. Collects
  privacy-friendly page views. Same-origin (`/_vercel/insights/*`), so the existing CSP
  covers it. Turn on "Analytics" for the project in the Vercel dashboard to see data.
- **Vercel Speed Insights** — `@vercel/speed-insights`, mounted in the same layout.
  Reports Core Web Vitals from real visitors. Enable "Speed Insights" in the dashboard.

Both are no-ops in local dev and never block the build.

## Sentry (optional, not installed)
Sentry is **not** wired yet, to avoid changing `next.config.ts` (which carries the CSP)
and risking the build. To add it later without breaking anything:

1. `npm install @sentry/nextjs` and run `npx @sentry/wizard@latest -i nextjs`.
2. Provide the DSN via env only — never hardcode it. Use `NEXT_PUBLIC_SENTRY_DSN`
   (already scaffolded, empty, in `.env.example`). Guard init so a missing DSN is a no-op:
   ```ts
   const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
   if (dsn) Sentry.init({ dsn, tracesSampleRate: 0.1 });
   ```
3. Update the CSP `connect-src` in `next.config.ts` to include your Sentry ingest host
   (e.g. `https://*.ingest.sentry.io`) — otherwise the browser will block error reports.
4. The app already logs server-side errors via `apiError()` and the `error.tsx` /
   `global-error.tsx` boundaries; those `console.error` calls are where Sentry capture
   hooks in.
