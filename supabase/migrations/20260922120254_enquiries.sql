-- Inbound contact — remains a historical record even after conversion.
--
-- Amendment 5: conversion targets are two real, independently-enforced nullable FKs
-- (not a generic entity_type/entity_id pair). Two CHECK constraints make an invalid
-- state impossible regardless of which code path performs the write:
--   1. never both converted_candidate_id and converted_staff_request_id set
--   2. status = 'converted' iff exactly one conversion target is set

create sequence enquiries_reference_seq;

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  contact_name text not null,
  employer_id uuid references employers (id) on delete set null,
  -- Raw, as-submitted company name before any employer match/triage — public forms
  -- won't have an employer_id to give us.
  company_free_text text,
  email text,
  phone text,
  type enquiry_type not null,
  subject text,
  message text not null,
  source text,
  owner_id uuid references profiles (id) on delete set null,
  status enquiry_status not null default 'new',
  received_at timestamptz not null default now(),
  read_at timestamptz,
  converted_candidate_id uuid references candidates (id) on delete set null,
  converted_staff_request_id uuid references staff_requests (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (converted_candidate_id is null or converted_staff_request_id is null),
  check (
    (status = 'converted' and (converted_candidate_id is not null or converted_staff_request_id is not null))
    or
    (status <> 'converted' and converted_candidate_id is null and converted_staff_request_id is null)
  )
);

create index enquiries_employer_id_idx on enquiries (employer_id);
create index enquiries_owner_id_idx on enquiries (owner_id);
create index enquiries_status_idx on enquiries (status);
create index enquiries_received_at_idx on enquiries (received_at);
create index enquiries_archived_at_idx on enquiries (archived_at);

create trigger enquiries_set_reference
before insert on enquiries
for each row execute function set_reference('ENQ-', 'enquiries_reference_seq');

create trigger set_enquiries_updated_at
before update on enquiries
for each row execute function set_updated_at();

-- The recommended, controlled path for conversion (approved architecture: "prefer
-- conversion through a controlled database/server operation rather than independent
-- client updates"). SECURITY INVOKER so the caller's own UPDATE permissions/RLS on
-- enquiries still apply — this function only guarantees the two writes (status +
-- target) happen together, atomically, as a single statement; it does not itself grant
-- any additional privilege. The CHECK constraints above are the hard backstop that
-- makes an inconsistent state impossible even if a client bypassed this function and
-- issued a raw UPDATE directly.
create or replace function convert_enquiry(
  p_enquiry_id uuid,
  p_candidate_id uuid default null,
  p_staff_request_id uuid default null
)
returns enquiries
language plpgsql
security invoker
as $$
declare
  v_result enquiries;
begin
  if (p_candidate_id is null) = (p_staff_request_id is null) then
    raise exception 'convert_enquiry requires exactly one of p_candidate_id or p_staff_request_id';
  end if;

  update enquiries
  set status = 'converted',
      converted_candidate_id = p_candidate_id,
      converted_staff_request_id = p_staff_request_id
  where id = p_enquiry_id
  returning * into v_result;

  if not found then
    raise exception 'Enquiry % not found', p_enquiry_id;
  end if;

  return v_result;
end;
$$;
