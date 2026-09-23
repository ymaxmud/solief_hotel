/**
 * Supabase environment resolution.
 *
 * Production uses the modern key names. The legacy names are still accepted so
 * an environment that has not been rotated yet keeps working during the
 * transition; they should be removed once every deployment target is updated.
 *
 *   public (browser-safe): NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *
 * This module is safe to import from client components. The secret key lives in
 * ./secret.ts, which is `server-only` so it cannot be bundled for the browser.
 *
 * Note: each `process.env.X` is written out literally rather than looked up
 * through a variable, because Next.js inlines NEXT_PUBLIC_* values at build
 * time by static text replacement.
 */

export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

export function getSupabasePublishableKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  return key;
}

/** True when a browser Supabase client can be constructed. */
export function hasSupabasePublicEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
