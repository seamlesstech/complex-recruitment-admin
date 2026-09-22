-- Persistent candidate (person) record — independent of any single application.

create sequence candidates_reference_seq;

create table candidates (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  full_name text not null,
  email text,
  -- Normalized for dedupe; a generated column keeps normalization consistent and
  -- indexable without an application-layer round trip.
  email_normalized text generated always as (lower(trim(email))) stored,
  phone text,
  location text,
  primary_sector_id uuid references sectors (id),
  owner_id uuid references profiles (id) on delete set null,
  availability candidate_availability not null default 'available',
  registered_at timestamptz not null default now(),
  registration_source text,
  -- Denormalized on purpose: recomputing "most recent related activity" via a
  -- correlated subquery on every candidates-list page load doesn't scale; this is
  -- maintained by application/trigger code as related child records are written.
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Blocks true duplicate-email registration while still allowing many candidates
-- with no email at all (partial index, not a plain unique constraint).
create unique index candidates_email_normalized_key
  on candidates (email_normalized)
  where email_normalized is not null;

create index candidates_owner_id_idx on candidates (owner_id);
create index candidates_availability_idx on candidates (availability);
create index candidates_primary_sector_id_idx on candidates (primary_sector_id);
create index candidates_phone_idx on candidates (phone);
create index candidates_archived_at_idx on candidates (archived_at);

create trigger candidates_set_reference
before insert on candidates
for each row execute function set_reference('CAN-', 'candidates_reference_seq');

create trigger set_candidates_updated_at
before update on candidates
for each row execute function set_updated_at();
