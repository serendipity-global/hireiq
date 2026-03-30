import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JobFitList from '@/components/job-fit/job-fit-list'

export default async function JobFitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jobFits } = await supabase
    .from('job_fits')
    .select('id, job_title, company, fit_analysis, created_at, status, mode, job_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Topbar title="Job Fit — My Jobs" />
      <JobFitList jobFits={jobFits ?? []} />
    </>
  )
}