import { NextResponse } from "next/server";
import { withRole, insertAudit } from "@/lib/crm/api";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service.from("rooms").select("*, room_categories(name_en,name_ru,name_uz)").order("room_number");
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  });
}

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ ok: false, error: "Room id required" }, { status: 400 });
    const update = {
      status: body.status,
      cleaning_status: body.cleaningStatus,
      notes: body.notes,
      updated_by: profile.id
    };
    const { data, error } = await service.from("rooms").update(update).eq("id", body.id).select("*").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "update", "rooms", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
