create extension if not exists "pgcrypto";
create extension if not exists moddatetime schema extensions;

create table if not exists public.compositions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'processing', 'complete')),
  memory_input text,
  refinements jsonb,
  generated_result jsonb,
  selected_format text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  composition_id uuid references public.compositions(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  format text,
  price_cents integer,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.compositions enable row level security;
alter table public.orders enable row level security;

create policy "Users can view own compositions"
on public.compositions
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own compositions"
on public.compositions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own compositions"
on public.compositions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can view own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own orders"
on public.orders
for insert
to authenticated
with check (user_id = auth.uid());

drop trigger if exists set_compositions_updated_at on public.compositions;
create trigger set_compositions_updated_at
before update on public.compositions
for each row
execute procedure extensions.moddatetime('updated_at');
