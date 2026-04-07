'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export async function setPassword(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return 'Passwords do not match'
  if (password.length < 6) return 'Password must be at least 6 characters'

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return error.message

  redirect('/dashboard')
}
