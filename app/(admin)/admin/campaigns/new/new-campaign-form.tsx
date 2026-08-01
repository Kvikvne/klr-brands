'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
}

interface Props {
  profiles: Profile[]
  currentUserId: string
  action: (prevState: string | null, formData: FormData) => Promise<string | null>
}

export function NewCampaignForm({ profiles, currentUserId, action }: Props) {
  const [error, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="creator_id">Creator</Label>
        <select
          id="creator_id"
          name="creator_id"
          defaultValue={currentUserId}
          required
          className="flex h-8 w-full border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} ({p.role === 'admin' ? 'you' : p.email})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
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
            placeholder="my-campaign"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="description" name="description" rows={3} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deadline">
          Order deadline <span className="text-muted-foreground">(optional, defaults to 2 weeks)</span>
        </Label>
        <Input id="deadline" name="deadline" type="datetime-local" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create campaign'}
      </Button>
    </form>
  )
}
