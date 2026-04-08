'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

// Verify the current user owns this campaign and it's a draft
async function getOwnedDraftCampaign(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('campaigns')
    .select('id, status, creator_id')
    .eq('id', campaignId)
    .eq('creator_id', user.id)
    .single()

  return data
}

export async function updateCampaignDetails(
  campaignId: string,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const campaign = await getOwnedDraftCampaign(campaignId)
  if (!campaign) return 'Unauthorized'
  if (campaign.status !== 'draft') return 'Only draft campaigns can be edited.'

  const title = (formData.get('title') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const deadline = (formData.get('deadline') as string | null) || null

  const supabase = await createClient()
  const { error } = await supabase
    .from('campaigns')
    .update({ title, slug, description, deadline: deadline || null })
    .eq('id', campaignId)

  if (error) {
    if (error.code === '23505') return 'That URL slug is already taken.'
    return error.message
  }

  return null
}

export async function addCampaignProduct(
  campaignId: string,
  productId: string,
  colorIds: string[]
): Promise<string | null> {
  const campaign = await getOwnedDraftCampaign(campaignId)
  if (!campaign) return 'Unauthorized'
  if (campaign.status !== 'draft') return 'Only draft campaigns can be edited.'
  if (colorIds.length === 0) return 'Select at least one color.'

  const supabase = await createClient()

  const { data: cp, error: cpError } = await supabase
    .from('campaign_products')
    .insert({ campaign_id: campaignId, product_id: productId })
    .select('id')
    .single()

  if (cpError) {
    if (cpError.code === '23505') return 'That product is already in this campaign.'
    return cpError.message
  }

  const { error: colorError } = await supabase
    .from('campaign_product_colors')
    .insert(colorIds.map((color_id) => ({ campaign_product_id: cp.id, color_id })))

  if (colorError) return colorError.message

  return null
}

export async function updateCampaignProductColors(
  campaignProductId: string,
  colorIds: string[]
): Promise<string | null> {
  if (colorIds.length === 0) return 'Select at least one color.'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  // Verify ownership via join
  const { data: cp } = await supabase
    .from('campaign_products')
    .select('id, campaigns!inner(creator_id, status)')
    .eq('id', campaignProductId)
    .single()

  const campaign = (cp?.campaigns as any)
  if (!campaign || campaign.creator_id !== user.id) return 'Unauthorized'
  if (campaign.status !== 'draft') return 'Only draft campaigns can be edited.'

  // Replace all colors atomically
  const { error: deleteError } = await supabase
    .from('campaign_product_colors')
    .delete()
    .eq('campaign_product_id', campaignProductId)

  if (deleteError) return deleteError.message

  const { error: insertError } = await supabase
    .from('campaign_product_colors')
    .insert(colorIds.map((color_id) => ({ campaign_product_id: campaignProductId, color_id })))

  if (insertError) return insertError.message

  return null
}

export async function removeCampaignProduct(campaignProductId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  const { data: cp } = await supabase
    .from('campaign_products')
    .select('id, campaigns!inner(creator_id, status)')
    .eq('id', campaignProductId)
    .single()

  const campaign = (cp?.campaigns as any)
  if (!campaign || campaign.creator_id !== user.id) return 'Unauthorized'
  if (campaign.status !== 'draft') return 'Only draft campaigns can be edited.'

  const { error } = await supabase
    .from('campaign_products')
    .delete()
    .eq('id', campaignProductId)

  if (error) return error.message
  return null
}

export async function publishCampaign(campaignId: string): Promise<string | null> {
  const campaign = await getOwnedDraftCampaign(campaignId)
  if (!campaign) return 'Unauthorized'
  if (campaign.status !== 'draft') return 'Campaign is already published.'

  const supabase = await createClient()

  // Must have at least one product with at least one color
  const { count } = await supabase
    .from('campaign_products')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)

  if (!count || count === 0) return 'Add at least one product before publishing.'

  const { error } = await supabase
    .from('campaigns')
    .update({ status: 'live', published_at: new Date().toISOString() })
    .eq('id', campaignId)

  if (error) return error.message

  redirect(`/dashboard/campaigns/${campaignId}`)
}

export async function unpublishCampaign(campaignId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, creator_id, status')
    .eq('id', campaignId)
    .eq('creator_id', user.id)
    .single()

  if (!campaign) return 'Unauthorized'
  if (campaign.status !== 'live') return 'Campaign is not live.'

  const { error } = await supabase
    .from('campaigns')
    .update({ status: 'draft', published_at: null })
    .eq('id', campaignId)

  if (error) return error.message

  redirect(`/dashboard/campaigns/${campaignId}`)
}
