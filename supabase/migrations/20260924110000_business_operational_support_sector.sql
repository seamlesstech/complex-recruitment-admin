-- Business & Operational Support becomes the fourth canonical COMPLEX sector,
-- alongside the three seeded in 20260922120214_enums_and_lookups. The public
-- website already presents it as a sector family; it now maps to a real sector
-- so Jobs, Candidates and Staff Requests can be classified under it.
--
-- Idempotent, same shape and slug convention as the original seed. The existing
-- three sectors are untouched. Admin sector dropdowns read active sectors at
-- request time (lib/lookups/queries.ts), so no application change is needed.
insert into sectors (name, slug) values
  ('Business & Operational Support', 'business-operational-support')
on conflict (name) do nothing;
