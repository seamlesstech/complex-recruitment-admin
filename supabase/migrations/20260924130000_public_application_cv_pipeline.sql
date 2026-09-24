-- Private CV pipeline for public Job Applications.
--
-- Model (unchanged, see candidate_documents.sql):
--   Candidate -> candidate_documents VERSION -> application_documents
-- An Application links the exact CV version it was submitted with; a later CV
-- supersedes it on the Candidate but never changes what an old Application points at.
--
-- Workflow driven by the website's trusted server route (service role only):
--   1. submit_public_application        -> Candidate (find/create) + Application
--   2. Storage upload                    -> candidates/{candidate_id}/{document_id}
--   3. attach_public_application_cv      -> supersede + new version + link (atomic)
--   on failure of 2/3: remove the object, then
--   4. discard_public_application        -> delete ONLY what this submission created
--
-- Storage cannot join a Postgres transaction, so the metadata is written only AFTER
-- the object exists (step 3 verifies it), and everything in step 3 is one
-- transaction. The only possible orphan is a Storage object whose request died
-- mid-flight; the route removes it on every handled failure.

-- ---------------------------------------------------------------------------
-- Bucket ceiling (defence in depth; the website enforces a stricter 4 MB because
-- Vercel functions cap request bodies at 4.5 MB). Bucket stays private.
-- ---------------------------------------------------------------------------
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
where id = 'candidate-documents';

-- ---------------------------------------------------------------------------
-- 1. submit_public_application: same behaviour, plus `candidate_created` so the
--    server knows whether a failed CV step may remove the Candidate as well.
--    (Return type change requires drop + create; grants re-applied below.)
-- ---------------------------------------------------------------------------
drop function if exists submit_public_application(text, text, text, text, text, text, text);

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
  application_reference text,
  candidate_created boolean
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

  return query select v_candidate_id, v_candidate_reference, v_application_id, v_application_reference, v_candidate_created;
end;
$$;

revoke all on function submit_public_application(text, text, text, text, text, text, text) from public;
revoke all on function submit_public_application(text, text, text, text, text, text, text) from anon, authenticated;
grant execute on function submit_public_application(text, text, text, text, text, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 2. attach_public_application_cv: one transaction that
--      - verifies the Application is a fresh public submission with no documents,
--      - verifies the object path is exactly candidates/{candidate_id}/{document_id}
--        and that the object really exists in the private bucket,
--      - supersedes the Candidate's current CV (if any),
--      - inserts the new CV version as current,
--      - links that exact version to the Application.
--    The CV document type is resolved by name, never a hard-coded uuid.
-- ---------------------------------------------------------------------------
create function attach_public_application_cv(
  p_application_id uuid,
  p_document_id uuid,
  p_original_filename text,
  p_mime_type text,
  p_size_bytes bigint
)
returns table (
  candidate_document_id uuid,
  superseded_document_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application applications%rowtype;
  v_cv_type_id uuid;
  v_object_path text;
  v_previous_id uuid;
  v_filename text := nullif(btrim(p_original_filename), '');
begin
  select * into v_application
  from applications a
  where a.id = p_application_id
  for update;

  if not found
     or v_application.status <> 'new'
     or v_application.archived_at is not null
     or v_application.submitted_at < now() - interval '15 minutes'
     or exists (select 1 from application_documents ad where ad.application_id = p_application_id)
  then
    raise exception 'application_not_attachable';
  end if;

  if v_filename is null or char_length(v_filename) > 255
     or p_mime_type not in (
       'application/pdf',
       'application/msword',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
     )
     or p_size_bytes is null or p_size_bytes <= 0 or p_size_bytes > 5242880
  then
    raise exception 'invalid_document';
  end if;

  v_object_path := 'candidates/' || v_application.candidate_id || '/' || p_document_id;

  if not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'candidate-documents' and o.name = v_object_path
  ) then
    raise exception 'document_object_missing';
  end if;

  select dt.id into v_cv_type_id from document_types dt where dt.name = 'CV';
  if v_cv_type_id is null then
    raise exception 'cv_document_type_missing';
  end if;

  -- Lock the Candidate's current CV so two simultaneous uploads cannot both
  -- become current (the partial unique index would reject the loser anyway).
  select cd.id into v_previous_id
  from candidate_documents cd
  where cd.candidate_id = v_application.candidate_id
    and cd.document_type_id = v_cv_type_id
    and cd.is_current
  for update;

  if v_previous_id is not null then
    update candidate_documents set is_current = false where id = v_previous_id;
  end if;

  insert into candidate_documents (
    id, candidate_id, uploaded_by, document_type_id, original_filename,
    mime_type, size_bytes, object_path, is_current
  )
  values (
    p_document_id, v_application.candidate_id, null, v_cv_type_id, v_filename,
    p_mime_type, p_size_bytes, v_object_path, true
  );

  if v_previous_id is not null then
    update candidate_documents set superseded_by_id = p_document_id where id = v_previous_id;
  end if;

  insert into application_documents (application_id, candidate_document_id)
  values (p_application_id, p_document_id);

  update candidates set last_activity_at = now() where id = v_application.candidate_id;

  return query select p_document_id, v_previous_id;
end;
$$;

revoke all on function attach_public_application_cv(uuid, uuid, text, text, bigint) from public;
revoke all on function attach_public_application_cv(uuid, uuid, text, text, bigint) from anon, authenticated;
grant execute on function attach_public_application_cv(uuid, uuid, text, text, bigint) to service_role;

-- ---------------------------------------------------------------------------
-- 3. discard_public_application: compensation when the CV step fails, so the
--    applicant can simply retry. It removes ONLY records this submission created,
--    and refuses anything that has been touched since:
--      Application: status 'new', no owner, Website source, no documents, no
--                   notes, submitted within the last 15 minutes.
--      Candidate (only when p_candidate_created): Website registration, no owner,
--                   no remaining applications, documents or notes, registered
--                   within the last 15 minutes.
--    A pre-existing Candidate is never deleted.
-- ---------------------------------------------------------------------------
create function discard_public_application(
  p_application_id uuid,
  p_candidate_created boolean
)
returns table (
  application_deleted boolean,
  candidate_deleted boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application applications%rowtype;
  v_app_deleted boolean := false;
  v_cand_deleted boolean := false;
begin
  select * into v_application from applications a where a.id = p_application_id for update;
  if not found then
    return query select false, false;
    return;
  end if;

  if v_application.status = 'new'
     and v_application.owner_id is null
     and v_application.source = 'Website'
     and v_application.submitted_at >= now() - interval '15 minutes'
     and not exists (select 1 from application_documents ad where ad.application_id = p_application_id)
     and not exists (select 1 from application_notes an where an.application_id = p_application_id)
  then
    delete from applications where id = p_application_id;
    v_app_deleted := true;
  end if;

  if v_app_deleted and p_candidate_created then
    delete from candidates c
    where c.id = v_application.candidate_id
      and c.registration_source = 'Website'
      and c.owner_id is null
      and c.registered_at >= now() - interval '15 minutes'
      and not exists (select 1 from applications a where a.candidate_id = c.id)
      and not exists (select 1 from candidate_documents cd where cd.candidate_id = c.id)
      and not exists (select 1 from candidate_notes cn where cn.candidate_id = c.id);
    v_cand_deleted := found;
  end if;

  return query select v_app_deleted, v_cand_deleted;
end;
$$;

revoke all on function discard_public_application(uuid, boolean) from public;
revoke all on function discard_public_application(uuid, boolean) from anon, authenticated;
grant execute on function discard_public_application(uuid, boolean) to service_role;
