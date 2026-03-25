'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">Welcome to HireIQ</h1>
        <p className="text-muted-foreground">Get interview-ready in 72 hours</p>
        <Button onClick={signInWithGoogle} size="lg">
          Continue with Google
        </Button>
      </div>
    </div>
  )
}