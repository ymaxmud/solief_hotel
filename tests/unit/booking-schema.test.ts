import { describe, expect, it } from "vitest";
import { bookingSchema, quickBookingSchema } from "@/lib/schema";

const validBooking = {
  name: "Demo Guest",
  phone: "+998901234567",
  email: "",
  checkIn: "2026-07-01",
  checkOut: "2026-07-03",
  guests: 2,
  roomType: "Standard Double Room",
  language: "EN",
  contactMethod: "Phone",
  message: ""
};

describe("bookingSchema", () => {
  it("rejects checkout before checkin", () => {
    const result = bookingSchema.safeParse({ ...validBooking, checkOut: "2026-06-30" });
    expect(result.success).toBe(false);
  });

  it("requires phone or email", () => {
    const result = bookingSchema.safeParse({ ...validBooking, phone: "", email: "" });
    expect(result.success).toBe(false);
  });

  it("quick booking rejects checkout before checkin", () => {
    const result = quickBookingSchema.safeParse({
      checkIn: "2026-07-03",
      checkOut: "2026-07-01",
      guests: 1,
      roomType: "Standard Double Room",
      contactMethod: "Phone"
    });
    expect(result.success).toBe(false);
  });
});
