import { createClient } from '@supabase/supabase-js'

/**
 * Service role client — bypasses RLS. Server-side only.
 * Never import this in client components or expose it to the browser.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (Supabase dashboard → Settings → API → service_role key)
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
