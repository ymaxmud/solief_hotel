-- Security hardening: tighten RLS to match the application permission matrix and
-- stop the public booking endpoint from overwriting existing guest records.

-- H1 — Every application write goes through the Supabase service role (which
-- bypasses RLS). The staff-writable policies below were only ever reachable by a
-- logged-in staff member calling PostgREST directly with the public anon key,
-- letting a receptionist bypass the API role checks, lifecycle RPCs, and audit
-- logging entirely (e.g. flipping a booking to "confirmed", inserting a
-- checked-in stay on an occupied room, or deleting guests). Drop them so only the
-- service role can write these tables. Read policies are retained.
drop policy if exists "guests write" on public.guests;
drop policy if exists "booking requests update" on public.booking_requests;
drop policy if exists "stays write" on public.stays;
drop policy if exists "services write" on public.service_assignments;
drop policy if exists "attendance correct admin manager" on public.attendance_records;

-- M5 — create_public_booking_request matched an existing guest by email OR phone
-- and then overwrote full_name / preferred_language / preferred_contact from an
-- unauthenticated request. Anyone who knows a guest's email or phone could
-- rewrite that guest's CRM record. Only backfill missing contact fields on a
-- match; never overwrite an existing guest's identity from public input.
create or replace function public.create_public_booking_request(
  p_reference text,
  p_full_name text,
  p_phone text,
  p_email text,
  p_guests_count integer,
  p_check_in date,
  p_check_out date,
  p_room_type text,
  p_preferred_contact text,
  p_preferred_language text,
  p_message text,
  p_source text default 'website'
)
returns table(booking_request_id uuid, guest_id uuid, public_reference text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest_id uuid;
  v_booking_id uuid;
  v_email text;
  v_phone text;
begin
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    raise exception 'invalid_full_name' using errcode = '22023';
  end if;
  if p_phone is null and p_email is null then
    raise exception 'phone_or_email_required' using errcode = '22023';
  end if;
  if p_check_out <= p_check_in then
    raise exception 'invalid_dates' using errcode = '22023';
  end if;

  v_email := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_phone := nullif(regexp_replace(coalesce(p_phone, ''), '\s+', '', 'g'), '');

  select id into v_guest_id
  from public.guests
  where (v_email is not null and lower(email) = v_email)
     or (v_phone is not null and phone = v_phone)
  order by created_at desc
  limit 1;

  if v_guest_id is null then
    insert into public.guests(full_name, phone, email, preferred_language, preferred_contact, notes)
    values (trim(p_full_name), v_phone, v_email, p_preferred_language, p_preferred_contact, p_message)
    returning id into v_guest_id;
  else
    -- Only backfill missing contact channels; do not overwrite the stored name or
    -- preferences from an unauthenticated public submission.
    update public.guests
    set phone = coalesce(phone, v_phone),
        email = coalesce(email, v_email),
        updated_at = now()
    where id = v_guest_id;
  end if;

  insert into public.booking_requests(
    public_reference,
    guest_id,
    full_name,
    phone,
    email,
    guests_count,
    check_in,
    check_out,
    room_type,
    preferred_contact,
    preferred_language,
    message,
    source
  )
  values (
    p_reference,
    v_guest_id,
    trim(p_full_name),
    v_phone,
    v_email,
    p_guests_count,
    p_check_in,
    p_check_out,
    p_room_type,
    p_preferred_contact,
    p_preferred_language,
    p_message,
    coalesce(nullif(p_source, ''), 'website')
  )
  returning id into v_booking_id;

  return query select v_booking_id, v_guest_id, p_reference;
end;
$$;

revoke all on function public.create_public_booking_request(text, text, text, text, integer, date, date, text, text, text, text, text) from public;
grant execute on function public.create_public_booking_request(text, text, text, text, integer, date, date, text, text, text, text, text) to service_role;
