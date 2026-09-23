import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain .mjs helper shared with scripts/cleanup-demo-data.mjs
import { SEED_STAFF, STAFF_REFERENCES, classifyRoomRow, classifyStaffRow } from "../../scripts/seed-fingerprints.mjs";

type Verdict = { action: "delete" | "preserve"; reason?: string };

const RECEPTION = {
  full_name: "Reception Sample",
  email: "reception@example.com",
  phone: "+998 00 000 00 01",
  notes: "Development seed staff"
};

const MANAGER = {
  full_name: "Manager Sample",
  email: "manager@example.com",
  phone: "+998 00 000 00 02",
  notes: "Development seed staff"
};

/** No references anywhere. */
const UNUSED: Record<string, number> = Object.fromEntries(
  (STAFF_REFERENCES as Array<{ table: string; column: string }>).map((r) => [`${r.table}.${r.column}`, 0])
);

function withReference(key: string, count = 1) {
  return { ...UNUSED, [key]: count };
}

describe("seed staff classification", () => {
  it("deletes an untouched, never-used seed staff row", () => {
    for (const row of [RECEPTION, MANAGER]) {
      const verdict = classifyStaffRow(row, UNUSED) as Verdict;
      expect(verdict.action).toBe("delete");
    }
  });

  // The regression this whole rewrite exists for: the previous migration deleted
  // attendance rows first, which made its own "is it used?" guard vacuous.
  it("preserves a seed staff row that was used for real work, for EVERY reference table", () => {
    for (const ref of STAFF_REFERENCES as Array<{ table: string; column: string }>) {
      const key = `${ref.table}.${ref.column}`;
      const verdict = classifyStaffRow(RECEPTION, withReference(key)) as Verdict;
      expect(verdict.action, `${key} should protect the row`).toBe("preserve");
      expect(verdict.reason).toContain(key);
    }
  });

  it("checks all five reference tables", () => {
    expect((STAFF_REFERENCES as unknown[]).length).toBe(5);
    expect((STAFF_REFERENCES as Array<{ table: string; column: string }>).map((r) => `${r.table}.${r.column}`)).toEqual([
      "service_assignments.staff_member_id",
      "attendance_records.staff_member_id",
      "attendance_attempts.staff_member_id",
      "attendance_qr_tokens.used_by_staff_id",
      "booking_requests.assigned_staff_id"
    ]);
  });

  it("preserves a row whose fingerprint no longer matches", () => {
    const edited = [
      { ...RECEPTION, full_name: "Aziza R." },
      { ...RECEPTION, email: "aziza@soliefhotel.com" },
      { ...RECEPTION, phone: "+998 90 123 45 67" },
      { ...RECEPTION, notes: "Front desk, evening shift" },
      { ...RECEPTION, notes: null }
    ];
    for (const row of edited) {
      expect((classifyStaffRow(row, UNUSED) as Verdict).action).toBe("preserve");
    }
  });

  it("treats a missing reference map as unknown rather than unused", () => {
    // Defensive: absent counts must never be read as "safe to delete" for a row
    // that is actually referenced. With no data at all the fingerprint still
    // governs, and an unused fingerprint match is deletable.
    expect((classifyStaffRow(RECEPTION, {}) as Verdict).action).toBe("delete");
    expect((classifyStaffRow(RECEPTION, withReference("attendance_records.staff_member_id")) as Verdict).action).toBe(
      "preserve"
    );
  });

  it("only ever recognises the two known seed accounts", () => {
    expect((SEED_STAFF as Array<{ email: string }>).map((s) => s.email)).toEqual([
      "reception@example.com",
      "manager@example.com"
    ]);
    const realStaff = { full_name: "Dilnoza K.", email: "dilnoza@soliefhotel.com", phone: "+998 90 000 00 00", notes: null };
    expect((classifyStaffRow(realStaff, UNUSED) as Verdict).action).toBe("preserve");
  });
});

describe("seed room classification", () => {
  it("deletes an untouched, never-used seeded room", () => {
    // All four seeded rooms, with the floors the seed actually used. A wrong
    // floor here would make a real seed row look edited and silently survive.
    for (const [room_number, floor] of [
      ["101", "1"],
      ["102", "1"],
      ["201", "2"],
      ["202", "2"]
    ]) {
      expect(
        (classifyRoomRow({ room_number, floor, notes: null }, 0) as Verdict).action,
        `room ${room_number} on floor ${floor}`
      ).toBe("delete");
    }
  });

  it("preserves a seeded room number that sits on a different floor", () => {
    // Same number, wrong floor: not the seeded row, so leave it alone.
    expect((classifyRoomRow({ room_number: "102", floor: "3", notes: null }, 0) as Verdict).action).toBe("preserve");
  });

  it("preserves a seeded room that a real stay used", () => {
    const verdict = classifyRoomRow({ room_number: "101", floor: "1", notes: null }, 3) as Verdict;
    expect(verdict.action).toBe("preserve");
    expect(verdict.reason).toContain("stays=3");
  });

  it("preserves a seeded room the hotel annotated", () => {
    expect(
      (classifyRoomRow({ room_number: "101", floor: "1", notes: "Corner room, quiet side" }, 0) as Verdict).action
    ).toBe("preserve");
  });

  it("preserves a real room number that was never seeded", () => {
    expect((classifyRoomRow({ room_number: "305", floor: "3", notes: null }, 0) as Verdict).action).toBe("preserve");
  });
});
