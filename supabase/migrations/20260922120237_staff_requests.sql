-- Employer demand for workers — distinct from Job (a posted vacancy).
--
-- No Placement entity exists yet, so quantity_filled is a manually-maintained integer
-- for this MVP (approved architecture §12). This is a known, flagged consistency risk:
-- nothing here ties it to actual placed candidates. A future `placements` table is the
-- planned fix once Staff Request <-> Job usage is observed in production.

create sequence staff_requests_reference_seq;

create table staff_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  employer_id uuid not null references employers (id),
  employer_contact_id uuid references employer_contacts (id),
  requirement_title text not null,
  quantity_required integer not null check (quantity_required > 0),
  quantity_filled integer not null default 0 check (quantity_filled >= 0),
  sector_id uuid references sectors (id),
  location text,
  needed_by date,
  urgency staff_request_urgency not null default 'standard',
  owner_id uuid references profiles (id) on delete set null,
  status staff_request_status not null default 'new',
  submitted_at timestamptz not null default now(),
  source text,
  employment_type employment_type,
  work_pattern work_pattern,
  duration text,
  pay_type pay_type,
  pay_from numeric(10, 2),
  pay_to numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (quantity_filled <= quantity_required),
  check (pay_to is null or pay_from is null or pay_to >= pay_from),
  -- Amendment 2: an employer_contact attached here must genuinely belong to the same
  -- employer_id on this row. NULL employer_contact_id skips the check entirely (a
  -- staff request need not have a named contact), but once set, Postgres enforces the
  -- pairing via employer_contacts' own unique(id, employer_id).
  foreign key (employer_contact_id, employer_id) references employer_contacts (id, employer_id)
);

create index staff_requests_employer_id_idx on staff_requests (employer_id);
create index staff_requests_owner_id_idx on staff_requests (owner_id);
create index staff_requests_status_idx on staff_requests (status);
create index staff_requests_submitted_at_idx on staff_requests (submitted_at);
create index staff_requests_archived_at_idx on staff_requests (archived_at);

create trigger staff_requests_set_reference
before insert on staff_requests
for each row execute function set_reference('REQ-', 'staff_requests_reference_seq');

create trigger set_staff_requests_updated_at
before update on staff_requests
for each row execute function set_updated_at();
