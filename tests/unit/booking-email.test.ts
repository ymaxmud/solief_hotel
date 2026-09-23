import { afterEach, describe, expect, it, vi } from "vitest";
import { buildBookingNotification, getBookingRecipients } from "@/lib/crm/email";
import type { BookingFormValues } from "@/lib/schema";
import type { BookingPriceSnapshot } from "@/lib/public/bookingPricing";

const booking: BookingFormValues = {
  name: "E2E Solief Test",
  phone: "+998901234567",
  email: "guest@example.com",
  checkIn: "2027-07-01",
  checkOut: "2027-07-03",
  guests: 2,
  roomType: "Standard Double or Twin Room",
  roomId: "standard-double-twin",
  language: "EN",
  contactMethod: "Phone",
  message: "Late arrival"
};

const snapshot: BookingPriceSnapshot = {
  roomCategoryId: "category-id",
  roomLabel: "Standard Double or Twin Room",
  nightlyPriceUzs: 500_000,
  nights: 2,
  estimatedTotalUzs: 1_000_000,
  capacity: 2
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("booking notification recipients", () => {
  it("sends one notification to both configured recipients", () => {
    vi.stubEnv("BOOKING_EMAIL_TO", "hsolief@gmail.com,fayzullayevquvonch00@gmail.com");
    vi.stubEnv("BOOKING_EMAIL_CC", "");
    vi.stubEnv("HOTEL_OWNER_EMAIL", "");
    expect(getBookingRecipients()).toEqual(["hsolief@gmail.com", "fayzullayevquvonch00@gmail.com"]);
  });

  it("de-duplicates an address repeated across variables, ignoring case", () => {
    vi.stubEnv("BOOKING_EMAIL_TO", "hsolief@gmail.com, fayzullayevquvonch00@gmail.com");
    vi.stubEnv("BOOKING_EMAIL_CC", "HSolief@Gmail.com");
    vi.stubEnv("HOTEL_OWNER_EMAIL", "hsolief@gmail.com");
    expect(getBookingRecipients()).toEqual(["hsolief@gmail.com", "fayzullayevquvonch00@gmail.com"]);
  });

  it("returns no recipients when nothing is configured", () => {
    vi.stubEnv("BOOKING_EMAIL_TO", "");
    vi.stubEnv("BOOKING_EMAIL_CC", "");
    vi.stubEnv("HOTEL_OWNER_EMAIL", "");
    expect(getBookingRecipients()).toEqual([]);
  });
});

describe("booking notification body", () => {
  it("includes the booking details and the server-side price snapshot", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://soliefhotel.vercel.app");
    const { subject, body } = buildBookingNotification("SOL-20270101-ABCDEF", booking, snapshot);
    expect(subject).toContain("E2E Solief Test");
    for (const expected of [
      "SOL-20270101-ABCDEF",
      "+998901234567",
      "guest@example.com",
      "2027-07-01",
      "2027-07-03",
      "Nights: 2",
      "Guests count: 2",
      "Standard Double or Twin Room",
      "500,000 UZS",
      "1,000,000 UZS",
      "Preferred contact: Phone",
      "Preferred language: EN",
      "Late arrival"
    ]) {
      expect(body).toContain(expected);
    }
  });

  it("states that the request is not a confirmed reservation", () => {
    const { body } = buildBookingNotification("SOL-TEST", booking, snapshot);
    expect(body).toContain("booking REQUEST");
    expect(body).toContain("estimate only");
  });

  it("builds the admin link from the configured site URL, not a hard-coded host", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://soliefhotel.com");
    const { adminUrl, body } = buildBookingNotification("SOL-TEST", booking, snapshot);
    expect(adminUrl).toBe("https://soliefhotel.com/admin/booking-requests");
    expect(body).toContain("https://soliefhotel.com/admin/booking-requests");
    expect(body).not.toContain("vercel.app");
  });

  it("still renders without a price snapshot", () => {
    const { body } = buildBookingNotification("SOL-TEST", booking);
    expect(body).toContain("Standard Double or Twin Room");
    expect(body).not.toContain("Estimated total");
  });
});
