-- The AI Lab student portal: run this once in Supabase > SQL Editor.
-- Students (anonymous visitors) can ONLY add rows. They cannot read, change or delete anything.
create table if not exists public.portal_submissions (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  student_name  text not null check (char_length(student_name) between 1 and 40),
  session_name  text not null check (session_name in ('5th Grade','Middle School','High School')),
  project_title text not null check (char_length(project_title) between 1 and 80),
  project_url   text check (project_url is null or (char_length(project_url) <= 300 and project_url ~* '^https?://')),
  rating        int  not null check (rating between 1 and 10)
);

alter table public.portal_submissions enable row level security;

drop policy if exists "students can submit" on public.portal_submissions;
create policy "students can submit"
  on public.portal_submissions for insert
  to anon
  with check (true);

-- No select/update/delete policy for anon: you read submissions from the Supabase Table Editor (logged in).
revoke all on public.portal_submissions from anon;
grant insert on public.portal_submissions to anon;
