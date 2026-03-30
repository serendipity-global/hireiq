import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrainCircuit, Swords, AlertTriangle, TrendingUp, Upload, ChevronRight, Target } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name?.split(' ')[0]
    ?? user.email?.split('@')[0]
    ?? 'there'

  const { data: resume } = await supabase
    .from('resumes')
    .select('parsed_data, interview_dna, file_name, updated_at')
    .eq('user_id', user.id)
    .eq('is_active', true)  
    .single()

  const { data: sessions } = await supabase
    .from('war_room_sessions')
    .select('skill_name, final_score, session_completed, evaluation, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const parsedData = resume?.parsed_data as any
  const dna = resume?.interview_dna as any

  const readinessScore = parsedData?.interviewReadiness?.score ?? 0
  const primaryRole = parsedData?.primaryRole ?? null
  const completedSessions = sessions?.filter(s => s.session_completed) ?? []
  const totalSessions = sessions?.length ?? 0
  const criticalGaps = parsedData?.gaps?.filter((g: any) => g.severity === 'critical' || g.severity === 'high') ?? []
  const tier1Skills = dna?.skillMap?.tier1 ?? []
  const marketPercentile = dna?.marketPosition?.overallPercentile ?? null
  const hireProbability = dna?.probabilityEngine?.currentHireProbability ?? null
  const afterPrepProbability = dna?.probabilityEngine?.afterPreparationProbability ?? null
  const topQuestions = parsedData?.topPredictedQuestions?.slice(0, 4) ?? []

  const scoreColor = (score: number) => {
    if (score >= 75) return '#16a34a'
    if (score >= 50) return '#d97706'
    return '#dc2626'
  }

  return (
    <>
      <Topbar title="Dashboard" />
      <div style={{ padding: '40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.6px', marginBottom: '6px' }}>
            Welcome back, {name}
          </h2>
          <p style={{ fontSize: '14px', color: '#71717a' }}>
            {primaryRole ? `Preparing for: ${primaryRole}` : 'Your career intelligence system is ready.'}
          </p>
        </div>

        {!resume ? (
          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <Upload size={32} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>Start by uploading your resume</p>
            <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
              Your personalized career intelligence system will be ready in minutes.
            </p>
            <Link href="/resume" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500,
              padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
            }}>
              <Upload size={15} /> Upload Resume
            </Link>
          </div>
        ) : (
          <>
            {/* Score Banner */}
            <div style={{
              background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
              padding: '32px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '40px', marginBottom: '16px',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Current target role
                </p>
                <p style={{ fontSize: '22px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.4px', marginBottom: '20px' }}>
                  {primaryRole ?? 'Upload resume to detect your role'}
                </p>
                <div style={{ height: '4px', background: '#f4f4f5', borderRadius: '2px', width: '100%', maxWidth: '480px', marginBottom: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '4px', background: scoreColor(readinessScore), borderRadius: '2px', width: `${readinessScore}%`, transition: 'width 0.6s ease' }} />
                </div>
                <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{readinessScore}% interview ready</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '68px', fontWeight: 600, color: scoreColor(readinessScore), lineHeight: 1, letterSpacing: '-3px', fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {readinessScore}
                </div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px', marginBottom: '16px' }}>readiness score</div>
                <Link href="/training/warroom" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500,
                  padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                }}>
                  <Swords size={15} /> Start War Room
                </Link>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BrainCircuit size={14} strokeWidth={1.5} style={{ color: '#a1a1aa' }} />
                  <span style={{ fontSize: '13px', color: '#71717a' }}>Skills trained</span>
                </div>
                <div style={{ fontSize: '36px', fontWeight: 600, color: '#09090b', fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '-1px' }}>
                  {totalSessions}
                </div>
                {completedSessions.length > 0 && (
                  <p style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>{completedSessions.length} completed</p>
                )}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <AlertTriangle size={14} strokeWidth={1.5} style={{ color: '#a1a1aa' }} />
                  <span style={{ fontSize: '13px', color: '#71717a' }}>Critical gaps</span>
                </div>
                <div style={{ fontSize: '36px', fontWeight: 600, color: criticalGaps.length > 0 ? '#ef4444' : '#09090b', fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '-1px' }}>
                  {criticalGaps.length > 0 ? criticalGaps.length : '—'}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp size={14} strokeWidth={1.5} style={{ color: '#a1a1aa' }} />
                  <span style={{ fontSize: '13px', color: '#71717a' }}>Market position</span>
                </div>
                <div style={{ fontSize: '36px', fontWeight: 600, color: marketPercentile ? scoreColor(marketPercentile) : '#09090b', fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '-1px' }}>
                  {marketPercentile ? `${marketPercentile}%` : '—'}
                </div>
                {marketPercentile && (
                  <p style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>percentile</p>
                )}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Target size={14} strokeWidth={1.5} style={{ color: '#a1a1aa' }} />
                  <span style={{ fontSize: '13px', color: '#71717a' }}>Hire probability</span>
                </div>
                <div style={{ fontSize: '36px', fontWeight: 600, color: hireProbability ? scoreColor(hireProbability) : '#09090b', fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '-1px' }}>
                  {hireProbability ? `${hireProbability}%` : '—'}
                </div>
                {afterPrepProbability && (
                  <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>↑ {afterPrepProbability}% after prep</p>
                )}
              </div>
            </div>

            {/* Bottom Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>

              {/* Predicted Questions */}
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Top predicted questions
                  </p>
                  <Link href="/training/warroom" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
                    Train →
                  </Link>
                </div>
                {topQuestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {topQuestions.map((q: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#f8f8f9', borderRadius: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 500, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.5' }}>{q.question}</p>
                        </div>
                        <span style={{
                          fontSize: '10px', padding: '2px 7px', borderRadius: '6px', fontWeight: 500, flexShrink: 0,
                          background: q.difficulty === 'hard' ? 'rgba(220,38,38,0.08)' : q.difficulty === 'medium' ? 'rgba(217,119,6,0.08)' : 'rgba(22,163,74,0.08)',
                          color: q.difficulty === 'hard' ? '#dc2626' : q.difficulty === 'medium' ? '#d97706' : '#16a34a',
                        }}>{q.difficulty}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
                    <Swords size={24} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '8px' }} />
                    <p style={{ fontSize: '13px', color: '#71717a' }}>Upload your resume to see predicted questions</p>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* War Room Progress */}
                <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      War Room progress
                    </p>
                    <Link href="/training/warroom" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
                      View all →
                    </Link>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Completed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d97706' }} />
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>In progress</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d4d4d8' }} />
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Not started</span>
                    </div>
                  </div>

                  {tier1Skills.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tier1Skills.slice(0, 5).map((skill: any, i: number) => {
                        const session = sessions?.find(s => s.skill_name.toLowerCase() === skill.name.toLowerCase())
                        const skillScore = session?.final_score?.finalScore ?? null
                        const isStarted = !!session
                        const isCompleted = session?.session_completed ?? false

                        return (
                          <Link key={i} href={`/training/warroom/${encodeURIComponent(skill.name)}`} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: '#f8f8f9' }}>
                              <div style={{
                                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                background: isCompleted ? '#16a34a' : isStarted ? '#d97706' : '#d4d4d8',
                              }} />
                              <span style={{ fontSize: '13px', color: '#09090b', flex: 1 }}>{skill.name}</span>
                              {skillScore !== null ? (
                                <span style={{ fontSize: '12px', fontWeight: 600, color: scoreColor(skillScore), fontFamily: 'var(--font-geist-mono), monospace' }}>
                                  {skillScore}
                                </span>
                              ) : (
                                <ChevronRight size={13} style={{ color: '#d4d4d8' }} />
                              )}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: '#71717a' }}>Upload resume to unlock skill training</p>
                    </div>
                  )}
                </div>

                {/* Critical Gaps */}
                {criticalGaps.length > 0 && (
                  <div style={{ background: '#fff7f7', border: '1px solid #fecaca', borderRadius: '16px', padding: '20px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                      Critical gaps
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {criticalGaps.slice(0, 3).map((gap: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <AlertTriangle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                          <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{gap.area}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}