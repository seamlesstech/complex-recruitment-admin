-- Public Job Application hardening, required before the public website's
-- Application endpoint is considered safe.
--
-- 1. Closing-date enforcement at the database boundary. `public_jobs` already hides
--    Jobs whose closing date has passed, but the RPC itself did not check it, so a
--    caller that still knew an expired reference could apply. The RPC now applies
--    exactly the same availability rule as the view (open, published, not archived,
--    closing date not passed) — the view and the RPC can no longer disagree.
--
-- 2. `applications.applicant_message`: the optional free-text note the applicant
--    writes on the public form. Deliberately separate from `application_notes`,
--    which are internal staff notes with a required staff author. Postcode needs no
--    new column: it maps onto the existing `candidates.location`.
--
-- 3. Existing-Candidate matching no longer ignores the submission entirely, but it
--    also never overwrites trusted profile data: only a NULL/blank phone or location
--    (or a blank name) is filled from the public submission.
--
-- 4. Signature changes (breaking, but the function has no callers yet — the website
--    is being wired up in the same change):
--      - `p_sector_id` removed. A new Candidate's primary sector is taken from the
--        Job itself rather than trusted from the caller.
--      - `p_message` added.
--    Status, owner, references and internal ids are still never accepted as input.
--
-- 5. Failure modes are raised with stable, machine-readable messages so the trusted
--    server endpoint can map them to safe user-facing text without string-matching
--    raw Postgres errors:
--      invalid_application_input | job_not_available | duplicate_application
--
-- A race between two first-time submissions for the same email is now handled with
-- ON CONFLICT on the partial unique email index instead of surfacing as a misleading
-- "already applied" error.

alter table applications
  add column applicant_message text
    check (applicant_message is null or char_length(applicant_message) <= 4000);

comment on column applications.applicant_message is
  'Optional note written by the applicant on the public application form. Not a staff note.';

drop function if exists submit_public_application(text, text, text, text, text, uuid, text);

create function submit_public_application(
  p_job_reference text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_location text default null,
  p_message text default null,
  p_source text default 'Website'
)
returns table (
  candidate_id uuid,
  candidate_reference text,
  application_id uuid,
  application_reference text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text := nullif(btrim(p_full_name), '');
  v_email text := nullif(btrim(p_email), '');
  v_email_normalized text := lower(nullif(btrim(p_email), ''));
  v_phone text := nullif(btrim(p_phone), '');
  v_location text := nullif(btrim(p_location), '');
  v_message text := nullif(btrim(p_message), '');
  v_source text := coalesce(nullif(btrim(p_source), ''), 'Website');
  v_job jobs%rowtype;
  v_candidate_id uuid;
  v_candidate_reference text;
  v_application_id uuid;
  v_application_reference text;
begin
  if v_full_name is null or v_email_normalized is null then
    raise exception 'invalid_application_input';
  end if;

  -- Same availability rule as the public_jobs view.
  select * into v_job
  from jobs j
  where j.reference = p_job_reference
    and j.status = 'open'
    and j.publish_on_website
    and j.archived_at is null
    and (j.closing_date is null or j.closing_date >= current_date);

  if not found then
    raise exception 'job_not_available';
  end if;

  insert into candidates (full_name, email, phone, location, primary_sector_id, registration_source, owner_id)
  values (v_full_name, v_email, v_phone, v_location, v_job.sector_id, v_source, null)
  on conflict (email_normalized) where email_normalized is not null do nothing
  returning candidates.id, candidates.reference into v_candidate_id, v_candidate_reference;

  if v_candidate_id is null then
    -- Existing Candidate: fill only missing profile data, never overwrite it.
    update candidates c
    set full_name = case when btrim(c.full_name) = '' then v_full_name else c.full_name end,
        phone = coalesce(nullif(btrim(c.phone), ''), v_phone),
        location = coalesce(nullif(btrim(c.location), ''), v_location),
        last_activity_at = now()
    where c.email_normalized = v_email_normalized
    returning c.id, c.reference into v_candidate_id, v_candidate_reference;
  end if;

  begin
    insert into applications (candidate_id, job_id, owner_id, status, source, submitted_at, applicant_message)
    values (v_candidate_id, v_job.id, null, 'new', v_source, now(), v_message)
    returning applications.id, applications.reference into v_application_id, v_application_reference;
  exception
    when unique_violation then
      raise exception 'duplicate_application';
  end;

  return query select v_candidate_id, v_candidate_reference, v_application_id, v_application_reference;
end;
$$;

revoke all on function submit_public_application(text, text, text, text, text, text, text) from public;
revoke all on function submit_public_application(text, text, text, text, text, text, text) from anon, authenticated;
grant execute on function submit_public_application(text, text, text, text, text, text, text) to service_role;
