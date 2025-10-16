# 🚀 SaaStastic - AI Assistant Context Guide

**Purpose**: This file provides complete context for AI coding assistants (Cursor, Windsurf, GitHub Copilot, etc.) working on SaaStastic-based projects.

**Last Updated**: October 14, 2025  
**Version**: 1.0 - Production Ready

---

## 📋 TL;DR - Essential Facts

**What is SaaStastic?**  
A production-ready, multi-tenant B2B SaaS boilerplate with authentication, billing, RBAC, and team management built-in.

**Tech Stack**:
- Frontend: Next.js 15 (App Router), React 19, TypeScript 5
- Backend: Next.js API Routes with RBAC middleware
- Database: PostgreSQL + Prisma ORM 6
- Auth: Clerk (multi-tenant aware)
- Payments: Stripe (subscriptions, invoices, webhooks)
- Styling: TailwindCSS 4 + shadcn/ui components

**Non-Negotiable Rules**:
1. ✅ **ALL** database queries MUST include `companyId` (multi-tenant isolation)
2. ✅ **ALL** API routes MUST use `withPermissions()` wrapper (RBAC)
3. ✅ **ALL** user inputs MUST be validated with Zod schemas
4. ❌ **NEVER** modify files in `src/core/` (core infrastructure)
5. ✅ Create new features in `src/features/custom/` (safe zone)

---

## 🏗️ Architecture Overview

### **Directory Structure**

```
saastastic/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Public pages (/, /pricing, /about)
│   │   ├── (app)/              # Authenticated app (/dashboard, /team, /billing)
│   │   └── api/                # REST API endpoints
│   ├── core/                   # 🔒 CORE - Never modify
│   │   ├── auth/               # Clerk integration, providers
│   │   ├── db/                 # Prisma client, tenant guards
│   │   └── rbac/               # Role provisioning
│   ├── features/               # Feature modules
│   │   ├── billing/            # Stripe integration
│   │   ├── companies/          # Company management
│   │   ├── customers/          # Customer module
│   │   ├── users/              # Team management, RBAC
│   │   └── custom/             # ✅ YOUR CODE GOES HERE
│   ├── shared/                 # Shared utilities
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # React hooks
│   │   ├── lib/                # Utilities, middleware, permissions
│   │   └── ui/                 # shadcn/ui primitives
│   ├── lib/
│   │   └── actions/            # Server actions
│   └── modules/                # Legacy modules (being migrated to features/)
├── prisma/
│   └── schema.prisma           # Database schema (single source of truth)
├── GUIDES/                     # Customer documentation
└── tests/                      # 87 tests (60 unit + 27 E2E)
```

### **Safe Zones for Customization**

