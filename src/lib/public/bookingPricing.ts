import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rooms as fallbackRooms } from "@/content/rooms";
import { nightsBetween } from "@/lib/payment";

/**
 * Server-side booking price snapshot.
 *
 * The browser is never trusted for the price, the room name or the room id's
 * meaning. The server resolves the submitted slug against the active configured
 * categories and recalculates the total itself.
 *
 * This is an ESTIMATE recorded at submission time. It is not a payment, and it
 * is not a promise that the room is available — the hotel confirms both.
 */
export type BookingPriceSnapshot = {
  roomCategoryId: string | null;
  /** The category's own name, used in the CRM and the notification email. */
  roomLabel: string;
  nightlyPriceUzs: number | null;
  nights: number;
  estimatedTotalUzs: number | null;
  /** Maximum guests for the resolved category, when one is configured. */
  capacity: number | null;
};

type CategoryRow = {
  id: string;
  slug: string | null;
  name_en: string | null;
  base_price_uzs: number | string | null;
  capacity: number | null;
  is_active: boolean | null;
};

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Resolve the submitted room against the database, falling back to the bundled
 * room content when the category table cannot be read.
 *
 * Returns null when the slug does not match any active category — the caller
 * rejects the request rather than saving a booking against an unknown room.
 */
export async function buildBookingSnapshot(
  service: SupabaseClient,
  input: { roomId?: string; roomType: string; checkIn: string; checkOut: string }
): Promise<BookingPriceSnapshot | null> {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights <= 0) return null;

  const { data, error } = await service
    .from("room_categories")
    .select("id,slug,name_en,base_price_uzs,capacity,is_active")
    .eq("is_active", true);

  if (error) {
    // The categories table is unavailable. Price from the bundled content so a
    // guest can still submit a request, and record no category id rather than
    // guessing one.
    console.error("[booking-pricing] Could not read room categories", { error: error.message });
    const room = fallbackRooms.find((item) => item.id === input.roomId);
    if (!room) return null;
    return {
      roomCategoryId: null,
      roomLabel: room.name.en,
      nightlyPriceUzs: room.priceUzs,
      nights,
      estimatedTotalUzs: room.priceUzs * nights,
      capacity: room.capacity
    };
  }

  const categories = (data as CategoryRow[] | null) ?? [];
  const match = input.roomId ? categories.find((row) => row.slug === input.roomId) : undefined;
  if (!match) return null;

  const nightly = toNumber(match.base_price_uzs);
  const hasPrice = nightly !== null && nightly > 0;

  return {
    roomCategoryId: match.id,
    roomLabel: match.name_en?.trim() || input.roomType,
    nightlyPriceUzs: hasPrice ? nightly : null,
    nights,
    // No configured price means no estimate — better than quoting zero.
    estimatedTotalUzs: hasPrice ? nightly * nights : null,
    capacity: match.capacity && match.capacity > 0 ? match.capacity : null
  };
}
