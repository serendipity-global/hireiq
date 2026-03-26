import { createClient } from '@/lib/supabase/server'
import { generateFrameContent } from '@/lib/ai/providers/skill-war-room'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skill, skillContext, candidateRole, resumeEvidence } = body

    if (!skill || !skillContext) {
      return NextResponse.json({ error: 'Skill and skillContext are required' }, { status: 400 })
    }

    const content = await generateFrameContent(
      skill,
      skillContext,
      candidateRole ?? 'Software Engineer',
      resumeEvidence ?? ''
    )

    return NextResponse.json({ success: true, content })

  } catch (error) {
    console.error('War Room frame error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}