✅ **SAFE - Modify Freely**:
- `src/features/custom/**/*` - Your custom features
- `src/app/(app)/custom/**/*` - Your custom pages
- `src/app/api/custom/**/*` - Your custom API routes
- `tailwind.config.js` - Design tokens (extend, don't replace)
- `.env.local` - Environment variables

⚠️ **CAUTION - Ask First**:
- `src/shared/components/**/*` - Shared UI (better to wrap/extend)
- `src/features/*/components/**/*` - Feature UI (consider wrapper pattern)

🔒 **NEVER MODIFY**:
- `src/core/**/*` - Core authentication, database, RBAC
- `src/shared/lib/permissions.ts` - Core permission definitions
- `src/shared/lib/rbac-middleware.ts` - Permission enforcement
- `src/shared/lib/api-middleware.ts` - Request handling
- `prisma/migrations/*/migration.sql` - Existing migrations

---

## 🔒 Multi-Tenancy & Security

### **Multi-Tenant Isolation**

SaaStastic uses **company-based multi-tenancy**. Every tenant-scoped model includes a `companyId` field.

**CRITICAL**: Every database query MUST be scoped by `companyId`:

```typescript
// ❌ WRONG - Security vulnerability!
const customers = await db.customer.findMany();

// ✅ CORRECT - Tenant isolated
const customers = await db.customer.findMany({
  where: { companyId: context.companyId },
});
```

### **Database Schema Patterns**

All tenant-scoped models follow this pattern:

```prisma
model YourModel {
  id          String   @id @default(cuid())
  companyId   String   // 🔒 REQUIRED for multi-tenancy
  
  // Your fields
  name        String
  description String?
  
  // Audit trail (best practice)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime? // Soft delete
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Indexes (CRITICAL for performance)
  @@index([companyId])
  @@index([deletedAt])
}
```

### **Audit Fields**

Include these on all models:
- `createdAt` - When record was created
- `updatedAt` - When last modified
- `createdBy` - User ID who created
- `updatedBy` - User ID who last modified
- `deletedAt` - Soft delete timestamp (null = active)

---

## 🛡️ RBAC System

### **Permission-Based Access Control**

SaaStastic includes **29 built-in permissions** across 7 categories:

1. **Organization** (5) - Company management
2. **Billing** (5) - Subscription, invoices
3. **Team** (6) - User management, invitations
4. **Customers** (4) - Customer CRUD
5. **API** (3) - API key management
6. **Roles** (4) - Role/permission management
7. **System** (2) - Admin-level access

### **System Roles**

Every company automatically gets 4 system roles:

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Owner** | All 29 | Company creator, full access |
| **Admin** | 25 | Manage team, billing, customers |
| **Member** | 7 | View data, manage customers |
| **Viewer** | 5 | Read-only access |

### **Using Permissions in API Routes**

**Pattern**: Wrap ALL API routes with `withPermissions()`:

```typescript
// src/app/api/custom/feature/route.ts

import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/core/db/client';

// Define validation schema
const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

// Wrap handler with permission check
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // context.companyId - Auto-injected company ID
    // context.userId - Authenticated user ID
    // context.permissions - User's permission set
    
    try {
      // 1. Validate input
      const body = await req.json();
      const data = createSchema.parse(body);
      
      // 2. Database operation (scoped by companyId)
      const result = await db.yourModel.create({
        data: {
          ...data,
          companyId: context.companyId, // 🔒 CRITICAL
          createdBy: context.userId,
        },
      });
      
      // 3. Return success
      return NextResponse.json({ 
        success: true, 
        data: result 
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  [PERMISSIONS.CUSTOMER_CREATE] // Required permission
);
```

### **Using Permissions in Components**

```typescript
// src/features/custom/components/MyComponent.tsx

import { PermissionGuard } from '@/shared/components/permission-guard';
import { PERMISSIONS } from '@/shared/lib/permissions';
import { usePermissions } from '@/shared/hooks/use-permissions';

export function MyComponent() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {/* Conditional rendering based on permission */}
      {hasPermission(PERMISSIONS.CUSTOMER_CREATE) && (
        <Button>Create Customer</Button>
      )}
      
      {/* Or use PermissionGuard component */}
      <PermissionGuard permission={PERMISSIONS.CUSTOMER_DELETE}>
        <Button variant="destructive">Delete</Button>
      </PermissionGuard>
    </div>
  );
}
```

---

## 🎨 Frontend Patterns

### **Component Structure**

```typescript
// src/features/custom/components/MyComponent.tsx

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

interface MyComponentProps {
  title: string;
  onSave?: () => void;
}

export function MyComponent({ title, onSave }: MyComponentProps) {
  // 1. Hooks first
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Event handlers
  const handleClick = async () => {
    setLoading(true);
    try {
      // Your logic
      onSave?.();
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  // 3. Render with loading/error states
  return (
    <Card>
      <h2>{title}</h2>
      {error && <div className="text-red-500">{error}</div>}
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Save'}
      </Button>
    </Card>
  );
}
```

### **Data Fetching with React Query**

```typescript
// src/features/custom/hooks/use-customers.ts

import { useQuery } from '@tanstack/react-query';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/custom/customers');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });
}

// Usage in component
function CustomerList() {
  const { data, isLoading, error } = useCustomers();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

### **Creating Pages**

```typescript
// src/app/(app)/custom/feature/page.tsx

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MyComponent } from '@/features/custom/components/MyComponent';

export default async function FeaturePage() {
  // Server-side auth check
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Feature</h1>
      <MyComponent title="Hello World" />
    </div>
  );
}

// Add metadata for SEO
export const metadata = {
  title: 'My Feature | SaaStastic',
  description: 'Custom feature page',
};
```

---

## 💳 Stripe Integration

### **Subscription Lifecycle**

SaaStastic handles the complete Stripe subscription lifecycle:

1. **Checkout** - Create subscription via `/api/billing/checkout`
2. **Webhooks** - Receive events at `/api/webhooks/stripe`
3. **Subscription Model** - Track in database
4. **Invoice Model** - Store billing history
5. **Customer Portal** - Self-service management

### **Extending Billing Features**

```typescript
// Example: Add usage-based billing

// 1. Track usage
await db.usageRecord.create({
  data: {
    companyId,
    metric: 'api_calls',
    quantity: 1,
    timestamp: new Date(),
  },
});

// 2. Report to Stripe (in webhook or cron)
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: totalUsage,
    timestamp: Math.floor(Date.now() / 1000),
  }
);
```

See `GUIDES/07_STRIPE_CUSTOMIZATION.md` for detailed billing customization.

---

## 🧪 Testing

### **Test Suite Overview**

- **87 total tests**
  - 60 unit tests (services, utilities)
  - 27 E2E tests (Playwright)

### **Running Tests**

```bash
# Unit tests
npm run test

# E2E tests
npx playwright test

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### **Writing Tests**

