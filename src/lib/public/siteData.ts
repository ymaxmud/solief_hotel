import "server-only";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import type { Room } from "@/types";
import { getFallbackSiteData, toE164, type PublicSiteData } from "./types";
import { rooms as fallbackRooms } from "@/content/rooms";
import { amenities as amenityCatalogue } from "@/content/amenities";
import { normalizeCurrencyRates } from "@/lib/currency";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type HotelRow = {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp_url: string | null;
  telegram_url: string | null;
  google_maps_url: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  google_rating: number | string | null;
  google_review_count: number | null;
  google_reviews_url: string | null;
  usd_rate_uzs: number | string | null;
  eur_rate_uzs: number | string | null;
};

type RoomCategoryRow = {
  slug: string | null;
  name_en: string | null;
  name_ru: string | null;
  name_uz: string | null;
  description_en: string | null;
  description_ru: string | null;
  description_uz: string | null;
  base_price_uzs: number | string | null;
  capacity: number | null;
  area_sqm: number | null;
  display_order: number | null;
  is_active: boolean | null;
};

const HOTEL_COLUMNS =
  "name,address,phone,email,whatsapp_url,telegram_url,google_maps_url,check_in_time,check_out_time,google_rating,google_review_count,google_reviews_url,usd_rate_uzs,eur_rate_uzs";

const ROOM_CATEGORY_COLUMNS =
  "slug,name_en,name_ru,name_uz,description_en,description_ru,description_uz,base_price_uzs,capacity,area_sqm,display_order,is_active";

/**
 * Log a recurring read failure once per distinct cause per process.
 *
 * While a migration is pending, a failing settings read happens on every single
 * request. Logging each one buries real errors in the runtime log, so identical
 * causes are reported once and then suppressed until the cause changes.
 */
const reportedFailures = new Set<string>();

