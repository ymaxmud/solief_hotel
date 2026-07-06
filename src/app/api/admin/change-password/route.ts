import { NextResponse } from "next/server";
import { changePasswordSchema } from "@/lib/crm/validation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/crm/auth";
import { apiError } from "@/lib/crm/api";

const blockedPasswords = new Set(["1234demo", "password", "password123", "solief1234", "admin123456"]);

export async function POST(request: Request) {
  const parsed = changePasswordSchema.safeParse(await request.json());
  if (!parsed.success || blockedPasswords.has(parsed.success ? parsed.data.password.toLowerCase() : "")) {
    return NextResponse.json({ ok: false, error: "Use a stronger password with at least 12 characters, letters, and numbers." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (updateError) return apiError("change-password", updateError, { status: 400, message: "Could not update the password. Ensure it meets the requirements and differs from your current one." });

  const service = createSupabaseServiceClient();
  let { data, error } = await service
    .from("app_users")
    .update({
      force_password_change: false,
      last_password_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id)
    .select("id,email,role,force_password_change")
    .single();

  if (error && isMissingHardeningColumn(error)) {
    const fallback = await service
      .from("app_users")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select("id,email,role")
      .single();
    data = fallback.data ? { ...fallback.data, force_password_change: false } : null;
    error = fallback.error;
  }

  if (error) return NextResponse.json({ ok: false, error: "Password changed, but profile update failed. Contact an administrator." }, { status: 500 });
  await logAudit({ request, actorUserId: user.id, action: "change_password", entityType: "app_users", entityId: user.id, after: data });
  return NextResponse.json({ ok: true });
}

function isMissingHardeningColumn(error: { code?: string; message?: string }) {
  return error.code === "42703" || /force_password_change|last_password_reset_at/i.test(error.message || "");
}
