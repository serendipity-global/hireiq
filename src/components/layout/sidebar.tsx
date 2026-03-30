'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Swords,
  BrainCircuit,
  TrendingUp,
  GraduationCap,
  LogOut,
  BookOpen,
  Target,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems: {
  section: string
  items: {
    label: string
    href: string
    icon: React.ElementType
    comingSoon?: boolean
  }[]
}[] = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Resume', href: '/resume', icon: FileText },
      { label: 'War Room', href: '/training/warroom', icon: Swords },
      { label: 'Training', href: '/training', icon: BrainCircuit },
      { label: 'Progress', href: '/progress', icon: TrendingUp },
    ],
  },
  {
    section: 'Study',
    items: [
      { label: 'Study Guide', href: '/study', icon: BookOpen },
    ],
  },
  {
    section: 'Job Fit',
    items: [
      { label: 'Analyze Job', href: '/job-fit/new', icon: Target },
      { label: 'My Jobs', href: '/job-fit', icon: FileText },
    ],
  },
  {
    section: 'Learn',
    items: [
      {
        label: 'Certifications',
        href: '/certifications',
        icon: GraduationCap,
        comingSoon: true,
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '260px',
      background: '#ffffff',
      borderRight: '1px solid #e4e4e7',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '24px',
        borderBottom: '1px solid #e4e4e7',
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
        }}>H</div>
        <span style={{
          fontSize: '17px',
          fontWeight: 600,
          color: '#09090b',
          letterSpacing: '-0.4px',
        }}>HireIQ</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '10px',
          color: '#6366f1',
          background: 'rgba(99,102,241,0.08)',
          padding: '3px 8px',
          borderRadius: '20px',
          fontWeight: 500,
        }}>Beta</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {navItems.map((section) => (
          <div key={section.section} style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#a1a1aa',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 12px',
              marginBottom: '4px',
            }}>{section.section}</p>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const isComingSoon = item.comingSoon
              return (
                <Link
                  key={item.href}
                  href={isComingSoon ? '#' : item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    marginBottom: '2px',
                    fontSize: '14px',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#6366f1' : '#52525b',
                    background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                    textDecoration: 'none',
                    opacity: isComingSoon ? 0.4 : 1,
                    pointerEvents: isComingSoon ? 'none' : 'auto',
                  }}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.6}
                    style={{ color: isActive ? '#6366f1' : '#71717a', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isComingSoon && (
                    <span style={{
                      fontSize: '10px',
                      background: '#f4f4f5',
                      color: '#a1a1aa',
                      padding: '2px 7px',
                      borderRadius: '6px',
                    }}>Soon</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid #e4e4e7' }}>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#71717a',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <LogOut size={17} strokeWidth={1.6} style={{ color: '#a1a1aa' }} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}