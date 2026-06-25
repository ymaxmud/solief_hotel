import { StaffAttendanceClient } from "@/components/admin/StaffAttendanceClient";
import { getAdminDictionary, type AdminDictionary } from "@/i18n/admin";
import type { Locale } from "@/types";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function StaffAttendancePage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("solief-admin-locale")?.value || "en") as Locale;
  return <StaffAttendanceClient labels={getAdminDictionary(locale) as AdminDictionary} />;
}
