# Graph Report - .  (2026-04-08)

## Corpus Check
- Corpus is ~15,005 words - fits in a single context window. You may not need a graph.

## Summary
- 143 nodes · 223 edges · 13 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `verifyAdmin()` - 15 edges
2. `CLAUDE.md — Project Instructions` - 14 edges
3. `Tech Stack (Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Supabase, Vercel)` - 7 edges
4. `getOwnedDraftCampaign()` - 4 edges
5. `toSlug()` - 3 edges
6. `Project: Custom Tee Shirt & Sticker Group-Order Platform` - 3 edges
7. `Design Decision: No Payment Processing` - 3 edges
8. `Actual Folder Structure` - 3 edges
9. `isPublicRoute()` - 2 edges
10. `middleware()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Wordmark SVG` --conceptually_related_to--> `Tech Stack (Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Supabase, Vercel)`  [INFERRED]
  public/next.svg → CLAUDE.md
- `Vercel Wordmark/Logo SVG` --conceptually_related_to--> `Tech Stack (Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Supabase, Vercel)`  [INFERRED]
  public/vercel.svg → CLAUDE.md
- `createCreator()` --calls--> `verifyAdmin()`  [INFERRED]
  app\(admin)\admin\creators\actions.ts → app\(admin)\admin\products\[id]\actions.ts
- `deleteCreator()` --calls--> `verifyAdmin()`  [INFERRED]
  app\(admin)\admin\creators\actions.ts → app\(admin)\admin\products\[id]\actions.ts
- `createProduct()` --calls--> `verifyAdmin()`  [INFERRED]
  app\(admin)\admin\products\actions.ts → app\(admin)\admin\products\[id]\actions.ts

## Hyperedges (group relationships)
- **MVP Simplicity Constraints** — claude_arch_decision_no_buyer_accounts, claude_arch_decision_no_payment, claude_arch_decision_pickup_only, claude_project_overview [INFERRED 0.85]
- **Role-Based Access Model (Admin, Creator, Buyer)** — claude_role_admin, claude_role_creator, claude_role_buyer, claude_project_overview [EXTRACTED 1.00]
- **Next.js + Vercel Deployment Brand Identity** — img_next_svg, img_vercel_svg, claude_tech_stack [INFERRED 0.75]

## Communities

### Community 0 - "Server Actions (CRUD)"
Cohesion: 0.11
Nodes (19): addCampaignProduct(), createColor(), createCreator(), createPlacement(), createProduct(), createSize(), deleteColor(), deleteCreator() (+11 more)

### Community 1 - "Admin UI Dialogs"
Cohesion: 0.13
Nodes (0): 

### Community 2 - "Campaign Card UI"
Cohesion: 0.08
Nodes (3): handleSlugChange(), handleTitleChange(), toSlug()

### Community 3 - "Project Docs & Arch Decisions"
Cohesion: 0.14
Nodes (21): AGENTS.md — Next.js Version Warning, Warning: Next.js Breaking Changes, Architecture Decision: Single Monolithic Next.js App, Design Decision: No Buyer Accounts, Design Decision: No Payment Processing, Design Decision: Pickup or Delivery Only, Build Status: Done Features, Build Status: Not Yet Built Features (+13 more)

### Community 4 - "Layouts & Middleware"
Cohesion: 0.14
Nodes (2): isPublicRoute(), middleware()

### Community 5 - "Product Selection UI"
Cohesion: 0.2
Nodes (0): 

### Community 6 - "Campaign Product Management"
Cohesion: 0.33
Nodes (0): 

### Community 7 - "Next.js Type Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "TypeScript Types"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Static Assets (SVG)"
Cohesion: 1.0
Nodes (1): File Icon SVG

### Community 11 - "Static Assets (SVG)"
Cohesion: 1.0
Nodes (1): Globe Icon SVG

### Community 12 - "Static Assets (SVG)"
Cohesion: 1.0
Nodes (1): Window/Browser Icon SVG

## Knowledge Gaps
- **7 isolated node(s):** `Styling Conventions (semantic CSS tokens, sharp corners, font-mono)`, `Role: Admin`, `Role: Creator`, `Graphify Knowledge Graph Rule`, `File Icon SVG` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Next.js Type Declarations`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TypeScript Types`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Static Assets (SVG)`** (1 nodes): `File Icon SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Static Assets (SVG)`** (1 nodes): `Globe Icon SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Static Assets (SVG)`** (1 nodes): `Window/Browser Icon SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 14 inferred relationships involving `verifyAdmin()` (e.g. with `createCreator()` and `deleteCreator()`) actually correct?**
  _`verifyAdmin()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Tech Stack (Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Supabase, Vercel)` (e.g. with `Supabase Setup Notes` and `Environment Variables`) actually correct?**
  _`Tech Stack (Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Supabase, Vercel)` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `getOwnedDraftCampaign()` (e.g. with `updateCampaignDetails()` and `addCampaignProduct()`) actually correct?**
  _`getOwnedDraftCampaign()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `toSlug()` (e.g. with `handleTitleChange()` and `handleSlugChange()`) actually correct?**
  _`toSlug()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Styling Conventions (semantic CSS tokens, sharp corners, font-mono)`, `Role: Admin`, `Role: Creator` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Server Actions (CRUD)` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Admin UI Dialogs` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._