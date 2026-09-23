-- Assertions over the schema produced by the migrations.
-- Any failure raises and aborts the run (psql runs with ON_ERROR_STOP=1).

\set ON_ERROR_STOP on

create or replace function pg_temp.assert(condition boolean, description text)
returns void language plpgsql as $$
begin
  if condition then
    raise notice '  ok   %', description;
  else
    raise exception 'ASSERTION FAILED: %', description;
  end if;
end $$;

create or replace function pg_temp.has_column(p_table text, p_column text)
returns boolean language sql stable as $$
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = p_table and column_name = p_column
  );
$$;

-- --- migration 0001: hotels ------------------------------------------------
do $$
declare c text;
begin
  foreach c in array array[
    'telegram_url','whatsapp_url','google_maps_url','check_in_time','check_out_time',
    'google_rating','google_review_count','google_reviews_url','usd_rate_uzs','eur_rate_uzs','is_public'
  ] loop
    perform pg_temp.assert(pg_temp.has_column('hotels', c), format('hotels.%s exists', c));
  end loop;
end $$;

-- --- migration 0001: room_categories ---------------------------------------
do $$
declare c text;
begin
  foreach c in array array[
    'slug','area_sqm','bed_type_en','bed_type_ru','bed_type_uz',
    'display_order','breakfast_included','free_cancellation'
  ] loop
    perform pg_temp.assert(pg_temp.has_column('room_categories', c), format('room_categories.%s exists', c));
  end loop;
end $$;

-- --- migration 0001: booking_requests price snapshot -----------------------
do $$
declare c text;
begin
  foreach c in array array['room_category_id','nightly_price_uzs','nights','estimated_total_uzs'] loop
    perform pg_temp.assert(pg_temp.has_column('booking_requests', c), format('booking_requests.%s exists', c));
  end loop;
end $$;

-- --- new tables ------------------------------------------------------------
do $$
begin
  perform pg_temp.assert(to_regclass('public.hotel_amenities') is not null, 'hotel_amenities table exists');
  perform pg_temp.assert(to_regclass('public.hotel_images') is not null, 'hotel_images table exists');
  perform pg_temp.assert(
    (select relrowsecurity from pg_class where oid = 'public.hotel_amenities'::regclass),
    'hotel_amenities has RLS enabled');
  perform pg_temp.assert(
    (select relrowsecurity from pg_class where oid = 'public.hotel_images'::regclass),
    'hotel_images has RLS enabled');
  perform pg_temp.assert(
    (select count(*) from pg_policies where tablename = 'hotel_amenities') = 2,
    'hotel_amenities has read + write policies');
  perform pg_temp.assert(
    (select count(*) from pg_policies where tablename = 'hotel_images') = 2,
    'hotel_images has read + write policies');
end $$;

-- --- RPC signature swap ----------------------------------------------------
do $$
declare n_args int[];
begin
  select array_agg(pronargs order by pronargs) into n_args
  from pg_proc where proname = 'create_public_booking_request';

  perform pg_temp.assert(n_args @> array[16], 'create_public_booking_request has the 16-argument version');
  perform pg_temp.assert(not (n_args @> array[12]), 'the obsolete 12-argument overload was dropped');
  perform pg_temp.assert(array_length(n_args, 1) = 1, 'exactly one create_public_booking_request overload remains');
end $$;

-- --- storage bucket --------------------------------------------------------
do $$
begin
  perform pg_temp.assert(
    exists (select 1 from storage.buckets where id = 'hotel-media' and public),
    'hotel-media bucket exists and is publicly readable');
  perform pg_temp.assert(
    (select file_size_limit from storage.buckets where id = 'hotel-media') = 5242880,
    'hotel-media enforces a 5 MB limit');
  perform pg_temp.assert(
    (select allowed_mime_types from storage.buckets where id = 'hotel-media')
      @> array['image/jpeg','image/png','image/webp'],
    'hotel-media allows only JPEG, PNG and WebP');
  perform pg_temp.assert(
    exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'hotel media public read'),
    'storage public-read policy exists');
  perform pg_temp.assert(
    not exists (
      select 1 from pg_policies
      where tablename = 'objects' and policyname = 'hotel media public read' and cmd <> 'SELECT'
    ),
    'the storage policy grants SELECT only — no anon insert or delete');
end $$;

-- --- confirmed room categories ---------------------------------------------
do $$
begin
  perform pg_temp.assert(
    (select count(*) from public.room_categories where is_active and slug is not null) = 4,
    'exactly four active room categories');

  perform pg_temp.assert(
    (select count(*) from public.room_categories
     where (slug, base_price_uzs, capacity) in (
       ('standard-double-twin', 500000, 2),
       ('twin-suite',           650000, 2),
       ('deluxe-triple',        700700, 3),
       ('deluxe-quadruple',    1000000, 4)
     )) = 4,
    'all four categories carry the confirmed slug, price and capacity');
end $$;

