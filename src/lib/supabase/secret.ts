import "server-only";

/**
 * The Supabase secret key. Server only.
 *
 * Kept in its own `server-only` module rather than alongside the browser-safe
 * helpers so it can never be pulled into a client bundle. Next.js does not
 * inline non-`NEXT_PUBLIC_` values, so the key itself could not leak either way,
 * but bundling the accessor shipped dead server code and the shape of the server
 * configuration to the browser.
 *
 * Accepts the legacy SUPABASE_SERVICE_ROLE_KEY as a transitional fallback;
 * remove it once every deployment target uses SUPABASE_SECRET_KEY.
 */
export function getSupabaseSecretKey() {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase secret key must never be read in the browser.");
  }
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing required environment variable: SUPABASE_SECRET_KEY");
  return key;
}
