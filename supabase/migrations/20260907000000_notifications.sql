-- In-app notification inbox (check-in reminders first).
-- Safe to re-run: types, table, policies, and grants are created if missing.

do $$ begin
  create type public.notification_kind as enum ('check_in');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  href text,
  dedupe_key text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists notifications_user_dedupe_key_idx
  on public.notifications (user_id, dedupe_key);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on public.notifications;
create policy "Users can insert own notifications"
  on public.notifications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
  on public.notifications
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on table public.notifications to authenticated;
