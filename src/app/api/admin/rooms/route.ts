import { NextResponse } from "next/server";
import { withRole, insertAudit, apiError } from "@/lib/crm/api";
import { roomUpdateSchema } from "@/lib/crm/validation";
import { assertCan } from "@/lib/crm/permissions";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service.from("rooms").select("*, room_categories(name_en,name_ru,name_uz)").order("room_number");
    if (error) return apiError("rooms:list", error);
    return NextResponse.json({ ok: true, data });
  });
}

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "room:update");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });
    const parsed = roomUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
    const body = parsed.data;
    // The rooms table has no updated_by column; updated_at is kept current by the
    // rooms_set_updated_at trigger, so we send only the changed fields.
    const update: Record<string, unknown> = {};
    if (body.status) update.status = body.status;
    if (body.cleaningStatus) update.cleaning_status = body.cleaningStatus;
    if (body.notes !== undefined) update.notes = body.notes || null;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: "No changes to save." }, { status: 400 });
    }
    const { data, error } = await service.from("rooms").update(update).eq("id", body.id).select("*").single();
    if (error) return apiError("rooms:update", error);
    await insertAudit(request, profile.id, "update", "rooms", data.id, data);
    return NextResponse.json({ ok: true, data });
  });
}
