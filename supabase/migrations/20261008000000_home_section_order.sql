-- Persist home page section order per user

alter table public.user_data
  add column if not exists home_section_order jsonb;
