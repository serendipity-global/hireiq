'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertTriangle, Copy, Check, ChevronDown, ChevronUp, Sparkles, Shield } from 'lucide-react'
import { ResumeOptimizer, ResumeSection } from '@/lib/ai/schemas/resume-optimizer-zod'

interface Props {
  savedOptimization: ResumeOptimizer | null
  primaryRole: string | null
}

export default function ResumeOptimizerComponent({ savedOptimization, primaryRole }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optimization, setOptimization] = useState<ResumeOptimizer | null>(savedOptimization)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))

  async function handleOptimize() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: primaryRole }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setOptimization(data.optimization)
      setExpandedSections(new Set([0]))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  function toggleSection(index: number) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const scoreColor = (score: number) => {
    if (score >= 85) return '#16a34a'
    if (score >= 70) return '#d97706'
    return '#dc2626'
  }

  const impactColor = (impact: string) => {
    if (impact === 'critical') return '#dc2626'
    if (impact === 'high') return '#d97706'
    if (impact === 'medium') return '#6366f1'
    return '#a1a1aa'
  }

  const levelBg = (level: string) => {
    if (level === 'strong') return { bg: 'rgba(22,163,74,0.08)', color: '#16a34a' }
    if (level === 'meets_bar') return { bg: 'rgba(217,119,6,0.08)', color: '#d97706' }
    return { bg: 'rgba(220,38,38,0.08)', color: '#dc2626' }
  }

  return (
    <div style={{ marginTop: '32px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: '16px', padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Sparkles size={18} style={{ color: '#a5b4fc' }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Resume Optimizer
            </p>
          </div>
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
            We rewrite your resume the way a hiring manager expects to read it.
          </p>
          <p style={{ fontSize: '13px', color: '#c7d2fe' }}>
            Section by section. Honest. Only changes what actually matters.
          </p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
            background: isLoading ? 'rgba(255,255,255,0.1)' : '#ffffff',
            color: isLoading ? '#a5b4fc' : '#1e1b4b',
            fontSize: '14px', fontWeight: 600, padding: '12px 24px',
            borderRadius: '10px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
            : optimization ? 'Re-analyze Resume' : 'Analyze & Optimize Resume'
          }
        </button>
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
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b' }}>Auditing your resume section by section...</p>
          <p style={{ fontSize: '13px', color: '#71717a' }}>This takes 30-60 seconds. Claude AI is reviewing every section like a hiring manager.</p>
        </div>
      )}

      {optimization && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Overall Score */}
          <div style={{
            background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Overall Resume Score
              </p>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '12px', lineHeight: '1.5' }}>
                {optimization.overallVerdict}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
                  background: levelBg(optimization.hiringSignal.level).bg,
                  color: levelBg(optimization.hiringSignal.level).color,
                }}>{optimization.hiringSignal.level.replace('_', ' ')}</span>
                <span style={{
                  fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
                  background: optimization.hiringSignal.risk === 'low' ? 'rgba(22,163,74,0.08)' : optimization.hiringSignal.risk === 'medium' ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                  color: optimization.hiringSignal.risk === 'low' ? '#16a34a' : optimization.hiringSignal.risk === 'medium' ? '#d97706' : '#dc2626',
                }}>{optimization.hiringSignal.risk} risk</span>
              </div>
              {optimization.hiringSignal.decision && (
                <p style={{ fontSize: '13px', color: '#6366f1', marginTop: '12px', fontStyle: 'italic' }}>
                  "{optimization.hiringSignal.decision}"
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '64px', fontWeight: 700,
                color: scoreColor(optimization.overallScore),
                fontFamily: 'var(--font-geist-mono), monospace',
                lineHeight: 1, letterSpacing: '-2px',
              }}>{optimization.overallScore}</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>/ 100</div>
            </div>
          </div>

          {/* ATS Compatibility */}
          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ATS Compatibility</p>
              <div style={{
                fontSize: '18px', fontWeight: 700, color: scoreColor(optimization.atsCompatibility.score),
                fontFamily: 'var(--font-geist-mono), monospace',
              }}>{optimization.atsCompatibility.score}/100</div>
            </div>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '12px' }}>{optimization.atsCompatibility.verdict}</p>
            {optimization.atsCompatibility.formattingRisks.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', marginBottom: '6px' }}>FORMATTING RISKS</p>
                {optimization.atsCompatibility.formattingRisks.map((risk, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#dc2626', flexShrink: 0 }}>✗</span>
                    <p style={{ fontSize: '12px', color: '#09090b' }}>{risk}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Priorities */}
          {optimization.topPriorities.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Top Priorities</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {optimization.topPriorities.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px', background: '#f8f8f9', borderRadius: '10px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                      background: impactColor(p.impact), display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white',
                    }}>{p.priority}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#09090b', marginBottom: '4px' }}>{p.action}</p>
                      <p style={{ fontSize: '12px', color: '#71717a' }}>{p.reason}</p>
                    </div>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 500, flexShrink: 0, alignSelf: 'flex-start',
                      background: `rgba(${impactColor(p.impact) === '#dc2626' ? '220,38,38' : impactColor(p.impact) === '#d97706' ? '217,119,6' : '99,102,241'},0.08)`,
                      color: impactColor(p.impact),
                    }}>{p.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Flags */}
          {optimization.warningFlags.length > 0 && (
            <div style={{ background: '#fff7f7', border: '1px solid #fecaca', borderRadius: '16px', padding: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Warning Flags</p>
              {optimization.warningFlags.map((flag, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '13px', color: '#09090b' }}>{flag}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Section by Section Analysis
            </p>

            {optimization.sections.map((section, index) => (
              <SectionCard
                key={index}
                section={section}
                index={index}
                isExpanded={expandedSections.has(index)}
                onToggle={() => toggleSection(index)}
                onCopy={handleCopy}
                copiedIndex={copiedIndex}
                scoreColor={scoreColor}
                levelBg={levelBg}
              />
            ))}
          </div>

          {/* Interview Bridge */}
          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Resume → Interview Bridge
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>RISKS</p>
                {optimization.interviewBridge.resumeToInterviewRisks.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ color: '#dc2626', flexShrink: 0 }}>→</span>
                    <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{r}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '8px' }}>STRONG TALKING POINTS</p>
                {optimization.interviewBridge.strongTalkingPoints.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>
                    <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{r}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', marginBottom: '8px' }}>NARRATIVE GAPS</p>
                {optimization.interviewBridge.narrativeGaps.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ color: '#d97706', flexShrink: 0 }}>⚠</span>
                    <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{r}</p>
                  </div>
                ))}
              </div>
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

