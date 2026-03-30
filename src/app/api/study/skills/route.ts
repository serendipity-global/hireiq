import { createClient } from '@/lib/supabase/server'
import { explainSkills } from '@/lib/ai/providers/skill-explainer'
import { extractSkillsFromResume } from '@/lib/ai/providers/skill-extractor'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: resume } = await supabase
      .from('resumes')
      .select('interview_dna, raw_text')  // ← fix: raw_text
      .eq('user_id', user.id)
      .eq('is_active', true)  
      .single()

    if (!resume) {
      return NextResponse.json({ error: 'No resume found' }, { status: 400 })
    }

    let allSkills: any[] = []

    if (resume.raw_text) {
      // Extracción semántica completa del resume real
      allSkills = await extractSkillsFromResume(resume.raw_text)
    } else {
      // Fallback: usar interview_dna skillMap
      const dna = resume.interview_dna as any
      const tier1 = dna?.skillMap?.tier1 ?? []
      const tier2 = dna?.skillMap?.tier2 ?? []
      const tier3 = dna?.skillMap?.tier3 ?? []
      allSkills = [
        ...tier1.map((s: any) => ({ name: s.name, category: s.category, evidence: s.evidence, tier: 1 })),
        ...tier2.map((s: any) => ({ name: s.name, category: s.category, evidence: s.evidence ?? '', tier: 2 })),
        ...tier3.map((s: any) => ({ name: s.name, category: s.category, evidence: '', tier: 3 })),
      ]
    }

    if (allSkills.length === 0) {
      return NextResponse.json({ error: 'No skills found in your resume' }, { status: 400 })
    }

    const explanations = await explainSkills(allSkills)

    const enriched = explanations.map((exp: any) => {
      const original = allSkills.find((s: any) => s.name.toLowerCase() === exp.skill.toLowerCase())
      return { ...exp, tier: original?.tier ?? 3 }
    })

    await supabase
      .from('resumes')
      .update({ skills_guide: enriched })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, explanations: enriched })

  } catch (error) {
    console.error('Skill explainer error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}