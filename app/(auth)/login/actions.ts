'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export async function login(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || null

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return error.message

  // Fetch role to determine where to send the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const destination = next ?? (profile?.role === 'admin' ? '/admin' : '/dashboard')
  redirect(destination)
}
