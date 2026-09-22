-- Extensions and reusable foundational helpers.
-- Used by every subsequent migration; contains no domain tables.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- future ILIKE/trigram search indexes

-- Generic "touch updated_at" trigger, applied per-table below.
-- Timezone-aware: `now()` returns timestamptz, so no naive local time ever lands in the column.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Generic human-readable reference generator.
-- Usage: `execute function set_reference('JOB-', 'jobs_reference_seq')` as a BEFORE INSERT trigger.
-- Only fills the column when the caller left it null, so a sequence is always the source of
-- truth for new rows while remaining a no-op for any explicit value a migration/seed supplies.
create or replace function set_reference()
returns trigger
language plpgsql
as $$
declare
  v_prefix text := TG_ARGV[0];
  v_seq_name text := TG_ARGV[1];
begin
  if NEW.reference is null then
    NEW.reference := v_prefix || lpad(nextval(v_seq_name)::text, 4, '0');
  end if;
  return NEW;
end;
$$;