function SectionCard({
  section, index, isExpanded, onToggle, onCopy, copiedIndex, scoreColor, levelBg
}: {
  section: ResumeSection
  index: number
  isExpanded: boolean
  onToggle: () => void
  onCopy: (text: string, index: number) => void
  copiedIndex: number | null
  scoreColor: (n: number) => string
  levelBg: (l: string) => { bg: string, color: string }
}) {
  const isCopied = copiedIndex === index

  return (
    <div style={{ background: '#ffffff', border: `1px solid ${section.doNotTouch ? 'rgba(22,163,74,0.2)' : section.needsImprovement ? '#e4e4e7' : '#e4e4e7'}`, borderRadius: '16px', overflow: 'hidden' }}>

      {/* Section Header — always visible */}
      <div
        onClick={onToggle}
        style={{
          padding: '20px 24px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          background: section.doNotTouch ? 'rgba(22,163,74,0.03)' : '#ffffff',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            {section.doNotTouch ? (
              <Shield size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
            ) : section.needsImprovement ? (
              <AlertTriangle size={15} style={{ color: '#d97706', flexShrink: 0 }} />
            ) : (
              <CheckCircle size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
            )}
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#09090b' }}>{section.sectionName}</p>
            {section.doNotTouch && (
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                DO NOT TOUCH
              </span>
            )}
            {section.needsImprovement && !section.doNotTouch && (
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                background: section.changeType === 'rewrite' ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)',
                color: section.changeType === 'rewrite' ? '#dc2626' : '#d97706',
              }}>
                {section.changeType}
              </span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#71717a' }}>{section.verdict}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: scoreColor(section.score), fontFamily: 'var(--font-geist-mono), monospace', lineHeight: 1 }}>
              {section.score}
            </div>
            <div style={{ fontSize: '10px', color: '#a1a1aa' }}>/ 100</div>
          </div>
          <span style={{
            fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500,
            background: levelBg(section.hiringSignal.level).bg,
            color: levelBg(section.hiringSignal.level).color,
          }}>{section.hiringSignal.level.replace('_', ' ')}</span>
          {isExpanded
            ? <ChevronUp size={16} style={{ color: '#a1a1aa' }} />
            : <ChevronDown size={16} style={{ color: '#a1a1aa' }} />
          }
        </div>
      </div>

      {/* Section Body — expanded */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid #f4f4f5', padding: '20px 24px' }}>

          {/* Original */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              ORIGINAL
            </p>
            <div style={{ background: '#f8f8f9', borderRadius: '10px', padding: '14px', border: '1px solid #e4e4e7' }}>
              <p style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {section.originalText}
              </p>
            </div>
          </div>

          {/* Do Not Touch */}
          {section.doNotTouch && (
            <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Shield size={14} style={{ color: '#16a34a' }} />
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>WHY NOT TO CHANGE THIS</p>
              </div>
              <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.6' }}>{section.doNotTouchReason}</p>
            </div>
          )}

          {/* Improved version */}
          {section.needsImprovement && section.improvedText && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    IMPROVED VERSION
                  </p>
                  <button
                    onClick={() => onCopy(section.improvedText, index)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: isCopied ? 'rgba(22,163,74,0.08)' : '#f4f4f5',
                      border: isCopied ? '1px solid rgba(22,163,74,0.2)' : '1px solid #e4e4e7',
                      borderRadius: '8px', padding: '5px 12px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 500,
                      color: isCopied ? '#16a34a' : '#52525b',
                    }}
                  >
                    {isCopied
                      ? <><Check size={13} /> Copied!</>
                      : <><Copy size={13} /> Copy</>
                    }
                  </button>
                </div>
                <div style={{ background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {section.improvedText}
                  </p>
                </div>
              </div>

              {section.changesSummary && (
                <div style={{ padding: '12px 14px', background: '#f8f8f9', borderRadius: '8px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', marginBottom: '4px' }}>WHAT CHANGED & WHY</p>
                  <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.6' }}>{section.changesSummary}</p>
                </div>
              )}
            </>
          )}

          {/* Keep as is */}
          {section.keepAsIs.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '6px' }}>KEEP AS IS</p>
              {section.keepAsIs.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>
                  <p style={{ fontSize: '12px', color: '#09090b' }}>{item}</p>
                </div>
              ))}
            </div>
          )}

          {/* Remove or rewrite */}
          {section.removeOrRewrite.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', marginBottom: '6px' }}>REMOVE OR REWRITE</p>
              {section.removeOrRewrite.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#dc2626', flexShrink: 0 }}>✗</span>
                  <p style={{ fontSize: '12px', color: '#09090b' }}>{item}</p>
                </div>
              ))}
            </div>
          )}

          {/* Interview risk */}
          {section.interviewRiskFromThisSection && (
            <div style={{ padding: '10px 12px', background: 'rgba(217,119,6,0.06)', borderRadius: '8px', borderLeft: '3px solid #d97706' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', marginBottom: '3px' }}>INTERVIEW RISK</p>
              <p style={{ fontSize: '12px', color: '#09090b', lineHeight: '1.5' }}>{section.interviewRiskFromThisSection}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}