import { createClient } from '@/lib/server'
import { CreateCreatorDialog } from '@/components/admin/create-creator-dialog'
import { DeleteCreatorButton } from '@/components/admin/delete-creator-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function CreatorsPage() {
  const supabase = await createClient()

  const { data: creators } = await supabase
    .from('profiles')
    .select('*, campaigns(count)')
    .eq('role', 'creator')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Creators</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage creator accounts
          </p>
        </div>
        <CreateCreatorDialog />
      </div>

      {creators && creators.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.map((creator) => (
              <TableRow key={creator.id}>
                <TableCell className="font-medium">{creator.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{creator.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {(creator.campaigns as any)?.[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(creator.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteCreatorButton creatorId={creator.id} creatorName={creator.full_name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No creators yet. Add one to get started.</p>
      )}
    </div>
  )
}
