import Link from 'next/link'
import { createClient } from '@/lib/server'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { CatalogTabNav } from '@/components/admin/catalog-tab-nav'
import { CreateProductDialog } from '@/components/admin/create-product-dialog'
import { CreateCatalogItemDialog } from '@/components/admin/create-catalog-item-dialog'
import { DeleteCatalogItemButton } from '@/components/admin/delete-catalog-item-button'
import {
  createColor, deleteColor,
  createSize, deleteSize,
  createPlacement, deletePlacement,
  deleteProduct,
} from './actions'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'products' } = await searchParams
  const supabase = await createClient()

  const [
    { data: products },
    { data: colors },
    { data: sizes },
    { data: placements },
  ] = await Promise.all([
    supabase.from('products').select('*, product_colors(count), product_sizes(count)').order('sort_order'),
    supabase.from('colors').select('*').order('sort_order'),
    supabase.from('sizes').select('*').order('sort_order'),
    supabase.from('placements').select('*').order('sort_order'),
  ])

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">Products, colors, sizes, and placements</p>
        </div>
        {tab === 'products'   && <CreateProductDialog />}
        {tab === 'colors'     && <CreateCatalogItemDialog type="color"     action={createColor} />}
        {tab === 'sizes'      && <CreateCatalogItemDialog type="size"      action={createSize} />}
        {tab === 'placements' && <CreateCatalogItemDialog type="placement" action={createPlacement} />}
      </div>

      <CatalogTabNav />

      {/* Products */}
      {tab === 'products' && (
        <>
          {products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base price</TableHead>
                  <TableHead>Colors</TableHead>
                  <TableHead>Sizes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/products/${p.id}`} className="hover:text-muted-foreground transition-colors">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">${Number(p.base_price).toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{(p.product_colors as any)?.[0]?.count ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">{(p.product_sizes as any)?.[0]?.count ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={p.active ? 'default' : 'secondary'}>
                        {p.active ? 'active' : 'inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteCatalogItemButton id={p.id} label={p.name} deleteAction={deleteProduct} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          )}
        </>
      )}

      {/* Colors */}
      {tab === 'colors' && (
        <>
          {colors && colors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Hex</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.hex_code ?? '—'}</TableCell>
                    <TableCell>
                      {c.hex_code && (
                        <span
                          className="inline-block h-4 w-4 border border-border"
                          style={{ backgroundColor: c.hex_code }}
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteCatalogItemButton id={c.id} label={c.name} deleteAction={deleteColor} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No colors yet.</p>
          )}
        </>
      )}

      {/* Sizes */}
      {tab === 'sizes' && (
        <>
          {sizes && sizes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-right">
                      <DeleteCatalogItemButton id={s.id} label={s.name} deleteAction={deleteSize} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No sizes yet.</p>
          )}
        </>
      )}

      {/* Placements */}
      {tab === 'placements' && (
        <>
          {placements && placements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {placements.map((pl) => (
                  <TableRow key={pl.id}>
                    <TableCell className="font-medium">{pl.name}</TableCell>
                    <TableCell className="text-right">
                      <DeleteCatalogItemButton id={pl.id} label={pl.name} deleteAction={deletePlacement} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No placements yet.</p>
          )}
        </>
      )}
    </div>
  )
}
