import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="orka-layout">
      <Sidebar />
      <main className="orka-main">
        {children}
      </main>
    </div>
  )
}
