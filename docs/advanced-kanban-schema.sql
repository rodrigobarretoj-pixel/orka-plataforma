-- NOVAS TABELAS PARA FUNCIONALIDADES AVANÇADAS DO KANBAN (ESTILO PLANNER)

-- 1. Checklists (Subtarefas)
create table if not exists campaign_checklists (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  texto text not null,
  is_completed boolean default false,
  ordem integer default 0,
  created_at timestamptz default now()
);

-- 2. Comentários (Histórico)
create table if not exists campaign_comments (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  texto text not null,
  autor_nome text default 'Sistema', -- Pode ser linkado com uma tabela de usuários no futuro
  created_at timestamptz default now()
);

-- 3. Etiquetas (Labels)
create table if not exists campaign_labels (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  texto text not null,
  cor text default '#3b82f6',
  created_at timestamptz default now()
);

-- 4. Anexos
create table if not exists campaign_attachments (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text,
  created_at timestamptz default now()
);
