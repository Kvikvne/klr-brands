import { verifyCancelToken } from '@/lib/cancel-token'
import { createClient } from '@/lib/server'
import { CancelForm } from './cancel-form'

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>
}) {
  const { id, token } = await searchParams

  // Missing or invalid link
  if (!id || !token || !verifyCancelToken(id, token)) {
    return <Message text="This cancellation link is invalid." />
  }

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, status, buyer_name,
      campaign:campaigns ( title )
    `)
    .eq('id', id)
    .single()

  if (!order) return <Message text="Order not found." />

  const campaignTitle = (order.campaign as any)?.title ?? 'this campaign'

  if (order.status !== 'pending') {
    return (
      <Message text={
        order.status === 'cancelled'
          ? 'This order has already been cancelled.'
          : 'This order can no longer be cancelled — materials have already been ordered. Contact us directly if you need help.'
      } />
    )
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-8">
      <div className="max-w-md w-full space-y-4 pt-16">
        <h1 className="text-xl font-semibold">Cancel order</h1>
        <p className="text-sm text-muted-foreground">
          Hi {order.buyer_name} — you're about to cancel your order for{' '}
          <span className="font-medium text-foreground">{campaignTitle}</span>.
          This cannot be undone.
        </p>
        <CancelForm orderId={id} token={token} />
      </div>
    </div>
  )
}

function Message({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-start justify-center p-8">
      <div className="max-w-md w-full pt-16">
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
