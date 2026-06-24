insert into public.hotels (name, address, latitude, longitude, phone, email)
values ('Solief Hotel', 'Naqqoshlik 12, 100185, Tashkent, Uzbekistan', 41.2683062, 69.2038021, '+998 71 208 49 49', 'info@soliefhotel.uz')
on conflict do nothing;

with hotel as (select id from public.hotels where name = 'Solief Hotel' limit 1)
insert into public.room_categories (hotel_id, name_en, name_ru, name_uz, base_price_uzs, capacity)
select id, 'Standard Double Room', 'Стандартный двухместный номер', 'Standart ikki kishilik xona', 449000, 2 from hotel
union all
select id, 'Standard Twin Room', 'Стандартный номер с двумя кроватями', 'Standart ikki alohida karavotli xona', 449000, 2 from hotel
union all
select id, 'Standard Triple Room', 'Стандартный трёхместный номер', 'Standart uch kishilik xona', 599000, 3 from hotel
union all
select id, 'Standard Quadruple / Family Room', 'Семейный четырёхместный номер', 'Oilaviy to‘rt kishilik xona', 749000, 4 from hotel;

with hotel as (select id from public.hotels where name = 'Solief Hotel' limit 1),
category as (select id, name_en from public.room_categories)
insert into public.rooms (hotel_id, room_category_id, room_number, floor)
select hotel.id, category.id, room_number, floor
from hotel, category, (values
  ('101','1','Standard Double Room'),
  ('102','1','Standard Twin Room'),
  ('201','2','Standard Triple Room'),
  ('202','2','Standard Quadruple / Family Room')
) as seed(room_number, floor, category_name)
where category.name_en = seed.category_name;

insert into public.staff_members (full_name, email, phone, role, status, notes)
values
  ('Reception Sample', 'reception@example.com', '+998 00 000 00 01', 'receptionist', 'active', 'Development seed staff'),
  ('Manager Sample', 'manager@example.com', '+998 00 000 00 02', 'manager', 'active', 'Development seed staff');
