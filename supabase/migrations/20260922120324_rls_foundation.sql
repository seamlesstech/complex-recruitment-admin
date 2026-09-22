-- Initial production RLS architecture (approved architecture §24).
--
-- Role matrix implemented here:
--   super_admin    - broad access everywhere, incl. profile/role administration
--   admin_manager  - broad operational read/write, no role/account administration
--   recruiter      - read all non-archived operational records; create records;
--                    update records they own or that are unassigned
--   viewer         - read-only on ordinary operational records; NO candidate
--                    document access, NO internal note access, NO audit access
--   (all active)   - read the Activity feed; read/update only their own
--                    notifications and notification preferences
--   disabled       - loses all application access, regardless of role

grant usage on schema public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER + a fixed search_path is what avoids recursive RLS: these
-- functions are owned by the migration-applying role, so they read `profiles`
-- without going through profiles' own RLS policies, breaking the circular
-- dependency that would otherwise exist ("a policy on X needs a helper that
-- queries profiles, whose own RLS would need the same helper to evaluate").

create or replace function current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from profiles where id = auth.uid();
$$;

create or replace function current_profile_role()
returns profile_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid() and status = 'active';
$$;

create or replace function is_active_profile()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'active');
$$;

create or replace function is_admin_tier()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select current_profile_role() in ('super_admin', 'admin_manager');
$$;

-- Attaches the privilege-escalation guard declared in profiles.sql now that its
-- dependency (current_profile_role()) exists.
create or replace function protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- NOTE: this function is itself SECURITY DEFINER, which means current_user inside
  -- this body is always the function's OWNER, never the actual caller — so a
  -- current_user-based check here would be permanently bypassed for everyone. auth.uid()
  -- does not have that problem: it simply reads the `request.jwt.claims` setting
  -- PostgREST populates per-request from the caller's verified JWT, which exists only
  -- for real end-user API calls. A SQL Editor session, a direct service-role/postgres
  -- connection, or a migration never has that setting populated, so auth.uid() is NULL
  -- there regardless of which role is connected — which is exactly the trusted
  -- administrative context the first Super Admin bootstrap (see profiles.sql) relies on.
  if auth.uid() is null then
    return new;
  end if;

  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and current_profile_role() is distinct from 'super_admin' then
    raise exception 'Only Super Admin may change profile role or status';
  end if;
  return new;
end;
$$;

create trigger protect_profiles_privileged_fields
before update on profiles
for each row execute function protect_profile_privileged_fields();

-- Reference-generation triggers run as the invoking (authenticated) role, so that
-- role needs USAGE on each sequence to call nextval() from inside set_reference().
grant usage on sequence
  candidates_reference_seq,
  staff_requests_reference_seq,
  jobs_reference_seq,
  applications_reference_seq,
  enquiries_reference_seq
to authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
-- No INSERT policy/grant: rows are created solely by handle_new_user(), which runs
-- SECURITY DEFINER and so bypasses RLS entirely.

alter table profiles enable row level security;
grant select, update on profiles to authenticated;

create policy profiles_select_active on profiles
for select to authenticated
using (is_active_profile());

create policy profiles_update_self_or_admin on profiles
for update to authenticated
using (id = auth.uid() or is_admin_tier())
with check (id = auth.uid() or is_admin_tier());

-- ---------------------------------------------------------------------------
-- Lookups: sectors, document_types, notification_event_types
-- ---------------------------------------------------------------------------
-- Read-only to internal users for this MVP; no app-facing write path yet (managed via
-- migrations/service role). Never exposed to anon.

alter table sectors enable row level security;
grant select on sectors to authenticated;
create policy sectors_select on sectors for select to authenticated using (is_active_profile());

alter table document_types enable row level security;
grant select on document_types to authenticated;
create policy document_types_select on document_types for select to authenticated using (is_active_profile());

alter table notification_event_types enable row level security;
grant select on notification_event_types to authenticated;
create policy notification_event_types_select on notification_event_types for select to authenticated using (is_active_profile());

-- ---------------------------------------------------------------------------
-- employers / employer_contacts (no owner_id concept — operational, not personally owned)
-- ---------------------------------------------------------------------------

alter table employers enable row level security;
grant select, insert, update on employers to authenticated;

create policy employers_select on employers
for select to authenticated
using (is_admin_tier() or (is_active_profile() and archived_at is null));

create policy employers_insert on employers
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

create policy employers_update on employers
for update to authenticated
using (is_admin_tier() or current_profile_role() = 'recruiter')
with check (is_admin_tier() or current_profile_role() = 'recruiter');

