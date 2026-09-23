-- Owner-managed hotel photography.
--
-- Images are stored in a Supabase Storage bucket and described by a metadata
-- row so the website can order them, group them by room category, and carry
-- localized alt text.
--
-- Read is public (hotel photos are public content). Write and delete are NOT:
-- they go through /api/admin/media, which authenticates the staff member and
-- checks their role server-side before using the secret key. No storage policy
-- grants insert or delete to anon or authenticated, so the browser cannot
-- upload or overwrite anything directly.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hotel-media',
  'hotel-media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public read of this bucket only. Nothing else is granted to anon.
drop policy if exists "hotel media public read" on storage.objects;
create policy "hotel media public read" on storage.objects
  for select using (bucket_id = 'hotel-media');

create table if not exists public.hotel_images (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references public.hotels(id) on delete cascade,
  -- Object key inside the hotel-media bucket. Generated server-side and
  -- collision-resistant; never taken from the uploaded filename.
  storage_path text not null unique,
  room_category_id uuid references public.room_categories(id) on delete set null,
  -- true when the image should also appear in the public gallery.
  in_gallery boolean not null default true,
  display_order integer not null default 0,
  is_active boolean not null default true,
  alt_en text,
  alt_ru text,
  alt_uz text,
  content_type text not null,
  size_bytes integer,
  uploaded_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hotel_images_content_type_allowed
    check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  constraint hotel_images_size_positive
    check (size_bytes is null or (size_bytes > 0 and size_bytes <= 5242880))
);

create index if not exists hotel_images_category_order_idx
  on public.hotel_images (room_category_id, display_order);

create index if not exists hotel_images_gallery_order_idx
  on public.hotel_images (in_gallery, display_order) where is_active;

alter table public.hotel_images enable row level security;

-- Staff read through the CRM. Public rendering uses the secret key server-side,
-- so no anon policy is needed here and none is granted.
drop policy if exists "hotel images read" on public.hotel_images;
create policy "hotel images read" on public.hotel_images
  for select using (public.current_app_role() in ('admin','manager','receptionist'));

drop policy if exists "hotel images write" on public.hotel_images;
create policy "hotel images write" on public.hotel_images
  for all using (public.current_app_role() in ('admin','manager'))
  with check (public.current_app_role() in ('admin','manager'));

drop trigger if exists set_hotel_images_updated_at on public.hotel_images;
create trigger set_hotel_images_updated_at
  before update on public.hotel_images
  for each row execute function public.set_updated_at();
