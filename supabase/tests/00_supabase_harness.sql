-- Supabase-shaped prerequisites for testing migrations on a plain PostgreSQL
-- instance.
--
-- The migrations assume a Supabase project: the auth and storage schemas, the
-- anon / authenticated / service_role roles, and auth.uid(). None of that exists
-- in stock PostgreSQL, so this harness creates the minimum needed for the
-- migrations to run and be inspected. It is a TEST FIXTURE ONLY and must never
-- be applied to a real project.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then create role supabase_admin nologin; end if;
end $$;

create schema if not exists auth;
create schema if not exists storage;
create schema if not exists extensions;

-- auth.users — migrations reference it for app_users.id.
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

-- auth.uid() — used by the RLS helper functions.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- storage.buckets / storage.objects — used by the hotel-media migration.
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[],
  created_at timestamptz not null default now()
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid,
  created_at timestamptz not null default now()
);

alter table storage.objects enable row level security;

grant usage on schema auth, storage, extensions to anon, authenticated, service_role;
