'use server'

import { verifyAdmin } from '@/lib/server'
import { revalidatePath } from 'next/cache'

export async function updateProduct(
  productId: string,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const base_price = parseFloat(formData.get('base_price') as string)
  const active = formData.get('active') === 'true'

  if (isNaN(base_price) || base_price < 0) return 'Enter a valid price.'

  const { error } = await supabase
    .from('products')
    .update({ name, description, base_price, active })
    .eq('id', productId)

  if (error) return error.message
  revalidatePath(`/admin/products/${productId}`)
  return null
}

export async function updateProductColors(
  productId: string,
  colorIds: string[]
): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  await supabase.from('product_colors').delete().eq('product_id', productId)

  if (colorIds.length > 0) {
    const { error } = await supabase.from('product_colors').insert(
      colorIds.map((color_id) => ({ product_id: productId, color_id }))
    )
    if (error) return error.message
  }

  revalidatePath(`/admin/products/${productId}`)
  return null
}

export async function updateProductSizes(
  productId: string,
  sizeIds: string[]
): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  await supabase.from('product_sizes').delete().eq('product_id', productId)

  if (sizeIds.length > 0) {
    const { error } = await supabase.from('product_sizes').insert(
      sizeIds.map((size_id) => ({ product_id: productId, size_id }))
    )
    if (error) return error.message
  }

  revalidatePath(`/admin/products/${productId}`)
  return null
}

export async function updateProductPlacements(
  productId: string,
  placementIds: string[]
): Promise<string | null> {
  const supabase = await verifyAdmin()
  if (!supabase) return 'Unauthorized'

  await supabase.from('product_placements').delete().eq('product_id', productId)

  if (placementIds.length > 0) {
    const { error } = await supabase.from('product_placements').insert(
      placementIds.map((placement_id) => ({ product_id: productId, placement_id }))
    )
    if (error) return error.message
  }

  revalidatePath(`/admin/products/${productId}`)
  return null
}
