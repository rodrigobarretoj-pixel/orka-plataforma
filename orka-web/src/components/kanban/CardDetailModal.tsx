'use client'

import { useState } from 'react'
import { X, Calendar, Building2, Mic2, DollarSign, FileText, AlertCircle, Clock, CheckSquare, MessageSquare, Paperclip, Trash2, Send, Plus } from 'lucide-react'
import type { Campaign, Client, Locutor } from '@/types/database'
import { PRIORITY_LABELS, PRIORITY_COLORS, PRIORITY_DOT, formatDate, formatRelative, formatCurrency, isOverdue, cn } from '@/lib/utils'
import { useCampaignDetails } from '@/lib/hooks/useCampaignDetails'
import { createClient } from '@/lib/supabase/client'

interface CardDetailModalProps {
  campaign: Campaign
  client?: Client
  locutor?: Locutor
  onClose: () => void
  onDeleteCampaign?: (id: string) => void // Will implement deleting campaign later, via useKanban or passed down
}

export default function CardDetailModal({ campaign, client, locutor, onClose, onDeleteCampaign }: CardDetailModalProps) {
  const { 
    checklists, comments, labels, attachments, loading,
    addChecklistItem, toggleChecklistItem, deleteChecklistItem,
    addComment, deleteComment, addLabel, deleteLabel
  } = useCampaignDetails(campaign.id)

  const [newChecklist, setNewChecklist] = useState('')
  const [newComment, setNewComment] = useState('')
  
  const overdue = isOverdue(campaign.prazo)
  const checklistProgress = checklists.length > 0 ? Math.round((checklists.filter(c => c.is_completed).length / checklists.length) * 100) : 0

  const handleDeleteCampaign = () => {
    if (confirm('Tem certeza que deseja excluir esta campanha permanentemente? Todos os comentários e checklists serão apagados.')) {
      if (onDeleteCampaign) {
        onDeleteCampaign(campaign.id)
      } else {
        // Fallback if not passed
        createClient().from('campaigns').delete().eq('id', campaign.id).then(() => onClose())
      }
    }
  }

  return (
    <div className="orka-overlay" onClick={onClose} id="card-detail-overlay">
      <div
        className="orka-modal"
        style={{ width: '90%', maxWidth: 900, minHeight: 600, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
        id={`card-detail-${campaign.id}`}
      >
        {/* Header - Fixed */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '24px 24px 20px', borderBottom: '1px solid var(--orka-border)' }}>
          <div
            className="kanban-column-dot"
            style={{ background: PRIORITY_DOT[campaign.prioridade].replace('bg-', ''), marginTop: 6, width: 12, height: 12, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--orka-text)', lineHeight: 1.3 }}>
              {campaign.titulo}
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span className={cn('orka-badge', PRIORITY_COLORS[campaign.prioridade])} style={{ fontSize: 11, padding: '2px 8px' }}>
                {PRIORITY_LABELS[campaign.prioridade]} Prioridade
              </span>
              {labels.map(l => (
                <span key={l.id} className="orka-badge" style={{ background: `${l.cor}20`, color: l.cor, border: `1px solid ${l.cor}40`, fontSize: 11, padding: '2px 8px' }}>
                  {l.texto}
                  <button onClick={() => deleteLabel(l.id)} style={{ marginLeft: 6, background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={10} /></button>
                </span>
              ))}
              <button 
                className="orka-badge" 
                style={{ background: 'transparent', border: '1px dashed var(--orka-border)', color: 'var(--orka-text-3)', cursor: 'pointer' }}
                onClick={() => {
                  const text = prompt('Nome da etiqueta:')
                  if (text) addLabel(text, '#3b82f6')
                }}
              >
                <Plus size={12} style={{ marginRight: 4 }} /> Etiqueta
              </button>
            </div>
          </div>
          <button onClick={onClose} className="orka-btn-icon orka-btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Content Layout - Scrollable Main + Fixed Sidebar */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Main Content Area (Checklists, Comments) */}
          <div style={{ flex: 2, padding: 24, overflowY: 'auto', borderRight: '1px solid var(--orka-border)' }}>
            
            {/* Checklist Section */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckSquare size={16} color="var(--orka-text-2)" /> Checklist da Produção
                </h3>
                {checklists.length > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--orka-text-3)', fontWeight: 500 }}>
                    {checklistProgress}% ({checklists.filter(c => c.is_completed).length}/{checklists.length})
                  </span>
                )}
              </div>
              
              {/* Progress Bar */}
              {checklists.length > 0 && (
                <div style={{ width: '100%', height: 6, background: 'var(--orka-bg)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
                  <div style={{ width: `${checklistProgress}%`, height: '100%', background: checklistProgress === 100 ? 'var(--orka-success)' : 'var(--orka-primary)', transition: 'all 0.3s ease' }} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {checklists.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 12px', background: 'var(--orka-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--orka-border)' }}>
                    <input 
                      type="checkbox" 
                      checked={item.is_completed}
                      onChange={(e) => toggleChecklistItem(item.id, e.target.checked)}
                      style={{ marginTop: 4, cursor: 'pointer' }}
                    />
                    <span style={{ flex: 1, fontSize: 14, color: item.is_completed ? 'var(--orka-text-3)' : 'var(--orka-text)', textDecoration: item.is_completed ? 'line-through' : 'none' }}>
                      {item.texto}
                    </span>
                    <button onClick={() => deleteChecklistItem(item.id)} className="orka-btn-icon orka-btn-ghost" style={{ padding: 2, color: 'var(--orka-text-3)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                {/* Add new checklist item */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <input 
                    type="text" 
                    className="orka-input" 
                    placeholder="Adicionar um item..." 
                    value={newChecklist}
                    onChange={e => setNewChecklist(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newChecklist.trim()) {
                        addChecklistItem(newChecklist.trim())
                        setNewChecklist('')
                      }
                    }}
                  />
                  <button 
                    className="orka-btn orka-btn-secondary"
                    onClick={() => {
                      if (newChecklist.trim()) {
                        addChecklistItem(newChecklist.trim())
                        setNewChecklist('')
                      }
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="orka-divider" style={{ margin: '32px 0' }} />

            {/* Comments / Activity Section */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <MessageSquare size={16} color="var(--orka-text-2)" /> Comentários e Histórico
              </h3>
              
              {/* Add Comment */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--orka-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  VC
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea 
                    className="orka-input" 
                    placeholder="Escreva um comentário, anotação ou atualização..." 
                    rows={2}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="orka-btn orka-btn-primary orka-btn-sm"
                      disabled={!newComment.trim()}
                      onClick={() => {
                        if (newComment.trim()) {
                          addComment(newComment.trim(), 'Você')
                          setNewComment('')
                        }
                      }}
                    >
                      <Send size={14} /> Enviar
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--orka-bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--orka-text-2)', border: '1px solid var(--orka-border)', flexShrink: 0 }}>
                      {c.autor_nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--orka-text)' }}>{c.autor_nome}</span>
                        <span style={{ fontSize: 11, color: 'var(--orka-text-3)' }}>{formatRelative(c.created_at)}</span>
                      </div>
                      <div style={{ background: 'var(--orka-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--orka-border)', fontSize: 13.5, color: 'var(--orka-text-2)', lineHeight: 1.5 }}>
                        {c.texto}
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--orka-text-3)', padding: 20 }}>Nenhum comentário ainda.</p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area (Details, Attachments, Actions) */}
          <div style={{ flex: 1, padding: 24, background: 'var(--orka-bg-2)', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Properties */}
              <div>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: 'var(--orka-text-3)', letterSpacing: 0.5, marginBottom: 12 }}>Propriedades</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p className="orka-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Building2 size={12} /> Cliente</p>
                    <p style={{ fontSize: 14, color: 'var(--orka-text)', fontWeight: 500 }}>{client?.nome ?? '—'}</p>
                  </div>
                  <div>
                    <p className="orka-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mic2 size={12} /> Locutor</p>
                    <p style={{ fontSize: 14, color: 'var(--orka-text)', fontWeight: 500 }}>{locutor?.nome ?? 'Não definido'}</p>
                  </div>
                  <div>
                    <p className="orka-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={12} /> Prazo</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: overdue ? 'var(--orka-danger)' : 'var(--orka-text)' }}>
                      {formatDate(campaign.prazo)} {overdue && <AlertCircle size={12} style={{ display: 'inline', marginLeft: 6 }} />}
                    </p>
                  </div>
                  <div>
                    <p className="orka-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={12} /> Valor</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--orka-success)' }}>{formatCurrency(campaign.valor)}</p>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: 'var(--orka-text-3)', letterSpacing: 0.5 }}>Anexos</h4>
                  <button className="orka-btn-icon orka-btn-ghost" style={{ padding: 2 }}><Plus size={14} /></button>
                </div>
                
                {attachments.length === 0 ? (
                  <div style={{ border: '1px dashed var(--orka-border)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center' }}>
                    <Paperclip size={16} color="var(--orka-text-3)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 12, color: 'var(--orka-text-3)' }}>Nenhum anexo</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {attachments.map(att => (
                      <a key={att.id} href={att.file_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: 'var(--orka-bg)', border: '1px solid var(--orka-border)', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
                        <div style={{ width: 24, height: 24, background: 'var(--orka-primary-light)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orka-primary)' }}>
                          <FileText size={12} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--orka-text)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.file_name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações */}
              {campaign.observacoes && (
                <div>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: 'var(--orka-text-3)', letterSpacing: 0.5, marginBottom: 12 }}>Observações Iniciais</h4>
                  <p style={{ fontSize: 13, color: 'var(--orka-text-2)', lineHeight: 1.5, background: 'var(--orka-bg)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--orka-border)' }}>
                    {campaign.observacoes}
                  </p>
                </div>
              )}

              {/* Danger Zone */}
              <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--orka-border)' }}>
                <button 
                  onClick={handleDeleteCampaign}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--orka-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Trash2 size={16} /> Excluir Campanha
                </button>
                <p style={{ fontSize: 11, color: 'var(--orka-text-3)', textAlign: 'center', marginTop: 8 }}>
                  Ação irreversível
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
