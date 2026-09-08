-- User content: trigger library, scenarios, dated plans, writing, mind sweep, pillars.
-- Library items are soft-deleted (deleted_at) so past date assignments keep resolving.
-- Do not hard-delete triggers or scenarios from the app; that would cascade off dates.
-- Safe to re-run: types, tables, policies, and grants are created if missing.

do $$ begin
  create type public.trigger_status as enum ('todo', 'achieved');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.date_assignment_kind as enum ('trigger', 'scenario');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.writing_kind as enum (
    'gratitude',
    'quotes',
    'journal',
    'reflections',
    'done'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  emoji text,
  source_key text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists triggers_user_source_key_idx
  on public.triggers (user_id, source_key)
  where source_key is not null;

create index if not exists triggers_user_library_idx
  on public.triggers (user_id)
  where deleted_at is null;

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  emoji text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scenarios_user_library_idx
  on public.scenarios (user_id)
  where deleted_at is null;

create table if not exists public.scenario_triggers (
  scenario_id uuid not null references public.scenarios (id) on delete cascade,
  trigger_id uuid not null references public.triggers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  position int not null check (position >= 0),
  primary key (scenario_id, trigger_id)
);

create index if not exists scenario_triggers_trigger_idx
  on public.scenario_triggers (trigger_id);

create index if not exists scenario_triggers_user_idx
  on public.scenario_triggers (user_id);

create table if not exists public.date_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  on_date date not null,
  kind public.date_assignment_kind not null,
  trigger_id uuid references public.triggers (id) on delete cascade,
  scenario_id uuid references public.scenarios (id) on delete cascade,
  position int not null check (position >= 0),
  created_at timestamptz not null default now(),
  check (
    (kind = 'trigger' and trigger_id is not null and scenario_id is null)
    or
    (kind = 'scenario' and scenario_id is not null and trigger_id is null)
  )
);

create unique index if not exists date_assignments_trigger_once_idx
  on public.date_assignments (user_id, on_date, trigger_id)
  where trigger_id is not null;

create unique index if not exists date_assignments_scenario_once_idx
  on public.date_assignments (user_id, on_date, scenario_id)
  where scenario_id is not null;

create index if not exists date_assignments_by_day_idx
  on public.date_assignments (user_id, on_date, position);

create table if not exists public.date_trigger_states (
  user_id uuid not null references auth.users (id) on delete cascade,
  on_date date not null,
  trigger_id uuid not null references public.triggers (id) on delete cascade,
  status public.trigger_status not null default 'todo',
  updated_at timestamptz not null default now(),
  primary key (user_id, on_date, trigger_id)
);

create table if not exists public.pillar_entries (
  user_id uuid not null references auth.users (id) on delete cascade,
  on_date date not null,
  pillar_id text not null check (
    pillar_id in (
      'mentally',
      'emotionally',
      'professionally',
      'physically',
      'socially',
      'romantically'
    )
  ),
  rating int not null check (rating between 1 and 10),
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, on_date, pillar_id)
);

create table if not exists public.writing_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  on_date date not null,
  kind public.writing_kind not null,
  title text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists writing_entries_by_day_idx
  on public.writing_entries (user_id, on_date, kind, created_at);

create table if not exists public.mind_sweep_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  on_date date not null,
  title text not null,
  notes text,
  status public.trigger_status not null default 'todo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mind_sweep_items_by_day_idx
  on public.mind_sweep_items (user_id, on_date, created_at);

create or replace function public.enforce_scenario_trigger_owner()
returns trigger
language plpgsql
as $$
declare
  scenario_user uuid;
  trigger_user uuid;
begin
  select user_id into scenario_user from public.scenarios where id = new.scenario_id;
  select user_id into trigger_user from public.triggers where id = new.trigger_id;

  if scenario_user is null or trigger_user is null
    or scenario_user <> trigger_user
    or new.user_id <> scenario_user
  then
    raise exception 'scenario and trigger must belong to the same user';
  end if;

  return new;
end;
$$;

drop trigger if exists scenario_triggers_owner on public.scenario_triggers;
create trigger scenario_triggers_owner
  before insert or update on public.scenario_triggers
  for each row
  execute procedure public.enforce_scenario_trigger_owner();

create or replace function public.enforce_date_assignment_owner()
returns trigger
language plpgsql
as $$
begin
  if new.kind = 'trigger' then
    if not exists (
      select 1 from public.triggers
      where id = new.trigger_id and user_id = new.user_id
    ) then
      raise exception 'trigger must belong to the same user';
    end if;
  else
    if not exists (
      select 1 from public.scenarios
      where id = new.scenario_id and user_id = new.user_id
    ) then
      raise exception 'scenario must belong to the same user';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists date_assignments_owner on public.date_assignments;
create trigger date_assignments_owner
  before insert or update on public.date_assignments
  for each row
  execute procedure public.enforce_date_assignment_owner();

drop trigger if exists triggers_set_updated_at on public.triggers;
create trigger triggers_set_updated_at
  before update on public.triggers
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists scenarios_set_updated_at on public.scenarios;
create trigger scenarios_set_updated_at
  before update on public.scenarios
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists date_trigger_states_set_updated_at on public.date_trigger_states;
create trigger date_trigger_states_set_updated_at
  before update on public.date_trigger_states
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists pillar_entries_set_updated_at on public.pillar_entries;
create trigger pillar_entries_set_updated_at
  before update on public.pillar_entries
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists mind_sweep_items_set_updated_at on public.mind_sweep_items;
create trigger mind_sweep_items_set_updated_at
  before update on public.mind_sweep_items
  for each row
  execute procedure public.set_updated_at();

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'triggers',
    'scenarios',
    'scenario_triggers',
    'date_assignments',
    'date_trigger_states',
    'pillar_entries',
    'writing_entries',
    'mind_sweep_items'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);

    policy_name := 'Users can read own ' || table_name;
    execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)',
      policy_name,
      table_name
    );

    policy_name := 'Users can insert own ' || table_name;
    execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (auth.uid() = user_id)',
      policy_name,
      table_name
    );

    policy_name := 'Users can update own ' || table_name;
    execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    execute format(
      'create policy %I on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      policy_name,
      table_name
    );

    policy_name := 'Users can delete own ' || table_name;
    execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (auth.uid() = user_id)',
      policy_name,
      table_name
    );

    execute format(
      'grant select, insert, update, delete on table public.%I to authenticated',
      table_name
    );
  end loop;
end $$;
