import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CampaignChecklist, CampaignComment, CampaignLabel, CampaignAttachment } from '@/types/database'

export function useCampaignDetails(campaignId: string) {
  const [checklists, setChecklists] = useState<CampaignChecklist[]>([])
  const [comments, setComments] = useState<CampaignComment[]>([])
  const [labels, setLabels] = useState<CampaignLabel[]>([])
  const [attachments, setAttachments] = useState<CampaignAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!campaignId) return

    async function fetchData() {
      try {
        const [
          { data: chks },
          { data: comms },
          { data: labs },
          { data: atts }
        ] = await Promise.all([
          supabase.from('campaign_checklists').select('*').eq('campaign_id', campaignId).order('ordem'),
          supabase.from('campaign_comments').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }),
          supabase.from('campaign_labels').select('*').eq('campaign_id', campaignId),
          supabase.from('campaign_attachments').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false })
        ])

        if (chks) setChecklists(chks)
        if (comms) setComments(comms)
        if (labs) setLabels(labs)
        if (atts) setAttachments(atts)
      } catch (error) {
        console.error('Error fetching campaign details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Realtime subscriptions for this specific campaign
    const channel = supabase
      .channel(`campaign_details_${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_checklists', filter: `campaign_id=eq.${campaignId}` }, () => {
        supabase.from('campaign_checklists').select('*').eq('campaign_id', campaignId).order('ordem').then(({ data }) => data && setChecklists(data))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_comments', filter: `campaign_id=eq.${campaignId}` }, () => {
        supabase.from('campaign_comments').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }).then(({ data }) => data && setComments(data))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_labels', filter: `campaign_id=eq.${campaignId}` }, () => {
        supabase.from('campaign_labels').select('*').eq('campaign_id', campaignId).then(({ data }) => data && setLabels(data))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_attachments', filter: `campaign_id=eq.${campaignId}` }, () => {
        supabase.from('campaign_attachments').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }).then(({ data }) => data && setAttachments(data))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId, supabase])

  // --- CRUD Functions ---

  // Checklists
  const addChecklistItem = async (texto: string) => {
    const newOrder = checklists.length > 0 ? checklists[checklists.length - 1].ordem + 1 : 1
    const { error } = await supabase.from('campaign_checklists').insert({ campaign_id: campaignId, texto, is_completed: false, ordem: newOrder } as any)
    if (error) console.error('Error adding checklist item:', error)
  }

  const toggleChecklistItem = async (id: string, is_completed: boolean) => {
    const { error } = await supabase.from('campaign_checklists').update({ is_completed } as any).eq('id', id)
    if (error) console.error('Error toggling checklist item:', error)
  }

  const deleteChecklistItem = async (id: string) => {
    const { error } = await supabase.from('campaign_checklists').delete().eq('id', id)
    if (error) console.error('Error deleting checklist item:', error)
  }

  // Comments
  const addComment = async (texto: string, autor_nome: string = 'Você') => {
    const { error } = await supabase.from('campaign_comments').insert({ campaign_id: campaignId, texto, autor_nome } as any)
    if (error) console.error('Error adding comment:', error)
  }

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('campaign_comments').delete().eq('id', id)
    if (error) console.error('Error deleting comment:', error)
  }

  // Labels
  const addLabel = async (texto: string, cor: string) => {
    const { error } = await supabase.from('campaign_labels').insert({ campaign_id: campaignId, texto, cor } as any)
    if (error) console.error('Error adding label:', error)
  }

  const deleteLabel = async (id: string) => {
    const { error } = await supabase.from('campaign_labels').delete().eq('id', id)
    if (error) console.error('Error deleting label:', error)
  }

  return { 
    checklists, comments, labels, attachments, loading,
    addChecklistItem, toggleChecklistItem, deleteChecklistItem,
    addComment, deleteComment,
    addLabel, deleteLabel
  }
}
