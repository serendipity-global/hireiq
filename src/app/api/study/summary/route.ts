import { createClient } from '@/lib/supabase/server'
import { analyzeProfessionalSummary } from '@/lib/ai/providers/professional-summary'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: resume } = await supabase
      .from('resumes')
      .select('raw_text')
      .eq('user_id', user.id)
      .eq('is_active', true)  
      .single()

    if (!resume?.raw_text) {
      return NextResponse.json({ error: 'No resume found' }, { status: 400 })
    }

    const analysis = await analyzeProfessionalSummary(resume.raw_text)

    await supabase
      .from('resumes')
      .update({ summary_guide: analysis })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, analysis })

  } catch (error) {
    console.error('Summary analysis error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}