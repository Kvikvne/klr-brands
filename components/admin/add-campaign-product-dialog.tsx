'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { addCampaignProduct } from '@/app/(admin)/admin/campaigns/[id]/actions'

interface Color {
  id: string
  name: string
  hex_code: string | null
}

interface Product {
  id: string
  name: string
  base_price: number
  product_colors: { color: Color }[]
}

interface Props {
  campaignId: string
  availableProducts: Product[]
}

export function AddCampaignProductDialog({ campaignId, availableProducts }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const selectedProduct = availableProducts.find((p) => p.id === selectedProductId)

  function reset() {
    setSelectedProductId(null)
    setSelectedColorIds([])
    setFileName(null)
    setError(null)
    formRef.current?.reset()
  }

  function handleProductSelect(productId: string) {
    setSelectedProductId(productId)
    setSelectedColorIds([])
    setError(null)
  }

  function toggleColor(colorId: string) {
    setSelectedColorIds((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]
    )
  }

  function handleAdd() {
    if (!selectedProductId || selectedColorIds.length === 0) return
    setError(null)
    const formData = new FormData(formRef.current!)
    startTransition(async () => {
      const err = await addCampaignProduct(campaignId, selectedProductId, selectedColorIds, formData)
      if (err) {
        setError(err)
      } else {
        setOpen(false)
        reset()
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={availableProducts.length === 0}>
          Add product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add product to campaign</DialogTitle>
        </DialogHeader>

        <form ref={formRef}>
          {/* Product list */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductSelect(product.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors border ${
                  selectedProductId === product.id
                    ? 'border-foreground bg-muted'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground">${Number(product.base_price).toFixed(2)}</span>
              </button>
            ))}
          </div>

          {/* Color selection */}
          {selectedProduct && (
            <div className="space-y-2 pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Colors to offer
              </p>
              {selectedProduct.product_colors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No colors configured for this product.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.product_colors.map(({ color }) => (
                    <div key={color.id} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`color-${color.id}`}
                        checked={selectedColorIds.includes(color.id)}
                        onCheckedChange={() => toggleColor(color.id)}
                      />
                      <Label htmlFor={`color-${color.id}`} className="flex items-center gap-1.5 cursor-pointer">
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
              )}
            </div>
          )}

          {/* Mockup image */}
          {selectedProduct && (
            <div className="space-y-1.5 pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Mockup image <span className="normal-case">(optional — can upload later)</span>
              </p>
              <input
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                className="text-xs text-muted-foreground file:mr-3 file:border file:border-border file:bg-background file:px-2 file:py-1 file:text-xs file:text-foreground"
              />
              {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
            </div>
          )}
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!selectedProductId || selectedColorIds.length === 0 || isPending}
          >
            {isPending ? 'Adding…' : 'Add to campaign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
