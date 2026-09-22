-- Explicit, allow-listed public projection of jobs (approved architecture §23 /
-- amendment 6). This is the ONLY thing the public website is ever allowed to query
-- directly with the anon key — the base `jobs` table itself grants anon nothing.
--
-- Deliberately relies on the default Postgres view behaviour (no `security_invoker`):
-- the view runs with the privileges of its owner (the migration-applying role), which
-- can read `jobs` regardless of that table's RLS policies. That is precisely what lets
-- an otherwise fully RLS-locked-down `jobs` table safely expose this filtered subset
-- to anon — anon is never granted anything on `jobs` itself, only on this view.
--
-- Excludes: internal id, owner_id, created_by, employer identity, internal notes,
-- audit/activity information. Uses the human-readable reference as the public
-- identifier instead of the internal uuid.
create view public_jobs as
select
  j.reference,
  j.title,
  s.name as sector,
  j.location,
  j.workplace_type,
  j.employment_type,
  j.work_pattern,
  j.pay_type,
  case
    when j.pay_type = 'negotiable' then 'Negotiable'
    when j.pay_from is not null and j.pay_to is not null
      then trim(to_char(j.pay_from, 'FM999,999,990.00')) || ' - ' || trim(to_char(j.pay_to, 'FM999,999,990.00'))
    when j.pay_from is not null then trim(to_char(j.pay_from, 'FM999,999,990.00'))
    when j.pay_to is not null then trim(to_char(j.pay_to, 'FM999,999,990.00'))
    else null
  end as pay_display,
  j.vacancies_count,
  j.summary,
  j.description,
  j.responsibilities,
  j.requirements,
  j.benefits,
  j.application_instructions,
  j.closing_date
from jobs j
left join sectors s on s.id = j.sector_id
where j.status = 'open'
  and j.publish_on_website
  and j.archived_at is null
  and (j.closing_date is null or j.closing_date >= current_date);

grant select on public_jobs to anon, authenticated;
