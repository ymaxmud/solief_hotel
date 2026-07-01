import { redirect } from "next/navigation";
import type { UserRole, AppUser } from "@/types/crm";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function getCurrentUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("app_users")
    .select("id,email,full_name,role,is_active,force_password_change")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    const { data: fallbackProfile } = await supabase
      .from("app_users")
      .select("id,email,full_name,role,is_active")
      .eq("id", user.id)
      .maybeSingle();
    if (!fallbackProfile || !fallbackProfile.is_active) return null;
    return { ...fallbackProfile, force_password_change: false } as AppUser;
  }

  if (!profile || !profile.is_active) return null;
  return profile as AppUser;
}

export async function requireUser() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/admin/login");
  if (profile.force_password_change) redirect("/admin/change-password");
  return profile;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await requireUser();
  if (!allowedRoles.includes(profile.role)) redirect("/admin/dashboard");
  return profile;
}

export async function requireApiRole(allowedRoles: UserRole[]) {
  const profile = await getCurrentUserProfile();
  if (!profile) return { ok: false as const, status: 401, error: "Unauthorized" };
  if (!allowedRoles.includes(profile.role)) return { ok: false as const, status: 403, error: "Forbidden" };
  return { ok: true as const, profile };
}

export async function logAudit(input: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  request?: Request;
}) {
  const service = createSupabaseServiceClient();
  await service.from("audit_logs").insert({
    actor_user_id: input.actorUserId || null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId || null,
    before_json: input.before || null,
    after_json: input.after || null,
    ip_address: input.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    user_agent: input.request?.headers.get("user-agent") || null
  });
}
