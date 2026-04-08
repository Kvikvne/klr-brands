'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return data?.role === 'admin' ? supabase : null
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function createProduct(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const base_price = parseFloat(formData.get('base_price') as string)

  if (isNaN(base_price) || base_price < 0) return 'Enter a valid price.'

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { error } = await supabase.from('products').insert({
    name,
    description,
    base_price,
    active: true,
    sort_order: count ?? 0,
  })

  if (error) return error.message
  revalidatePath('/admin/products')
  return null
}

export async function deleteProduct(productId: string): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) {
    if (error.code === '23503') return 'This product is used in a campaign and cannot be deleted.'
    return error.message
  }
  revalidatePath('/admin/products')
  return null
}

// ── Colors ────────────────────────────────────────────────────────────────────

export async function createColor(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const name = (formData.get('name') as string).trim()
  const hex_code = (formData.get('hex_code') as string | null)?.trim() || null

  const { count } = await supabase
    .from('colors')
    .select('*', { count: 'exact', head: true })

  const { error } = await supabase.from('colors').insert({
    name,
    hex_code: hex_code || null,
    sort_order: count ?? 0,
  })

  if (error) return error.message
  revalidatePath('/admin/products')
  return null
}

export async function deleteColor(colorId: string): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const { error } = await supabase.from('colors').delete().eq('id', colorId)
  if (error) {
    if (error.code === '23503') return 'This color is in use and cannot be deleted.'
    return error.message
  }
  revalidatePath('/admin/products')
  return null
}

// ── Sizes ─────────────────────────────────────────────────────────────────────

export async function createSize(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const name = (formData.get('name') as string).trim()

  const { count } = await supabase
    .from('sizes')
    .select('*', { count: 'exact', head: true })

  const { error } = await supabase.from('sizes').insert({
    name,
    sort_order: count ?? 0,
  })

  if (error) return error.message
  revalidatePath('/admin/products')
  return null
}

export async function deleteSize(sizeId: string): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const { error } = await supabase.from('sizes').delete().eq('id', sizeId)
  if (error) {
    if (error.code === '23503') return 'This size is in use and cannot be deleted.'
    return error.message
  }
  revalidatePath('/admin/products')
  return null
}

// ── Placements ────────────────────────────────────────────────────────────────

export async function createPlacement(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const name = (formData.get('name') as string).trim()

  const { count } = await supabase
    .from('placements')
    .select('*', { count: 'exact', head: true })

  const { error } = await supabase.from('placements').insert({
    name,
    sort_order: count ?? 0,
  })

  if (error) return error.message
  revalidatePath('/admin/products')
  return null
}

export async function deletePlacement(placementId: string): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const { error } = await supabase.from('placements').delete().eq('id', placementId)
  if (error) {
    if (error.code === '23503') return 'This placement is in use and cannot be deleted.'
    return error.message
  }
  revalidatePath('/admin/products')
  return null
}
