-- Fixed, code-coupled workflow vocabularies (Postgres ENUM) and business-managed
-- taxonomies (lookup tables), per the approved architecture §4.
--
-- ENUM: small, stable, tightly coupled to app/UI logic already — adding a value is
-- already a deliberate product+code change elsewhere.
-- Lookup table: business-managed taxonomies expected to grow without a code deploy.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type profile_role as enum ('super_admin', 'admin_manager', 'recruiter', 'viewer');
create type profile_status as enum ('active', 'invited', 'disabled');

create type job_status as enum ('draft', 'open', 'closed');
create type workplace_type as enum ('on_site', 'hybrid', 'remote');
create type employment_type as enum ('temporary', 'permanent', 'contract');
create type work_pattern as enum ('full_time', 'part_time', 'shift_work', 'nights', 'weekends', 'flexible');
create type pay_type as enum ('hourly', 'daily', 'annual_salary', 'negotiable');

create type candidate_availability as enum ('available', 'working', 'unavailable', 'inactive');

create type application_status as enum (
  'new', 'reviewing', 'shortlisted', 'interview', 'offered', 'placed', 'rejected', 'withdrawn'
);

create type staff_request_status as enum (
  'new', 'assigned', 'sourcing', 'partially_filled', 'filled', 'closed'
);
create type staff_request_urgency as enum ('standard', 'urgent');

create type enquiry_type as enum ('employer', 'candidate', 'general', 'partnership');
create type enquiry_status as enum ('new', 'in_review', 'responded', 'converted', 'closed');

-- ---------------------------------------------------------------------------
-- Lookup tables
-- ---------------------------------------------------------------------------

create table sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table document_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  requires_expiry boolean not null default false,
  created_at timestamptz not null default now()
);

create table notification_event_types (
  key text primary key,
  label text not null,
  description text,
  -- Approved defaults (amendment 3) — a user's notification_preferences row overrides these.
  default_in_app boolean not null default true,
  default_email boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Seed data (idempotent)
-- ---------------------------------------------------------------------------

insert into sectors (name, slug) values
  ('Driving & Transport', 'driving-transport'),
  ('Industrial & Warehouse', 'industrial-warehouse'),
  ('Construction', 'construction')
on conflict (name) do nothing;

insert into document_types (name, requires_expiry) values
  ('CV', false),
  ('Driving Licence', true),
  ('CPC Card', true),
  ('Right to Work', true)
on conflict (name) do nothing;

insert into notification_event_types (key, label, description, default_in_app, default_email) values
  ('new_application', 'New application', 'A candidate applied to a job.', true, true),
  ('new_staff_request', 'New staff request', 'A new staff request was submitted.', true, true),
  ('new_candidate', 'New candidate', 'A new candidate registered.', true, false),
  ('new_enquiry', 'New enquiry', 'A new enquiry was received.', true, false),
  ('assignment', 'Assigned to me', 'A record was assigned to you.', true, true),
  ('status_change', 'Important status changes', 'An important status changed on a record you own.', true, false)
on conflict (key) do nothing;
