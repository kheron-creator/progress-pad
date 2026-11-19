-- Micro sprints: short focus bursts (5 to 90 minutes) shown as lines hanging from "the T".
-- One row per sprint. The sprint itself (name, steps, checkpoints, stars, thread link)
-- lives in `data` so the page can grow without new columns.
-- Safe to re-run.

create table if not exists public.micro_sprints (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 100),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

drop trigger if exists micro_sprints_set_updated_at on public.micro_sprints;
create trigger micro_sprints_set_updated_at
  before update on public.micro_sprints
  for each row
  execute procedure public.set_updated_at();

alter table public.micro_sprints enable row level security;

drop policy if exists "Users can read own micro_sprints" on public.micro_sprints;
create policy "Users can read own micro_sprints" on public.micro_sprints
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert own micro_sprints" on public.micro_sprints;
create policy "Users can insert own micro_sprints" on public.micro_sprints
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update own micro_sprints" on public.micro_sprints;
create policy "Users can update own micro_sprints" on public.micro_sprints
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own micro_sprints" on public.micro_sprints;
create policy "Users can delete own micro_sprints" on public.micro_sprints
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on table public.micro_sprints to authenticated;
