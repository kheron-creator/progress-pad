-- User data (onboarding and future profile fields).
-- Answers live in jsonb so questions can be added or removed in app code
-- without altering this table.

create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  onboarding jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_data_onboarding_completed_at_idx
  on public.user_data (onboarding_completed_at);

alter table public.user_data enable row level security;

drop policy if exists "Users can read own user_data" on public.user_data;
create policy "Users can read own user_data"
  on public.user_data
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own user_data" on public.user_data;
create policy "Users can insert own user_data"
  on public.user_data
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own user_data" on public.user_data;
create policy "Users can update own user_data"
  on public.user_data
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on table public.user_data to authenticated;

create or replace function public.set_user_data_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_data_set_updated_at on public.user_data;
create trigger user_data_set_updated_at
  before update on public.user_data
  for each row
  execute procedure public.set_user_data_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_data (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Copy existing answers out of auth metadata (safe to re-run).
insert into public.user_data (user_id, onboarding, onboarding_completed_at)
select
  id,
  coalesce(raw_user_meta_data -> 'onboarding', '{}'::jsonb),
  case
    when nullif(raw_user_meta_data ->> 'onboarding_completed_at', '') is not null
      then (raw_user_meta_data ->> 'onboarding_completed_at')::timestamptz
    else null
  end
from auth.users
on conflict (user_id) do update
  set
    onboarding = excluded.onboarding,
    onboarding_completed_at = excluded.onboarding_completed_at;
