'use server'

import { createClient } from '@/lib/server'
import { createAdminClient } from '@/lib/admin-client'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' ? user : null
}

export async function createCreator(formData: FormData): Promise<string | null> {
  const fullName = (formData.get('full_name') as string).trim()
  const email = (formData.get('email') as string).trim()

  const caller = await verifyAdmin()
  if (!caller) return 'Unauthorized'

  const admin = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Creates the auth user and sends the invite email in one step.
  // Creator clicks the link → /auth/callback → /set-password → /dashboard
  const { data, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/set-password`,
  })

  if (inviteError) return inviteError.message

  const { error: profileError } = await admin.from('profiles').insert({
    id: data.user.id,
    role: 'creator',
    full_name: fullName,
    email,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id)
    return profileError.message
  }

  return null
}

export async function deleteCreator(creatorId: string): Promise<string | null> {
  const caller = await verifyAdmin()
  if (!caller) return 'Unauthorized'

  const admin = createAdminClient()

  // Deleting the auth user cascades to profiles.
  // Will fail at DB level if the creator still has campaigns (ON DELETE RESTRICT).
  const { error } = await admin.auth.admin.deleteUser(creatorId)
  if (error) return error.message

  return null
}
