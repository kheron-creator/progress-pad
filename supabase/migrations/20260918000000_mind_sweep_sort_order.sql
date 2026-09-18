-- Additive: existing mind_sweep_items rows keep all data; only adds/fills sort_order.

alter table public.mind_sweep_items
  add column if not exists sort_order integer;

with ranked as (
  select
    id,
    row_number() over (
      partition by user_id, on_date
      order by created_at asc, id asc
    ) as rn
  from public.mind_sweep_items
  where sort_order is null
)
update public.mind_sweep_items as items
set sort_order = ranked.rn
from ranked
where items.id = ranked.id;

alter table public.mind_sweep_items
  alter column sort_order set default 0,
  alter column sort_order set not null;

drop index if exists public.mind_sweep_items_by_day_idx;

create index if not exists mind_sweep_items_by_day_order_idx
  on public.mind_sweep_items (user_id, on_date, sort_order, created_at);
