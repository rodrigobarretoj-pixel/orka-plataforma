'use client'

import Header from '@/components/layout/Header'
import { MOCK_CAMPAIGNS, MOCK_COLUMNS, MOCK_CLIENTS } from '@/lib/mock-data'
import { formatCurrency, formatDate, isOverdue, PRIORITY_LABELS, PRIORITY_DOT, cn } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  Inbox, DollarSign, AlertCircle, CheckCircle2,
  TrendingUp, Mic2, Clock, ArrowRight
} from 'lucide-react'

// Stats calculation
const total = MOCK_CAMPAIGNS.length
const urgente = MOCK_CAMPAIGNS.filter(c => c.prioridade === 'urgente').length
const entregues = MOCK_CAMPAIGNS.filter(c => c.column_id === 'col-5').length
const valorTotal = MOCK_CAMPAIGNS.reduce((acc, c) => acc + (c.valor ?? 0), 0)
const overdues = MOCK_CAMPAIGNS.filter(c => isOverdue(c.prazo) && c.column_id !== 'col-5')

// Chart data
const barData = MOCK_COLUMNS.map(col => ({
  name: col.nome,
  campanhas: MOCK_CAMPAIGNS.filter(c => c.column_id === col.id).length,
  fill: col.cor,
}))

const pieData = [
  { name: 'Urgente', value: MOCK_CAMPAIGNS.filter(c => c.prioridade === 'urgente').length, color: '#ef4444' },
  { name: 'Alta',    value: MOCK_CAMPAIGNS.filter(c => c.prioridade === 'alta').length,    color: '#f59e0b' },
  { name: 'Média',   value: MOCK_CAMPAIGNS.filter(c => c.prioridade === 'media').length,   color: '#06b6d4' },
  { name: 'Baixa',   value: MOCK_CAMPAIGNS.filter(c => c.prioridade === 'baixa').length,   color: '#6b7280' },
].filter(d => d.value > 0)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--orka-surface)',
        border: '1px solid var(--orka-border)',
        borderRadius: 8,
        padding: '8px 14px',
        fontSize: 12,
        color: 'var(--orka-text)',
      }}>
        <p style={{ fontWeight: 600 }}>{label}</p>
        <p style={{ color: 'var(--orka-primary)' }}>{payload[0].value} campanha(s)</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const recentCampaigns = [...MOCK_CAMPAIGNS]
    .sort((a, b) => new Date(b.prazo ?? '').getTime() - new Date(a.prazo ?? '').getTime())
    .slice(0, 5)

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`Visão geral · ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      />

      <div className="orka-content">

        {/* ── STATS ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>

          <div className="stat-card primary" id="stat-total">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <Inbox size={18} style={{ color: 'var(--orka-primary)' }} />
            </div>
            <div className="stat-value" style={{ color: 'var(--orka-text)' }}>{total}</div>
            <div className="stat-label">Campanhas Ativas</div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--orka-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={10} style={{ color: 'var(--orka-success)' }} />
              <span style={{ color: 'var(--orka-success)' }}>+12%</span> vs mês anterior
            </div>
          </div>

          <div className="stat-card danger" id="stat-urgente">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertCircle size={18} style={{ color: 'var(--orka-danger)' }} />
            </div>
            <div className="stat-value" style={{ color: urgente > 0 ? 'var(--orka-danger)' : 'var(--orka-text)' }}>
              {urgente}
            </div>
            <div className="stat-label">Urgentes</div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--orka-text-3)' }}>
              {overdues.length} com prazo vencido
            </div>
          </div>

          <div className="stat-card success" id="stat-entregues">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--orka-success)' }} />
            </div>
            <div className="stat-value" style={{ color: 'var(--orka-success)' }}>{entregues}</div>
            <div className="stat-label">Entregues este mês</div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--orka-text-3)' }}>
              {Math.round((entregues / total) * 100)}% do total
            </div>
          </div>

          <div className="stat-card warning" id="stat-valor">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <DollarSign size={18} style={{ color: 'var(--orka-warning)' }} />
            </div>
            <div className="stat-value" style={{ color: 'var(--orka-warning)', fontSize: 22 }}>
              {new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' }).format(valorTotal)}
            </div>
            <div className="stat-label">Volume em produção</div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--orka-text-3)' }}>
              Média {formatCurrency(valorTotal / total)} / campanha
            </div>
          </div>
        </div>

        {/* ── CHARTS + RECENT ───────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 24 }}>

          {/* Bar Chart */}
          <div className="orka-card" id="chart-pipeline">
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--orka-text)' }}>Pipeline de Produção</h3>
              <p style={{ fontSize: 12, color: 'var(--orka-text-3)' }}>Campanhas por etapa do workflow</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: 'var(--orka-text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--orka-text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="campanhas" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="orka-card" id="chart-priority">
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--orka-text)' }}>Prioridades</h3>
              <p style={{ fontSize: 12, color: 'var(--orka-text-3)' }}>Distribuição atual</p>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" strokeWidth={2} stroke="var(--orka-bg)">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v} campanha(s)`, name]} contentStyle={{ background: 'var(--orka-surface)', border: '1px solid var(--orka-border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--orka-text-2)', flex: 1 }}>{d.name}</span>
                  <span style={{ color: 'var(--orka-text)', fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RECENT CAMPAIGNS ──────────────────────────────── */}
        <div className="orka-card" id="recent-campaigns">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--orka-text)' }}>Campanhas Recentes</h3>
              <p style={{ fontSize: 12, color: 'var(--orka-text-3)' }}>Últimas atualizações de produção</p>
            </div>
            <a href="/kanban" className="orka-btn orka-btn-ghost orka-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              Ver todas <ArrowRight size={13} />
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentCampaigns.map((c, i) => {
              const overdue = isOverdue(c.prazo)
              const col = MOCK_COLUMNS.find(col => col.id === c.column_id)
              return (
                <div
                  key={c.id}
                  id={`recent-${c.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 0',
                    borderBottom: i < recentCampaigns.length - 1 ? '1px solid var(--orka-border)' : 'none',
                  }}
                >
                  <div
                    style={{ width: 10, height: 10, borderRadius: '50%', background: col?.cor, flexShrink: 0 }}
                    title={col?.nome}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--orka-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.titulo}
                    </p>
                    <p style={{ fontSize: 11.5, color: 'var(--orka-text-3)' }}>
                      {col?.nome}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: overdue ? 'var(--orka-danger)' : 'var(--orka-text-3)', fontWeight: overdue ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    {formatDate(c.prazo)}
                  </span>
                  <span className={cn('orka-badge', `orka-badge-${
                    c.prioridade === 'urgente' ? 'danger' :
                    c.prioridade === 'alta'    ? 'warning' :
                    c.prioridade === 'media'   ? 'cyan' : 'neutral'
                  }`)}>
                    {PRIORITY_LABELS[c.prioridade]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </>
  )
}
