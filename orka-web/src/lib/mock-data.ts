// lib/mock-data.ts — dados de demonstração para desenvolvimento
import type { KanbanColumn, Campaign, Client, Locutor } from '@/types/database'

export const MOCK_COLUMNS: KanbanColumn[] = [
  { id: 'col-1', nome: 'Entrada', ordem: 1, cor: '#6366f1', limite_wip: null, created_at: '' },
  { id: 'col-2', nome: 'Em Produção', ordem: 2, cor: '#8b5cf6', limite_wip: 5, created_at: '' },
  { id: 'col-3', nome: 'Locução', ordem: 3, cor: '#06b6d4', limite_wip: null, created_at: '' },
  { id: 'col-4', nome: 'Aprovação', ordem: 4, cor: '#f59e0b', limite_wip: null, created_at: '' },
  { id: 'col-5', nome: 'Entregue', ordem: 5, cor: '#10b981', limite_wip: null, created_at: '' },
]

export const MOCK_CLIENTS: Client[] = [
  { id: 'cli-1', nome: 'Banco do Brasil', codigo: 'BB', contato: 'Carla Lima', email: 'carla@bb.com.br', ativo: true, created_at: '' },
  { id: 'cli-2', nome: 'Bradesco Seguros', codigo: 'BDS', contato: 'Marcos Alves', email: 'marcos@bradesco.com.br', ativo: true, created_at: '' },
  { id: 'cli-3', nome: 'Claro Brasil', codigo: 'CLR', contato: 'Ana Souza', email: 'ana@claro.com.br', ativo: true, created_at: '' },
  { id: 'cli-4', nome: 'Havaianas', codigo: 'HVN', contato: 'Pedro Costa', email: 'pedro@havaianas.com.br', ativo: true, created_at: '' },
  { id: 'cli-5', nome: 'Itaú Unibanco', codigo: 'ITU', contato: 'Fernanda Reis', email: 'fernanda@itau.com.br', ativo: true, created_at: '' },
]

export const MOCK_LOCUTORES: Locutor[] = [
  { id: 'loc-1', nome: 'Carlos Vogt', email: 'carlos@vogt.com', especialidade: 'Institucional', taxa_hora: 450, ativo: true, created_at: '' },
  { id: 'loc-2', nome: 'Marina Silva', email: 'marina@locucao.com', especialidade: 'Varejo', taxa_hora: 380, ativo: true, created_at: '' },
  { id: 'loc-3', nome: 'Roberto Dias', email: 'roberto@dias.com', especialidade: 'Noticiário', taxa_hora: 520, ativo: true, created_at: '' },
]

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1', titulo: 'Campanha Verão 2026 — TV Aberta', cliente_id: 'cli-1',
    status: 'ativo', locutor_id: 'loc-1',
    prazo: '2026-05-20T00:00:00', prioridade: 'urgente',
    ficha_url: null, ficha_parsed_json: null, valor: 28500,
    observacoes: 'Versões 30s e 15s. Aprovação com diretora na quinta.',
    column_id: 'col-2', column_order: 1, created_at: '', updated_at: ''
  },
  {
    id: 'camp-2', titulo: 'Spot Rádio — Promoção Seguros', cliente_id: 'cli-2',
    status: 'ativo', locutor_id: 'loc-2',
    prazo: '2026-05-22T00:00:00', prioridade: 'alta',
    ficha_url: null, ficha_parsed_json: null, valor: 8200,
    observacoes: '30s. Locutor já confirmado.',
    column_id: 'col-3', column_order: 1, created_at: '', updated_at: ''
  },
  {
    id: 'camp-3', titulo: 'Digital — Lançamento Plano Família', cliente_id: 'cli-3',
    status: 'ativo', locutor_id: null,
    prazo: '2026-05-25T00:00:00', prioridade: 'media',
    ficha_url: null, ficha_parsed_json: null, valor: 15000,
    observacoes: null,
    column_id: 'col-1', column_order: 1, created_at: '', updated_at: ''
  },
  {
    id: 'camp-4', titulo: 'TVC 60s — Coleção Outono', cliente_id: 'cli-4',
    status: 'ativo', locutor_id: 'loc-3',
    prazo: '2026-05-18T00:00:00', prioridade: 'urgente',
    ficha_url: null, ficha_parsed_json: null, valor: 42000,
    observacoes: 'Cliente viaja na sexta. Aprovação precisa ser antes.',
    column_id: 'col-4', column_order: 1, created_at: '', updated_at: ''
  },
  {
    id: 'camp-5', titulo: 'Kit Réveillon — Campanha Encerramento', cliente_id: 'cli-5',
    status: 'ativo', locutor_id: 'loc-1',
    prazo: '2026-05-30T00:00:00', prioridade: 'baixa',
    ficha_url: null, ficha_parsed_json: null, valor: 19800,
    observacoes: null,
    column_id: 'col-1', column_order: 2, created_at: '', updated_at: ''
  },
  {
    id: 'camp-6', titulo: 'Social Media — Stories Produto', cliente_id: 'cli-3',
    status: 'ativo', locutor_id: null,
    prazo: '2026-06-01T00:00:00', prioridade: 'media',
    ficha_url: null, ficha_parsed_json: null, valor: 5500,
    observacoes: null,
    column_id: 'col-2', column_order: 2, created_at: '', updated_at: ''
  },
  {
    id: 'camp-7', titulo: 'Institucional 2026 — TV por Assinatura', cliente_id: 'cli-1',
    status: 'ativo', locutor_id: 'loc-2',
    prazo: '2026-05-16T00:00:00', prioridade: 'alta',
    ficha_url: null, ficha_parsed_json: null, valor: 33000,
    observacoes: 'Aprovado. Aguardando assinatura contrato.',
    column_id: 'col-5', column_order: 1, created_at: '', updated_at: ''
  },
]

export function getClientById(id: string | null): Client | undefined {
  return MOCK_CLIENTS.find(c => c.id === id)
}

export function getLocutorById(id: string | null): Locutor | undefined {
  return MOCK_LOCUTORES.find(l => l.id === id)
}

export function getCampaignsByColumn(columnId: string): Campaign[] {
  return MOCK_CAMPAIGNS
    .filter(c => c.column_id === columnId)
    .sort((a, b) => a.column_order - b.column_order)
}
