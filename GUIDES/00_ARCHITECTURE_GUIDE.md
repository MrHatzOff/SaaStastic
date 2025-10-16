# 🏗️ SaaStastic Architecture & Developer Guide

**Welcome!** This guide explains how SaaStastic is architected and how to build features on top of it. Whether you're customizing for your own SaaS or learning the patterns, this guide will help you understand the design decisions and best practices.

**Last Updated**: October 14, 2025  
**Version**: 1.0 - Production Ready

---

## 📋 What is SaaStastic?

SaaStastic is a **production-ready, multi-tenant B2B SaaS boilerplate** that handles all the foundational aspects of running a SaaS business:

- ✅ **Authentication & Authorization** - Clerk with role-based access control (RBAC)
- ✅ **Multi-Tenant Architecture** - Complete data isolation between companies
- ✅ **Billing & Subscriptions** - Full Stripe integration with webhooks
- ✅ **Team Management** - User invitations, roles, permissions
- ✅ **Database** - PostgreSQL with Prisma ORM, migrations, audit trails
- ✅ **Testing** - 87 tests (60 unit + 27 E2E with Playwright)
- ✅ **Modern Stack** - Next.js 15, React 19, TypeScript 5, Tailwind CSS 4

**The goal**: Let you focus on building your unique business logic instead of reinventing auth, billing, and multi-tenancy.

---

## 🎯 Core Technology Stack

### **Frontend**
- **Next.js 15** (App Router) - Server components, streaming, optimizations
- **React 19** - Latest features and performance improvements
- **TypeScript 5** - Type safety throughout
- **TailwindCSS 4** - Utility-first styling with custom design system
- **shadcn/ui** - Beautiful, accessible component library

### **Backend**
- **Next.js API Routes** - RESTful APIs with middleware
- **Prisma ORM 6** - Type-safe database access
- **PostgreSQL** - Robust, proven database
- **Zod** - Runtime validation for all inputs

### **Infrastructure**
- **Clerk** - Authentication provider (handles OAuth, magic links, etc.)
- **Stripe** - Payment processing and subscription management
- **Vercel** (recommended) - Deployment platform
- **Sentry** (optional) - Error tracking and monitoring

**Why these choices?**
- Proven, enterprise-ready technologies
- Strong TypeScript support throughout
- Excellent developer experience
- Active communities and regular updates

---

## 🏢 Multi-Tenant Architecture

### **What is Multi-Tenancy?**

Multi-tenancy means one application serves many customers (tenants), each with completely isolated data. Think of it like an apartment building - many residents share the building (application), but each has their own locked apartment (data).

**SaaStastic uses company-based multi-tenancy**: Each customer company is a separate tenant with isolated data.

### **How It Works**

Every piece of tenant-specific data includes a `companyId` field that links it to a company:

```prisma
model Customer {
  id          String   @id @default(cuid())
  companyId   String   // 🔑 The key to multi-tenancy
  name        String
  email       String
  
  // Relation back to company
  company     Company  @relation(fields: [companyId], references: [id])
  
  @@index([companyId]) // 🚀 Performance optimization
}
```

**Why this pattern?**
- **Simple** - Single database, single app instance
- **Secure** - SQL-level isolation with proper queries
- **Cost-effective** - Scales horizontally without infrastructure complexity
- **Compliant** - Meets most data residency and privacy requirements

### **Writing Multi-Tenant Queries**

Always scope your database queries by `companyId`:

```typescript
// ❌ WRONG - Returns data from ALL companies
const customers = await db.customer.findMany();

// ✅ CORRECT - Returns only this company's data
const customers = await db.customer.findMany({
  where: { companyId: context.companyId }
});
```

**The golden rule**: Every tenant-scoped model query MUST include `companyId` in the where clause.

### **Database Schema Patterns**

All tenant-scoped models follow this pattern:

```prisma
model YourFeature {
  id          String   @id @default(cuid())
  companyId   String   // Required for multi-tenancy
  
  // Your business fields
  name        String
  description String?
  status      String
  
  // Audit trail (recommended)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?  // User ID who created
  updatedBy   String?  // User ID who last updated
  deletedAt   DateTime? // Soft delete
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Indexes (critical for performance)
  @@index([companyId])
  @@index([deletedAt])
}
```

