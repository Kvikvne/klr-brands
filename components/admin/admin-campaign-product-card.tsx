'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
  uploadCampaignProductImage,
} from '@/app/(admin)/admin/campaigns/[id]/actions'

interface Color {
  id: string
  name: string
  hex_code: string | null
}

interface Props {
  campaignId: string
  campaignProductId: string
  productName: string
  price: number
  selectedColors: Color[]
  availableColors: Color[]
  mockupUrl: string | null
  uploadAction: (prevState: string | null, formData: FormData) => Promise<string | null>
}

export function AdminCampaignProductCard({
  campaignId,
  campaignProductId,
  productName,
  price,
  selectedColors,
  availableColors,
  mockupUrl,
  uploadAction,
}: Props) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [colorIds, setColorIds] = useState(selectedColors.map((c) => c.id))
  const [editError, setEditError] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [imgError, imgUploadAction, imgPending] = useActionState(uploadAction, null)

  function toggleColor(id: string) {
    setColorIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  function handleSaveColors() {
    setEditError(null)
    startTransition(async () => {
      const err = await updateCampaignProductColors(campaignId, campaignProductId, colorIds)
      if (err) setEditError(err)
      else { setEditOpen(false); router.refresh() }
    })
  }

  function handleRemove() {
    setRemoveError(null)
    startTransition(async () => {
      const err = await removeCampaignProduct(campaignId, campaignProductId)
      if (err) setRemoveError(err)
      else router.refresh()
    })
  }

  return (
    <div className="border border-border p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{productName}</span>
            <span className="text-xs text-muted-foreground">${Number(price).toFixed(2)}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedColors.map((color) => (
              <Badge key={color.id} variant="secondary" className="gap-1 text-xs">
                {color.hex_code && (
                  <span
                    className="inline-block h-2 w-2 border border-border"
                    style={{ backgroundColor: color.hex_code }}
                  />
                )}
                {color.name}
              </Badge>
            ))}
          </div>
          {removeError && <p className="text-xs text-destructive">{removeError}</p>}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Edit colors */}
          <Dialog open={editOpen} onOpenChange={(o) => {
            setEditOpen(o)
            if (o) setColorIds(selectedColors.map((c) => c.id))
            setEditError(null)
          }}>
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
                          className="inline-block h-3 w-3 border border-border"
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
                <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
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
      </div>

      {/* Mockup image */}
      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">Mockup image</p>
        {mockupUrl && (
          <img
            src={mockupUrl}
            alt={`${productName} mockup`}
            className="max-h-40 w-auto border border-border object-contain"
          />
        )}
        <form action={imgUploadAction} className="flex items-center gap-3">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            className="text-xs text-muted-foreground file:mr-3 file:border file:border-border file:bg-background file:px-2 file:py-1 file:text-xs file:text-foreground"
          />
          <Button type="submit" size="xs" variant="outline" disabled={imgPending}>
            {imgPending ? 'Uploading…' : mockupUrl ? 'Replace' : 'Upload'}
          </Button>
        </form>
        {imgError && <p className="text-xs text-destructive">{imgError}</p>}
      </div>
    </div>
  )
}
