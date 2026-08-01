'use client'

import { useTransition } from 'react'
import { setOrderStatus } from '@/app/(admin)/admin/orders/actions'
import type { OrderStatus } from '@/types'

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface Props {
  orderId: string
  campaignId: string
  currentStatus: OrderStatus
}

export function OrderStatusControl({ orderId, campaignId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleChange(status: OrderStatus) {
    if (status === currentStatus) return
    startTransition(async () => {
      await setOrderStatus(orderId, status, campaignId)
    })
  }

  return (
    <div className="flex items-center gap-1">
      {STATUSES.map(({ value, label }) => {
        const active = currentStatus === value
        return (
          <button
            key={value}
            disabled={isPending || active}
            onClick={() => handleChange(value)}
            className={`px-2 py-0.5 text-xs border transition-colors ${
              active
                ? 'border-foreground bg-foreground text-background cursor-default'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
