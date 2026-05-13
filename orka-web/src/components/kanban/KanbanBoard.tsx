'use client'

import { useState, useCallback } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
  closestCorners
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import type { Campaign, KanbanColumn, Client, Locutor } from '@/types/database'
import KanbanCard from './KanbanCard'
import { cn } from '@/lib/utils'

// ─── Sortable Card Wrapper ─────────────────────────────────────────────────
function SortableCard({ campaign, client, locutor, onCardClick }: { campaign: Campaign; client?: Client; locutor?: Locutor; onCardClick: (c: Campaign) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: campaign.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard campaign={campaign} client={client} locutor={locutor} onClick={() => onCardClick(campaign)} isDragging={isDragging} />
    </div>
  )
}

// ─── Column ────────────────────────────────────────────────────────────────
function KanbanColumnComponent({
  column, campaigns, clients, locutores, onCardClick, onAddCard, onUpdateColumn, onDeleteColumn
}: {
  column: KanbanColumn
  campaigns: Campaign[]
  clients: Client[]
  locutores: Locutor[]
  onCardClick: (c: Campaign) => void
  onAddCard: (columnId: string) => void
  onUpdateColumn: (id: string, updates: Partial<KanbanColumn>) => void
  onDeleteColumn: (id: string) => void
}) {
  const cardIds = campaigns.map(c => c.id)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(column.nome)
  const [showMenu, setShowMenu] = useState(false)

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== column.nome) {
      onUpdateColumn(column.id, { nome: editName })
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (campaigns.length > 0) {
      alert('Não é possível excluir uma coluna que ainda possui campanhas.')
      return
    }
    if (confirm(`Tem certeza que deseja excluir a etapa "${column.nome}"?`)) {
      onDeleteColumn(column.id)
    }
  }

  return (
    <div className="kanban-column" id={`col-${column.id}`}>
      {/* Header */}
      <div className="kanban-column-header" style={{ position: 'relative' }}>
        <div className="kanban-column-dot" style={{ background: column.cor }} />
        {isEditing ? (
          <input 
            autoFocus
            className="orka-input" 
            style={{ flex: 1, padding: '2px 8px', fontSize: 13, height: 26 }}
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
          />
        ) : (
          <span className="kanban-column-title" onDoubleClick={() => setIsEditing(true)}>{column.nome}</span>
        )}
        <span className="kanban-column-count">{campaigns.length}</span>
        {column.limite_wip && campaigns.length >= column.limite_wip && (
          <span style={{ fontSize: 10, color: 'var(--orka-warning)', fontWeight: 600 }}>WIP</span>
        )}
        
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="orka-btn-icon orka-btn-ghost" 
            style={{ padding: 2, height: 24, width: 24 }}
          >
            <MoreVertical size={14} />
          </button>
          
          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowMenu(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 28, zIndex: 50,
                background: 'var(--orka-bg-2)', border: '1px solid var(--orka-border)',
                borderRadius: 'var(--radius-md)', padding: 4, width: 140,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}>
                <button 
                  className="orka-btn-ghost" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 12, justifyContent: 'flex-start', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                >
                  <Edit2 size={12} /> Renomear
                </button>
                <button 
                  className="orka-btn-ghost" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 12, color: 'var(--orka-error)', justifyContent: 'flex-start', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => { handleDelete(); setShowMenu(false); }}
                >
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="kanban-cards">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {campaigns.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 12px' }}>
              <p style={{ fontSize: 12, color: 'var(--orka-text-3)', textAlign: 'center' }}>
                Nenhuma campanha
              </p>
            </div>
          ) : (
            campaigns.map(campaign => (
              <SortableCard 
                key={campaign.id} 
                campaign={campaign} 
                client={clients.find(c => c.id === campaign.cliente_id)}
                locutor={locutores.find(l => l.id === campaign.locutor_id)}
                onCardClick={onCardClick} 
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Add Button */}
      <button
        className="kanban-add-btn"
        onClick={() => onAddCard(column.id)}
        id={`add-card-${column.id}`}
      >
        <Plus size={13} />
        Adicionar campanha
      </button>
    </div>
  )
}

