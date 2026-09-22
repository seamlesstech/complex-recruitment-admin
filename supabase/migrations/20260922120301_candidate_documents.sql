-- Append-only candidate document metadata. Files live in a private Storage bucket
-- (see storage_foundation.sql); this table never stores a signed URL, only the
-- object path. Old versions are superseded, never deleted, so historical
-- application_documents links stay valid forever.

create table candidate_documents (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  uploaded_by uuid references profiles (id) on delete restrict,
  document_type_id uuid not null references document_types (id),
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  -- Storage key, never the original filename — see storage_foundation.sql for the
  -- `candidates/{candidate_id}/{document_id}` convention.
  object_path text not null unique,
  uploaded_at timestamptz not null default now(),
  expiry_date date,
  is_current boolean not null default true,
  superseded_by_id uuid references candidate_documents (id) on delete set null,
  archived_at timestamptz
);

-- Amendment 1: current-version uniqueness is scoped per document TYPE, not per
-- candidate — a candidate may simultaneously have one current CV, one current Driving
-- Licence, one current CPC Card, and one current Right to Work document.
create unique index candidate_documents_current_per_type_idx
  on candidate_documents (candidate_id, document_type_id)
  where is_current;

create index candidate_documents_candidate_id_idx on candidate_documents (candidate_id);
create index candidate_documents_document_type_id_idx on candidate_documents (document_type_id);

-- Records exactly which document VERSION existed at the time a given application was
-- submitted (approved architecture §17) — a later CV upload can never silently change
-- what an old application is understood to have included.
create table application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications (id) on delete cascade,
  candidate_document_id uuid not null references candidate_documents (id) on delete restrict,
  linked_at timestamptz not null default now(),
  unique (application_id, candidate_document_id)
);

create index application_documents_application_id_idx on application_documents (application_id);
create index application_documents_candidate_document_id_idx on application_documents (candidate_document_id);
