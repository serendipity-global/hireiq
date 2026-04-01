'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Mic, MicOff, Monitor, Phone, Loader2, Volume2, Copy, CheckCheck, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Props {
  jobFit: {
    id: string
    job_title: string
    company: string
    fit_analysis: any
    job_description: string
  }
  resumeText: string
}

type Mode = 'pc' | 'phone'
type Status = 'idle' | 'listening' | 'processing' | 'ready'

interface CopilotResponse {
  bullets: string[]
  full_response: string
  tone: string
  key_metric: string
}

export default function InterviewCopilot({ jobFit, resumeText }: Props) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [isActive, setIsActive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [response, setResponse] = useState<CopilotResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ question: string; response: CopilotResponse }[]>([])
  const [showFull, setShowFull] = useState(false)

  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const silenceTimerRef = useRef<any>(null)
  const lastTranscriptRef = useRef('')

  const generateResponse = useCallback(async (question: string) => {
    if (!question.trim() || question.trim().length < 10) return
    setStatus('processing')
    setResponse(null)
    setShowFull(false)

    try {
      const res = await fetch('/api/interview-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          jobTitle: jobFit.job_title,
          company: jobFit.company,
          jobDescription: jobFit.job_description,
          resumeText,
          fitAnalysis: jobFit.fit_analysis,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResponse(data.response)
      setHistory(prev => [{ question, response: data.response }, ...prev.slice(0, 4)])
      setStatus('ready')
    } catch (err) {
      setError('Failed to generate response. Try again.')
      setStatus('listening')
    }
  }, [jobFit, resumeText])

  const startRecognition = useCallback((stream?: MediaStream) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Use Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += text
        } else {
          interim += text
        }
      }

      if (final) {
        setTranscript(prev => {
          const updated = (prev + ' ' + final).trim()
          lastTranscriptRef.current = updated
          return updated
        })
        setInterimTranscript('')

        // Auto-generate after silence
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
          const q = lastTranscriptRef.current
          if (q && q.length > 10) {
            generateResponse(q)
            setTranscript('')
            lastTranscriptRef.current = ''
          }
        }, 2500)
      } else {
        setInterimTranscript(interim)
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return
      if (event.error === 'aborted') return
      setError('Microphone error: ' + event.error)
    }

    recognition.onend = () => {
      if (isActive) {
        try { recognition.start() } catch (e) {}
      }
    }

    recognitionRef.current = recognition

    if (stream) {
      const audioContext = new AudioContext()
      audioContext.createMediaStreamSource(stream)
    }

    recognition.start()
    setStatus('listening')
    setIsActive(true)
  }, [generateResponse, isActive])

  async function handleStart() {
    setError(null)
    setTranscript('')
    setInterimTranscript('')
    setResponse(null)

    try {
      if (mode === 'pc') {
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 44100,
          },
        })
        streamRef.current = stream
        stream.getVideoTracks()[0].stop()
        startRecognition(stream)
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          }
        })
        streamRef.current = stream
        startRecognition(stream)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Permission denied. Please allow microphone/screen access.')
      } else {
        setError('Failed to start. Check permissions and try again.')
      }
    }
  }

  function handleStop() {
    setIsActive(false)
    setStatus('idle')
    clearTimeout(silenceTimerRef.current)

    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
      recognitionRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }

    setInterimTranscript('')
  }

  function handleCopy() {
    if (!response) return
    navigator.clipboard.writeText(response.full_response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleManualSubmit() {
    if (transcript.trim().length > 10) {
      generateResponse(transcript.trim())
      setTranscript('')
      lastTranscriptRef.current = ''
    }
  }

  useEffect(() => {
    return () => {
      handleStop()
    }
  }, [])

  // Mode selection screen
  if (!mode) {
    return (
      <div style={{ padding: '40px' }}>
        <Link href={'/job-fit/' + jobFit.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a', textDecoration: 'none', marginBottom: '32px' }}>
          <ArrowLeft size={14} /> Back to Job Analysis
        </Link>

        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: '#18181b', borderRadius: '20px', padding: '40px', marginBottom: '24px' }}>
            <Volume2 size={36} style={{ color: '#6366f1', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
              Interview Copilot
            </h2>
            <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '4px' }}>
              {jobFit.job_title} — {jobFit.company}
            </p>
            <p style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.7' }}>
              Listens to your interviewer in real time and generates responses based on your experience and this job.
            </p>
          </div>

          <p style={{ fontSize: '14px', fontWeight: 500, color: '#09090b', marginBottom: '16px' }}>
            How are you taking the interview?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setMode('pc')}
              style={{ padding: '24px', borderRadius: '16px', border: '2px solid #e4e4e7', background: '#ffffff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.background = '#ffffff' }}
            >
              <Monitor size={32} style={{ color: '#6366f1', marginBottom: '12px' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', marginBottom: '4px' }}>Computer</p>
              <p style={{ fontSize: '12px', color: '#71717a' }}>Teams, Zoom, Google Meet</p>
              <p style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '8px' }}>Captures system audio</p>
            </button>

            <button
              onClick={() => setMode('phone')}
              style={{ padding: '24px', borderRadius: '16px', border: '2px solid #e4e4e7', background: '#ffffff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.background = '#ffffff' }}
            >
              <Phone size={32} style={{ color: '#6366f1', marginBottom: '12px' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', marginBottom: '4px' }}>Phone Call</p>
              <p style={{ fontSize: '12px', color: '#71717a' }}>Put phone on speaker</p>
              <p style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '8px' }}>Captures microphone</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link href={'/job-fit/' + jobFit.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Job Analysis
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => { handleStop(); setMode(null) }}
            style={{ fontSize: '12px', color: '#71717a', background: 'none', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}
          >
            Change Mode
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: '#18181b', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', fontWeight: 600 }}>
            INTERVIEW COPILOT — {mode === 'pc' ? 'COMPUTER MODE' : 'PHONE MODE'}
          </p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>{jobFit.job_title}</p>
          <p style={{ fontSize: '13px', color: '#71717a' }}>{jobFit.company}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {mode === 'pc' ? <Monitor size={20} style={{ color: '#6366f1' }} /> : <Phone size={20} style={{ color: '#6366f1' }} />}
          {isActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>Live</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Controls */}
      {!isActive ? (
        <div style={{ textAlign: 'center', padding: '32px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
            {mode === 'pc'
              ? 'Click Start to share your screen audio. Select the window running Teams/Zoom/Meet.'
              : 'Click Start and put your phone on speaker near your computer microphone.'}
          </p>
          <button
            onClick={handleStart}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#6366f1', color: 'white', fontSize: '15px', fontWeight: 600, padding: '14px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
          >
            <Mic size={18} /> Start Copilot
          </button>
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: status === 'listening' ? '#16a34a' : status === 'processing' ? '#d97706' : '#6366f1' }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>
                {status === 'listening' ? 'Listening...' : status === 'processing' ? 'Generating response...' : 'Ready'}
              </span>
            </div>
            <button
              onClick={handleStop}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              <MicOff size={14} /> Stop
            </button>
          </div>

          {/* Transcript */}
          <div style={{ background: '#f8f8f9', borderRadius: '10px', padding: '14px', minHeight: '60px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>HEARD</p>
            {(transcript || interimTranscript) ? (
              <p style={{ fontSize: '14px', color: '#09090b', lineHeight: '1.6' }}>
                {transcript}
                <span style={{ color: '#a1a1aa' }}>{interimTranscript}</span>
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: '#a1a1aa', fontStyle: 'italic' }}>Waiting for speech...</p>
            )}
          </div>

          {transcript && status === 'listening' && (
            <button
              onClick={handleManualSubmit}
              style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              Generate Response Now
            </button>
          )}
        </div>
      )}

      {/* Processing */}
      {status === 'processing' && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '16px' }}>
          <Loader2 size={24} style={{ color: '#6366f1', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', color: '#71717a' }}>Generating your response...</p>
        </div>
      )}

      {/* Response */}
      {response && status === 'ready' && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>RESPONSE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {response.tone && (
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.08)', color: '#6366f1', fontWeight: 500 }}>
                  {response.tone}
                </span>
              )}
              <button
                onClick={handleCopy}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', background: copied ? 'rgba(22,163,74,0.08)' : '#ffffff', color: copied ? '#16a34a' : '#71717a', cursor: 'pointer', fontWeight: 500 }}
              >
                {copied ? <><CheckCheck size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Key metric */}
          {response.key_metric && (
            <div style={{ background: '#18181b', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>LEAD WITH THIS</p>
              <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>{response.key_metric}</p>
            </div>
          )}

          {/* Bullets */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '10px' }}>KEY POINTS</p>
            {response.bullets.map((bullet, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0, marginTop: '1px' }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: '14px', color: '#09090b', lineHeight: '1.6' }}>{bullet}</p>
              </div>
            ))}
          </div>

          {/* Full response toggle */}
          <button
            onClick={() => setShowFull(!showFull)}
            style={{ fontSize: '13px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px', fontWeight: 500 }}
          >
            {showFull ? 'Hide full response' : 'Show full response'}
          </button>

          {showFull && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '8px' }}>FULL RESPONSE — READ THIS</p>
              <p style={{ fontSize: '14px', color: '#14532d', lineHeight: '1.8' }}>{response.full_response}</p>
            </div>
          )}

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f4f4f5', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setStatus('listening'); setResponse(null); setTranscript(''); lastTranscriptRef.current = '' }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              <Mic size={14} /> Next Question
            </button>
            <button
              onClick={() => generateResponse(history[0]?.question ?? '')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#ffffff', color: '#71717a', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              <RefreshCw size={14} /> Regenerate
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '12px' }}>PREVIOUS QUESTIONS</p>
          {history.slice(1).map((item, i) => (
            <div key={i} style={{ padding: '12px', background: '#f8f8f9', borderRadius: '8px', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px' }}>{item.question}</p>
              <p style={{ fontSize: '12px', color: '#52525b', lineHeight: '1.5' }}>{item.response.bullets[0]}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}