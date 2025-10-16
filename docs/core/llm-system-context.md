# SaaStastic LLM Implementation Context

**Last Updated**: October 9, 2025  
**Purpose**: Provide Cascade LLMs with authoritative context for SaaStastic, a production-ready multi-tenant B2B SaaS boilerplate ready for commercial launch.

---

## 🚀 TL;DR - Read This First

**What**: Enterprise B2B SaaS boilerplate with multi-tenancy, RBAC, Stripe, Clerk auth  
**Status**: 95% launch-ready (6-8 hours remaining work)  
**Next**: Complete pre-launch tasks in `docs/launchPlan/PRE_LAUNCH_CRITICAL_TASKS.md`  
**Tech**: Next.js 15, React 19, TypeScript 5, Prisma 6, PostgreSQL, TailwindCSS 4  
**Tests**: 87 passing (60 unit + 27 E2E)  
**Docs**: 6 customer guides complete (docs/guides/)  

**Critical Missing**:
- 🔴 Stripe Customer Portal (3 hrs) - Self-service billing
- 🔴 Billing notification emails (3 hrs) - Payment alerts

**After Pre-Launch**: Execute 7-day launch plan → Monitor → Build based on customer demand

**New to this project?** Read Section 15 (Quick Onboarding Checklist) below, then `docs/launchPlan/NEW_SESSION_SUMMARY.md`

---

## 1. Product Vision & Current Status

### Vision
Deliver the most trusted, production-ready multi-tenant B2B SaaS starter that ships enterprise capabilities in days, not months.

### **Current Status: 95% Launch Ready** 🚀
- **Product**: Complete enterprise-grade foundation
- **Documentation**: 6 customer guides ready
- **Tests**: 87 passing (60 unit + 27 E2E)
- **Target Market**: Developers building B2B SaaS ($399-$20k pricing tiers)
- **Go-To-Market**: 7-day launch plan ready (Lemon Squeezy + GitHub delivery)

### Critical Pre-Launch Items (6-8 hours remaining)
- 🔴 **Stripe Customer Portal** - Self-service billing management
- 🔴 **Billing Notification Emails** - Payment failed/successful/cancelled emails
- ⚠️ See `docs/launchPlan/PRE_LAUNCH_CRITICAL_TASKS.md` for details

### Completion Snapshot
- ✅ **Authentication & Tenant Context** – Clerk integration, company selector, tenant guards
- ✅ **Billing & Monetization** – Stripe checkout, subscription lifecycle, webhooks
- ✅ **RBAC System** – 29 permissions, 4 system roles, middleware, frontend guards, provisioning
- ✅ **Team Management** – Role assignment, email invitations, bulk operations, activity logs
- ✅ **Customer Documentation** – 6 comprehensive guides for buyers
- 🔴 **Customer Portal** – Need billing self-service (3 hours)
- 🔴 **Email Notifications** – Need payment alerts (3 hours)
- ⬜ **Admin Support Portal** – Deferred to post-launch (build if 15+ support requests/week)

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

### Launch Planning (CRITICAL - Start Here)
- `docs/launchPlan/PRE_LAUNCH_CRITICAL_TASKS.md` – **DO FIRST**: Stripe portal + billing emails (6-8 hrs)
- `docs/launchPlan/MASTER_LAUNCH_PLAN.md` – 7-day launch execution plan (Days 1-7)
- `docs/launchPlan/POST_LAUNCH_ROADMAP.md` – Post-launch features (build based on demand)
- `docs/launchPlan/NEW_SESSION_SUMMARY.md` – Quick start for new chat sessions
- `docs/launchPlan/5_TIER_PRICING_MODEL.md` – Pricing structure ($399 to $20k)
- `docs/launchPlan/LAUNCH_OPERATIONS_GUIDE.md` – Licensing, delivery, support operations

### Customer-Facing Documentation (What Buyers Get)
- `docs/guides/SETUP_GUIDE.md` – Comprehensive setup (951 lines)
- `docs/guides/RBAC_USAGE.md` – Permission system usage (18KB)
- `docs/guides/CUSTOMIZING_PERMISSIONS.md` – How to customize permissions (17KB)
- `docs/guides/EXTENDING_TEAM_MANAGEMENT.md` – Team management customization (24KB)
- `docs/guides/STRIPE_CUSTOMIZATION.md` – Billing customization (22KB)
- `docs/guides/FAQ.md` – Common questions (437 lines, 30+ Q&As)

