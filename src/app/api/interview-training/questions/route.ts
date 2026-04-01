import { createClient } from '@/lib/supabase/server'
import { generateInterviewQuestions } from '@/lib/ai/providers/interview-training'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { job_fit_id, regenerate } = await request.json()

    const { data: jobFit } = await supabase
      .from('job_fits')
      .select('*')
      .eq('id', job_fit_id)
      .eq('user_id', user.id)
      .single()

    if (!jobFit) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const { data: resume } = await supabase
      .from('resumes')
      .select('raw_text')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!resume?.raw_text) return NextResponse.json({ error: 'No resume found' }, { status: 400 })

    const questions = await generateInterviewQuestions(
      resume.raw_text,
      jobFit.job_description,
      jobFit.job_title,
      jobFit.company,
      jobFit.fit_analysis,
      regenerate ?? false
    )

    const { data: existing } = await supabase
      .from('interview_training_sessions')
      .select('id')
      .eq('job_fit_id', job_fit_id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase
        .from('interview_training_sessions')
        .update({
          level1_questions: questions.level1,
          level2_questions: questions.level2,
          level3_questions: questions.level3,
          level1_answers: [],
          level2_answers: [],
          level3_answers: [],
          level1_score: null,
          level2_score: null,
          level3_score: null,
          level1_completed: false,
          level2_completed: false,
          level3_completed: false,
          current_level: 1,
          session_completed: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('interview_training_sessions')
        .insert({
          user_id: user.id,
          job_fit_id,
          level1_questions: questions.level1,
          level2_questions: questions.level2,
          level3_questions: questions.level3,
          current_level: 1,
        })
    }

    return NextResponse.json({ success: true, questions })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}