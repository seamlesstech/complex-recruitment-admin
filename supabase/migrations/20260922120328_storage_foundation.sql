-- Private Storage bucket for candidate documents (approved architecture §16 / Step 15).
--
-- Object path convention: candidates/{candidate_id}/{document_id} — the document's own
-- uuid, never the original user-supplied filename, is the storage key. The metadata
-- table (candidate_documents) keeps `original_filename` for display/download-as only.
--
-- No signed URLs are ever stored anywhere; authorised users request one on demand
-- (short TTL) via a server-side call once the frontend/API layer is wired up.
--
-- Role matrix (Step 15): Super Admin / Admin Manager / Recruiter allowed, Viewer denied
-- entirely — this mirrors the candidate_documents table RLS in rls_foundation.sql
-- exactly, so metadata access and file access can never drift apart.

insert into storage.buckets (id, name, public)
values ('candidate-documents', 'candidate-documents', false)
on conflict (id) do nothing;

-- (storage.foldername(name))[1] pins objects to the expected top-level folder, a cheap
-- guard against the bucket being used for anything other than its intended layout.

create policy "candidate documents readable by internal staff"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'candidate-documents'
  and (storage.foldername(name))[1] = 'candidates'
  and (is_admin_tier() or current_profile_role() = 'recruiter')
);

create policy "candidate documents uploadable by internal staff"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'candidate-documents'
  and (storage.foldername(name))[1] = 'candidates'
  and (is_admin_tier() or current_profile_role() = 'recruiter')
);

create policy "candidate documents updatable by internal staff"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'candidate-documents'
  and (storage.foldername(name))[1] = 'candidates'
  and (is_admin_tier() or current_profile_role() = 'recruiter')
)
with check (
  bucket_id = 'candidate-documents'
  and (storage.foldername(name))[1] = 'candidates'
  and (is_admin_tier() or current_profile_role() = 'recruiter')
);

-- No delete policy: object removal is deferred to deliberate admin/service-role
-- tooling, not exposed to the ordinary internal-user session.
