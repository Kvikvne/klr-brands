import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/server'
import { ProductDetailsForm } from './product-details-form'
import { ProductAssignments } from './product-assignments'
import { updateProduct, updateProductColors, updateProductSizes, updateProductPlacements } from './actions'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: product },
    { data: allColors },
    { data: allSizes },
    { data: allPlacements },
    { data: productColors },
    { data: productSizes },
    { data: productPlacements },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('colors').select('*').order('sort_order'),
    supabase.from('sizes').select('*').order('sort_order'),
    supabase.from('placements').select('*').order('sort_order'),
    supabase.from('product_colors').select('color_id').eq('product_id', id),
    supabase.from('product_sizes').select('size_id').eq('product_id', id),
    supabase.from('product_placements').select('placement_id').eq('product_id', id),
  ])

  if (!product) notFound()

  const assignedColorIds = (productColors ?? []).map((r) => r.color_id)
  const assignedSizeIds = (productSizes ?? []).map((r) => r.size_id)
  const assignedPlacementIds = (productPlacements ?? []).map((r) => r.placement_id)

  const boundUpdateProduct = updateProduct.bind(null, id)
  const boundUpdateColors = updateProductColors.bind(null, id)
  const boundUpdateSizes = updateProductSizes.bind(null, id)
  const boundUpdatePlacements = updateProductPlacements.bind(null, id)

  return (
    <div className="p-8 max-w-2xl space-y-10">
      <div>
        <Link
          href="/admin/products"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Products
        </Link>
        <h1 className="mt-1.5 text-xl font-semibold">{product.name}</h1>
      </div>

      <section>
        <h2 className="text-sm font-medium mb-4">Details</h2>
        <ProductDetailsForm product={product} updateProduct={boundUpdateProduct} />
      </section>

      <section>
        <h2 className="text-sm font-medium mb-4">Assignments</h2>
        <ProductAssignments
          allColors={allColors ?? []}
          allSizes={allSizes ?? []}
          allPlacements={allPlacements ?? []}
          assignedColorIds={assignedColorIds}
          assignedSizeIds={assignedSizeIds}
          assignedPlacementIds={assignedPlacementIds}
          updateColors={boundUpdateColors}
          updateSizes={boundUpdateSizes}
          updatePlacements={boundUpdatePlacements}
        />
      </section>
    </div>
  )
}
