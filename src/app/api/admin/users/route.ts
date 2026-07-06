import { NextResponse } from "next/server";
import { createUserSchema, userUpdateSchema } from "@/lib/crm/validation";
import { withRole, insertAudit, apiError } from "@/lib/crm/api";
import { assertCan } from "@/lib/crm/permissions";

export async function GET(request: Request) {
  return withRole(request, ["admin"], async ({ service }) => {
    const { data, error } = await service.from("app_users").select("*").order("created_at", { ascending: false });
    if (error) return apiError("users:list", error);
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "user:manage");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName, role: input.role }
    });
    if (createError || !created.user) return apiError("users:create", createError, { message: "Could not create the user. The email may already be in use." });

    const row = {
      id: created.user.id,
      email: input.email,
      full_name: input.fullName,
      role: input.role,
      is_active: true
    };
    const { error } = await service.from("app_users").insert(row);
    if (error) {
      await service.auth.admin.deleteUser(created.user.id);
      return apiError("users:create-profile", error);
    }
    await insertAudit(request, profile.id, "create", "app_users", created.user.id, row);
    return NextResponse.json({ ok: true, data: row });
  });
}

export async function PATCH(request: Request) {
  return withRole(request, ["admin"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "user:manage");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = userUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;

    const { data: target, error: targetError } = await service.from("app_users").select("*").eq("id", input.id).single();
    if (targetError || !target) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const wouldDeactivate = input.isActive === false;
    const wouldRemoveAdminRole = input.role && input.role !== "admin" && target.role === "admin";
    if ((wouldDeactivate || wouldRemoveAdminRole) && target.id === profile.id) {
      return NextResponse.json({ ok: false, error: "You cannot demote or deactivate your own admin user." }, { status: 400 });
    }

    if ((wouldDeactivate || wouldRemoveAdminRole) && target.role === "admin") {
      const { count } = await service
        .from("app_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("is_active", true);
      if ((count || 0) <= 1) {
        return NextResponse.json({ ok: false, error: "Cannot remove the last active admin." }, { status: 400 });
      }
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.role) update.role = input.role;
    if (input.isActive !== undefined) {
      update.is_active = input.isActive;
      update.deactivated_at = input.isActive ? null : new Date().toISOString();
    }
    if (input.forcePasswordChange !== undefined) update.force_password_change = input.forcePasswordChange;
    if (input.resetPassword) {
      const { error: resetError } = await service.auth.resetPasswordForEmail(target.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://soliefhotel.vercel.app"}/admin/login`
      });
      if (resetError) return apiError("users:reset-password", resetError, { message: "Could not send the reset email. Please try again." });
      update.force_password_change = true;
      update.last_password_reset_at = new Date().toISOString();
    }

    const { data, error } = await service.from("app_users").update(update).eq("id", input.id).select("*").single();
    if (error) return apiError("users:update", error);
    await insertAudit(request, profile.id, "update", "app_users", input.id, { before: target, after: data, resetPassword: Boolean(input.resetPassword) });
    return NextResponse.json({ ok: true, data });
  });
}
