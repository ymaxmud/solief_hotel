create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'manager', 'receptionist');
create type public.staff_status as enum ('active', 'inactive');
create type public.booking_status as enum ('new', 'contacted', 'confirmed', 'rejected', 'cancelled', 'no_show');
create type public.guest_status as enum ('lead', 'expected', 'checked_in', 'checked_out', 'cancelled');
create type public.room_status as enum ('available', 'occupied', 'cleaning', 'maintenance', 'out_of_service');
create type public.room_cleaning_status as enum ('clean', 'dirty', 'in_progress', 'inspected');
create type public.attendance_method as enum ('qr', 'manual_admin', 'manual_manager');
create type public.attendance_status as enum ('open', 'closed', 'corrected');
create type public.service_type as enum ('reception', 'cleaning', 'luggage', 'airport_transfer', 'maintenance', 'complaint', 'room_service', 'other');
create type public.service_status as enum ('open', 'in_progress', 'done', 'cancelled');
create type public.notification_channel as enum ('email', 'whatsapp');
create type public.notification_status as enum ('pending', 'sent', 'failed', 'manual_required');

create table public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role public.user_role not null default 'receptionist',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,
  phone text,
  role public.user_role not null default 'receptionist',
  status public.staff_status not null default 'active',
  notes text,
  created_by uuid references public.app_users(id),
  updated_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Solief Hotel',
  address text,
  latitude numeric,
  longitude numeric,
  phone text,
  email text,
  whatsapp_e164 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.room_categories (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references public.hotels(id) on delete cascade,
  name_en text not null,
  name_ru text not null,
  name_uz text not null,
  description_en text,
  description_ru text,
  description_uz text,
  base_price_uzs numeric,
  capacity integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references public.hotels(id) on delete cascade,
  room_category_id uuid references public.room_categories(id),
  room_number text not null,
  floor text,
  status public.room_status not null default 'available',
  cleaning_status public.room_cleaning_status not null default 'clean',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(hotel_id, room_number)
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  preferred_language text check (preferred_language in ('EN','RU','UZ')),
  preferred_contact text,
  country text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  public_reference text unique not null,
  guest_id uuid references public.guests(id),
  full_name text not null,
  phone text,
  email text,
  guests_count integer not null,
  check_in date not null,
  check_out date not null,
  room_type text not null,
  preferred_contact text not null,
  preferred_language text not null,
  message text,
  status public.booking_status not null default 'new',
  assigned_staff_id uuid references public.staff_members(id),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stays (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references public.guests(id),
  booking_request_id uuid references public.booking_requests(id),
  room_id uuid references public.rooms(id),
  status public.guest_status not null default 'expected',
  check_in_at timestamptz,
  check_out_at timestamptz,
  expected_check_in date,
  expected_check_out date,
  adults integer default 1,
  children integer default 0,
  notes text,
  created_by uuid references public.app_users(id),
  updated_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance_qr_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  purpose text not null check (purpose in ('check_in','check_out')),
  expires_at timestamptz not null,
  created_by uuid references public.app_users(id),
  used_at timestamptz,
  used_by_staff_id uuid references public.staff_members(id),
  created_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  staff_member_id uuid references public.staff_members(id) not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  check_in_method public.attendance_method,
  check_out_method public.attendance_method,
  check_in_lat numeric,
  check_in_lng numeric,
  check_out_lat numeric,
  check_out_lng numeric,
  check_in_distance_meters numeric,
  check_out_distance_meters numeric,
  status public.attendance_status not null default 'open',
  correction_reason text,
  corrected_by uuid references public.app_users(id),
  created_by uuid references public.app_users(id),
  updated_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index attendance_one_open_per_staff
  on public.attendance_records(staff_member_id)
  where status = 'open' and check_out_at is null;

create table public.service_assignments (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid references public.stays(id),
  guest_id uuid references public.guests(id) not null,
  staff_member_id uuid references public.staff_members(id) not null,
  booking_request_id uuid references public.booking_requests(id),
  service_type public.service_type not null,
  status public.service_status not null default 'open',
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_by uuid references public.app_users(id),
  updated_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  channel public.notification_channel not null,
  status public.notification_status not null default 'pending',
  booking_request_id uuid references public.booking_requests(id),
  recipient text not null,
  subject text,
  body text,
  provider_response jsonb,
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.app_users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_json jsonb,
  after_json jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['app_users','staff_members','hotels','room_categories','rooms','guests','booking_requests','stays','attendance_records','service_assignments']
  loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.current_app_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.app_users where id = auth.uid() and is_active = true;
$$;

create or replace function public.current_staff_member_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select sm.id
  from public.staff_members sm
  join public.app_users au on lower(au.email) = lower(sm.email)
  where au.id = auth.uid()
  limit 1;
$$;

alter table public.app_users enable row level security;
alter table public.staff_members enable row level security;
alter table public.hotels enable row level security;
alter table public.room_categories enable row level security;
alter table public.rooms enable row level security;
alter table public.guests enable row level security;
alter table public.booking_requests enable row level security;
alter table public.stays enable row level security;
alter table public.attendance_qr_tokens enable row level security;
alter table public.attendance_records enable row level security;
alter table public.service_assignments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "users read own profile" on public.app_users for select using (id = auth.uid());
create policy "admins manage all users" on public.app_users for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

create policy "staff read active staff" on public.staff_members for select using (status = 'active' and public.current_app_role() in ('admin','manager','receptionist'));
create policy "admin manager write staff" on public.staff_members for insert with check (public.current_app_role() in ('admin','manager'));
create policy "admin manager update staff" on public.staff_members for update using (public.current_app_role() in ('admin','manager')) with check (public.current_app_role() in ('admin','manager'));

create policy "hotel readable by staff" on public.hotels for select using (public.current_app_role() in ('admin','manager','receptionist'));
create policy "hotel writable by managers" on public.hotels for all using (public.current_app_role() in ('admin','manager')) with check (public.current_app_role() in ('admin','manager'));

create policy "room categories read" on public.room_categories for select using (public.current_app_role() in ('admin','manager','receptionist'));
create policy "room categories write" on public.room_categories for all using (public.current_app_role() in ('admin','manager')) with check (public.current_app_role() in ('admin','manager'));
create policy "rooms read" on public.rooms for select using (public.current_app_role() in ('admin','manager','receptionist'));
create policy "rooms write" on public.rooms for all using (public.current_app_role() in ('admin','manager')) with check (public.current_app_role() in ('admin','manager'));

create policy "guests read" on public.guests for select using (public.current_app_role() in ('admin','manager','receptionist'));
create policy "guests write" on public.guests for all using (public.current_app_role() in ('admin','manager','receptionist')) with check (public.current_app_role() in ('admin','manager','receptionist'));

create policy "booking requests read" on public.booking_requests for select using (public.current_app_role() in ('admin','manager','receptionist'));
create policy "booking requests update" on public.booking_requests for update using (public.current_app_role() in ('admin','manager','receptionist')) with check (public.current_app_role() in ('admin','manager','receptionist'));

create policy "stays read" on public.stays for select using (public.current_app_role() in ('admin','manager','receptionist'));
create policy "stays write" on public.stays for all using (public.current_app_role() in ('admin','manager','receptionist')) with check (public.current_app_role() in ('admin','manager','receptionist'));

create policy "qr tokens manager admin" on public.attendance_qr_tokens for all using (public.current_app_role() in ('admin','manager')) with check (public.current_app_role() in ('admin','manager'));

create policy "attendance read admin manager" on public.attendance_records for select using (public.current_app_role() in ('admin','manager'));
create policy "attendance read own receptionist" on public.attendance_records for select using (staff_member_id = public.current_staff_member_id());
create policy "attendance correct admin manager" on public.attendance_records for update using (public.current_app_role() in ('admin','manager')) with check (public.current_app_role() in ('admin','manager'));

create policy "services read" on public.service_assignments for select using (public.current_app_role() in ('admin','manager','receptionist'));
create policy "services write" on public.service_assignments for all using (public.current_app_role() in ('admin','manager','receptionist')) with check (public.current_app_role() in ('admin','manager','receptionist'));

create policy "notifications read staff" on public.notifications for select using (public.current_app_role() in ('admin','manager','receptionist'));
create policy "audit admin read" on public.audit_logs for select using (public.current_app_role() = 'admin');

insert into public.hotels (name, address, latitude, longitude, phone, email)
values ('Solief Hotel', 'Naqqoshlik 12, 100185, Tashkent, Uzbekistan', 41.2683062, 69.2038021, '+998 71 208 49 49', 'info@soliefhotel.uz')
on conflict do nothing;
