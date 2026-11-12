-- AgriVerse: run once in Supabase -> SQL Editor
create extension if not exists "pgcrypto";

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  specification text,
  plant_and_origin text,      -- shown as "Size & Dimensions"
  uses_and_benefits text,
  primary_image_url text,
  hover_image_url text,
  show_on_home boolean default false,   -- admin picks up to 4 products to feature on the Home page
  created_at timestamptz default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('product','general')),
  name text not null,
  company text,
  email text,
  phone text,
  country text,               -- shown as "Location"
  role text,
  message text,
  product_id uuid references products(id) on delete set null,
  product_name text,
  ingredients jsonb default '[]',
  end_application text[] default '{}',
  documents_needed text[] default '{}',
  is_solved boolean default false,
  created_at timestamptz default now()
);

create table settings (
  id uuid primary key default gen_random_uuid(),
  admin_email text,
  updated_at timestamptz default now()
);

create table admin_whitelist (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table products           enable row level security;
alter table enquiries          enable row level security;
alter table settings           enable row level security;
alter table admin_whitelist    enable row level security;

create or replace function is_admin() returns boolean
language sql security definer set search_path = public as
$$ select exists (select 1 from admin_whitelist where user_id = auth.uid()) $$;

-- public read of catalogue, public enquiry submission
create policy "read products"    on products           for select using (true);
create policy "submit enquiries" on enquiries          for insert with check (true);

-- admin everything
create policy "admin products"   on products           for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin enquiries"  on enquiries          for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin settings"   on settings           for all to authenticated using (is_admin()) with check (is_admin());
create policy "own whitelist row" on admin_whitelist   for select to authenticated using (user_id = auth.uid());

-- image buckets
insert into storage.buckets (id, name, public) values ('product-images','product-images',true), ('site-assets','site-assets',true) on conflict do nothing;
create policy "public read images" on storage.objects for select using (bucket_id in ('product-images','site-assets'));
create policy "admin write images" on storage.objects for all to authenticated
  using (bucket_id in ('product-images','site-assets') and is_admin())
  with check (bucket_id in ('product-images','site-assets') and is_admin());


-- AFTER creating the admin user in Authentication -> Users, run:
-- insert into admin_whitelist (user_id) select id from auth.users where email = 'CLIENT_EMAIL';
