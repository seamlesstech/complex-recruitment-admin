-- Recruitment vacancy. Mirrors the Job Editor draft (job-editor.ts) but deliberately
-- does NOT store values that are derivable at read time:
--   - pay display string      -> compute from pay_type/pay_from/pay_to (see public_jobs view)
--   - applications_count      -> indexed count(*) over applications.job_id
--   - closing_soon            -> compare closing_date against current_date

create sequence jobs_reference_seq;

create table jobs (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  title text not null,
  sector_id uuid references sectors (id),
  employer_id uuid not null references employers (id),
  -- A Job may originate from at most one Staff Request (approved architecture §13).
  staff_request_id uuid references staff_requests (id) on delete set null,
  location text,
  workplace_type workplace_type not null default 'on_site',
  vacancies_count integer not null default 1 check (vacancies_count > 0),
  employment_type employment_type,
  work_pattern work_pattern,
  pay_type pay_type,
  pay_from numeric(10, 2),
  pay_to numeric(10, 2),
  summary text,
  description text,
  responsibilities text,
  requirements text,
  benefits text,
  application_instructions text,
  closing_date date,
  status job_status not null default 'draft',
  publish_on_website boolean not null default false,
  owner_id uuid references profiles (id) on delete set null,
  created_by uuid references profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (pay_to is null or pay_from is null or pay_to >= pay_from)
);

create index jobs_employer_id_idx on jobs (employer_id);
create index jobs_owner_id_idx on jobs (owner_id);
create index jobs_status_idx on jobs (status);
create index jobs_sector_id_idx on jobs (sector_id);
create index jobs_staff_request_id_idx on jobs (staff_request_id) where staff_request_id is not null;
create index jobs_public_listing_idx on jobs (status, publish_on_website) where status = 'open';
create index jobs_closing_date_idx on jobs (closing_date);
create index jobs_archived_at_idx on jobs (archived_at);

create trigger jobs_set_reference
before insert on jobs
for each row execute function set_reference('JOB-', 'jobs_reference_seq');

create trigger set_jobs_updated_at
before update on jobs
for each row execute function set_updated_at();
