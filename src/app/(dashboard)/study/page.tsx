import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Cpu, FileText, Briefcase } from 'lucide-react'

export default async function StudyGuidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('interview_dna, skills_guide, summary_guide')
    .eq('user_id', user.id)
    .eq('is_active', true)  
    .single()

  // Contadores desde skills_guide (fuente de verdad real)
  const skillsGuide = (resume?.skills_guide as any[]) ?? []
  const hasGuide = skillsGuide.length > 0

  const totalSkills = skillsGuide.length
  const tier1Count = skillsGuide.filter((s: any) => s.tier === 1).length
  const tier2Count = skillsGuide.filter((s: any) => s.tier === 2).length

  // Fallback a DNA solo si no hay guide aún (para mostrar estimado)
  const dna = resume?.interview_dna as any
  const dnaTier1 = dna?.skillMap?.tier1?.length ?? 0
  const dnaTier2 = dna?.skillMap?.tier2?.length ?? 0
  const dnaTier3 = dna?.skillMap?.tier3?.length ?? 0
  const dnaTotal = dnaTier1 + dnaTier2 + dnaTier3

  // Summary guide
  const summaryGuide = resume?.summary_guide as any
  const hasSummaryGuide = !!summaryGuide

  return (
    <>
      <Topbar title="Study Guide" />
      <div style={{ padding: '40px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Study Guide
          </h2>
          <p style={{ fontSize: '14px', color: '#71717a' }}>
            Master every section of your resume. Understand what you know — and how to explain it.
          </p>
        </div>

        {!resume ? (
          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <BookOpen size={32} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>No resume loaded</p>
            <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>Upload your resume to generate your personalized study guide.</p>
            <Link href="/resume" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500,
              padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
            }}>
              Upload Resume
            </Link>
          </div>
        ) : (
          <div style={{ padding: '40px' }}>

            {/* Skills Encyclopedia */}
            <Link href="/study/skills" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
                padding: '28px', cursor: 'pointer',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(99,102,241,0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                }}>
                  <Cpu size={22} style={{ color: '#6366f1' }} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>
                  Skills Encyclopedia
                </p>
                <p style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.6', marginBottom: '16px' }}>
                  Every skill from your resume explained simply and clearly. Understand what you know and how to talk about it in interviews.
                </p>

                {hasGuide ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.08)', color: '#6366f1', fontWeight: 500 }}>
                      {totalSkills} skills
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#f4f4f5', color: '#71717a' }}>
                      {tier1Count} core · {tier2Count} supporting
                    </span>
                  </div>
                ) : dnaTotal > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#fff7ed', color: '#d97706', fontWeight: 500, border: '1px solid #fed7aa' }}>
                      Not analyzed yet
                    </span>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      ~{dnaTotal} skills detected
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#f4f4f5', color: '#a1a1aa' }}>
                    Generate your guide to start
                  </span>
                )}
              </div>
            </Link>

            {/* Professional Summary */}
            <Link href="/study/summary" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
                padding: '28px', cursor: 'pointer',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(99,102,241,0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                }}>
                  <FileText size={22} style={{ color: '#6366f1' }} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>
                  Professional Summary
                </p>
                <p style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.6', marginBottom: '16px' }}>
                  Break down your professional summary sentence by sentence. Know exactly what message you're sending.
                </p>

                {hasSummaryGuide ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.08)', color: '#6366f1', fontWeight: 500 }}>
                      {summaryGuide.sentenceAnalysis?.length ?? 0} sentences analyzed
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#f4f4f5', color: '#71717a' }}>
                      Score: {summaryGuide.overallScore}/100
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#fff7ed', color: '#d97706', fontWeight: 500, border: '1px solid #fed7aa' }}>
                    Not analyzed yet
                  </span>
                )}
              </div>
            </Link>

            {/* Work Experience — Coming Soon */}
            <div style={{
              background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
              padding: '28px', opacity: 0.5,
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#f4f4f5', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
              }}>
                <Briefcase size={22} style={{ color: '#a1a1aa' }} strokeWidth={1.5} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#09090b' }}>Work Experience</p>
                <span style={{ fontSize: '10px', background: '#f4f4f5', color: '#a1a1aa', padding: '2px 8px', borderRadius: '6px' }}>Soon</span>
              </div>
              <p style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.6' }}>
                Position by position analysis. Understand every bullet point and how to defend it in an interview.
              </p>
            </div>

          </div>
        )}
      </div>
    </>
  )
}