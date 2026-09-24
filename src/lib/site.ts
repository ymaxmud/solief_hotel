/**
 * Single source of truth for the public site origin.
 *
 * Set NEXT_PUBLIC_SITE_URL to the live origin (no trailing slash). Everything
 * that needs an absolute URL — metadata base, canonical, sitemap, robots,
 * OpenGraph, booking notification links, staff QR links — derives from here, so
 * moving to the custom domain is an environment change, not a code change.
 */
const FALLBACK_SITE_URL = "https://soliefhotel.com";

function normalizeOrigin(value: string) {
  // Strip trailing slashes so callers can safely template `${siteUrl}/path`
  // without producing `//path` or duplicate-slash canonical URLs.
  return value.trim().replace(/\/+$/, "");
}

export function getSiteUrl() {
  // NEXT_PUBLIC_* values are inlined into the bundle at build time, so a change
  // to NEXT_PUBLIC_SITE_URL only takes effect on the next build. SITE_URL is an
  // optional server-only override that is read at request time, which lets
  // server-rendered output (robots, sitemap, canonical, notification and QR
  // links) follow a domain change without waiting for a rebuild. The client
  // bundle still uses the NEXT_PUBLIC_ value.
  const configured =
    (typeof window === "undefined" ? process.env.SITE_URL : undefined) || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    const normalized = normalizeOrigin(configured);
    try {
      // Reject a malformed value rather than letting `new URL()` throw later
      // inside Next.js metadata resolution and take the whole page down.
      return new URL(normalized).origin;
    } catch {
      // fall through to the default below
    }
  }
  // Vercel exposes the deployment host for previews, where no custom site URL
  // is configured. Use it so preview builds link to themselves.
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelUrl) return `https://${normalizeOrigin(vercelUrl)}`;
  return FALLBACK_SITE_URL;
}

/** Absolute URL for a site-relative path, e.g. absoluteUrl("/admin") */
export function absoluteUrl(path: string) {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
