# SaaStastic LLM Implementation Context

Purpose: provide Cascade LLMs with authoritative context so every contribution aligns with SaaStastic's enterprise-grade architecture, roadmap, and guardrails.

---

## 1. Product Vision & Status
- **Vision**: Deliver the most trusted, production-ready multi-tenant B2B SaaS starter that ships enterprise capabilities in days, not months.
- **Pillars**: Security & Compliance, Developer Velocity, Enterprise Reliability, Scalable Architecture.
- **Current Phase**: Phase 2B (Team Management UI enhancements) with Phases 1A/1B/2A complete.
- **Personas**: Founding engineers, platform teams, agencies.

### Completion Snapshot
- ✅ **Authentication & Tenant Context** – Clerk integration, company selector, tenant guards.
- ✅ **Billing & Monetization** – Stripe checkout, subscription lifecycle, webhooks, portal access.
- ✅ **RBAC Core** – 29 permissions, system roles, middleware, frontend guards.
- 🟨 **Team Collaboration UI** – Enhanced role assignment, invitations, bulk management in progress.
- ⬜ **Support & Operations** – Admin portal, health monitoring, impersonation guardrails (Phase 3).

---

## 2. Core Architecture Overview - Keep up to date as much as possible so upon deployment the most recent version is used and working properly.

### Recent Critical Fixes (October 5, 2025)
- ✅ **Clerk 6.x Authentication**: Fixed missing `await auth()` in API middleware causing 401 errors
- ✅ **User Auto-Sync**: Users now automatically created in DB from Clerk on first API call  
- ✅ **RBAC Middleware**: Auto-fetches company context eliminating "Company context required" errors
- ✅ **Performance**: Removed `currentUser()` call causing 23-second timeouts
- **Framework**: Next.js 15 App Router, React 19, TypeScript 5 strict.
- **Styling**: TailwindCSS 4 with design tokens (see `src/shared/ui/`).
- **State**: React Query for server data, local component state for UI, React Context for global client state.
- **Data Layer**: Prisma ORM 6 with PostgreSQL; all tenant models include `companyId`, audit fields, and `deletedAt` for soft deletes.
- **Authentication**: Clerk with session + company context providers in `src/core/auth/`.

### Directory Contracts
```
src/
├── app/                    # Next.js routes and layouts
│   ├── (marketing)/        # Public marketing pages
│   ├── (app)/              # Authenticated app surfaces
│   └── api/                # REST handlers (RBAC protected)
├── core/                   # Cross-cutting infrastructure
│   ├── auth/               # Clerk adapters, company provider
│   ├── db/                 # Prisma client, tenant guard helpers
│   ├── observability/      # Logging & monitoring (scaffolding)
│   └── rbac/               # (Planned) role provisioning helpers & guards
├── features/               # Domain modules (billing, companies, customers, users, etc.)
├── shared/                 # Cross-domain UI, hooks, libs, utilities
└── lib/                    # App-level server actions (`src/lib/actions/<module>/`)
```

---

## 3. Naming & Coding Standards
- **Files**: components in `PascalCase.tsx`; utilities/tests in kebab-case (`foo-utils.ts`).
- **Identifiers**: functions/vars `camelCase`, components `PascalCase`, constants `SCREAMING_SNAKE_CASE`.
- **Components**: Hooks first, manage loading/error states, accessibility semantics, guard via `PermissionGuard` where needed.
- **Imports**: External packages → internal shared modules → relative imports.
- **Type Safety**: Zero `any`, rely on Zod inference or explicit interfaces.

Reference: `docs/core/coding-standards-and-workflows.md`.

---

## 4. Multi-Tenancy Rules (Non-Negotiable)
- All Prisma queries scoped by `companyId`; never trust client-supplied IDs without verification.
- Use tenant-aware helpers from `src/core/db/` or inject `companyId` from `AuthenticatedContext`.
- Maintain audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) and `deletedAt` soft deletes everywhere.
- Input validation mandatory with Zod before touching the database.

---

## 5. RBAC System
- **Permissions**: Enumerated in `src/shared/lib/permissions.ts` (29 keys across Organization, Billing, Team, Customers, API, Roles, System).
- **Roles**: Owner, Admin, Member, Viewer seeded per company via provisioning helper (target location `src/core/rbac/provisioner.ts`).
- **Middleware**: `withPermissions()` in `src/shared/lib/rbac-middleware.ts` wraps handlers, resolves Clerk user, company context, and enforces permissions.
- **Frontend Hooks**: `usePermissions()` in `src/shared/hooks/use-permissions.ts` caches permitted actions; use `<PermissionGuard>` for conditional rendering.
- **Provisioning Strategy**: During company creation, call `provisionSystemRolesForCompany(companyId, tx)` within a transaction. The helper in `src/core/rbac/provisioner.ts` is idempotent and uses unique constraints on `(name, companyId)` and `(slug, companyId)` to prevent duplicates.
- **Testing**: Ensure `/api/users/permissions` returns context-specific permissions and UI updates accordingly.

Detailed spec: `docs/core/architecture/rbac-spec.md`.

---

