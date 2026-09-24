-- Support for the public website's periodic orphan-CV sweep.
--
-- The normal CV upload workflow already cleans up controlled failures
-- (see submit_public_application / attach_public_application_cv /
-- discard_public_application in 20260924130000_public_application_cv_pipeline.sql).
-- The remaining risk is the server process being killed between the Storage
-- upload succeeding and attach_public_application_cv running — which would
-- leave a Storage object with no candidate_documents row pointing at it.
--
-- This function finds candidates for that condition. It does NOT delete
-- anything itself — the website's cron route re-checks each result
-- immediately before deleting the Storage object, so a transient issue here
-- can only under-report orphans, never cause a valid document to be removed.

create or replace function public.find_orphan_candidate_documents(p_grace_minutes integer default 120)
returns table(object_path text, created_at timestamptz)
language sql
security definer
set search_path = public, storage
stable
as $$
  select o.name, o.created_at
  from storage.objects o
  where o.bucket_id = 'candidate-documents'
    and o.name like 'candidates/%'
    -- Floor of 5 minutes regardless of the caller's argument: an object mid
    -- upload/attach must never be a deletion candidate.
    and o.created_at < now() - make_interval(mins => greatest(p_grace_minutes, 5))
    and not exists (
      select 1 from public.candidate_documents cd where cd.object_path = o.name
    )
  order by o.created_at asc
  limit 500;
$$;

comment on function public.find_orphan_candidate_documents(integer) is
  'Lists candidate-documents Storage objects older than the grace period with no matching candidate_documents row. Read-only — deletion happens in the website app after a fresh per-row re-check. service_role only.';

revoke all on function public.find_orphan_candidate_documents(integer) from public, anon, authenticated;
grant execute on function public.find_orphan_candidate_documents(integer) to service_role;
