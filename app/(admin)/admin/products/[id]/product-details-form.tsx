'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Product {
  name: string
  description: string | null
  base_price: number
  active: boolean
}

interface Props {
  product: Product
  updateProduct: (prevState: string | null, formData: FormData) => Promise<string | null>
}

export function ProductDetailsForm({ product, updateProduct }: Props) {
  const [error, action, isPending] = useActionState(updateProduct, null)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={product.name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="description" name="description" rows={2} defaultValue={product.description ?? ''} />
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
          defaultValue={Number(product.base_price).toFixed(2)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="active">Status</Label>
        <select
          id="active"
          name="active"
          defaultValue={String(product.active)}
          className="flex h-8 w-full border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
