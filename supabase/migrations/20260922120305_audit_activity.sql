-- Audit/activity table foundation only (approved architecture Step 9: table
-- architecture and safe helpers, NOT a full trigger system over every column — that is
-- added deliberately, table-by-table, during frontend integration).
--
-- bigint identity (not uuid) is a deliberate exception to the general PK convention:
-- these are pure append-only logs, never the target of an external FK, and benefit
-- from cheap chronological ordering at high volume.

create table audit_events (
  id bigint generated always as identity primary key,
  actor_profile_id uuid references profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  -- Deliberately NOT a real FK: (1) it must survive deletion of the record it
  -- describes, and (2) it points to a different table depending on entity_type, which
  -- Postgres cannot express as one real FK anyway. Safe specifically because rows here
  -- are only ever written by trusted server-side/definer code, never client input.
  entity_id uuid not null,
  occurred_at timestamptz not null default now(),
  -- Allow-listed snapshots only — never a naive whole-row dump. Building these is an
  -- application/trigger-layer discipline: don't let an unrelated field edit
  -- incidentally snapshot a candidate's email/phone/DOB into the audit log.
  before_data jsonb,
  after_data jsonb,
  metadata jsonb
);

create index audit_events_entity_idx on audit_events (entity_type, entity_id);
create index audit_events_occurred_at_idx on audit_events (occurred_at);
create index audit_events_actor_idx on audit_events (actor_profile_id);

-- Selective, human-readable projection of audit_events (Option C, approved
-- architecture §19) — not a full duplicate of every audit row, and not recomputed
-- from raw JSON at read time. entity_reference is denormalized deliberately: if a Job
-- is later renamed, its old activity lines should still read as they did at the time.
create table activity_events (
  id bigint generated always as identity primary key,
  audit_event_id bigint references audit_events (id) on delete set null,
  actor_profile_id uuid references profiles (id) on delete set null,
  verb text not null,
  entity_type text not null,
  entity_id uuid not null, -- informational only, same reasoning as audit_events above
  entity_reference text,
  detail text,
  occurred_at timestamptz not null default now()
);

create index activity_events_occurred_at_idx on activity_events (occurred_at desc);
create index activity_events_entity_idx on activity_events (entity_type, entity_id);
create index activity_events_actor_idx on activity_events (actor_profile_id);

-- Immutability (no UPDATE/DELETE for any authenticated application role) is enforced
-- via grants in rls_foundation.sql, alongside every other table's privilege setup, so
-- all access control lives in one reviewable place.
