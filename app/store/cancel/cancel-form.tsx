'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { cancelOrder } from './actions'

export function CancelForm({ orderId, token }: { orderId: string; token: string }) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        Your order has been cancelled.
      </p>
    )
  }

  function handleCancel() {
    setError(null)
    startTransition(async () => {
      const result = await cancelOrder(orderId, token)
      if ('error' in result) setError(result.error)
      else setDone(true)
    })
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
          {isPending ? 'Cancelling…' : 'Yes, cancel my order'}
        </Button>
      </div>
    </div>
  )
}
