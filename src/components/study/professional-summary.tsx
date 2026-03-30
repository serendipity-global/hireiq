'use client'

import { useState } from 'react'
import { Loader2, FileText, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

interface Props {
  savedAnalysis: any | null
}

function StrengthBadge({ strength }: { strength: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    strong: { bg: 'rgba(22,163,74,0.08)', color: '#16a34a' },
    moderate: { bg: 'rgba(217,119,6,0.08)', color: '#d97706' },
    weak: { bg: 'rgba(220,38,38,0.08)', color: '#dc2626' },
  }
  const s = map[strength] ?? map.weak
  return (
    <span style={{
      fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
      fontWeight: 500, background: s.bg, color: s.color,
    }}>
      {strength}
    </span>
  )
}

function ScoreColor(score: number) {
  if (score >= 75) return '#16a34a'
  if (score >= 50) return '#d97706'
  return '#dc2626'
}

export default function ProfessionalSummaryAnalyzer({ savedAnalysis }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(savedAnalysis)

  async function handleAnalyze() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/study/summary', { method: 'POST' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze summary')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '32px', gap: '24px',
      }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '14px', color: '#71717a' }}>
            Your summary analyzed sentence by sentence. Know exactly what message you're sending to hiring managers.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
            background: isLoading ? '#f4f4f5' : '#6366f1',
            color: isLoading ? '#a1a1aa' : 'white',
            fontSize: '14px', fontWeight: 500, padding: '10px 20px',
            borderRadius: '10px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
            : analysis
              ? <><RefreshCw size={15} /> Re-analyze</>
              : <><FileText size={15} /> Analyze Summary</>
          }
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {isLoading && (
        <div style={{
          background: '#ffffff', border: '1px solid #e4e4e7',
          borderRadius: '16px', padding: '48px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <Loader2 size={32} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b' }}>
            Analyzing your professional summary...
          </p>
          <p style={{ fontSize: '13px', color: '#71717a' }}>
            Claude is reading your resume and breaking down every sentence.
          </p>
        </div>
      )}

      {!isLoading && !analysis && (
        <div style={{
          background: '#ffffff', border: '1px solid #e4e4e7',
          borderRadius: '16px', padding: '48px', textAlign: 'center',
        }}>
          <FileText size={32} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>
            No analysis yet
          </p>
          <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
            Analyze your professional summary to understand exactly what message you're sending.
          </p>
          <button
            onClick={handleAnalyze}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#6366f1', color: 'white', fontSize: '14px',
              fontWeight: 500, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            }}
          >
            <FileText size={15} /> Analyze Summary
          </button>
        </div>
      )}

      {!isLoading && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Score + Verdict */}
          <div style={{
            background: '#ffffff', border: '1px solid #e4e4e7',
            borderRadius: '16px', padding: '28px',
            display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '16px', flexShrink: 0,
              background: `${ScoreColor(analysis.overallScore)}12`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '30px', fontWeight: 700, color: ScoreColor(analysis.overallScore), lineHeight: 1 }}>
                {analysis.overallScore}
              </span>
              <span style={{ fontSize: '11px', color: ScoreColor(analysis.overallScore) }}>/100</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>
                Overall Assessment
              </p>
              <p style={{ fontSize: '14px', color: '#52525b', lineHeight: '1.7', marginBottom: '10px' }}>
                {analysis.overallVerdict}
              </p>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#6366f1', fontWeight: 500 }}>
                Key message to own: "{analysis.keyMessage}"
              </p>
            </div>
          </div>

          {/* Extracted summary */}
          {analysis.extractedSummary && (
            <div style={{
              background: '#f8f8f9', border: '1px solid #e4e4e7',
              borderRadius: '16px', padding: '24px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '12px' }}>
                YOUR CURRENT SUMMARY
              </p>
              <p style={{ fontSize: '14px', color: '#09090b', lineHeight: '1.8', fontStyle: 'italic' }}>
                "{analysis.extractedSummary}"
              </p>
            </div>
          )}

          {/* Sentence by sentence */}
          {analysis.sentenceAnalysis?.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '16px' }}>
                SENTENCE BY SENTENCE ANALYSIS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analysis.sentenceAnalysis.map((s: any, i: number) => (
                  <div key={i} style={{
                    padding: '16px', borderRadius: '12px',
                    background: s.strength === 'strong' ? 'rgba(22,163,74,0.04)' : s.strength === 'moderate' ? 'rgba(217,119,6,0.04)' : 'rgba(220,38,38,0.04)',
                    border: `1px solid ${s.strength === 'strong' ? 'rgba(22,163,74,0.15)' : s.strength === 'moderate' ? 'rgba(217,119,6,0.15)' : 'rgba(220,38,38,0.15)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 700, color: '#a1a1aa',
                        background: '#f4f4f5', padding: '2px 8px', borderRadius: '6px', flexShrink: 0,
                      }}>
                        #{i + 1}
                      </span>
                      <p style={{ fontSize: '14px', color: '#09090b', lineHeight: '1.6', fontStyle: 'italic', flex: 1 }}>
                        "{s.sentence}"
                      </p>
                      <StrengthBadge strength={s.strength} />
                    </div>

                    <p style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.6', marginBottom: s.issue ? '8px' : '0' }}>
                      <strong>What it signals:</strong> {s.whatItSays}
                    </p>

                    {s.issue && (
                      <p style={{ fontSize: '13px', color: '#dc2626', lineHeight: '1.6', marginBottom: s.suggestion ? '8px' : '0' }}>
                        <strong>Issue:</strong> {s.issue}
                      </p>
                    )}

                    {s.suggestion && (
                      <div style={{
                        marginTop: '10px', padding: '10px 14px',
                        background: 'rgba(99,102,241,0.06)', borderRadius: '8px',
                        border: '1px solid rgba(99,102,241,0.15)',
                      }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', marginBottom: '4px' }}>SUGGESTED REWRITE</p>
                        <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.6' }}>{s.suggestion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's working + Missing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {analysis.whatIsWorking?.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '16px' }}>
                  ✅ WHAT'S WORKING
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.whatIsWorking.map((w: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.6' }}>{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.whatIsMissing?.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '16px' }}>
                  ❌ WHAT'S MISSING
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.whatIsMissing.map((m: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <XCircle size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.6' }}>{m}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ATS Risks */}
          {analysis.atsRisks?.length > 0 && (
            <div style={{
              background: '#fff7ed', border: '1px solid #fed7aa',
              borderRadius: '16px', padding: '24px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', marginBottom: '12px' }}>
                🤖 ATS RISKS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.atsRisks.map((r: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewritten summary */}
          {analysis.rewrittenSummary && (
            <div style={{
              background: '#18181b', borderRadius: '16px', padding: '28px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                ✨ OPTIMIZED VERSION
              </p>
              <p style={{ fontSize: '15px', color: '#e4e4e7', lineHeight: '1.8', fontStyle: 'italic' }}>
                "{analysis.rewrittenSummary}"
              </p>
            </div>
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