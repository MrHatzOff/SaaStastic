# 🔄 SaaStastic AI Workflows

**Purpose**: Task-based workflows and decision trees for AI assistants implementing features in SaaStastic.

**Prerequisites**: Read `AI_SYSTEM_CONTEXT.md` first for foundational knowledge.

**Last Updated**: October 14, 2025  
**Version**: 1.0

---

## 📋 Session Start Checklist

**When starting any session**:

- [ ] **Step 1**: Read `AI_SYSTEM_CONTEXT.md`
- [ ] **Step 2**: Ask: "What are you trying to build?"
- [ ] **Step 3**: Based on answer, use relevant workflow below
- [ ] **Step 4**: Verify it's in SAFE zone
- [ ] **Step 5**: If core modification needed → REFUSE, offer alternative
- [ ] **Step 6**: Generate code with security patterns
- [ ] **Step 7**: Verify against checklist before presenting

---

## 🎯 Task-Based Workflow Matrix

### **Task: Adding a New Feature Module**

**Workflow**:

1. **Read Files**:
   - `GUIDES/00_ARCHITECTURE_GUIDE.md` (Architecture section)
   - `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` (Safe Zones)
   - `DEVELOPMENT_RULES/architecture.md`

2. **Create Structure**:
```
src/features/custom/[feature]/
├── components/
├── services/
├── types/
├── hooks/
└── lib/
```

3. **Verify**:
   - [ ] Created in `custom/` directory?
   - [ ] Follows naming conventions?
   - [ ] No modifications to `core/`?

**Example Response**:
```
Developer: "I want to add a CRM module"

AI: Let me read the relevant documentation...
[Read GUIDES/00_ARCHITECTURE_GUIDE.md]
[Read GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md]

I'll create a CRM module in the safe zone:

Structure:
- src/features/custom/crm/
- src/app/(app)/custom/crm/
- src/app/api/custom/crm/

This keeps your customization separate from core files.
Ready to proceed? (Y/n)
```

---

### **Task: Adding an API Endpoint**

**Workflow**:

1. **Read Files**:
   - `GUIDES/00_ARCHITECTURE_GUIDE.md` (API Patterns)
   - `DEVELOPMENT_RULES/architecture.md` (Multi-tenant rules)
   - Existing APIs in `src/app/api/` (patterns)

2. **Requirements Checklist**:
   - [ ] `withPermissions()` wrapper?
   - [ ] `companyId` in all queries?
   - [ ] Zod validation?
   - [ ] Error handling?
   - [ ] Proper TypeScript types?

3. **Template**:
```typescript
// src/app/api/custom/[feature]/route.ts

import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/core/db/client';

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const POST = withPermissions(
  async (req: NextRequest, context) => {
    try {
      const body = await req.json();
      const data = createSchema.parse(body);
      
      const result = await db.yourModel.create({
        data: {
          ...data,
          companyId: context.companyId,
          createdBy: context.userId,
        },
      });
      
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
  [PERMISSIONS.CUSTOMER_CREATE]
);
```

4. **Verification**:
   - [ ] Has `withPermissions()` wrapper?
   - [ ] Has Zod validation?
   - [ ] Scoped by `companyId`?
   - [ ] Error handling?
   - [ ] TypeScript types?
   - [ ] In `src/app/api/custom/` folder?

---

### **Task: Adding a Database Model**

**Workflow**:

1. **Read Files**:
   - `DEVELOPMENT_RULES/architecture.md` (Database rules)
   - `GUIDES/00_ARCHITECTURE_GUIDE.md` (Multi-Tenancy)
   - `prisma/schema.prisma` (Existing patterns)

2. **Requirements**:
   - [ ] `companyId` field (MANDATORY)
   - [ ] `@@index([companyId])` (Performance)
   - [ ] Audit fields (createdAt, updatedAt, createdBy, updatedBy)
   - [ ] Soft delete (deletedAt)
   - [ ] Relation to Company model

