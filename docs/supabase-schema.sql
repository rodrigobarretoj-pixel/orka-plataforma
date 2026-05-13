-- ============================================================
-- ORKA — Schema SQL para Supabase
-- Execute no SQL Editor do Supabase Studio
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── CLIENTS ──────────────────────────────────────────────────
create table if not exists clients (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  codigo      text,
  contato     text,
  email       text,
  ativo       boolean default true,
  created_at  timestamptz default now()
);

-- ── LOCUTORES ─────────────────────────────────────────────────
create table if not exists locutores (
  id              uuid primary key default uuid_generate_v4(),
  nome            text not null,
  email           text,
  especialidade   text,
  taxa_hora       numeric(10,2),
  ativo           boolean default true,
  created_at      timestamptz default now()
);

-- ── KANBAN COLUMNS ────────────────────────────────────────────
create table if not exists kanban_columns (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  ordem       integer not null default 0,
  cor         text default '#6366f1',
  limite_wip  integer,
  created_at  timestamptz default now()
);

-- Default columns
insert into kanban_columns (nome, ordem, cor) values
  ('Entrada',     1, '#6366f1'),
  ('Em Produção', 2, '#8b5cf6'),
  ('Locução',     3, '#06b6d4'),
  ('Aprovação',   4, '#f59e0b'),
  ('Entregue',    5, '#10b981')
on conflict do nothing;

-- ── CAMPAIGNS ─────────────────────────────────────────────────
create table if not exists campaigns (
  id                  uuid primary key default uuid_generate_v4(),
  titulo              text not null,
  cliente_id          uuid references clients(id) on delete set null,
  status              text default 'ativo',
  locutor_id          uuid references locutores(id) on delete set null,
  prazo               timestamptz,
  prioridade          text default 'media' check (prioridade in ('baixa','media','alta','urgente')),
  ficha_url           text,
  ficha_parsed_json   jsonb,
  valor               numeric(12,2),
  observacoes         text,
  column_id           uuid references kanban_columns(id) on delete set null,
  column_order        integer default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger campaigns_updated_at
  before update on campaigns
  for each row execute function update_updated_at();

-- ── LOCUCOES ──────────────────────────────────────────────────
create table if not exists locucoes (
  id            uuid primary key default uuid_generate_v4(),
  campaign_id   uuid references campaigns(id) on delete cascade,
  script_texto  text,
  locutor_id    uuid references locutores(id) on delete set null,
  status        text default 'aguardando' check (status in ('aguardando','gravando','revisao','aprovado')),
  audio_url     text,
  prazo         timestamptz,
  entregue_em   timestamptz,
  created_at    timestamptz default now()
);

-- ── FICHA JOBS ────────────────────────────────────────────────
create table if not exists ficha_jobs (
  id              uuid primary key default uuid_generate_v4(),
  campaign_id     uuid references campaigns(id) on delete set null,
  arquivo_url     text not null,
  status          text default 'pending' check (status in ('pending','processing','done','error')),
  resultado_json  jsonb,
  erro            text,
  created_at      timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table clients       enable row level security;
alter table locutores     enable row level security;
alter table kanban_columns enable row level security;
alter table campaigns     enable row level security;
alter table locucoes      enable row level security;
alter table ficha_jobs    enable row level security;

-- Policies: authenticated users can read/write all (ajuste por role depois)
create policy "auth_all" on clients       for all using (auth.role() = 'authenticated');
create policy "auth_all" on locutores     for all using (auth.role() = 'authenticated');
create policy "auth_all" on kanban_columns for all using (auth.role() = 'authenticated');
create policy "auth_all" on campaigns     for all using (auth.role() = 'authenticated');
create policy "auth_all" on locucoes      for all using (auth.role() = 'authenticated');
create policy "auth_all" on ficha_jobs    for all using (auth.role() = 'authenticated');

-- ── REALTIME ──────────────────────────────────────────────────
-- Habilite no Supabase Studio > Database > Replication
-- Tabelas: campaigns, kanban_columns, locucoes

-- ── SEED INICIAL ──────────────────────────────────────────────
insert into clients (nome, codigo, contato, email) values
  ('Banco do Brasil',  'BB',  'Carla Lima',    'carla@bb.com.br'),
  ('Bradesco Seguros', 'BDS', 'Marcos Alves',  'marcos@bradesco.com.br'),
  ('Claro Brasil',     'CLR', 'Ana Souza',     'ana@claro.com.br'),
  ('Havaianas',        'HVN', 'Pedro Costa',   'pedro@havaianas.com.br'),
  ('Itaú Unibanco',    'ITU', 'Fernanda Reis', 'fernanda@itau.com.br')
on conflict do nothing;

insert into locutores (nome, email, especialidade, taxa_hora) values
  ('Carlos Vogt',   'carlos@vogt.com',     'Institucional', 450),
  ('Marina Silva',  'marina@locucao.com',  'Varejo',        380),
  ('Roberto Dias',  'roberto@dias.com',    'Noticiário',    520)
on conflict do nothing;
