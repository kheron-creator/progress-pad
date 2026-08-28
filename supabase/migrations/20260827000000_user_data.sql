-- User data (onboarding and future profile fields).
-- Answers live in jsonb so questions can be added or removed in app code
-- without altering this table.
-- Safe to re-run: existing onboarding answers are never overwritten.

create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  onboarding jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_data
  add column if not exists avatar_url text;

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
  insert into public.user_data (user_id, full_name, avatar_url)
  values (
    new.id,
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'name',
          ''
        )
      ),
      ''
    ),
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'avatar_url',
          new.raw_user_meta_data ->> 'picture',
          ''
        )
      ),
      ''
    )
  )
  on conflict (user_id) do update
    set
      full_name = coalesce(public.user_data.full_name, excluded.full_name),
      avatar_url = coalesce(public.user_data.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Copy answers, name, and avatar out of auth metadata only when user_data is still empty.
insert into public.user_data (user_id, full_name, avatar_url, onboarding, onboarding_completed_at)
select
  id,
  nullif(
    trim(
      coalesce(
        raw_user_meta_data ->> 'full_name',
        raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  ),
  nullif(
    trim(
      coalesce(
        raw_user_meta_data ->> 'avatar_url',
        raw_user_meta_data ->> 'picture',
        ''
      )
    ),
    ''
  ),
  coalesce(raw_user_meta_data -> 'onboarding', '{}'::jsonb),
  case
    when nullif(raw_user_meta_data ->> 'onboarding_completed_at', '') is not null
      then (raw_user_meta_data ->> 'onboarding_completed_at')::timestamptz
    when coalesce(raw_user_meta_data ->> 'onboarding_complete', '') in ('true', 't', '1')
      or coalesce(raw_user_meta_data ->> 'onboardingComplete', '') in ('true', 't', '1')
      then now()
    else null
  end
from auth.users
on conflict (user_id) do update
  set
    full_name = coalesce(public.user_data.full_name, excluded.full_name),
    avatar_url = coalesce(public.user_data.avatar_url, excluded.avatar_url),
    onboarding = case
      when public.user_data.onboarding = '{}'::jsonb
        then excluded.onboarding
      else public.user_data.onboarding
    end,
    onboarding_completed_at = coalesce(
      public.user_data.onboarding_completed_at,
      excluded.onboarding_completed_at
    );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  delete from storage.objects
  where split_part(name, '/', 1) = uid::text;

  delete from public.user_data
  where user_id = uid;

  delete from auth.users
  where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