3. **Template**:
```prisma
model YourModel {
  id          String   @id @default(cuid())
  companyId   String
  
  // Your fields
  name        String
  description String?
  status      String   @default("active")
  
  // Audit trail
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime?
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Indexes
  @@index([companyId])
  @@index([deletedAt])
  @@index([status])
}
```

4. **Next Steps**:
```bash
npx prisma migrate dev --name add_your_model
npx prisma generate
```

5. **Verification**:
   - [ ] Has `companyId` field?
   - [ ] Has `@@index([companyId])`?
   - [ ] Has audit fields?
   - [ ] Has soft delete field?
   - [ ] Has relation to Company?
   - [ ] Named clearly?

---

### **Task: Creating a Page/Route**

**Workflow**:

1. **Read Files**:
   - `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` (Custom Pages)
   - `GUIDES/00_ARCHITECTURE_GUIDE.md` (Naming conventions)

2. **Location**: `src/app/(app)/custom/[feature]/page.tsx`

3. **Template**:
```typescript
// src/app/(app)/custom/[feature]/page.tsx

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MyComponent } from '@/features/custom/[feature]/components/MyComponent';

export default async function FeaturePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Feature</h1>
      <MyComponent />
    </div>
  );
}

export const metadata = {
  title: 'My Feature | SaaStastic',
  description: 'Feature description',
};
```

---

### **Task: Modifying Existing Component**

**Decision Tree**:

```
Is the file in src/core/?
├─ YES → ❌ REFUSE - Offer wrapper alternative
└─ NO → Continue...

Is the file in src/shared/components/?
├─ YES → ⚠️ WARN - Suggest wrapper instead
└─ NO → ✅ OK - Proceed with modification

Is it in src/features/[core-feature]/?
├─ YES → ⚠️ WARN - Consider if modification is necessary
└─ NO → ✅ OK - Safe to modify
```

**Wrapper Pattern**:
```typescript
// src/features/custom/components/CustomButton.tsx

import { Button } from '@/shared/ui/button';

export function CustomButton(props: ButtonProps) {
  return (
    <div className="custom-button-wrapper">
      <Button {...props} className={`${props.className} custom-styles`} />
    </div>
  );
}
```

---

### **Task: Adding Custom Permissions**

**Workflow**:

1. **Read Files**:
   - `GUIDES/00_ARCHITECTURE_GUIDE.md` (RBAC System)
   - `GUIDES/04_RBAC_USAGE.md` (Permission patterns)

2. **DO NOT MODIFY**: `src/shared/lib/permissions.ts`

3. **Create Custom File**:
```typescript
// src/features/custom/[feature]/lib/permissions.ts

export const CUSTOM_PERMISSIONS = {
  FEATURE_CREATE: 'custom:feature:create',
  FEATURE_READ: 'custom:feature:read',
  FEATURE_UPDATE: 'custom:feature:update',
  FEATURE_DELETE: 'custom:feature:delete',
} as const;
```

4. **Usage in API**:
```typescript
import { CUSTOM_PERMISSIONS } from '@/features/custom/[feature]/lib/permissions';

export const POST = withPermissions(
  async (req, context) => {
    // Implementation
  },
  [CUSTOM_PERMISSIONS.FEATURE_CREATE]
);
```

5. **Database Seeding**:
   - Insert permissions into `permissions` table
   - Assign to roles via `_RolePermissions` relation

---

## 🎨 Response Templates

### **Template 1: Clarifying Requirements**

```
Before I implement this, I need to understand a few things:

1. **Data Model**: What fields does [FEATURE] need?
2. **Permissions**: Who should be able to [ACTION]? (Owner/Admin/Member/Viewer)
3. **UI Requirements**: What should the interface look like?
4. **Validation**: What are the validation rules?
5. **Multi-Tenant**: Does this data need to be company-specific?

Please provide details so I can implement this correctly.
```

### **Template 2: Suggesting Safe Alternative**

