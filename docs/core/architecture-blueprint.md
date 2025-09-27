# SaaStastic Architecture Blueprint (Canonical) - Updated September 25, 2025

## 🎉 **Current Status: PRODUCTION-READY ENTERPRISE FOUNDATION**

SaaStastic has evolved into a complete, enterprise-grade B2B SaaS foundation with comprehensive RBAC system.

## 🧱 Platform Layers

### ✅ **Implemented Layers**
- **Marketing Surface (`/src/app/(marketing)/`)**
  - ✅ Public routes, SEO, lead capture, analytics instrumentation
- **Product Surface (`/src/app/(app)/`)**
  - ✅ Authenticated tenant experience with RBAC controls
  - ✅ Dashboard, billing, customer management, team management
- **Edge & Middleware (`/src/middleware.ts`, `withPermissions`)**
  - ✅ Clerk auth, RBAC permission checking, tenant enforcement

### ⏳ **Future Layers**
- **Admin Surface (`/src/app/(admin)/`)** *(Phase 3)*
  - Support tooling, impersonation, observability, incident response

## 🔐 Multi-Tenancy & RBAC Security

### ✅ **Implemented Security**
- **RBAC System**: 29 granular permissions across 7 categories
- **Role Management**: Owner/Admin/Member/Viewer with custom role support
- **Single trusted path**: Clerk session → `withPermissions` → Permission check → Prisma tenant guard
- **Data model contract**: every tenant-scoped model includes `companyId`, audit fields, and `deletedAt`
- **Permission enforcement**: API routes protected with permission requirements
- **Frontend guards**: Components use permission-based conditional rendering

### **Security Principles**
- **Defense in depth**: Multi-layer security with tenant isolation + RBAC
- **Auditability**: All sensitive actions logged with comprehensive metadata
- **Zero trust**: Every operation requires authentication + appropriate permissions

## 🧰 Implementation Patterns

### ✅ **Current Patterns (RBAC-Enhanced)**
- **API routes**: Use `withPermissions(handler, [PERMISSIONS.ACTION])` for protection
- **Components**: Use `usePermissions()` hook and `<PermissionGuard>` for conditional rendering
- **Database access**: Automatic tenant scoping with `companyId` filtering
- **Permission checking**: Both server-side (middleware) and client-side (hooks) validation

## 📁 Current File Structure (Reorganized)

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public marketing pages
│   ├── (app)/             # Authenticated app pages
│   └── api/               # API routes with RBAC protection
├── core/                  # Core infrastructure
│   ├── auth/              # Authentication (Clerk + company context)
│   ├── db/                # Database client & tenant guards
│   └── observability/     # Logging & monitoring (future)
├── features/              # Feature modules (domain-driven)
│   ├── billing/           # Stripe integration with RBAC
│   ├── companies/         # Company management
│   ├── customers/         # Customer management
│   ├── marketing/         # Marketing components
│   └── users/             # User & team management
├── shared/                # Shared utilities & components
│   ├── components/        # Reusable UI components
│   ├── hooks/             # React hooks (including usePermissions)
│   ├── lib/               # Utilities, middleware, RBAC system
│   └── ui/                # Base UI components
└── [config files]        # TypeScript, Next.js, etc.
```

## 🔐 RBAC System Architecture

### Database Schema
```
permissions (29 records)    # System permissions
roles (per company)         # Owner/Admin/Member/Viewer + custom
user_companies             # Enhanced with roleId reference
```

### API Protection
```typescript
export const POST = withPermissions(handler, [PERMISSIONS.ACTION]);
```

### Frontend Integration
```typescript
const { hasPermission } = usePermissions();
<PermissionGuard permission="action">...</PermissionGuard>
```
```

Keep domain-specific UI and logic inside `modules/<domain>/`, promote reusable primitives into `modules/shared/` or `src/lib/shared/`, and centralize infrastructure code inside `core/`.

 ## 🌩️ Cloud & Integrations
 - **Stripe**: Subscription lifecycle, invoices, customer portal.
 - **Resend (Phase 2)**: Transactional emails for invitations and billing alerts.
- **Cloudflare R2 (Phase 2+)**: Tenant file storage with signed URLs.
- **Sentry & PostHog (Phase 3)**: Error tracking and product analytics.

## 🧪 Quality Gates
- `npx tsc --noEmit` before merge.
- Playwright suite for auth, companies, customers, billing.
- All API routes include contract tests (Vitest) verifying Zod schemas + tenant isolation.
- Pre-commit hooks enforce ESLint, formatting, dependency checks.

## 🔄 Deployment Flow
1. **Feature branch** with ADR when architectural change > trivial.
2. **CI Pipeline** (GitHub Actions) runs lint, type, unit, E2E, and migration validation.
3. **Preview Deploy** to Vercel for marketing/app surfaces.
4. **Manual QA Checklist** referencing PRD acceptance criteria.
5. **Production Release** after verifying migrations applied & observability dashboards green.

## 🛰️ Observability & Monitoring

- **Logging** – Emit structured events via `core/observability/` helpers with tenant context (`companyId`, `userId`).
- **Metrics** – Track request latency, error rates, and rate-limit hits; review dashboards before every deployment.
- **Tracing** – Instrument checkout, onboarding, and webhook flows with trace identifiers for cross-service correlation.
- **Health Checks** – Monitor `/api/health`, database connectivity, and third-party integrations (Stripe, Clerk) continuously.

## ⚙️ Performance Considerations

- **Database** – Index tenant keys, enable Prisma connection pooling, and paginate queries to keep payloads predictable.
- **Frontend** – Leverage App Router code-splitting, provide responsive suspense/loading states, and reuse data with React Query/Cache providers.
- **API** – Apply rate limiting, compress responses, and cache read-heavy endpoints at the edge when safe.

## 🛠 Development Workflow

- Run `npx tsc --noEmit`, `npm run lint`, and the relevant Playwright/Vitest suites before opening a PR.
- Capture ADRs for architectural deviations and update `docs/core/product-status.md`, `docs/core/architecture-blueprint.md`, and `docs/core/technical-workflows.md` accordingly.
- Synchronize documentation, observability alerts, and onboarding materials after each release.

## 🗺️ Planned Evolution
| Phase | Theme | Architecture Impact |
| --- | --- | --- |
| 1B | Polish & DX | Tighten lint/type configs, finalize documentation, stabilize workflows. |
| 2 | Team Collaboration | Expand `modules/users/` with invitations, RBAC gating, activity feeds. |
| 3 | Support & Ops | Introduce `/src/app/(admin)/`, observability adapters, impersonation guardrails. |
## ✅ Non-Negotiable Guardrails
- Tenant isolation must be enforced by middleware; never trust client-provided `companyId`.
- No console logging in production pathways—use structured log helper.
 - No `any` types in source; prefer Zod inference or explicit interfaces.
 - New dependencies require rationale + security review.

---
*This blueprint is the canonical architecture reference. Detailed specs live alongside it in `docs/core/architecture/`.*
