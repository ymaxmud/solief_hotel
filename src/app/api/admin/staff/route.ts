import { NextResponse } from "next/server";
import { staffSchema, staffUpdateSchema } from "@/lib/crm/validation";
import { withRole, insertAudit } from "@/lib/crm/api";
import { assertCan } from "@/lib/crm/permissions";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service.from("staff_members").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "staff:manage");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
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

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "staff:manage");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = staffUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const { data: before } = await service.from("staff_members").select("*").eq("id", input.id).single();
    const update: Record<string, unknown> = { updated_by: profile.id, updated_at: new Date().toISOString() };
    if (input.fullName !== undefined) update.full_name = input.fullName;
    if (input.email !== undefined) update.email = input.email || null;
    if (input.phone !== undefined) update.phone = input.phone || null;
    if (input.role !== undefined) update.role = input.role;
    if (input.status !== undefined) update.status = input.status;
    if (input.notes !== undefined) update.notes = input.notes || null;

    const { data, error } = await service.from("staff_members").update(update).eq("id", input.id).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    if (input.attendancePin) {
      const { error: pinError } = await service.rpc("set_staff_attendance_pin", {
        p_staff_member_id: input.id,
        p_pin: input.attendancePin
      });
      if (pinError) return NextResponse.json({ ok: false, error: pinError.message }, { status: 400 });
    }

    await insertAudit(request, profile.id, "update", "staff_members", input.id, { before, after: data, pinChanged: Boolean(input.attendancePin) });
    return NextResponse.json({ ok: true, data });
  });
}