// ─── Main Board ────────────────────────────────────────────────────────────
interface KanbanBoardProps {
  columns: KanbanColumn[]
  campaigns: Campaign[]
  clients: Client[]
  locutores: Locutor[]
  onCardClick: (campaign: Campaign) => void
  onAddCard: (columnId: string) => void
  onUpdateCampaignColumn: (campaignId: string, columnId: string, order: number) => void
  onAddColumn: (nome: string, cor: string) => void
  onUpdateColumn: (id: string, updates: Partial<KanbanColumn>) => void
  onDeleteColumn: (id: string) => void
}

export default function KanbanBoard({ 
  columns, campaigns, clients, locutores, 
  onCardClick, onAddCard, onUpdateCampaignColumn,
  onAddColumn, onUpdateColumn, onDeleteColumn 
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<Campaign | null>(null)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const getCampaignsForColumn = useCallback((columnId: string) =>
    campaigns.filter(c => c.column_id === columnId).sort((a, b) => a.column_order - b.column_order),
    [campaigns]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const card = campaigns.find(c => c.id === event.active.id)
    setActiveCard(card || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Determine target column
    const targetColumnId = columns.find(col => col.id === overId)?.id
      ?? campaigns.find(c => c.id === overId)?.column_id

    if (!targetColumnId) return

    // Find the campaign and its new order (simplistic approach: append to bottom)
    const targetCampaigns = getCampaignsForColumn(targetColumnId)
    const newOrder = targetCampaigns.length > 0 ? targetCampaigns[targetCampaigns.length - 1].column_order + 1 : 1

    onUpdateCampaignColumn(activeId, targetColumnId, newOrder)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board" id="kanban-board">
        {columns.map(column => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            campaigns={getCampaignsForColumn(column.id)}
            clients={clients}
            locutores={locutores}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
            onUpdateColumn={onUpdateColumn}
            onDeleteColumn={onDeleteColumn}
          />
        ))}

        {/* Add Column Section */}
        <div className="kanban-column" style={{ background: 'transparent', border: '1px dashed var(--orka-border)', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {isAddingColumn ? (
            <div style={{ padding: 12, background: 'var(--orka-bg-2)', borderRadius: 'var(--radius-lg)' }}>
              <input 
                autoFocus
                className="orka-input" 
                placeholder="Nome da Etapa..."
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newColumnName.trim()) {
                    onAddColumn(newColumnName.trim(), '#94a3b8')
                    setNewColumnName('')
                    setIsAddingColumn(false)
                  }
                  if (e.key === 'Escape') setIsAddingColumn(false)
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button 
                  className="orka-btn orka-btn-primary orka-btn-sm" 
                  style={{ flex: 1 }}
                  onClick={() => {
                    if (newColumnName.trim()) {
                      onAddColumn(newColumnName.trim(), '#94a3b8')
                      setNewColumnName('')
                      setIsAddingColumn(false)
                    }
                  }}
                >
                  Salvar
                </button>
                <button 
                  className="orka-btn orka-btn-ghost orka-btn-sm" 
                  onClick={() => setIsAddingColumn(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="kanban-add-btn" 
              style={{ marginTop: 0, border: 'none', background: 'transparent', color: 'var(--orka-text-3)', fontSize: 13, height: '100%' }}
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus size={14} style={{ marginRight: 6 }} />
              Adicionar Etapa
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeCard && (
          <div style={{ transform: 'rotate(2deg)', opacity: 0.95 }}>
            <KanbanCard 
              campaign={activeCard} 
              client={clients.find(c => c.id === activeCard.cliente_id)}
              locutor={locutores.find(l => l.id === activeCard.locutor_id)}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
