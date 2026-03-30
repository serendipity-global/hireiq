import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfessionalSummaryAnalyzer from '@/components/study/professional-summary'

export default async function SummaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('summary_guide')
    .eq('user_id', user.id)
    .single()

  return (
    <>
      <Topbar title="Professional Summary" />
      <ProfessionalSummaryAnalyzer savedAnalysis={resume?.summary_guide ?? null} />
    </>
  )
}