'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Props {
  id: string
  label: string
  deleteAction: (id: string) => Promise<string | null>
}

export function DeleteCatalogItemButton({ id, label, deleteAction }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const err = await deleteAction(id)
      if (err) {
        setError(err)
        setConfirming(false)
      } else {
        router.refresh()
      }
    })
  }

  if (error) {
    return <span className="text-xs text-destructive">{error}</span>
  }

  if (confirming) {
    return (
      <span className="flex items-center justify-end gap-1">
        <span className="text-xs text-muted-foreground mr-1">Delete {label}?</span>
        <Button size="xs" variant="destructive" onClick={handleDelete} disabled={isPending}>
          {isPending ? '…' : 'Yes'}
        </Button>
        <Button size="xs" variant="ghost" onClick={() => setConfirming(false)}>
          No
        </Button>
      </span>
    )
  }

  return (
    <Button size="xs" variant="ghost" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  )
}
