-- First-class client/employer entity (approved architecture §8) — built now even
-- though there is no frontend module yet, so Jobs/Staff Requests/Enquiries can FK
-- into it from day one instead of repeating free-text company names.

create table employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  created_by uuid references profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Deliberately not a hard UNIQUE(name): two legitimately distinct clients could share
-- a display name. This index only assists search/dedupe triage.
create index employers_name_lower_idx on employers (lower(name));
create index employers_archived_at_idx on employers (archived_at);

create trigger set_employers_updated_at
before update on employers
for each row execute function set_updated_at();
