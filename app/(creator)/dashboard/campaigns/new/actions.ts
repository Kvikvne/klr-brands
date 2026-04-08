'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export async function createCampaign(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const title = (formData.get('title') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const deadlineInput = (formData.get('deadline') as string | null) || null
  const deadline = deadlineInput ?? (() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString()
  })()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      creator_id: user.id,
      title,
      slug,
      description,
      deadline,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return 'That URL slug is already taken. Choose another.'
    return error.message
  }

  redirect(`/dashboard/campaigns/${data.id}`)
}
