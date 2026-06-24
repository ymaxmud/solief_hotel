import { cookies } from "next/headers";
import type { Locale } from "@/types";
import { getAdminDictionary } from "@/i18n/admin";
import { requireRole, requireUser } from "@/lib/crm/auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/crm";

export async function getAdminPageContext(roles?: UserRole[]) {
  const user = roles ? await requireRole(roles) : await requireUser();
  const cookieStore = await cookies();
  const locale = ((cookieStore.get("solief-admin-locale")?.value || "en") as Locale);
  const t = getAdminDictionary(locale);
  const service = createSupabaseServiceClient();
  return { user, locale, t, service };
}
