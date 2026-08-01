'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'
import type { OrderStatus } from '@/types'

export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
  campaignId: string
): Promise<string | null> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) return error.message

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/campaigns/${campaignId}`)
  return null
}
