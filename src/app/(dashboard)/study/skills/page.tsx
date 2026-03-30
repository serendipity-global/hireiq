import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SkillsEncyclopedia from '@/components/study/skills-encyclopedia'

export default async function SkillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('interview_dna, skills_guide')
    .eq('user_id', user.id)
    .eq('is_active', true)  
    .single()

  const dna = resume?.interview_dna as any
  const tier1 = dna?.skillMap?.tier1 ?? []
  const tier2 = dna?.skillMap?.tier2 ?? []
  const tier3 = dna?.skillMap?.tier3 ?? []
  const totalSkills = tier1.length + tier2.length + tier3.length

  return (
    <>
      <Topbar title="Skills Encyclopedia" />
      <SkillsEncyclopedia
        savedGuide={resume?.skills_guide ?? null}
        totalSkills={totalSkills}
        tier1Count={tier1.length}
        tier2Count={tier2.length}
        tier3Count={tier3.length}
      />
    </>
  )
}