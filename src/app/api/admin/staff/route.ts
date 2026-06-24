import { NextResponse } from "next/server";
import { staffSchema } from "@/lib/crm/validation";
import { withRole, insertAudit } from "@/lib/crm/api";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service.from("staff_members").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const parsed = staffSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const row = {
      full_name: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      role: input.role,
      status: input.status,
      notes: input.notes || null,
      created_by: profile.id,
      updated_by: profile.id
    };
    const { data, error } = await service.from("staff_members").insert(row).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "create", "staff_members", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