### Internal Development Reference
- `docs/core/llm-system-context.md` – **THIS FILE**: LLM onboarding context
- `docs/core/architecture-blueprint.md` – Canonical architecture and patterns
- `docs/core/architecture/rbac-spec.md` – RBAC technical specification
- `docs/core/api-reference.md` – API patterns and endpoint catalog
- `docs/core/coding-standards-and-workflows.md` – Development standards
- `.windsurf/workflows/*.md` – Codified workflows (API development, database changes)

### Archive (Historical - Ignore These)
- `docs/archived/session-summaries/` – Old session notes
- `docs/archived/old-plans/` – Superseded planning documents
- `docs/archived/completed-tasks/` – Completed historical tasks

Keep this file synchronized when any referenced document or architectural decision changes.

---

## 12. Launch Context & Next Steps

### Immediate Priority: Pre-Launch Tasks (6-8 hours)
Before launching, complete these critical features in `docs/launchPlan/PRE_LAUNCH_CRITICAL_TASKS.md`:
1. **Stripe Customer Portal API** (3 hours) – Allow customers to manage billing themselves
2. **Billing Notification Emails** (3 hours) – Payment failed/successful/cancelled notifications

### Post-Launch Strategy
- **Week 1**: Monitor customer feedback, fix pain points
- **Month 2**: Decide on admin portal (only if 15+ support requests/week)
- **Month 3**: Consider support ticketing system (buy vs. build decision)
- **Build based on demand**, not assumptions – see `docs/launchPlan/POST_LAUNCH_ROADMAP.md`

### When Implementing New Features
1. **Check launch docs first** – Is this pre-launch critical or post-launch optional?
2. **Locate domain module** (`features/<domain>/`) and review existing patterns/components/types.
3. **Design data contracts**: Update Prisma (if needed), adjust Zod schemas, ensure tenant scoping.
4. **Implement server logic** using `withApiMiddleware` + `withPermissions`.
5. **Build UI** with permission-aware components, loading/error states.
6. **Write tests** spanning unit → integration → E2E as appropriate.
7. **Update documentation** in `docs/guides/` if customer-facing.
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

## 14. Documentation Update Guidelines

### When to Update Documentation
- **Customer guides** (`docs/guides/`) – When features change that affect customer usage
- **Launch plans** (`docs/launchPlan/`) – When pricing, delivery, or go-to-market changes
- **This file** (`docs/core/llm-system-context.md`) – When architecture, patterns, or status changes
- **Architecture** (`docs/core/architecture-blueprint.md`) – When core design decisions change
- **RBAC spec** (`docs/core/architecture/rbac-spec.md`) – When permissions or roles change

### What NOT to Update
- **Archived files** (`docs/archived/`) – Never update, these are historical records
- **Old planning docs** – Archived for reference only

---

## 15. Quick Onboarding Checklist

### For New Chat Sessions (Start Here)
1. ✅ Read **Section 1** (Product Status) – Understand we're 95% launch-ready
2. ✅ Review **Section 11** (Documentation Map) – Know where files are
3. ✅ Check **Section 12** (Launch Context) – Understand pre-launch priorities
4. ✅ Read `docs/launchPlan/NEW_SESSION_SUMMARY.md` – Full context for new sessions

### Before Making Code Changes
1. ✅ Understand **Section 4** (Multi-Tenancy Rules) – NON-NEGOTIABLE security
2. ✅ Review **Section 5** (RBAC System) – Permission requirements
3. ✅ Check **Section 6** (API Patterns) – Clerk 6.x auth patterns (critical!)
4. ✅ Follow **Section 3** (Naming & Coding Standards)

### For Pre-Launch Work
1. ✅ Open `docs/launchPlan/PRE_LAUNCH_CRITICAL_TASKS.md`
2. ✅ Implement Stripe Customer Portal (Task 1.1-1.4)
3. ✅ Implement Billing Emails (Task 2.1-2.3)
4. ✅ Test thoroughly before launch

---
*Last updated: October 9, 2025 - Updated for launch readiness, reorganized documentation structure*