```typescript
// tests/unit/services/my-service.test.ts

import { describe, it, expect } from 'vitest';
import { myService } from '@/features/custom/services/my-service';

describe('MyService', () => {
  it('should do something', () => {
    const result = myService.doSomething();
    expect(result).toBe('expected');
  });
});
```

---

## 🔧 Development Workflow

### **Adding a New Feature**

1. **Plan** - Read `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md`
2. **Database** - Add model to `prisma/schema.prisma`
3. **Migration** - Run `npx prisma migrate dev --name add_feature`
4. **API Routes** - Create in `src/app/api/custom/feature/`
5. **Components** - Build in `src/features/custom/feature/components/`
6. **Page** - Add to `src/app/(app)/custom/feature/page.tsx`
7. **Test** - Write unit and E2E tests
8. **Verify** - Run test suite and type check

### **Common Commands**

```bash
# Development server
npm run dev

# Database
npx prisma studio                        # Visual DB editor
npx prisma migrate dev --name [name]     # Create migration
npx prisma generate                      # Regenerate client

# Code quality
npm run lint                             # ESLint
npx tsc --noEmit                        # Type check
npm run format                           # Prettier

# Testing
npm run test                             # Unit tests
npx playwright test                      # E2E tests
npx playwright test --ui                 # Test UI mode
```

---

## 🚨 Common Pitfalls & Solutions

### **1. Missing companyId**

**Problem**: Query returns data from all tenants

**Solution**: Always include `companyId` in where clause:
```typescript
where: { companyId: context.companyId }
```

### **2. Permission Denied (403)**

**Problem**: API returns 403 Forbidden

**Solution**:
- Check user has required permission in database
- Verify `withPermissions()` wrapper is correct
- Check role assignment in UserCompany table

### **3. TypeScript Errors After Schema Change**

**Problem**: Types out of sync after Prisma changes

**Solution**:
```bash
npx prisma generate
npm run dev
```

### **4. Auth Not Working**

**Problem**: Getting 401 or auth redirects

**Solution**:
- Verify `.env.local` has correct Clerk keys
- Check `await auth()` is awaited (Clerk 6.x requirement)
- Clear `.clerk` cache and restart server

---

## 📚 Additional Resources

### **Customer Guides**

All guides are in the `GUIDES/` directory:

1. `01_SETUP_GUIDE.md` - Complete setup instructions
2. `02_TEST_SETUP_GUIDE.md` - Test configuration
3. `03_FAQ.md` - Common questions and troubleshooting
4. `04_RBAC_USAGE.md` - Permission system usage
5. `05_SAFE_CUSTOMIZATION_GUIDE.md` - What to modify safely
6. `06_CUSTOMIZING_PERMISSIONS.md` - Extending RBAC
7. `07_STRIPE_CUSTOMIZATION.md` - Billing customization
8. `08_EXTENDING_TEAM_MANAGEMENT.md` - Team features
9. `09_TEST_SUITE_DOCUMENTATION.md` - Test coverage
10. `10_MANUAL_TESTING_GUIDE.md` - Manual test procedures

### **AI-Specific Guides**

For AI assistants (located in `docs/guidesForVibers/`):

- `LLM_ONBOARDING_CONTEXT.md` - Detailed AI instructions
- `AI_SAFE_CUSTOMIZATION_RULES.md` - Safety rules for code generation
- `VibeCodingTips.md` - Copy-paste prompt templates

---

## ✅ Quick Checklist for AI Assistants

Before generating code, verify:

- [ ] **Safe Zone**: Creating files in `src/features/custom/`?
- [ ] **Multi-Tenant**: All queries include `companyId`?
- [ ] **Permissions**: API routes use `withPermissions()`?
- [ ] **Validation**: User input validated with Zod?
- [ ] **Types**: All TypeScript types defined?
- [ ] **Errors**: Proper error handling included?
- [ ] **Audit**: Include createdBy, updatedBy fields?
- [ ] **Indexes**: Database indexes on companyId?

---

## 🎯 Core Principles Summary

1. **Security First**: Multi-tenant isolation and RBAC are non-negotiable
2. **Type Safety**: TypeScript strict mode, no `any` types
3. **Validation**: Zod schemas for all user inputs
4. **Safe Customization**: Create in `custom/` folders, never modify `core/`
5. **Audit Trail**: Track who did what and when
6. **Soft Deletes**: Use `deletedAt` instead of hard deletes
7. **Performance**: Index on `companyId` for all tenant-scoped models
8. **Testing**: Write tests for critical business logic

---

**This guide provides the foundation for working with SaaStastic. For specific tasks, refer to the detailed guides in `GUIDES/` or the AI prompt templates in `docs/guidesForVibers/VibeCodingTips.md`.**

**Last Updated**: October 14, 2025  
**Maintained by**: SaaStastic Team  
**Version**: 1.0 - Production Ready

*Happy Building! 🚀*
