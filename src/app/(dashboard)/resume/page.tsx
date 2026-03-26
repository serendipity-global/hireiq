import Topbar from '@/components/layout/topbar'
import ResumeUpload from '@/components/resume/resume-upload'
import ResumeOptimizerComponent from '@/components/resume/resume-optimizer'
import { createClient } from '@/lib/supabase/server'

export default async function ResumePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: resume } = await supabase
    .from('resumes')
    .select('parsed_data, interview_dna, file_name, updated_at, optimization_data')
    .eq('user_id', user?.id ?? '')
    .single()

  const primaryRole = (resume?.parsed_data as any)?.primaryRole ?? null

  return (
    <>
      <Topbar title="My Resume" />
      <ResumeUpload
        savedAnalysis={resume?.parsed_data ?? null}
        savedDna={resume?.interview_dna ?? null}
        savedFileName={resume?.file_name ?? null}
        savedAt={resume?.updated_at ?? null}
      />
      {resume?.parsed_data && (
        <div style={{ padding: '0 40px 40px' }}>
          <ResumeOptimizerComponent
            savedOptimization={resume?.optimization_data ?? null}
            primaryRole={primaryRole}
          />
        </div>
      )}
    </>
  )
}