## 6. API & Server Patterns
- **Middleware Stack**: Wrap handlers with `withApiMiddleware(withPermissions(handler, [PERMISSIONS.KEY]), options)`.
- **Authentication Pattern** (CRITICAL - Updated Oct 5, 2025):
  ```typescript
  // In api-middleware.ts and rbac-middleware.ts
  const { userId } = await auth(); // MUST await in Clerk 6.x
  
  // Auto-fetch company if not provided
  if (!companyId) {
    const userCompany = await db.userCompany.findFirst({
      where: { userId },
      select: { companyId: true },
      orderBy: { createdAt: 'desc' }
    });
    companyId = userCompany?.companyId || null;
  }
  
  // Auto-sync user from Clerk if doesn't exist in DB
  if (!user) {
    const clerkUser = await currentUser();
    user = await db.user.create({
      data: {
        id: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        name: clerkUser?.firstName ? `${clerkUser.firstName} ${clerkUser.lastName}` : null
      }
    });
  }
  ```
- **Validation**: Parse payloads with Zod schemas. Place schemas under `features/<domain>/schemas/` or `modules/<domain>/schemas/` as appropriate.
- **Responses**: Standard `ApiResponse<T>` shape (see `docs/core/api-reference.md`). Never leak stack traces; return descriptive but safe errors.
- **Server Actions**: Lives in `src/lib/actions/<module>/`. Pattern:
  ```typescript
  export async function createCustomer(input: CreateCustomerInput) {
    const { companyId, userId } = requireTenantContext();
    const data = createCustomerSchema.parse(input);
    return db.customer.create({
      data: {
        ...data,
        companyId,
        createdBy: userId,
      },
    });
  }
  ```
- **Rate Limiting & CSRF**: Enabled via `withApiMiddleware` options; ensure coverage on all state-changing endpoints.

---

## 7. Frontend Implementation Patterns
- **Data Fetching**: React Query hooks in `features/<domain>/hooks/` coordinate API access.
- **Forms**: Use Zod + React Hook Form or equivalent within domain components; always surface validation messages.
- **Components**: Domain UI resides in `features/<domain>/components/`; cross-cutting primitives in `shared/components/` or `shared/ui/`.
- **Routing**: App Router segments under `src/app/`. Use nested layouts for marketing vs product vs future admin surfaces.
- **State Guards**: Always check `loading` + `error` states from hooks; show fallback skeleton or `ErrorState` component from `shared/components/`.

---

## 8. Database & Migrations
- **Prisma Schema**: Single source at `prisma/schema.prisma`. Models must include multi-tenant fields and indexes.
- **Migrations**: Run `npx prisma migrate dev --name <change>` whenever schema updates. Document change in `docs/core/technical-workflows.md` and update RBAC seed scripts if permissions/roles change.
- **Seeding**: `scripts/seed-rbac.ts` keeps permissions in sync; re-run after modifications.

---

## 9. Testing & Quality Gates
- **Static Analysis**: `npm run lint`, `npx tsc --noEmit` required pre-PR.
- **Unit/Integration**: Vitest for services and API routes (use Prisma test database).
- **E2E**: Playwright for auth, onboarding, billing, teams. Extend suites as new flows ship.
- **Coverage Target**: >80% on critical business logic before Phase 3 readiness.
- **Release Checklist**:
  - ✅ Lint/type/test pass
  - ✅ Database migrations applied
  - ✅ Documentation updated
  - ✅ Tenant isolation & RBAC checks verified
  - ✅ Observability alerts reviewed (once implemented)

---

## 10. Observability & Operations
- **Current**: `core/observability/` scaffolding for structured logging; integrate Sentry/PostHog during Phase 3.
- **Roadmap**: Add metric exporters, tracing, health endpoints, alert definitions.
- **Operational Playbooks (TODO)**: Produce incident response guide, release rollback procedure, tenant onboarding automation.

---

## 11. Documentation Map
- `docs/core/product-vision-and-roadmap.md` – strategic goals and phase status.
- `docs/core/architecture-blueprint.md` – canonical architecture, patterns, and guardrails.
- `docs/core/architecture/rbac-spec.md` – RBAC technical deep dive.
- `docs/core/api-reference.md` – API patterns and endpoint catalog.
- `docs/core/enterprise-boilerplate-roadmap.md` – checklist toward full enterprise boilerplate.
- `docs/users/guides/rbac-setup-guide.md` – adopter-facing RBAC instructions.
- `.windsurf/workflows/*.md` – codified workflows (API development, database changes, LLM context reminders).

Keep this file synchronized when any referenced document or architectural decision changes.

---

## 12. When Implementing Features
1. **Confirm scope** with roadmap and check `enterprise-boilerplate-roadmap.md` for pending tasks.
2. **Locate domain module** (`features/<domain>/`) and review existing patterns/components/types.
3. **Design data contracts**: Update Prisma (if needed), adjust Zod schemas, ensure tenant scoping.
4. **Implement server logic** using `withApiMiddleware` + `withPermissions`.
5. **Build UI** with permission-aware components, loading/error states.
6. **Write tests** spanning unit → integration → E2E as appropriate.
7. **Update documentation & roadmaps** to reflect new capability.
8. **Run validation suite** before merging.

---

## 13. Quick Reference Commands
- Install deps: `npm install`
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Tests: `npm run test`
- Playwright: `npx playwright test`
- Prisma migrate: `npx prisma migrate dev --name <change>`
- Seed RBAC: `npx tsx scripts/seed-rbac.ts`

---

## 14. Contact Points (for Documentation)
- Architecture decisions → Update `docs/core/architecture-blueprint.md` + ADR (if required).
- Feature completion → Update `docs/core/product-status.md` & `enterprise-boilerplate-roadmap.md`.
- RBAC changes → Sync `docs/core/architecture/rbac-spec.md`, `docs/users/guides/rbac-setup-guide.md`, and this file.

---
*Last updated: October 5, 2025 - Added Clerk 6.x authentication patterns and RBAC middleware fixes*
