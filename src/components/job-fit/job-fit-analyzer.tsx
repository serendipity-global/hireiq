'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Target, AlertTriangle, FileText, Zap, Clock } from 'lucide-react'

interface Props {
  hasResume: boolean
}

export default function JobFitAnalyzer({ hasResume }: Props) {
  const router = useRouter()
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [mode, setMode] = useState<'aggressive' | 'strategic'>('aggressive')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (!jobDescription.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/job-fit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, jobUrl, mode }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      router.push(`/job-fit/${data.jobFit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job fit')
      setIsLoading(false)
    }
  }

  if (!hasResume) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={{
          background: '#ffffff', border: '1px solid #e4e4e7',
          borderRadius: '16px', padding: '48px', textAlign: 'center',
        }}>
          <FileText size={32} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>
            No resume found
          </p>
          <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
            Upload your resume first before analyzing job fit.
          </p>
          <a href="/resume" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#6366f1', color: 'white', fontSize: '14px',
            fontWeight: 500, padding: '10px 20px', borderRadius: '10px',
            textDecoration: 'none',
          }}>
            Upload Resume
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '780px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.5px', marginBottom: '6px' }}>
          Analyze Job Fit
        </h2>
        <p style={{ fontSize: '14px', color: '#71717a' }}>
          Paste the job description below. We'll analyze how your resume aligns and exactly what to improve.
        </p>
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

      {/* Mode selector */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#09090b', marginBottom: '10px' }}>
          Application Mode
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setMode('aggressive')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px', border: '1px solid',
              borderColor: mode === 'aggressive' ? '#6366f1' : '#e4e4e7',
              background: mode === 'aggressive' ? 'rgba(99,102,241,0.06)' : '#ffffff',
              color: mode === 'aggressive' ? '#6366f1' : '#71717a',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Zap size={14} /> Aggressive
          </button>
          <button
            onClick={() => setMode('strategic')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px', border: '1px solid',
              borderColor: mode === 'strategic' ? '#6366f1' : '#e4e4e7',
              background: mode === 'strategic' ? 'rgba(99,102,241,0.06)' : '#ffffff',
              color: mode === 'strategic' ? '#6366f1' : '#71717a',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Clock size={14} /> Strategic
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '8px' }}>
          {mode === 'aggressive'
            ? 'Apply fast, high volume. Best when actively job hunting.'
            : 'Selective applications only. Best when currently employed.'}
        </p>
      </div>

      {/* Job URL */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>
          Job URL <span style={{ color: '#a1a1aa', fontWeight: 400 }}>(optional)</span>
        </p>
        <input
          type="url"
          value={jobUrl}
          onChange={e => setJobUrl(e.target.value)}
          placeholder="https://linkedin.com/jobs/..."
          style={{
            width: '100%', padding: '10px 14px', fontSize: '14px',
            border: '1px solid #e4e4e7', borderRadius: '10px',
            outline: 'none', color: '#09090b', background: '#ffffff',
            boxSizing: 'border-box', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Textarea */}
      <div style={{
        background: '#ffffff', border: '1px solid #e4e4e7',
        borderRadius: '16px', overflow: 'hidden', marginBottom: '16px',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f4f4f5',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Target size={16} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>Job Description</span>
          {jobDescription.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#a1a1aa' }}>
              {jobDescription.length} characters
            </span>
          )}
        </div>
        <textarea
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here — title, responsibilities, requirements, about the company..."
          style={{
            width: '100%', minHeight: '360px', padding: '20px',
            fontSize: '14px', lineHeight: '1.7', color: '#09090b',
            border: 'none', outline: 'none', resize: 'vertical',
            fontFamily: 'inherit', background: 'transparent',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Tips */}
      <div style={{
        background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)',
        borderRadius: '10px', padding: '14px 18px', marginBottom: '24px',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1', marginBottom: '6px' }}>
          TIPS FOR BEST RESULTS
        </p>
        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '13px', color: '#52525b', lineHeight: '1.8' }}>
          <li>Include the full job posting — title, responsibilities, and requirements</li>
          <li>The more context, the more precise the analysis</li>
          <li>We'll never suggest copying the JD — only reframing your real experience</li>
        </ul>
      </div>

      {/* Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading || jobDescription.trim().length < 100}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: isLoading || jobDescription.trim().length < 100 ? '#f4f4f5' : '#6366f1',
          color: isLoading || jobDescription.trim().length < 100 ? '#a1a1aa' : 'white',
          fontSize: '14px', fontWeight: 500, padding: '12px 28px',
          borderRadius: '10px', border: 'none',
          cursor: isLoading || jobDescription.trim().length < 100 ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading
          ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing fit...</>
          : <><Target size={15} /> Analyze Job Fit</>
        }
      </button>

      {isLoading && (
        <div style={{
          marginTop: '32px', background: '#ffffff', border: '1px solid #e4e4e7',
          borderRadius: '16px', padding: '40px', textAlign: 'center',
        }}>
          <Loader2 size={28} style={{ color: '#6366f1', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b', marginBottom: '6px' }}>
            Analyzing your fit for this role...
          </p>
          <p style={{ fontSize: '13px', color: '#71717a' }}>
            Claude is comparing your resume against the job description. This takes 20-40 seconds.
          </p>
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