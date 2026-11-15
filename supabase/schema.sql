-- =====================================================================
-- AgriVerse / Dharaa  -  complete database setup for Supabase
-- Run this whole file once in:  Supabase Dashboard -> SQL Editor -> New query
-- It is safe to run again later (it only adds what is missing).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- 1. TABLES -------------------------------------------------

create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  short_description text,
  description       text,
  specification     text,
  plant_and_origin  text,                    -- shown on the website as "Size & Dimensions"
  uses_and_benefits text,
  primary_image_url text,
  hover_image_url   text,
  show_on_home      boolean default false,   -- tick in admin to feature on the Home page (max 4)
  created_at        timestamptz default now()
);
alter table products add column if not exists show_on_home boolean default false;

create table if not exists enquiries (
  id               uuid primary key default gen_random_uuid(),
  type             text not null default 'contact'
                   check (type in ('product', 'general', 'contact')),
                   -- product = "Enquire" on a product, general = Enquire Now form, contact = Contact Us page
  name             text not null,
  company          text,
  email            text,
  phone            text,
  country          text,                     -- shown as "Location"
  role             text,
  message          text,
  product_id       uuid references products(id) on delete set null,
  product_name     text,
  ingredients      jsonb default '[]',       -- list of requested products {herb, form, qty}
  end_application  text[] default '{}',      -- crops / use
  documents_needed text[] default '{}',      -- what the customer needs (quote, sample ...)
  is_solved        boolean default false,
  created_at       timestamptz default now()
);
-- if you ran an older version of this file, allow the 'contact' type:
alter table enquiries drop constraint if exists enquiries_type_check;
alter table enquiries add constraint enquiries_type_check check (type in ('product', 'general', 'contact'));

create table if not exists settings (
  id          uuid primary key default gen_random_uuid(),
  admin_email text,                          -- where new-enquiry emails are sent
  updated_at  timestamptz default now()
);

-- Public contact details shown on the website (editable in Admin -> Settings)
create table if not exists site_contact (
  id            int primary key default 1 check (id = 1),   -- single row
  address       text,
  phone         text,
  email         text,
  updated_at    timestamptz default now()
);
insert into site_contact (id, address, phone, email)
values (1, E'Your office address line 1,\nLine 2, City - PIN,\nState, India', '+91 00000 00000', 'info@agriverse.in')
on conflict (id) do nothing;

create table if not exists admin_whitelist (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- 2. SECURITY (Row Level Security) --------------------------

alter table products        enable row level security;
alter table enquiries       enable row level security;
alter table settings        enable row level security;
alter table site_contact    enable row level security;
alter table admin_whitelist enable row level security;

create or replace function is_admin() returns boolean
language sql security definer set search_path = public as
$$ select exists (select 1 from admin_whitelist where user_id = auth.uid()) $$;

-- Visitors: can read products and send enquiries. Nothing else.
drop policy if exists "read products"    on products;
drop policy if exists "submit enquiries" on enquiries;
create policy "read products"    on products  for select using (true);
create policy "submit enquiries" on enquiries for insert with check (true);

-- Admin (only users listed in admin_whitelist): full access.
drop policy if exists "admin products"    on products;
drop policy if exists "admin enquiries"   on enquiries;
drop policy if exists "admin settings"    on settings;
drop policy if exists "read contact"      on site_contact;
drop policy if exists "admin contact"     on site_contact;
drop policy if exists "own whitelist row" on admin_whitelist;
create policy "admin products"    on products        for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin enquiries"   on enquiries       for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin settings"    on settings        for all to authenticated using (is_admin()) with check (is_admin());
create policy "read contact"      on site_contact    for select using (true);
create policy "admin contact"     on site_contact    for all to authenticated using (is_admin()) with check (is_admin());
create policy "own whitelist row" on admin_whitelist for select to authenticated using (user_id = auth.uid());

-- ---------- 3. IMAGE STORAGE ------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true), ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
drop policy if exists "admin write images" on storage.objects;
create policy "public read images" on storage.objects for select
  using (bucket_id in ('product-images', 'site-assets'));
create policy "admin write images" on storage.objects for all to authenticated
  using      (bucket_id in ('product-images', 'site-assets') and is_admin())
  with check (bucket_id in ('product-images', 'site-assets') and is_admin());

-- =====================================================================
-- 4. DO THESE TWO THINGS AFTER RUNNING THE ABOVE  (edit the e-mail first)
-- =====================================================================

-- (a) Create the admin login:  Dashboard -> Authentication -> Users -> Add user
--     (tick "Auto confirm user"), then run this to allow that user into the admin panel:
--
-- insert into admin_whitelist (user_id)
-- select id from auth.users where email = 'ADMIN_EMAIL_HERE'
-- on conflict do nothing;

-- (b) Where should new-enquiry emails go?  (can also be changed later in Admin -> Settings)
--
-- insert into settings (admin_email) values ('ADMIN_EMAIL_HERE');

-- =====================================================================
-- 5. OPTIONAL - send an email for every new enquiry
--    First deploy the "send-enquiry-email" function (see supabase/SETUP.md),
--    then fill the 3 placeholders and run this block. (Or create the same thing in
--    Dashboard -> Database -> Webhooks -> table "enquiries", event "Insert".)
-- =====================================================================
--
-- create trigger send_enquiry_email
--   after insert on public.enquiries
--   for each row execute function supabase_functions.http_request(
--     'https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-enquiry-email',
--     'POST',
--     '{"Content-Type":"application/json","Authorization":"Bearer YOUR-ANON-KEY","x-webhook-secret":"YOUR-WEBHOOK-SECRET"}',
--     '{}',
--     '5000'
--   );
