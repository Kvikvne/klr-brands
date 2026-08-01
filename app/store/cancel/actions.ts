'use server'

import { createClient } from '@/lib/server'
import { verifyCancelToken } from '@/lib/cancel-token'

export async function cancelOrder(
  orderId: string,
  token: string
): Promise<{ error: string } | { success: true }> {
  if (!verifyCancelToken(orderId, token)) {
    return { error: 'Invalid cancellation link.' }
  }

  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Order not found.' }

  if (order.status !== 'pending') {
    return { error: 'This order can no longer be cancelled. Contact us directly.' }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('status', 'pending') // double-check status hasn't changed

  if (error) return { error: error.message }

  return { success: true }
}
