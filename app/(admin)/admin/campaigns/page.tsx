import Link from 'next/link'
import { createClient } from '@/lib/server'
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

export default async function CampaignsPage() {
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, profiles(full_name), orders(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Campaigns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All campaigns across all creators
        </p>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Creator</TableHead>
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
                    href={`/admin/campaigns/${campaign.id}`}
                    className="hover:text-muted-foreground transition-colors"
                  >
                    {campaign.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(campaign.profiles as any)?.full_name ?? '—'}
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
        <p className="text-sm text-muted-foreground">No campaigns yet.</p>
      )}
    </div>
  )
}
