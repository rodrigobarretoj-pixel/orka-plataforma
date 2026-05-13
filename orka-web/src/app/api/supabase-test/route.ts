// app/api/supabase-test/route.ts
// Rota de teste de conexão Supabase — remova após validar
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    // Testa conexão tentando listar tabelas públicas
    const { data, error } = await supabase
      .from('kanban_columns')
      .select('*')
      .limit(1)

    if (error) {
      // Se tabela não existe ainda, é esperado — conexão OK mas schema não aplicado
      if (error.code === '42P01') {
        return NextResponse.json({
          connected: true,
          schema_ready: false,
          message: 'Conexão OK! Schema ainda não foi aplicado. Execute o SQL no Supabase Studio.',
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        })
      }
      return NextResponse.json({ connected: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      connected: true,
      schema_ready: true,
      message: 'Conexão e schema OK!',
      columns: data,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 })
  }
}
