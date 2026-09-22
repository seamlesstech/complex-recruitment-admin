-- Attention-requiring events for a specific recipient — not the audit log.
--
-- `read_at` is the sole read-state column (approved architecture Step 10): NULL means
-- unread, non-null means read at that instant. No separate boolean is stored.

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles (id) on delete cascade,
  type text not null references notification_event_types (key),
  -- Informational navigation reference only, not FK-enforced — acceptable here
  -- (unlike the Enquiry conversion links) because the worst failure mode is a dead
  -- link in someone's notification list, not a corrupted business relationship.
  entity_type text,
  entity_id uuid,
  entity_reference text,
  title text not null,
  message text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_unread_idx
  on notifications (recipient_id, created_at)
  where read_at is null;
create index notifications_recipient_created_idx on notifications (recipient_id, created_at desc);
create index notifications_entity_idx on notifications (entity_type, entity_id);

-- One row per (profile, event) override (Option B, approved architecture §21). The
-- composite PK enforces "at most one row per user per event" for free. Absence of a
-- row means "use notification_event_types' default" — see effective_notification_preferences
-- below — so most users never need a row written for them at all.
create table notification_preferences (
  profile_id uuid not null references profiles (id) on delete cascade,
  event_key text not null references notification_event_types (key) on delete cascade,
  in_app boolean not null,
  email boolean not null,
  updated_at timestamptz not null default now(),
  primary key (profile_id, event_key)
);

create trigger set_notification_preferences_updated_at
before update on notification_preferences
for each row execute function set_updated_at();

-- Resolves each profile's effective preference per event: an explicit override row
-- when present, otherwise notification_event_types' default_in_app/default_email
-- (amendment 3). Runs with the querying user's own privileges (no security barrier
-- needed) since RLS on the underlying tables already governs row visibility.
create view effective_notification_preferences as
select
  p.id as profile_id,
  t.key as event_key,
  coalesce(pref.in_app, t.default_in_app) as in_app,
  coalesce(pref.email, t.default_email) as email
from profiles p
cross join notification_event_types t
left join notification_preferences pref
  on pref.profile_id = p.id and pref.event_key = t.key;
