# Auth + Multi‑Tenant CRUD Readiness Checklist (Prioritized)

Purpose: a simple, actionable list to bring the app to production readiness. Start at High, proceed downward. Each item links to concrete actions and files to touch.

---

## HIGH PRIORITY

- [x] Remove Dev Mode Company Switcher UI (simplify UX)
  - [x] Remove `<DevCompanySwitcher />` from `src/app/providers.tsx`.
  - [x] Remove or permanently disable the `DevCompanySwitcher` export in `core/auth/company-provider.tsx`.
  - [x] Search the codebase for `DevCompanySwitcher` to ensure it's no longer referenced.

- [x] Decide Dev Authentication Strategy (simplify, no keyless by default)
  - Choose ONE path:
    - [x] Option A (Recommended): Require Clerk keys in development. Use Clerk Test mode. Remove keyless paths and any reliance on `dev-company-id` cookie.
      - [x] Remove dev keyless conditionals from `src/lib/api-middleware.ts` (always use Clerk).
      - [x] Remove any cookie handling (`dev-company-id`) in `core/auth/company-provider.tsx` and elsewhere.
      - [x] Update `docs/AUTHENTICATION.md` to state: dev requires Clerk test keys.

- [x] Enforce membership and role checks for ALL tenant APIs (not just companies)
  - [x] Customers list/create: `src/app/api/customers/route.ts`
  - [x] Customers read/update/delete: `src/app/api/customers/[id]/route.ts`
  - [x] Define minimum role per action (suggestion):
    - MEMBER: Read/list customers
    - ADMIN: Create/update customers
    - OWNER: Delete customers
  - [x] Validate the calling user is a member of the target `companyId` in every handler. Return 403 if not.

- [x] Turn on production-grade rate limiting for mutating routes
  - [x] Use `@upstash/ratelimit` (already in `package.json`).
  - [x] Configure in `src/lib/api-middleware.ts` (enable for POST/PUT/PATCH/DELETE). Keep in-memory fallback for local dev if needed.
  - [x] Add env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

- [x] Prevent hard deletes for `Company` and `Customer` (keep soft deletes)
  - [x] Search for `prisma.company.delete` / `prisma.customer.delete` and replace with soft delete (`deletedAt` update) if any exist.
  - [x] Keep `UserCompany` as hard delete (no `deletedAt` on this model).
  - [x] Re-verify `core/db/tenant-guard.ts` continues to filter out soft-deleted rows.

- [x] Observability: Sentry + basic request logging
  - [x] Initialize `@sentry/nextjs` for server and client. Configure DSN, environment, and release.
  - [x] Add lightweight request logging (route, userId, companyId, status, duration) centrally in `src/lib/api-middleware.ts`.

- [x] Testing: cover core flows with Clerk enabled
  - [x] Add Playwright E2E for Companies + Customers CRUD with real Clerk Test mode.
  - [x] Add integration tests for authorization edges: unauthenticated, non-member, MEMBER/ADMIN/OWNER boundaries.

---

## MEDIUM PRIORITY

- [ ] Cookie and context hardening
  - If Option A chosen (recommended):
    - [ ] Remove all `dev-company-id` cookie usage.
  - If Option B chosen:
    - [ ] Ensure the cookie is set only when `DEV_KEYLESS === 'true'` and `NODE_ENV === 'development'`.
    - [ ] Set cookie with `Secure; SameSite=Lax; Path=/`.
    - [ ] Explicitly ignore this cookie in any production path.

- [ ] Add compound DB indexes for common queries
  - [ ] Consider `(companyId, createdAt)` on `Customer`, `EventLog`, `Feedback` if list queries sort by date.
  - [ ] Validate existing indexes in `prisma/schema.prisma` match hot query patterns.

- [ ] Documentation refresh
  - [ ] Update `docs/AUTHENTICATION.md` to reflect the selected dev strategy (Option A or B) and removal of the Dev company switcher.
  - [ ] Update `docs/TENANTING.md` with a clear rule: do not hard-delete `Company` or `Customer`.
  - [ ] Update or replace `core/auth/CompanyContext.md` (outdated) with current App Router patterns and the simplified approach.

- [ ] Standardized API errors
  - [ ] Use consistent `createApiResponse()` error messages. Avoid leaking stack traces in production.

---

## LOW PRIORITY

- [ ] Remove redundant or legacy auth files (if still present)
  - [ ] Delete `core/auth/CompanyContext.tsx` and `core/auth/company-provider-new.tsx` if they exist; keep `core/auth/company-provider.tsx` as the single source.

- [ ] Health/status endpoint policy
  - [ ] If a health endpoint exists, decide whether to keep it for debugging (and what it should expose) or remove it to reduce surface area.

- [ ] Helper/utilities cleanup
  - [ ] Create a small helper to assert membership/role in API handlers to reduce duplication.

- [ ] Operational runbooks
  - [ ] Document environment variables, rotation, DB backups, and deployment checks in `docs/DEPLOYMENT.md`.

---

## ACCEPTANCE CRITERIA (Done = ready for production)

- [x] Dev company switcher is removed from the UI and codebase.
- [x] A single dev auth strategy is in place (Clerk Test mode by default), with no reliance on dev cookies.
- [x] Every tenant API enforces membership and role checks as defined.
- [x] Soft-delete policy holds for `Company` and `Customer`; no hard deletes.
- [x] Distributed rate limiting active for all mutating API routes in production.
- [x] Sentry error monitoring enabled; basic request logs present.
- [x] E2E and integration tests pass for CRUD and authorization edge cases.
- [x] Docs reflect the simplified, final approach.
