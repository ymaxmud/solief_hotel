-- Solief Hotel — production completion migration.
--
-- 1. Owner-editable public website configuration on public.hotels
--    (contact channels, check-in/out times, Google review display, currency
--    display rates) so the hotel can change operational content without a
--    code change or a deploy.
-- 2. public.room_categories gains a stable public slug plus the descriptive
--    fields the public site renders, and the four confirmed launch categories
--    are normalized in place.
-- 3. public.booking_requests gains a server-calculated price snapshot so a
--    later price change never rewrites the estimate a guest was shown.
-- 4. public.hotel_amenities — a controlled catalogue the owner can switch on
--    and off, rather than free-form icon/code entry.
--
-- Forward-only: existing applied migrations are left untouched.

-- ---------------------------------------------------------------------------
-- 1. Hotel public configuration
-- ---------------------------------------------------------------------------
alter table public.hotels
  add column if not exists telegram_url text,
  add column if not exists whatsapp_url text,
  add column if not exists google_maps_url text,
  add column if not exists check_in_time text not null default '14:00',
  add column if not exists check_out_time text not null default '12:00',
  add column if not exists google_rating numeric,
  add column if not exists google_review_count integer,
  add column if not exists google_reviews_url text,
  add column if not exists usd_rate_uzs numeric not null default 12600,
  add column if not exists eur_rate_uzs numeric not null default 13700,
  add column if not exists is_public boolean not null default true;

-- Guard rails so a bad admin entry can never render an invalid rating or a
-- divide-by-zero currency conversion on the public site.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'hotels_google_rating_range') then
    alter table public.hotels
      add constraint hotels_google_rating_range
      check (google_rating is null or (google_rating >= 0 and google_rating <= 5));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'hotels_google_review_count_nonneg') then
    alter table public.hotels
      add constraint hotels_google_review_count_nonneg
      check (google_review_count is null or google_review_count >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'hotels_currency_rates_positive') then
    alter table public.hotels
      add constraint hotels_currency_rates_positive
      check (usd_rate_uzs > 0 and eur_rate_uzs > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'hotels_check_times_format') then
    alter table public.hotels
      add constraint hotels_check_times_format
      check (check_in_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' and check_out_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
  end if;
end $$;

-- Normalize the single hotel row to the owner-confirmed launch values. The
-- seeded row carried a placeholder phone and an email that is not in use.
update public.hotels
set
  name = 'Solief Hotel',
  address = 'Naqqoshlik 12, 100185, Tashkent, Uzbekistan',
  latitude = 41.2683062,
  longitude = 69.2038021,
  phone = '+998983624949',
  email = 'hsolief@gmail.com',
  whatsapp_e164 = '998983624949',
  whatsapp_url = 'https://wa.me/998983624949',
  telegram_url = 'https://t.me/soliefhotel',
  google_maps_url = 'https://maps.app.goo.gl/QTJVejTBReA73t3u9',
  check_in_time = '14:00',
  check_out_time = '12:00',
  updated_at = now()
where name = 'Solief Hotel'
   or phone in ('+998 71 208 49 49')
   or email in ('info@soliefhotel.uz');

-- If no hotel row exists yet, create the single real one.
insert into public.hotels (
  name, address, latitude, longitude, phone, email,
  whatsapp_e164, whatsapp_url, telegram_url, google_maps_url,
  check_in_time, check_out_time
)
select
  'Solief Hotel', 'Naqqoshlik 12, 100185, Tashkent, Uzbekistan', 41.2683062, 69.2038021,
  '+998983624949', 'hsolief@gmail.com',
  '998983624949', 'https://wa.me/998983624949', 'https://t.me/soliefhotel',
  'https://maps.app.goo.gl/QTJVejTBReA73t3u9',
  '14:00', '12:00'
where not exists (select 1 from public.hotels);

-- ---------------------------------------------------------------------------
-- 2. Room categories: public slug + descriptive fields
-- ---------------------------------------------------------------------------
alter table public.room_categories
  add column if not exists slug text,
  add column if not exists area_sqm integer,
  add column if not exists bed_type_en text,
  add column if not exists bed_type_ru text,
  add column if not exists bed_type_uz text,
  add column if not exists display_order integer not null default 0,
  add column if not exists breakfast_included boolean not null default true,
  add column if not exists free_cancellation boolean not null default true;

-- Map the development seed categories onto the four confirmed launch
-- categories, matching by the seeded English name so no row is orphaned.
update public.room_categories set slug = 'standard-double-twin'
  where slug is null and name_en in ('Standard Double Room', 'Standard Twin Room', 'Standard Double or Twin Room');
update public.room_categories set slug = 'twin-suite'
  where slug is null and name_en in ('Twin Suite');
update public.room_categories set slug = 'deluxe-triple'
  where slug is null and name_en in ('Standard Triple Room', 'Deluxe Triple Room');
update public.room_categories set slug = 'deluxe-quadruple'
  where slug is null and name_en in ('Standard Quadruple / Family Room', 'Deluxe Quadruple Room');

-- The seed created two separate "Double"/"Twin" rows that are one category in
-- the confirmed launch data. Keep the oldest, retarget any rooms that point at
-- the duplicate, and deactivate the surplus row rather than deleting a row that
-- other records may reference.
with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from public.room_categories
  where slug is not null
),
keeper as (select slug, id from ranked where rn = 1)
update public.rooms r
set room_category_id = k.id
from ranked x
join keeper k on k.slug = x.slug
where r.room_category_id = x.id and x.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from public.room_categories
  where slug is not null
)
update public.room_categories c
set is_active = false, slug = null, updated_at = now()
from ranked
where c.id = ranked.id and ranked.rn > 1;

