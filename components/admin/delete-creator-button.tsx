'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteCreator } from '@/app/(admin)/admin/creators/actions'

interface Props {
  creatorId: string
  creatorName: string
}

export function DeleteCreatorButton({ creatorId, creatorName }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const err = await deleteCreator(creatorId)
      if (err) {
        setError(err)
      } else {
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); setError(null) }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="xs">Remove</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove creator</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This will permanently delete <span className="font-medium text-foreground">{creatorName}</span>'s
          account. This cannot be undone.
        </p>
        {error && (
          <p className="text-sm text-destructive">
            {error.includes('restrict') || error.includes('foreign key')
              ? 'This creator has campaigns and cannot be removed.'
              : error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Removing…' : 'Remove'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
