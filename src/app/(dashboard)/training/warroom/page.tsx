import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain } from 'lucide-react'
import SkillCards from '@/components/training/skill-cards'

export default async function WarRoomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('parsed_data, interview_dna')
    .eq('user_id', user.id)
    .eq('is_active', true)  
    .single()

  const dna = resume?.interview_dna as any
  const tier1Skills = dna?.skillMap?.tier1 ?? []

  return (
    <>
      <Topbar title="War Room" />
      <div style={{ padding: '40px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '26px', fontWeight: 600, color: '#09090b',
            letterSpacing: '-0.5px', marginBottom: '6px',
          }}>War Room</h2>
          <p style={{ fontSize: '14px', color: '#71717a' }}>
            Select a skill to begin your personalized training session.
          </p>
        </div>

        {tier1Skills.length === 0 ? (
          <div style={{
            background: '#ffffff', border: '1px solid #e4e4e7',
            borderRadius: '16px', padding: '48px', textAlign: 'center',
          }}>
            <Brain size={32} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>
              No skills loaded yet
            </p>
            <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
              Upload your resume first to generate your personalized Skill Map.
            </p>
            <Link href="/resume" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: 500,
              padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
            }}>
              Upload Resume
            </Link>
          </div>
        ) : (
          <SkillCards skills={tier1Skills} />
        )}
      </div>
    </>
  )
}