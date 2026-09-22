-- Employer contacts (approved architecture §8). `unique (id, employer_id)` exists
-- solely so staff_requests can hold a genuine composite FK (amendment 2) that makes it
-- impossible to attach a contact belonging to one employer to another employer's
-- staff request.

create table employer_contacts (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  job_title text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (id, employer_id)
);

create index employer_contacts_employer_id_idx on employer_contacts (employer_id);

create trigger set_employer_contacts_updated_at
before update on employer_contacts
for each row execute function set_updated_at();
