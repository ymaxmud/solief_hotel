"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl } from "./keys";

export function createSupabaseBrowserClient() {
  // Publishable key only — the secret key is never exposed to the browser.
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}
