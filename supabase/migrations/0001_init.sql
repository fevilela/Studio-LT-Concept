-- Studio LT Concept — schema inicial
-- Cobre Fase 1 (site + orçamentos) e já prepara as tabelas das Fases 2-4
-- (agenda, equipe, WhatsApp, bot) para evitar migrações retroativas.

-- ===========================================================================
-- ENUMS
-- ===========================================================================

create type service_category as enum ('maquiagem', 'penteado', 'cerimonia', 'pacote');
create type quote_status as enum ('pending', 'sent', 'approved', 'rejected', 'expired');
create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
create type conversation_status as enum ('bot_active', 'human_active', 'closed');
create type message_direction as enum ('inbound', 'outbound');
create type message_sender as enum ('client', 'bot', 'human', 'system');
create type quote_source as enum ('public_form', 'staff', 'bot');
create type team_role as enum ('admin', 'staff');

-- ===========================================================================
-- CLIENTES
-- ===========================================================================

create table clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text unique not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===========================================================================
-- CATÁLOGO: SERVIÇOS E EXTRAS
-- ===========================================================================

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category service_category not null,
  description text,
  base_price numeric(10, 2) not null,
  duration_minutes int not null default 60,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table extras (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null,
  active boolean not null default true
);

-- ===========================================================================
-- EQUIPE
-- ===========================================================================

create table team_members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id),
  full_name text not null,
  role team_role not null default 'staff',
  job_title text,
  bio text,
  instagram_handle text,
  photo_url text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- ORÇAMENTOS
-- ===========================================================================

create table quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id),
  event_date date not null,
  event_time time,
  event_location text,
  number_of_people int not null default 1,
  status quote_status not null default 'pending',
  total_value numeric(10, 2),
  notes text,
  created_by quote_source not null default 'public_form',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  service_id uuid references services (id),
  extra_id uuid references extras (id),
  quantity int not null default 1,
  unit_price numeric(10, 2) not null,
  subtotal numeric(10, 2) not null,
  check (service_id is not null or extra_id is not null)
);

-- ===========================================================================
-- AGENDA
-- ===========================================================================

create table appointments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references quotes (id),
  client_id uuid not null references clients (id),
  team_member_id uuid not null references team_members (id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status appointment_status not null default 'scheduled',
  location text,
  notes text,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index idx_appointments_conflict on appointments (team_member_id, start_time, end_time);

create table availability_blocks (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid references team_members (id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- ===========================================================================
-- WHATSAPP
-- ===========================================================================

create table whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients (id),
  phone_number text not null unique,
  status conversation_status not null default 'bot_active',
  assigned_to uuid references team_members (id),
  last_message_at timestamptz,
  unread_count int not null default 0,
  created_at timestamptz not null default now()
);

create table whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references whatsapp_conversations (id) on delete cascade,
  direction message_direction not null,
  sender_type message_sender not null,
  content text,
  message_type text not null default 'text',
  media_url text,
  whatsapp_message_id text unique,
  status text not null default 'sent',
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create index idx_whatsapp_messages_conversation on whatsapp_messages (conversation_id, created_at);

-- ===========================================================================
-- BOT
-- ===========================================================================

create table bot_config (
  id int primary key default 1,
  system_prompt text not null default '',
  business_hours jsonb,
  escalation_keywords text[] not null default array['atendente', 'humano', 'falar com alguém'],
  active boolean not null default false,
  updated_at timestamptz not null default now(),
  check (id = 1)
);

insert into bot_config (id, system_prompt, active) values (1, '', false);

create table bot_tool_calls (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references whatsapp_conversations (id),
  tool_name text not null,
  input jsonb,
  output jsonb,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- GALERIA
-- ===========================================================================

create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text,
  storage_path text not null,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- updated_at automático
-- ===========================================================================

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_clients_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger trg_quotes_updated_at before update on quotes
  for each row execute function set_updated_at();

-- ===========================================================================
-- RLS
-- ===========================================================================

alter table clients enable row level security;
alter table services enable row level security;
alter table extras enable row level security;
alter table team_members enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table appointments enable row level security;
alter table availability_blocks enable row level security;
alter table whatsapp_conversations enable row level security;
alter table whatsapp_messages enable row level security;
alter table bot_config enable row level security;
alter table bot_tool_calls enable row level security;
alter table gallery_images enable row level security;

-- Leitura pública (site institucional): apenas conteúdo ativo/publicável.
create policy "public read active services" on services
  for select to anon using (active = true);

create policy "public read active extras" on extras
  for select to anon using (active = true);

create policy "public read active team_members" on team_members
  for select to anon using (active = true);

create policy "public read active gallery_images" on gallery_images
  for select to anon using (active = true);

-- Nenhuma policy para "anon" nas tabelas sensíveis (clients, quotes, appointments,
-- whatsapp_*, bot_config, bot_tool_calls) — por padrão, RLS nega tudo que não tem
-- policy. Toda leitura/escrita nessas tabelas passa por API routes no servidor
-- usando a connection string com privilégio total (equivalente ao service_role),
-- nunca pelo navegador diretamente.

-- Policies do painel admin (equipe autenticada) serão adicionadas na Fase 2,
-- quando o Supabase Auth for configurado e `team_members.auth_user_id` for
-- vinculado aos logins da equipe.
