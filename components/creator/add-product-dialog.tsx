'use client'

import { useState, useTransition } from 'react'
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
import { addCampaignProduct } from '@/app/(creator)/dashboard/campaigns/[id]/actions'

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

export function AddProductDialog({ campaignId, availableProducts }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const selectedProduct = availableProducts.find((p) => p.id === selectedProductId)

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
    if (!selectedProductId) return
    setError(null)
    startTransition(async () => {
      const err = await addCampaignProduct(campaignId, selectedProductId, selectedColorIds)
      if (err) {
        setError(err)
      } else {
        setOpen(false)
        setSelectedProductId(null)
        setSelectedColorIds([])
        router.refresh()
      }
    })
  }

  function handleOpenChange(o: boolean) {
    setOpen(o)
    if (!o) {
      setSelectedProductId(null)
      setSelectedColorIds([])
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={availableProducts.length === 0}>
          Add product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
        </DialogHeader>

        {/* Product list */}
        <div className="space-y-1">
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
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Select colors to offer
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
                          className="inline-block h-3 w-3 rounded-full border border-border"
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
