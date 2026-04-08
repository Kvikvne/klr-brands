import Link from 'next/link'
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
import { type CampaignStatus } from '@/types'

const STATUS_VARIANT: Record<CampaignStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft:     'outline',
  live:      'default',
  closed:    'secondary',
  fulfilled: 'secondary',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, orders(count)')
    .eq('creator_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your group orders
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/campaigns/new">New campaign</Link>
        </Button>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="hover:text-muted-foreground transition-colors"
                  >
                    {campaign.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[campaign.status as CampaignStatus]}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {campaign.deadline
                    ? new Date(campaign.deadline).toLocaleDateString()
                    : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(campaign.orders as any)?.[0]?.count ?? 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-start gap-4 py-12">
          <p className="text-sm text-muted-foreground">
            You haven't created any campaigns yet.
          </p>
          <Button size="sm" asChild>
            <Link href="/dashboard/campaigns/new">Create your first campaign</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
