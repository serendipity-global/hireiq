'use client'

import { useState } from 'react'
import {
  Target, Building2, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, ArrowLeft, Plus, Send, Phone, Trophy, XOctagon, Brain, Mic
} from 'lucide-react'
import Link from 'next/link'


interface Props {
  jobFit: {
    id: string
    job_title: string
    company: string
    fit_analysis: any
    created_at: string
    status?: string
    applied_at?: string
    job_url?: string
    mode?: string
    cover_letter?: string
  }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? '#16a34a' : value >= 50 ? '#d97706' : '#dc2626'
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: '#52525b' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: '6px', background: '#f4f4f5', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: color, borderRadius: '99px',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    critical: { bg: 'rgba(220,38,38,0.08)', color: '#dc2626' },
    moderate: { bg: 'rgba(217,119,6,0.08)', color: '#d97706' },
    minor: { bg: 'rgba(99,102,241,0.08)', color: '#6366f1' },
  }
  const s = map[severity] ?? map.minor
  return (
    <span style={{
      fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
      fontWeight: 500, background: s.bg, color: s.color,
    }}>
      {severity}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    high: { bg: 'rgba(220,38,38,0.08)', color: '#dc2626' },
    medium: { bg: 'rgba(217,119,6,0.08)', color: '#d97706' },
    low: { bg: '#f4f4f5', color: '#71717a' },
  }
  const s = map[priority] ?? map.low
  return (
    <span style={{
      fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
      fontWeight: 500, background: s.bg, color: s.color,
    }}>
      {priority} priority
    </span>
  )
}

function VerdictColor(verdict: string) {
  if (verdict === 'Strong Interview') return '#16a34a'
  if (verdict === 'Interview') return '#6366f1'
  if (verdict === 'Borderline') return '#d97706'
  return '#dc2626'
}

