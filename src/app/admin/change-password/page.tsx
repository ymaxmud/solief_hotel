import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Locale } from "@/types";
import { getAdminDictionary } from "@/i18n/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("app_users")
    .select("is_active")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_active) redirect("/admin/login");

  const cookieStore = await cookies();
  const locale = ((cookieStore.get("solief-admin-locale")?.value || "en") as Locale);
  const t = getAdminDictionary(locale);

  return (
    <main className="grid min-h-screen place-items-center bg-treeGreen px-4">
      <div className="w-full max-w-md rounded-lg bg-[#f7f4ed] p-6 shadow-glow">
        <p className="font-display text-4xl text-charcoal">{t.changePassword}</p>
        <p className="mt-2 text-sm text-greenGray">{t.changePasswordIntro}</p>
        <ChangePasswordForm t={t} />
      </div>
    </main>
  );
}
