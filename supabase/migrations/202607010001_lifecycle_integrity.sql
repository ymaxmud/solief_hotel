create unique index if not exists attendance_one_unclosed_per_staff
  on public.attendance_records(staff_member_id)
  where check_out_at is null;

create unique index if not exists stays_one_per_booking_request
  on public.stays(booking_request_id)
  where booking_request_id is not null;

create or replace function public.create_stay_from_booking(
  p_booking_request_id uuid,
  p_room_id uuid default null,
  p_actor_user_id uuid default null
)
returns public.stays
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.booking_requests%rowtype;
  v_existing public.stays%rowtype;
  v_stay public.stays%rowtype;
begin
  select * into v_existing
  from public.stays
  where booking_request_id = p_booking_request_id
  limit 1;

  if v_existing.id is not null then
    return v_existing;
  end if;

  select * into v_booking
  from public.booking_requests
  where id = p_booking_request_id;

  if v_booking.id is null then
    raise exception 'booking_not_found' using errcode = '22023';
  end if;

  if v_booking.guest_id is null then
    raise exception 'booking_missing_guest' using errcode = '22023';
  end if;

  if p_room_id is not null and not exists(
    select 1
    from public.rooms
    where id = p_room_id
      and is_active = true
      and status not in ('occupied','maintenance','out_of_service')
  ) then
    raise exception 'room_not_available' using errcode = '22023';
  end if;

  insert into public.stays(
    guest_id,
    booking_request_id,
    room_id,
    status,
    expected_check_in,
    expected_check_out,
    adults,
    created_by,
    updated_by
  )
  values (
    v_booking.guest_id,
    v_booking.id,
    p_room_id,
    'expected',
    v_booking.check_in,
    v_booking.check_out,
    greatest(v_booking.guests_count, 1),
    p_actor_user_id,
    p_actor_user_id
  )
  returning * into v_stay;

  update public.booking_requests
  set status = case when status = 'new' then 'contacted' else status end,
      updated_at = now()
  where id = v_booking.id;

  return v_stay;
end;
$$;

revoke all on function public.create_stay_from_booking(uuid, uuid, uuid) from public;
grant execute on function public.create_stay_from_booking(uuid, uuid, uuid) to service_role;

create or replace function public.update_stay_lifecycle(
  p_stay_id uuid,
  p_room_id uuid default null,
  p_status public.guest_status default null,
  p_expected_check_in date default null,
  p_expected_check_out date default null,
  p_notes text default null,
  p_actor_user_id uuid default null
)
returns public.stays
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stay public.stays%rowtype;
  v_room_id uuid;
  v_new_status public.guest_status;
  v_updated public.stays%rowtype;
