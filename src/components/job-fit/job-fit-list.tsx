'use client'

import { useState } from 'react'
import { Target, Plus, Trash2, ChevronRight, Building2, Send, Phone, Trophy, XOctagon, Zap, Clock, Brain } from 'lucide-react'
import Link from 'next/link'

interface JobFit {
  id: string
  job_title: string
  company: string
  fit_analysis: any
  created_at: string
  status?: string
  mode?: string
  job_url?: string
}

interface Props {
  jobFits: JobFit[]
}

function fitLevelColor(level: string) {
  if (level === 'Excellent') return { bg: 'rgba(22,163,74,0.08)', color: '#16a34a' }
  if (level === 'Strong') return { bg: 'rgba(99,102,241,0.08)', color: '#6366f1' }
  if (level === 'Moderate') return { bg: 'rgba(217,119,6,0.08)', color: '#d97706' }
  return { bg: 'rgba(220,38,38,0.08)', color: '#dc2626' }
}

function verdictColor(verdict: string) {
  if (verdict === 'Strong Interview') return '#16a34a'
  if (verdict === 'Interview') return '#6366f1'
  if (verdict === 'Borderline') return '#d97706'
  return '#dc2626'
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  analyzing: { label: 'Analyzing', color: '#71717a', bg: '#f4f4f5', icon: Target },
  applied: { label: 'Applied', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', icon: Send },
  interviewing: { label: 'Interviewing', color: '#d97706', bg: 'rgba(217,119,6,0.08)', icon: Phone },
  offer: { label: 'Offer', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', icon: Trophy },
  rejected: { label: 'Rejected', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: XOctagon },
}

export default function JobFitList({ jobFits: initial }: Props) {
  const [jobFits, setJobFits] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await fetch('/api/job-fit', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setJobFits(prev => prev.filter(j => j.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  // Stats
  const total = jobFits.length
  const applied = jobFits.filter(j => j.status === 'applied').length
  const interviewing = jobFits.filter(j => j.status === 'interviewing').length
  const offers = jobFits.filter(j => j.status === 'offer').length

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '24px', gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            My Jobs
          </h2>
          <p style={{ fontSize: '14px', color: '#71717a' }}>
            {total === 0
              ? 'No jobs analyzed yet. Start by analyzing a job description.'
              : `${total} job${total !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <Link href="/job-fit/new" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#6366f1', color: 'white', fontSize: '14px',
          fontWeight: 500, padding: '10px 20px', borderRadius: '10px',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <Plus size={15} /> New Analysis
        </Link>
      </div>

      {/* Stats bar */}
      {total > 0 && (
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
        }}>
          {[
            { label: 'Total', value: total, color: '#09090b', bg: '#f4f4f5' },
            { label: 'Applied', value: applied, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Interviewing', value: interviewing, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
            { label: 'Offers', value: offers, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '12px 20px', borderRadius: '12px',
              background: stat.bg, display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
              <span style={{ fontSize: '13px', color: stat.color, fontWeight: 500 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {jobFits.length === 0 ? (
        <div style={{
          background: '#ffffff', border: '1px solid #e4e4e7',
          borderRadius: '16px', padding: '48px', textAlign: 'center',
        }}>
          <Target size={32} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>
            No jobs analyzed yet
          </p>
          <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
            Paste a job description and we'll tell you exactly how to position your resume for it.
          </p>
          <Link href="/job-fit/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#6366f1', color: 'white', fontSize: '14px',
            fontWeight: 500, padding: '10px 20px', borderRadius: '10px',
            textDecoration: 'none',
          }}>
            <Plus size={15} /> Analyze Your First Job
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jobFits.map(job => {
            const analysis = job.fit_analysis
            const level = fitLevelColor(analysis?.fitLevel ?? '')
            const score = analysis?.fitScore ?? 0
            const verdict = analysis?.hiringVerdict ?? ''
            const statusInfo = STATUS_MAP[job.status ?? 'analyzing'] ?? STATUS_MAP.analyzing
            const StatusIcon = statusInfo.icon
            const ModeIcon = job.mode === 'aggressive' ? Zap : Clock

            return (
              <div key={job.id} style={{
                background: '#ffffff', border: '1px solid #e4e4e7',
                borderRadius: '16px', overflow: 'hidden',
              }}>
                <div style={{
                  padding: '20px 24px', display: 'flex',
                  alignItems: 'center', gap: '16px',
                }}>
                  {/* Score */}
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: level.bg, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: level.color, lineHeight: 1 }}>
                      {score}
                    </span>
                    <span style={{ fontSize: '9px', color: level.color, fontWeight: 500 }}>/ 100</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#09090b' }}>
                        {job.job_title}
                      </p>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                        fontWeight: 500, background: level.bg, color: level.color,
                      }}>
                        {analysis?.fitLevel}
                      </span>
                      {/* Status badge */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                        fontWeight: 500, background: statusInfo.bg, color: statusInfo.color,
                      }}>
                        <StatusIcon size={10} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={12} style={{ color: '#a1a1aa' }} />
                        <span style={{ fontSize: '13px', color: '#71717a' }}>{job.company}</span>
                      </div>
                      <span style={{ fontSize: '13px', color: verdictColor(verdict), fontWeight: 500 }}>
                        {verdict}
                      </span>
                      {job.mode && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          fontSize: '11px', color: job.mode === 'aggressive' ? '#6366f1' : '#71717a',
                        }}>
                          <ModeIcon size={10} />
                          {job.mode === 'aggressive' ? 'Aggressive' : 'Strategic'}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                        {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={deleting === job.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '34px', height: '34px', borderRadius: '8px',
                        border: '1px solid #e4e4e7', background: '#ffffff',
                        cursor: 'pointer', color: '#a1a1aa',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <Link
                      href={`/job-fit/${job.id}/training`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', borderRadius: '8px',
                        background: '#18181b', color: 'white',
                        fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                      }}
                    >
                      <Brain size={13} /> Train
                    </Link>
                    <Link
                      href={`/job-fit/${job.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', borderRadius: '8px',
                        background: 'rgba(99,102,241,0.08)', color: '#6366f1',
                        fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                      }}
                    >
                      View <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}