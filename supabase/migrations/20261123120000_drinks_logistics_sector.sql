-- Drinks Logistics becomes the sixth canonical COMPLEX sector, alongside:
--
--   Driving & Transport
--   Industrial & Warehousing
--   Construction & Engineering
--   Business & Operational Support
--   Waste Management
--   Drinks Logistics                (new)
--
-- Waste Management and Drinks Logistics are separate sectors with their own
-- rows, ids and website pages; they are only grouped in the website's navigation.
--
-- Insert-only and idempotent, same shape and slug convention as the earlier
-- sector seeds. No existing sector row (id, name or slug) is touched, and no
-- jobs, staff requests, candidates or enquiries are modified. Admin sector
-- dropdowns read active sectors at request time (lib/lookups/queries.ts) and the
-- public_jobs view exposes sectors.name, so the new sector appears with no
-- application change; the website maps the same name to /sectors/drinks-logistics.
-- A slug conflict is also tolerated so a re-run can never error or duplicate.
insert into sectors (name, slug) values
  ('Drinks Logistics', 'drinks-logistics')
on conflict do nothing;