begin
  select * into v_stay
  from public.stays
  where id = p_stay_id
  for update;

  if v_stay.id is null then
    raise exception 'stay_not_found' using errcode = '22023';
  end if;

  v_room_id := coalesce(p_room_id, v_stay.room_id);
  v_new_status := coalesce(p_status, v_stay.status);

  if v_new_status = 'checked_in' and v_room_id is null then
    raise exception 'room_required_for_check_in' using errcode = '22023';
  end if;

  if v_room_id is not null and v_room_id <> coalesce(v_stay.room_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    if not exists(
      select 1
      from public.rooms
      where id = v_room_id
        and is_active = true
        and status not in ('occupied','maintenance','out_of_service')
    ) then
      raise exception 'room_not_available' using errcode = '22023';
    end if;
  end if;

  if v_stay.room_id is not null and v_stay.room_id <> coalesce(v_room_id, v_stay.room_id) and v_stay.status = 'checked_in' then
    update public.rooms
    set status = 'available',
        updated_at = now()
    where id = v_stay.room_id
      and status = 'occupied';
  end if;

  update public.stays
  set room_id = case when p_room_id is not null then p_room_id else room_id end,
      status = v_new_status,
      expected_check_in = coalesce(p_expected_check_in, expected_check_in),
      expected_check_out = coalesce(p_expected_check_out, expected_check_out),
      notes = coalesce(p_notes, notes),
      check_in_at = case
        when v_new_status = 'checked_in' and check_in_at is null then now()
        else check_in_at
      end,
      check_out_at = case
        when v_new_status = 'checked_out' and check_out_at is null then now()
        else check_out_at
      end,
      updated_by = p_actor_user_id,
      updated_at = now()
  where id = p_stay_id
  returning * into v_updated;

  if v_updated.room_id is not null and v_new_status = 'checked_in' then
    update public.rooms
    set status = 'occupied',
        cleaning_status = 'dirty',
        updated_at = now()
    where id = v_updated.room_id;
  elsif v_updated.room_id is not null and v_new_status in ('checked_out','cancelled') and v_stay.status = 'checked_in' then
    -- Only release the room if this stay was actually occupying it. Cancelling a
    -- merely 'expected' stay must not free a room a different guest checked into.
    update public.rooms
    set status = 'available',
        cleaning_status = case when v_new_status = 'checked_out' then 'dirty' else cleaning_status end,
        updated_at = now()
    where id = v_updated.room_id
      and status = 'occupied';
  end if;

  return v_updated;
end;
$$;

revoke all on function public.update_stay_lifecycle(uuid, uuid, public.guest_status, date, date, text, uuid) from public;
grant execute on function public.update_stay_lifecycle(uuid, uuid, public.guest_status, date, date, text, uuid) to service_role;

create or replace function public.create_manual_stay(
  p_guest_id uuid,
  p_room_id uuid default null,
  p_status public.guest_status default 'expected',
  p_expected_check_in date default null,
  p_expected_check_out date default null,
  p_adults integer default 1,
  p_children integer default 0,
  p_notes text default null,
  p_actor_user_id uuid default null
)
returns public.stays
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stay public.stays%rowtype;
begin
  if not exists(select 1 from public.guests where id = p_guest_id) then
    raise exception 'guest_not_found' using errcode = '22023';
  end if;

  -- Insert without a room first, then route any room assignment / non-expected
  -- status through update_stay_lifecycle so the room-availability guard always
  -- runs (inserting the room directly would make the guard see it as unchanged
  -- and silently skip the occupied/out-of-service check).
  insert into public.stays(
    guest_id,
    room_id,
    status,
    expected_check_in,
    expected_check_out,
    adults,
    children,
    notes,
    created_by,
    updated_by
  )
  values (
    p_guest_id,
    null,
    'expected',
    p_expected_check_in,
    p_expected_check_out,
    greatest(coalesce(p_adults, 1), 1),
    greatest(coalesce(p_children, 0), 0),
    p_notes,
    p_actor_user_id,
    p_actor_user_id
  )
  returning * into v_stay;

  if p_room_id is not null or p_status <> 'expected' then
    return public.update_stay_lifecycle(
      v_stay.id,
      p_room_id,
      p_status,
      p_expected_check_in,
      p_expected_check_out,
      p_notes,
      p_actor_user_id
    );
  end if;

  return v_stay;
end;
$$;

revoke all on function public.create_manual_stay(uuid, uuid, public.guest_status, date, date, integer, integer, text, uuid) from public;
grant execute on function public.create_manual_stay(uuid, uuid, public.guest_status, date, date, integer, integer, text, uuid) to service_role;

create or replace function public.create_service_assignment_for_checked_in_guest(
  p_guest_id uuid,
  p_staff_member_id uuid,
  p_stay_id uuid default null,
  p_booking_request_id uuid default null,
  p_service_type public.service_type default 'other',
  p_status public.service_status default 'open',
  p_notes text default null,
  p_actor_user_id uuid default null
)
returns public.service_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stay public.stays%rowtype;
  v_assignment public.service_assignments%rowtype;
begin
  if not exists(select 1 from public.staff_members where id = p_staff_member_id and status = 'active') then
    raise exception 'staff_not_active' using errcode = '22023';
  end if;

  if p_stay_id is not null then
    select * into v_stay
    from public.stays
    where id = p_stay_id
      and guest_id = p_guest_id
      and status = 'checked_in';
  else
    select * into v_stay
    from public.stays
    where guest_id = p_guest_id
      and status = 'checked_in'
    order by check_in_at desc nulls last, created_at desc
    limit 1;
  end if;

  if v_stay.id is null then
    raise exception 'checked_in_stay_required' using errcode = '22023';
  end if;

  insert into public.service_assignments(
    stay_id,
    guest_id,
    staff_member_id,
    booking_request_id,
    service_type,
    status,
    notes,
    started_at,
    completed_at,
    created_by,
    updated_by
  )
  values (
    v_stay.id,
    p_guest_id,
    p_staff_member_id,
    coalesce(p_booking_request_id, v_stay.booking_request_id),
    p_service_type,
    p_status,
    p_notes,
    case when p_status = 'in_progress' then now() else null end,
    case when p_status = 'done' then now() else null end,
    p_actor_user_id,
    p_actor_user_id
  )
  returning * into v_assignment;

  return v_assignment;
end;
$$;

revoke all on function public.create_service_assignment_for_checked_in_guest(uuid, uuid, uuid, uuid, public.service_type, public.service_status, text, uuid) from public;
grant execute on function public.create_service_assignment_for_checked_in_guest(uuid, uuid, uuid, uuid, public.service_type, public.service_status, text, uuid) to service_role;
