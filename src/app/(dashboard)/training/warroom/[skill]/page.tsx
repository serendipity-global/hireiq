import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SkillWarRoom from '@/components/training/skill-war-room'

export default async function SkillWarRoomPage({
  params,
}: {
  params: Promise<{ skill: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { skill } = await params
  const skillName = decodeURIComponent(skill)

  const { data: resume } = await supabase
    .from('resumes')
    .select('parsed_data, interview_dna, raw_text')
    .eq('user_id', user.id)
    .single()

  const { data: session } = await supabase
    .from('war_room_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('skill_name', skillName)
    .single()

  const dna = resume?.interview_dna as any
  const parsedData = resume?.parsed_data as any

  const skillData = dna?.skillMap?.tier1?.find(
    (s: any) => s.name.toLowerCase() === skillName.toLowerCase()
  ) ?? dna?.skillMap?.tier2?.find(
    (s: any) => s.name.toLowerCase() === skillName.toLowerCase()
  )

  return (
    <>
      <Topbar title={skillName} />
      <SkillWarRoom
        skill={skillName}
        skillData={skillData}
        candidateRole={parsedData?.primaryRole ?? 'Software Engineer'}
        candidateLevel={parsedData?.seniorityLevel ?? 'senior'}
        resumeEvidence={skillData?.evidence ?? ''}
        savedSession={session ?? null}
      />
    </>
  )
}