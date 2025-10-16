# 🤖 SaaStastic AI System Context

**Purpose**: Essential context for AI coding assistants working on SaaStastic projects. Read this at the start of every session.

**Last Updated**: October 14, 2025  
**Version**: 1.0

---

## 🎯 Quick Facts

**What is SaaStastic?**
Production-ready, multi-tenant B2B SaaS boilerplate with authentication, billing, RBAC, and team management.

**Tech Stack**:
- Next.js 15 (App Router), React 19, TypeScript 5
- PostgreSQL + Prisma ORM 6
- Clerk (auth), Stripe (billing)
- TailwindCSS 4 + shadcn/ui

**Non-Negotiable Security Rules**:
1. ✅ ALL database queries MUST include `companyId`
2. ✅ ALL API routes MUST use `withPermissions()` wrapper
3. ✅ ALL inputs MUST be validated with Zod schemas
4. ❌ NEVER modify `src/core/**/*` files
5. ✅ Create new features in `src/features/custom/`

---

## 🏗️ Architecture Overview

### **Directory Structure**

```
src/
├── app/
│   ├── (marketing)/           # Public pages
│   ├── (app)/                 # Authenticated app
│   │   └── custom/            # ✅ Custom pages here
│   └── api/
│       └── custom/            # ✅ Custom APIs here
├── core/                      # 🔒 NEVER MODIFY
├── features/
│   └── custom/                # ✅ Custom features here
└── shared/                    # Reusable components/utils
```

### **Safe Zones**

✅ **SAFE - Modify freely**:
- `src/features/custom/**/*`
- `src/app/(app)/custom/**/*`
- `src/app/api/custom/**/*`
- `tailwind.config.js`

🔒 **NEVER MODIFY**:
- `src/core/**/*`
- `src/shared/lib/permissions.ts`
- `src/shared/lib/rbac-middleware.ts`

---

## 🔒 Multi-Tenant Security

**Critical Pattern**: Every tenant-scoped query MUST include `companyId`:

```typescript
// ❌ WRONG - Security vulnerability
const customers = await db.customer.findMany();

// ✅ CORRECT - Tenant isolated
const customers = await db.customer.findMany({
  where: { companyId: context.companyId }
});
```

### **Database Model Pattern**

```prisma
model YourModel {
  id          String   @id @default(cuid())
  companyId   String   // 🔒 REQUIRED
  
  // Your fields
  name        String
  
  // Audit trail
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime? // Soft delete
  
  // Relations & Indexes
  company     Company  @relation(fields: [companyId], references: [id])
  @@index([companyId])
  @@index([deletedAt])
}
```

---

## 🛡️ RBAC System

**29 built-in permissions** across 7 categories.

**4 System Roles**:
- Owner (29 permissions) - Full access
- Admin (25 permissions) - Manage team/billing
- Member (7 permissions) - Basic access
- Viewer (5 permissions) - Read-only

### **API Route Pattern**

```typescript
import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/core/db/client';

const schema = z.object({
  name: z.string().min(1),
});

export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // context.companyId - Auto-injected
    // context.userId - Authenticated user
    // context.permissions - User's permissions
    
    try {
      const body = await req.json();
      const data = schema.parse(body);
      
      const result = await db.yourModel.create({
        data: {
          ...data,
          companyId: context.companyId, // 🔒
          createdBy: context.userId,
        },
      });
      
      return NextResponse.json({ success: true, data: result });
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
  [PERMISSIONS.CUSTOMER_CREATE]
);
```

### **Frontend Permission Pattern**

```typescript
import { PermissionGuard } from '@/shared/components/permission-guard';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { PERMISSIONS } from '@/shared/lib/permissions';

export function MyComponent() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {hasPermission(PERMISSIONS.CUSTOMER_CREATE) && (
        <Button>Create</Button>
      )}
      
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
      await onSave?.();
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  // 3. Render with states
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

### **Data Fetching**

```typescript
import { useQuery } from '@tanstack/react-query';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });
}
```

### **Page Structure**

```typescript
// src/app/(app)/custom/feature/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function FeaturePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  
  return (
    <div className="container mx-auto p-6">
      <h1>My Feature</h1>
    </div>
  );
}

export const metadata = {
  title: 'My Feature | SaaStastic',
  description: 'Description',
};
```

---

## 💳 Stripe Integration

**Key Models**: Subscription, Invoice, PaymentMethod

**Webhook Handler**: `src/app/api/webhooks/stripe/route.ts`

**Events Handled**:
- `customer.subscription.created/updated/deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `payment_method.attached`

**Usage-Based Billing Example**:
```typescript
await db.usageRecord.create({
  data: {
    companyId,
    metric: 'api_calls',
    quantity: 1,
  },
});
```

---

## 🧪 Testing

**Test Suite**: 87 tests (60 unit + 27 E2E)

```bash
npm run test              # Unit tests
npx playwright test       # E2E tests
npx tsc --noEmit         # Type check
```

**Unit Test Pattern**:
```typescript
import { describe, it, expect } from 'vitest';

describe('MyService', () => {
  it('should work correctly', () => {
    const result = myService.doSomething();
    expect(result).toBe('expected');
  });
});
```

---

## 🔧 Development Commands

```bash
# Dev
npm run dev                              # Start server
npx prisma studio                        # DB GUI

# Database
npx prisma migrate dev --name [name]     # Migration
npx prisma generate                      # Regenerate types

# Quality
npm run lint                             # ESLint
npx tsc --noEmit                        # Type check
```

---

## 🚨 Common Issues

### **1. Missing companyId**
**Error**: Query returns all tenants' data
**Fix**: Add `where: { companyId: context.companyId }`

### **2. Permission Denied (403)**
**Error**: API returns 403
**Fix**: Check user has permission in database, verify `withPermissions()` is correct

### **3. TypeScript Errors After Schema Change**
**Error**: Types out of sync
**Fix**: Run `npx prisma generate`

### **4. Auth Issues**
**Error**: 401 or unexpected redirects
**Fix**: Verify `.env.local` Clerk keys, ensure `await auth()` is awaited

---

## ✅ Pre-Code Checklist

Before generating code, verify:

- [ ] Safe Zone? Creating in `src/features/custom/`?
- [ ] Multi-Tenant? All queries include `companyId`?
- [ ] Permissions? API uses `withPermissions()`?
- [ ] Validation? Zod schema for inputs?
- [ ] Types? All TypeScript types defined?
- [ ] Errors? Proper error handling?
- [ ] Audit? Include createdBy, updatedBy?
- [ ] Indexes? Database indexes on companyId?

---

## 📚 Reference Files

**For detailed workflows**: See `AI_WORKFLOWS.md`

**For human-readable architecture**: See `GUIDES/00_ARCHITECTURE_GUIDE.md`

**For prompt templates**: See `VibeCodingTips.md`

**For development rules**: See `DEVELOPMENT_RULES/architecture.md`

---

**This context provides the foundation. For task-specific workflows, refer to AI_WORKFLOWS.md.**

**Last Updated**: October 14, 2025
