import type { NextConfig } from "next";

// Content Security Policy. The public site embeds a Google Maps iframe and can
// load the Cloudflare Turnstile widget; the admin/staff clients talk to Supabase
// from the browser. 'unsafe-inline' for scripts is required because Next.js
// injects inline hydration bootstrap without a nonce, but external script origins
// are still locked down, and frame-ancestors 'none' blocks clickjacking of the CRM.
// 'unsafe-eval' is added only in development because Next.js dev mode (HMR / React
// Refresh) evaluates code with eval; it is never present in production builds.
const isDev = process.env.NODE_ENV !== "production";
// Vercel Analytics + Speed Insights load their script from va.vercel-scripts.com
// and beacon to vitals.vercel-insights.com when the same-origin proxy is absent.
const scriptSrc = ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", "https://va.vercel-scripts.com"];
if (isDev) scriptSrc.push("'unsafe-eval'");

// Next.js dev HMR uses a websocket to the local server.
const connectSrc = ["'self'", "https://*.supabase.co", "https://challenges.cloudflare.com", "https://va.vercel-scripts.com", "https://vitals.vercel-insights.com"];
if (isDev) connectSrc.push("ws:");

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "frame-src https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Production only: some Chromium builds upgrade the dev HMR ws:// socket to
  // wss:// under this directive, which breaks hot reload locally.
  ...(isDev ? [] : ["upgrade-insecure-requests"])
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Language used to be a ?lang= query parameter on a single URL. It is now a
  // path (/ru, /uz), so keep older shared links and bookmarks working instead of
  // silently dropping them onto the English page. This lives here rather than in
  // middleware deliberately: src/middleware.ts exists only to gate /admin, and
  // widening its matcher would put an auth function in front of every cached
  // public page for no benefit. An unrecognised value matches nothing and simply
  // renders English at /.
  async redirects() {
    return [
      // Next.js carries the original query string through a redirect, so these
      // land on /ru?lang=ru rather than a bare /ru. That is cosmetic only: the
      // page is self-canonical to /ru, so the leftover parameter cannot become a
      // competing URL in search results.
      ...(["ru", "uz"] as const).map((lang) => ({
        source: "/",
        has: [{ type: "query" as const, key: "lang", value: lang }],
        destination: `/${lang}`,
        permanent: true
      })),
      // English is served from the root, but /en is an obvious thing to type or
      // guess. Point it home instead of returning a 404.
      { source: "/en", destination: "/", permanent: true }
    ];
  }
};

export default nextConfig;
