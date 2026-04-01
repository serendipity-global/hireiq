import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import InterviewTraining from '@/components/job-fit/interview-training'

export default async function InterviewTrainingPage({
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

  const { data: session } = await supabase
    .from('interview_training_sessions')
    .select('*')
    .eq('job_fit_id', id)
    .eq('user_id', user.id)
    .single()

  return (
    <>
      <Topbar title={`Interview Training — ${jobFit.job_title}`} />
      <InterviewTraining
        jobFit={jobFit}
        savedSession={session ?? null}
      />
    </>
  )
}