-- ============================================================
-- Vivana — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
-- (already exists — adding missing columns if needed)
alter table if exists public.profiles
  add column if not exists role              text    default 'client',
  add column if not exists experience        text,
  add column if not exists degrees           text,
  add column if not exists career_highlights text,
  add column if not exists website           text,
  add column if not exists instagram         text,
  add column if not exists city              text,
  add column if not exists host_type         text,
  add column if not exists category          text,
  add column if not exists location_pref     text,
  add column if not exists phone             text,
  add column if not exists date_of_birth     date,
  add column if not exists nationality       text,
  add column if not exists gender            text,
  add column if not exists address           text,
  add column if not exists bio               text,
  add column if not exists location          text,
  add column if not exists languages         text[],
  add column if not exists avatar            text,
  add column if not exists review_count      int     default 0,
  add column if not exists rating            numeric default 0,
  add column if not exists created_at        timestamptz default now();

-- ── Listings ─────────────────────────────────────────────────
create table if not exists public.listings (
  id            uuid primary key default uuid_generate_v4(),
  provider_id   uuid references auth.users(id) on delete cascade not null,
  title         text not null default '',
  description   text,
  service_type  text,
  price_type    text default 'per_person',
  price         numeric not null default 0,
  max_guests    int default 1,
  duration      numeric default 1,
  category      text,
  city          text,
  status        text not null default 'draft' check (status in ('active','draft','paused')),
  slug          text not null default '',
  booking_count int default 0,
  rating        numeric default 0,
  image         text,
  created_at    timestamptz default now()
);

alter table public.listings enable row level security;

-- Providers can manage their own listings
create policy "Providers manage own listings"
  on public.listings for all
  using  (auth.uid() = provider_id)
  with check (auth.uid() = provider_id);

-- Everyone can read active listings
create policy "Public read active listings"
  on public.listings for select
  using (status = 'active');

-- ── Bookings ─────────────────────────────────────────────────
create table if not exists public.bookings (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  listing_id  uuid references public.listings(id) on delete set null,
  provider_id uuid references auth.users(id) on delete set null,
  title       text not null default '',
  date        date not null,
  status      text not null default 'upcoming' check (status in ('upcoming','completed','cancelled')),
  price       numeric not null default 0,
  guests      int default 1,
  image       text,
  slug        text,
  notes       text,
  created_at  timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "Users manage own bookings"
  on public.bookings for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Providers see bookings for their listings"
  on public.bookings for select
  using (auth.uid() = provider_id);

-- ── Business Hours ────────────────────────────────────────────
create table if not exists public.business_hours (
  id          uuid primary key default uuid_generate_v4(),
  provider_id uuid references auth.users(id) on delete cascade not null,
  day         text not null,
  open        boolean default true,
  "from"      text,
  "to"        text,
  unique (provider_id, day)
);

alter table public.business_hours enable row level security;

create policy "Providers manage own hours"
  on public.business_hours for all
  using  (auth.uid() = provider_id)
  with check (auth.uid() = provider_id);

create policy "Public read business hours"
  on public.business_hours for select using (true);

-- ── Discounts ─────────────────────────────────────────────────
create table if not exists public.discounts (
  id              uuid primary key default uuid_generate_v4(),
  provider_id     uuid references auth.users(id) on delete cascade not null,
  type            text not null,
  percent         int default 10,
  valid_from      date,
  valid_to        date,
  days_in_advance int,
  min_guests      int,
  created_at      timestamptz default now()
);

alter table public.discounts enable row level security;

create policy "Providers manage own discounts"
  on public.discounts for all
  using  (auth.uid() = provider_id)
  with check (auth.uid() = provider_id);

-- ── Transactions ──────────────────────────────────────────────
create table if not exists public.transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  booking_id  uuid references public.bookings(id) on delete set null,
  amount      numeric not null default 0,
  currency    text default 'EUR',
  type        text default 'charge' check (type in ('charge','refund','payout')),
  status      text default 'completed' check (status in ('pending','completed','failed')),
  description text,
  created_at  timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users see own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- ── Newsletter Subscribers ────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null unique,
  created_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Service role only (API route uses service key)
create policy "Service role manages subscribers"
  on public.newsletter_subscribers for all
  using (false) with check (false);

-- ── Job Applications ──────────────────────────────────────────
create table if not exists public.job_applications (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  role       text not null,
  message    text,
  resume_url text,
  created_at timestamptz default now()
);

alter table public.job_applications enable row level security;

-- Anyone can submit (insert), no one can read (service role only)
create policy "Anyone can apply"
  on public.job_applications for insert
  with check (true);
