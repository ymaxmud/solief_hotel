import { cookies } from "next/headers";
import type { Locale } from "@/types";
import { getAdminDictionary } from "@/i18n/admin";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const locale = ((cookieStore.get("solief-admin-locale")?.value || "en") as Locale);
  const t = getAdminDictionary(locale);
  return (
    <main className="grid min-h-screen place-items-center bg-treeGreen px-4">
      <div className="w-full max-w-md rounded-lg bg-[#f7f4ed] p-6 shadow-glow">
        <p className="font-display text-4xl text-charcoal">Solief CRM</p>
        <p className="mt-2 text-sm text-greenGray">{t.protected}</p>
        <AdminLoginForm t={t} />
      </div>
    </main>
  );
}
