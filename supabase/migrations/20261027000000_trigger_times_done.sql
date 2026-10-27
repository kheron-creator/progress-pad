-- Let a trigger be achieved more than once a day (e.g. 4 sets of press-ups).
-- times_done only counts while status is 'achieved'.

alter table public.date_trigger_states
  add column if not exists times_done int not null default 1;

alter table public.date_trigger_states
  drop constraint if exists date_trigger_states_times_done_check;
alter table public.date_trigger_states
  add constraint date_trigger_states_times_done_check check (times_done between 1 and 999);
