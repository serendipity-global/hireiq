import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await request.json()

    // Desactivar todos
    await supabase
      .from('resumes')
      .update({ is_active: false })
      .eq('user_id', user.id)

    // Activar el seleccionado
    await supabase
      .from('resumes')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}