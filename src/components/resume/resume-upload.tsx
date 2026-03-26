'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle, ChevronRight, Brain, TrendingUp, Target, Zap, RefreshCw } from 'lucide-react'
import { ResumeAnalysis } from '@/lib/ai/schemas/resume'
import { InterviewDNA } from '@/lib/ai/schemas/interview-dna-zod'

interface Props {
  savedAnalysis: ResumeAnalysis | null
  savedDna: InterviewDNA | null
  savedFileName: string | null
  savedAt: string | null
}

export default function ResumeUpload({ savedAnalysis, savedDna, savedFileName, savedAt }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dnaLoading, setDnaLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(savedAnalysis)
  const [dna, setDna] = useState<InterviewDNA | null>(savedDna)
  const [fileName, setFileName] = useState<string | null>(savedFileName)
  const [showUpload, setShowUpload] = useState(!savedAnalysis)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported')
      return
    }
    setError(null)
    setIsLoading(true)
    setFileName(file.name)
    setDna(null)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      setAnalysis(data.analysis)
      setShowUpload(false)

      if (data.resume?.raw_text) {
        setDnaLoading(true)
        try {
          const dnaResponse = await fetch('/api/resume/interview-dna', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText: data.resume.raw_text }),
          })
          const dnaData = await dnaResponse.json()
          if (dnaData.success) setDna(dnaData.dna)
        } catch {
          console.error('DNA generation failed')
        } finally {
          setDnaLoading(false)
        }
      }

    } catch {
      setError('Failed to analyze resume. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const scoreColor = (score: number) => {
    if (score >= 75) return '#16a34a'
    if (score >= 50) return '#d97706'
    return '#dc2626'
  }

  const severityColor = (severity: string) => {
    if (severity === 'critical' || severity === 'high') return '#dc2626'
    if (severity === 'medium') return '#d97706'
    return '#16a34a'
  }

  const difficultyColor = (difficulty: string) => {
    if (difficulty === 'hard') return '#dc2626'
    if (difficulty === 'medium') return '#d97706'
    return '#16a34a'
  }

  const depthColor = (depth: string) => {
    if (depth === 'mastered') return '#6366f1'
    if (depth === 'practiced') return '#16a34a'
    if (depth === 'familiar') return '#d97706'
    return '#a1a1aa'
  }

  const impactColor = (impact: string) => {
    if (impact === 'critical') return '#dc2626'
    if (impact === 'high') return '#d97706'
    if (impact === 'medium') return '#6366f1'
    return '#a1a1aa'
  }

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{
            fontSize: '26px', fontWeight: 600, color: '#09090b',
            letterSpacing: '-0.5px', marginBottom: '6px',
          }}>My Resume</h2>
          <p style={{ fontSize: '14px', color: '#71717a' }}>
            {savedAt
              ? `Last analyzed: ${new Date(savedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
              : 'Upload your resume and get an AI-powered analysis in seconds.'}
          </p>
        </div>
        {analysis && !showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#ffffff', color: '#09090b', fontSize: '13px', fontWeight: 500,
              padding: '8px 16px', borderRadius: '10px', border: '1px solid #e4e4e7',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            Upload New Resume
          </button>
        )}
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#6366f1' : '#e4e4e7'}`,
            borderRadius: '16px', padding: '64px 32px', textAlign: 'center',
            cursor: 'pointer', background: isDragging ? 'rgba(99,102,241,0.04)' : '#ffffff',
            transition: 'all 0.2s ease', marginBottom: '24px',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 size={40} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b' }}>Analyzing your resume...</p>
              <p style={{ fontSize: '13px', color: '#71717a' }}>Claude AI is evaluating your profile. This takes 15-30 seconds.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'rgba(99,102,241,0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '4px',
              }}>
                <Upload size={24} style={{ color: '#6366f1' }} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b' }}>
                Drop your resume here or click to upload
              </p>
              <p style={{ fontSize: '13px', color: '#71717a' }}>PDF only — max 5MB</p>
              {fileName && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#f4f4f5', padding: '8px 14px', borderRadius: '8px', marginTop: '8px',
                }}>
                  <FileText size={14} style={{ color: '#6366f1' }} />
                  <span style={{ fontSize: '13px', color: '#09090b' }}>{fileName}</span>
                </div>
              )}
              {analysis && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowUpload(false) }}
                  style={{
                    marginTop: '8px', fontSize: '13px', color: '#6366f1',
                    background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  Cancel — keep current resume
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
          padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !showUpload && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Status bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <CheckCircle size={18} style={{ color: '#16a34a' }} />
            <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: 500 }}>
              {fileName ?? savedFileName}
            </span>
          </div>

          {/* Score + Role Banner */}
          <div style={{
            background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
            padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Primary Role</p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.4px', marginBottom: '8px' }}>{analysis.primaryRole}</p>
              <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '16px' }}>
                {analysis.seniorityLevel.charAt(0).toUpperCase() + analysis.seniorityLevel.slice(1)} level · {analysis.yearsOfExperience} years of experience
              </p>
              <div style={{ height: '4px', background: '#f4f4f5', borderRadius: '2px', width: '100%', maxWidth: '400px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '4px', background: scoreColor(analysis.interviewReadiness.score), borderRadius: '2px', width: `${analysis.interviewReadiness.score}%` }} />
              </div>
              <p style={{ fontSize: '13px', color: '#71717a' }}>{analysis.interviewReadiness.reason}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '72px', fontWeight: 600, color: scoreColor(analysis.interviewReadiness.score), lineHeight: 1, letterSpacing: '-3px', fontFamily: 'var(--font-geist-mono), monospace' }}>
                {analysis.interviewReadiness.score}
              </div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>readiness score</div>
              <div style={{
                marginTop: '8px', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                background: scoreColor(analysis.interviewReadiness.score) === '#16a34a' ? 'rgba(22,163,74,0.08)' : scoreColor(analysis.interviewReadiness.score) === '#d97706' ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                color: scoreColor(analysis.interviewReadiness.score),
              }}>
                {analysis.interviewReadiness.level.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Positioning Statement */}
          <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Your Positioning Statement</p>
            <p style={{ fontSize: '15px', color: '#09090b', lineHeight: '1.7', fontStyle: 'italic' }}>"{analysis.positioningStatement}"</p>
          </div>

          {/* DNA Loading */}
          {dnaLoading && (
            <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Loader2 size={24} style={{ color: '#6366f1', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b', marginBottom: '4px' }}>Building your Interview DNA...</p>
                <p style={{ fontSize: '13px', color: '#71717a' }}>Analyzing how hiring managers see you. This takes 20-40 seconds.</p>
              </div>
            </div>
          )}

          {/* DNA */}
          {dna && (
            <>
              <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '16px', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Brain size={20} style={{ color: '#a5b4fc' }} />
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interview DNA</p>
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.3px', marginBottom: '6px' }}>{dna.interviewPersona.firstImpression}</p>
                  <p style={{ fontSize: '13px', color: '#c7d2fe', lineHeight: '1.6' }}>{dna.interviewPersona.whatTheyNeedToHear}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: '#ffffff', lineHeight: 1, fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {dna.marketPosition.overallPercentile}<span style={{ fontSize: '18px', color: '#a5b4fc' }}>%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5b4fc', marginTop: '4px' }}>market percentile</div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#fbbf24', fontFamily: 'var(--font-geist-mono), monospace' }}>{dna.probabilityEngine.currentHireProbability}%</div>
                      <div style={{ fontSize: '10px', color: '#a5b4fc', marginTop: '2px' }}>now</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#34d399', fontFamily: 'var(--font-geist-mono), monospace' }}>{dna.probabilityEngine.afterPreparationProbability}%</div>
                      <div style={{ fontSize: '10px', color: '#a5b4fc', marginTop: '2px' }}>after prep</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Persona */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>How They See You</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', background: 'rgba(22,163,74,0.04)', borderRadius: '10px', borderLeft: '3px solid #16a34a' }}>
                      <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: 500, marginBottom: '4px' }}>PERCEIVED STRENGTH</p>
                      <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.5' }}>{dna.interviewPersona.perceivedStrength}</p>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(220,38,38,0.04)', borderRadius: '10px', borderLeft: '3px solid #dc2626' }}>
                      <p style={{ fontSize: '11px', color: '#dc2626', fontWeight: 500, marginBottom: '4px' }}>PERCEIVED WEAKNESS</p>
                      <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.5' }}>{dna.interviewPersona.perceivedWeakness}</p>
                    </div>
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Hiring Manager Concerns</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dna.interviewPersona.hiringManagerConcerns.map((concern, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <ChevronRight size={13} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.5' }}>{concern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skill Map */}
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Skill Map</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6366f1', background: 'rgba(99,102,241,0.08)', padding: '2px 8px', borderRadius: '6px' }}>{dna.skillMap.tier1.length} core</span>
                    <span style={{ fontSize: '11px', color: '#d97706', background: 'rgba(217,119,6,0.08)', padding: '2px 8px', borderRadius: '6px' }}>{dna.skillMap.tier2.length} supporting</span>
                    <span style={{ fontSize: '11px', color: '#a1a1aa', background: '#f4f4f5', padding: '2px 8px', borderRadius: '6px' }}>{dna.skillMap.tier3.length} other</span>
                  </div>
                </div>

                <p style={{ fontSize: '12px', fontWeight: 500, color: '#6366f1', marginBottom: '10px' }}>🔥 Core Skills — Train These First</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  {dna.skillMap.tier1.sort((a: any, b: any) => a.trainingPriority - b.trainingPriority).map((skill: any, i: number) => (
                    <div key={i} style={{ padding: '14px', background: '#f8f8f9', borderRadius: '10px', border: '1px solid #e4e4e7' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>{skill.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 500, background: `rgba(${depthColor(skill.depth) === '#6366f1' ? '99,102,241' : depthColor(skill.depth) === '#16a34a' ? '22,163,74' : '217,119,6'},0.08)`, color: depthColor(skill.depth) }}>{skill.depth}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: '#71717a', lineHeight: '1.4' }}>{skill.whyItMatters}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#a1a1aa' }}>{skill.category}</span>
                        <span style={{ fontSize: '10px', fontWeight: 500, color: impactColor(skill.hiringImpact) }}>{skill.hiringImpact} impact</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: '12px', fontWeight: 500, color: '#d97706', marginBottom: '10px' }}>🟡 Supporting Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {dna.skillMap.tier2.map((skill: any, i: number) => (
                    <span key={i} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: '#f4f4f5', color: '#52525b', border: '1px solid #e4e4e7' }}>{skill.name}</span>
                  ))}
                </div>

                <p style={{ fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '10px' }}>⚪ Other Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {dna.skillMap.tier3.map((skill: any, i: number) => (
                    <span key={i} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#fafafa', color: '#a1a1aa', border: '1px solid #f4f4f5' }}>{skill.name}</span>
                  ))}
                </div>
              </div>

              {/* Weakness Fingerprint */}
              <div style={{ background: '#fff7f7', border: '1px solid #fecaca', borderRadius: '16px', padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Weakness Fingerprint</p>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b', marginBottom: '16px', lineHeight: '1.5' }}>{dna.weaknessFingerprint.primaryPattern}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dna.weaknessFingerprint.specificFailPoints.map((point: any, i: number) => (
                    <div key={i} style={{ padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #fecaca' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#09090b', marginBottom: '6px' }}>⚡ {point.situation}</p>
                      <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px', lineHeight: '1.5' }}>{point.reason}</p>
                      <p style={{ fontSize: '12px', color: '#16a34a', lineHeight: '1.5' }}>✓ Fix: {point.fix}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Position */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Market Position by Role</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dna.marketPosition.byRole.map((role: any, i: number) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', color: '#09090b', fontWeight: 500 }}>{role.role}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: scoreColor(role.percentile), fontFamily: 'var(--font-geist-mono), monospace' }}>{role.percentile}%</span>
                        </div>
                        <div style={{ height: '4px', background: '#f4f4f5', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                          <div style={{ height: '4px', background: scoreColor(role.percentile), borderRadius: '2px', width: `${role.percentile}%` }} />
                        </div>
                        <p style={{ fontSize: '11px', color: '#71717a' }}>{role.verdict}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Salary Range</p>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 600, color: '#09090b', fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '-1px' }}>
                      ${dna.marketPosition.salaryRange.min.toLocaleString()} — ${dna.marketPosition.salaryRange.max.toLocaleString()}
                    </div>
                    <p style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>USD annually</p>
                  </div>
                  <div style={{ borderTop: '1px solid #e4e4e7', paddingTop: '16px' }}>
                    <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: 500, marginBottom: '4px' }}>ADVANTAGE</p>
                    <p style={{ fontSize: '12px', color: '#09090b', marginBottom: '12px', lineHeight: '1.5' }}>{dna.marketPosition.competitiveAdvantage}</p>
                    <p style={{ fontSize: '11px', color: '#dc2626', fontWeight: 500, marginBottom: '4px' }}>DISADVANTAGE</p>
                    <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{dna.marketPosition.competitiveDisadvantage}</p>
                  </div>
                </div>
              </div>

              {/* Battle Plan */}
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Target size={16} style={{ color: '#6366f1' }} />
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Battle Plan</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dna.battlePlan.sort((a: any, b: any) => a.priority - b.priority).map((item: any, i: number) => (
                    <div key={i} style={{ padding: '16px', background: '#f8f8f9', borderRadius: '10px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: item.impact === 'critical' ? '#dc2626' : item.impact === 'high' ? '#d97706' : '#6366f1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>{item.priority}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#09090b', marginBottom: '4px' }}>{item.action}</p>
                        <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '6px', lineHeight: '1.5' }}>{item.reason}</p>
                        <span style={{ fontSize: '11px', color: '#a1a1aa' }}>⏱ {item.timeToComplete}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Probability Engine */}
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Zap size={16} style={{ color: '#6366f1' }} />
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Probability Engine</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', padding: '20px', background: '#f8f8f9', borderRadius: '12px' }}>
                    <div style={{ fontSize: '48px', fontWeight: 700, color: '#d97706', fontFamily: 'var(--font-geist-mono), monospace', lineHeight: 1 }}>{dna.probabilityEngine.currentHireProbability}%</div>
                    <p style={{ fontSize: '12px', color: '#71717a', marginTop: '6px' }}>Current hire probability</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(22,163,74,0.04)', borderRadius: '12px', border: '1px solid rgba(22,163,74,0.15)' }}>
                    <div style={{ fontSize: '48px', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-geist-mono), monospace', lineHeight: 1 }}>{dna.probabilityEngine.afterPreparationProbability}%</div>
                    <p style={{ fontSize: '12px', color: '#71717a', marginTop: '6px' }}>After preparation</p>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>Key lever points:</p>
                  {dna.probabilityEngine.keyLeverPoints.map((point: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <TrendingUp size={13} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '13px', color: '#09090b' }}>{point}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#dc2626', marginBottom: '8px' }}>Deal breakers:</p>
                  {dna.probabilityEngine.dealBreakers.map((breaker: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <ChevronRight size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '13px', color: '#09090b' }}>{breaker}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Harsh Reality */}
              <div style={{ background: '#18181b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Harsh Reality</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dna.harshReality.map((truth: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#f59e0b', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>→</span>
                      <p style={{ fontSize: '14px', color: '#e4e4e7', lineHeight: '1.6' }}>{truth}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills + Gaps */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Top Skills</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analysis.skills.slice(0, 8).map((skill, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>{skill.name}</span>
                          <span style={{ fontSize: '11px', color: '#a1a1aa', marginLeft: '8px' }}>{skill.category}</span>
                        </div>
                        <span style={{
                          fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '6px',
                          background: skill.level === 'expert' ? 'rgba(99,102,241,0.08)' : skill.level === 'advanced' ? 'rgba(22,163,74,0.08)' : 'rgba(217,119,6,0.08)',
                          color: skill.level === 'expert' ? '#6366f1' : skill.level === 'advanced' ? '#16a34a' : '#d97706',
                        }}>{skill.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Critical Gaps</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {analysis.gaps.map((gap, i) => (
                      <div key={i} style={{ padding: '12px', background: '#f8f8f9', borderRadius: '10px', borderLeft: `3px solid ${severityColor(gap.severity)}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>{gap.area}</span>
                          <span style={{ fontSize: '11px', color: severityColor(gap.severity), fontWeight: 500 }}>{gap.severity}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#71717a', lineHeight: '1.5' }}>{gap.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Why You Might Fail */}
              <div style={{ background: '#fff7f7', border: '1px solid #fecaca', borderRadius: '16px', padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Why You Might Fail This Interview</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.whyYouMightFail.map((reason, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <ChevronRight size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '14px', color: '#09090b', lineHeight: '1.6' }}>{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predicted Questions */}
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Top Predicted Questions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysis.topPredictedQuestions.map((q, i) => (
                    <div key={i} style={{ padding: '16px', background: '#f8f8f9', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#09090b', lineHeight: '1.5' }}>{i + 1}. {q.question}</p>
                        <span style={{
                          fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '6px', flexShrink: 0,
                          background: difficultyColor(q.difficulty) === '#dc2626' ? 'rgba(220,38,38,0.08)' : difficultyColor(q.difficulty) === '#d97706' ? 'rgba(217,119,6,0.08)' : 'rgba(22,163,74,0.08)',
                          color: difficultyColor(q.difficulty),
                        }}>{q.difficulty}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#71717a' }}>{q.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Signals */}
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Risk Signals</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysis.riskSignals.map((risk, i) => (
                    <div key={i} style={{ padding: '16px', background: '#f8f8f9', borderRadius: '10px', borderLeft: `3px solid ${severityColor(risk.severity)}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>{risk.signal}</span>
                        <span style={{ fontSize: '11px', color: severityColor(risk.severity), fontWeight: 500 }}>{risk.severity}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#16a34a' }}>💡 {risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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