-- Only now that each slug is held by exactly one row can the uniqueness be
-- enforced. Creating it earlier would reject the de-duplication itself.
create unique index if not exists room_categories_slug_key on public.room_categories (slug)
  where slug is not null;

-- Insert any confirmed category that does not exist yet.
with hotel as (select id from public.hotels order by created_at limit 1),
seed(slug, name_en, name_ru, name_uz, price, capacity, area, ord) as (
  values
    ('standard-double-twin', 'Standard Double or Twin Room', 'Стандартный двухместный номер', 'Standart ikki kishilik xona', 500000::numeric, 2, 20, 1),
    ('twin-suite', 'Twin Suite', 'Твин-люкс', 'Tvin-lyuks', 650000::numeric, 2, 30, 2),
    ('deluxe-triple', 'Deluxe Triple Room', 'Делюкс трёхместный номер', 'Delyuks uch kishilik xona', 700700::numeric, 3, 30, 3),
    ('deluxe-quadruple', 'Deluxe Quadruple Room', 'Делюкс четырёхместный номер', 'Delyuks to‘rt kishilik xona', 1000000::numeric, 4, 35, 4)
)
insert into public.room_categories (
  hotel_id, slug, name_en, name_ru, name_uz, base_price_uzs, capacity, area_sqm, display_order, is_active
)
select hotel.id, seed.slug, seed.name_en, seed.name_ru, seed.name_uz, seed.price, seed.capacity, seed.area, seed.ord, true
from hotel, seed
where not exists (select 1 from public.room_categories c where c.slug = seed.slug);

-- Normalize the confirmed names, prices and capacities on whichever rows now
-- carry the four slugs.
with seed(slug, name_en, name_ru, name_uz, price, capacity, area, ord) as (
  values
    ('standard-double-twin', 'Standard Double or Twin Room', 'Стандартный двухместный номер', 'Standart ikki kishilik xona', 500000::numeric, 2, 20, 1),
    ('twin-suite', 'Twin Suite', 'Твин-люкс', 'Tvin-lyuks', 650000::numeric, 2, 30, 2),
    ('deluxe-triple', 'Deluxe Triple Room', 'Делюкс трёхместный номер', 'Delyuks uch kishilik xona', 700700::numeric, 3, 30, 3),
    ('deluxe-quadruple', 'Deluxe Quadruple Room', 'Делюкс четырёхместный номер', 'Delyuks to‘rt kishilik xona', 1000000::numeric, 4, 35, 4)
)
update public.room_categories c
set name_en = seed.name_en,
    name_ru = seed.name_ru,
    name_uz = seed.name_uz,
    base_price_uzs = seed.price,
    capacity = seed.capacity,
    area_sqm = coalesce(c.area_sqm, seed.area),
    display_order = seed.ord,
    is_active = true,
    updated_at = now()
