'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  currentUrl: string | null
  uploadAction: (prevState: string | null, formData: FormData) => Promise<string | null>
}

export function MockupUpload({ currentUrl, uploadAction }: Props) {
  const [error, formAction, isPending] = useActionState(uploadAction, null)

  return (
    <div className="space-y-3">
      {currentUrl && (
        <img
          src={currentUrl}
          alt="Campaign mockup"
          className="max-h-64 w-auto border border-border object-contain"
        />
      )}
      <form action={formAction} className="flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          className="text-xs text-muted-foreground file:mr-3 file:border file:border-border file:bg-background file:px-2 file:py-1 file:text-xs file:text-foreground"
        />
        <Button type="submit" size="sm" variant="outline" disabled={isPending}>
          {isPending ? 'Uploading…' : currentUrl ? 'Replace' : 'Upload'}
        </Button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {error === null && (
        <p className="text-xs text-muted-foreground invisible" aria-hidden>saved</p>
      )}
    </div>
  )
}
