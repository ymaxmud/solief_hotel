/**
 * Supabase environment resolution.
 *
 * Production uses the modern key names. The legacy names are still accepted so
 * an environment that has not been rotated yet keeps working during the
 * transition; they should be removed once every deployment target is updated.
 *
 *   public (browser-safe): NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *   server-only secret:    SUPABASE_SECRET_KEY                   (legacy: SUPABASE_SERVICE_ROLE_KEY)
 *
 * The secret key must never reach the browser. It is only read by
 * getSupabaseSecretKey(), which is called from server-only modules.
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

export function getSupabaseSecretKey() {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase secret key must never be read in the browser.");
  }
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing required environment variable: SUPABASE_SECRET_KEY");
  return key;
}

/** True when a browser Supabase client can be constructed. */
export function hasSupabasePublicEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
