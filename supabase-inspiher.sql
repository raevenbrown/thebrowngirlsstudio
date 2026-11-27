-- InspiHER class page: NOT applied yet. Run in Supabase > SQL Editor only after
-- Newton County Schools approves saving student cards, then set CONFIG.COLLECT to true
-- in inspiher-class.html. Girls (anonymous visitors) can ONLY add rows. They cannot
-- read, change or delete anything. You read cards in the Table Editor while logged in.
create table if not exists public.inspiher_sparks (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  session_no    int  not null check (session_no between 1 and 4),
  grade         text not null check (grade in ('5th grade','6th grade','7th grade','8th grade','9th grade','10th grade','11th grade','12th grade')),
  initials      text not null check (initials ~ '^[A-Za-z]{1,3}$'),
  card_title    text not null check (char_length(card_title) between 1 and 40),
  made_text     text not null check (char_length(made_text) between 1 and 160),
  bio           text not null check (char_length(bio) between 1 and 80),
  approved      boolean not null default false,   -- you flip this after you read the card
  consent_on_file boolean not null default false  -- you flip this after you match a signed form
);
create table if not exists public.inspiher_feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_no int  not null check (session_no between 1 and 4),
  mood       text not null check (mood in ('love','ok','meh')),
  wish       text not null check (wish in ('time','robots','ai','prizes'))
);
alter table public.inspiher_sparks   enable row level security;
alter table public.inspiher_feedback enable row level security;
drop policy if exists "girls can add a card" on public.inspiher_sparks;
create policy "girls can add a card" on public.inspiher_sparks for insert to anon
  with check (approved = false and consent_on_file = false);
drop policy if exists "girls can add feedback" on public.inspiher_feedback;
create policy "girls can add feedback" on public.inspiher_feedback for insert to anon with check (true);
revoke all on public.inspiher_sparks, public.inspiher_feedback from anon;
grant insert (session_no, grade, initials, card_title, made_text, bio) on public.inspiher_sparks to anon;
grant insert (session_no, mood, wish) on public.inspiher_feedback to anon;
-- Auto-delete rule from the draft agreement (cards with no "Yes" on file, 90 days after the event):
-- delete from public.inspiher_sparks where consent_on_file = false and created_at < now() - interval '90 days';
