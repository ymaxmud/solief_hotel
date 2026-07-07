-- Fix: redeem_attendance_qr() failed at runtime with 42702
-- "column reference \"status\" is ambiguous", which the staff attendance API
-- surfaced as a generic 500 "Attendance verification failed" — so QR check-in/out
-- never worked. The function's RETURNS TABLE(..., status text) output column shadows
-- the unqualified `status` used in its internal staff_members / attendance_records
-- SELECTs. Qualify those three references. Signature and output are unchanged, so the
-- application code is unaffected. Idempotent (create or replace).

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
  where staff_members.status = 'active'
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
      and attendance_records.status = 'open'
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
      and attendance_records.status = 'open'
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