```
I see you want to modify [FILE_PATH].

⚠️ This file is in the core infrastructure and shouldn't be modified.

Instead, I recommend:
1. Create a wrapper component in src/features/custom/
2. Use composition to extend functionality
3. Keep core files unchanged for updates

Would you like me to create a wrapper approach instead?
```

### **Template 3: Security Warning**

```
⚠️ SECURITY NOTICE:

I notice this implementation is missing:
- [ ] companyId scoping in database queries
- [ ] Permission check with withPermissions()
- [ ] Input validation with Zod

These are critical for multi-tenant security. Should I add them before proceeding?
```

### **Template 4: Implementation Complete**

```
✅ Implementation Complete

**Created Files**:
- src/features/custom/[feature]/components/[Component].tsx
- src/features/custom/[feature]/services/[service].ts
- src/app/api/custom/[feature]/route.ts
- src/app/(app)/custom/[feature]/page.tsx

**Security Verified**:
✅ Multi-tenant scoping with companyId
✅ Permission checks with RBAC
✅ Input validation with Zod
✅ Error handling implemented
✅ TypeScript strict mode compliant

**Next Steps**:
1. Run: npm run dev
2. Navigate to: /custom/[feature]
3. Test the functionality
4. Run tests: npm run test

Would you like me to create tests for this feature?
```

---

## 🐛 Debugging Workflows

### **Debug: Authentication Issue**

**Checklist**:
1. Is Clerk configured? Check `.env.local` for `CLERK_SECRET_KEY`
2. Is middleware running? Check `src/middleware.ts`
3. API using `await auth()` from `@clerk/nextjs/server`?
4. User exists in database? Check `User` table
5. UserCompany relation exists? Check `UserCompany` table
6. Company context passed? Check `company-provider.tsx`
7. Browser errors? Check Network tab for 401 responses

**Common Fixes**:
- Clear `.clerk` cache and restart: `rm -rf .clerk && npm run dev`
- Verify Clerk webhook is receiving events
- Ensure `await auth()` is properly awaited

---

### **Debug: Permission Denied**

**Checklist**:
1. Check required permission: Look at API route `withPermissions([X])`
2. Check user's permissions: Query database or call `/api/users/permissions`
3. Verify user role: Check `UserCompany.roleId`
4. Check role has permission: Query `RoleModel` permissions relation
5. Frontend: Use `usePermissions()` hook to see client permissions

**Database Query**:
```sql
SELECT u.email, r.name as role, p.key as permission
FROM "User" u
JOIN "UserCompany" uc ON u.id = uc."userId"
JOIN "roles" r ON uc."roleId" = r.id
JOIN "_RolePermissions" rp ON r.id = rp."A"
JOIN "permissions" p ON rp."B" = p.id
WHERE u.id = '[user-id]' AND uc."companyId" = '[company-id]';
```

**Solution**: Grant permission to role OR assign user a role with permission

---

### **Debug: TypeScript Errors**

**Steps**:
1. Run: `npx tsc --noEmit` (shows all errors)
2. Regenerate Prisma: `npx prisma generate`
3. Verify imports are correct
4. Check `tsconfig.json` paths
5. Restart TS server in IDE
6. Clear `.next`: `rm -rf .next && npm run dev`

**Common Issues**:
- Prisma out of sync: Run `npx prisma generate`
- Missing types: `npm install @types/[package]`
- Circular imports: Refactor import structure

---

## 📋 Code Generation Checklist

**Before presenting any code, verify**:

### **Security** ✅
- [ ] All queries include `companyId`?
- [ ] API routes use `withPermissions()`?
- [ ] Inputs validated with Zod?
- [ ] No SQL injection vulnerabilities?
- [ ] No sensitive data exposed?

### **Code Quality** ✅
- [ ] TypeScript strict mode compliant?
- [ ] No `any` types?
- [ ] Proper error handling?
- [ ] Consistent naming conventions?
- [ ] Comments for complex logic?

### **Performance** ✅
- [ ] Database indexes on `companyId`?
- [ ] No N+1 queries?
- [ ] Proper pagination for lists?
- [ ] Efficient queries?

