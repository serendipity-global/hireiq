import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
    }

    // Verify it belongs to the user before deleting
    const { data: resume } = await supabase
      .from('resumes')
      .select('id, is_active')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    // If we deleted the active one, activate the most recent remaining one
    if (resume.is_active) {
      const { data: remaining } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (remaining && remaining.length > 0) {
        await supabase
          .from('resumes')
          .update({ is_active: true })
          .eq('id', remaining[0].id)
          .eq('user_id', user.id)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete resume error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}