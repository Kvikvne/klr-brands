@AGENTS.md

## Project Overview

This project is a **custom tee shirt and sticker group-order platform** for a small apartment-based business.

It allows:

- **Admin** to manage creators, products, pricing, campaigns, and fulfillment
- **Creators** to create campaign-based storefronts for their group
- **Buyers** to place orders through a shared storefront link

### Business rules

- No public marketplace
- No buyer accounts
- No payment processing
- Fulfillment is **pickup or delivery only**
- Orders are collected first, then invoiced and fulfilled manually
- The platform is for a **closed community**, not general public use

This is a **v1 MVP** optimized for simplicity, low monthly cost, low maintenance, and fast implementation by one developer.

---

## Tech Stack

- **Next.js 16** — App Router, server actions, server components
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** — component library (radix-ui v1, no `@radix-ui/*` packages)
- **Supabase Postgres** — database with RLS
- **Supabase Auth** — email/password + invite flow
- **Supabase Storage** — design file and mockup image uploads (not yet implemented)
- **Vercel** — hosting
- **Gmail SMTP + Nodemailer** — buyer order confirmation email implemented; admin alerts not yet
- **Vercel Cron** — scheduled jobs (not yet implemented)
- **pdf-lib** — PDF generation (not yet implemented)

### Architecture goal

Single monolithic Next.js app. Do not introduce Prisma, a separate backend, Redis, queues, Docker, or unnecessary abstractions.

---

## Styling conventions

- **Always use semantic CSS variable tokens**, never raw Tailwind color values.
  - ✅ `text-muted-foreground`, `bg-background`, `border-border`, `bg-sidebar`, `text-sidebar-primary-foreground`
  - ❌ `text-zinc-500`, `bg-white`, `border-gray-200`
- **Use shadcn/ui components** wherever available before writing custom markup.
- `--radius: 0` — no border radius anywhere (sharp corners throughout).
- Font is monospace (`font-mono`) globally.

