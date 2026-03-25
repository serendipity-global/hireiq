import Topbar from '@/components/layout/topbar'
import ResumeUpload from '@/components/resume/resume-upload'

export default function ResumePage() {
  return (
    <>
      <Topbar title="My Resume" />
      <ResumeUpload />
    </>
  )
}