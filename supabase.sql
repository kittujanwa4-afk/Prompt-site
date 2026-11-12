-- Supabase Dashboard -> SQL Editor me ye paste karke Run karo
create table if not exists public.sites (
  name text primary key check (name ~ '^[a-z0-9][a-z0-9-]{2,30}$'),
  owner uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  prompt text not null default '',
  html text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sites enable row level security;

-- Functions service key use karte hain (RLS bypass). Browser se seedha access band rakhte hain.
-- Sirf owner apni list dekh sake:
create policy "owner can read own sites" on public.sites
  for select using (auth.uid() = owner);
