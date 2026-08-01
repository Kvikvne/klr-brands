'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { CampaignStatus } from '@/types'

const STATUSES: CampaignStatus[] = ['draft', 'live', 'closed', 'fulfilled']

interface Campaign {
  title: string
  slug: string
  description: string | null
  deadline: string | null
  status: CampaignStatus
}

interface Props {
  campaign: Campaign
  updateAction: (prevState: string | null, formData: FormData) => Promise<string | null>
}

export function CampaignDetailsForm({ campaign, updateAction }: Props) {
  const [error, action, isPending] = useActionState(updateAction, null)

  const deadlineValue = campaign.deadline
    ? new Date(campaign.deadline).toISOString().slice(0, 16)
    : ''

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={campaign.title} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Storefront URL</Label>
        <div className="flex">
          <span className="flex h-8 items-center border border-r-0 border-border bg-muted px-2.5 text-xs text-muted-foreground">
            /store/
          </span>
          <Input
            id="slug"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            minLength={3}
            maxLength={50}
            defaultValue={campaign.slug}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={campaign.description ?? ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="deadline">
            Deadline <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="deadline"
            name="deadline"
            type="datetime-local"
            defaultValue={deadlineValue}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={campaign.status}
            className="flex h-8 w-full border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {error === null && (
        <p className="text-xs text-muted-foreground invisible" aria-hidden>saved</p>
      )}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
