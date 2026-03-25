import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'HireIQ — Career Intelligence System',
  description: 'Get interview-ready in 72 hours for your exact job.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body style={{ background: '#ffffff', color: '#09090b', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}