from seed
where c.slug = seed.slug;

-- ---------------------------------------------------------------------------
-- 3. Booking request price snapshot
-- ---------------------------------------------------------------------------
-- These are an ESTIMATE recorded at submission time, not a payment and not a
-- confirmed reservation. They exist so a later price change never rewrites what
-- a guest was quoted.
alter table public.booking_requests
  add column if not exists room_category_id uuid references public.room_categories(id),
  add column if not exists nightly_price_uzs numeric,
  add column if not exists nights integer,
  add column if not exists estimated_total_uzs numeric;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'booking_requests_snapshot_nonneg') then
    alter table public.booking_requests
      add constraint booking_requests_snapshot_nonneg
      check (
        (nightly_price_uzs is null or nightly_price_uzs >= 0)
        and (nights is null or nights > 0)
        and (estimated_total_uzs is null or estimated_total_uzs >= 0)
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Hotel amenity catalogue (controlled, not free-form)
-- ---------------------------------------------------------------------------
create table if not exists public.hotel_amenities (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references public.hotels(id) on delete cascade,
  -- Matches a key in src/content/amenities.ts. The catalogue is code-defined so
  -- the owner toggles availability instead of entering icons or markup.
  amenity_key text not null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hotel_id, amenity_key)
);

alter table public.hotel_amenities enable row level security;

drop policy if exists "hotel amenities read" on public.hotel_amenities;
create policy "hotel amenities read" on public.hotel_amenities
  for select using (public.current_app_role() in ('admin','manager','receptionist'));

drop policy if exists "hotel amenities write" on public.hotel_amenities;
create policy "hotel amenities write" on public.hotel_amenities
  for all using (public.current_app_role() in ('admin','manager'))
  with check (public.current_app_role() in ('admin','manager'));

drop trigger if exists set_hotel_amenities_updated_at on public.hotel_amenities;
create trigger set_hotel_amenities_updated_at
  before update on public.hotel_amenities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Public booking RPC — accept the server-calculated snapshot
-- ---------------------------------------------------------------------------
-- New overload. The original 12-argument signature is dropped so there is
-- exactly one public booking entry point and no stale grant remains.
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
  p_source text,
  p_room_category_id uuid,
  p_nightly_price_uzs numeric,
  p_nights integer,
  p_estimated_total_uzs numeric
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
  if p_guests_count is null or p_guests_count < 1 or p_guests_count > 30 then
    raise exception 'invalid_guests_count' using errcode = '22023';
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
    -- Only backfill missing contact channels; never overwrite a stored guest
    -- identity from an unauthenticated public submission.
    update public.guests
    set phone = coalesce(phone, v_phone),
        email = coalesce(email, v_email),
        updated_at = now()
    where id = v_guest_id;
  end if;

  insert into public.booking_requests(
    public_reference, guest_id, full_name, phone, email, guests_count,
    check_in, check_out, room_type, preferred_contact, preferred_language,
    message, source, room_category_id, nightly_price_uzs, nights, estimated_total_uzs
  )
  values (
    p_reference, v_guest_id, trim(p_full_name), v_phone, v_email, p_guests_count,
    p_check_in, p_check_out, p_room_type, p_preferred_contact, p_preferred_language,
    p_message, coalesce(nullif(p_source, ''), 'website'),
    p_room_category_id, p_nightly_price_uzs, p_nights, p_estimated_total_uzs
  )
  returning id into v_booking_id;

  return query select v_booking_id, v_guest_id, p_reference;
end;
$$;

revoke all on function public.create_public_booking_request(
  text, text, text, text, integer, date, date, text, text, text, text, text, uuid, numeric, integer, numeric
) from public;
grant execute on function public.create_public_booking_request(
  text, text, text, text, integer, date, date, text, text, text, text, text, uuid, numeric, integer, numeric
) to service_role;

drop function if exists public.create_public_booking_request(
  text, text, text, text, integer, date, date, text, text, text, text, text
);
