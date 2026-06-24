import { describe, expect, it } from "vitest";
import { distanceMeters, hashAttendanceToken, isWithinAttendanceRadius } from "@/lib/crm/attendance";
import { manualAttendanceSchema, qrAttendanceSchema, serviceAssignmentSchema } from "@/lib/crm/validation";

describe("attendance security helpers", () => {
  it("hashes QR tokens consistently", () => {
    expect(hashAttendanceToken("abc")).toBe(hashAttendanceToken("abc"));
    expect(hashAttendanceToken("abc")).not.toBe("abc");
  });

  it("QR token input requires geolocation and staff", () => {
    const result = qrAttendanceSchema.safeParse({ token: "x".repeat(30), purpose: "check_in" });
    expect(result.success).toBe(false);
  });

  it("QR check-in fails outside radius", () => {
    const result = isWithinAttendanceRadius({ lat: 40.0, lng: 69.0 });
    expect(result.ok).toBe(false);
    expect(result.distance).toBeGreaterThan(result.radius);
  });

  it("hotel coordinate distance is near zero", () => {
    expect(distanceMeters({ lat: 41.2683062, lng: 69.2038021 })).toBeLessThan(1);
  });

  it("manual correction requires reason", () => {
    const result = manualAttendanceSchema.safeParse({
      staffMemberId: "00000000-0000-0000-0000-000000000000",
      action: "check_in",
      correctionReason: ""
    });
    expect(result.success).toBe(false);
  });

  it("service assignment links staff to exact guest", () => {
    const result = serviceAssignmentSchema.safeParse({
      guestId: "00000000-0000-0000-0000-000000000001",
      staffMemberId: "00000000-0000-0000-0000-000000000002",
      serviceType: "luggage",
      status: "open"
    });
    expect(result.success).toBe(true);
  });
});
