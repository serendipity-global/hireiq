'use client'

import { useState } from 'react'
import { Loader2, BookOpen, Search, ChevronDown, ChevronUp, Cpu, AlertTriangle } from 'lucide-react'

interface SkillExplanation {
  skill: string
  category: string
  tier: number
  simpleDefinition: string
  whatItReallyDoes: string
  whyEmployersWantIt: string
  howYouUsedIt: string
  interviewAngle: string
  levelSignal: string
  relatedSkills: string[]
}

interface Props {
  savedGuide: SkillExplanation[] | null
  totalSkills: number
  tier1Count: number
  tier2Count: number
  tier3Count: number
}

export default function SkillsEncyclopedia({ savedGuide, totalSkills, tier1Count, tier2Count, tier3Count }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guide, setGuide] = useState<SkillExplanation[]>(savedGuide ?? [])
  const [search, setSearch] = useState('')
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeTier, setActiveTier] = useState<number | 'all'>('all')

  async function handleGenerate() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/study/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setGuide(data.explanations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate guide')
    } finally {
      setIsLoading(false)
    }
  }

  function toggleSkill(skillName: string) {
    setExpandedSkills(prev => {
      const next = new Set(prev)
      if (next.has(skillName)) next.delete(skillName)
      else next.add(skillName)
      return next
    })
  }

  const categories = ['all', ...Array.from(new Set(guide.map(s => s.category))).sort()]

  const filtered = guide.filter(s => {
    const matchesSearch = s.skill.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory
    const matchesTier = activeTier === 'all' || s.tier === activeTier
    return matchesSearch && matchesCategory && matchesTier
  })

  const tierColor = (tier: number) => {
    if (tier === 1) return { bg: 'rgba(99,102,241,0.08)', color: '#6366f1', label: 'Core' }
    if (tier === 2) return { bg: 'rgba(217,119,6,0.08)', color: '#d97706', label: 'Supporting' }
    return { bg: '#f4f4f5', color: '#a1a1aa', label: 'Other' }
  }

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Skills Encyclopedia
          </h2>
          <p style={{ fontSize: '14px', color: '#71717a' }}>
            Every skill from your resume — explained simply, technically, and in interview context.
          </p>
        </div>
        <button
          onClick={handleGenerate}
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
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
            : guide.length > 0 ? <><BookOpen size={15} /> Regenerate</>
            : <><BookOpen size={15} /> Generate Guide ({totalSkills} skills)</>
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
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#09090b' }}>
            Generating your Skills Encyclopedia...
          </p>
          <p style={{ fontSize: '13px', color: '#71717a' }}>
            Claude AI is explaining all {totalSkills} skills. This takes 30-60 seconds.
          </p>
        </div>
      )}

      {!isLoading && guide.length === 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <Cpu size={32} strokeWidth={1} style={{ color: '#d4d4d8', marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#09090b', marginBottom: '8px' }}>
            Your Skills Encyclopedia is empty
          </p>
          <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
            Generate explanations for all {totalSkills} skills in your resume.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>{tier1Count} core skills</span>
            <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(217,119,6,0.08)', color: '#d97706' }}>{tier2Count} supporting</span>
            <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#f4f4f5', color: '#a1a1aa' }}>{tier3Count} other</span>
          </div>
        </div>
      )}

      {!isLoading && guide.length > 0 && (
        <>
          {/* Search + Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
              <input
                type="text"
                placeholder="Search skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px 9px 34px', fontSize: '14px',
                  border: '1px solid #e4e4e7', borderRadius: '10px', outline: 'none',
                  color: '#09090b', background: '#ffffff',
                }}
              />
            </div>

            {/* Tier filter */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[['all', 'All tiers'], [1, 'Core'], [2, 'Supporting'], [3, 'Other']].map(([tier, label]) => (
                <button
                  key={String(tier)}
                  onClick={() => setActiveTier(tier as any)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                    border: '1px solid', cursor: 'pointer',
                    background: activeTier === tier ? '#6366f1' : '#ffffff',
                    borderColor: activeTier === tier ? '#6366f1' : '#e4e4e7',
                    color: activeTier === tier ? 'white' : '#52525b',
                  }}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                  border: '1px solid', cursor: 'pointer',
                  background: activeCategory === cat ? '#09090b' : '#ffffff',
                  borderColor: activeCategory === cat ? '#09090b' : '#e4e4e7',
                  color: activeCategory === cat ? 'white' : '#52525b',
                }}
              >{cat === 'all' ? `All categories (${guide.length})` : cat}</button>
            ))}
          </div>

          {/* Results count */}
          <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '16px' }}>
            Showing {filtered.length} of {guide.length} skills
          </p>

          {/* Skills list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((skill) => {
              const isExpanded = expandedSkills.has(skill.skill)
              const tc = tierColor(skill.tier)

              return (
                <div
                  key={skill.skill}
                  style={{
                    background: '#ffffff', border: '1px solid #e4e4e7',
                    borderRadius: '16px', overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <div
                    onClick={() => toggleSkill(skill.skill)}
                    style={{
                      padding: '18px 24px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '14px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: '#09090b' }}>{skill.skill}</p>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500, background: tc.bg, color: tc.color }}>
                          {tc.label}
                        </span>
                        <span style={{ fontSize: '11px', color: '#a1a1aa' }}>{skill.category}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.5' }}>
                        {skill.simpleDefinition}
                      </p>
                    </div>
                    {isExpanded
                      ? <ChevronUp size={16} style={{ color: '#a1a1aa', flexShrink: 0 }} />
                      : <ChevronDown size={16} style={{ color: '#a1a1aa', flexShrink: 0 }} />
                    }
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f4f4f5', padding: '20px 24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

                        <div style={{ padding: '14px', background: '#f8f8f9', borderRadius: '10px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', marginBottom: '6px' }}>WHAT IT REALLY DOES</p>
                          <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.6' }}>{skill.whatItReallyDoes}</p>
                        </div>

                        <div style={{ padding: '14px', background: '#f8f8f9', borderRadius: '10px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '6px' }}>WHY EMPLOYERS WANT IT</p>
                          <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.6' }}>{skill.whyEmployersWantIt}</p>
                        </div>

                        <div style={{ padding: '14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '10px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', marginBottom: '6px' }}>HOW YOU USED IT</p>
                          <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.6' }}>{skill.howYouUsedIt}</p>
                        </div>

                        <div style={{ padding: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', marginBottom: '6px' }}>INTERVIEW ANGLE</p>
                          <p style={{ fontSize: '13px', color: '#09090b', lineHeight: '1.6' }}>{skill.interviewAngle}</p>
                        </div>
                      </div>

                      <div style={{ padding: '14px', background: '#18181b', borderRadius: '10px', marginBottom: '12px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>SENIOR vs JUNIOR SIGNAL</p>
                        <p style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: '1.6' }}>{skill.levelSignal}</p>
                      </div>

                      {skill.relatedSkills?.length > 0 && (
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>RELATED SKILLS</p>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {skill.relatedSkills.map((rs, i) => (
                              <span key={i} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: '#f4f4f5', color: '#52525b', border: '1px solid #e4e4e7' }}>
                                {rs}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
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