---
description: Used to onboard LLMs at the start of a new chat session.
auto_execution_mode: 1
---

# Windsurf LLM Onboarding Workflow

This guide helps new LLMs quickly understand the codebase structure, decisions, and context for effective collaboration on the multi-tenant SaaS boilerplate.

---

## 🚨 MUST READ FIRST (Critical Context)

### 1. Project Overview
- **Purpose**: Production-ready multi-tenant SaaS boilerplate
- **Stack**: Next.js 15 + TypeScript + Prisma + PostgreSQL + Clerk
- **Architecture**: Multi-tenant with `companyId` scoping on all data models
- **Current Status**: Core foundation phase with auth/CRUD stabilization

### 2. Recent Critical Decisions (2025-09-03)
- **Auth Strategy**: Clerk Test mode required in development (no keyless bypass)
- **Dev UX**: Removed dev-mode company switcher UI to reduce complexity
- **Security**: Soft deletes only for Company/Customer (never hard delete)
- **Rate Limiting**: Upstash Redis for production, in-memory fallback for dev

### 3. Key Files to Understand First
```
📁 MUST READ FILES:
├── docs/PRIORITIZED_AUTH_CRUD_READINESS_CHECKLIST.md  # Current action items
├── docs/REPO_PRD.md                                   # Product requirements
├── prisma/schema.prisma                               # Database models
├── src/lib/api-middleware.ts                          # Auth & validation
├── core/db/tenant-guard.ts                           # Multi-tenant enforcement
└── core/auth/company-provider.tsx                     # Company context
```

### 4. Current Priorities
1. Remove dev-mode company switcher completely
2. Enforce membership/role checks on ALL tenant APIs
3. Implement distributed rate limiting (Upstash)
4. Add comprehensive E2E testing
5. Set up Sentry observability

---

## 📚 CONTEXTUAL DEEP DIVES (Read as Needed)

### Authentication & Authorization Context

**When working on auth-related tasks:**

- **Read**: `docs/AUTHENTICATION.md` - Auth patterns and company switching
- **Read**: `src/middleware.ts` - Route protection and Clerk middleware
- **Read**: `core/auth/company-provider.tsx` - Company context management
- **Key Insight**: No dev keyless mode; always use Clerk (Test mode in dev)

### Multi-Tenancy & Database Context

**When working on data models or API routes:**

- **Read**: `docs/TENANTING.md` - Multi-tenant architecture deep dive
- **Read**: `core/db/tenant-guard.ts` - Automatic tenant scoping middleware
- **Read**: `prisma/schema.prisma` - All models, relationships, indexes
- **Key Rules**: 
  - All queries auto-scoped by `companyId`
  - Soft deletes for `Company`/`Customer` (never hard delete)
  - `UserCompany` uses hard deletes (no `deletedAt` field)

### API Development Context

**When working on API routes:**

- **Read**: `src/lib/api-middleware.ts` - Centralized auth, validation, rate limiting
- **Read**: `src/app/api/companies/route.ts` - Example CRUD with role checks
- **Read**: `src/app/api/customers/route.ts` - Tenant-scoped operations
- **Pattern**: Use `withApiMiddleware()` wrapper for all routes
- **Security**: Validate user membership in target company for all operations

### Frontend/UI Context

**When working on React components:**

- **Read**: `src/app/providers.tsx` - App-level providers and context
- **Read**: `src/app/dashboard/companies/page.tsx` - Example CRUD UI
- **Read**: `components/` directory structure
- **Key**: Company context available via `useCompany()` hook

### Testing Context

**When adding tests:**

- **Structure**: `/tests/e2e/` for Playwright, `/tests/unit/` for unit tests
- **Focus**: Authorization edge cases, tenant isolation, CRUD flows
- **Requirements**: Test both authenticated and role-based scenarios

---

## 🔧 DEVELOPMENT PATTERNS

### API Route Pattern
```typescript
// Standard API route structure
import { withApiMiddleware, createApiResponse, ApiContext } from '@/lib/api-middleware'

export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userId, companyId, validatedData } = context
    
    // Validate user membership in company
    const membership = await getUserCompanyMembership(userId, companyId)
    if (!membership || !hasRole(membership.role, 'ADMIN')) {
      return createApiResponse(false, null, 'Insufficient permissions')
    }
    
    // Perform operation with tenant scoping
    const result = await getTenantDb(companyId).model.create({
      data: { ...validatedData, companyId, createdBy: userId }
    })
    
    return createApiResponse(true, result)
  },
  {
    requireAuth: true,
    requireCompany: true,
    allowedMethods: ['POST'],
    validateSchema: CreateModelSchema,
    rateLimit: true
  }
)
```

### Component Pattern
```typescript
// Standard component with company context
'use client'

import { useCompany } from '@/core/auth/company-provider'

export function MyComponent() {
  const { currentCompany, switchCompany } = useCompany()
  
  // Component logic with tenant awareness
  return (
    <div>
      <p>Current: {currentCompany?.name}</p>
    </div>
  )
}
```

---

## 🚫 ANTI-PATTERNS (Avoid These)

### ❌ Don't Do
- Hard delete `Company` or `Customer` records
- Skip membership validation in API routes
- Use dev-mode company switcher UI
- Rely on client-side company context for security
- Add keyless auth bypass logic

### ✅ Do Instead
- Use soft deletes (`deletedAt` field)
- Validate membership + role in every tenant API
- Use Clerk Test mode for development
- Enforce tenant scoping at database level
- Keep auth logic server-side only

---

## 📋 QUICK REFERENCE

### Environment Variables
```bash
# Required for development
DATABASE_URL="postgresql://..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Optional for production features
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
SENTRY_DSN="https://..."
```

### Common Commands
```bash
# Database
npx prisma migrate dev --name "description"
npx prisma generate
npx prisma studio

# Development
npm run dev
npm run build
npm run lint

# Testing
npm run test:e2e
npm run test:unit
```

### Role Hierarchy
```
OWNER > ADMIN > MEMBER

Typical permissions:
- MEMBER: Read/list resources
- ADMIN: Create/update resources  
- OWNER: Delete resources, manage users
```

---

## 🎯 WORKFLOW CHECKLIST

**Before starting any task:**
- [ ] Read the current priorities in `PRIORITIZED_AUTH_CRUD_READINESS_CHECKLIST.md`
- [ ] Understand which contextual sections apply to your task
- [ ] Check recent memories for user preferences and decisions

**During development:**
- [ ] Follow established patterns (API middleware, tenant scoping, etc.)
- [ ] Validate all changes maintain multi-tenant isolation
- [ ] Test authorization edge cases

**Before completing:**
- [ ] Update relevant documentation if patterns change
- [ ] Mark todo items as completed
- [ ] Verify no anti-patterns were introduced

---

*This workflow ensures consistent, secure, and maintainable development across the multi-tenant SaaS boilerplate.*

<function_calls>
<invoke name="Read">
<parameter name="file_path">c:\Users\danny\CascadeProjects\HatsOffMVP\saastastic\docs\AUTHENTICATION.md
