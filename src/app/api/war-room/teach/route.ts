import { createClient } from '@/lib/supabase/server'
import { generateTeachContent } from '@/lib/ai/providers/skill-war-room'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skill, candidateRole, candidateLevel, resumeEvidence } = body

    if (!skill) {
      return NextResponse.json({ error: 'Skill is required' }, { status: 400 })
    }

    const content = await generateTeachContent(
      skill,
      candidateRole ?? 'Software Engineer',
      candidateLevel ?? 'senior',
      resumeEvidence ?? ''
    )

    return NextResponse.json({ success: true, content })

  } catch (error) {
    console.error('War Room teach error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}