### **Maintainability** ✅
- [ ] Code is DRY?
- [ ] Functions are single-purpose?
- [ ] Follows existing patterns?
- [ ] In safe customization zones?

### **Testing** ✅
- [ ] Unit tests needed?
- [ ] E2E tests needed?
- [ ] Edge cases considered?

---

## 🎯 Common Scenarios

### **Scenario 1: Building CRUD Feature**

**Steps**:
1. Read `AI_SYSTEM_CONTEXT.md`
2. Create database model with proper fields
3. Create API routes (GET, POST, PATCH, DELETE)
4. Create service layer for business logic
5. Create React components (List, Form, Card)
6. Create page route
7. Write tests

**Ask Developer**:
- What fields does the model need?
- What permissions are required?
- What validation rules?
- What UI components needed?

### **Scenario 2: Extending Stripe Integration**

**Steps**:
1. Read `GUIDES/07_STRIPE_CUSTOMIZATION.md`
2. Understand webhook flow
3. Update webhook handler if needed
4. Update database models
5. Test with Stripe CLI

**Ask Developer**:
- What Stripe event are you handling?
- What data needs to be stored?
- What happens on success/failure?

### **Scenario 3: Adding Third-Party Integration**

**Steps**:
1. Create service wrapper in `src/features/custom/integrations/[service]/`
2. Store API keys in `.env.local`
3. Create API client class
4. Handle errors and rate limits
5. Add webhook handler if needed
6. Create database model for sync state
7. Create settings UI

**Ask Developer**:
- What API are you integrating?
- What data flows back and forth?
- Are there webhooks?
- What configuration is needed?

---

## 💡 Best Practices

### **1. Always Start with Context**
Read `AI_SYSTEM_CONTEXT.md` at the start of every session.

### **2. Ask Questions First**
Don't assume requirements. Clarify before coding.

### **3. Use Existing Patterns**
Reference existing code in `src/app/api/` and `src/features/` for patterns.

### **4. Security First**
Always include multi-tenant scoping and RBAC.

### **5. Incremental Implementation**
For large features: "Let's build this in phases. Start with database model."

### **6. Test as You Go**
Suggest tests after implementing significant features.

---

## 📚 Quick Reference

### **When to Read Which File**

| Task | Read This |
|------|-----------|
| New feature | `GUIDES/00_ARCHITECTURE_GUIDE.md` |
| API endpoint | `AI_SYSTEM_CONTEXT.md` (API section) |
| Database model | `DEVELOPMENT_RULES/architecture.md` |
| Permissions | `GUIDES/04_RBAC_USAGE.md` |
| Customization | `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` |
| Billing | `GUIDES/07_STRIPE_CUSTOMIZATION.md` |

### **Common Commands**

```bash
# Development
npm run dev

# Database
npx prisma studio
npx prisma migrate dev --name [name]
npx prisma generate

# Testing
npm run test
npx playwright test

# Quality
npm run lint
npx tsc --noEmit
```

---

## 🎓 Learning from Mistakes

### **Mistake 1: Forgetting companyId**
**Symptom**: Data from all companies returned
**Fix**: Always add `where: { companyId: context.companyId }`
**Prevention**: Use checklist before generating code

### **Mistake 2: Modifying Core Files**
**Symptom**: User can't update SaaStastic
**Fix**: Create wrapper in `custom/` instead
**Prevention**: Check file path before modifying

### **Mistake 3: No Permission Check**
**Symptom**: Anyone can access the endpoint
**Fix**: Add `withPermissions()` wrapper
**Prevention**: Use API route template

### **Mistake 4: No Validation**
**Symptom**: Invalid data gets into database
**Fix**: Add Zod schema validation
**Prevention**: Always validate user input

---

**This workflow guide provides task-specific procedures. For foundational knowledge, see AI_SYSTEM_CONTEXT.md.**

**Last Updated**: October 14, 2025
