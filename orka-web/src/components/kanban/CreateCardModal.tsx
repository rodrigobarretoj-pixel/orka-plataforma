'use client'

import { useState } from 'react'
import { X, Calendar, DollarSign, Loader2 } from 'lucide-react'
import type { Client, Locutor, KanbanColumn } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface CreateCardModalProps {
  clients: Client[]
  locutores: Locutor[]
  columns: KanbanColumn[]
  initialColumnId?: string
  onClose: () => void
  onSuccess: () => void
}

export default function CreateCardModal({ clients, locutores, columns, initialColumnId, onClose, onSuccess }: CreateCardModalProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    titulo: '',
    cliente_id: '',
    locutor_id: '',
    prazo: '',
    prioridade: 'media',
    valor: '',
    observacoes: '',
    column_id: initialColumnId || (columns[0]?.id ?? '')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: import('@/types/database').Database['public']['Tables']['campaigns']['Insert'] = {
        titulo: formData.titulo,
        cliente_id: formData.cliente_id || null,
        locutor_id: formData.locutor_id || null,
        prazo: formData.prazo ? new Date(formData.prazo).toISOString() : null,
        prioridade: formData.prioridade as 'baixa' | 'media' | 'alta' | 'urgente',
        valor: formData.valor ? parseFloat(formData.valor) : null,
        observacoes: formData.observacoes || null,
        column_id: formData.column_id || null,
        column_order: 0,
        status: 'ativo',
        ficha_url: null,
        ficha_parsed_json: null
      }
      const { error } = await supabase.from('campaigns').insert(payload as any)

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Erro ao criar campanha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="orka-overlay" onClick={onClose}>
      <div className="orka-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Nova Campanha</h2>
          <button onClick={onClose} className="orka-btn-icon orka-btn-ghost" style={{ padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="orka-form-group">
            <label className="orka-label">Título da Campanha *</label>
            <input
              required
              autoFocus
              type="text"
              className="orka-input"
              placeholder="Ex: Comercial TV 30s - Dia das Mães"
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="orka-form-group">
              <label className="orka-label">Cliente</label>
              <select
                className="orka-input"
                value={formData.cliente_id}
                onChange={e => setFormData({ ...formData, cliente_id: e.target.value })}
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="orka-form-group">
              <label className="orka-label">Etapa (Coluna)</label>
              <select
                className="orka-input"
                value={formData.column_id}
                onChange={e => setFormData({ ...formData, column_id: e.target.value })}
              >
                {columns.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="orka-form-group">
              <label className="orka-label">Prioridade</label>
              <select
                className="orka-input"
                value={formData.prioridade}
                onChange={e => setFormData({ ...formData, prioridade: e.target.value })}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="orka-form-group">
              <label className="orka-label">Prazo</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--orka-text-3)' }} />
                <input
                  type="date"
                  className="orka-input"
                  style={{ paddingLeft: 32 }}
                  value={formData.prazo}
                  onChange={e => setFormData({ ...formData, prazo: e.target.value })}
                />
              </div>
            </div>

            <div className="orka-form-group">
              <label className="orka-label">Valor (R$)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--orka-text-3)' }} />
                <input
                  type="number"
                  step="0.01"
                  className="orka-input"
                  style={{ paddingLeft: 32 }}
                  placeholder="0.00"
                  value={formData.valor}
                  onChange={e => setFormData({ ...formData, valor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="orka-form-group">
            <label className="orka-label">Locutor Definido</label>
            <select
              className="orka-input"
              value={formData.locutor_id}
              onChange={e => setFormData({ ...formData, locutor_id: e.target.value })}
            >
              <option value="">Ainda não definido...</option>
              {locutores.map(l => (
                <option key={l.id} value={l.id}>{l.nome} ({l.especialidade})</option>
              ))}
            </select>
          </div>

          <div className="orka-form-group">
            <label className="orka-label">Observações</label>
            <textarea
              className="orka-input"
              rows={3}
              placeholder="Detalhes adicionais, formatos, links..."
              value={formData.observacoes}
              onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>

          <div className="orka-divider" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={onClose} className="orka-btn orka-btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="orka-btn orka-btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Criar Campanha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
