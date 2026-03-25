'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import { ResumeAnalysis } from '@/lib/ai/schemas/resume'

export default function ResumeUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported')
      return
    }
    setError(null)
    setIsLoading(true)
    setFileName(file.name)

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

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '26px',
          fontWeight: 600,
          color: '#09090b',
          letterSpacing: '-0.5px',
          marginBottom: '6px',
        }}>My Resume</h2>
        <p style={{ fontSize: '14px', color: '#71717a' }}>
          Upload your resume and get an AI-powered analysis in seconds.
        </p>
      </div>

      {/* Upload Zone */}
      {!analysis && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#6366f1' : '#e4e4e7'}`,
            borderRadius: '16px',
            padding: '64px 32px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? 'rgba(99,102,241,0.04)' : '#ffffff',
            transition: 'all 0.2s ease',
            marginBottom: '24px',
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
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b' }}>
                Analyzing your resume...
              </p>
              <p style={{ fontSize: '13px', color: '#71717a' }}>
                Claude AI is evaluating your profile. This takes 15-30 seconds.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'rgba(99,102,241,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px',
              }}>
                <Upload size={24} style={{ color: '#6366f1' }} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b' }}>
                Drop your resume here or click to upload
              </p>
              <p style={{ fontSize: '13px', color: '#71717a' }}>PDF only — max 5MB</p>
              {fileName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f4f4f5',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  marginTop: '8px',
                }}>
                  <FileText size={14} style={{ color: '#6366f1' }} />
                  <span style={{ fontSize: '13px', color: '#09090b' }}>{fileName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Upload another */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} style={{ color: '#16a34a' }} />
              <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: 500 }}>
                Analysis complete — {fileName}
              </span>
            </div>
            <button
              onClick={() => { setAnalysis(null); setFileName(null) }}
              style={{
                fontSize: '13px',
                color: '#6366f1',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Upload new resume
            </button>
          </div>

          {/* Score + Role Banner */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '40px',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}>Primary Role</p>
              <p style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#09090b',
                letterSpacing: '-0.4px',
                marginBottom: '8px',
              }}>{analysis.primaryRole}</p>
              <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '16px' }}>
                {analysis.seniorityLevel.charAt(0).toUpperCase() + analysis.seniorityLevel.slice(1)} level · {analysis.yearsOfExperience} years of experience
              </p>
              <div style={{
                height: '4px',
                background: '#f4f4f5',
                borderRadius: '2px',
                width: '100%',
                maxWidth: '400px',
                overflow: 'hidden',
                marginBottom: '8px',
              }}>
                <div style={{
                  height: '4px',
                  background: scoreColor(analysis.interviewReadiness.score),
                  borderRadius: '2px',
                  width: `${analysis.interviewReadiness.score}%`,
                }} />
              </div>
              <p style={{ fontSize: '13px', color: '#71717a' }}>
                {analysis.interviewReadiness.reason}
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '72px',
                fontWeight: 600,
                color: scoreColor(analysis.interviewReadiness.score),
                lineHeight: 1,
                letterSpacing: '-3px',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}>{analysis.interviewReadiness.score}</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>readiness score</div>
              <div style={{
                marginTop: '8px',
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 500,
                background: scoreColor(analysis.interviewReadiness.score) === '#16a34a'
                  ? 'rgba(22,163,74,0.08)' : scoreColor(analysis.interviewReadiness.score) === '#d97706'
                  ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                color: scoreColor(analysis.interviewReadiness.score),
              }}>
                {analysis.interviewReadiness.level.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Positioning Statement */}
          <div style={{
            background: 'rgba(99,102,241,0.04)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}>Your Positioning Statement</p>
            <p style={{
              fontSize: '15px',
              color: '#09090b',
              lineHeight: '1.7',
              fontStyle: 'italic',
            }}>"{analysis.positioningStatement}"</p>
          </div>

          {/* Skills + Gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
              }}>Top Skills</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysis.skills.slice(0, 8).map((skill, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>{skill.name}</span>
                      <span style={{ fontSize: '11px', color: '#a1a1aa', marginLeft: '8px' }}>{skill.category}</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: skill.level === 'expert' ? 'rgba(99,102,241,0.08)'
                        : skill.level === 'advanced' ? 'rgba(22,163,74,0.08)'
                        : 'rgba(217,119,6,0.08)',
                      color: skill.level === 'expert' ? '#6366f1'
                        : skill.level === 'advanced' ? '#16a34a'
                        : '#d97706',
                    }}>{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
              }}>Critical Gaps</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysis.gaps.map((gap, i) => (
                  <div key={i} style={{
                    padding: '12px',
                    background: '#f8f8f9',
                    borderRadius: '10px',
                    borderLeft: `3px solid ${severityColor(gap.severity)}`,
                  }}>
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
          <div style={{
            background: '#fff7f7',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#dc2626',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}>Why You Might Fail This Interview</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysis.whyYouMightFail.map((reason, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <ChevronRight size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '14px', color: '#09090b', lineHeight: '1.6' }}>{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Predicted Questions */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#a1a1aa',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}>Top Predicted Questions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analysis.topPredictedQuestions.map((q, i) => (
                <div key={i} style={{
                  padding: '16px',
                  background: '#f8f8f9',
                  borderRadius: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#09090b', lineHeight: '1.5' }}>
                      {i + 1}. {q.question}
                    </p>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      flexShrink: 0,
                      background: difficultyColor(q.difficulty) === '#dc2626'
                        ? 'rgba(220,38,38,0.08)' : difficultyColor(q.difficulty) === '#d97706'
                        ? 'rgba(217,119,6,0.08)' : 'rgba(22,163,74,0.08)',
                      color: difficultyColor(q.difficulty),
                    }}>{q.difficulty}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#71717a' }}>{q.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Signals */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '40px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#a1a1aa',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}>Risk Signals</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analysis.riskSignals.map((risk, i) => (
                <div key={i} style={{
                  padding: '16px',
                  background: '#f8f8f9',
                  borderRadius: '10px',
                  borderLeft: `3px solid ${severityColor(risk.severity)}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>{risk.signal}</span>
                    <span style={{ fontSize: '11px', color: severityColor(risk.severity), fontWeight: 500 }}>{risk.severity}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#16a34a' }}>
                    💡 {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
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