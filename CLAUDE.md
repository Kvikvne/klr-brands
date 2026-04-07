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

This is a **v1 MVP** optimized for:

- simplicity

- low monthly cost

- low maintenance

- fast implementation by one developer

---

## Recommended Tech Stack

Use the simplest possible stack:

- **Next.js**

- **TypeScript**

- **Tailwind CSS**

- **shadcn/ui**

- **Supabase Postgres**

- **Supabase Auth**

- **Supabase Storage**

- **Vercel**

- **Gmail SMTP Nodemailer** for email

- **Vercel Cron** for scheduled jobs

- **pdf-lib** for PDF generation

### Architecture goal

Keep this as a **single monolithic Next.js app**.

Do **not** introduce:

- Prisma for v1

- separate Express/FastAPI backend

- Redis

- queues/workers

- Docker/VPS complexity

- self-hosted storage

- unnecessary abstractions

---

## Core Product Roles

### Admin

The business owner. Full access.

Can:

- create and manage creator accounts

- manage catalog

- set pricing

- view all campaigns and orders

- download production package

- mark campaigns fulfilled

### Creator

Authenticated group organizer.

Can:

- log in

- create campaign drafts

- choose products and colors

- upload design files by placement

- publish campaign

- view orders for own campaigns

Cannot:

- set or edit prices

- access other creators' campaigns

### Buyer

Anonymous customer.

Can:

- access storefront through shared campaign link

- browse available products

- add items to local cart

- submit one order form

Cannot:

- create account

- edit campaign

- pay online

---

## Product Scope

### Main features for v1

1. **Login**

    - admin and creator only

    - no public signup

    - creator accounts created by admin

2. **Admin catalog management**

    - products

    - colors

    - sizes

    - placements

    - mockup images

    - prices

3. **Creator campaign builder**

    - details

    - product selection

    - design uploads

    - review

    - publish

4. **Public storefront**

    - campaign-based

    - anonymous ordering

    - localStorage cart

    - order form submission

    - closed state after expiration

5. **Order storage**

    - save order and order items

    - associate with campaign

6. **Email notifications**

    - buyer confirmation

    - admin new campaign notification

    - admin daily digest

7. **Production exports**

    - NLA purchase list

    - print spec sheet PDF

    - distribution list

8. **Campaign lifecycle**

    - draft

    - live

    - closed

    - fulfilled

---

## Architecture

### App structure

Use one Next.js app with:

- public pages

- admin pages

- creator pages

- route handlers / server actions

### Hosting

- Deploy app on **Vercel**

- Use **Supabase** for database, auth, and file storage

### Scheduled jobs

Use **Vercel Cron** for:

- closing expired campaigns

- sending daily order summaries

### File storage

Use **Supabase Storage** for:

- product mockup images

- uploaded campaign design files

- optional generated export files

### PDF generation

Use **pdf-lib** to generate production PDFs on demand.

---

## Folder Structure

```txt

/

├── app/

│   ├── (public)/

│   │   ├── page.tsx

│   │   └── store/

│   │       └── [slug]/

│   │           └── page.tsx

│   ├── (auth)/

│   │   └── login/

│   │       └── page.tsx

│   ├── (creator)/

│   │   └── dashboard/

│   │       ├── page.tsx

│   │       └── campaigns/

│   │           ├── new/

│   │           │   └── page.tsx

│   │           └── [id]/

│   │               └── page.tsx

│   ├── (admin)/

│   │   └── admin/

│   │       ├── page.tsx

│   │       ├── creators/

│   │       │   └── page.tsx

│   │       ├── products/

│   │       │   └── page.tsx

│   │       └── campaigns/

│   │           └── page.tsx

│   └── api/

│       ├── campaigns/

│       ├── orders/

│       ├── uploads/

│       ├── cron/

│       └── auth/

├── components/

│   ├── ui/

│   ├── admin/

│   ├── creator/

│   └── store/

├── lib/

│   ├── supabase/

│   │   ├── client.ts

│   │   ├── server.ts

│   │   └── middleware.ts

│   ├── auth.ts

│   ├── email.ts

│   ├── pdf.ts

│   ├── validation.ts

│   └── utils.ts

├── public/

│   └── placeholder-mockups/

├── types/

│   └── index.ts

└── middleware.ts

```
