-- One canonical COMPLEX sector vocabulary across the database, Admin and website:
--
--   Driving & Transport
--   Industrial & Warehousing        (was "Industrial & Warehouse")
--   Construction & Engineering      (was "Construction")
--   Business & Operational Support
--   Waste Management                (new, fifth sector)
--
-- Renaming is safe because nothing references sectors by name. jobs.sector_id,
-- staff_requests.sector_id and candidates.primary_sector_id are all uuid foreign
-- keys to sectors.id, and no function, RPC or policy compares sector names. The
-- only consumer of the text is the public_jobs view, which exposes sectors.name
-- as an output column; the website maps that name to its sector pages
-- (lib/public-jobs.ts) and is updated to the same names. The Admin reads names
-- through the FK at request time, so it shows the new names with no code change.
--
-- ids and slugs are deliberately left unchanged (the existing slugs stay
-- 'industrial-warehouse' and 'construction'). Each update is keyed on the old
-- name, so it is a no-op if the name was already changed, and the insert is
-- guarded, so the whole migration is idempotent.
update sectors set name = 'Industrial & Warehousing' where name = 'Industrial & Warehouse';
update sectors set name = 'Construction & Engineering' where name = 'Construction';

insert into sectors (name, slug) values
  ('Waste Management', 'waste-management')
on conflict (name) do nothing;
