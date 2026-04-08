# Group Order Platform

A custom tee shirt and sticker group-order platform for a small apartment-based business. Creators build campaign storefronts, buyers place orders anonymously, and the admin manages everything end-to-end.

## Roles

| Role | Description |
|------|-------------|
| **Admin** | Business owner. Manages catalog, creators, campaigns, orders, and fulfillment. |
| **Creator** | Group organizer. Creates campaign drafts, picks products/colors, publishes storefronts. |
| **Buyer** | Anonymous customer. Browses storefront, adds to cart, submits order form. No account required. |

## Stack

- **Next.js** (App Router, server actions)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Supabase** — Postgres, Auth, Storage
- **Vercel** — hosting + cron jobs
- **Nodemailer** (Gmail SMTP) — email notifications
- **pdf-lib** — production PDF exports

## Setup

### 1. Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the **anon/public** key (Supabase renamed it in v0.10+)
- `SUPABASE_SERVICE_ROLE_KEY` is used server-side only for admin auth operations (inviting creators)

### 2. Database

Run `supabase/schema.sql` in the Supabase SQL editor. This creates:

- All tables, enums, indexes, and triggers
- RLS policies (admin bypass via `is_admin()` security definer function)
- `update_updated_at()` trigger on all relevant tables

### 3. Create admin user

1. Create a user in Supabase Auth dashboard
2. Insert a row into `profiles`:
   ```sql
   INSERT INTO profiles (id, email, role) VALUES ('<auth-user-id>', 'admin@example.com', 'admin');
   ```

### 4. Supabase Auth settings

In the Supabase dashboard under **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (or your production URL)
- **Redirect URLs**: add `http://localhost:3000/auth/confirm`

The invite email for creators uses an implicit token flow — the `/auth/confirm` client page handles extracting tokens from the URL hash and setting the session.

### 5. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's built

- [x] Auth — login, invite flow, set-password for new creators
- [x] Root middleware — route protection by role
- [x] Admin — overview dashboard with stats
- [x] Admin — creator management (invite, delete)
- [x] Admin — product catalog (products, colors, sizes, placements) with URL-based tabs
- [x] Admin — product detail page (edit details, assign colors/sizes/placements)
- [x] Creator — dashboard with campaign list
- [x] Creator — new campaign form
- [x] Creator — campaign editor (details, product selection, color selection, publish/unpublish)

## What's not built yet

- [ ] Public storefront (`/store/[slug]`) — localStorage cart, anonymous order form
- [ ] Design file uploads — per campaign product + placement (Supabase Storage)
- [ ] Admin campaign detail — view orders, mark fulfilled
- [ ] Email notifications — buyer confirmation, admin alerts, daily digest
- [ ] Production exports — NLA purchase list, print spec PDF, distribution list
- [ ] Cron job — auto-close campaigns past deadline
- [ ] Mockup images — admin uploads per product + color

## Deployment

Deploy to Vercel. Set the same environment variables in the Vercel project settings. The `NEXT_PUBLIC_SITE_URL` should be your production domain.