---

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never expose client-side
NEXT_PUBLIC_SITE_URL=             # e.g. http://localhost:3000
GMAIL_USER=                       # Gmail address used as the sender
GMAIL_APP_PASSWORD=               # Google App Password (not regular password); requires 2FA on account
```

---

## Core Product Roles

### Admin
Full access. Creates creator accounts, manages catalog, views all campaigns and orders, downloads production exports, marks campaigns fulfilled.

### Creator
Authenticated group organizer. Creates campaigns, selects products/colors, uploads designs, publishes campaigns, views orders for own campaigns. Cannot set prices or access other creators' data.

### Buyer
Anonymous. Accesses storefront via shared link, adds items to localStorage cart, submits one order form. No account, no online payment.

---

## Build Status

### ✅ Done

**Auth & routing**
- `middleware.ts` — session refresh + route protection; public routes: `/`, `/login`, `/store/*`, `/auth/callback`, `/auth/confirm`
- `/login` — email + password, redirects to `/admin` or `/dashboard` based on role
- `/set-password` — used after creator accepts invite email
- `/auth/callback` — PKCE token exchange (route handler)
- `/auth/confirm` — implicit/hash token exchange (client page, used for invite emails)

**Admin**
- `/admin` — overview with stat cards (creators, live campaigns, orders) and recent campaigns table
- `/admin/creators` — list creators, invite new creators (Supabase invite email), delete creators
- `/admin/products` — tabbed catalog: Products / Colors / Sizes / Placements; full CRUD for each
- `/admin/products/[id]` — edit product details, assign colors/sizes/placements via checkboxes
- `/admin/campaigns` — list all campaigns with status, creator, deadline, order count
- `/admin/campaigns/[id]` — edit campaign details, change status (draft/live/closed/fulfilled), view products, view all orders with line items, delete campaign

**Creator**
- `/dashboard` — list own campaigns with status, deadline, order count
- `/dashboard/campaigns/new` — create campaign draft (title, slug, description, deadline; defaults to 2 weeks)
- `/dashboard/campaigns/[id]` — edit campaign details, add/remove products with color selection, publish/unpublish

**Public storefront**
- `/store/[slug]` — campaign listing with color/size selectors, localStorage cart (per-campaign), order submission
- Buyer confirmation email sent via Nodemailer (Gmail SMTP) on successful order

**Database**
- Full schema in `supabase/schema.sql` — 15 tables, RLS on all, `is_admin()` helper function
- TypeScript types in `types/index.ts`
- **RLS fix applied manually in Supabase:** campaigns update policy allows creators to publish (draft→live) and unpublish (live→draft):
  ```sql
  create policy "creators: update own campaigns"
    on campaigns for update
    using (auth.uid() = creator_id and status in ('draft', 'live'))
    with check (auth.uid() = creator_id);
  ```

### 🔲 Not yet built

- **Design uploads** — creator uploads design files per campaign product + placement (needs Supabase Storage bucket + UI)
- **Mockup images** — admin uploads mockup per product + color (needs Supabase Storage bucket + UI); storefront currently shows no images
- **Admin new order alert** — email to admin when a buyer submits an order (`lib/mailer.ts` exists, just needs a second send call in `submitOrder`)
- **Production exports** — NLA purchase list, print spec PDF, distribution list (pdf-lib not yet used)
- **Vercel Cron** — auto-close campaigns past their deadline (`vercel.json` cron + route handler not yet created)
- **Daily digest email** — summary of orders sent to admin on a schedule

---

## Supabase setup notes

1. Run `supabase/schema.sql` in the SQL editor
2. Create admin user in Auth dashboard (email + password)
3. Insert admin profile manually:
   ```sql
   insert into profiles (id, role, full_name, email)
   values ('<uuid>', 'admin', 'Your Name', 'you@example.com');
   ```
4. Add `http://localhost:3000/auth/confirm` to Auth → URL Configuration → Redirect URLs

---

## Actual folder structure

```
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx                        # role check → admin only
│   │   └── admin/
│   │       ├── page.tsx                      # overview / stat cards
│   │       ├── campaigns/
│   │       │   ├── page.tsx                  # all campaigns table
│   │       │   └── [id]/
│   │       │       ├── page.tsx              # detail: edit, orders, delete
│   │       │       ├── actions.ts
│   │       │       ├── campaign-details-form.tsx
│   │       │       └── delete-campaign-button.tsx
│   │       ├── creators/
│   │       │   ├── page.tsx
│   │       │   └── actions.ts
│   │       └── products/
│   │           ├── page.tsx                  # tabbed catalog
│   │           ├── actions.ts
│   │           └── [id]/
│   │               ├── page.tsx
│   │               ├── actions.ts
│   │               ├── product-details-form.tsx
│   │               └── product-assignments.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── set-password/
│   │       ├── page.tsx
│   │       └── actions.ts
│   ├── (creator)/
│   │   ├── layout.tsx                        # role check → creator only
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── campaigns/
│   │           ├── new/
│   │           │   ├── page.tsx
│   │           │   └── actions.ts
│   │           └── [id]/
│   │               ├── page.tsx
│   │               ├── actions.ts
│   │               ├── campaign-actions.tsx  # publish/unpublish client component
│   │               └── details-form-client.tsx
│   ├── store/
│   │   └── [slug]/
│   │       ├── page.tsx                      # server fetch → passes to client
│   │       ├── store-client.tsx              # cart, selectors, checkout, confirmation
│   │       └── actions.ts                    # submitOrder + buyer confirmation email
│   ├── auth/
│   │   ├── callback/route.ts                 # PKCE token exchange
│   │   └── confirm/page.tsx                  # hash token exchange (invite flow)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx
│   │   ├── catalog-tab-nav.tsx
│   │   ├── create-product-dialog.tsx
│   │   ├── create-catalog-item-dialog.tsx
│   │   ├── create-creator-dialog.tsx
│   │   ├── delete-catalog-item-button.tsx
│   │   └── delete-creator-button.tsx
│   ├── creator/
│   │   ├── sidebar.tsx
│   │   ├── add-product-dialog.tsx
│   │   └── campaign-product-card.tsx
│   └── ui/                                   # shadcn components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── table.tsx
│       └── textarea.tsx
├── lib/
│   ├── client.ts                             # Supabase browser client
│   ├── server.ts                             # Supabase server client (cookies)
│   ├── middleware.ts                         # updateSession() — session refresh only
│   ├── admin-client.ts                       # Supabase service role client (server-only)
│   ├── mailer.ts                             # Nodemailer transporter + sendOrderConfirmation()
│   └── utils.ts                              # cn() helper
├── supabase/
│   └── schema.sql
├── types/
│   └── index.ts
└── middleware.ts                             # route protection + session refresh
```

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
