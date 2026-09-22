-- One Candidate's submission for one Job.
--
-- MVP duplicate rule (amendment 4): a plain UNIQUE(candidate_id, job_id) — one
-- Candidate may have only ONE Application for a given Job, full stop. No automatic
-- reapplication path after Rejected/Withdrawn; that would be a deliberate future
-- workflow, not a relaxation of this constraint.
--
-- `read_at` (not a boolean `unread`) is used here for the same reason applied to
-- notifications (approved architecture Step 10): a single nullable timestamp is the
-- authoritative read state without duplicating it as a second boolean column.

create sequence applications_reference_seq;

create table applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  candidate_id uuid not null references candidates (id),
  job_id uuid not null references jobs (id),
  owner_id uuid references profiles (id) on delete set null,
  status application_status not null default 'new',
  source text,
  submitted_at timestamptz not null default now(),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (candidate_id, job_id)
);

create index applications_candidate_id_idx on applications (candidate_id);
create index applications_job_id_idx on applications (job_id);
create index applications_owner_id_idx on applications (owner_id);
create index applications_status_idx on applications (status);
create index applications_submitted_at_idx on applications (submitted_at);
create index applications_archived_at_idx on applications (archived_at);

create trigger applications_set_reference
before insert on applications
for each row execute function set_reference('APP-', 'applications_reference_seq');

create trigger set_applications_updated_at
before update on applications
for each row execute function set_updated_at();
