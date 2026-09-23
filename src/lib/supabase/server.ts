import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "./keys";
import { getSupabaseSecretKey } from "./secret";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot set cookies. Middleware and route handlers can.
          }
        }
      }
    }
  );
}

export function createSupabaseServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase service-role client cannot be created in the browser.");
  }
  return createClient(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
