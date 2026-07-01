create extension if not exists pgcrypto;

alter table public.app_users
  add column if not exists force_password_change boolean not null default false,
  add column if not exists deactivated_at timestamptz,
  add column if not exists last_password_reset_at timestamptz;

alter table public.staff_members
  add column if not exists attendance_pin_hash text,
  add column if not exists attendance_pin_set_at timestamptz;

alter table public.attendance_records
  add column if not exists verification_method text,
  add column if not exists check_in_accuracy_meters numeric,
  add column if not exists check_out_accuracy_meters numeric,
  add column if not exists check_in_ip text,
  add column if not exists check_out_ip text,
  add column if not exists check_in_user_agent text,
  add column if not exists check_out_user_agent text,
  add column if not exists anomaly_flags text[] not null default '{}',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.attendance_attempts (
  id uuid primary key default gen_random_uuid(),
  staff_member_id uuid references public.staff_members(id),
  token_hash text,
  purpose text,
  success boolean not null default false,
  error_code text,
  lat numeric,
  lng numeric,
  accuracy_meters numeric,
  distance_meters numeric,
  anomaly_flags text[] not null default '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.public_rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  identifier_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.attendance_attempts enable row level security;
alter table public.public_rate_limits enable row level security;

drop policy if exists "attendance attempts read admin manager" on public.attendance_attempts;
create policy "attendance attempts read admin manager"
  on public.attendance_attempts for select
  using (public.current_app_role() in ('admin','manager'));

drop policy if exists "rate limits admin read" on public.public_rate_limits;
create policy "rate limits admin read"
  on public.public_rate_limits for select
  using (public.current_app_role() = 'admin');

create index if not exists attendance_qr_tokens_lookup_idx
  on public.attendance_qr_tokens(token_hash, purpose, used_at, expires_at);

create index if not exists attendance_records_staff_created_idx
  on public.attendance_records(staff_member_id, created_at desc);

create unique index if not exists attendance_one_open_per_staff
  on public.attendance_records(staff_member_id)
  where status = 'open' and check_out_at is null;

create index if not exists attendance_records_anomaly_idx
  on public.attendance_records using gin(anomaly_flags);

create index if not exists attendance_attempts_created_idx
  on public.attendance_attempts(created_at desc);

create index if not exists attendance_attempts_staff_created_idx
  on public.attendance_attempts(staff_member_id, created_at desc);

create index if not exists public_rate_limits_scope_identifier_created_idx
  on public.public_rate_limits(scope, identifier_hash, created_at desc);

create index if not exists booking_requests_status_created_idx
  on public.booking_requests(status, created_at desc);

create index if not exists guests_email_lower_idx
  on public.guests(lower(email)) where email is not null;

create index if not exists guests_phone_idx
  on public.guests(phone) where phone is not null;

create or replace function public.set_staff_attendance_pin(
  p_staff_member_id uuid,
  p_pin text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.role() <> 'service_role' and public.current_app_role() not in ('admin','manager') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_pin is null or length(p_pin) < 6 or p_pin in ('000000','111111','123456','12345678','1234demo','password') then
    raise exception 'weak_pin' using errcode = '22023';
  end if;

  update public.staff_members
  set attendance_pin_hash = crypt(p_pin, gen_salt('bf', 10)),
      attendance_pin_set_at = now(),
      updated_at = now()
  where id = p_staff_member_id;

  if not found then
    raise exception 'staff_not_found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_staff_attendance_pin(uuid, text) from public;
grant execute on function public.set_staff_attendance_pin(uuid, text) to authenticated;

create or replace function public.check_public_rate_limit(
  p_scope text,
  p_identifier text,
  p_max_attempts integer default 5,
  p_window_seconds integer default 60
)
returns table(ok boolean, attempts integer, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_since timestamptz;
  v_count integer;
  v_oldest timestamptz;
begin
  if p_identifier is null or length(trim(p_identifier)) = 0 then
    p_identifier := 'unknown';
  end if;

  v_hash := encode(digest(lower(trim(p_identifier)), 'sha256'), 'hex');
  v_since := now() - make_interval(secs => p_window_seconds);
  perform pg_advisory_xact_lock(hashtextextended(p_scope || ':' || v_hash, 0));

  delete from public.public_rate_limits
  where created_at < now() - interval '24 hours';

  select count(*), min(created_at)
  into v_count, v_oldest
  from public.public_rate_limits
  where scope = p_scope
    and identifier_hash = v_hash
    and created_at >= v_since;

  if v_count >= p_max_attempts then
    return query select false, v_count, greatest(1, ceil(extract(epoch from (v_oldest + make_interval(secs => p_window_seconds) - now())))::integer);
    return;
  end if;

  insert into public.public_rate_limits(scope, identifier_hash)
  values (p_scope, v_hash);

  return query select true, v_count + 1, 0;
end;
$$;

revoke all on function public.check_public_rate_limit(text, text, integer, integer) from public;
grant execute on function public.check_public_rate_limit(text, text, integer, integer) to service_role;

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
    update public.guests
    set full_name = trim(p_full_name),
        phone = coalesce(v_phone, phone),
        email = coalesce(v_email, email),
        preferred_language = p_preferred_language,
        preferred_contact = p_preferred_contact,
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

create or replace function public.redeem_attendance_qr(
  p_token_hash text,
  p_purpose text,
  p_staff_identifier text,
  p_pin text,
  p_lat numeric,
  p_lng numeric,
  p_accuracy_meters numeric,
  p_distance_meters numeric,
  p_radius_meters numeric,
  p_ip text,
  p_user_agent text,
  p_anomaly_flags text[] default '{}'
)
returns table(ok boolean, error_code text, attendance_record_id uuid, status text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_staff public.staff_members%rowtype;
  v_token public.attendance_qr_tokens%rowtype;
  v_open_id uuid;
  v_attendance_id uuid;
  v_identifier text;
begin
  v_identifier := lower(trim(coalesce(p_staff_identifier, '')));

  select *
  into v_staff
  from public.staff_members
  where status = 'active'
    and (
      lower(coalesce(email, '')) = v_identifier
      or regexp_replace(coalesce(phone, ''), '\D', '', 'g') = regexp_replace(v_identifier, '\D', '', 'g')
    )
  order by created_at desc
  limit 1;

  if v_staff.id is null or v_staff.attendance_pin_hash is null or crypt(coalesce(p_pin, ''), v_staff.attendance_pin_hash) <> v_staff.attendance_pin_hash then
    insert into public.attendance_attempts(token_hash, purpose, success, error_code, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
    values (p_token_hash, p_purpose, false, 'invalid_staff_pin', p_lat, p_lng, p_accuracy_meters, p_distance_meters, coalesce(p_anomaly_flags, '{}'), p_ip, p_user_agent);
    return query select false, 'invalid_staff_pin', null::uuid, null::text;
    return;
  end if;

  if p_lat is null or p_lng is null then
    insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, error_code, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
    values (v_staff.id, p_token_hash, p_purpose, false, 'missing_location', p_lat, p_lng, p_accuracy_meters, p_distance_meters, array_append(coalesce(p_anomaly_flags, '{}'), 'missing_location'), p_ip, p_user_agent);
    return query select false, 'missing_location', null::uuid, null::text;
    return;
  end if;

  if p_distance_meters is null or p_radius_meters is null or p_distance_meters > p_radius_meters then
    insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, error_code, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
    values (v_staff.id, p_token_hash, p_purpose, false, 'outside_radius', p_lat, p_lng, p_accuracy_meters, p_distance_meters, array_append(coalesce(p_anomaly_flags, '{}'), 'outside_radius'), p_ip, p_user_agent);
    return query select false, 'outside_radius', null::uuid, null::text;
    return;
  end if;

  if p_purpose = 'check_in' then
    select id into v_open_id
    from public.attendance_records
    where staff_member_id = v_staff.id
      and status = 'open'
      and check_out_at is null
    limit 1;

    if v_open_id is not null then
      insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, error_code, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
      values (v_staff.id, p_token_hash, p_purpose, false, 'duplicate_open_attendance', p_lat, p_lng, p_accuracy_meters, p_distance_meters, coalesce(p_anomaly_flags, '{}'), p_ip, p_user_agent);
      return query select false, 'duplicate_open_attendance', v_open_id, 'already_checked_in';
      return;
    end if;
  else
    select id into v_open_id
    from public.attendance_records
    where staff_member_id = v_staff.id
      and status = 'open'
      and check_out_at is null
    order by created_at desc
    limit 1;

    if v_open_id is null then
      insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, error_code, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
      values (v_staff.id, p_token_hash, p_purpose, false, 'no_open_attendance', p_lat, p_lng, p_accuracy_meters, p_distance_meters, coalesce(p_anomaly_flags, '{}'), p_ip, p_user_agent);
      return query select false, 'no_open_attendance', null::uuid, null::text;
      return;
    end if;
  end if;

  update public.attendance_qr_tokens
  set used_at = now(),
      used_by_staff_id = v_staff.id
  where token_hash = p_token_hash
    and purpose = p_purpose
    and used_at is null
    and expires_at > now()
  returning * into v_token;

  if v_token.id is null then
    if exists(select 1 from public.attendance_qr_tokens where token_hash = p_token_hash and purpose = p_purpose and used_at is not null) then
      insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, error_code, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
      values (v_staff.id, p_token_hash, p_purpose, false, 'token_used', p_lat, p_lng, p_accuracy_meters, p_distance_meters, array_append(coalesce(p_anomaly_flags, '{}'), 'qr_reuse_attempt'), p_ip, p_user_agent);
      return query select false, 'token_used', null::uuid, null::text;
      return;
    elsif exists(select 1 from public.attendance_qr_tokens where token_hash = p_token_hash and purpose = p_purpose and expires_at <= now()) then
      insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, error_code, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
      values (v_staff.id, p_token_hash, p_purpose, false, 'token_expired', p_lat, p_lng, p_accuracy_meters, p_distance_meters, coalesce(p_anomaly_flags, '{}'), p_ip, p_user_agent);
      return query select false, 'token_expired', null::uuid, null::text;
      return;
    else
      insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, error_code, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
      values (v_staff.id, p_token_hash, p_purpose, false, 'invalid_token', p_lat, p_lng, p_accuracy_meters, p_distance_meters, coalesce(p_anomaly_flags, '{}'), p_ip, p_user_agent);
      return query select false, 'invalid_token', null::uuid, null::text;
      return;
    end if;
  end if;

  if p_purpose = 'check_in' then
    insert into public.attendance_records(
      staff_member_id,
      check_in_at,
      check_in_method,
      check_in_lat,
      check_in_lng,
      check_in_accuracy_meters,
      check_in_distance_meters,
      check_in_ip,
      check_in_user_agent,
      verification_method,
      anomaly_flags,
      metadata,
      status
    )
    values (
      v_staff.id,
      now(),
      'qr',
      p_lat,
      p_lng,
      p_accuracy_meters,
      p_distance_meters,
      p_ip,
      p_user_agent,
      'pin',
      coalesce(p_anomaly_flags, '{}'),
      jsonb_build_object('radius_meters', p_radius_meters),
      'open'
    )
    returning id into v_attendance_id;

    insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
    values (v_staff.id, p_token_hash, p_purpose, true, p_lat, p_lng, p_accuracy_meters, p_distance_meters, coalesce(p_anomaly_flags, '{}'), p_ip, p_user_agent);

    return query select true, null::text, v_attendance_id, 'checked_in';
    return;
  end if;

  update public.attendance_records
  set check_out_at = now(),
      check_out_method = 'qr',
      check_out_lat = p_lat,
      check_out_lng = p_lng,
      check_out_accuracy_meters = p_accuracy_meters,
      check_out_distance_meters = p_distance_meters,
      check_out_ip = p_ip,
      check_out_user_agent = p_user_agent,
      verification_method = coalesce(verification_method, 'pin'),
      anomaly_flags = (
        select array(select distinct unnest(public.attendance_records.anomaly_flags || coalesce(p_anomaly_flags, '{}')))
      ),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('checkout_radius_meters', p_radius_meters),
      status = 'closed',
      updated_at = now()
  where id = v_open_id
  returning id into v_attendance_id;

  insert into public.attendance_attempts(staff_member_id, token_hash, purpose, success, lat, lng, accuracy_meters, distance_meters, anomaly_flags, ip_address, user_agent)
  values (v_staff.id, p_token_hash, p_purpose, true, p_lat, p_lng, p_accuracy_meters, p_distance_meters, coalesce(p_anomaly_flags, '{}'), p_ip, p_user_agent);

  return query select true, null::text, v_attendance_id, 'checked_out';
end;
$$;

revoke all on function public.redeem_attendance_qr(text, text, text, text, numeric, numeric, numeric, numeric, numeric, text, text, text[]) from public;
grant execute on function public.redeem_attendance_qr(text, text, text, text, numeric, numeric, numeric, numeric, numeric, text, text, text[]) to service_role;
