import { createClient } from '@/lib/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, product_colors(count), product_sizes(count)')
    .order('sort_order', { ascending: true })

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the catalog
          </p>
        </div>
        <Button size="sm">Add product</Button>
      </div>

      {products && products.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Base price</TableHead>
              <TableHead>Colors</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  ${Number(product.base_price).toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(product.product_colors as any)?.[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(product.product_sizes as any)?.[0]?.count ?? 0}
                </TableCell>
                <TableCell>
                  <Badge variant={product.active ? 'default' : 'secondary'}>
                    {product.active ? 'active' : 'inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No products yet. Add one to get started.</p>
      )}
    </div>
  )
}
