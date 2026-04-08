'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Campaign {
  title: string
  slug: string
  description: string | null
  deadline: string | null
}

interface Props {
  campaign: Campaign
  isDraft: boolean
  updateDetails: (prevState: string | null, formData: FormData) => Promise<string | null>
}

export function DetailsFormClient({ campaign, isDraft, updateDetails }: Props) {
  const [error, action, isPending] = useActionState(updateDetails, null)

  // Format deadline for datetime-local input (strips timezone offset)
  const deadlineValue = campaign.deadline
    ? new Date(campaign.deadline).toISOString().slice(0, 16)
    : ''

  if (!isDraft) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex gap-2">
          <span className="w-24 text-muted-foreground shrink-0">Slug</span>
          <span>/store/{campaign.slug}</span>
        </div>
        {campaign.description && (
          <div className="flex gap-2">
            <span className="w-24 text-muted-foreground shrink-0">Description</span>
            <span>{campaign.description}</span>
          </div>
        )}
        {campaign.deadline && (
          <div className="flex gap-2">
            <span className="w-24 text-muted-foreground shrink-0">Deadline</span>
            <span>{new Date(campaign.deadline).toLocaleString()}</span>
          </div>
        )}
      </div>
    )
  }

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

      <div className="space-y-1.5">
        <Label htmlFor="deadline">
          Order deadline <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input id="deadline" name="deadline" type="datetime-local" defaultValue={deadlineValue} />
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
