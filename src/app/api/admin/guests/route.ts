import { NextResponse } from "next/server";
import { withRole, insertAudit } from "@/lib/crm/api";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service.from("guests").select("*, stays(id,status,expected_check_in,expected_check_out)").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ profile, service }) => {
    const body = await request.json();
    if (!body.fullName) return NextResponse.json({ ok: false, error: "Full name required" }, { status: 400 });
    const row = {
      full_name: body.fullName,
      phone: body.phone || null,
      email: body.email || null,
      preferred_language: body.preferredLanguage || null,
      preferred_contact: body.preferredContact || null,
      country: body.country || null,
      notes: body.notes || null
    };
    const { data, error } = await service.from("guests").insert(row).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "create", "guests", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
