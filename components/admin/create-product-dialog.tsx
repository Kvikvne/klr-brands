'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createProduct } from '@/app/(admin)/admin/products/actions'
import { useState } from 'react'

export function CreateProductDialog() {
  const [open, setOpen] = useState(false)
  const [error, action, isPending] = useActionState(
    async (prev: string | null, formData: FormData) => {
      const err = await createProduct(prev, formData)
      if (!err) setOpen(false)
      return err
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Unisex Tee" disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea id="description" name="description" rows={2} disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="base_price">Base price ($)</Label>
            <Input
              id="base_price"
              name="base_price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="25.00"
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
