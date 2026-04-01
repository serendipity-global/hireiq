'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Loader2, RefreshCw, ChevronRight,
  CheckCircle, XCircle, Trophy, Lock, Unlock
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  question: string
  topic: string
  hint: string
  difficulty: string
}

interface LevelData {
  name: string
  description: string
  questions: Question[]
}

interface Questions {
  level1: LevelData
  level2: LevelData
  level3: LevelData
}

interface Answer {
  question: string
  answer: string
  evaluation: any
  question_index: number
}

interface Props {
  jobFit: {
    id: string
    job_title: string
    company: string
    fit_analysis: any
    job_description: string
  }
  savedSession: any
}

const LEVEL_COLORS = {
  1: { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)', label: 'Fundamentals' },
  2: { color: '#d97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)', label: 'Applied' },
  3: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)', label: 'Scenario' },
}

function scoreColor(score: number) {
  if (score >= 75) return '#16a34a'
  if (score >= 60) return '#d97706'
  return '#dc2626'
}

function scoreLabel(score: number) {
  if (score >= 75) return 'Ready'
  if (score >= 60) return 'Borderline'
  return 'Not Ready'
}

export default function InterviewTraining({ jobFit, savedSession }: Props) {
  const router = useRouter()

  const [questions, setQuestions] = useState<Questions | null>(
    savedSession?.level1_questions ? {
      level1: savedSession.level1_questions,
      level2: savedSession.level2_questions,
      level3: savedSession.level3_questions,
    } : null
  )

  const [currentLevel, setCurrentLevel] = useState<number>(savedSession?.current_level ?? 1)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null)
  const [showHint, setShowHint] = useState(false)

  const [level1Answers, setLevel1Answers] = useState<Answer[]>(savedSession?.level1_answers ?? [])
  const [level2Answers, setLevel2Answers] = useState<Answer[]>(savedSession?.level2_answers ?? [])
  const [level3Answers, setLevel3Answers] = useState<Answer[]>(savedSession?.level3_answers ?? [])

  const [level1Score, setLevel1Score] = useState<number | null>(savedSession?.level1_score ?? null)
  const [level2Score, setLevel2Score] = useState<number | null>(savedSession?.level2_score ?? null)
  const [level3Score, setLevel3Score] = useState<number | null>(savedSession?.level3_score ?? null)

  const [level1Completed, setLevel1Completed] = useState(savedSession?.level1_completed ?? false)
  const [level2Completed, setLevel2Completed] = useState(savedSession?.level2_completed ?? false)
  const [level3Completed, setLevel3Completed] = useState(savedSession?.level3_completed ?? false)

  const [sessionCompleted, setSessionCompleted] = useState(savedSession?.session_completed ?? false)
  const [finalScore, setFinalScore] = useState<number | null>(savedSession?.final_score ?? null)

  const getLevelAnswers = (level: number) => {
    if (level === 1) return level1Answers
    if (level === 2) return level2Answers
    return level3Answers
  }

  const getLevelQuestions = (level: number): Question[] => {
    if (!questions) return []
    if (level === 1) return questions.level1.questions
    if (level === 2) return questions.level2.questions
    return questions.level3.questions
  }

  const getLevelData = (level: number): LevelData | null => {
    if (!questions) return null
    if (level === 1) return questions.level1
    if (level === 2) return questions.level2
    return questions.level3
  }

  async function handleGenerate(regenerate = false) {
    setIsGenerating(true)
    setCurrentEvaluation(null)
    setAnswer('')
    setCurrentQuestionIndex(0)
    try {
      const res = await fetch('/api/interview-training/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_fit_id: jobFit.id, regenerate }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setQuestions(data.questions)
      if (regenerate) {
        setCurrentLevel(1)
        setLevel1Answers([])
        setLevel2Answers([])
        setLevel3Answers([])
        setLevel1Score(null)
        setLevel2Score(null)
        setLevel3Score(null)
        setLevel1Completed(false)
        setLevel2Completed(false)
        setLevel3Completed(false)
        setSessionCompleted(false)
        setFinalScore(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim() || !questions) return
    setIsEvaluating(true)
    setCurrentEvaluation(null)

    const currentQuestions = getLevelQuestions(currentLevel)
    const currentQuestion = currentQuestions[currentQuestionIndex]

    try {
      const res = await fetch('/api/interview-training/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_fit_id: jobFit.id,
          question: currentQuestion.question,
          answer,
          level: currentLevel,
          question_index: currentQuestionIndex,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      const evaluation = data.evaluation
      setCurrentEvaluation(evaluation)

      const newAnswer: Answer = {
        question: currentQuestion.question,
        answer,
        evaluation,
        question_index: currentQuestionIndex,
      }

      if (currentLevel === 1) {
        const updated = [...level1Answers.filter(a => a.question_index !== currentQuestionIndex), newAnswer]
        setLevel1Answers(updated)
        if (updated.length >= 3) {
          const avg = Math.round(updated.reduce((s, a) => s + (a.evaluation?.score ?? 0), 0) / updated.length)
          setLevel1Score(avg)
          setLevel1Completed(true)
          if (avg >= 60) setCurrentLevel(2)
        }
      } else if (currentLevel === 2) {
        const updated = [...level2Answers.filter(a => a.question_index !== currentQuestionIndex), newAnswer]
        setLevel2Answers(updated)
        if (updated.length >= 3) {
          const avg = Math.round(updated.reduce((s, a) => s + (a.evaluation?.score ?? 0), 0) / updated.length)
          setLevel2Score(avg)
          setLevel2Completed(true)
          if (avg >= 60) setCurrentLevel(3)
        }
      } else {
        const updated = [...level3Answers.filter(a => a.question_index !== currentQuestionIndex), newAnswer]
        setLevel3Answers(updated)
        if (updated.length >= 3) {
          const avg = Math.round(updated.reduce((s, a) => s + (a.evaluation?.score ?? 0), 0) / updated.length)
          setLevel3Score(avg)
          setLevel3Completed(true)
          const fs = Math.round(((level1Score ?? 0) + (level2Score ?? 0) + avg) / 3)
          setFinalScore(fs)
          setSessionCompleted(true)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsEvaluating(false)
    }
  }

  function handleNextQuestion() {
    const currentQuestions = getLevelQuestions(currentLevel)
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAnswer('')
      setCurrentEvaluation(null)
      setShowHint(false)
    }
  }

  const isLevelUnlocked = (level: number) => {
    if (level === 1) return true
    if (level === 2) return level1Completed
    if (level === 3) return level2Completed
    return false
  }

  const currentQuestions = getLevelQuestions(currentLevel)
  const currentQuestion = currentQuestions[currentQuestionIndex]
  const currentLevelData = getLevelData(currentLevel)
  const currentAnswers = getLevelAnswers(currentLevel)
  const levelStyle = LEVEL_COLORS[currentLevel as keyof typeof LEVEL_COLORS]
  const alreadyAnswered = currentAnswers.find(a => a.question_index === currentQuestionIndex)

  // Empty state
  if (!questions && !isGenerating) {
    return (
      <div style={{ padding: '40px' }}>
        <Link href={'/job-fit/' + jobFit.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={14} /> Back to Job Analysis
        </Link>
        <div style={{ background: '#18181b', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          <Trophy size={40} style={{ color: '#6366f1', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
            Interview Training
          </h2>
          <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>
            {jobFit.job_title} — {jobFit.company}
          </p>
          <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '32px', lineHeight: '1.7' }}>
            3 levels · 3 questions each · Generated from this job description
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
            {[1, 2, 3].map(l => {
              const s = LEVEL_COLORS[l as keyof typeof LEVEL_COLORS]
              return (
                <div key={l} style={{ padding: '12px 20px', borderRadius: '10px', background: s.bg, border: '1px solid ' + s.border, textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: s.color, marginBottom: '4px' }}>LEVEL {l}</p>
                  <p style={{ fontSize: '13px', color: s.color, fontWeight: 500 }}>{s.label}</p>
                </div>
              )
            })}
          </div>
          <button
            onClick={() => handleGenerate(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: 'white', fontSize: '15px', fontWeight: 500, padding: '14px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
          >
            Generate Interview Questions
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (isGenerating) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: '#6366f1', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b', marginBottom: '6px' }}>Generating your interview questions...</p>
          <p style={{ fontSize: '13px', color: '#71717a' }}>Claude is analyzing the job description and your resume.</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // Session completed
  if (sessionCompleted && finalScore !== null) {
    return (
      <div style={{ padding: '40px' }}>
        <Link href={'/job-fit/' + jobFit.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={14} /> Back to Job Analysis
        </Link>
        <div style={{ background: '#18181b', borderRadius: '20px', padding: '32px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: 600 }}>TRAINING COMPLETE</p>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{jobFit.job_title}</h2>
            <p style={{ fontSize: '14px', color: '#71717a' }}>{jobFit.company}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '64px', fontWeight: 700, color: scoreColor(finalScore), lineHeight: 1, letterSpacing: '-2px', fontFamily: 'var(--font-geist-mono), monospace' }}>
              {finalScore}
            </div>
            <p style={{ fontSize: '13px', color: scoreColor(finalScore), fontWeight: 600 }}>{scoreLabel(finalScore)}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { level: 1, score: level1Score, label: 'Fundamentals' },
            { level: 2, score: level2Score, label: 'Applied' },
            { level: 3, score: level3Score, label: 'Scenario' },
          ].map(({ level, score, label }) => {
            const s = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
            return (
              <div key={level} style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: s.color, marginBottom: '8px' }}>LEVEL {level} — {label.toUpperCase()}</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: score !== null ? scoreColor(score) : '#a1a1aa', fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {score ?? '—'}
                </p>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleGenerate(true)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#ffffff', color: '#09090b', fontSize: '14px', fontWeight: 500, padding: '12px 24px', borderRadius: '10px', border: '1px solid #e4e4e7', cursor: 'pointer' }}
          >
            <RefreshCw size={15} /> Regenerate and Retry
          </button>
          <Link href={'/job-fit/' + jobFit.id} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500, padding: '12px 24px', borderRadius: '10px', textDecoration: 'none' }}>
            Back to Job Analysis
          </Link>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link href={'/job-fit/' + jobFit.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Job Analysis
        </Link>
        <button
          onClick={() => handleGenerate(true)}
          disabled={isGenerating}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a', background: 'none', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}
        >
          <RefreshCw size={13} /> Regenerate Questions
        </button>
      </div>

      {/* Level tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[1, 2, 3].map(l => {
          const s = LEVEL_COLORS[l as keyof typeof LEVEL_COLORS]
          const unlocked = isLevelUnlocked(l)
          const isActive = currentLevel === l
          const score = l === 1 ? level1Score : l === 2 ? level2Score : level3Score
          const completed = l === 1 ? level1Completed : l === 2 ? level2Completed : level3Completed

          return (
            <button
              key={l}
              onClick={() => unlocked && setCurrentLevel(l)}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid',
                borderColor: isActive ? s.color : '#e4e4e7',
                background: isActive ? s.bg : '#ffffff',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? 1 : 0.5,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                {unlocked
                  ? <Unlock size={12} style={{ color: isActive ? s.color : '#a1a1aa' }} />
                  : <Lock size={12} style={{ color: '#a1a1aa' }} />
                }
                <span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? s.color : '#a1a1aa' }}>
                  LEVEL {l}
                </span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: isActive ? s.color : '#52525b' }}>{s.label}</p>
              {completed && score !== null && (
                <p style={{ fontSize: '12px', color: scoreColor(score), fontWeight: 600, marginTop: '2px' }}>{score}/100</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Level info */}
      {currentLevelData && (
        <div style={{ background: levelStyle.bg, border: '1px solid ' + levelStyle.border, borderRadius: '12px', padding: '14px 18px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: levelStyle.color, marginBottom: '4px' }}>
            LEVEL {currentLevel} — {currentLevelData.name.toUpperCase()}
          </p>
          <p style={{ fontSize: '13px', color: '#52525b' }}>{currentLevelData.description}</p>
        </div>
      )}

      {/* Question progress */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {currentQuestions.map((_, i) => {
          const answered = currentAnswers.find(a => a.question_index === i)
          const isCurrent = i === currentQuestionIndex
          return (
            <button
              key={i}
              onClick={() => { setCurrentQuestionIndex(i); setAnswer(''); setCurrentEvaluation(null); setShowHint(false) }}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid',
                borderColor: isCurrent ? levelStyle.color : answered ? '#16a34a' : '#e4e4e7',
                background: isCurrent ? levelStyle.bg : answered ? 'rgba(22,163,74,0.06)' : '#ffffff',
                cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                color: isCurrent ? levelStyle.color : answered ? '#16a34a' : '#71717a',
              }}
            >
              Q{i + 1} {answered ? '✓' : ''}
            </button>
          )
        })}
      </div>

      {/* Current question */}
      {currentQuestion && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: levelStyle.bg, color: levelStyle.color }}>
              {currentQuestion.topic}
            </span>
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Question {currentQuestionIndex + 1} of 3</span>
          </div>

          <p style={{ fontSize: '17px', fontWeight: 500, color: '#09090b', lineHeight: '1.6', marginBottom: '20px' }}>
            {currentQuestion.question}
          </p>

          {!alreadyAnswered && (
            <>
              <button
                onClick={() => setShowHint(!showHint)}
                style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px', fontWeight: 500 }}
              >
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>

              {showHint && (
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1', marginBottom: '4px' }}>HINT</p>
                  <p style={{ fontSize: '13px', color: '#52525b' }}>{currentQuestion.hint}</p>
                </div>
              )}

              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here — be direct and specific..."
                style={{ width: '100%', minHeight: '120px', padding: '14px', fontSize: '14px', borderRadius: '10px', border: '1px solid #e4e4e7', outline: 'none', color: '#09090b', background: '#ffffff', resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />

              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || isEvaluating}
                style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%', background: answer.trim() ? '#6366f1' : '#f4f4f5', color: answer.trim() ? 'white' : '#a1a1aa', fontSize: '14px', fontWeight: 500, padding: '12px', borderRadius: '10px', border: 'none', cursor: answer.trim() ? 'pointer' : 'not-allowed' }}
              >
                {isEvaluating
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Evaluating...</>
                  : <>Submit Answer <ChevronRight size={15} /></>
                }
              </button>
            </>
          )}

          {/* Show previous answer if already answered */}
          {alreadyAnswered && !currentEvaluation && (
            <div style={{ background: '#f8f8f9', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>YOUR ANSWER</p>
              <p style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.6' }}>{alreadyAnswered.answer}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: scoreColor(alreadyAnswered.evaluation?.score ?? 0) }}>
                  {alreadyAnswered.evaluation?.score ?? 0}/100
                </span>
                <span style={{ fontSize: '12px', color: '#71717a' }}>{alreadyAnswered.evaluation?.verdict}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evaluation result */}
      {currentEvaluation && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>EVALUATION</p>
            <div style={{ fontSize: '32px', fontWeight: 700, color: scoreColor(currentEvaluation.score), fontFamily: 'var(--font-geist-mono), monospace' }}>
              {currentEvaluation.score}/100
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#09090b', fontWeight: 500, marginBottom: '16px', lineHeight: '1.6' }}>
            {currentEvaluation.verdict}
          </p>

          {currentEvaluation.what_worked?.length > 0 && (
            <div style={{ background: 'rgba(22,163,74,0.06)', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '8px' }}>WHAT WORKED</p>
              {currentEvaluation.what_worked.map((w: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <CheckCircle size={13} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '13px', color: '#09090b' }}>{w}</p>
                </div>
              ))}
            </div>
          )}

          {currentEvaluation.what_failed?.length > 0 && (
            <div style={{ background: '#fff7f7', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>WHAT FAILED</p>
              {currentEvaluation.what_failed.map((f: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <XCircle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '13px', color: '#09090b' }}>{f}</p>
                </div>
              ))}
            </div>
          )}

          {currentEvaluation.hireable_version && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '6px' }}>HIREABLE VERSION</p>
              <p style={{ fontSize: '13px', color: '#14532d', lineHeight: '1.7', fontStyle: 'italic' }}>"{currentEvaluation.hireable_version}"</p>
            </div>
          )}

          <p style={{ fontSize: '13px', color: '#6366f1', fontWeight: 500 }}>
            Key lesson: {currentEvaluation.key_lesson}
          </p>

          {currentQuestionIndex < 2 && (
            <button
              onClick={handleNextQuestion}
              style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%', background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
            >
              Next Question <ChevronRight size={15} />
            </button>
          )}

          {/* Level completion gate */}
          {currentQuestionIndex === 2 && (
            <div style={{ marginTop: '16px' }}>
              {(() => {
                const answers = getLevelAnswers(currentLevel)
                if (answers.length >= 3) {
                  const avg = Math.round(answers.reduce((s, a) => s + (a.evaluation?.score ?? 0), 0) / answers.length)
                  const passed = avg >= 60
                  const nextLevel = currentLevel + 1

                  return (
                    <div style={{ background: passed ? 'rgba(22,163,74,0.06)' : '#fff7f7', border: '1px solid', borderColor: passed ? 'rgba(22,163,74,0.2)' : '#fecaca', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '22px', fontWeight: 700, color: scoreColor(avg), marginBottom: '4px' }}>{avg}/100</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: passed ? '#16a34a' : '#dc2626', marginBottom: '8px' }}>
                        {passed ? 'Level Passed' : 'Not quite ready'}
                      </p>
                      <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
                        {avg >= 75
                          ? 'Excellent — you are ready for the next level'
                          : avg >= 60
                          ? 'Borderline — expect more difficulty ahead'
                          : 'Score below 60 — consider regenerating and retrying'}
                      </p>
                      {currentLevel < 3 && (
                        <button
                          onClick={() => { setCurrentLevel(nextLevel); setCurrentQuestionIndex(0); setAnswer(''); setCurrentEvaluation(null); setShowHint(false) }}
                          disabled={!passed}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: passed ? '#6366f1' : '#f4f4f5', color: passed ? 'white' : '#a1a1aa', fontSize: '14px', fontWeight: 500, padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: passed ? 'pointer' : 'not-allowed' }}
                        >
                          {passed ? <>Continue to Level {nextLevel} <ChevronRight size={15} /></> : <><Lock size={15} /> Score too low</>}
                        </button>
                      )}
                      {!passed && (
                        <button
                          onClick={() => handleGenerate(true)}
                          style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', color: '#6366f1', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer' }}
                        >
                          <RefreshCw size={13} /> Regenerate and Retry
                        </button>
                      )}
                    </div>
                  )
                }
                return null
              })()}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}