function reportReadFailure(scope: string, message: string) {
  const key = `${scope}:${message}`;
  if (reportedFailures.has(key)) return;
  reportedFailures.add(key);
  console.error(`[public-site-data] ${scope}`, { error: message, note: "further identical failures suppressed" });
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Reject anything that is not an http(s) URL, so a bad admin entry can never
 *  put a `javascript:` or `data:` href into a public link. */
function safeUrl(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

function safeRating(value: number | null) {
  if (value === null || value < 0 || value > 5) return null;
  return Math.round(value * 10) / 10;
}

function safeReviewCount(value: number | null) {
  if (value === null || !Number.isInteger(value) || value < 0) return null;
  return value;
}

/**
 * Merge database room categories onto the bundled room content.
 *
 * Photography, bed type, amenity keys and the localized long copy stay in the
 * repository — they are design assets, not operational settings. Price,
 * capacity, names and active state come from the database so the hotel can
 * change a rate without a deploy.
 */
export function mergeRooms(categories: RoomCategoryRow[], baseRooms: Room[] = fallbackRooms): Room[] {
  const bySlug = new Map(categories.filter((row) => row.slug).map((row) => [row.slug as string, row]));
  const merged = baseRooms
    .map((room) => {
      const row = bySlug.get(room.id);
      if (!row) return room;
      if (row.is_active === false) return null;
      const price = toNumber(row.base_price_uzs);
      return {
        ...room,
        name: {
          en: row.name_en?.trim() || room.name.en,
          ru: row.name_ru?.trim() || room.name.ru,
          uz: row.name_uz?.trim() || room.name.uz
        },
        description: {
          en: row.description_en?.trim() || room.description.en,
          ru: row.description_ru?.trim() || room.description.ru,
          uz: row.description_uz?.trim() || room.description.uz
        },
        priceUzs: price !== null && price > 0 ? price : room.priceUzs,
        capacity: row.capacity && row.capacity > 0 ? row.capacity : room.capacity,
        areaSqm: row.area_sqm && row.area_sqm > 0 ? row.area_sqm : room.areaSqm
      } satisfies Room;
    })
    .filter((room): room is Room => room !== null);

  // If the hotel deactivated every category, keep the bundled rooms rather than
  // rendering an empty rooms section.
  return merged.length ? merged : baseRooms;
}

/**
 * Read the public website configuration.
 *
 * Wrapped in React's `cache` so the root layout (structured data) and the page
 * (rendered content) share a single database read per request instead of two.
 *
 * Runs on the server with the secret key, so no CRM table is exposed to the
 * browser through RLS. A read failure is logged and falls back to the bundled
 * launch content — the homepage must not 500 because a non-essential settings
 * read failed. Booking submission has no such fallback: it fails loudly rather
 * than telling a guest their request was received.
 */
export const getPublicSiteData = cache(async function getPublicSiteData(): Promise<PublicSiteData> {
  // Owner edits in /admin/website must appear immediately.
  noStore();
  const fallback = getFallbackSiteData();

  let service: ReturnType<typeof createSupabaseServiceClient>;
  try {
    service = createSupabaseServiceClient();
  } catch (error) {
    reportReadFailure("Supabase is not configured", error instanceof Error ? error.message : "unknown");
    return fallback;
  }

  const [hotelResult, categoryResult, amenityResult] = await Promise.all([
    service.from("hotels").select(HOTEL_COLUMNS).order("created_at", { ascending: true }).limit(1).maybeSingle(),
    service.from("room_categories").select(ROOM_CATEGORY_COLUMNS).order("display_order", { ascending: true }),
    service.from("hotel_amenities").select("amenity_key,is_active")
  ]);

  if (hotelResult.error) {
    reportReadFailure("Could not read hotel settings", hotelResult.error.message);
    return fallback;
  }
  if (categoryResult.error) {
    reportReadFailure("Could not read room categories", categoryResult.error.message);
  }
  if (amenityResult.error) {
    reportReadFailure("Could not read hotel amenities", amenityResult.error.message);
  }

  const hotel = hotelResult.data as HotelRow | null;
  if (!hotel) return fallback;

  const categories = (categoryResult.data as RoomCategoryRow[] | null) ?? [];
  const amenityRows = (amenityResult.data as { amenity_key: string; is_active: boolean }[] | null) ?? [];

  // An amenity is shown unless the hotel explicitly switched it off, so an
  // empty table means "everything in the catalogue is available".
  const disabled = new Set(amenityRows.filter((row) => !row.is_active).map((row) => row.amenity_key));
  const activeAmenityIds = amenityCatalogue.map((amenity) => amenity.id).filter((id) => !disabled.has(id));

  const phoneDisplay = hotel.phone?.trim() || fallback.phone;

  return {
    hotelName: hotel.name?.trim() || fallback.hotelName,
    phone: phoneDisplay,
    phoneE164: toE164(phoneDisplay),
    email: hotel.email?.trim() || fallback.email,
    address: hotel.address?.trim() || fallback.address,
    whatsappUrl: safeUrl(hotel.whatsapp_url, fallback.whatsappUrl),
    telegramUrl: safeUrl(hotel.telegram_url, fallback.telegramUrl),
    googleMapsUrl: safeUrl(hotel.google_maps_url, fallback.googleMapsUrl),
    checkIn: hotel.check_in_time?.trim() || fallback.checkIn,
    checkOut: hotel.check_out_time?.trim() || fallback.checkOut,
    googleRating: safeRating(toNumber(hotel.google_rating)),
    googleReviewCount: safeReviewCount(hotel.google_review_count),
    googleReviewsUrl: safeUrl(hotel.google_reviews_url, fallback.googleReviewsUrl),
    currencyRates: normalizeCurrencyRates({
      USD: toNumber(hotel.usd_rate_uzs) ?? undefined,
      EUR: toNumber(hotel.eur_rate_uzs) ?? undefined
    }),
    rooms: mergeRooms(categories),
    activeAmenityIds,
    fromDatabase: true
  };
});
