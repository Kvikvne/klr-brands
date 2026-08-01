'use client'

import { useState, useEffect, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitOrder } from './actions'
import type { CartItem } from '@/types'

// ── Types matching the Supabase query shape ──────────────────────────────────

interface StoreColor {
  id: string
  name: string
  hex_code: string | null
}

interface StoreSize {
  id: string
  name: string
  sort_order: number
}

interface StoreProduct {
  id: string
  name: string
  description: string | null
  base_price: number
  product_sizes: Array<{ size: StoreSize }>
}

interface StoreCampaignProduct {
  id: string
  price_override: number | null
  product: StoreProduct
  campaign_product_colors: Array<{ color: StoreColor }>
}

interface StoreCampaign {
  id: string
  title: string
  slug: string
  description: string | null
  status: string
  deadline: string | null
  campaign_products: StoreCampaignProduct[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function cartTotal(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
}

// ── Main component ───────────────────────────────────────────────────────────

export function StoreClient({ campaign, mockupUrl }: { campaign: StoreCampaign; mockupUrl: string | null }) {
  const isLive = campaign.status === 'live'

  // Cart — hydrated from localStorage after mount
  const [cart, setCartState] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(`cart_${campaign.id}`)
      if (saved) setCartState(JSON.parse(saved))
    } catch {}
  }, [campaign.id])

  function setCart(items: CartItem[]) {
    setCartState(items)
    localStorage.setItem(`cart_${campaign.id}`, JSON.stringify(items))
  }

  // Per-product selection state
  const [selections, setSelections] = useState<
    Record<string, { colorId: string | null; sizeId: string | null; quantity: number }>
  >(
    Object.fromEntries(
      campaign.campaign_products.map((cp) => [cp.id, { colorId: null, sizeId: null, quantity: 1 }])
    )
  )
  const [selectionErrors, setSelectionErrors] = useState<Record<string, string>>({})

  // View state
  type View = 'store' | 'checkout' | 'confirmed'
  const [view, setView] = useState<View>('store')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup')
  const [isPending, startTransition] = useTransition()

  // ── Cart actions ────────────────────────────────────────────────────────────

  function addToCart(cp: StoreCampaignProduct) {
    const sel = selections[cp.id]
    const colors = cp.campaign_product_colors.map((c) => c.color)
    const sizes = cp.product.product_sizes.map((ps) => ps.size)

    if (colors.length > 0 && !sel.colorId) {
      setSelectionErrors((prev) => ({ ...prev, [cp.id]: 'Select a color.' }))
      return
    }
    if (sizes.length > 0 && !sel.sizeId) {
      setSelectionErrors((prev) => ({ ...prev, [cp.id]: 'Select a size.' }))
      return
    }

    setSelectionErrors((prev) => ({ ...prev, [cp.id]: '' }))

    const color = colors.find((c) => c.id === sel.colorId) ?? null
    const size = sizes.find((s) => s.id === sel.sizeId) ?? null
    const price = cp.price_override ?? cp.product.base_price

    const existing = cart.find(
      (i) =>
        i.campaign_product_id === cp.id &&
        i.color_id === sel.colorId &&
        i.size_id === sel.sizeId
    )

    if (existing) {
      setCart(
        cart.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + sel.quantity } : i
        )
      )
    } else {
      setCart([
        ...cart,
        {
          campaign_product_id: cp.id,
          product_id: cp.product.id,
          product_name: cp.product.name,
          color_id: sel.colorId,
          color_name: color?.name ?? null,
          size_id: sel.sizeId,
          size_name: size?.name ?? null,
          quantity: sel.quantity,
          unit_price: price,
        },
      ])
    }
  }

  function updateCartQty(index: number, qty: number) {
    if (qty < 1) return
    setCart(cart.map((item, i) => (i === index ? { ...item, quantity: qty } : item)))
  }

  function removeFromCart(index: number) {
    setCart(cart.filter((_, i) => i !== index))
  }

  // ── Order submission ────────────────────────────────────────────────────────

  function handleCheckout(formData: FormData) {
    setCheckoutError(null)
    startTransition(async () => {
      const result = await submitOrder(campaign.id, cart, formData)
      if ('error' in result) {
        setCheckoutError(result.error)
      } else {
        setOrderId(result.orderId)
        setCart([])
        setView('confirmed')
      }
    })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (view === 'confirmed') {
    return (
      <div className="min-h-screen flex items-start justify-center p-8">
        <div className="max-w-md w-full space-y-4 pt-16">
          <h1 className="text-xl font-semibold">Order submitted</h1>
          <p className="text-sm text-muted-foreground">
            Thanks for your order! You'll receive a confirmation email shortly.
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground border border-border p-3">
              Order reference: <span className="font-medium text-foreground">{orderId}</span>
            </p>
          )}
        </div>
      </div>
    )
  }

  if (view === 'checkout') {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-lg space-y-8">
          <div>
            <button
              onClick={() => { setView('store'); setCheckoutError(null) }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to store
            </button>
            <h1 className="mt-1.5 text-xl font-semibold">Checkout</h1>
          </div>

          {/* Cart summary */}
          <section>
            <h2 className="text-sm font-medium mb-3">Your order</h2>
            <div className="border border-border divide-y divide-border">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    {(item.color_name || item.size_name) && (
                      <span className="text-muted-foreground ml-2">
                        {[item.color_name, item.size_name].filter(Boolean).join(' / ')}
                      </span>
                    )}
                    <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                  </div>
                  <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                <span>Total</span>
                <span>${cartTotal(cart).toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Order form */}
          <section>
            <h2 className="text-sm font-medium mb-3">Your details</h2>
            <form action={handleCheckout} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="buyer_name">Name</Label>
                <Input id="buyer_name" name="buyer_name" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="buyer_email">Email</Label>
                <Input id="buyer_email" name="buyer_email" type="email" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="buyer_phone">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="buyer_phone" name="buyer_phone" type="tel" />
              </div>

              <div className="space-y-2">
                <Label>Fulfillment</Label>
                <div className="flex gap-4">
                  {(['pickup', 'delivery'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="fulfillment_type"
                        value={type}
                        checked={fulfillmentType === type}
                        onChange={() => setFulfillmentType(type)}
                        className="accent-primary"
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {fulfillmentType === 'delivery' && (
                <div className="space-y-1.5">
                  <Label htmlFor="delivery_address">Delivery address</Label>
                  <Input id="delivery_address" name="delivery_address" required />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="notes">
                  Notes <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea id="notes" name="notes" rows={2} />
              </div>

              {checkoutError && (
                <p className="text-sm text-destructive">{checkoutError}</p>
              )}

              <Button type="submit" disabled={isPending}>
                {isPending ? 'Placing order…' : 'Place order'}
              </Button>
            </form>
          </section>
        </div>
      </div>
    )
  }

  // Store listing view
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{campaign.title}</h1>
            {!isLive && (
              <Badge variant="secondary">
                {campaign.status === 'fulfilled' ? 'fulfilled' : 'closed'}
              </Badge>
            )}
          </div>
          {campaign.description && (
            <p className="text-sm text-muted-foreground">{campaign.description}</p>
          )}
          {isLive && campaign.deadline && (
            <p className="text-xs text-muted-foreground">
              Order by {formatDeadline(campaign.deadline)}
            </p>
          )}
          {!isLive && (
            <p className="text-sm text-muted-foreground border border-border p-3">
              This campaign is closed and no longer accepting orders.
            </p>
          )}
        </div>

        {/* Mockup image */}
        {mockupUrl && (
          <img
            src={mockupUrl}
            alt={`${campaign.title} mockup`}
            className="w-full max-h-96 object-contain border border-border"
          />
        )}

        {/* Products */}
        <section className="space-y-4">
          {campaign.campaign_products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products in this campaign.</p>
          ) : (
            campaign.campaign_products.map((cp) => {
              const colors = cp.campaign_product_colors.map((c) => c.color)
              const sizes = cp.product.product_sizes
                .map((ps) => ps.size)
                .sort((a, b) => a.sort_order - b.sort_order)
              const price = cp.price_override ?? cp.product.base_price
              const sel = selections[cp.id]

              return (
                <div key={cp.id} className="border border-border p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{cp.product.name}</p>
                      {cp.product.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cp.product.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      ${Number(price).toFixed(2)}
                    </span>
                  </div>

                  {/* Color selector */}
                  {colors.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Color</p>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => {
                          const active = sel.colorId === color.id
                          return (
                            <button
                              key={color.id}
                              type="button"
                              disabled={!isLive}
                              onClick={() =>
                                setSelections((prev) => ({
                                  ...prev,
                                  [cp.id]: { ...prev[cp.id], colorId: color.id },
                                }))
                              }
                              className={`flex items-center gap-1.5 px-2 py-1 text-xs border transition-colors ${
                                active
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border hover:border-foreground'
                              }`}
                            >
                              {color.hex_code && (
                                <span
                                  className="inline-block h-3 w-3 border border-current"
                                  style={{ backgroundColor: color.hex_code }}
                                />
                              )}
                              {color.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size selector */}
                  {sizes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Size</p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => {
                          const active = sel.sizeId === size.id
                          return (
                            <button
                              key={size.id}
                              type="button"
                              disabled={!isLive}
                              onClick={() =>
                                setSelections((prev) => ({
                                  ...prev,
                                  [cp.id]: { ...prev[cp.id], sizeId: size.id },
                                }))
                              }
                              className={`px-2 py-1 text-xs border transition-colors ${
                                active
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border hover:border-foreground'
                              }`}
                            >
                              {size.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity + add to cart */}
                  {isLive && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={sel.quantity}
                        onChange={(e) =>
                          setSelections((prev) => ({
                            ...prev,
                            [cp.id]: {
                              ...prev[cp.id],
                              quantity: Math.max(1, parseInt(e.target.value) || 1),
                            },
                          }))
                        }
                        className="w-16 h-8 text-xs"
                      />
                      <Button size="sm" variant="outline" onClick={() => addToCart(cp)}>
                        Add to cart
                      </Button>
                      {selectionErrors[cp.id] && (
                        <p className="text-xs text-destructive">{selectionErrors[cp.id]}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </section>

        {/* Cart */}
        {mounted && cart.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium">Cart</h2>
            <div className="border border-border divide-y divide-border">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{item.product_name}</span>
                    {(item.color_name || item.size_name) && (
                      <span className="text-muted-foreground ml-2">
                        {[item.color_name, item.size_name].filter(Boolean).join(' / ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateCartQty(i, Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-14 h-7 text-xs"
                    />
                    <span className="w-16 text-right">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(i)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                <span>Total</span>
                <span>${cartTotal(cart).toFixed(2)}</span>
              </div>
            </div>
            {isLive && (
              <div className="flex justify-end">
                <Button onClick={() => setView('checkout')}>Checkout</Button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
