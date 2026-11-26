-- WIFI Bildungsnavigator – Datenbankschema für den internen Pilot
-- In Supabase (Region EU, z. B. Frankfurt) im SQL-Editor ausführen.
-- Hinweis: Im Pilot ausschließlich fiktive Kundendaten verwenden.

create table if not exists public.cases (
  id               text primary key,          -- Fall-ID, z. B. BN-20261126-7KQ4X
  tester_id        text not null,             -- Testpersonen-ID (keine Klarnamen)
  status           text not null,
  started_at       timestamptz not null,
  last_activity_at timestamptz not null,
  data             jsonb not null             -- vollständiger Fall (Felder lt. Projektgrundlage Kap. 5)
);
create index if not exists cases_tester_idx on public.cases (tester_id);
create index if not exists cases_started_idx on public.cases (started_at desc);

create table if not exists public.messages (
  id          text primary key,
  case_id     text not null references public.cases(id) on delete cascade,
  tester_id   text not null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  sources     jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists messages_case_idx on public.messages (case_id, created_at);
create index if not exists messages_tester_idx on public.messages (tester_id, role, created_at);

create table if not exists public.settings (
  key   text primary key,
  value jsonb not null
);

-- Row Level Security: kein direkter Zugriff aus dem Browser.
-- Die Anwendung greift serverseitig mit dem Service-Role-Key zu (umgeht RLS).
alter table public.cases    enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;
