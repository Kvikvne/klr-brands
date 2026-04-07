'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/client'

/**
 * Handles the implicit (hash-based) auth flow from Supabase invite emails.
 * The browser never sends the hash to the server, so this must be client-side.
 *
 * URL shape on arrival:
 *   /auth/confirm?next=/set-password#access_token=...&refresh_token=...&type=invite
 */
export default function AuthConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=invalid_link')
      return
    }

    const supabase = createClient()
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        router.replace(error ? '/login?error=invalid_link' : next)
      })
  }, [router, next])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}
