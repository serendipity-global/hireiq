import { createClient } from '@/lib/supabase/server'
import { evaluateAnswer } from '@/lib/ai/providers/skill-war-room'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skill, question, answer, skillContext, progressState } = body

    if (!skill || !question || !answer) {
      return NextResponse.json({ error: 'Skill, question and answer are required' }, { status: 400 })
    }

    const evaluation = await evaluateAnswer(
      skill,
      question,
      answer,
      skillContext ?? {},
      progressState ?? { skill, weakAreas: [], lastScore: 0, attempts: 0, previousAnswers: [] }
    )

    return NextResponse.json({ success: true, evaluation })

  } catch (error) {
    console.error('War Room evaluate error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}