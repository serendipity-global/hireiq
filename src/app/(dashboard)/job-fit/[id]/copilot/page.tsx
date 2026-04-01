import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import InterviewCopilot from '@/components/job-fit/interview-copilot'

export default async function InterviewCopilotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jobFit } = await supabase
    .from('job_fits')
    .select('id, job_title, company, fit_analysis, job_description')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!jobFit) notFound()

  const { data: resume } = await supabase
    .from('resumes')
    .select('raw_text')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return (
    <>
      <Topbar title={`Interview Copilot — ${jobFit.job_title}`} />
      <InterviewCopilot
        jobFit={jobFit}
        resumeText={resume?.raw_text ?? ''}
      />
    </>
  )
}