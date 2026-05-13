'use client'

import { cn, PRIORITY_LABELS, PRIORITY_DOT, formatDate, isOverdue } from '@/lib/utils'
import type { Campaign, Client, Locutor } from '@/types/database'
import { Calendar, Mic2, AlertCircle, DollarSign, CheckSquare, Paperclip, MessageSquare } from 'lucide-react'
import { useCampaignDetails } from '@/lib/hooks/useCampaignDetails'

interface KanbanCardProps {
  campaign: Campaign
  client?: Client
  locutor?: Locutor
  onClick?: () => void
  isDragging?: boolean
}

export default function KanbanCard({ campaign, client, locutor, onClick, isDragging }: KanbanCardProps) {
  const overdue = isOverdue(campaign.prazo)
  const { checklists, comments, attachments, labels } = useCampaignDetails(campaign.id)

  const completedChecklists = checklists.filter(c => c.is_completed).length
  const totalChecklists = checklists.length

  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <div
      className={cn(
        'kanban-card',
        `priority-${campaign.prioridade}`,
        isDragging && 'dragging'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      id={`card-${campaign.id}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Priority + Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <div
          className={cn('kanban-column-dot', PRIORITY_DOT[campaign.prioridade])}
          style={{ marginTop: 4, flexShrink: 0 }}
          title={`Prioridade: ${PRIORITY_LABELS[campaign.prioridade]}`}
        />
        <p className="kanban-card-title">{campaign.titulo}</p>
      </div>

      {/* Client */}
      {client && (
        <p className="kanban-card-client">
          {client.codigo && (
            <span style={{
              background: 'var(--orka-bg)',
              padding: '1px 6px',
              borderRadius: 4,
              marginRight: 6,
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--orka-primary)',
              letterSpacing: '0.05em'
            }}>
              {client.codigo}
            </span>
          )}
          {client.nome}
        </p>
      )}

      {/* Labels */}
      {labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {labels.map(l => (
            <span key={l.id} style={{ background: l.cor, width: 32, height: 6, borderRadius: 3 }} title={l.texto} />
          ))}
        </div>
      )}

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        <span className={cn('orka-badge', `orka-badge-${
          campaign.prioridade === 'urgente' ? 'danger' :
          campaign.prioridade === 'alta'    ? 'warning' :
          campaign.prioridade === 'media'   ? 'cyan' : 'neutral'
        }`)}>
          {PRIORITY_LABELS[campaign.prioridade]}
        </span>

        {locutor && (
          <span className="orka-badge orka-badge-primary" title="Locutor">
            <Mic2 size={9} />
            {locutor.nome.split(' ')[0]}
          </span>
        )}
      </div>

      {/* Indicators (Checklist, Attachments, Comments) */}
      {(totalChecklists > 0 || attachments.length > 0 || comments.length > 0) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, color: 'var(--orka-text-3)' }}>
          {totalChecklists > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: completedChecklists === totalChecklists ? 600 : 400, color: completedChecklists === totalChecklists ? 'var(--orka-success)' : 'inherit' }}>
              <CheckSquare size={12} /> {completedChecklists}/{totalChecklists}
            </div>
          )}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <Paperclip size={12} /> {attachments.length}
            </div>
          )}
          {comments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <MessageSquare size={12} /> {comments.length}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="kanban-card-footer">
        {/* Deadline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={11} style={{ color: overdue ? 'var(--orka-danger)' : 'var(--orka-text-3)' }} />
          <span style={{
            fontSize: 11,
            color: overdue ? 'var(--orka-danger)' : 'var(--orka-text-3)',
            fontWeight: overdue ? 600 : 400
          }}>
            {formatDate(campaign.prazo)}
          </span>
          {overdue && <AlertCircle size={10} style={{ color: 'var(--orka-danger)' }} />}
        </div>

        {/* Value */}
        {campaign.valor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <DollarSign size={11} style={{ color: 'var(--orka-text-3)' }} />
            <span style={{ fontSize: 11, color: 'var(--orka-text-3)' }}>
              {new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' }).format(campaign.valor)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
