// types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          nome: string
          codigo: string | null
          contato: string | null
          email: string | null
          ativo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          titulo: string
          cliente_id: string | null
          status: string
          locutor_id: string | null
          prazo: string | null
          prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
          ficha_url: string | null
          ficha_parsed_json: Json | null
          valor: number | null
          observacoes: string | null
          column_id: string | null
          column_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }
      kanban_columns: {
        Row: {
          id: string
          nome: string
          ordem: number
          cor: string
          limite_wip: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['kanban_columns']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kanban_columns']['Insert']>
      }
      locutores: {
        Row: {
          id: string
          nome: string
          email: string | null
          especialidade: string | null
          taxa_hora: number | null
          ativo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locutores']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locutores']['Insert']>
      }
      locucoes: {
        Row: {
          id: string
          campaign_id: string
          script_texto: string | null
          locutor_id: string | null
          status: 'aguardando' | 'gravando' | 'revisao' | 'aprovado'
          audio_url: string | null
          prazo: string | null
          entregue_em: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locucoes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locucoes']['Insert']>
      }
      ficha_jobs: {
        Row: {
          id: string
          campaign_id: string | null
          arquivo_url: string
          status: 'pending' | 'processing' | 'done' | 'error'
          resultado_json: Json | null
          erro: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ficha_jobs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ficha_jobs']['Insert']>
      }
      campaign_checklists: {
        Row: {
          id: string
          campaign_id: string
          texto: string
          is_completed: boolean
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          texto: string
          is_completed?: boolean
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          texto?: string
          is_completed?: boolean
          ordem?: number
          created_at?: string
        }
      }
      campaign_comments: {
        Row: {
          id: string
          campaign_id: string
          texto: string
          autor_nome: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          texto: string
          autor_nome?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          texto?: string
          autor_nome?: string
          created_at?: string
        }
      }
      campaign_labels: {
        Row: {
          id: string
          campaign_id: string
          texto: string
          cor: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          texto: string
          cor?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          texto?: string
          cor?: string
          created_at?: string
        }
      }
      campaign_attachments: {
        Row: {
          id: string
          campaign_id: string
          file_url: string
          file_name: string
          file_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          file_url: string
          file_name: string
          file_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          file_url?: string
          file_name?: string
          file_type?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Tipos derivados para uso no frontend
export type Client = Database['public']['Tables']['clients']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type KanbanColumn = Database['public']['Tables']['kanban_columns']['Row']
export type Locutor = Database['public']['Tables']['locutores']['Row']
export type Locucao = Database['public']['Tables']['locucoes']['Row']
export type FichaJob = Database['public']['Tables']['ficha_jobs']['Row']
export type CampaignChecklist = Database['public']['Tables']['campaign_checklists']['Row']
export type CampaignComment = Database['public']['Tables']['campaign_comments']['Row']
export type CampaignLabel = Database['public']['Tables']['campaign_labels']['Row']
export type CampaignAttachment = Database['public']['Tables']['campaign_attachments']['Row']

export type Priority = 'baixa' | 'media' | 'alta' | 'urgente'
export type LocucaoStatus = 'aguardando' | 'gravando' | 'revisao' | 'aprovado'
export type FichaJobStatus = 'pending' | 'processing' | 'done' | 'error'
