'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { publishCampaign, unpublishCampaign } from './actions'

interface Props {
  campaignId: string
  status: string
}

export function CampaignActions({ campaignId, status }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handlePublish() {
    setError(null)
    startTransition(async () => {
      const err = await publishCampaign(campaignId)
      if (err) setError(err)
    })
  }

  function handleUnpublish() {
    setError(null)
    startTransition(async () => {
      const err = await unpublishCampaign(campaignId)
      if (err) setError(err)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      {status === 'draft' && (
        <Button size="sm" onClick={handlePublish} disabled={isPending}>
          {isPending ? 'Publishing…' : 'Publish'}
        </Button>
      )}
      {status === 'live' && (
        <Button size="sm" variant="outline" onClick={handleUnpublish} disabled={isPending}>
          {isPending ? 'Unpublishing…' : 'Unpublish'}
        </Button>
      )}
      {error && <p className="text-xs text-destructive max-w-48 text-right">{error}</p>}
    </div>
  )
}
