-- Eisenhower box for a Mind Sweep item: do now, schedule, delegate or drop.
-- Null means not sorted yet. Rank inside a box reuses sort_order.

alter table public.mind_sweep_items
  add column if not exists priority text;

alter table public.mind_sweep_items
  drop constraint if exists mind_sweep_items_priority_check;
alter table public.mind_sweep_items
  add constraint mind_sweep_items_priority_check check (priority in ('do', 'schedule', 'delegate', 'drop'));
