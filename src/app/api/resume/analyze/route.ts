import { createClient } from '@/lib/supabase/server'
import { analyzeResume } from '@/lib/ai/providers/resume'
import { NextRequest, NextResponse } from 'next/server'
import { extractText } from 'unpdf'
import { cleanResumeText, validateResumeText } from '@/lib/ai/utils/text-cleaner'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
    }

    // Verificar límite de 5 resumes
    const { count } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 5) {
      return NextResponse.json({
        error: 'You have reached the maximum of 5 resumes. Please delete one before uploading a new one.'
      }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const { text: rawText } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true })

    const cleanedText = cleanResumeText(rawText)
    const validation = validateResumeText(cleanedText)

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 })
    }

    const analysis = await analyzeResume(cleanedText)

    // Desactivar todos los resumes existentes
    await supabase
      .from('resumes')
      .update({ is_active: false })
      .eq('user_id', user.id)

    // Nuevo resume = reset del progreso de War Room
    await supabase
      .from('war_room_sessions')
      .delete()
      .eq('user_id', user.id)

    // Insertar siempre como nuevo resume activo
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_name: file.name,
        raw_text: cleanedText,
        parsed_data: analysis,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume, analysis })

  } catch (error) {
    console.error('Resume analysis error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}