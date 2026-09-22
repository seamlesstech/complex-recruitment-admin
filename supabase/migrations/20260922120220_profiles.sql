-- App-level profile, 1:1 with auth.users. auth.users owns authentication identity;
-- profiles owns everything the app needs to display/authorize against.

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  email text not null unique,
  initials text,
  avatar_url text,
  role profile_role not null default 'viewer',
  status profile_status not null default 'invited',
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);
create index profiles_status_idx on profiles (status);

create trigger set_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

-- Standard Supabase pattern: a new auth.users row always gets a matching profile row.
-- SECURITY DEFINER is required because this fires under the auth admin's privileges,
-- not the (not-yet-existing) app session; fixed search_path avoids search-path hijacking.
--
-- SECURITY: role and status are NEVER read from raw_user_meta_data (or any other
-- signup-supplied field). raw_user_meta_data is set by whoever calls Supabase Auth's
-- signup/invite endpoint — in the public-facing case, that's an anonymous browser
-- request — so trusting it for an authorization decision would let any caller mint
-- themselves a super_admin/active account simply by including that JSON in a signup
-- call. Every new profile is hardcoded to the least-privileged, safe default
-- (viewer / invited) regardless of what the auth user's metadata contains.
--
-- Creating an Auth identity must NOT, by itself, grant access to Complex Admin: every
-- RLS policy in rls_foundation.sql is built on is_active_profile()/current_profile_role(),
-- both of which require status = 'active'. A freshly-created 'invited' profile is
-- therefore already invisible to every operational policy, with zero code to write or
-- maintain for that — 'invited' is inert until a trusted administrative action
-- deliberately activates it (see the bootstrap procedure below, and "Future team
-- members" note at the bottom of this file).
--
-- Role/status can only change afterwards through the trusted administrative path
-- documented at the bottom of this file, guarded by protect_profile_privileged_fields()
-- in rls_foundation.sql.
--
-- display_name IS read from metadata: it is presentation data, not an authorization
-- decision, so a caller controlling their own display name is not a privilege issue.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text := coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));
begin
  insert into profiles (id, display_name, email, initials, role, status, invited_at)
  values (
    new.id,
    v_display_name,
    new.email,
    upper(left(v_display_name, 1)),
    'viewer',
    'invited',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- The trigger guarding profiles.role / profiles.status against self-escalation lives in
-- rls_foundation.sql, alongside the current_profile_role() helper it depends on.

-- ---------------------------------------------------------------------------
-- FIRST SUPER ADMIN BOOTSTRAP (manual, one-time, NOT part of this migration)
-- ---------------------------------------------------------------------------
-- Every new profile is created as viewer/invited by handle_new_user() above, with no
-- client-supplied way to change that. The very first Super Admin is therefore promoted
-- AND activated by hand, once, from a trusted administrative context (the Supabase SQL
-- Editor, or an equivalent service-role/postgres-role connection) — never via signup
-- metadata.
--
-- Steps:
--   1. Create the user through Supabase Auth as normal (dashboard "Add user", or the
--      Admin API) using their real email. Do NOT pass role/status in its metadata —
--      handle_new_user() ignores those fields entirely now, so it would have no effect
--      anyway. This creates the auth.users row and, via the trigger, a matching
--      profiles row with role='viewer', status='invited'.
--   2. Confirm the resulting profile exists and looks as expected:
--
--        select id, email, role, status from profiles where email = '<REAL USER EMAIL>';
--
--      (expect role = 'viewer', status = 'invited' at this point)
--
--   3. Promote AND activate that specific, already-existing profile, by the real email
--      you just used in step 1:
--
--        update public.profiles
--        set
--          role = 'super_admin',
--          status = 'active'
--        where email = '<REAL USER EMAIL>';
--
-- Replace <REAL USER EMAIL> with the actual address from step 1 — nothing above is a
-- literal value to run as-is, and no placeholder UUID is embedded anywhere here either;
-- the WHERE clause always targets a row that already exists at the time you run it.
--
-- This UPDATE runs as the Postgres/service-role connection in the SQL Editor, which is
-- not subject to protect_profile_privileged_fields()'s "only Super Admin may change
-- role/status" guard the same way an ordinary authenticated app session would be (that
-- guard exists to stop an app-level user escalating themselves; a trusted admin running
-- SQL directly against the project is the deliberate, out-of-band escape hatch for the
-- very first promotion, before any Super Admin exists to do it through the app).
--
-- FUTURE TEAM MEMBERS: this is also the safe baseline for every subsequent staff
-- account, not just the first one. A new Auth identity always lands as viewer/invited
-- with zero operational access; a trusted admin must explicitly assign the approved
-- role and flip status to 'active' before that person can do anything in Complex Admin.
-- No newly-created account ever receives operational access implicitly.
