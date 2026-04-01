import { createClient } from '@/lib/supabase/server'
import { evaluateInterviewAnswer } from '@/lib/ai/providers/interview-training'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { job_fit_id, question, answer, level, question_index } = await request.json()

    const { data: jobFit } = await supabase
      .from('job_fits')
      .select('job_title, company, fit_analysis')
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

    const evaluation = await evaluateInterviewAnswer(
      question,
      answer,
      level,
      jobFit.job_title,
      jobFit.company,
      resume?.raw_text ?? ''
    )

    const { data: session } = await supabase
      .from('interview_training_sessions')
      .select('*')
      .eq('job_fit_id', job_fit_id)
      .eq('user_id', user.id)
      .single()

    if (session) {
      const levelKey = `level${level}_answers` as keyof typeof session
      const currentAnswers = (session[levelKey] as any[]) ?? []
      const newAnswer = { question, answer, evaluation, question_index }
      const updatedAnswers = [...currentAnswers.filter((a: any) => a.question_index !== question_index), newAnswer]

      const updateData: any = {
        [levelKey]: updatedAnswers,
        updated_at: new Date().toISOString(),
      }

      // Check if level is completed (all 3 questions answered)
      if (updatedAnswers.length >= 3) {
        const avgScore = Math.round(
          updatedAnswers.reduce((sum: number, a: any) => sum + (a.evaluation?.score ?? 0), 0) / updatedAnswers.length
        )
        updateData[`level${level}_score`] = avgScore
        updateData[`level${level}_completed`] = true

        // Advance level if score >= 60
        if (avgScore >= 60 && level < 3) {
          updateData.current_level = level + 1
        }

        // Complete session if level 3 done
        if (level === 3) {
          const l1Score = session.level1_score ?? 0
          const l2Score = session.level2_score ?? 0
          updateData.final_score = Math.round((l1Score + l2Score + avgScore) / 3)
          updateData.session_completed = true
        }
      }

      await supabase
        .from('interview_training_sessions')
        .update(updateData)
        .eq('id', session.id)
    }

    return NextResponse.json({ success: true, evaluation })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}