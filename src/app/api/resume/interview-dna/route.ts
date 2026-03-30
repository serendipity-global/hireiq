import { createClient } from '@/lib/supabase/server'
import { generateInterviewDNA } from '@/lib/ai/providers/interview-dna'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeText } = body

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    const dna = await generateInterviewDNA(resumeText)

    // Update resume record with DNA
    const { error } = await supabase
      .from('resumes')
      .update({ interview_dna: dna })
      .eq('user_id', user.id)
      .eq('is_active', true)  

    if (error) {
      console.error('Supabase error:', error)
    }

    return NextResponse.json({ success: true, dna })

  } catch (error) {
    console.error('Interview DNA error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}