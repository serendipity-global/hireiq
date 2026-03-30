import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JobFitAnalyzer from '@/components/job-fit/job-fit-analyzer'

export default async function NewJobFitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('raw_text')
    .eq('user_id', user.id)
    .single()

  return (
    <>
      <Topbar title="Job Fit — Analyze" />
      <JobFitAnalyzer hasResume={!!resume?.raw_text} />
    </>
  )
}