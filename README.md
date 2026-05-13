# Memoire - Scented Identity Project

Memoire is a luxury-styled fragrance composition web app. A user describes a memory, refines mood/context, generates a scent profile with AI, and places a format-based order.

This project uses:
- React + Vite + TypeScript frontend
- Supabase for auth, database, and edge functions
- Gemini 2.5 Flash for fragrance concept generation

---

## Table of Contents

- [Product Overview](#product-overview)
- [Current Implementation Status](#current-implementation-status)
- [Architecture](#architecture)
- [End-to-End User Flow](#end-to-end-user-flow)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Setup and Run](#setup-and-run)
- [Database Schema and RLS](#database-schema-and-rls)
- [Edge Functions](#edge-functions)
- [Frontend Data Layer](#frontend-data-layer)
- [Routing](#routing)
- [Testing](#testing)
- [Scripts](#scripts)
- [Brand Assets](#brand-assets)
- [Known Gaps and TODOs](#known-gaps-and-todos)

---

## Product Overview

Core product capabilities:
- Branded landing and narrative homepage
- 6-step scent composition wizard at `/create`
- Email/password auth (Supabase) with `full_name` metadata
- AI fragrance generation via Supabase edge function (`generate-fragrance`) and Gemini
- Order creation via Supabase edge function (`create-order`)
- User dashboard with real composition history and summary stats

---

## Current Implementation Status

Implemented and wired:
- Draft composition creation to `public.compositions`
- AI generation response persisted to `generated_result` and `status = complete`
- Dashboard pulls real rows from Supabase (`compositions`, `orders`)
- Checkout creates real `orders` rows and updates `selected_format`
- Resume flow supported via `/create?resume={composition_id}`
- Auth-gated checkout behavior

Partially implemented:
- Payment processing is not integrated yet (Razorpay TODO exists)
- Playwright is configured but no dedicated npm script is defined
- Test coverage is minimal (single example test)

---

## Architecture

### Frontend
- Framework: React 18 + TypeScript
- Build tool: Vite 5
- Routing: `react-router-dom`
- Data fetching/mutations: TanStack Query
- UI: Tailwind + shadcn/ui + Radix primitives

### Backend (Supabase)
- Auth: Supabase Auth (session persisted in browser)
- DB: PostgreSQL with RLS
- Server logic: Deno edge functions
  - `generate-fragrance` (Gemini)
  - `create-order` (order record + format update)

### AI Layer
- Model: `gemini-2.5-flash`
- Invocation: direct HTTPS call from edge function using `fetch`
- Response contract: strict JSON structure parsed and stored in DB

---

## End-to-End User Flow

1. User opens `/` and starts composition.
2. In `/create`:
   - Step 1 captures memory text
   - Step 2 captures refinements (mood/environment/intensity)
   - Draft composition is inserted
   - `generate-fragrance` is called
   - Step 3 loading UI runs while generation completes
   - Step 4/5 show generated composition
3. Checkout (Step 6):
   - If unauthenticated, user is redirected to `/auth` with `returnTo`
   - On completion, `create-order` edge function is invoked
4. `/dashboard` shows compositions and order summary from live Supabase data.
5. `View Report` links back to `/create?resume={composition_id}` to rehydrate generated result.

---

## Folder Structure

```text
scented-identity-project-main/
|-- public/
|   |-- favicon.png
|   |-- logo-full.png
|   |-- placeholder.svg
|   `-- robots.txt
|
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- BrandLogo.tsx
|   |   |-- NavLink.tsx
|   |   |-- create/
|   |   |   |-- StepInput.tsx
|   |   |   |-- StepRefinement.tsx
|   |   |   |-- StepProcessing.tsx
|   |   |   |-- StepResults.tsx
|   |   |   |-- StepDetail.tsx
|   |   |   `-- StepPurchase.tsx
|   |   |-- home/
|   |   |   |-- Navbar.tsx
|   |   |   |-- Footer.tsx
|   |   |   |-- Hero.tsx
|   |   |   |-- Process.tsx
|   |   |   |-- FeaturedCreations.tsx
|   |   |   |-- Philosophy.tsx
|   |   |   |-- ReportPreview.tsx
|   |   |   `-- FinalCTA.tsx
|   |   `-- ui/ (shadcn components)
|   |
|   |-- contexts/
|   |   `-- AuthContext.tsx
|   |
|   |-- hooks/
|   |   |-- useCompositionActions.ts
|   |   |-- useCompositions.ts
|   |   |-- useReveal.ts
|   |   |-- use-toast.ts
|   |   `-- use-mobile.tsx
|   |
|   |-- integrations/
|   |   `-- supabase/
|   |       |-- client.ts
|   |       `-- types.ts
|   |
|   |-- lib/
|   |   |-- compositions.ts
|   |   `-- utils.ts
|   |
|   |-- pages/
|   |   |-- Index.tsx
|   |   |-- CreatePage.tsx
|   |   |-- AuthPage.tsx
|   |   |-- DashboardPage.tsx
|   |   `-- NotFound.tsx
|   |
|   |-- test/
|   |   |-- setup.ts
|   |   `-- example.test.ts
|   |
|   |-- App.tsx
|   |-- main.tsx
|   |-- index.css
|   `-- App.css
|
|-- supabase/
|   |-- config.toml
|   |-- migrations/
|   |   `-- 001_initial_schema.sql
|   `-- functions/
|       |-- .env.example
|       |-- .env
|       |-- generate-fragrance/
|       |   `-- index.ts
|       `-- create-order/
|           `-- index.ts
|
|-- .env.example
|-- index.html
|-- package.json
|-- vite.config.ts
|-- vitest.config.ts
|-- playwright.config.ts
`-- README.md
```

---

## Environment Variables

### Frontend (`.env` / `.env.example`)

- `VITE_SUPABASE_URL=`
- `VITE_SUPABASE_PUBLISHABLE_KEY=`
- `VITE_SUPABASE_PROJECT_ID=`

Used by `src/integrations/supabase/client.ts`.

### Supabase Edge Functions (`supabase/functions/.env`)

- `GEMINI_API_KEY=` - Gemini API key used in `generate-fragrance`
- `SUPABASE_URL=` - Supabase project URL for admin client in functions
- `SUPABASE_SERVICE_ROLE_KEY=` - service role key for server-side function operations

---

## Setup and Run

### Prerequisites

- Node.js 18+ recommended
- npm (or Bun)
- Supabase project

### Install

```bash
npm install
```

or

```bash
bun install
```

### Run development server

```bash
npm run dev
```

Default Vite dev server:
- `http://localhost:8080`

### Build

```bash
npm run build
```

---

## Database Schema and RLS

Migration: `supabase/migrations/001_initial_schema.sql`

### Tables

#### `public.compositions`
- `id` UUID PK
- `user_id` FK -> `auth.users(id)` (cascade delete)
- `status` in `draft | processing | complete`
- `memory_input` text
- `refinements` jsonb
- `generated_result` jsonb
- `selected_format` text
- timestamps: `created_at`, `updated_at`

#### `public.orders`
- `id` UUID PK
- `user_id` FK -> `auth.users(id)` (cascade delete)
- `composition_id` FK -> `public.compositions(id)` (set null on delete)
- `status` in `pending | confirmed | fulfilled | cancelled`
- `format`, `price_cents`, `metadata`
- `created_at`

### RLS

Enabled on both tables.

Policies:
- `compositions`: authenticated users can `SELECT`, `INSERT`, `UPDATE` only own rows (`user_id = auth.uid()`)
- `orders`: authenticated users can `SELECT`, `INSERT` only own rows

### Trigger

`moddatetime` trigger updates `compositions.updated_at` before updates.

---

## Edge Functions

### `generate-fragrance`
Path: `supabase/functions/generate-fragrance/index.ts`

Responsibilities:
- Verifies bearer token and user
- Validates input `{ composition_id }`
- Ensures composition belongs to caller
- Calls Gemini 2.5 Flash with strict JSON response contract
- Retries once if JSON parse fails
- Updates composition:
  - `status = processing` before generation
  - `generated_result` + `status = complete` on success

### `create-order`
Path: `supabase/functions/create-order/index.ts`

Responsibilities:
- Verifies bearer token and user
- Validates input `{ composition_id, format }`
- Ensures composition is owned by caller and `status = complete`
- Applies format pricing:
  - `eau_de_parfum`: 8900
  - `parfum`: 12900
  - `oil`: 6900
  - `candle`: 5900
  - `diffuser`: 7900
- Inserts order record
- Updates `compositions.selected_format`
- Returns `{ order_id, status, price_cents }`

Payment integration:
- Razorpay integration TODO is intentionally left in function/component comments.

---

## Frontend Data Layer

### Key hooks

- `src/hooks/useCompositionActions.ts`
  - `useCreateDraftComposition()`
  - `useGenerateFragrance()`
  - `useCreateOrder()`

- `src/hooks/useCompositions.ts`
  - `useCompositions(userId)` with query key `["compositions", userId]`
  - `useOrderSummary(userId)` with query key `["orders-summary", userId]`

### Key mapping utilities

- `src/lib/compositions.ts`
  - `parseGeneratedResult()`
  - `toCompositionCardModel()`
  - typed interfaces for generated fragrance payload and composition models

### Important page logic

- `src/pages/CreatePage.tsx`
  - Handles wizard state
  - Creates draft -> generates fragrance -> displays generated result
  - Handles resume flow (`resume` query param)
  - Handles checkout call (`create-order`)

- `src/pages/DashboardPage.tsx`
  - Loads real compositions and order summary
  - Shows skeleton while loading
  - Supports report resume navigation to `/create?resume={id}`

---

## Routing

Defined in `src/App.tsx`:

- `/` -> `Index`
- `/create` -> `CreatePage`
- `/auth` -> `AuthPage`
- `/dashboard` -> `DashboardPage`
- `*` -> `NotFound`

Navbar is hidden on `/create`, `/auth`, `/dashboard`.

---

## Testing

- Unit tests: Vitest + Testing Library (`vitest.config.ts`)
- Test environment: `jsdom`
- Setup: `src/test/setup.ts`
- Example test: `src/test/example.test.ts`
- Playwright config exists (`playwright.config.ts`) but no dedicated script in `package.json`

---

## Scripts

From `package.json`:

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run build:dev` - development mode build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode

Equivalent Bun usage: `bun run <script>`

---

## Brand Assets

- Main logo: `public/logo-full.png`
- Favicon: `public/favicon.png`
- Favicon link is configured in `index.html`
- Reusable logo component: `src/components/BrandLogo.tsx`

---

## Known Gaps and TODOs

- Razorpay is not integrated yet (order creation only; no payment flow/webhooks)
- Some UI actions remain placeholders (example: dashboard account address management)
- Test coverage is currently minimal
- Production deployment configuration/CI pipeline is not included in this repository

---

## Notes

- Supabase auth signup stores `full_name` in user metadata.
- Signup uses `emailRedirectTo: window.location.origin`; configure valid redirect URLs in your Supabase project.
- If you rotate Supabase or Gemini keys, update both frontend and functions env files accordingly.
