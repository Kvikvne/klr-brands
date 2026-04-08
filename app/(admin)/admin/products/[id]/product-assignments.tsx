'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Item { id: string; name: string; hex_code?: string | null }

interface Props {
  allColors: Item[]
  allSizes: Item[]
  allPlacements: Item[]
  assignedColorIds: string[]
  assignedSizeIds: string[]
  assignedPlacementIds: string[]
  updateColors: (ids: string[]) => Promise<string | null>
  updateSizes: (ids: string[]) => Promise<string | null>
  updatePlacements: (ids: string[]) => Promise<string | null>
}

export function ProductAssignments({
  allColors, allSizes, allPlacements,
  assignedColorIds, assignedSizeIds, assignedPlacementIds,
  updateColors, updateSizes, updatePlacements,
}: Props) {
  const router = useRouter()
  const [colorIds, setColorIds] = useState(assignedColorIds)
  const [sizeIds, setSizeIds] = useState(assignedSizeIds)
  const [placementIds, setPlacementIds] = useState(assignedPlacementIds)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggle(id: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const results = await Promise.all([
        updateColors(colorIds),
        updateSizes(sizeIds),
        updatePlacements(placementIds),
      ])
      const err = results.find(Boolean)
      if (err) setError(err)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Colors</p>
        {allColors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No colors in catalog yet.</p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {allColors.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5">
                <Checkbox
                  id={`color-${c.id}`}
                  checked={colorIds.includes(c.id)}
                  onCheckedChange={() => toggle(c.id, colorIds, setColorIds)}
                />
                <Label htmlFor={`color-${c.id}`} className="flex items-center gap-1.5 cursor-pointer">
                  {c.hex_code && (
                    <span
                      className="inline-block h-3 w-3 border border-border"
                      style={{ backgroundColor: c.hex_code }}
                    />
                  )}
                  {c.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sizes</p>
        {allSizes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sizes in catalog yet.</p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {allSizes.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <Checkbox
                  id={`size-${s.id}`}
                  checked={sizeIds.includes(s.id)}
                  onCheckedChange={() => toggle(s.id, sizeIds, setSizeIds)}
                />
                <Label htmlFor={`size-${s.id}`} className="cursor-pointer">{s.name}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placements */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Placements</p>
        {allPlacements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No placements in catalog yet.</p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {allPlacements.map((pl) => (
              <div key={pl.id} className="flex items-center gap-1.5">
                <Checkbox
                  id={`placement-${pl.id}`}
                  checked={placementIds.includes(pl.id)}
                  onCheckedChange={() => toggle(pl.id, placementIds, setPlacementIds)}
                />
                <Label htmlFor={`placement-${pl.id}`} className="cursor-pointer">{pl.name}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button size="sm" onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving…' : 'Save assignments'}
      </Button>
    </div>
  )
}
