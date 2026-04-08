'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  removeCampaignProduct,
  updateCampaignProductColors,
} from '@/app/(creator)/dashboard/campaigns/[id]/actions'

interface Color {
  id: string
  name: string
  hex_code: string | null
}

interface Props {
  campaignProductId: string
  productName: string
  basePrice: number
  selectedColors: Color[]
  availableColors: Color[]
  isDraft: boolean
}

export function CampaignProductCard({
  campaignProductId,
  productName,
  basePrice,
  selectedColors,
  availableColors,
  isDraft,
}: Props) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [colorIds, setColorIds] = useState<string[]>(selectedColors.map((c) => c.id))
  const [editError, setEditError] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleColor(id: string) {
    setColorIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  function handleSaveColors() {
    setEditError(null)
    startTransition(async () => {
      const err = await updateCampaignProductColors(campaignProductId, colorIds)
      if (err) {
        setEditError(err)
      } else {
        setEditOpen(false)
        router.refresh()
      }
    })
  }

  function handleRemove() {
    setRemoveError(null)
    startTransition(async () => {
      const err = await removeCampaignProduct(campaignProductId)
      if (err) setRemoveError(err)
      else router.refresh()
    })
  }

  return (
    <div className="flex items-start justify-between border border-border p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{productName}</span>
          <span className="text-xs text-muted-foreground">${Number(basePrice).toFixed(2)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {selectedColors.map((color) => (
            <Badge key={color.id} variant="secondary" className="gap-1">
              {color.hex_code && (
                <span
                  className="inline-block h-2 w-2 rounded-full border border-border"
                  style={{ backgroundColor: color.hex_code }}
                />
              )}
              {color.name}
            </Badge>
          ))}
        </div>
        {removeError && <p className="text-xs text-destructive">{removeError}</p>}
      </div>

      {isDraft && (
        <div className="flex items-center gap-1 shrink-0 ml-4">
          {/* Edit colors */}
          <Dialog
            open={editOpen}
            onOpenChange={(o) => {
              setEditOpen(o)
              if (o) setColorIds(selectedColors.map((c) => c.id))
              setEditError(null)
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="xs">Edit colors</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{productName} — colors</DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap gap-3 py-2">
                {availableColors.map((color) => (
                  <div key={color.id} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`edit-${campaignProductId}-${color.id}`}
                      checked={colorIds.includes(color.id)}
                      onCheckedChange={() => toggleColor(color.id)}
                    />
                    <Label
                      htmlFor={`edit-${campaignProductId}-${color.id}`}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      {color.hex_code && (
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: color.hex_code }}
                        />
                      )}
                      {color.name}
                    </Label>
                  </div>
                ))}
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveColors}
                  disabled={colorIds.length === 0 || isPending}
                >
                  {isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Remove */}
          <Button
            variant="ghost"
            size="xs"
            onClick={handleRemove}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}
