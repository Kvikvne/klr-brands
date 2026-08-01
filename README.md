# Group Order Platform

A custom tee shirt and sticker group-order platform for a small apartment-based business. Creators build campaign storefronts, buyers place orders anonymously, and the admin manages everything end-to-end.

## Roles

| Role | Description |
|------|-------------|
| **Admin** | Business owner. Manages catalog, creators, campaigns, orders, and fulfillment. |
| **Creator** | Group organizer. Creates campaign drafts, picks products/colors, publishes storefronts. |
| **Buyer** | Anonymous customer. Browses storefront, adds to cart, submits order form. No account required. |

## Stack

- **Next.js** (App Router, server actions, server components)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Supabase** — Postgres + RLS, Auth, Storage (storage not yet used)
- **Nodemailer** (Gmail SMTP) — buyer confirmation email on order submit
- **Vercel** — hosting
- **pdf-lib** — production PDF exports (not yet implemented)

---

## Setup

### 1. Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the anon/public key (Supabase v0.10+ naming)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, used for admin auth operations (inviting creators)
- `GMAIL_APP_PASSWORD` — generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords); requires 2FA enabled on the account

### 2. Database

Run `supabase/schema.sql` in the Supabase SQL editor. This creates all tables, enums, RLS policies, indexes, and triggers.

Then apply this RLS fix manually (allows creators to publish and unpublish their campaigns):

```sql
create policy "creators: update own campaigns"
  on campaigns for update
  using (auth.uid() = creator_id and status in ('draft', 'live'))
  with check (auth.uid() = creator_id);
```

### 3. Create admin user

1. Create a user in Supabase Auth dashboard (email + password)
2. Insert a profile row:
   ```sql
   insert into profiles (id, email, full_name, role)
   values ('<auth-user-id>', 'admin@example.com', 'Your Name', 'admin');
   ```

### 4. Supabase Auth settings

In **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: add `http://localhost:3000/auth/confirm`

The creator invite email uses an implicit token flow — `/auth/confirm` is a client page that reads tokens from the URL hash and sets the session.

### 5. Run locally

```bash
npm install
npm run dev
```

---

## What's built

### Auth & routing
- [x] Login (email + password), role-based redirect to `/admin` or `/dashboard`
- [x] Creator invite flow — admin sends invite email, creator sets password via `/set-password`
- [x] Route protection middleware — public routes: `/`, `/login`, `/store/*`, `/auth/*`

### Admin
- [x] `/admin` — overview with stat cards and recent campaigns
- [x] `/admin/creators` — invite creators, delete creators
- [x] `/admin/products` — tabbed catalog: Products / Colors / Sizes / Placements, full CRUD
- [x] `/admin/products/[id]` — edit product, assign colors/sizes/placements
- [x] `/admin/campaigns` — all campaigns list with status, creator, deadline, order count
- [x] `/admin/campaigns/[id]` — edit details, change status (draft/live/closed/fulfilled), view all orders with line items, delete campaign

### Creator
- [x] `/dashboard` — own campaigns list
- [x] `/dashboard/campaigns/new` — create campaign draft
- [x] `/dashboard/campaigns/[id]` — edit details, add/remove products with color selection, publish/unpublish

### Public storefront
- [x] `/store/[slug]` — product listing with color/size selectors
- [x] localStorage cart (per campaign), quantity editing, remove items
- [x] Checkout form — name, email, phone, pickup/delivery, delivery address, notes
- [x] Buyer confirmation email sent on order submit (Nodemailer/Gmail)
- [x] Closed/fulfilled campaigns show a banner; ordering disabled

---

## What's not built yet

- [ ] **Design uploads** — creator uploads design files per campaign product + placement (needs Supabase Storage bucket + UI)
- [ ] **Mockup images** — admin uploads mockup per product + color; storefront currently shows no images
- [ ] **Admin new order alert** — email to admin when a buyer places an order (`lib/mailer.ts` already exists, just needs a second `sendMail` call in `submitOrder`)
- [ ] **Production exports** — NLA purchase list, print spec PDF, distribution list (pdf-lib not yet used)
- [ ] **Vercel Cron** — auto-close campaigns past their deadline
- [ ] **Daily digest email** — order summary sent to admin on a schedule

---

## Deployment

Deploy to Vercel. Set all environment variables in the Vercel project settings. Update `NEXT_PUBLIC_SITE_URL` to your production domain and add the production `/auth/confirm` URL to Supabase redirect URLs.
