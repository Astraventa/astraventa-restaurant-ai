-- Astraventa Restaurant AI - Supabase schema
-- Postgres SQL to create contact submissions and chat storage
-- Safe for public demo usage with RLS. Clients must send header `x-client-id: <uuid>`.

-- Extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()
create extension if not exists citext;   -- case-insensitive email

-- Helper to read request headers in RLS policies
create or replace function public.request_header(name text)
returns text
language sql
stable
as $$
  select coalesce((current_setting('request.headers', true)::json ->> name), '');
$$;

-- Enumerations
do $$ begin
  create type public.lead_status as enum ('new','reviewing','qualified','won','lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.channel as enum ('web','whatsapp','phone','email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_role as enum ('system','user','assistant');
exception when duplicate_object then null; end $$;

-- CONTACT SUBMISSIONS
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  email citext not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  phone text null check (phone ~ '^[+0-9 ()-]{6,20}$'),
  message text not null check (length(message) between 1 and 5000),
  source public.channel not null default 'web',
  utm jsonb not null default '{}'::jsonb,
  client_ip inet,
  user_agent text,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  notes text
);

create index if not exists idx_contact_created_at on public.contact_submissions (created_at desc);
create index if not exists idx_contact_email on public.contact_submissions (email);

alter table public.contact_submissions enable row level security;

-- Allow anonymous INSERTs only; disallow select/update/delete publicly.
drop policy if exists contact_insert_any on public.contact_submissions;
create policy contact_insert_any on public.contact_submissions
  for insert to anon
  with check (true);

drop policy if exists contact_select_none on public.contact_submissions;
create policy contact_select_none on public.contact_submissions
  for select to anon using (false);

-- CONVERSATIONS (chat threads)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null, -- anonymous client/session id from frontend
  channel public.channel not null default 'web',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  lead_id uuid null references public.contact_submissions(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_conversation_client on public.conversations (client_id);
create index if not exists idx_conversation_started on public.conversations (started_at desc);

alter table public.conversations enable row level security;

-- Only allow a client (via x-client-id header) to manage their own conversation rows
drop policy if exists conversations_insert_own on public.conversations;
create policy conversations_insert_own on public.conversations
  for insert to anon
  with check (client_id::text = public.request_header('x-client-id'));

drop policy if exists conversations_select_own on public.conversations;
create policy conversations_select_own on public.conversations
  for select to anon
  using (client_id::text = public.request_header('x-client-id'));

drop policy if exists conversations_update_own on public.conversations;
create policy conversations_update_own on public.conversations
  for update to anon
  using (client_id::text = public.request_header('x-client-id'))
  with check (client_id::text = public.request_header('x-client-id'));

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role public.message_role not null,
  content text not null check (length(content) between 1 and 8000),
  model text,                   -- e.g. llama-3.1-70b-instruct
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  prompt_tokens integer check (prompt_tokens is null or prompt_tokens >= 0),
  completion_tokens integer check (completion_tokens is null or completion_tokens >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_time on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

-- Only allow reading/writing messages for conversations owned by the same client
drop policy if exists messages_insert_own on public.messages;
create policy messages_insert_own on public.messages
  for insert to anon
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.client_id::text = public.request_header('x-client-id')
    )
  );

drop policy if exists messages_select_own on public.messages;
create policy messages_select_own on public.messages
  for select to anon
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.client_id::text = public.request_header('x-client-id')
    )
  );

-- OPTIONAL: Booking leads (kept minimal, can be extended later)
create table if not exists public.booking_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  phone text not null check (phone ~ '^[+0-9 ()-]{6,20}$'),
  email citext,
  party_size int not null check (party_size > 0 and party_size < 50),
  reservation_time timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  source public.channel not null default 'web'
);

create index if not exists idx_booking_created on public.booking_leads (created_at desc);

alter table public.booking_leads enable row level security;

drop policy if exists booking_insert_any on public.booking_leads;
create policy booking_insert_any on public.booking_leads
  for insert to anon
  with check (true);

drop policy if exists booking_select_none on public.booking_leads;
create policy booking_select_none on public.booking_leads
  for select to anon using (false);

-- NOTES
-- 1) Frontend must generate a UUID client id and:
--    - include it in new conversation rows as `client_id`
--    - send the same value in request header: `x-client-id: <uuid>`
--    Supabase JS: `supabase.from('conversations').insert({...}, { headers: { 'x-client-id': clientId }})`
-- 2) Public can insert contact_submissions and booking_leads but cannot read them.
--    Use the service role key or Supabase dashboard to read/export.
-- 3) For production, add additional rate limiting at the API layer and spam filters.