alter table employer_contacts enable row level security;
grant select, insert, update on employer_contacts to authenticated;

create policy employer_contacts_select on employer_contacts
for select to authenticated
using (is_admin_tier() or (is_active_profile() and archived_at is null));

create policy employer_contacts_insert on employer_contacts
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

create policy employer_contacts_update on employer_contacts
for update to authenticated
using (is_admin_tier() or current_profile_role() = 'recruiter')
with check (is_admin_tier() or current_profile_role() = 'recruiter');

-- ---------------------------------------------------------------------------
-- Owned operational tables: candidates, staff_requests, jobs, applications, enquiries
-- ---------------------------------------------------------------------------
-- SELECT: admin tier sees everything (incl. archived); recruiter/viewer see all
--         non-archived records.
-- INSERT: admin tier + recruiter only.
-- UPDATE: admin tier always; recruiter only where owner_id is their own or NULL
--         (unassigned) — client-supplied owner_id can never widen this, since the
--         USING clause is evaluated against the actual stored row, not caller input.

alter table candidates enable row level security;
grant select, insert, update on candidates to authenticated;

create policy candidates_select on candidates
for select to authenticated
using (is_admin_tier() or (is_active_profile() and archived_at is null));

create policy candidates_insert on candidates
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

create policy candidates_update on candidates
for update to authenticated
using (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
)
with check (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
);

alter table staff_requests enable row level security;
grant select, insert, update on staff_requests to authenticated;

create policy staff_requests_select on staff_requests
for select to authenticated
using (is_admin_tier() or (is_active_profile() and archived_at is null));

create policy staff_requests_insert on staff_requests
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

create policy staff_requests_update on staff_requests
for update to authenticated
using (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
)
with check (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
);

alter table jobs enable row level security;
grant select, insert, update on jobs to authenticated;

create policy jobs_select on jobs
for select to authenticated
using (is_admin_tier() or (is_active_profile() and archived_at is null));

create policy jobs_insert on jobs
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

create policy jobs_update on jobs
for update to authenticated
using (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
)
with check (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
);

alter table applications enable row level security;
grant select, insert, update on applications to authenticated;

create policy applications_select on applications
for select to authenticated
using (is_admin_tier() or (is_active_profile() and archived_at is null));

create policy applications_insert on applications
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

create policy applications_update on applications
for update to authenticated
using (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
)
with check (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
);

alter table enquiries enable row level security;
grant select, insert, update on enquiries to authenticated;

create policy enquiries_select on enquiries
for select to authenticated
using (is_admin_tier() or (is_active_profile() and archived_at is null));

create policy enquiries_insert on enquiries
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

create policy enquiries_update on enquiries
for update to authenticated
using (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
)
with check (
  is_admin_tier()
  or (current_profile_role() = 'recruiter' and (owner_id = current_profile_id() or owner_id is null))
);

-- ---------------------------------------------------------------------------
-- Notes (candidate_notes, application_notes, staff_request_notes, enquiry_notes,
-- job_notes) — identical policy shape on all five. Viewer has NO access at all.
-- ---------------------------------------------------------------------------

alter table candidate_notes enable row level security;
grant select, insert, update on candidate_notes to authenticated;
create policy candidate_notes_select on candidate_notes for select to authenticated
  using (is_admin_tier() or (current_profile_role() = 'recruiter' and deleted_at is null));
create policy candidate_notes_insert on candidate_notes for insert to authenticated
  with check ((is_admin_tier() or current_profile_role() = 'recruiter') and author_id = current_profile_id());
create policy candidate_notes_update on candidate_notes for update to authenticated
  using (is_admin_tier() or author_id = current_profile_id())
  with check (is_admin_tier() or author_id = current_profile_id());

alter table application_notes enable row level security;
grant select, insert, update on application_notes to authenticated;
create policy application_notes_select on application_notes for select to authenticated
  using (is_admin_tier() or (current_profile_role() = 'recruiter' and deleted_at is null));
create policy application_notes_insert on application_notes for insert to authenticated
  with check ((is_admin_tier() or current_profile_role() = 'recruiter') and author_id = current_profile_id());
create policy application_notes_update on application_notes for update to authenticated
  using (is_admin_tier() or author_id = current_profile_id())
  with check (is_admin_tier() or author_id = current_profile_id());

alter table staff_request_notes enable row level security;
grant select, insert, update on staff_request_notes to authenticated;
create policy staff_request_notes_select on staff_request_notes for select to authenticated
  using (is_admin_tier() or (current_profile_role() = 'recruiter' and deleted_at is null));
