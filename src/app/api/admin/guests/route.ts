import { NextResponse } from "next/server";
import { withRole, insertAudit } from "@/lib/crm/api";
import { createGuestSchema } from "@/lib/crm/validation";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service.from("guests").select("*, stays(id,status,expected_check_in,expected_check_out)").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ profile, service }) => {
    const parsed = createGuestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid guest", errors: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const row = {
      full_name: input.fullName,
      phone: input.phone || null,
      email: input.email || null,
      preferred_language: input.preferredLanguage || null,
      preferred_contact: input.preferredContact || null,
      country: input.country || null,
      notes: input.notes || null
    };
    const { data, error } = await service.from("guests").insert(row).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "create", "guests", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
