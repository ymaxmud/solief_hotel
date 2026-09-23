/**
 * Remove development seed data, safely and reviewably.
 *
 * This used to be a migration. It is a script instead because deciding whether a
 * seeded record has since been used for real hotel work is a judgement that a
 * human must see before anything is deleted — not something that should happen
 * silently on deploy.
 *
 * Rules:
 *   - Preview by default. Nothing is deleted without --apply.
 *   - A seeded record is removed ONLY if it still carries the exact original
 *     seed fingerprint AND nothing references it.
 *   - References are evaluated BEFORE any delete. A dependent row is never
 *     deleted to make a parent deletable, and no real history is ever nulled out.
 *   - Anything referenced is reported as preserved for human review.
 *   - Output carries row ids and counts only, never guest or staff personal data.
 *
 * Usage:
 *   node scripts/cleanup-demo-data.mjs            # preview, changes nothing
 *   node scripts/cleanup-demo-data.mjs --apply    # delete the safe subset
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import {
  SEED_ROOMS,
  SEED_STAFF,
  STAFF_REFERENCES,
  classifyRoomRow,
  classifyStaffRow
} from "./seed-fingerprints.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes("--apply");

if (!url || !secretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function countReferences(table, column, id) {
  const { count, error } = await supabase
    .from(table)
    .select(column, { count: "exact", head: true })
    .eq(column, id);
  if (error) throw new Error(`Could not check ${table}.${column}: ${error.message}`);
  return count ?? 0;
}

async function classifyStaff() {
  const { data, error } = await supabase
    .from("staff_members")
    .select("id,full_name,email,phone,notes")
    .in("email", SEED_STAFF.map((s) => s.email));
  if (error) throw new Error(`Could not read staff_members: ${error.message}`);

  const removable = [];
  const preserved = [];

  for (const row of data ?? []) {
    // Gather every reference count BEFORE deciding anything, and never delete a
    // referencing row to make this one deletable.
    const referenceCounts = {};
    for (const ref of STAFF_REFERENCES) {
      referenceCounts[`${ref.table}.${ref.column}`] = await countReferences(ref.table, ref.column, row.id);
    }
    const verdict = classifyStaffRow(row, referenceCounts);
    if (verdict.action === "delete") removable.push({ id: row.id });
    else preserved.push({ id: row.id, reason: verdict.reason });
  }
  return { removable, preserved };
}

async function classifyRooms() {
  const { data, error } = await supabase
    .from("rooms")
    .select("id,room_number,floor,notes")
    .in("room_number", SEED_ROOMS.map((r) => r.room_number));
  if (error) throw new Error(`Could not read rooms: ${error.message}`);

  const removable = [];
  const preserved = [];

  for (const row of data ?? []) {
    const stays = await countReferences("stays", "room_id", row.id);
    const verdict = classifyRoomRow(row, stays);
    if (verdict.action === "delete") removable.push({ id: row.id });
    else preserved.push({ id: row.id, reason: verdict.reason });
  }
  return { removable, preserved };
}

function report(label, { removable, preserved }) {
  console.log(`\n${label}`);
  console.log(`  safe to remove: ${removable.length}`);
  for (const row of removable) console.log(`    - ${row.id}`);
  console.log(`  preserved:      ${preserved.length}`);
  for (const row of preserved) console.log(`    - ${row.id} — ${row.reason}`);
}

const staff = await classifyStaff();
const rooms = await classifyRooms();

console.log(apply ? "=== APPLYING CLEANUP ===" : "=== PREVIEW ONLY — nothing will be changed ===");
report("Seeded sample staff", staff);
report("Seeded physical rooms", rooms);

if (!apply) {
  console.log("\nRe-run with --apply to delete the rows listed as safe to remove.");
  console.log("Take a database backup first.");
  process.exit(0);
}

if (!staff.removable.length && !rooms.removable.length) {
  console.log("\nNothing to delete.");
  process.exit(0);
}

// Re-check references immediately before deleting, in case anything changed
// between the preview and the apply.
for (const row of staff.removable) {
  for (const ref of STAFF_REFERENCES) {
    const count = await countReferences(ref.table, ref.column, row.id);
    if (count > 0) {
      console.error(`\nAborting: staff ${row.id} gained a reference in ${ref.table}.${ref.column}. Re-run the preview.`);
      process.exit(1);
    }
  }
}

if (staff.removable.length) {
  const { error } = await supabase.from("staff_members").delete().in("id", staff.removable.map((r) => r.id));
  if (error) {
    console.error(`Could not delete staff: ${error.message}`);
    process.exit(1);
  }
  console.log(`\nDeleted ${staff.removable.length} seeded staff row(s).`);
}

if (rooms.removable.length) {
  const { error } = await supabase.from("rooms").delete().in("id", rooms.removable.map((r) => r.id));
  if (error) {
    console.error(`Could not delete rooms: ${error.message}`);
    process.exit(1);
  }
  console.log(`Deleted ${rooms.removable.length} seeded room(s).`);
}

console.log("\nCleanup complete. Physical room inventory is intentionally left for the hotel to enter.");