create policy staff_request_notes_insert on staff_request_notes for insert to authenticated
  with check ((is_admin_tier() or current_profile_role() = 'recruiter') and author_id = current_profile_id());
create policy staff_request_notes_update on staff_request_notes for update to authenticated
  using (is_admin_tier() or author_id = current_profile_id())
  with check (is_admin_tier() or author_id = current_profile_id());

alter table enquiry_notes enable row level security;
grant select, insert, update on enquiry_notes to authenticated;
create policy enquiry_notes_select on enquiry_notes for select to authenticated
  using (is_admin_tier() or (current_profile_role() = 'recruiter' and deleted_at is null));
create policy enquiry_notes_insert on enquiry_notes for insert to authenticated
  with check ((is_admin_tier() or current_profile_role() = 'recruiter') and author_id = current_profile_id());
create policy enquiry_notes_update on enquiry_notes for update to authenticated
  using (is_admin_tier() or author_id = current_profile_id())
  with check (is_admin_tier() or author_id = current_profile_id());

alter table job_notes enable row level security;
grant select, insert, update on job_notes to authenticated;
create policy job_notes_select on job_notes for select to authenticated
  using (is_admin_tier() or (current_profile_role() = 'recruiter' and deleted_at is null));
create policy job_notes_insert on job_notes for insert to authenticated
  with check ((is_admin_tier() or current_profile_role() = 'recruiter') and author_id = current_profile_id());
create policy job_notes_update on job_notes for update to authenticated
  using (is_admin_tier() or author_id = current_profile_id())
  with check (is_admin_tier() or author_id = current_profile_id());

-- ---------------------------------------------------------------------------
-- candidate_documents / application_documents — Viewer denied entirely, per Step 15.
-- ---------------------------------------------------------------------------

alter table candidate_documents enable row level security;
grant select, insert, update on candidate_documents to authenticated;

create policy candidate_documents_select on candidate_documents
for select to authenticated
using (is_admin_tier() or current_profile_role() = 'recruiter');

create policy candidate_documents_insert on candidate_documents
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

create policy candidate_documents_update on candidate_documents
for update to authenticated
using (is_admin_tier() or current_profile_role() = 'recruiter')
with check (is_admin_tier() or current_profile_role() = 'recruiter');

alter table application_documents enable row level security;
grant select, insert on application_documents to authenticated;

create policy application_documents_select on application_documents
for select to authenticated
using (is_admin_tier() or current_profile_role() = 'recruiter');

create policy application_documents_insert on application_documents
for insert to authenticated
with check (is_admin_tier() or current_profile_role() = 'recruiter');

-- ---------------------------------------------------------------------------
-- audit_events / activity_events
-- ---------------------------------------------------------------------------
-- No INSERT/UPDATE/DELETE grant to `authenticated` at all: this MVP does not yet
-- generate these rows from ordinary client traffic (approved architecture Step 9 —
-- foundation only). Writes will come from privileged/definer paths added deliberately
-- during frontend integration, or from service_role, neither of which needs a grant
-- to `authenticated` to operate. This is what makes the tables immutable to normal
-- application users, independent of any policy.

alter table audit_events enable row level security;
grant select on audit_events to authenticated;
create policy audit_events_select on audit_events
for select to authenticated
using (is_admin_tier());

alter table activity_events enable row level security;
grant select on activity_events to authenticated;
create policy activity_events_select on activity_events
for select to authenticated
using (is_active_profile());

-- ---------------------------------------------------------------------------
-- notifications / notification_preferences — every user manages only their own.
-- ---------------------------------------------------------------------------
-- Column-level grant restricts authenticated to flipping read_at only; they can never
-- rewrite title/message/recipient_id even on their own row. No INSERT grant: rows are
-- system-generated only.

alter table notifications enable row level security;
grant select on notifications to authenticated;
grant update (read_at) on notifications to authenticated;

create policy notifications_select on notifications
for select to authenticated
using (recipient_id = current_profile_id());

create policy notifications_update_own on notifications
for update to authenticated
using (recipient_id = current_profile_id())
with check (recipient_id = current_profile_id());

alter table notification_preferences enable row level security;
grant select, insert, update, delete on notification_preferences to authenticated;

create policy notification_preferences_select on notification_preferences
for select to authenticated
using (profile_id = current_profile_id());

create policy notification_preferences_insert on notification_preferences
for insert to authenticated
with check (profile_id = current_profile_id());

create policy notification_preferences_update on notification_preferences
for update to authenticated
using (profile_id = current_profile_id())
with check (profile_id = current_profile_id());

create policy notification_preferences_delete on notification_preferences
for delete to authenticated
using (profile_id = current_profile_id());
