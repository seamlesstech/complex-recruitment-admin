-- Production-grade rate limiting for the public website's intake endpoints
-- (/api/applications, /api/enquiries). Backed by Postgres rather than an
-- in-memory counter, which would be per-instance and meaningless on Vercel's
-- ephemeral serverless functions.
--
-- The table stores only a keyed HMAC hash of the caller's IP (hashed
-- server-side in the website app using RATE_LIMIT_HASH_SECRET, never the raw
-- IP), namespaced per bucket ("application" / "enquiry"), so it cannot be
-- reversed back to an address, browsed, or mutated by anon/authenticated
-- sessions. All access goes through a single SECURITY DEFINER function that is
-- executable only by service_role — the same role the website's server-only
-- Supabase client already uses for public intake writes.

create table public.intake_rate_limit_buckets (
  bucket_key text primary key,
  window_start timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.intake_rate_limit_buckets is
  'Fixed-window rate-limit counters for public website intake endpoints. Key is an HMAC hash of (bucket, client IP), never a raw IP. service_role access only — see check_public_intake_rate_limit().';

alter table public.intake_rate_limit_buckets enable row level security;

-- No policies are created: RLS with zero policies denies all access to anon
-- and authenticated by default. The REVOKE below is an explicit belt-and-braces
-- statement of the same intent for anyone reading the schema.
revoke all on public.intake_rate_limit_buckets from anon, authenticated;

create or replace function public.check_public_intake_rate_limit(
  p_bucket_key text,
  p_window_seconds integer,
  p_max_requests integer
)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count integer;
begin
  if p_bucket_key is null or length(p_bucket_key) = 0 then
    raise exception 'invalid_bucket_key';
  end if;
  if p_window_seconds is null or p_window_seconds <= 0 or p_max_requests is null or p_max_requests <= 0 then
    raise exception 'invalid_rate_limit_params';
  end if;

  insert into public.intake_rate_limit_buckets (bucket_key, window_start, request_count, updated_at)
  values (p_bucket_key, v_now, 1, v_now)
  on conflict (bucket_key) do update
    set request_count = case
          when public.intake_rate_limit_buckets.window_start <= v_now - make_interval(secs => p_window_seconds)
            then 1
          else public.intake_rate_limit_buckets.request_count + 1
        end,
        window_start = case
          when public.intake_rate_limit_buckets.window_start <= v_now - make_interval(secs => p_window_seconds)
            then v_now
          else public.intake_rate_limit_buckets.window_start
        end,
        updated_at = v_now
  returning request_count, window_start into v_count, v_window_start;

  -- Opportunistic cleanup so this table never grows unbounded; cheap enough to
  -- run inline rather than needing its own scheduled job.
  if random() < 0.01 then
    delete from public.intake_rate_limit_buckets
    where updated_at < v_now - interval '1 day';
  end if;

  if v_count > p_max_requests then
    return query select false, greatest(1, ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - v_now)))::integer);
  end if;

  return query select true, 0;
end;
$$;

comment on function public.check_public_intake_rate_limit(text, integer, integer) is
  'Atomic fixed-window rate-limit check/increment for public intake endpoints. service_role only — never grant to anon/authenticated.';

revoke all on function public.check_public_intake_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_public_intake_rate_limit(text, integer, integer) to service_role;
