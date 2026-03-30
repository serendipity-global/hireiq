'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, ChevronDown, Check, Trash2, Upload } from 'lucide-react'

interface Resume {
  id: string
  file_name: string
  is_active: boolean
  updated_at: string
}

interface Props {
  resumes: Resume[]
  activeResumeId: string | null
}

export default function ResumeSelector({ resumes: initialResumes, activeResumeId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [resumes, setResumes] = useState(initialResumes)
  const ref = useRef<HTMLDivElement>(null)

  const activeResume = resumes.find(r => r.id === activeResumeId) ?? resumes[0]
  const isFull = resumes.length >= 5

  useEffect(() => {
    setResumes(initialResumes)
  }, [initialResumes])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmDelete(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSelect(id: string) {
    if (confirmDelete) { setConfirmDelete(null); return }
    if (id === activeResumeId) { setOpen(false); return }
    setLoading(id)
    await fetch('/api/resume/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLoading(null)
    setOpen(false)
    router.refresh()
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()

    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }

    setDeleting(id)
    setConfirmDelete(null)

    await fetch('/api/resume', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    setResumes(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
    router.refresh()
  }

  function trimFileName(name: string) {
    return name.replace(/\.pdf$/i, '').length > 24
      ? name.replace(/\.pdf$/i, '').substring(0, 24) + '...'
      : name.replace(/\.pdf$/i, '')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); setConfirmDelete(null) }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#f4f4f5', border: '1px solid #e4e4e7',
          borderRadius: '40px', padding: '5px 12px 5px 10px',
          cursor: 'pointer', fontSize: '13px', color: '#52525b',
        }}
      >
        <FileText size={13} style={{ color: '#6366f1', flexShrink: 0 }} />
        <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeResume ? trimFileName(activeResume.file_name) : 'Select resume'}
        </span>
        <ChevronDown size={12} style={{ color: '#a1a1aa', flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#ffffff', border: '1px solid #e4e4e7',
          borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          minWidth: '280px', overflow: 'hidden', zIndex: 200,
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f4f4f5' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your Resumes ({resumes.length}/5)
            </p>
          </div>

          <div style={{ padding: '6px' }}>
            {resumes.map(resume => {
              const isActive = resume.id === activeResumeId
              const isConfirming = confirmDelete === resume.id
              const isDeleting = deleting === resume.id

              return (
                <div
                  key={resume.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: isConfirming
                      ? 'rgba(239,68,68,0.06)'
                      : isActive ? 'rgba(99,102,241,0.06)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Select button */}
                  <button
                    onClick={() => handleSelect(resume.id)}
                    disabled={!!loading || isDeleting}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                      border: 'none', background: 'transparent',
                      cursor: loading || isDeleting ? 'default' : 'pointer',
                      textAlign: 'left', padding: 0, minWidth: 0,
                    }}
                  >
                    <FileText size={14} style={{ color: isActive ? '#6366f1' : '#a1a1aa', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '13px', color: isConfirming ? '#ef4444' : '#09090b',
                        fontWeight: isActive ? 500 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        transition: 'color 0.15s',
                      }}>
                        {trimFileName(resume.file_name)}
                      </p>
                      <p style={{ fontSize: '11px', color: isConfirming ? '#fca5a5' : '#a1a1aa', transition: 'color 0.15s' }}>
                        {isConfirming
                          ? 'Click trash again to confirm'
                          : new Date(resume.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        }
                      </p>
                    </div>
                    {isActive && !isConfirming && (
                      <Check size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                    )}
                    {loading === resume.id && (
                      <div style={{ width: '14px', height: '14px', border: '2px solid #e4e4e7', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
                    )}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, resume.id)}
                    disabled={isDeleting}
                    title={isConfirming ? 'Click to confirm deletion' : 'Delete resume'}
                    style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '26px', height: '26px', borderRadius: '6px', border: 'none',
                      background: isConfirming ? 'rgba(239,68,68,0.12)' : 'transparent',
                      cursor: isDeleting ? 'default' : 'pointer',
                      transition: 'background 0.15s, opacity 0.15s',
                      opacity: isDeleting ? 0.4 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!isConfirming) (e.currentTarget as HTMLButtonElement).style.background = '#f4f4f5'
                    }}
                    onMouseLeave={e => {
                      if (!isConfirming) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    {isDeleting
                      ? <div style={{ width: '12px', height: '12px', border: '1.5px solid #fca5a5', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      : <Trash2 size={13} style={{ color: isConfirming ? '#ef4444' : '#a1a1aa' }} />
                    }
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ padding: '8px', borderTop: '1px solid #f4f4f5' }}>
            {isFull ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', padding: '8px', borderRadius: '8px',
                fontSize: '13px', color: '#a1a1aa',
                background: '#f9f9f9', border: '1px dashed #e4e4e7',
              }}>
                <Upload size={13} style={{ color: '#d4d4d8' }} />
                Delete a resume to upload a new one
              </div>
            ) : (
              <a href="/resume" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', padding: '8px', borderRadius: '8px',
                fontSize: '13px', color: '#6366f1', fontWeight: 500,
                textDecoration: 'none', background: 'rgba(99,102,241,0.06)',
              }}>
                + Upload new resume
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}