import { StaffAttendanceClient } from "@/components/admin/StaffAttendanceClient";
import { getAdminDictionary, type AdminDictionary } from "@/i18n/admin";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Locale } from "@/types";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function StaffAttendancePage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("solief-admin-locale")?.value || "en") as Locale;
  const service = createSupabaseServiceClient();
  const { data } = await service.from("staff_members").select("id,full_name").eq("status", "active").order("full_name");
  return <StaffAttendanceClient staff={data || []} labels={getAdminDictionary(locale) as AdminDictionary} />;
}
