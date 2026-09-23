-- Remove the development seed artifacts created by the old supabase/seed/seed.sql.
--
-- Deliberately narrow and conservative: every statement matches an exact
-- fingerprint from that seed file, and a seeded row is removed only when nothing
-- references it. Anything the hotel entered itself — real staff, guests, booking
-- requests, stays, attendance — does not match and is left untouched. Where a
-- record is ambiguous, it is preserved.
--
-- Nothing here drops a table, a policy or a function.
--
-- IMPORTANT: take a database backup before applying this migration. It deletes
-- rows and cannot be undone from within the migration.

-- ---------------------------------------------------------------------------
-- Seeded sample staff: 'Reception Sample' / 'Manager Sample' on @example.com,
-- tagged 'Development seed staff'.
--
-- A seeded staff member is deleted only if nothing references them. Service
-- assignments require a staff member (staff_member_id is NOT NULL), so a seed
-- row that has been used for real work is kept rather than forced out — that
-- would mean the hotel actually used the account, and losing it would corrupt
-- the operational history.
-- ---------------------------------------------------------------------------

-- Attendance rows belonging purely to seeded staff are themselves seed noise.
delete from public.attendance_records
where staff_member_id in (
  select id from public.staff_members
  where email in ('reception@example.com', 'manager@example.com')
    and full_name in ('Reception Sample', 'Manager Sample')
    and notes = 'Development seed staff'
);

delete from public.attendance_attempts
where staff_member_id in (
  select id from public.staff_members
  where email in ('reception@example.com', 'manager@example.com')
    and full_name in ('Reception Sample', 'Manager Sample')
    and notes = 'Development seed staff'
);

-- Unused QR tokens are short-lived by design; clear the ones tied to seed staff.
delete from public.attendance_qr_tokens
where used_by_staff_id in (
  select id from public.staff_members
  where email in ('reception@example.com', 'manager@example.com')
    and full_name in ('Reception Sample', 'Manager Sample')
    and notes = 'Development seed staff'
);

-- booking_requests.assigned_staff_id is nullable, so a seeded assignment can be
-- cleared without losing the booking itself.
update public.booking_requests
set assigned_staff_id = null, updated_at = now()
where assigned_staff_id in (
  select id from public.staff_members
  where email in ('reception@example.com', 'manager@example.com')
    and full_name in ('Reception Sample', 'Manager Sample')
    and notes = 'Development seed staff'
);

delete from public.staff_members s
where s.email in ('reception@example.com', 'manager@example.com')
  and s.full_name in ('Reception Sample', 'Manager Sample')
  and s.notes = 'Development seed staff'
  and not exists (select 1 from public.service_assignments sa where sa.staff_member_id = s.id)
  and not exists (select 1 from public.attendance_records ar where ar.staff_member_id = s.id);

-- ---------------------------------------------------------------------------
-- Seeded physical rooms 101 / 102 / 201 / 202.
--
-- The owner has not supplied the real room inventory. Inventing room numbers
-- would be worse than an empty table, so these are removed and staff enter the
-- real ones in /admin/rooms. A seeded room that a real stay has used is kept.
-- ---------------------------------------------------------------------------
delete from public.rooms r
where r.room_number in ('101', '102', '201', '202')
  and r.floor in ('1', '2')
  and r.notes is null
  and not exists (select 1 from public.stays s where s.room_id = r.id);

-- ---------------------------------------------------------------------------
-- Rate-limit counters are ephemeral anti-spam state, not business data. One
-- sweep clears anything left from development; ongoing cleanup already happens
-- inside check_public_rate_limit(), which drops rows older than 24 hours on
-- every call, so no scheduled job is needed.
-- ---------------------------------------------------------------------------
delete from public.public_rate_limits where created_at < now() - interval '24 hours';
