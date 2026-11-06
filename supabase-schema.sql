-- ==============================================================================
-- SMARTMENU - SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Restaurants Table
create table if not exists public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  cuisine text default 'Modern Indian',
  description text,
  address text,
  city text default 'Bengaluru',
  postal_code text,
  contact_number text,
  business_email text,
  website text,
  outlets integer default 1,
  opening_hours text default '12:00-23:00',
  plan text default 'Growth · Annual',
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Dishes Table (With 3D AR Model support)
create table if not exists public.dishes (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  name text not null,
  category text not null default 'Mains',
  diet text check (diet in ('Veg', 'Non-Veg', 'Vegan', 'Egg')) default 'Veg',
  price numeric(10, 2) not null default 0,
  description text,
  image_url text,
  model_url text, -- .glb or .usdz for 3D AR
  in_stock boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Table Standees Table
create table if not exists public.table_standees (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  table_number integer not null,
  qr_code_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (restaurant_id, table_number)
);

-- 6. Orders Table (Live table orders from guests)
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  table_number integer not null,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(10, 2) not null default 0,
  status text check (status in ('pending', 'confirmed', 'preparing', 'served', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.dishes enable row level security;
alter table public.table_standees enable row level security;
alter table public.orders enable row level security;

-- Public can view restaurants and dishes (needed for guests scanning table QR codes)
create policy "Allow public read access to restaurants"
  on public.restaurants for select
  using (true);

create policy "Allow public read access to dishes"
  on public.dishes for select
  using (true);

create policy "Allow public read access to table standees"
  on public.table_standees for select
  using (true);

-- Authenticated owners can manage their restaurant data
create policy "Owners can insert their restaurant"
  on public.restaurants for insert
  with check (auth.uid() = owner_id or auth.uid() is not null);

create policy "Owners can update their restaurant"
  on public.restaurants for update
  using (auth.uid() = owner_id);

create policy "Owners can manage their dishes"
  on public.dishes for all
  using (
    exists (
      select 1 from public.restaurants
      where restaurants.id = dishes.restaurant_id
      and restaurants.owner_id = auth.uid()
    )
  );

-- Guests can create orders; restaurant owners can manage orders
create policy "Allow public to place orders"
  on public.orders for insert
  with check (true);

create policy "Owners can view and update their orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.restaurants
      where restaurants.id = orders.restaurant_id
      and restaurants.owner_id = auth.uid()
    )
  );

-- ==============================================================================
-- SEED DATA (Starter Demo Restaurant & Dishes)
-- ==============================================================================

insert into public.restaurants (id, name, cuisine, description, address, city, postal_code, contact_number, business_email, website, outlets, opening_hours, plan)
values (
  '11111111-1111-1111-1111-111111111111',
  'Nara House',
  'Modern Indian & Pan-Asian',
  'Artisanal dining celebrating regional spices and modern culinary techniques.',
  '24 Residency Road, Ashok Nagar',
  'Bengaluru',
  '560025',
  '+91 80 1234 5678',
  'hello@narahouse.in',
  'narahouse.in',
  1,
  '12:00-23:00',
  'Growth · Annual'
) on conflict (id) do nothing;

insert into public.dishes (restaurant_id, name, category, diet, price, description, image_url, in_stock)
values
  ('11111111-1111-1111-1111-111111111111', 'Saffron Butter Chicken', 'Mains', 'Non-Veg', 580, 'Charred chicken morsels simmered in a velvet tomato, honey, and Kashmiri saffron reduction.', 'saffron_butter_chicken.png', true),
  ('11111111-1111-1111-1111-111111111111', 'Wild Mushroom Pasta', 'Mains', 'Veg', 520, 'Handmade pasta ribbons tossed in white truffle oil, porcini broth, and toasted pine nuts.', 'wild_mushroom_pasta.png', true),
  ('11111111-1111-1111-1111-111111111111', 'Garden Burrata Bowl', 'Bowls', 'Veg', 460, 'Artisanal burrata with heirloom tomatoes, basil oil drizzle, and aged balsamic glaze.', 'garden_burrata_bowl.png', true),
  ('11111111-1111-1111-1111-111111111111', 'Farfalle Truffle Pasta', 'Mains', 'Veg', 580, 'Bowtie pasta tossed in aged parmesan emulsion with black winter truffle essence.', 'farfalle_pasta_ar.png', true)
on conflict do nothing;

-- ==============================================================================
-- STORAGE BUCKETS (Dish Images, Logos, and 3D AR Models)
-- ==============================================================================
-- Note: You can create these in Supabase Dashboard -> Storage -> New Bucket
-- 1. 'dish-media' (Public)
-- 2. 'restaurant-logos' (Public)
-- 3. 'ar-models' (Public)

