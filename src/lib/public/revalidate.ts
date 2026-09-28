import { revalidatePath } from "next/cache";
import { INTL_LOCALES } from "@/lib/i18n/routing";

/**
 * Drop the cached public pages so an owner edit is visible immediately.
 *
 * The public site is served from the ISR cache for speed; without this, a
 * settings change would not appear until the revalidate ceiling elapsed.
 *
 * English and the other languages live in separate root layouts — that is what
 * lets /ru and /uz set their own <html lang>. Measured against Next 15.5,
 * revalidatePath("/", "layout") does clear all of them, but that breadth is not
 * something the API documents, so each localized root is named explicitly: the
 * calls are cheap, and the alternative failure is an owner watching their edit
 * appear in English while the Russian page stays stale for an hour.
 */
export function refreshPublicSite() {
  revalidatePath("/", "layout");
  for (const locale of INTL_LOCALES) revalidatePath(`/${locale}`, "layout");
}
