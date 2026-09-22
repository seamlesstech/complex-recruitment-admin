-- Five entity-specific note tables, not one generic polymorphic table (approved
-- architecture §15) — Postgres cannot enforce a real FK from one entity_id column to
-- five different target tables. Identical shape, duplicated deliberately; a UNION ALL
-- view can be added later if a unified "all my notes" query is ever needed without
-- sacrificing this per-table FK integrity.
--
-- author_id is RESTRICT (not SET NULL): profiles are disabled, not hard-deleted, so
-- losing note attribution to NULL should never be the normal path.

create table candidate_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index candidate_notes_candidate_id_idx on candidate_notes (candidate_id);
create index candidate_notes_author_id_idx on candidate_notes (author_id);
create index candidate_notes_created_at_idx on candidate_notes (created_at);

create table application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index application_notes_application_id_idx on application_notes (application_id);
create index application_notes_author_id_idx on application_notes (author_id);
create index application_notes_created_at_idx on application_notes (created_at);

create table staff_request_notes (
  id uuid primary key default gen_random_uuid(),
  staff_request_id uuid not null references staff_requests (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index staff_request_notes_staff_request_id_idx on staff_request_notes (staff_request_id);
create index staff_request_notes_author_id_idx on staff_request_notes (author_id);
create index staff_request_notes_created_at_idx on staff_request_notes (created_at);

create table enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index enquiry_notes_enquiry_id_idx on enquiry_notes (enquiry_id);
create index enquiry_notes_author_id_idx on enquiry_notes (author_id);
create index enquiry_notes_created_at_idx on enquiry_notes (created_at);

create table job_notes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index job_notes_job_id_idx on job_notes (job_id);
create index job_notes_author_id_idx on job_notes (author_id);
create index job_notes_created_at_idx on job_notes (created_at);
