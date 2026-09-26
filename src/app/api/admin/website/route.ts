import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withRole, insertAudit, apiError } from "@/lib/crm/api";
import { assertCan } from "@/lib/crm/permissions";
import { amenityToggleSchema, roomCategoryUpdateSchema, websiteSettingsSchema } from "@/lib/crm/validation";

/**
 * Drop the cached public pages so an owner edit is visible immediately.
 *
 * The public site is served from the ISR cache for speed; without this, a
 * settings change would not appear until the revalidate ceiling elapsed.
 * Called after every successful mutation.
 */
function refreshPublicSite() {
  revalidatePath("/", "layout");
}

/**
 * Owner-editable public website configuration.
 *
 * Authorization is enforced here, server-side, on every mutation — the admin UI
 * hiding a control is a convenience, never the access check. Each mutation
 * records before/after state in the audit log.
 */

const HOTEL_COLUMNS =
  "id,name,address,phone,email,whatsapp_url,telegram_url,google_maps_url,check_in_time,check_out_time,google_rating,google_review_count,google_reviews_url,usd_rate_uzs,eur_rate_uzs";

const CATEGORY_COLUMNS =
  "id,slug,name_en,name_ru,name_uz,description_en,description_ru,description_uz,base_price_uzs,capacity,area_sqm,display_order,is_active";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const [hotel, categories, amenities] = await Promise.all([
      service.from("hotels").select(HOTEL_COLUMNS).order("created_at", { ascending: true }).limit(1).maybeSingle(),
      service.from("room_categories").select(CATEGORY_COLUMNS).order("display_order", { ascending: true }),
      service.from("hotel_amenities").select("amenity_key,is_active")
    ]);
    if (hotel.error) return apiError("website:read", hotel.error);
    return NextResponse.json({
      ok: true,
      data: {
        hotel: hotel.data,
        roomCategories: categories.data ?? [],
        amenities: amenities.data ?? []
      }
    });
  });
}

export async function PATCH(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "website:manage");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const kind = (body as { kind?: string } | null)?.kind;
    if (kind === "roomCategory") return updateRoomCategory(request, profile.id, service, body);
    if (kind === "amenity") return toggleAmenity(request, profile.id, service, body);
    return updateHotelSettings(request, profile.id, service, body);
  });
}

type Service = Parameters<Parameters<typeof withRole>[2]>[0]["service"];

async function updateHotelSettings(request: Request, actorId: string, service: Service, body: unknown) {
  const parsed = websiteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const input = parsed.data;

  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.phone !== undefined) update.phone = input.phone;
  if (input.email !== undefined) update.email = input.email || null;
  if (input.address !== undefined) update.address = input.address;
  if (input.whatsappUrl !== undefined) update.whatsapp_url = input.whatsappUrl || null;
  if (input.telegramUrl !== undefined) update.telegram_url = input.telegramUrl || null;
  if (input.googleMapsUrl !== undefined) update.google_maps_url = input.googleMapsUrl || null;
  if (input.googleReviewsUrl !== undefined) update.google_reviews_url = input.googleReviewsUrl || null;
  if (input.checkInTime !== undefined) update.check_in_time = input.checkInTime;
  if (input.checkOutTime !== undefined) update.check_out_time = input.checkOutTime;
  if (input.googleRating !== undefined) update.google_rating = input.googleRating;
  if (input.googleReviewCount !== undefined) update.google_review_count = input.googleReviewCount;
  if (input.usdRateUzs !== undefined) update.usd_rate_uzs = input.usdRateUzs;
  if (input.eurRateUzs !== undefined) update.eur_rate_uzs = input.eurRateUzs;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "No changes to save." }, { status: 400 });
  }

  const { data: before } = await service.from("hotels").select(HOTEL_COLUMNS).eq("id", input.id).maybeSingle();
  const { data, error } = await service.from("hotels").update(update).eq("id", input.id).select(HOTEL_COLUMNS).single();
  if (error) return apiError("website:update", error);
  refreshPublicSite();
  await insertAuditWithBefore(request, actorId, "update", "hotels", data.id, before, data);
  return NextResponse.json({ ok: true, data });
}

async function updateRoomCategory(request: Request, actorId: string, service: Service, body: unknown) {
  const parsed = roomCategoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const input = parsed.data;

  const update: Record<string, unknown> = {};
  if (input.nameEn !== undefined) update.name_en = input.nameEn;
  if (input.nameRu !== undefined) update.name_ru = input.nameRu;
  if (input.nameUz !== undefined) update.name_uz = input.nameUz;
  if (input.descriptionEn !== undefined) update.description_en = input.descriptionEn || null;
  if (input.descriptionRu !== undefined) update.description_ru = input.descriptionRu || null;
  if (input.descriptionUz !== undefined) update.description_uz = input.descriptionUz || null;
  if (input.basePriceUzs !== undefined) update.base_price_uzs = input.basePriceUzs;
  if (input.capacity !== undefined) update.capacity = input.capacity;
  if (input.isActive !== undefined) update.is_active = input.isActive;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "No changes to save." }, { status: 400 });
  }

  const { data: before } = await service.from("room_categories").select(CATEGORY_COLUMNS).eq("id", input.id).maybeSingle();
  const { data, error } = await service
    .from("room_categories")
    .update(update)
    .eq("id", input.id)
    .select(CATEGORY_COLUMNS)
    .single();
  if (error) return apiError("website:room-category", error);
  refreshPublicSite();
  await insertAuditWithBefore(request, actorId, "update", "room_categories", data.id, before, data);
  return NextResponse.json({ ok: true, data });
}

async function toggleAmenity(request: Request, actorId: string, service: Service, body: unknown) {
  const parsed = amenityToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const input = parsed.data;

  const { data: hotel } = await service.from("hotels").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (!hotel) return NextResponse.json({ ok: false, error: "Hotel is not configured." }, { status: 400 });

  const { data, error } = await service
    .from("hotel_amenities")
    .upsert({ hotel_id: hotel.id, amenity_key: input.amenityKey, is_active: input.isActive }, { onConflict: "hotel_id,amenity_key" })
    .select("amenity_key,is_active")
    .single();
  if (error) return apiError("website:amenity", error);
  refreshPublicSite();
  await insertAudit(request, actorId, "update", "hotel_amenities", input.amenityKey, data);
  return NextResponse.json({ ok: true, data });
}

/** Audit helper that records the previous row alongside the new one. */
async function insertAuditWithBefore(
  request: Request,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  before: unknown,
  after: unknown
) {
  const { logAudit } = await import("@/lib/crm/auth");
  await logAudit({ request, actorUserId: actorId, action, entityType, entityId, before, after });
}
