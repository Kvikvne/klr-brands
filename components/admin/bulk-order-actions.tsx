'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { bulkAdvanceOrders, exportCampaignCsv } from '@/app/(admin)/admin/campaigns/[id]/actions'
import type { OrderStatus } from '@/types'

interface Props {
  campaignId: string
  pendingCount: number
  confirmedCount: number
}

export function BulkOrderActions({ campaignId, pendingCount, confirmedCount }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  function handleBulk(from: OrderStatus, to: OrderStatus) {
    setError(null)
    startTransition(async () => {
      const err = await bulkAdvanceOrders(campaignId, from, to)
      if (err) setError(err)
      else router.refresh()
    })
  }

  async function handleExport() {
    setError(null)
    setExporting(true)
    try {
      const result = await exportCampaignCsv(campaignId)
      if ('error' in result) {
        setError(result.error)
        return
      }
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campaign-${campaignId}-orders.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending || pendingCount === 0}
          onClick={() => handleBulk('pending', 'confirmed')}
        >
          Confirm all pending
          {pendingCount > 0 && (
            <span className="ml-1.5 text-muted-foreground">({pendingCount})</span>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isPending || confirmedCount === 0}
          onClick={() => handleBulk('confirmed', 'fulfilled')}
        >
          Fulfill all confirmed
          {confirmedCount > 0 && (
            <span className="ml-1.5 text-muted-foreground">({confirmedCount})</span>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={exporting}
          onClick={handleExport}
        >
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
