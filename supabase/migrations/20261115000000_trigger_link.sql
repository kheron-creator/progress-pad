-- Optional web link a trigger opens, e.g. an affirmation in MemoPad.
alter table public.triggers
  add column if not exists link text;
