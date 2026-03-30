import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status, applied_at } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    const updateData: any = { status }
    if (applied_at) updateData.applied_at = applied_at

    const { error } = await supabase
      .from('job_fits')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}