const STATUS_OPTIONS = [
  { value: 'analyzing', label: 'Analyzing', color: '#71717a', bg: '#f4f4f5', icon: Target },
  { value: 'applied', label: 'Applied', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', icon: Send },
  { value: 'interviewing', label: 'Interviewing', color: '#d97706', bg: 'rgba(217,119,6,0.08)', icon: Phone },
  { value: 'offer', label: 'Offer', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', icon: Trophy },
  { value: 'rejected', label: 'Rejected', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: XOctagon },
]

export default function JobFitResult({ jobFit }: Props) {
  const a = jobFit.fit_analysis
  const [expandedBullets, setExpandedBullets] = useState(false)
  const [expandedGaps, setExpandedGaps] = useState(false)
  const [status, setStatus] = useState(jobFit.status ?? 'analyzing')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [copied, setCopied] = useState(false)

  const fitLevelColor = () => {
    if (a.fitLevel === 'Excellent') return '#16a34a'
    if (a.fitLevel === 'Strong') return '#6366f1'
    if (a.fitLevel === 'Moderate') return '#d97706'
    return '#dc2626'
  }

  async function handleStatusChange(newStatus: string) {
    setUpdatingStatus(true)
    try {
      await fetch('/api/job-fit/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobFit.id,
          status: newStatus,
          applied_at: newStatus === 'applied' ? new Date().toISOString() : undefined,
        }),
      })
      setStatus(newStatus)
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div style={{ padding: '40px' }}>

      {/* Back */}
      <Link href="/job-fit" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', color: '#71717a', textDecoration: 'none', marginBottom: '24px',
      }}>
        <ArrowLeft size={14} /> Back to My Jobs
      </Link>

      {/* Hero card */}
      <div style={{
        background: '#ffffff', border: '1px solid #e4e4e7',
        borderRadius: '20px', padding: '32px', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>

          {/* Score */}
          <div style={{
            width: '100px', height: '100px', borderRadius: '20px',
            background: `rgba(${fitLevelColor() === '#16a34a' ? '22,163,74' : fitLevelColor() === '#6366f1' ? '99,102,241' : fitLevelColor() === '#d97706' ? '217,119,6' : '220,38,38'},0.08)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: '36px', fontWeight: 700, color: fitLevelColor(), lineHeight: 1 }}>
              {a.fitScore}
            </span>
            <span style={{ fontSize: '12px', color: fitLevelColor(), fontWeight: 500 }}>
              {a.fitLevel}
            </span>
          </div>

          {/* Details */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.4px' }}>
                {jobFit.job_title}
              </h2>
              <span style={{
                fontSize: '13px', fontWeight: 600,
                color: VerdictColor(a.hiringVerdict),
                padding: '3px 10px', borderRadius: '20px',
                background: `${VerdictColor(a.hiringVerdict)}18`,
              }}>
                {a.hiringVerdict}
              </span>
              {jobFit.mode && (
                <span style={{
                  fontSize: '11px', fontWeight: 500,
                  color: jobFit.mode === 'aggressive' ? '#6366f1' : '#71717a',
                  padding: '2px 8px', borderRadius: '20px',
                  background: jobFit.mode === 'aggressive' ? 'rgba(99,102,241,0.08)' : '#f4f4f5',
                }}>
                  {jobFit.mode === 'aggressive' ? '⚡ Aggressive' : '🕐 Strategic'}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={13} style={{ color: '#a1a1aa' }} />
                <span style={{ fontSize: '14px', color: '#71717a' }}>{jobFit.company}</span>
              </div>
              {jobFit.job_url && (
                <a href={jobFit.job_url} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: '13px', color: '#6366f1', textDecoration: 'none',
                }}>
                  View posting →
                </a>
              )}
            </div>
            <p style={{ fontSize: '14px', color: '#52525b', lineHeight: '1.7', marginBottom: '16px' }}>
              {a.fitSummary}
            </p>
            <p style={{
              fontSize: '13px', fontStyle: 'italic',
              color: VerdictColor(a.hiringVerdict), fontWeight: 500,
            }}>
              "{a.hiringVerdictReason}"
            </p>
          </div>
        </div>

        {/* Status tracker */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f4f4f5' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '12px' }}>
            APPLICATION STATUS
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(opt => {
              const Icon = opt.icon
              const isActive = status === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={updatingStatus}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px', border: '1px solid',
                    borderColor: isActive ? opt.color : '#e4e4e7',
                    background: isActive ? opt.bg : '#ffffff',
                    color: isActive ? opt.color : '#71717a',
                    fontSize: '13px', fontWeight: isActive ? 600 : 400,
                    cursor: updatingStatus ? 'not-allowed' : 'pointer',
                    opacity: updatingStatus ? 0.6 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={13} />
                  {opt.label}
                </button>
              )
            })}
          </div>
          {status === 'applied' && jobFit.applied_at && (
            <p style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '8px' }}>
              Applied {new Date(jobFit.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Interview Training CTA */}
        {/* Interview Training + Copilot CTAs */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f4f4f5' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href={`/job-fit/${jobFit.id}/training`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#18181b', color: 'white',
                fontSize: '14px', fontWeight: 500,
                padding: '10px 20px', borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              <Brain size={15} /> Interview Training
            </Link>
            <Link
              href={`/job-fit/${jobFit.id}/copilot`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(99,102,241,0.08)', color: '#6366f1',
                fontSize: '14px', fontWeight: 500,
                padding: '10px 20px', borderRadius: '10px',
                textDecoration: 'none', border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <Mic size={15} /> Interview Copilot
            </Link>
          </div>
          <p style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '8px' }}>
            Training: 3 levels · 9 questions &nbsp;·&nbsp; Copilot: real-time AI assistance during your interview
          </p>
        </div>  


        {/* Interview probability */}
        <div style={{
          marginTop: '20px', paddingTop: '20px',
          borderTop: '1px solid #f4f4f5',
          display: 'flex', gap: '24px', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>
              INTERVIEW PROBABILITY (NOW)
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '8px', background: '#f4f4f5', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${a.interviewProbability}%`, background: '#dc2626', borderRadius: '99px' }} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626' }}>{a.interviewProbability}%</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>
              AFTER OPTIMIZATION
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '8px', background: '#f4f4f5', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${a.afterOptimizationProbability}%`, background: '#16a34a', borderRadius: '99px' }} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#16a34a' }}>{a.afterOptimizationProbability}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown + Skill match */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '16px' }}>SCORE BREAKDOWN</p>
          <ScoreBar label="Skills" value={a.scoreBreakdown?.skills ?? 0} />
          <ScoreBar label="Experience" value={a.scoreBreakdown?.experience ?? 0} />
          <ScoreBar label="Seniority" value={a.scoreBreakdown?.seniority ?? 0} />
          <ScoreBar label="Keywords (ATS)" value={a.scoreBreakdown?.keywords ?? 0} />
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '16px' }}>SKILL MATCH</p>
          {[
            { label: 'Matched', skills: a.skillMatch?.matched ?? [], color: '#16a34a', icon: '✓' },
            { label: 'Partial', skills: a.skillMatch?.partial ?? [], color: '#d97706', icon: '~' },
            { label: 'Missing', skills: a.skillMatch?.missing ?? [], color: '#dc2626', icon: '✗' },
          ].map(({ label, skills, color, icon }) => (
            <div key={label} style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color, marginBottom: '6px' }}>
                {icon} {label} ({skills.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {skills.slice(0, 8).map((s: string, i: number) => (
                  <span key={i} style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                    background: `${color}12`, color, border: `1px solid ${color}30`,
                  }}>{s}</span>
                ))}
                {skills.length > 8 && (
                  <span style={{ fontSize: '11px', color: '#a1a1aa' }}>+{skills.length - 8} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Positioning */}
      {a.positioning?.gap && (
        <div style={{ background: '#18181b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
            POSITIONING ANALYSIS
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>HOW MARKET SEES YOU</p>
              <p style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: 500 }}>{a.positioning.levelPerceived}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>ROLE TARGETS</p>
              <p style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: 500 }}>{a.positioning.levelTarget}</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6' }}>{a.positioning.gap}</p>
        </div>
      )}

      {/* Strengths */}
      {a.strengths?.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '16px' }}>
            ✅ STRENGTHS ({a.strengths.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {a.strengths.map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#09090b', marginBottom: '2px' }}>{s.area}</p>
                  <p style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.6' }}>{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {a.improvements?.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '16px' }}>
            ⚠️ IMPROVEMENTS NEEDED ({a.improvements.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {a.improvements.map((imp: any, i: number) => (
              <div key={i} style={{ padding: '16px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f4f4f5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>{imp.section}</span>
                  <PriorityBadge priority={imp.priority} />
                </div>
                <p style={{ fontSize: '13px', color: '#dc2626', marginBottom: '6px', lineHeight: '1.6' }}>{imp.issue}</p>
                <p style={{ fontSize: '13px', color: '#16a34a', lineHeight: '1.6' }}>→ {imp.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bullet rewrites */}
      {a.bulletRewrites?.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div
            onClick={() => setExpandedBullets(!expandedBullets)}
            style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>✏️ BULLET REWRITES ({a.bulletRewrites.length})</p>
            {expandedBullets ? <ChevronUp size={16} style={{ color: '#a1a1aa' }} /> : <ChevronDown size={16} style={{ color: '#a1a1aa' }} />}
          </div>
          {expandedBullets && (
            <div style={{ borderTop: '1px solid #f4f4f5', padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {a.bulletRewrites.map((b: any, i: number) => (
                  <div key={i} style={{ padding: '16px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f4f4f5' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '4px' }}>ORIGINAL</p>
                      <p style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.6', textDecoration: 'line-through' }}>{b.original}</p>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '4px' }}>REWRITTEN</p>
                      <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.6' }}>{b.rewritten}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#71717a', fontStyle: 'italic' }}>{b.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gaps */}
      {a.gaps?.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div
            onClick={() => setExpandedGaps(!expandedGaps)}
            style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>❌ GAPS ({a.gaps.length})</p>
            {expandedGaps ? <ChevronUp size={16} style={{ color: '#a1a1aa' }} /> : <ChevronDown size={16} style={{ color: '#a1a1aa' }} />}
          </div>
          {expandedGaps && (
            <div style={{ borderTop: '1px solid #f4f4f5', padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {a.gaps.map((g: any, i: number) => (
                  <div key={i} style={{ padding: '16px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f4f4f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <XCircle size={14} style={{ color: '#dc2626', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>{g.requirement}</span>
                      <SeverityBadge severity={g.severity} />
                    </div>
                    <p style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.6', marginBottom: '6px' }}>{g.gap}</p>
                    <p style={{ fontSize: '12px', color: '#71717a', fontStyle: 'italic' }}>💡 {g.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATS Warnings */}
      {a.atsWarnings?.length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', marginBottom: '12px' }}>🤖 ATS WARNINGS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {a.atsWarnings.map((w: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>{w}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    {/* War Room Bridge */}
      {(a.skillMatch?.missing?.length > 0 || a.skillMatch?.partial?.length > 0) && (
        <div style={{ background: '#18181b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
              ⚔️ INTERVIEW PREP — SKILL GAPS DETECTED
            </p>
          </div>
          <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '20px' }}>
            Train these skills in the War Room before your interview. Ranked by gap severity.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ...(a.skillMatch?.missing ?? []).map((s: string) => ({ name: s, type: 'missing' })),
              ...(a.skillMatch?.partial ?? []).map((s: string) => ({ name: s, type: 'partial' })),
            ].slice(0, 6).map((skill: any, i: number) => (
              <Link
                key={i}
                href={`/training/warroom/${encodeURIComponent(skill.name)}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: '10px', border: '1px solid',
                  borderColor: skill.type === 'missing' ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)',
                  background: skill.type === 'missing' ? 'rgba(220,38,38,0.06)' : 'rgba(217,119,6,0.06)',
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                      background: skill.type === 'missing' ? 'rgba(220,38,38,0.15)' : 'rgba(217,119,6,0.15)',
                      color: skill.type === 'missing' ? '#dc2626' : '#d97706',
                    }}>
                      {skill.type === 'missing' ? 'Missing' : 'Partial'}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#e4e4e7' }}>{skill.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 500 }}>
                    Train → 
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cover Letter */}
      {jobFit.cover_letter && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #f4f4f5',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>📝 COVER LETTER</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(jobFit.cover_letter!)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px', border: '1px solid #e4e4e7',
                background: copied ? 'rgba(22,163,74,0.08)' : '#ffffff',
                color: copied ? '#16a34a' : '#71717a',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '14px', color: '#09090b', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {jobFit.cover_letter}
            </p>
          </div>
        </div>
      )}

      {/* Analyze another */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
        <Link href="/job-fit/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#6366f1', color: 'white', fontSize: '14px',
          fontWeight: 500, padding: '12px 28px', borderRadius: '10px',
          textDecoration: 'none',
        }}>
          <Plus size={15} /> Analyze Another Job
        </Link>
      </div>
    </div>
  )
}