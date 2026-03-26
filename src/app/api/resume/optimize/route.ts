import { createClient } from '@/lib/supabase/server'
import { optimizeResume } from '@/lib/ai/providers/resume-optimizer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetRole } = body

    // Get resume from Supabase
    const { data: resume } = await supabase
      .from('resumes')
      .select('raw_text, parsed_data')
      .eq('user_id', user.id)
      .single()

    if (!resume?.raw_text) {
      return NextResponse.json({ error: 'No resume found. Please upload your resume first.' }, { status: 400 })
    }

    const primaryRole = (resume.parsed_data as any)?.primaryRole ?? targetRole ?? undefined

    const optimization = await optimizeResume(resume.raw_text, primaryRole)

    // Save to Supabase
    await supabase
      .from('resumes')
      .update({ optimization_data: optimization })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, optimization })

  } catch (error) {
    console.error('Resume optimization error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}