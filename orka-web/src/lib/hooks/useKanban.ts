import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Campaign, KanbanColumn, Client, Locutor } from '@/types/database'

export function useKanbanData() {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [locutores, setLocutores] = useState<Locutor[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          { data: cols },
          { data: camps },
          { data: clis },
          { data: locs }
        ] = await Promise.all([
          supabase.from('kanban_columns').select('*').order('ordem'),
          supabase.from('campaigns').select('*').order('column_order'),
          supabase.from('clients').select('*'),
          supabase.from('locutores').select('*')
        ])

        if (cols) setColumns(cols)
        if (camps) setCampaigns(camps)
        if (clis) setClients(clis)
        if (locs) setLocutores(locs)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const campaignsSub = supabase
      .channel('public:campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, payload => {
        if (payload.eventType === 'INSERT') {
          setCampaigns(prev => [...prev, payload.new as Campaign])
        } else if (payload.eventType === 'UPDATE') {
          setCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new as Campaign : c))
        } else if (payload.eventType === 'DELETE') {
          setCampaigns(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    const columnsSub = supabase
      .channel('public:kanban_columns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kanban_columns' }, payload => {
        if (payload.eventType === 'INSERT') {
          setColumns(prev => [...prev, payload.new as KanbanColumn].sort((a, b) => a.ordem - b.ordem))
        } else if (payload.eventType === 'UPDATE') {
          setColumns(prev => prev.map(c => c.id === payload.new.id ? payload.new as KanbanColumn : c).sort((a, b) => a.ordem - b.ordem))
        } else if (payload.eventType === 'DELETE') {
          setColumns(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(campaignsSub)
      supabase.removeChannel(columnsSub)
    }
  }, [supabase])

  const updateCampaignColumn = async (campaignId: string, columnId: string, order: number) => {
    // Optimistic update
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, column_id: columnId, column_order: order } : c
    ))

    const { error } = await supabase
      .from('campaigns')
      .update({ column_id: columnId, column_order: order })
      .eq('id', campaignId)

    if (error) {
      console.error('Error updating campaign:', error)
      // Revert optimistic update ideally, but skipping for MVP
    }
  }
  const addColumn = async (nome: string, cor: string) => {
    const newOrder = columns.length > 0 ? columns[columns.length - 1].ordem + 1 : 1
    const { error } = await supabase.from('kanban_columns').insert({ nome, cor, ordem: newOrder } as any)
    if (error) console.error('Error adding column:', error)
  }

  const updateColumn = async (id: string, updates: Partial<KanbanColumn>) => {
    const { error } = await supabase.from('kanban_columns').update(updates).eq('id', id)
    if (error) console.error('Error updating column:', error)
  }

  const deleteColumn = async (id: string) => {
    const { error } = await supabase.from('kanban_columns').delete().eq('id', id)
    if (error) console.error('Error deleting column:', error)
  }

  return { columns, campaigns, clients, locutores, loading, updateCampaignColumn, addColumn, updateColumn, deleteColumn }
}
