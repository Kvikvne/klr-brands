'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export async function createCampaignAsAdmin(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const title = (formData.get('title') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const description = (formData.get('description') as string)?.trim() || null
  const deadlineInput = (formData.get('deadline') as string) || null
  const creatorId = (formData.get('creator_id') as string).trim()

  if (!title) return 'Title is required.'
  if (!slug) return 'Slug is required.'
  if (!creatorId) return 'Select a creator.'

  const deadline = deadlineInput ?? (() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString()
  })()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .insert({ creator_id: creatorId, title, slug, description, deadline, status: 'draft' })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return 'That URL slug is already taken.'
    return error.message
  }

  redirect(`/admin/campaigns/${data.id}`)
}
