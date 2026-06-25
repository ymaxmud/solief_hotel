import { describe, expect, it } from "vitest";
import { assertCan, bookingStatusAction } from "@/lib/crm/permissions";

describe("CRM permissions", () => {
  it("blocks receptionists from confirming or rejecting bookings", () => {
    expect(assertCan("receptionist", "booking:confirm").ok).toBe(false);
    expect(assertCan("receptionist", "booking:reject").ok).toBe(false);
  });

  it("allows receptionists to mark bookings contacted only", () => {
    expect(bookingStatusAction("contacted")).toBe("booking:mark_contacted");
    expect(assertCan("receptionist", "booking:mark_contacted").ok).toBe(true);
  });

  it("allows managers to operate hotel workflows but not users", () => {
    expect(assertCan("manager", "booking:confirm").ok).toBe(true);
    expect(assertCan("manager", "user:manage").ok).toBe(false);
  });
});
