'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import CardDetailModal from '@/components/kanban/CardDetailModal'
import CreateCardModal from '@/components/kanban/CreateCardModal'
import { useKanbanData } from '@/lib/hooks/useKanban'
import type { Campaign } from '@/types/database'
import { Plus, Filter, SlidersHorizontal, Loader2 } from 'lucide-react'

export default function KanbanPage() {
  const { 
    columns, campaigns, clients, locutores, loading, 
    updateCampaignColumn, addColumn, updateColumn, deleteColumn 
  } = useKanbanData()
  const [selectedCard, setSelectedCard] = useState<Campaign | null>(null)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [initialColumnId, setInitialColumnId] = useState<string | undefined>()
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const handleAddCard = (columnId: string) => {
    setInitialColumnId(columnId)
    setIsCreatingCard(true)
  }

  const handleNewCampaignBtn = () => {
    setInitialColumnId(undefined)
    setIsCreatingCard(true)
  }

  const priorities = [
    { value: 'all', label: 'Todas' },
    { value: 'urgente', label: 'Urgente' },
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Média' },
    { value: 'baixa', label: 'Baixa' },
  ]

  return (
    <>
      <Header
        title="Produção"
        subtitle="Gestão de campanhas em andamento"
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Priority filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {priorities.map(p => (
                <button
                  key={p.value}
                  id={`filter-${p.value}`}
                  onClick={() => setFilterPriority(p.value)}
                  className="orka-btn orka-btn-sm"
                  style={{
                    padding: '4px 10px',
                    fontSize: 11.5,
                    fontWeight: 500,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--orka-border)',
                    background: filterPriority === p.value ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: filterPriority === p.value ? 'var(--orka-primary)' : 'var(--orka-text-3)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button className="orka-btn orka-btn-ghost orka-btn-sm" id="kanban-filter-btn">
              <SlidersHorizontal size={14} />
              Filtrar
            </button>

            <button className="orka-btn orka-btn-primary orka-btn-sm" onClick={handleNewCampaignBtn} id="kanban-new-card-btn">
              <Plus size={14} />
              Nova Campanha
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="orka-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--orka-text-3)' }}>
            <Loader2 className="animate-spin" size={24} />
            <span style={{ fontSize: 13 }}>Carregando dados do Supabase...</span>
          </div>
        </div>
      ) : (
        <div className="orka-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
          <KanbanBoard
            columns={columns}
            campaigns={campaigns}
            clients={clients}
            locutores={locutores}
            onCardClick={setSelectedCard}
            onAddCard={handleAddCard}
            onUpdateCampaignColumn={updateCampaignColumn}
            onAddColumn={addColumn}
            onUpdateColumn={updateColumn}
            onDeleteColumn={deleteColumn}
          />
        </div>
      )}

      {selectedCard && (
        <CardDetailModal
          campaign={selectedCard}
          client={clients.find(c => c.id === selectedCard.cliente_id)}
          locutor={locutores.find(l => l.id === selectedCard.locutor_id)}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {isCreatingCard && (
        <CreateCardModal
          columns={columns}
          clients={clients}
          locutores={locutores}
          initialColumnId={initialColumnId}
          onClose={() => setIsCreatingCard(false)}
          onSuccess={() => setIsCreatingCard(false)}
        />
      )}
    </>
  )
}
