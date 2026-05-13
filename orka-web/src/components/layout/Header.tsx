'use client'

import { Bell, Search, Plus } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="orka-header">
      {/* Title area */}
      <div style={{ flex: 1 }}>
        <h1 className="orka-header-title">{title}</h1>
        {subtitle && <p className="orka-header-subtitle">{subtitle}</p>}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{
          position: 'absolute', left: 10,
          color: 'var(--orka-text-3)', pointerEvents: 'none'
        }} />
        <input
          type="text"
          placeholder="Buscar..."
          className="orka-input"
          style={{
            width: 220,
            paddingLeft: 32,
            height: 34,
            fontSize: 13,
          }}
          id="header-search"
        />
      </div>

      {/* Notifications */}
      <button
        className="orka-btn-ghost orka-btn-icon"
        style={{ border: '1px solid var(--orka-border)', borderRadius: 'var(--radius-md)', padding: 7, cursor: 'pointer', background: 'transparent', position: 'relative' }}
        id="header-notifications"
        aria-label="Notificações"
      >
        <Bell size={16} style={{ color: 'var(--orka-text-2)' }} />
        <span style={{
          position: 'absolute', top: 4, right: 4,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--orka-primary)',
          border: '1px solid var(--orka-bg-2)'
        }} />
      </button>

      {/* Custom actions */}
      {actions && actions}
    </header>
  )
}
