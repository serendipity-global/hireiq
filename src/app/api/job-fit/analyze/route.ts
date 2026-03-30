import { createClient } from '@/lib/supabase/server'
import { analyzeJobFit, generateCoverLetter } from '@/lib/ai/providers/job-fit'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobDescription, jobUrl, mode } = await request.json()

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    const { data: resume } = await supabase
      .from('resumes')
      .select('raw_text')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!resume?.raw_text) {
      return NextResponse.json({ error: 'No resume found. Please upload your resume first.' }, { status: 400 })
    }

    // Run both in parallel — saves ~20 seconds
    const [analysis, coverLetterData] = await Promise.all([
      analyzeJobFit(resume.raw_text, jobDescription),
      analyzeJobFit(resume.raw_text, jobDescription).then(a =>
        generateCoverLetter(resume.raw_text, jobDescription, a)
      )
    ])

    const { data: jobFit, error } = await supabase
      .from('job_fits')
      .insert({
        user_id: user.id,
        job_title: analysis.jobTitle ?? 'Unknown Position',
        company: analysis.company ?? 'Not specified',
        job_description: jobDescription,
        fit_analysis: analysis,
        cover_letter: coverLetterData.coverLetter,
        mode: mode ?? 'aggressive',
        job_url: jobUrl?.trim() || null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, jobFit })

  } catch (error) {
    console.error('Job fit error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    const { error } = await supabase
      .from('job_fits')
      .delete()
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