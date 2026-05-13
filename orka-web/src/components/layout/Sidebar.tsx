'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Inbox, Mic2, BarChart3, Settings,
  Upload, Users, Building2, Bell, LogOut, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard', badge: null },
  { href: '/kanban',    icon: Inbox,      label: 'Produção',   badge: '8' },
  { href: '/fichas',    icon: Upload,     label: 'Fichas',     badge: null },
  { href: '/locucao',  icon: Mic2,       label: 'Locução',    badge: '3' },
  { href: '/clientes',  icon: Building2,  label: 'Clientes',   badge: null },
  { href: '/equipe',    icon: Users,      label: 'Equipe',     badge: null },
  { href: '/bi',        icon: BarChart3,  label: 'BI & Métricas', badge: null },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="orka-sidebar">
      {/* Logo */}
      <div className="orka-sidebar-logo">
        <div className="logo-icon">
          <Zap size={16} />
        </div>
        <span className="logo-text">ORKA</span>
        <span className="logo-version">v1.0</span>
      </div>

      {/* Navigation */}
      <div className="orka-sidebar-section">
        <p className="orka-sidebar-label">Menu Principal</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('orka-nav-item', isActive && 'active')}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          )
        })}

        <div className="orka-divider" style={{ margin: '16px 0' }} />

        <p className="orka-sidebar-label">Sistema</p>
        <Link href="/configuracoes" className={cn('orka-nav-item', pathname === '/configuracoes' && 'active')}>
          <Settings className="nav-icon" />
          <span>Configurações</span>
        </Link>
      </div>

      {/* Footer / User */}
      <div className="orka-sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="orka-avatar">
            OR
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--orka-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Admin ORKA
            </div>
            <div style={{ fontSize: 11, color: 'var(--orka-text-3)' }}>Administrador</div>
          </div>
          <button className="orka-btn-icon orka-btn-ghost" style={{ padding: 6, cursor: 'pointer', background: 'transparent', border: 'none' }}>
            <LogOut size={14} style={{ color: 'var(--orka-text-3)' }} />
          </button>
        </div>
      </div>
    </aside>
  )
}
