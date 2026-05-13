# Memoire Project Audit

Date: 2026-05-13  
Scope: Full repository audit (frontend, backend/Supabase, data model, security, quality gates, testing, ops readiness)

## Executive Summary

The project is a solid MVP with modern architecture and a mostly coherent end-to-end flow (auth -> compose -> generate -> order -> dashboard).  
Key strengths are good Supabase ownership checks, clear UI flow, and successful production builds.

The biggest risks before production are:
- secrets/config hygiene (`.env` handling),
- incomplete payment lifecycle,
- non-atomic backend write flows,
- weak operational safeguards for AI calls (rate limiting/idempotency/recovery),
- and no CI gate.

## Audit Method

- Static review of frontend, backend, schema, and docs
- Validation runs:
  - `npm run test` (pass: 1/1)
  - `npm run build` (pass)
  - `npm run lint` (fails: 3 errors, 8 warnings)
- Read checks across:
  - `src/` app/pages/components/hooks/lib
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/functions/*`
  - project config (`package.json`, `vite.config.ts`, `tsconfig*`, `eslint.config.js`, `.gitignore`, env examples)

---

## Severity Scale

- **Critical**: security/data-loss/major abuse risk likely in production
- **High**: severe reliability/business risk; should be fixed before launch
- **Medium**: meaningful correctness/maintainability gaps
- **Low**: quality and polish improvements

---

## Findings

## Critical

### 1) Environment secret hygiene risk
- **Evidence**
  - `.gitignore` does not ignore `.env` patterns (`.gitignore`)
  - Real env files exist: `.env`, `supabase/functions/.env`
- **Impact**
  - High chance of accidental secret commits (service role/API keys)
- **Recommendation**
  - Add `.env`, `.env.*`, and `supabase/functions/.env` to `.gitignore`
  - Keep only `.env.example` files tracked
  - Rotate sensitive keys if ever committed/exposed

---

## High

### 2) AI generation state can get stuck at `processing`
- **Evidence**
  - `generate-fragrance` sets `status = "processing"` before Gemini call
  - On failure, function returns 500 without recovery state update
  - File: `supabase/functions/generate-fragrance/index.ts`
- **Impact**
  - Records can remain in limbo; user cannot recover cleanly
- **Recommendation**
  - Add failure transition (`failed` state or fallback to `draft` + error metadata)
  - Add retry-safe workflow and cleanup job

### 3) Non-atomic order write sequence
- **Evidence**
  - `create-order` inserts into `orders`, then updates `compositions.selected_format` in separate call
  - File: `supabase/functions/create-order/index.ts`
- **Impact**
  - Partial success can create inconsistent data
- **Recommendation**
  - Move to a single transactional Postgres RPC
  - Add idempotency key handling on order creation

### 4) Payment lifecycle incomplete
- **Evidence**
  - Explicit Razorpay TODO in backend and checkout UI
  - Files:
    - `supabase/functions/create-order/index.ts`
    - `src/components/create/StepPurchase.tsx`
- **Impact**
  - Orders can be recorded without verified payment
- **Recommendation**
  - Implement Razorpay order creation + signed webhook verification + status transitions

### 5) Auth route protection gap for dashboard
- **Evidence**
  - `/dashboard` is routed directly without auth guard
  - Files:
    - `src/App.tsx`
    - `src/pages/DashboardPage.tsx`
- **Impact**
  - Unauthenticated users can open dashboard shell (even if data calls are user-gated)
- **Recommendation**
  - Add `ProtectedRoute` wrapper or redirect effect for unauthenticated access

### 6) Redirect target (`returnTo`) is not explicitly allowlisted
- **Evidence**
  - `navigate(returnTo || "/")` in auth flow
  - File: `src/pages/AuthPage.tsx`
- **Impact**
  - Potential redirect misuse and broken-path navigation
- **Recommendation**
  - Validate against an allowlist of safe internal paths

---

## Medium

### 7) Pricing/business logic mismatch (frontend vs backend)
- **Evidence**
  - UI displays `€95`/`€285` (`StepPurchase.tsx`)
  - backend uses `6900/8900/...` and returns rupee-like labels in confirmation
  - Files:
    - `src/components/create/StepPurchase.tsx`
    - `supabase/functions/create-order/index.ts`
- **Impact**
  - User trust and support issues due to inconsistent price/currency semantics
- **Recommendation**
  - Use backend-driven product catalog as single source of truth

### 8) No CI quality gate
- **Evidence**
  - No repo CI workflow for lint/test/build
- **Impact**
  - Regressions can merge unnoticed
- **Recommendation**
  - Add CI pipeline with required checks (`lint`, `test`, `build`)

### 9) Lint status is failing
- **Evidence**
  - `npm run lint` reports 3 errors, 8 warnings (UI utility files + tailwind config)
- **Impact**
  - Baseline quality gate is red
- **Recommendation**
  - Fix current lint errors first, then enforce in CI

### 10) Weak validation depth for edge-function inputs
- **Evidence**
  - Only primitive field presence/type checks in function handlers
  - Files:
    - `supabase/functions/generate-fragrance/index.ts`
    - `supabase/functions/create-order/index.ts`
- **Impact**
  - Unbounded payloads, abuse cost, and runtime instability
- **Recommendation**
  - Add schema validation + size limits + enum constraints

### 11) No rate limiting/abuse control for expensive AI endpoint
- **Evidence**
  - `generate-fragrance` has no quota/rate-limiter logic
- **Impact**
  - Cost amplification and abuse risk
- **Recommendation**
  - Add per-user quota/rate limit and timeout/circuit controls

### 12) CORS overly permissive in edge functions
- **Evidence**
  - `Access-Control-Allow-Origin: "*"` in both functions
- **Impact**
  - Larger invocation surface than necessary
- **Recommendation**
  - Restrict origin by environment allowlist

### 13) Resume flow lacks explicit user-facing error state
- **Evidence**
  - Resume query errors in `CreatePage` do not show dedicated fallback UI
  - File: `src/pages/CreatePage.tsx`
- **Impact**
  - Silent failures and confusing UX
- **Recommendation**
  - Add explicit error state with retry/new composition action

### 14) Claims and UI copy drift in create flow
- **Evidence**
  - Step copy says “Three scents” while current runtime maps one generated result
  - Files:
    - `src/components/create/StepResults.tsx`
    - `src/pages/CreatePage.tsx`
- **Impact**
  - Trust/UX mismatch
- **Recommendation**
  - Either produce 3 variants or update wording to singular

### 15) Test coverage is minimal
- **Evidence**
  - One trivial test file (`src/test/example.test.ts`)
  - No coverage thresholds
- **Impact**
  - Low confidence on core flow stability
- **Recommendation**
  - Add tests for auth redirecting, compose/generate/order flow, and dashboard hydration

---

## Low

### 16) Build output warns of large JS chunk
- **Evidence**
  - Build warning: main chunk > 500KB
- **Impact**
  - Potential performance regression on slower devices/networks
- **Recommendation**
  - Add code-splitting/manual chunks for heavy routes and UI libraries

### 17) Dual toast systems mounted
- **Evidence**
  - `Toaster` and `Sonner` both mounted in `App.tsx`
- **Impact**
  - Architectural noise/complexity
- **Recommendation**
  - Standardize on one toast system

### 18) 404 route uses hard link style (if unchanged elsewhere)
- **Evidence**
  - Known pattern in many Vite templates; verify `NotFound.tsx` uses SPA `Link`
- **Impact**
  - Potential full-page reload
- **Recommendation**
  - Ensure router-native navigation in 404

---

## What Is Good (Strengths)

- Good core app architecture for MVP:
  - React + Vite + TS + TanStack Query + Supabase
- Ownership checks are consistently applied in Supabase queries/functions
- Composition/order flows are functionally connected end-to-end
- Build is green (`npm run build`)
- Test harness is configured (Vitest + setup), even though sparse
- Supabase migration includes RLS and update trigger
- Clear modularization in `src/hooks` and `src/lib`

---

## Validation Results Snapshot

- `npm run test`: PASS (1 test)
- `npm run build`: PASS
- `npm run lint`: FAIL (3 errors, 8 warnings)

---

## Recommended Remediation Plan

### Phase 1 (Immediate, before production)
1. Fix `.env` ignore policy + rotate exposed secrets
2. Add failure state handling for generation (`processing` recovery)
3. Implement transaction/idempotency for order creation
4. Add dashboard route guard and redirect allowlist validation
5. Resolve lint errors and make lint pass

### Phase 2 (Hardening)
1. Add CI workflow with required checks
2. Add strict input schema validation in edge functions
3. Add rate limiting + request timeout/circuit handling
4. Restrict CORS by env
5. Align frontend/backend pricing from one source of truth

### Phase 3 (Scale and quality)
1. Expand automated tests + coverage threshold
2. Complete Razorpay integration + webhook verification
3. Improve observability (structured logs, error codes, tracing)
4. Optimize bundle splitting for route-level performance

---

## Production Readiness Verdict

**Not production-ready yet**, but very close to a strong beta baseline.  
Main blockers are secrets hygiene, payment completion, backend transaction safety, and quality gates.
