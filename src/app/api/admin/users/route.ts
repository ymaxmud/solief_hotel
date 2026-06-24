import { NextResponse } from "next/server";
import { createUserSchema } from "@/lib/crm/validation";
import { withRole, insertAudit } from "@/lib/crm/api";

export async function GET(request: Request) {
  return withRole(request, ["admin"], async ({ service }) => {
    const { data, error } = await service.from("app_users").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin"], async ({ profile, service }) => {
    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName, role: input.role }
    });
    if (createError || !created.user) return NextResponse.json({ ok: false, error: createError?.message || "Could not create user" }, { status: 500 });

    const row = {
      id: created.user.id,
      email: input.email,
      full_name: input.fullName,
      role: input.role,
      is_active: true
    };
    const { error } = await service.from("app_users").insert(row);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "create", "app_users", created.user.id, row);
    return NextResponse.json({ ok: true, data: row });
  });
}