**Why audit fields?**
- **Compliance** - Many regulations require knowing who changed what and when
- **Debugging** - Track down issues by seeing history
- **Features** - Build "last modified by" displays, activity feeds
- **Soft Deletes** - Recover accidentally deleted data

---

## 🔒 Role-Based Access Control (RBAC)

### **Permission System Overview**

SaaStastic includes a comprehensive RBAC system with **29 built-in permissions** across 7 categories:

| Category | Permissions | Examples |
|----------|-------------|----------|
| **Organization** | 5 | Update company settings, manage billing |
| **Billing** | 5 | View invoices, manage subscriptions |
| **Team** | 6 | Invite users, manage roles |
| **Customers** | 4 | Create, read, update, delete customers |
| **API** | 3 | Manage API keys and access |
| **Roles** | 4 | Create and assign custom roles |
| **System** | 2 | Admin-level system access |

### **System Roles**

Every company automatically gets 4 default roles:

**Owner** (All 29 permissions)
- Company creator
- Full control over everything
- Cannot be removed

**Admin** (25 permissions)
- Manage team and customers
- Handle billing
- Cannot delete company or change owner

**Member** (7 permissions)
- View company data
- Manage customers
- Basic team functionality

**Viewer** (5 permissions)
- Read-only access
- View customers and invoices
- No modification rights

**Why this structure?**
- Covers 80% of B2B SaaS use cases out of the box
- Granular enough for flexibility
- Simple enough to explain to customers

### **Using Permissions in Your Code**

#### **Backend: API Routes**

Wrap all API routes with the `withPermissions()` middleware:

```typescript
// src/app/api/features/custom/route.ts

import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/core/db/client';

// Define your input schema
const createFeatureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // context automatically includes:
    // - context.companyId (tenant)
    // - context.userId (authenticated user)
    // - context.permissions (user's permission set)
    
    try {
      const body = await req.json();
      const data = createFeatureSchema.parse(body);
      
      // Create with tenant scoping
      const feature = await db.yourFeature.create({
        data: {
          ...data,
          companyId: context.companyId, // 🔒 Tenant isolation
          createdBy: context.userId,
        },
      });
      
      return NextResponse.json({ success: true, data: feature });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      
      console.error('Error creating feature:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  [PERMISSIONS.CUSTOMER_CREATE] // Required permission
);
```

**What happens under the hood:**
1. Middleware authenticates the user (via Clerk)
2. Fetches user's company association
3. Loads user's permissions
4. Checks if user has required permission
5. If yes: calls your handler with context
6. If no: returns 403 Forbidden

#### **Frontend: Components**

Use the `PermissionGuard` component or `usePermissions` hook:

```typescript
// src/features/custom/components/MyFeature.tsx

import { PermissionGuard } from '@/shared/components/permission-guard';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { PERMISSIONS } from '@/shared/lib/permissions';
import { Button } from '@/shared/ui/button';

export function MyFeature() {
  const { hasPermission } = usePermissions();
  
  return (
    <div className="space-y-4">
      <h1>My Feature</h1>
      
      {/* Conditional rendering */}
      {hasPermission(PERMISSIONS.CUSTOMER_CREATE) && (
        <Button onClick={() => {/* create */}}>
          Create Customer
        </Button>
      )}
      
      {/* Component-level guard */}
      <PermissionGuard permission={PERMISSIONS.CUSTOMER_DELETE}>
        <Button variant="destructive">Delete Customer</Button>
      </PermissionGuard>
    </div>
  );
}
```

