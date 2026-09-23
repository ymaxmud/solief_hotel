import type { Room } from "@/types";
import { rooms as fallbackRooms } from "@/content/rooms";
import { amenities as amenityCatalogue } from "@/content/amenities";
import { contact as fallbackContact } from "@/content/contact";
import { siteConfig } from "@/content/siteContent";
import { defaultCurrencyRates, type CurrencyRates } from "@/lib/currency";

/**
 * Sanitized public site data — the only hotel configuration the browser ever
 * receives. Operational CRM fields (staff, guests, internal notes) are never
 * part of this shape.
 *
 * This module is intentionally free of server-only imports so client components
 * can share the type and the launch defaults.
 */
export type PublicSiteData = {
  hotelName: string;
  phone: string;
  phoneE164: string;
  email: string;
  address: string;
  whatsappUrl: string;
  telegramUrl: string;
  googleMapsUrl: string;
  checkIn: string;
  checkOut: string;
  /** Null when no valid rating is configured — the UI and the structured data
   *  both omit the rating rather than showing a made-up number. */
  googleRating: number | null;
  googleReviewCount: number | null;
  googleReviewsUrl: string;
  currencyRates: CurrencyRates;
  rooms: Room[];
  activeAmenityIds: string[];
  /** True when the values came from the database rather than these defaults.
   *  Server-side diagnostics only. */
  fromDatabase: boolean;
};

export function toE164(display: string) {
  const digits = display.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

/** Bundled launch defaults, used when the database is unreachable or empty. */
export function getFallbackSiteData(): PublicSiteData {
  return {
    hotelName: siteConfig.hotelName,
    phone: fallbackContact.phone,
    phoneE164: toE164(fallbackContact.phone),
    email: fallbackContact.email,
    address: fallbackContact.address,
    whatsappUrl: fallbackContact.whatsappUrl,
    telegramUrl: fallbackContact.telegramUrl,
    googleMapsUrl: fallbackContact.googleMapsUrl,
    checkIn: siteConfig.checkIn,
    checkOut: siteConfig.checkOut,
    googleRating: siteConfig.rating,
    googleReviewCount: siteConfig.reviewCount,
    googleReviewsUrl: fallbackContact.googleMapsProfileUrl,
    currencyRates: defaultCurrencyRates,
    rooms: fallbackRooms,
    activeAmenityIds: amenityCatalogue.map((amenity) => amenity.id),
    fromDatabase: false
  };
}
