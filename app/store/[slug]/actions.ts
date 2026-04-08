'use server'

import { createClient } from '@/lib/server'
import type { CartItem } from '@/types'

export async function submitOrder(
  campaignId: string,
  cartItems: CartItem[],
  formData: FormData
): Promise<{ error: string } | { orderId: string }> {
  if (cartItems.length === 0) return { error: 'Your cart is empty.' }

  const supabase = await createClient()

  // Verify campaign is still live
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status')
    .eq('id', campaignId)
    .single()

  if (!campaign || campaign.status !== 'live') {
    return { error: 'This campaign is no longer accepting orders.' }
  }

  // Re-fetch prices from DB to snapshot accurate amounts
  const campaignProductIds = [...new Set(cartItems.map((i) => i.campaign_product_id))]
  const { data: campaignProducts } = await supabase
    .from('campaign_products')
    .select('id, price_override, product:products ( base_price )')
    .in('id', campaignProductIds)

  if (!campaignProducts) return { error: 'Failed to verify prices.' }

  const priceMap = new Map<string, number>(
    campaignProducts.map((cp) => [
      cp.id,
      (cp.price_override ?? (cp.product as any).base_price) as number,
    ])
  )

  const buyer_name = (formData.get('buyer_name') as string).trim()
  const buyer_email = (formData.get('buyer_email') as string).trim()
  const buyer_phone = (formData.get('buyer_phone') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null
  const fulfillment_type = formData.get('fulfillment_type') as 'pickup' | 'delivery'
  const delivery_address =
    fulfillment_type === 'delivery'
      ? (formData.get('delivery_address') as string)?.trim() || null
      : null

  if (!buyer_name) return { error: 'Name is required.' }
  if (!buyer_email) return { error: 'Email is required.' }
  if (fulfillment_type === 'delivery' && !delivery_address) {
    return { error: 'Delivery address is required.' }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      campaign_id: campaignId,
      buyer_name,
      buyer_email,
      buyer_phone,
      notes,
      fulfillment_type,
      delivery_address,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { error: orderError?.message ?? 'Failed to create order.' }
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    campaign_product_id: item.campaign_product_id,
    color_id: item.color_id,
    size_id: item.size_id,
    quantity: item.quantity,
    unit_price: priceMap.get(item.campaign_product_id) ?? item.unit_price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    // Best-effort rollback
    await supabase.from('orders').delete().eq('id', order.id)
    return { error: itemsError.message }
  }

  return { orderId: order.id }
}