**Why both backend and frontend checks?**
- **Backend**: Security (required - never trust the client)
- **Frontend**: UX (optional - hide buttons users can't use)

### **Adding Custom Permissions**

Don't modify the core permission files. Instead, create your own:

```typescript
// src/features/custom/inventory/lib/permissions.ts

export const INVENTORY_PERMISSIONS = {
  INVENTORY_CREATE: 'custom:inventory:create',
  INVENTORY_READ: 'custom:inventory:read',
  INVENTORY_UPDATE: 'custom:inventory:update',
  INVENTORY_DELETE: 'custom:inventory:delete',
  INVENTORY_EXPORT: 'custom:inventory:export',
} as const;
```

Then seed them into the database and assign to roles via the admin dashboard.

**See `GUIDES/06_CUSTOMIZING_PERMISSIONS.md` for detailed instructions.**

---

## 🏗️ Project Structure

### **Directory Layout**

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages
│   │   ├── page.tsx              # Homepage
│   │   ├── pricing/              # Pricing page
│   │   └── about/                # About page
│   ├── (app)/                    # Authenticated app
│   │   ├── dashboard/            # Main dashboard
│   │   ├── team/                 # Team management
│   │   ├── billing/              # Subscription & billing
│   │   └── custom/               # ✅ YOUR PAGES GO HERE
│   └── api/                      # REST API endpoints
│       ├── users/                # User management APIs
│       ├── billing/              # Billing APIs
│       └── custom/               # ✅ YOUR APIs GO HERE
│
├── core/                         # 🔒 CORE - Don't modify
│   ├── auth/                     # Clerk integration
│   ├── db/                       # Prisma client, middleware
│   └── rbac/                     # Role provisioning
│
├── features/                     # Feature modules
│   ├── billing/                  # Stripe integration
│   ├── companies/                # Company management
│   ├── customers/                # Customer module
│   ├── users/                    # Team & RBAC
│   └── custom/                   # ✅ YOUR FEATURES GO HERE
│       └── your-feature/
│           ├── components/       # React components
│           ├── services/         # Business logic
│           ├── hooks/            # React hooks
│           ├── types/            # TypeScript types
│           └── lib/              # Utilities
│
├── shared/                       # Shared across features
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Common React hooks
│   ├── lib/                      # Utilities, middleware
│   └── ui/                       # shadcn/ui primitives
│
└── lib/
    └── actions/                  # Server actions
```

### **Safe Zones for Customization**

When building your SaaS, stick to these areas:

✅ **SAFE - Modify Freely**:
- `src/features/custom/**/*` - Your business logic
- `src/app/(app)/custom/**/*` - Your application pages
- `src/app/api/custom/**/*` - Your API endpoints
- `tailwind.config.js` - Extend design tokens
- `.env.local` - Environment configuration

⚠️ **CAUTION - Consider Alternatives**:
- `src/shared/components/**/*` - Better to wrap/extend
- `src/features/*/components/**/*` - Consider wrapper pattern
- `prisma/schema.prisma` - Careful with migrations

🔒 **NEVER MODIFY** (Will break updates):
- `src/core/**/*` - Authentication, DB, RBAC core
- `src/shared/lib/permissions.ts` - Core permissions
- `src/shared/lib/rbac-middleware.ts` - Permission enforcement
- `src/shared/lib/api-middleware.ts` - Request handling

**See `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` for detailed guidance.**

---

## 💳 Stripe Integration

### **How Billing Works**

SaaStastic includes a complete Stripe integration:

1. **Checkout** - User selects plan on pricing page
2. **Stripe Session** - Created via `/api/billing/checkout`
3. **Payment** - Handled by Stripe (PCI compliant)
4. **Webhook** - Stripe notifies your app at `/api/webhooks/stripe`
5. **Database Update** - Subscription record created/updated
6. **Access Granted** - User can now access features

### **Database Models**

Three key models handle billing:

```prisma
model Subscription {
  id                     String   @id @default(cuid())
  companyId              String   @unique
  stripeSubscriptionId   String   @unique
  stripePriceId          String
  status                 String   // active, canceled, past_due
  currentPeriodEnd       DateTime
  cancelAtPeriodEnd      Boolean  @default(false)
  // ... more fields
}

model Invoice {
  id              String   @id @default(cuid())
  companyId       String
  stripeInvoiceId String   @unique
  amount          Int      // In cents
  status          String   // paid, open, void
  paidAt          DateTime?
  // ... more fields
}

model PaymentMethod {
  id                    String  @id @default(cuid())
  companyId             String  @unique
  stripePaymentMethodId String  @unique
  type                  String  // card, bank_account
  last4                 String?
  // ... more fields
}
```

### **Webhook Handling**

The webhook handler at `src/app/api/webhooks/stripe/route.ts` processes Stripe events:

```typescript
// Key events handled:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed
- payment_method.attached
```

**Important**: Always verify webhook signatures to ensure requests are from Stripe.

### **Extending Billing**

Common customizations:

**Add Usage-Based Billing**:
```typescript
// Track usage
await db.usageRecord.create({
  data: {
    companyId,
    metric: 'api_calls',
    quantity: 1,
    timestamp: new Date(),
  },
});

// Report to Stripe monthly
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  { quantity: totalUsage }
);
```

**See `GUIDES/07_STRIPE_CUSTOMIZATION.md` for comprehensive examples.**

---

## 🎨 Frontend Development

### **Component Patterns**

SaaStastic uses modern React patterns:

```typescript
// src/features/custom/components/MyComponent.tsx

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

