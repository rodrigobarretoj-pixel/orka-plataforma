import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ORKA — Plataforma de Produção Comercial',
  description: 'Gestão operacional para produção comercial, TV, Digital e Locução',
  keywords: ['produção', 'comercial', 'TV', 'locução', 'kanban', 'workflow'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
