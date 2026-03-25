import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrainCircuit, Swords, AlertTriangle, TrendingUp, Upload } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name?.split(' ')[0]
    ?? user.email?.split('@')[0]
    ?? 'there'

  return (
    <>
      <Topbar title="Dashboard" />
      <div style={{ padding: '40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '26px',
            fontWeight: 600,
            color: '#09090b',
            letterSpacing: '-0.5px',
            marginBottom: '6px',
          }}>
            Welcome back, {name}
          </h2>
          <p style={{ fontSize: '14px', color: '#71717a' }}>
            Your career intelligence system is ready.
          </p>
        </div>

        {/* Score Banner */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '40px',
          marginBottom: '16px',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#a1a1aa',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}>Current target role</p>
            <p style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#09090b',
              letterSpacing: '-0.4px',
              marginBottom: '20px',
            }}>
              Upload your resume to get started
            </p>
            <div style={{
              height: '4px',
              background: '#f4f4f5',
              borderRadius: '2px',
              width: '100%',
              maxWidth: '480px',
              marginBottom: '8px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '4px',
                background: '#6366f1',
                borderRadius: '2px',
                width: '0%',
              }} />
            </div>
            <p style={{ fontSize: '13px', color: '#a1a1aa' }}>0% interview ready</p>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontSize: '68px',
              fontWeight: 600,
              color: '#6366f1',
              lineHeight: 1,
              letterSpacing: '-3px',
              fontFamily: 'var(--font-geist-mono), monospace',
            }}>0</div>
            <div style={{
              fontSize: '12px',
              color: '#a1a1aa',
              marginTop: '4px',
              marginBottom: '16px',
            }}>readiness score</div>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#6366f1',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
            }}>
              <Upload size={15} />
              Upload Resume
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '16px',
        }}>
          {[
            { icon: BrainCircuit, label: 'Sessions completed', value: '0', color: '#09090b' },
            { icon: AlertTriangle, label: 'Critical gaps', value: '—', color: '#ef4444' },
            { icon: TrendingUp, label: 'Answers improved', value: '0', color: '#16a34a' },
          ].map((metric) => (
            <div key={metric.label} style={{
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}>
                <metric.icon size={14} strokeWidth={1.5} style={{ color: '#a1a1aa' }} />
                <span style={{ fontSize: '13px', color: '#71717a' }}>{metric.label}</span>
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: 600,
                color: metric.color,
                letterSpacing: '-1px',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}>{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Bottom Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '12px',
        }}>
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
              marginBottom: '20px',
            }}>Top predicted questions</p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <Swords size={28} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '4px' }}>Your battle plan will appear here</p>
              <p style={{ fontSize: '13px', color: '#a1a1aa' }}>Upload your resume and paste a job description to begin</p>
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
              marginBottom: '20px',
            }}>Critical gaps</p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <AlertTriangle size={28} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '4px' }}>No gaps detected yet</p>
              <p style={{ fontSize: '13px', color: '#a1a1aa' }}>Start by uploading your resume</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}