interface MyComponentProps {
  title: string;
  onSave?: (data: FormData) => Promise<void>;
}

export function MyComponent({ title, onSave }: MyComponentProps) {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await onSave?.(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  // Render with loading and error states
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Card>
  );
}
```

### **Data Fetching with React Query**

Use React Query for server state:

```typescript
// src/features/custom/hooks/use-customers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CustomerData) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create customer');
      return res.json();
    },
    onSuccess: () => {
      // Refetch customers list
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
```

### **Creating Pages**

Next.js 15 App Router pages are React Server Components by default:

```typescript
// src/app/(app)/custom/my-feature/page.tsx

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MyComponent } from '@/features/custom/components/MyComponent';

export default async function MyFeaturePage() {
  // Server-side authentication check
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

// SEO metadata
export const metadata = {
  title: 'My Feature | SaaStastic',
  description: 'Custom feature description',
};
```

---

## 🧪 Testing

### **Test Suite Overview**

SaaStastic includes **87 tests** covering:

- **60 Unit Tests** - Services, utilities, business logic
- **27 E2E Tests** - Complete user workflows with Playwright

### **Running Tests**

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test -- src/features/custom/services/my-service.test.ts

# Run E2E tests
npx playwright test

# Run E2E tests in UI mode (interactive)
npx playwright test --ui

# Type checking
npx tsc --noEmit
```

### **Writing Tests**

**Unit Test Example**:
```typescript
// tests/unit/services/customer-service.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { customerService } from '@/features/custom/services/customer-service';

describe('CustomerService', () => {
  beforeEach(() => {
    // Setup
  });
  
  it('should create customer with valid data', async () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      companyId: 'test-company',
    };
    
    const customer = await customerService.create(data);
    
    expect(customer.name).toBe('John Doe');
    expect(customer.email).toBe('john@example.com');
  });
  
  it('should throw error with invalid email', async () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      companyId: 'test-company',
    };
    
    await expect(customerService.create(data)).rejects.toThrow('Invalid email');
  });
});
```

**E2E Test Example**:
```typescript
// tests/e2e/customer-management.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Customer Management', () => {
  test('should create new customer', async ({ page }) => {
    await page.goto('/customers');
    await page.click('button:has-text("Add Customer")');
    
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Customer created successfully')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });
});
```

**See `GUIDES/09_TEST_SUITE_DOCUMENTATION.md` for comprehensive testing guide.**

---

## 🚀 Development Workflow

### **Adding a New Feature**

Follow this process for building features:

1. **Plan**: Read `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md`
2. **Database**: Add model to `prisma/schema.prisma` with proper indexes
3. **Migration**: Run `npx prisma migrate dev --name add_feature_name`
4. **API Routes**: Create in `src/app/api/custom/feature/`
5. **Services**: Business logic in `src/features/custom/feature/services/`
6. **Components**: UI in `src/features/custom/feature/components/`
7. **Pages**: Routes in `src/app/(app)/custom/feature/`
8. **Tests**: Write unit and E2E tests
9. **Verify**: Run test suite and type check

### **Common Commands**

```bash
# Development
npm run dev                                  # Start dev server

# Database
npx prisma studio                           # Visual DB editor
npx prisma migrate dev --name [name]        # Create migration
npx prisma generate                         # Regenerate Prisma client
npx prisma db push                          # Push schema changes (dev only)

# Code Quality
npm run lint                                # ESLint
npm run lint:fix                           # Auto-fix lint issues
npx tsc --noEmit                           # Type check
npm run format                              # Prettier

# Testing
npm run test                                # Unit tests
npm run test:watch                          # Watch mode
npx playwright test                         # E2E tests
npx playwright test --ui                    # Interactive E2E

# Build
npm run build                               # Production build
npm start                                   # Start production server
```

---

## 🐛 Common Issues & Solutions

### **1. Missing companyId Error**

**Problem**: Query fails with "companyId is required"

**Solution**: Always include companyId in database queries:
```typescript
where: { companyId: context.companyId }
```

### **2. Permission Denied (403)**

**Problem**: API returns 403 Forbidden

**Solutions**:
- Verify user has required permission in database
- Check `withPermissions()` wrapper is correct
- Verify role assignment in UserCompany table
- Use admin dashboard to grant permissions

### **3. TypeScript Errors After Schema Change**

**Problem**: Types are out of sync after Prisma changes

**Solution**:
```bash
npx prisma generate
# Restart TypeScript server in your IDE
```

### **4. Auth Not Working**

**Problem**: Getting 401 or unexpected redirects

**Solutions**:
- Verify `.env.local` has correct Clerk keys
- Ensure `await auth()` is properly awaited (Clerk 6.x requirement)
- Clear `.clerk` cache: `rm -rf .clerk && npm run dev`
- Check Clerk webhook is receiving events

### **5. Stripe Webhook Failing**

**Problem**: Subscriptions not updating

**Solutions**:
- Verify webhook signature validation
- Check webhook endpoint is accessible (use Stripe CLI for local testing)
- Review webhook logs in Stripe dashboard
- Ensure webhook secret matches `.env.local`

---

## 📚 Additional Resources

### **Complete Guide Collection**

All guides are in the `GUIDES/` directory:

1. `01_SETUP_GUIDE.md` - Complete setup (30-45 min)
2. `02_TEST_SETUP_GUIDE.md` - Test configuration
3. `03_FAQ.md` - Common questions and troubleshooting
4. `04_RBAC_USAGE.md` - Deep dive into permissions
5. `05_SAFE_CUSTOMIZATION_GUIDE.md` - What to modify safely
6. `06_CUSTOMIZING_PERMISSIONS.md` - Extending RBAC
7. `07_STRIPE_CUSTOMIZATION.md` - Billing features
8. `08_EXTENDING_TEAM_MANAGEMENT.md` - Team functionality
9. `09_TEST_SUITE_DOCUMENTATION.md` - Test coverage
10. `10_MANUAL_TESTING_GUIDE.md` - Manual testing
11. `11_OPTIONAL_INTEGRATIONS.md` - Email, monitoring, etc.

### **For AI-Assisted Development**

See `docs/guidesForVibers/` for AI-specific guides and prompt templates.

### **Development Rules**

See `DEVELOPMENT_RULES/` for architectural rules and IDE setup guides.

---

## 💡 Design Philosophy

SaaStastic is built on these principles:

1. **Security First**: Multi-tenant isolation and RBAC are non-negotiable
2. **Type Safety**: TypeScript strict mode, zero `any` types
3. **Developer Experience**: Clear patterns, comprehensive docs
4. **Production Ready**: Not a demo - ready for real customers
5. **Extensible**: Easy to customize without breaking core
6. **Maintainable**: Clear separation of concerns, testable code

---

## 🎓 Learning Path

**Week 1: Understanding the Foundation**
- Complete setup (`01_SETUP_GUIDE.md`)
- Run tests (`02_TEST_SETUP_GUIDE.md`)
- Read this guide thoroughly
- Explore the codebase

**Week 2: Building Your First Feature**
- Read `05_SAFE_CUSTOMIZATION_GUIDE.md`
- Build a simple CRUD feature in safe zones
- Write tests for your feature
- Deploy to staging

**Week 3: Advanced Customization**
- Add custom permissions (`06_CUSTOMIZING_PERMISSIONS.md`)
- Customize billing (`07_STRIPE_CUSTOMIZATION.md`)
- Extend team management (`08_EXTENDING_TEAM_MANAGEMENT.md`)
- Implement your unique business logic

**Week 4: Production Readiness**
- Complete test coverage
- Performance optimization
- Security audit
- Deploy to production

---

## 🤝 Getting Help

**Having issues?**
1. Check `03_FAQ.md` for common problems
2. Review the relevant guide for your task
3. Verify environment variables
4. Check database connection
5. Ensure dev server is running

**Still stuck?**
- Review error messages carefully
- Check browser console and network tab
- Review database records
- Verify permissions are correctly assigned

---

**That's the foundation of SaaStastic!** This architecture provides a solid base for building your B2B SaaS. Focus on your unique value proposition while SaaStastic handles the common infrastructure.

**Last Updated**: October 14, 2025  
**Maintained by**: SaaStastic Team  

*Happy Building! 🚀*
