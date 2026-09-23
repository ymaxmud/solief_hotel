-- Solief Hotel baseline configuration.
--
-- This file contains real launch configuration only. It creates no sample
-- staff, no sample guests, no sample bookings and no invented physical room
-- numbers — the owner enters the real room inventory in /admin/rooms, and an
-- empty rooms table is correct until they do.
--
-- Safe to re-run: every statement is idempotent.

insert into public.hotels (
  name, address, latitude, longitude, phone, email,
  whatsapp_e164, whatsapp_url, telegram_url, google_maps_url,
  check_in_time, check_out_time
)
select
  'Solief Hotel',
  'Naqqoshlik 12, 100185, Tashkent, Uzbekistan',
  41.2683062,
  69.2038021,
  '+998983624949',
  'hsolief@gmail.com',
  '998983624949',
  'https://wa.me/998983624949',
  'https://t.me/soliefhotel',
  'https://maps.app.goo.gl/QTJVejTBReA73t3u9',
  '14:00',
  '12:00'
where not exists (select 1 from public.hotels);

-- The four confirmed launch room categories, keyed by the public slug the
-- website uses. Prices are nightly UZS.
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
