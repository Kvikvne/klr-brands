'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type ItemType = 'color' | 'size' | 'placement'

const CONFIG: Record<ItemType, { label: string; placeholder: string }> = {
  color:     { label: 'Color',     placeholder: 'Black' },
  size:      { label: 'Size',      placeholder: 'XL' },
  placement: { label: 'Placement', placeholder: 'Front' },
}

interface Props {
  type: ItemType
  action: (prevState: string | null, formData: FormData) => Promise<string | null>
}

export function CreateCatalogItemDialog({ type, action }: Props) {
  const [open, setOpen] = useState(false)
  const { label, placeholder } = CONFIG[type]

  const [error, formAction, isPending] = useActionState(
    async (prev: string | null, formData: FormData) => {
      const err = await action(prev, formData)
      if (!err) setOpen(false)
      return err
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Add {label.toLowerCase()}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {label.toLowerCase()}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">{label} name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder={placeholder}
              disabled={isPending}
            />
          </div>

          {type === 'color' && (
            <div className="space-y-1.5">
              <Label htmlFor="hex_code">
                Hex code <span className="text-muted-foreground">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="hex_code"
                  name="hex_code"
                  placeholder="#000000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  disabled={isPending}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Adding…' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
