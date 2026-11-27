-- Optional: daily-cap counters for the inspiher-live function.
-- Stores only counts (a day, a label, a number). No prompts, no answers, no student data.
-- Without this table the function falls back to in-memory counters.
create table if not exists public.inspiher_ai_usage (
  day date not null,
  kind text not null,
  k text not null,
  n integer not null default 0,
  primary key (day, kind, k)
);
alter table public.inspiher_ai_usage enable row level security;
revoke all on public.inspiher_ai_usage from anon, authenticated;

create or replace function public.inspiher_bump(p_day date, p_kind text, p_key text)
returns integer language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  delete from public.inspiher_ai_usage where day < p_day - 14;
  insert into public.inspiher_ai_usage(day, kind, k, n) values (p_day, p_kind, p_key, 1)
  on conflict (day, kind, k) do update set n = public.inspiher_ai_usage.n + 1
  returning n into v;
  return v;
end $$;

create or replace function public.inspiher_peek(p_day date, p_kind text, p_key text)
returns integer language sql security definer set search_path = public as $$
  select coalesce((select n from public.inspiher_ai_usage where day = p_day and kind = p_kind and k = p_key), 0);
$$;

revoke all on function public.inspiher_bump(date, text, text) from public, anon, authenticated;
revoke all on function public.inspiher_peek(date, text, text) from public, anon, authenticated;
grant execute on function public.inspiher_bump(date, text, text) to service_role;
grant execute on function public.inspiher_peek(date, text, text) to service_role;
