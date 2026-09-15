create table if not exists public.vademecum_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"done":{},"notes":{}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.vademecum_user_data enable row level security;

create policy "users read own vademecum data"
on public.vademecum_user_data for select
using (auth.uid() = user_id);

create policy "users insert own vademecum data"
on public.vademecum_user_data for insert
with check (auth.uid() = user_id);

create policy "users update own vademecum data"
on public.vademecum_user_data for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
