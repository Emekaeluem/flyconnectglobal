-- Run in a dedicated Supabase project SQL editor. Server-side writes use the service role key.
create table if not exists public.ai_leads (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 name text not null,
 phone text not null,
 email text,
 interest text,
 conversation jsonb not null default '[]'::jsonb,
 consented_at timestamptz not null,
 status text not null default 'new' check (status in ('new','contacted','qualified','closed'))
);
alter table public.ai_leads enable row level security;
-- No policies for anon/authenticated roles; only trusted server-side service role can access.
