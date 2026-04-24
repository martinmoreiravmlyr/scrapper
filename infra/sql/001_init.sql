create extension if not exists "pgcrypto";

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  portal text not null,
  listing_url text not null unique,
  external_id text,
  status text not null default 'active',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_crawled_at timestamptz,
  raw_html text,
  raw_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete cascade,
  operation_type text,
  property_type text,
  department text,
  city text,
  neighborhood text,
  address_text text,
  price numeric,
  currency text,
  bedrooms integer,
  bathrooms integer,
  covered_m2 numeric,
  total_m2 numeric,
  garage boolean,
  title text,
  description text,
  agency_name text,
  published_at_source timestamptz,
  updated_at_source timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  image_url text not null,
  position integer,
  image_hash text
);

create table if not exists property_duplicates (
  id uuid primary key default gen_random_uuid(),
  master_property_id uuid,
  duplicate_property_id uuid,
  score numeric not null,
  reason text,
  status_review text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists crawl_jobs (
  id uuid primary key default gen_random_uuid(),
  portal text not null,
  job_type text not null,
  status text not null default 'queued',
  items_found integer not null default 0,
  items_processed integer not null default 0,
  errors_count integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
