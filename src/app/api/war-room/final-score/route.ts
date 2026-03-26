import { createClient } from '@/lib/supabase/server'
import { generateFinalScore } from '@/lib/ai/providers/skill-war-room'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skill, sessionData } = body

    if (!skill || !sessionData) {
      return NextResponse.json({ error: 'Skill and sessionData are required' }, { status: 400 })
    }

    const finalScore = await generateFinalScore(skill, sessionData)

    return NextResponse.json({ success: true, finalScore })

  } catch (error) {
    console.error('War Room final score error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}