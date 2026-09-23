/**
 * Pure classification logic for development-seed cleanup.
 *
 * Kept separate from the script that talks to the database so the decisions that
 * actually matter — "is this still a seed row?" and "has it been used?" — are
 * unit-testable without a database. See tests/unit/seed-cleanup.test.ts.
 */

/** The exact rows the old supabase/seed/seed.sql created. Full fingerprint. */
export const SEED_STAFF = [
  { full_name: "Reception Sample", email: "reception@example.com", phone: "+998 00 000 00 01" },
  { full_name: "Manager Sample", email: "manager@example.com", phone: "+998 00 000 00 02" }
];

export const SEED_STAFF_NOTES = "Development seed staff";

export const SEED_ROOMS = [
  { room_number: "101", floor: "1" },
  { room_number: "102", floor: "2" },
  { room_number: "201", floor: "2" },
  { room_number: "202", floor: "2" }
];

/**
 * Every table that can point at a staff member. If any has a row, the account
 * was used for real work and the staff row must be preserved — along with the
 * referencing rows, which are real history and are never deleted to make a
 * parent deletable.
 */
export const STAFF_REFERENCES = [
  { table: "service_assignments", column: "staff_member_id" },
  { table: "attendance_records", column: "staff_member_id" },
  { table: "attendance_attempts", column: "staff_member_id" },
  { table: "attendance_qr_tokens", column: "used_by_staff_id" },
  { table: "booking_requests", column: "assigned_staff_id" }
];

/**
 * Decide what to do with a staff row.
 *
 * @param row              staff_members row (full_name, email, phone, notes)
 * @param referenceCounts  { [`${table}.${column}`]: count } for every entry in
 *                         STAFF_REFERENCES, gathered BEFORE anything is deleted
 * @returns { action: "delete" | "preserve", reason?: string }
 */
export function classifyStaffRow(row, referenceCounts) {
  const fingerprintMatch = SEED_STAFF.some(
    (seed) =>
      seed.email === row.email &&
      seed.full_name === row.full_name &&
      seed.phone === row.phone &&
      row.notes === SEED_STAFF_NOTES
  );
  if (!fingerprintMatch) {
    return { action: "preserve", reason: "record was edited — no longer matches the seed fingerprint" };
  }

  const used = STAFF_REFERENCES.map((ref) => {
    const key = `${ref.table}.${ref.column}`;
    return { key, count: referenceCounts?.[key] ?? 0 };
  }).filter((entry) => entry.count > 0);

  if (used.length) {
    return {
      action: "preserve",
      reason: `used in real operations (${used.map((e) => `${e.key}=${e.count}`).join(", ")})`
    };
  }
  return { action: "delete" };
}

/**
 * Decide what to do with a physical room row.
 *
 * @param row        rooms row (room_number, floor, notes)
 * @param stayCount  number of stays referencing the room, gathered beforehand
 */
export function classifyRoomRow(row, stayCount) {
  const fingerprintMatch = SEED_ROOMS.some(
    (seed) => seed.room_number === row.room_number && seed.floor === row.floor
  );
  if (!fingerprintMatch || row.notes !== null) {
    return { action: "preserve", reason: "record was edited — no longer matches the seed fingerprint" };
  }
  if ((stayCount ?? 0) > 0) {
    return { action: "preserve", reason: `a real stay used this room (stays=${stayCount})` };
  }
  return { action: "delete" };
}
