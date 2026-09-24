-- Follow-up to 20260924100000_public_application_hardening.
--
-- The `set_reference()` BEFORE INSERT trigger calls nextval() before any unique /
-- ON CONFLICT check runs, so attempting an insert that is then discarded still
-- consumes a reference number. The previous version therefore burned a CAN- number
-- every time an existing Candidate applied, and an APP- number on every duplicate
-- attempt, leaving gaps in the human-readable references staff use.
--
-- This version looks up first and only inserts when a row is genuinely new. The
-- ON CONFLICT / unique_violation handling is kept purely as a race-condition guard
-- (two simultaneous first submissions), not as the normal path.
--
-- Signature, grants, availability rule and error keys are unchanged.

create or replace function submit_public_application(
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
  v_candidate_created boolean := false;
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

  select c.id, c.reference into v_candidate_id, v_candidate_reference
  from candidates c
  where c.email_normalized = v_email_normalized;

  if v_candidate_id is null then
    insert into candidates (full_name, email, phone, location, primary_sector_id, registration_source, owner_id)
    values (v_full_name, v_email, v_phone, v_location, v_job.sector_id, v_source, null)
    on conflict (email_normalized) where email_normalized is not null do nothing
    returning candidates.id, candidates.reference into v_candidate_id, v_candidate_reference;
    v_candidate_created := v_candidate_id is not null;
  end if;

  if not v_candidate_created then
    -- Existing Candidate (or one created concurrently): fill only missing
    -- profile data, never overwrite it.
    update candidates c
    set full_name = case when btrim(c.full_name) = '' then v_full_name else c.full_name end,
        phone = coalesce(nullif(btrim(c.phone), ''), v_phone),
        location = coalesce(nullif(btrim(c.location), ''), v_location),
        last_activity_at = now()
    where c.email_normalized = v_email_normalized
    returning c.id, c.reference into v_candidate_id, v_candidate_reference;
  end if;

  if exists (
    select 1 from applications a
    where a.candidate_id = v_candidate_id and a.job_id = v_job.id
  ) then
    raise exception 'duplicate_application';
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
