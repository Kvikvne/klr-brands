'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = [
  { key: 'products',    label: 'Products' },
  { key: 'colors',      label: 'Colors' },
  { key: 'sizes',       label: 'Sizes' },
  { key: 'placements',  label: 'Placements' },
]

export function CatalogTabNav() {
  const searchParams = useSearchParams()
  const active = searchParams.get('tab') ?? 'products'

  return (
    <div className="flex border-b border-border mb-6">
      {TABS.map(({ key, label }) => (
        <Link
          key={key}
          href={key === 'products' ? '/admin/products' : `/admin/products?tab=${key}`}
          className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
            active === key
              ? 'border-foreground text-foreground font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
