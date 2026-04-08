import { notFound } from 'next/navigation'
import { createClient } from '@/lib/server'
import { StoreClient } from './store-client'

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select(
      `
      id, title, slug, description, status, deadline,
      campaign_products (
        id,
        price_override,
        product:products (
          id, name, description, base_price,
          product_sizes ( size:sizes ( id, name, sort_order ) )
        ),
        campaign_product_colors ( color:colors ( id, name, hex_code ) )
      )
    `
    )
    .eq('slug', slug)
    .in('status', ['live', 'closed', 'fulfilled'])
    .single()

  if (!campaign) notFound()

  return <StoreClient campaign={campaign as any} />
}
