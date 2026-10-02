-- ==============================================================================
-- SPORTS MEET LIVE 2026 - PRODUCTION DATABASE SCHEMA & SECURITY MIGRATION
-- Migration Version: 001_sports_meet.sql
-- Description: Creates teams, events, scoring_rules, results, standings_adjustments, authorized_admins
--              Enforces Supabase Row Level Security (RLS) policies for authorized email whitelist.
-- ==============================================================================

-- 1. EXTENSIONS & FUNCTIONS
create extension if not exists "uuid-ossp";

-- Helper function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. TEAMS TABLE (base_points removed; team points come strictly from results & adjustments)
create table if not exists public.teams (
  id text primary key,
  name text not null,
  code text not null,
  color text,
  secondary_color text,
  logo_url text,
  created_at timestamptz not null default now()
);

-- 3. EVENTS TABLE
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Athletics',
  scheduled_at timestamptz,
  status text not null default 'completed' check (status in ('upcoming', 'ongoing', 'completed')),
  created_at timestamptz not null default now()
);

-- 4. SCORING RULES TABLE
create table if not exists public.scoring_rules (
  id uuid primary key default gen_random_uuid(),
  position integer not null unique check (position > 0),
  points integer not null check (points >= 0),
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_scoring_rules_updated_at
  before update on public.scoring_rules
  for each row execute function update_updated_at_column();

-- 5. STANDINGS ADJUSTMENTS TABLE (Explicit Starting Points / Auditable Adjustments)
create table if not exists public.standings_adjustments (
  id uuid primary key default gen_random_uuid(),
  team_id text not null references public.teams(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_by text,
  created_at timestamptz not null default now()
);

-- 6. RESULTS TABLE
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  team_id text not null references public.teams(id) on delete cascade,
  position integer not null check (position > 0),
  points integer not null check (points >= 0),
  created_by text,
  created_at timestamptz not null default now(),
  -- Ensure a team has only 1 position entry per event
  constraint unique_event_team unique (event_id, team_id),
  -- Ensure a single position rank is awarded only once per event
  constraint unique_event_position unique (event_id, position)
);

-- 7. AUTHORIZED ADMINS TABLE (ADMIN WHITELIST)
create table if not exists public.authorized_admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper Security Definer Function: Checks if JWT email exists in active authorized_admins whitelist
create or replace function public.is_authorized_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.authorized_admins
    where lower(email) = lower(auth.jwt() ->> 'email')
      and active = true
  );
end;
$$ language plpgsql security definer;

-- Enable RLS on all tables
alter table public.teams enable row level security;
alter table public.events enable row level security;
alter table public.scoring_rules enable row level security;
alter table public.standings_adjustments enable row level security;
alter table public.results enable row level security;
alter table public.authorized_admins enable row level security;

-- --- PUBLIC READ POLICIES (Everyone can view public sports meet data) ---
create policy "Public read access for teams" on public.teams for select using (true);
create policy "Public read access for events" on public.events for select using (true);
create policy "Public read access for scoring_rules" on public.scoring_rules for select using (true);
create policy "Public read access for standings_adjustments" on public.standings_adjustments for select using (true);
create policy "Public read access for results" on public.results for select using (true);

-- --- AUTHORIZED ADMIN WRITE POLICIES (Strictly enforced at database level) ---

-- Standings Adjustments: Only authorized admins can insert, update, or delete adjustments
create policy "Admins can manage standings_adjustments" on public.standings_adjustments
  for all using (public.is_authorized_admin());

-- Results: Only authorized admins can insert, update, or delete event results
create policy "Admins can insert results" on public.results
  for insert with check (public.is_authorized_admin());

create policy "Admins can update results" on public.results
  for update using (public.is_authorized_admin());

create policy "Admins can delete results" on public.results
  for delete using (public.is_authorized_admin());

-- Events: Only authorized admins can manage events
create policy "Admins can manage events" on public.events
  for all using (public.is_authorized_admin());

-- Scoring Rules: Only authorized admins can update scoring rules
create policy "Admins can update scoring_rules" on public.scoring_rules
  for update using (public.is_authorized_admin());

-- Authorized Admins: Users can view whitelist if logged in or authorized
create policy "Admins view authorized_admins" on public.authorized_admins
  for select using (
    public.is_authorized_admin() 
    or lower(email) = lower(auth.jwt() ->> 'email')
  );

-- ==============================================================================
-- REALTIME PUBLICATION ENABLEMENT
-- ==============================================================================

begin;
  alter publication supabase_realtime add table public.results;
  alter publication supabase_realtime add table public.standings_adjustments;
  alter publication supabase_realtime add table public.scoring_rules;
  alter publication supabase_realtime add table public.events;
commit;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. Seed Teams
insert into public.teams (id, name, code) values
  ('team-vertex', 'Vertex', 'VTX'),
  ('team-zenith', 'Zenith', 'ZNT'),
  ('team-astra',  'Astra',  'AST'),
  ('team-nova',   'Nova',   'NOV')
on conflict (id) do update set name = excluded.name;

-- 2. Seed Scoring Rules (Configurable Rules: 1st->10, 2nd->5, 3rd->3, 4th->0)
insert into public.scoring_rules (position, points, label) values
  (1, 10, '1st Place'),
  (2, 5,  '2nd Place'),
  (3, 3,  '3rd Place'),
  (4, 0,  '4th Place')
on conflict (position) do update set points = excluded.points;

-- 3. Seed Initial Standings Adjustments (Starting pre-system points)
insert into public.standings_adjustments (team_id, points, reason) values
  ('team-vertex', 10, 'Initial standings — pre-system results'),
  ('team-zenith', 5,  'Initial standings — pre-system results'),
  ('team-astra',  3,  'Initial standings — pre-system results'),
  ('team-nova',   0,  'Initial standings — pre-system results')
on conflict do nothing;

-- 4. Seed Sample Event for development
insert into public.events (id, name, category, status) values
  ('11111111-1111-1111-1111-111111111111', '100m Track Sprint', 'Athletics', 'completed')
on conflict (id) do nothing;

-- 5. Seed Example Authorized Admin Whitelist Records
insert into public.authorized_admins (email, name, active) values
  ('admin@example.com', 'Primary Event Admin', true),
  ('sports@example.com', 'Sports Committee Admin', true)
on conflict (email) do nothing;