-- --- hotel configuration ---------------------------------------------------
do $$
begin
  perform pg_temp.assert((select count(*) from public.hotels) = 1, 'exactly one hotel row');
  perform pg_temp.assert(
    exists (select 1 from public.hotels
            where phone = '+998983624949'
              and email = 'hsolief@gmail.com'
              and telegram_url = 'https://t.me/soliefhotel'
              and check_in_time = '14:00'
              and check_out_time = '12:00'),
    'hotel row carries the confirmed contact details and check-in/out times');
end $$;

-- --- constraints actually reject bad values --------------------------------
do $$
declare hotel uuid;
begin
  select id into hotel from public.hotels limit 1;

  begin
    update public.hotels set google_rating = 5.1 where id = hotel;
    raise exception 'ASSERTION FAILED: a rating above 5 was accepted';
  exception when check_violation then
    raise notice '  ok   google_rating > 5 is rejected';
  end;

  begin
    update public.hotels set google_review_count = -1 where id = hotel;
    raise exception 'ASSERTION FAILED: a negative review count was accepted';
  exception when check_violation then
    raise notice '  ok   negative google_review_count is rejected';
  end;

  begin
    update public.hotels set usd_rate_uzs = 0 where id = hotel;
    raise exception 'ASSERTION FAILED: a zero USD rate was accepted';
  exception when check_violation then
    raise notice '  ok   non-positive usd_rate_uzs is rejected';
  end;

  begin
    update public.hotels set check_in_time = '25:00' where id = hotel;
    raise exception 'ASSERTION FAILED: an out-of-range check-in time was accepted';
  exception when check_violation then
    raise notice '  ok   check_in_time 25:00 is rejected';
  end;

  begin
    update public.hotels set check_in_time = '2pm' where id = hotel;
    raise exception 'ASSERTION FAILED: a malformed check-in time was accepted';
  exception when check_violation then
    raise notice '  ok   malformed check_in_time is rejected';
  end;
end $$;

-- --- the booking RPC actually works end to end -----------------------------
do $$
declare
  result record;
  category uuid;
begin
  select id into category from public.room_categories where slug = 'standard-double-twin';

  select * into result from public.create_public_booking_request(
    'SOL-MIGRATION-TEST', 'Migration Harness', '+998900000000', null, 2,
    current_date + 10, current_date + 12, 'Standard Double or Twin Room',
    'Phone', 'EN', null, 'website',
    category, 500000, 2, 1000000
  );

  perform pg_temp.assert(result.booking_request_id is not null, 'booking RPC returns a booking id');
  perform pg_temp.assert(
    (select nights from public.booking_requests where id = result.booking_request_id) = 2,
    'booking RPC stores the nights snapshot');
  perform pg_temp.assert(
    (select estimated_total_uzs from public.booking_requests where id = result.booking_request_id) = 1000000,
    'booking RPC stores the estimated total snapshot');
  perform pg_temp.assert(
    (select room_category_id from public.booking_requests where id = result.booking_request_id) = category,
    'booking RPC links the booking to its room category');

  -- clean up the harness row
  delete from public.booking_requests where id = result.booking_request_id;
  delete from public.guests where id = result.guest_id;
end $$;

-- --- the RPC still rejects invalid input -----------------------------------
do $$
declare category uuid;
begin
  select id into category from public.room_categories where slug = 'standard-double-twin';

  begin
    perform public.create_public_booking_request(
      'SOL-BAD-DATES', 'Migration Harness', '+998900000000', null, 2,
      current_date + 12, current_date + 10, 'Standard Double or Twin Room',
      'Phone', 'EN', null, 'website', category, 500000, 2, 1000000);
    raise exception 'ASSERTION FAILED: check-out before check-in was accepted';
  exception when sqlstate '22023' then
    raise notice '  ok   RPC rejects check-out before check-in';
  end;

  begin
    perform public.create_public_booking_request(
      'SOL-BAD-NAME', 'X', '+998900000000', null, 2,
      current_date + 10, current_date + 12, 'Standard Double or Twin Room',
      'Phone', 'EN', null, 'website', category, 500000, 2, 1000000);
    raise exception 'ASSERTION FAILED: a one-character name was accepted';
  exception when sqlstate '22023' then
    raise notice '  ok   RPC rejects an invalid name';
  end;

  begin
    perform public.create_public_booking_request(
      'SOL-NO-CONTACT', 'Migration Harness', null, null, 2,
      current_date + 10, current_date + 12, 'Standard Double or Twin Room',
      'Phone', 'EN', null, 'website', category, 500000, 2, 1000000);
    raise exception 'ASSERTION FAILED: a booking with no contact channel was accepted';
  exception when sqlstate '22023' then
    raise notice '  ok   RPC requires a phone or an email';
  end;
end $$;

-- --- 0002 is non-destructive ------------------------------------------------
do $$
begin
  perform pg_temp.assert(
    (select count(*) from public.staff_members) = 0,
    'seed no longer creates sample staff');
  perform pg_temp.assert(
    (select count(*) from public.rooms) = 0,
    'seed no longer invents physical room numbers');
end $$;
