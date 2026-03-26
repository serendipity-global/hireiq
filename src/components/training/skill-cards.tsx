'use client'

import Link from 'next/link'
import { Swords, ChevronRight } from 'lucide-react'

export default function SkillCards({ skills }: { skills: any[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
      {skills
        .sort((a, b) => a.trainingPriority - b.trainingPriority)
        .map((skill, i) => (
          <Link
            key={i}
            href={`/training/warroom/${encodeURIComponent(skill.name)}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e4e4e7'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, color: '#ffffff',
                      background: '#18181b', padding: '2px 7px', borderRadius: '6px',
                    }}>#{skill.trainingPriority}</span>
                    <span style={{ fontSize: '11px', color: '#a1a1aa' }}>{skill.category}</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.2px' }}>
                    {skill.name}
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: '#d4d4d8', flexShrink: 0, marginTop: '2px' }} />
              </div>

              <p style={{ fontSize: '12px', color: '#71717a', lineHeight: '1.5', marginBottom: '14px' }}>
                {skill.whyItMatters}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 500,
                  background: skill.interviewLikelihood === 'guaranteed' ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)',
                  color: skill.interviewLikelihood === 'guaranteed' ? '#dc2626' : '#d97706',
                }}>{skill.interviewLikelihood}</span>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 500,
                  background: skill.depth === 'mastered' ? 'rgba(99,102,241,0.08)' : skill.depth === 'practiced' ? 'rgba(22,163,74,0.08)' : 'rgba(217,119,6,0.08)',
                  color: skill.depth === 'mastered' ? '#6366f1' : skill.depth === 'practiced' ? '#16a34a' : '#d97706',
                }}>{skill.depth}</span>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 500,
                  background: skill.hiringImpact === 'critical' ? 'rgba(220,38,38,0.08)' : 'rgba(99,102,241,0.08)',
                  color: skill.hiringImpact === 'critical' ? '#dc2626' : '#6366f1',
                }}>{skill.hiringImpact} impact</span>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f4f4f5',
              }}>
                <Swords size={13} style={{ color: '#6366f1' }} />
                <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 500 }}>
                  Enter War Room
                </span>
              </div>
            </div>
          </Link>
        ))}
    </div>
  )
}