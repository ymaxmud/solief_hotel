import { describe, expect, it } from "vitest";
import { amenityToggleSchema, roomCategoryUpdateSchema, websiteSettingsSchema } from "@/lib/crm/validation";
import { can } from "@/lib/crm/permissions";
import { getFallbackSiteData } from "@/lib/public/types";

const HOTEL_ID = "11111111-1111-4111-8111-111111111111";

describe("website settings validation", () => {
  it("accepts a valid settings payload", () => {
    const result = websiteSettingsSchema.safeParse({
      id: HOTEL_ID,
      name: "Solief Hotel",
      phone: "+998983624949",
      email: "hsolief@gmail.com",
      address: "Naqqoshlik 12, 100185, Tashkent, Uzbekistan",
      telegramUrl: "https://t.me/soliefhotel",
      checkInTime: "14:00",
      checkOutTime: "12:00",
      googleRating: 4.2,
      googleReviewCount: 75,
      usdRateUzs: 12600,
      eurRateUzs: 13700
    });
    expect(result.success).toBe(true);
  });

  it("rejects a Google rating outside 0-5", () => {
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, googleRating: 5.1 }).success).toBe(false);
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, googleRating: -0.1 }).success).toBe(false);
  });

  it("rejects a negative review count", () => {
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, googleReviewCount: -1 }).success).toBe(false);
  });

  it("rejects a non-positive currency rate", () => {
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, usdRateUzs: 0 }).success).toBe(false);
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, eurRateUzs: -1 }).success).toBe(false);
  });

  it("rejects a link that is not http(s)", () => {
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, telegramUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, whatsappUrl: "not a url" }).success).toBe(false);
    // An empty value is how the admin clears an unused link.
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, whatsappUrl: "" }).success).toBe(true);
  });

  it("rejects a malformed check-in time", () => {
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, checkInTime: "25:00" }).success).toBe(false);
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, checkInTime: "2pm" }).success).toBe(false);
    expect(websiteSettingsSchema.safeParse({ id: HOTEL_ID, checkInTime: "14:00" }).success).toBe(true);
  });

  it("rejects a negative room price and an out-of-range capacity", () => {
    expect(roomCategoryUpdateSchema.safeParse({ id: HOTEL_ID, basePriceUzs: -1 }).success).toBe(false);
    expect(roomCategoryUpdateSchema.safeParse({ id: HOTEL_ID, capacity: 0 }).success).toBe(false);
    expect(roomCategoryUpdateSchema.safeParse({ id: HOTEL_ID, capacity: 4 }).success).toBe(true);
  });

  it("requires an amenity key", () => {
    expect(amenityToggleSchema.safeParse({ amenityKey: "", isActive: true }).success).toBe(false);
    expect(amenityToggleSchema.safeParse({ amenityKey: "wifi", isActive: false }).success).toBe(true);
  });
});

describe("website settings permissions", () => {
  it("lets an admin and a manager manage the website", () => {
    expect(can("admin", "website:manage")).toBe(true);
    expect(can("manager", "website:manage")).toBe(true);
  });

  it("does not let a receptionist manage the website", () => {
    expect(can("receptionist", "website:manage")).toBe(false);
  });

  it("keeps user management admin-only", () => {
    expect(can("manager", "user:manage")).toBe(false);
    expect(can("receptionist", "user:manage")).toBe(false);
  });
});

describe("public site data shape", () => {
  it("exposes only visitor-facing fields", () => {
    const data = getFallbackSiteData();
    const keys = Object.keys(data).sort();
    expect(keys).toEqual(
      [
        "activeAmenityIds",
        "address",
        "checkIn",
        "checkOut",
        "currencyRates",
        "email",
        "fromDatabase",
        "googleMapsUrl",
        "googleRating",
        "googleReviewCount",
        "googleReviewsUrl",
        "hotelName",
        "phone",
        "phoneE164",
        "rooms",
        "telegramUrl",
        "whatsappUrl"
      ].sort()
    );
    // Nothing operational or secret may leak into the client payload.
    const serialized = JSON.stringify(data);
    for (const forbidden of ["service_role", "sb_secret", "SUPABASE", "password", "staff_member", "audit"]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("uses the confirmed launch contact details", () => {
    const data = getFallbackSiteData();
    expect(data.phoneE164).toBe("+998983624949");
    expect(data.telegramUrl).toBe("https://t.me/soliefhotel");
    expect(data.whatsappUrl).toContain("wa.me/998983624949");
    expect(data.email).toBe("hsolief@gmail.com");
  });

  it("ships the four confirmed room categories at their confirmed prices", () => {
    const data = getFallbackSiteData();
    expect(data.rooms.map((room) => [room.id, room.priceUzs])).toEqual([
      ["standard-double-twin", 500_000],
      ["twin-suite", 650_000],
      ["deluxe-triple", 700_700],
      ["deluxe-quadruple", 1_000_000]
    ]);
  });
});
