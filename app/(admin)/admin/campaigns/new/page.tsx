import Link from 'next/link'
import { createClient } from '@/lib/server'
import { NewCampaignForm } from './new-campaign-form'
import { createCampaignAsAdmin } from './actions'

export default async function AdminNewCampaignPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // All profiles the admin can assign the campaign to (creators + the admin themselves)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .order('full_name')

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div>
        <Link
          href="/admin/campaigns"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Campaigns
        </Link>
        <h1 className="mt-1.5 text-xl font-semibold">New campaign</h1>
      </div>

      <NewCampaignForm
        profiles={profiles ?? []}
        currentUserId={user?.id ?? ''}
        action={createCampaignAsAdmin}
      />
    </div>
  )
}
