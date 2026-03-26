'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Loader2, ChevronRight, CheckCircle, AlertTriangle, Zap, Brain, Target, Trophy, RotateCcw } from 'lucide-react'
import Link from 'next/link'

type Phase = 'teach' | 'frame' | 'answer' | 'pressure' | 'score'

interface Props {
  skill: string
  skillData: any
  candidateRole: string
  candidateLevel: string
  resumeEvidence: string
  savedSession: any
}

async function saveSession(skillName: string, updates: Record<string, any>) {
  await fetch('/api/war-room/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillName, updates }),
  })
}

export default function SkillWarRoom({ skill, skillData, candidateRole, candidateLevel, resumeEvidence, savedSession }: Props) {

  const getInitialPhase = (): Phase => {
    if (!savedSession) return 'teach'
    if (savedSession.final_score) return 'score'
    if (savedSession.pressure_question && savedSession.evaluation) return 'pressure'
    if (savedSession.evaluation) return 'answer'
    if (savedSession.frame_content) return 'frame'
    if (savedSession.teach_content) return 'teach'
    return 'teach'
  }

  const [phase, setPhase] = useState<Phase>(getInitialPhase())
  const [isLoading, setIsLoading] = useState(!savedSession?.teach_content)
  const [error, setError] = useState<string | null>(null)

  const [teachContent, setTeachContent] = useState<any>(savedSession?.teach_content ?? null)
  const [frameContent, setFrameContent] = useState<any>(savedSession?.frame_content ?? null)
  const [evaluation, setEvaluation] = useState<any>(savedSession?.evaluation ?? null)
  const [pressureQuestion, setPressureQuestion] = useState<any>(savedSession?.pressure_question ?? null)
  const [finalScore, setFinalScore] = useState<any>(savedSession?.final_score ?? null)

  const [currentQuestion, setCurrentQuestion] = useState<any>(savedSession?.frame_content?.questions?.[0] ?? null)
  const [answer, setAnswer] = useState('')
  const [pressureAnswer, setPressureAnswer] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isPressuring, setIsPressuring] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const [progressState, setProgressState] = useState({
    skill,
    weakAreas: [] as string[],
    lastScore: savedSession?.evaluation?.scores?.overall ?? 0,
    attempts: savedSession?.evaluation ? 1 : 0,
    previousAnswers: [] as string[],
  })

  const [sessionData, setSessionData] = useState({
    answers: [] as string[],
    scores: savedSession?.evaluation?.scores?.overall ? [savedSession.evaluation.scores.overall] : [] as number[],
    weakAreas: savedSession?.evaluation?.weakAreasDetected ?? [] as string[],
    attempts: savedSession?.evaluation ? 1 : 0,
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!teachContent) {
      loadTeachContent()
    } else {
      setIsLoading(false)
    }
  }, [])

  async function loadTeachContent() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/war-room/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, candidateRole, candidateLevel, resumeEvidence }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setTeachContent(data.content)
      await saveSession(skill, { teach_content: data.content })
    } catch {
      setError('Failed to load content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadFrameContent() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/war-room/frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill,
          skillContext: teachContent?.skillContext ?? {},
          candidateRole,
          resumeEvidence,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setFrameContent(data.content)
      setCurrentQuestion(data.content?.questions?.[0] ?? null)
      await saveSession(skill, { frame_content: data.content })
      setPhase('frame')
    } catch {
      setError('Failed to load interview framing. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) return
    setIsEvaluating(true)
    setError(null)
    try {
      const res = await fetch('/api/war-room/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill,
          question: currentQuestion?.question ?? '',
          answer,
          skillContext: teachContent?.skillContext ?? {},
          progressState,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      const eval_ = data.evaluation
      setEvaluation(eval_)
      await saveSession(skill, { evaluation: eval_ })

      const newScore = eval_?.scores?.overall ?? 0
      const newWeakAreas = eval_?.weakAreasDetected ?? []

      setProgressState(prev => ({
        ...prev,
        lastScore: newScore,
        attempts: prev.attempts + 1,
        weakAreas: [...new Set([...prev.weakAreas, ...newWeakAreas])],
        previousAnswers: [...prev.previousAnswers, answer],
      }))

      setSessionData(prev => ({
        answers: [...prev.answers, answer],
        scores: [...prev.scores, newScore],
        weakAreas: [...new Set([...prev.weakAreas, ...newWeakAreas])],
        attempts: prev.attempts + 1,
      }))

      setPhase('answer')
    } catch {
      setError('Failed to evaluate answer. Please try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  async function handlePressureMode() {
    setIsPressuring(true)
    setError(null)
    try {
      const res = await fetch('/api/war-room/pressure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill,
          question: currentQuestion?.question ?? '',
          answer,
          skillContext: teachContent?.skillContext ?? {},
          progressState,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setPressureQuestion(data.pressure)
      await saveSession(skill, { pressure_question: data.pressure })
      setPhase('pressure')
    } catch {
      setError('Failed to generate pressure question.')
    } finally {
      setIsPressuring(false)
    }
  }

  async function handleFinalScore() {
    setIsFinalizing(true)
    setError(null)
    try {
      const res = await fetch('/api/war-room/final-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, sessionData }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setFinalScore(data.finalScore)
      await saveSession(skill, { final_score: data.finalScore, session_completed: true })
      setPhase('score')
    } catch {
      setError('Failed to generate final score.')
    } finally {
      setIsFinalizing(false)
    }
  }

  async function handleRestart() {
    await saveSession(skill, {
      teach_content: null,
      frame_content: null,
      evaluation: null,
      pressure_question: null,
      final_score: null,
      session_completed: false,
    })
    setPhase('teach')
    setTeachContent(null)
    setFrameContent(null)
    setEvaluation(null)
    setPressureQuestion(null)
    setFinalScore(null)
    setAnswer('')
    setPressureAnswer('')
    setProgressState({ skill, weakAreas: [], lastScore: 0, attempts: 0, previousAnswers: [] })
    setSessionData({ answers: [], scores: [], weakAreas: [], attempts: 0 })
    loadTeachContent()
  }

  const scoreColor = (score: number) => {
    if (score >= 75) return '#16a34a'
    if (score >= 50) return '#d97706'
    return '#dc2626'
  }

  const phaseIndex: Record<Phase, number> = { teach: 0, frame: 1, answer: 2, pressure: 3, score: 4 }
  const phases = ['Teach', 'Frame', 'Answer', 'Pressure', 'Score']

  return (
    <div style={{ padding: '40px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link href="/training/warroom" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: '#71717a', textDecoration: 'none',
        }}>
          <ArrowLeft size={14} /> Back to War Room
        </Link>
        {savedSession && (
          <button
            onClick={handleRestart}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#71717a', background: 'none',
              border: '1px solid #e4e4e7', borderRadius: '8px',
              padding: '6px 12px', cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} /> Restart session
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{
        background: '#18181b', borderRadius: '16px', padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px',
      }}>
        <div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Skill War Room
          </p>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.3px' }}>{skill}</h2>
        </div>
        {skillData && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontWeight: 500 }}>
              {skillData.category}
            </span>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.2)', color: '#fcd34d', fontWeight: 500 }}>
              {skillData.interviewLikelihood} in interviews
            </span>
          </div>
        )}
      </div>

      {/* Phase indicator — clickable */}
      <div style={{
        display: 'flex', background: '#ffffff', border: '1px solid #e4e4e7',
        borderRadius: '12px', overflow: 'hidden', marginBottom: '20px',
      }}>
        {phases.map((p, i) => {
          const phaseName = ['teach', 'frame', 'answer', 'pressure', 'score'][i] as Phase
          const isCompleted = i < phaseIndex[phase]
          const isCurrent = i === phaseIndex[phase]
          const canNavigate =
            (i === 0 && !!teachContent) ||
            (i === 1 && !!frameContent) ||
            (i === 2 && !!evaluation) ||
            (i === 3 && !!pressureQuestion) ||
            (i === 4 && !!finalScore)

          return (
            <div
              key={p}
              onClick={() => canNavigate ? setPhase(phaseName) : null}
              style={{
                flex: 1, padding: '12px 8px', textAlign: 'center',
                borderRight: i < 4 ? '1px solid #e4e4e7' : 'none',
                background: isCurrent ? 'rgba(99,102,241,0.06)' : 'transparent',
                position: 'relative',
                cursor: canNavigate ? 'pointer' : 'default',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{
                fontSize: '10px',
                color: isCompleted ? '#16a34a' : isCurrent ? '#6366f1' : '#d4d4d8',
                marginBottom: '3px',
              }}>
                {isCompleted ? '✓' : `0${i + 1}`}
              </div>
              <div style={{
                fontSize: '12px', fontWeight: 500,
                color: isCompleted ? '#16a34a' : isCurrent ? '#6366f1' : '#d4d4d8',
              }}>{p}</div>
              {isCurrent && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#6366f1' }} />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {isLoading && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader2 size={32} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b' }}>Preparing your training session...</p>
          <p style={{ fontSize: '13px', color: '#71717a' }}>Claude AI is personalizing this for your profile.</p>
        </div>
      )}

      {/* PHASE 1 — TEACH */}
      {!isLoading && phase === 'teach' && teachContent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Brain size={16} style={{ color: '#6366f1' }} />
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>What you must know</p>
            </div>

            <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#6366f1', marginBottom: '8px' }}>KEY INSIGHT</p>
              <p style={{ fontSize: '15px', color: '#09090b', lineHeight: '1.7', fontWeight: 500 }}>{teachContent.keyInsight}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {teachContent.mustKnow?.map((item: any, i: number) => (
                <div key={i} style={{ padding: '18px', background: '#f8f8f9', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '8px' }}>{item.concept}</p>
                  <p style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.6', marginBottom: '12px' }}>{item.explanation}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ padding: '10px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, color: '#6366f1', marginBottom: '4px' }}>SENIOR SIGNAL ⚡</p>
                      <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{item.seniorSignal}</p>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(220,38,38,0.04)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>COMMON MISTAKE ✗</p>
                      <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{item.commonMistake}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', background: '#18181b', borderRadius: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>QUICK FRAMEWORK</p>
                <p style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: '1.6' }}>{teachContent.quickFramework}</p>
              </div>
              <div style={{ padding: '16px', background: '#fff7f7', border: '1px solid #fecaca', borderRadius: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#dc2626', marginBottom: '8px' }}>NEVER SAY THIS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {teachContent.redFlags?.map((flag: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#dc2626', fontSize: '12px', flexShrink: 0 }}>✗</span>
                      <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{flag}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={loadFrameContent}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: 'white',
                fontSize: '14px', fontWeight: 500, padding: '12px 24px', borderRadius: '10px',
                border: 'none', cursor: 'pointer', width: '100%', justifyContent: 'center',
              }}
            >
              I understand this — Show me how they ask it in interviews
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2 — FRAME */}
      {!isLoading && phase === 'frame' && frameContent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {frameContent.personalizedWarnings?.length > 0 && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#d97706', marginBottom: '10px' }}>⚡ PERSONALIZED WARNINGS — BASED ON YOUR RESUME</p>
              {frameContent.personalizedWarnings.map((w: any, i: number) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>{w.warning}</p>
                  <p style={{ fontSize: '12px', color: '#71717a' }}>{w.reason}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>How they ask this in real interviews</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {frameContent.questions?.map((q: any, i: number) => (
                <div key={i} style={{ padding: '16px', background: '#f8f8f9', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#09090b', lineHeight: '1.5' }}>"{q.question}"</p>
                    <span style={{
                      fontSize: '10px', padding: '2px 7px', borderRadius: '6px', fontWeight: 500, flexShrink: 0,
                      background: q.frequency === 'guaranteed' ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)',
                      color: q.frequency === 'guaranteed' ? '#dc2626' : '#d97706',
                    }}>{q.frequency}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6366f1', fontStyle: 'italic', marginBottom: '10px' }}>What they're really asking: {q.whatTheyreReallyAsking}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ padding: '10px', background: 'rgba(22,163,74,0.06)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', marginBottom: '4px' }}>TOP CANDIDATE SAYS</p>
                      <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{q.topCandidateAnswer}</p>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(220,38,38,0.04)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>AVERAGE CANDIDATE SAYS</p>
                      <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{q.averageCandidateAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {frameContent.differentiator && (
              <div style={{ background: '#18181b', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>THE DIFFERENTIATOR</p>
                <p style={{ fontSize: '14px', color: '#ffffff', lineHeight: '1.6' }}>{frameContent.differentiator}</p>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#09090b', marginBottom: '12px' }}>Now it's your turn:</p>
              <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b' }}>"{currentQuestion?.question}"</p>
              </div>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here — be specific, use real examples from your experience..."
                style={{
                  width: '100%', minHeight: '120px', padding: '14px', fontSize: '14px',
                  borderRadius: '10px', border: '1px solid #e4e4e7', outline: 'none',
                  color: '#09090b', background: '#ffffff', resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || isEvaluating}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                background: answer.trim() ? '#6366f1' : '#e4e4e7',
                color: answer.trim() ? 'white' : '#a1a1aa',
                fontSize: '14px', fontWeight: 500, padding: '12px 24px',
                borderRadius: '10px', border: 'none', cursor: answer.trim() ? 'pointer' : 'not-allowed', width: '100%',
              }}
            >
              {isEvaluating
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Evaluating your answer...</>
                : <>Submit Answer — Get Evaluated <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3 — ANSWER EVALUATION */}
      {!isLoading && phase === 'answer' && evaluation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Evaluation Results</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '4px' }}>{evaluation.verdict}</p>
                <span style={{
                  fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
                  background: evaluation.hiringDecision === 'strong_yes' || evaluation.hiringDecision === 'yes' ? 'rgba(22,163,74,0.08)' : evaluation.hiringDecision === 'maybe' ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                  color: evaluation.hiringDecision === 'strong_yes' || evaluation.hiringDecision === 'yes' ? '#16a34a' : evaluation.hiringDecision === 'maybe' ? '#d97706' : '#dc2626',
                }}>{evaluation.hiringDecision?.replace('_', ' ')}</span>
              </div>
              <div style={{ fontSize: '56px', fontWeight: 700, color: scoreColor(evaluation.scores?.overall ?? 0), fontFamily: 'var(--font-geist-mono), monospace', lineHeight: 1, letterSpacing: '-2px' }}>
                {evaluation.scores?.overall ?? 0}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {['clarity', 'depth', 'impact', 'confidence'].map(metric => (
                <div key={metric} style={{ textAlign: 'center', padding: '12px', background: '#f8f8f9', borderRadius: '10px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 600, color: scoreColor(evaluation.scores?.[metric] ?? 0), fontFamily: 'var(--font-geist-mono), monospace' }}>{evaluation.scores?.[metric] ?? 0}</div>
                  <div style={{ fontSize: '11px', color: '#71717a', marginTop: '3px', textTransform: 'capitalize' }}>{metric}</div>
                </div>
              ))}
            </div>

            {evaluation.whatFailed?.length > 0 && (
              <div style={{ padding: '14px', background: '#fff7f7', borderRadius: '10px', marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>WHAT FAILED</p>
                {evaluation.whatFailed.map((f: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#dc2626', flexShrink: 0 }}>✗</span>
                    <p style={{ fontSize: '13px', color: '#09090b' }}>{f}</p>
                  </div>
                ))}
              </div>
            )}

            {evaluation.whatWorked?.length > 0 && (
              <div style={{ padding: '14px', background: 'rgba(22,163,74,0.06)', borderRadius: '10px', marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '8px' }}>WHAT WORKED</p>
                {evaluation.whatWorked.map((w: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>
                    <p style={{ fontSize: '13px', color: '#09090b' }}>{w}</p>
                  </div>
                ))}
              </div>
            )}

            {evaluation.delta && (
              <div style={{ padding: '14px', background: '#f8f8f9', borderRadius: '10px', marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', marginBottom: '8px' }}>WHAT TO CHANGE</p>
                <p style={{ fontSize: '13px', color: '#09090b', marginBottom: '6px' }}><strong>What you communicated:</strong> {evaluation.delta.whatYouSaid}</p>
                <p style={{ fontSize: '13px', color: '#09090b', marginBottom: '6px' }}><strong>What needs to change:</strong> {evaluation.delta.whatShouldChange}</p>
                <p style={{ fontSize: '13px', color: '#6366f1' }}><strong>Why it matters:</strong> {evaluation.delta.whyItMatters}</p>
              </div>
            )}

            {evaluation.rewrite && (
              <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '8px' }}>✓ HIREABLE VERSION</p>
                <p style={{ fontSize: '13px', color: '#14532d', lineHeight: '1.7', fontStyle: 'italic' }}>"{evaluation.rewrite}"</p>
              </div>
            )}

            <p style={{ fontSize: '13px', color: '#6366f1', fontWeight: 500, marginBottom: '16px' }}>💡 {evaluation.keyLesson}</p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePressureMode}
                disabled={isPressuring}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                  background: '#18181b', color: 'white', fontSize: '14px', fontWeight: 500,
                  padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                }}
              >
                {isPressuring ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : <><Zap size={16} /> Enter Pressure Mode</>}
              </button>
              <button
                onClick={handleFinalScore}
                disabled={isFinalizing}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                  background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500,
                  padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                }}
              >
                {isFinalizing ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : <><Trophy size={16} /> Get Final Score</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4 — PRESSURE */}
      {!isLoading && phase === 'pressure' && pressureQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={16} style={{ color: '#dc2626' }} />
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Pressure Mode — {pressureQuestion.tone}
              </p>
            </div>

            <div style={{ background: '#18181b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#ffffff', lineHeight: '1.6' }}>"{pressureQuestion.pressureQuestion}"</p>
            </div>

            <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '10px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', marginBottom: '4px' }}>TRAP TO AVOID</p>
              <p style={{ fontSize: '13px', color: '#09090b' }}>{pressureQuestion.trapToAvoid}</p>
            </div>

            <textarea
              value={pressureAnswer}
              onChange={e => setPressureAnswer(e.target.value)}
              placeholder="Answer under pressure — be specific, don't panic..."
              style={{
                width: '100%', minHeight: '100px', padding: '14px', fontSize: '14px',
                borderRadius: '10px', border: '1px solid #e4e4e7', outline: 'none',
                color: '#09090b', background: '#ffffff', resize: 'vertical', lineHeight: '1.6',
                fontFamily: 'inherit', marginBottom: '16px',
              }}
            />

            <div style={{ padding: '12px', background: 'rgba(22,163,74,0.06)', borderRadius: '10px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '4px' }}>STRONG RESPONSE LOOKS LIKE</p>
              <p style={{ fontSize: '13px', color: '#09090b' }}>{pressureQuestion.strongResponse}</p>
            </div>

            <button
              onClick={handleFinalScore}
              disabled={isFinalizing}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500,
                padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', width: '100%',
              }}
            >
              {isFinalizing ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating final score...</> : <><Trophy size={16} /> Complete Session — Get Final Score</>}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 5 — FINAL SCORE */}
      {!isLoading && phase === 'score' && finalScore && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: finalScore.readyForInterview ? 'rgba(22,163,74,0.04)' : '#fff7f7',
            border: `1px solid ${finalScore.readyForInterview ? 'rgba(22,163,74,0.2)' : '#fecaca'}`,
            borderRadius: '16px', padding: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Trophy size={18} style={{ color: finalScore.readyForInterview ? '#16a34a' : '#dc2626' }} />
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>War Room Complete — {skill}</p>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 600, color: '#09090b', marginBottom: '8px', lineHeight: '1.5' }}>{finalScore.verdict}</p>
              <span style={{
                fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: 500,
                background: finalScore.readyForInterview ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                color: finalScore.readyForInterview ? '#16a34a' : '#dc2626',
              }}>{finalScore.readinessLevel?.replace('_', ' ')}</span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '64px', fontWeight: 700, color: scoreColor(finalScore.finalScore ?? 0), fontFamily: 'var(--font-geist-mono), monospace', lineHeight: 1, letterSpacing: '-2px' }}>
                {finalScore.finalScore ?? 0}
              </div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>final score</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {finalScore.topStrengths?.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Top Strengths</p>
                {finalScore.topStrengths.map((s: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={14} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '13px', color: '#09090b' }}>{s}</p>
                  </div>
                ))}
              </div>
            )}
            {finalScore.criticalWeaknesses?.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Critical Weaknesses</p>
                {finalScore.criticalWeaknesses.map((w: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '13px', color: '#09090b' }}>{w}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Target size={16} style={{ color: '#6366f1' }} />
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next Steps</p>
            </div>
            {finalScore.nextSteps?.map((step: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{i + 1}</span>
                <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.6' }}>{step}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#f8f8f9', borderRadius: '12px', padding: '16px', marginBottom: '8px' }}>
            <p style={{ fontSize: '13px', color: '#71717a' }}>
              <strong style={{ color: '#09090b' }}>Hiring outcome:</strong> {finalScore.hiringOutcome}
            </p>
            <p style={{ fontSize: '13px', color: '#71717a', marginTop: '6px' }}>
              <strong style={{ color: '#09090b' }}>Estimated prep time needed:</strong> {finalScore.estimatedPrepTimeNeeded}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/training/warroom" style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
              background: '#ffffff', color: '#09090b', fontSize: '14px', fontWeight: 500,
              padding: '12px 24px', borderRadius: '10px', border: '1px solid #e4e4e7', textDecoration: 'none',
            }}>
              Train Another Skill
            </Link>
            <button
              onClick={handleRestart}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500,
                padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} /> Retrain This Skill
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}