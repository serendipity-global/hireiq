import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import JobFitResult from '@/components/job-fit/job-fit-result'

export default async function JobFitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jobFit } = await supabase
    .from('job_fits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!jobFit) notFound()

  return (
    <>
      <Topbar title={`Job Fit — ${jobFit.job_title}`} />
      <JobFitResult jobFit={jobFit} />
    </>
  )
}