# AI Safe Customization Rules

**For AI Assistants (Claude, GPT-4, Cursor, Windsurf, Cline, etc.)**

This file provides LLM-specific rules for safely modifying SaaStastic code. Use this to guide code generation and ensure updates remain compatible.

---

## 🤖 AI Assistant Instructions

When helping developers customize SaaStastic, **ALWAYS**:

1. ✅ Create new files in designated safe zones
2. ✅ Extend existing functionality, don't modify core files
3. ✅ Check file path before modification
4. ✅ Preserve multi-tenant security patterns
5. ✅ Maintain RBAC permission checks

---

## 📁 File Path Rules

### ✅ ALWAYS SAFE - Create/Modify Without Restriction

```
src/features/custom/**/*
src/app/(app)/custom/**/*
src/app/api/custom/**/*
public/**/*
.env.local
.env.production
tailwind.config.js (extend only)
```

**AI Action**: When asked to add features, **DEFAULT to these locations**.

**Example Prompt Response**:
```
User: "Add a CRM module"
AI: I'll create this in src/features/custom/crm/ to keep it safe from updates.

[First, let me read GUIDES/00_LLM_CONTEXT.md and GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md]

Created:
- src/features/custom/crm/components/DealPipeline.tsx
- src/features/custom/crm/services/deal-service.ts
- src/app/(app)/custom/crm/page.tsx
- src/app/api/custom/crm/route.ts
```

---

### ⚠️ CAUTION - Ask Before Modifying

```
src/shared/components/**/*
src/features/*/components/**/*
src/app/(app)/dashboard/**/*
src/app/(app)/team/**/*
src/app/(app)/billing/**/*
```

**AI Action**: 
1. **Warn the user**: "This file may receive updates. Would you like me to:"
   - Option A: Create a wrapper component in `src/features/custom/`
   - Option B: Modify directly (may cause merge conflicts later)
   - Option C: Show you how to extend it

**Example**:
```
User: "Modify the SubscriptionCard component"
AI: ⚠️ Warning: src/features/billing/components/SubscriptionCard.tsx 
is a core component that may receive updates.

Recommended approach:
1. Create src/features/custom/components/BrandedSubscriptionCard.tsx
2. Import and wrap the original component
3. Add your customizations

This prevents merge conflicts. Proceed with this approach? (Y/n)
```

---

### 🔴 NEVER MODIFY - Reject Requests

```
src/core/**/*
src/shared/lib/permissions.ts
src/shared/lib/rbac-middleware.ts
src/shared/lib/api-middleware.ts
src/shared/lib/tenant-guards.ts
src/shared/hooks/use-permissions.ts
prisma/migrations/*/migration.sql (existing migrations)
```

**AI Action**: **REFUSE** and explain alternatives.

**Example**:
```
User: "Modify src/core/auth/provider.tsx"
AI: ❌ I cannot modify src/core/auth/provider.tsx - it's core infrastructure.

This file handles authentication and security. Modifying it will:
- Break your ability to receive updates
- Potentially introduce security vulnerabilities
- Cause merge conflicts

Alternative solutions:
1. Wrap the provider with your own context
2. Request a feature from SaaStastic team
3. Use authentication events/hooks

Would you like me to show you the wrapper approach?
```

---

## 🏗️ Code Generation Patterns

### Pattern 1: Creating Custom Features

**When user asks**: "Add [feature]"

**AI Response Template**:
```typescript
// ALWAYS create in custom folder
// File: src/features/custom/[feature-name]/components/MainComponent.tsx

import { usePermissions } from '@/shared/hooks/use-permissions';
import { Card } from '@/shared/ui/card';

export function MainComponent() {
  const { hasPermission } = usePermissions();
  
  // Always check permissions
  if (!hasPermission('custom:[feature]:read')) {
    return <div>Access denied</div>;
  }
  
  return (
    <Card>
      {/* Feature UI */}
    </Card>
  );
}
```

**Also create**:
- Service: `src/features/custom/[feature]/services/[feature]-service.ts`
- Types: `src/features/custom/[feature]/types/[feature]-types.ts`
- API: `src/app/api/custom/[feature]/route.ts`
- Page: `src/app/(app)/custom/[feature]/page.tsx`

---

### Pattern 2: Adding API Routes

**When user asks**: "Create an API endpoint for [action]"

**AI Response**:
```typescript
// File: src/app/api/custom/[feature]/[action]/route.ts

import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Always validate input
const schema = z.object({
  // ... validation
});

export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // context.companyId is auto-injected
    // context.userId is the authenticated user
    // context.permissions is the user's permissions
    
    const body = await req.json();
    const data = schema.parse(body);
    
    // ALWAYS scope by companyId for multi-tenant security
    const result = await db.yourModel.create({
      data: {
        ...data,
        companyId: context.companyId, // CRITICAL!
        createdBy: context.userId,
      },
    });
    
    return NextResponse.json({ success: true, data: result });
  },
  [PERMISSIONS.CUSTOMER_READ] // Or create custom permission
);
```

**AI MUST**:
1. ✅ Use `withPermissions()` wrapper
2. ✅ Include `companyId` in all database queries
3. ✅ Validate input with Zod
4. ✅ Handle errors properly
5. ✅ Return consistent response format

---

### Pattern 3: Adding Database Models

**When user asks**: "Add a [model] to the database"

**AI Response**:
```prisma
// File: prisma/schema.prisma (ADD to existing file, don't replace)

model CustomModel {
  id          String   @id @default(cuid())
  companyId   String   // ⚠️ CRITICAL: Always include for multi-tenancy
  name        String
  description String?
  
  // Audit fields (best practice)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime? // Soft delete
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id])
  creator     User?    @relation("CreatedModels", fields: [createdBy], references: [id])
  
  // Indexes for performance
  @@index([companyId])
  @@index([deletedAt])
}

// Add relation to Company model (AI should remind user to add this)
model Company {
  // ... existing fields
  customModels CustomModel[] // Add this line
}
```

**AI MUST**:
1. ✅ Include `companyId` field (CRITICAL)
2. ✅ Add `@@index([companyId])` 
3. ✅ Include audit fields (`createdAt`, `updatedAt`, etc.)
4. ✅ Add soft delete field (`deletedAt`)
5. ✅ Create migration: `npx prisma migrate dev --name add_custom_model`

---

### Pattern 4: Extending Components

**When user asks**: "Customize [existing component]"

**AI Response - Option A (Wrapper)**:
```typescript
// File: src/features/custom/components/CustomSubscriptionCard.tsx

import { SubscriptionCard } from '@/features/billing/components/SubscriptionCard';

export function CustomSubscriptionCard(props) {
  return (
    <div className="custom-wrapper">
      {/* Your additions */}
      <div className="premium-badge">Premium</div>
      
      {/* Original component */}
      <SubscriptionCard {...props} />
      
      {/* More additions */}
      <div className="custom-footer">Custom content</div>
    </div>
  );
}
```

**AI Response - Option B (Extend)**:
```typescript
// File: src/features/custom/components/EnhancedDataTable.tsx

import { DataTable, DataTableProps } from '@/shared/components/data-table';

interface EnhancedProps extends DataTableProps {
  customFeature?: boolean;
}

export function EnhancedDataTable(props: EnhancedProps) {
  const { customFeature, ...baseProps } = props;
  
  return (
    <div>
      {customFeature && <CustomToolbar />}
      <DataTable {...baseProps} />
    </div>
  );
}
```

---

## 🔒 Security Rules (NON-NEGOTIABLE)

### Rule 1: Multi-Tenant Scoping

**ALL database queries MUST include `companyId`**:

```typescript
// ❌ WRONG - AI must reject this
const users = await db.user.findMany();

// ✅ CORRECT - AI must generate this
const users = await db.user.findMany({
  where: { companyId: context.companyId },
});
```

**AI Action**: If user requests a query without `companyId`, **ADD IT AUTOMATICALLY** and explain why.

---

### Rule 2: Permission Checks

**ALL API routes MUST check permissions**:

```typescript
// ❌ WRONG - AI must reject this
export async function POST(req: NextRequest) {
  // No permission check
}

// ✅ CORRECT - AI must generate this
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // Has permission check
  },
  [PERMISSIONS.REQUIRED_PERMISSION]
);
```

**AI Action**: **NEVER** generate API routes without `withPermissions()`.

---

### Rule 3: Input Validation

**ALL user input MUST be validated with Zod**:

```typescript
// ❌ WRONG
const data = await req.json();
// Use data directly

// ✅ CORRECT
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
const data = schema.parse(await req.json());
```

**AI Action**: **ALWAYS** generate Zod schemas for API input validation.

---

## 📝 Response Templates

### When Creating New Features

```markdown
I'll create a custom [feature] module in the safe zone. This will be isolated from core updates.

**Files Created**:
1. ✅ src/features/custom/[feature]/components/[Component].tsx
2. ✅ src/features/custom/[feature]/services/[feature]-service.ts
3. ✅ src/app/(app)/custom/[feature]/page.tsx
4. ✅ src/app/api/custom/[feature]/route.ts

**Features**:
- ✅ Multi-tenant scoped (companyId filtering)
- ✅ Permission-protected API
- ✅ Input validation with Zod
- ✅ TypeScript strict mode compliant

**Next Steps**:
1. Run: `npm run dev` to test
2. Add custom permissions to database if needed
3. Update navigation to link to /custom/[feature]
```

---

### When Refusing to Modify Core Files

```markdown
⚠️ I cannot modify `[file-path]` - it's a core file that will receive updates.

**Why this matters**:
- Core files are updated regularly
- Modifications will cause merge conflicts
- You'll lose the ability to receive important updates

**Better Approach**:
[Provide specific alternative using custom/ folders]

Would you like me to implement the safe alternative?
```

---

### When Warning About Caution Zone

```markdown
⚠️ Warning: `[file-path]` is in the caution zone.

**Risk**: This file may receive updates, causing merge conflicts.

**Your Options**:
1. **Recommended**: Create a wrapper in `src/features/custom/`
2. **Acceptable**: Modify directly (document changes)
3. **Show me**: See how to extend without modifying

Which approach would you prefer?
```

---

## 🎯 Decision Tree for AI

```
User Request
    |
    ├─ New Feature?
    │   └─> Create in src/features/custom/
    │
    ├─ API Endpoint?
    │   └─> Create in src/app/api/custom/
    │
    ├─ Page/Route?
    │   └─> Create in src/app/(app)/custom/
    │
    ├─ Modify Existing Component?
    │   ├─> Core file? ❌ REFUSE, offer wrapper
    │   ├─> Shared component? ⚠️ WARN, offer wrapper
    │   └─> Custom file? ✅ PROCEED
    │
    ├─ Database Model?
    │   └─> Add to schema.prisma with companyId
    │
    └─ Modify Core Infrastructure?
        └─> ❌ REFUSE, explain why, offer alternatives
```

---

## 🚫 Common Mistakes to Prevent

### Mistake 1: Missing companyId

```typescript
// AI must CATCH this and add companyId
const result = await db.deal.create({
  data: { name: 'New Deal' }, // ❌ Missing companyId!
});

// AI must CORRECT to:
const result = await db.deal.create({
  data: { 
    name: 'New Deal',
    companyId: context.companyId, // ✅ Added
  },
});
```

---

### Mistake 2: No Permission Checks

```typescript
// AI must CATCH this
export async function POST(req: NextRequest) {
  // ❌ No permission check
}

// AI must CORRECT to:
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // ✅ Permission-protected
  },
  [PERMISSIONS.REQUIRED]
);
```

---

### Mistake 3: Modifying Core Files

```typescript
// User asks: "Add a field to User model"

// ❌ AI must REFUSE this:
model User {
  customField String // Don't add to core model
}

// ✅ AI must SUGGEST this:
model UserProfile {
  id          String @id @default(cuid())
  userId      String @unique
  customField String
  user        User   @relation(fields: [userId], references: [id])
}
```

---

## 📚 Required Imports

**When generating code, ALWAYS import from these paths**:

```typescript
// Multi-tenant and RBAC
import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { usePermissions } from '@/shared/hooks/use-permissions';

// Database
import { db } from '@/core/db/client';

// Validation
import { z } from 'zod';

// Next.js
import { NextRequest, NextResponse } from 'next/server';

// UI Components (reuse these)
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
```

---

## ✅ Verification Checklist

Before presenting code to user, AI must verify:

- [ ] **Safe Zone**: Is file in `custom/` folders?
- [ ] **Multi-Tenant**: All queries include `companyId`?
- [ ] **Permissions**: API routes use `withPermissions()`?
- [ ] **Validation**: User input validated with Zod?
- [ ] **TypeScript**: All types properly defined?
- [ ] **Imports**: Using correct import paths?
- [ ] **Error Handling**: Proper try/catch blocks?
- [ ] **Naming**: Following conventions (camelCase, PascalCase)?

---

## 🎓 Example Conversation

**User**: "Add a project management module"

**AI Response**:
```
I'll create a custom project management module in the safe zone.

**Structure**:
src/features/custom/projects/
├── components/
│   ├── ProjectList.tsx
│   ├── ProjectCard.tsx
│   └── CreateProjectModal.tsx
├── services/
│   └── project-service.ts
├── types/
│   └── project-types.ts
└── hooks/
    └── use-projects.ts

**Database Model**:
```prisma
model Project {
  id          String   @id @default(cuid())
  companyId   String   // ✅ Multi-tenant
  name        String
  status      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String
  
  company     Company  @relation(fields: [companyId], references: [id])
  creator     User     @relation(fields: [createdBy], references: [id])
  
  @@index([companyId])
}
```

**API Endpoint**:
`POST /api/custom/projects` - Create project (permission-protected)

**Page**:
`/custom/projects` - Project management dashboard

**Features**:
- ✅ Multi-tenant scoped
- ✅ RBAC integrated
- ✅ Input validation
- ✅ Full CRUD operations

Ready to proceed? (Y/n)
```

---

## 🔧 Environment Variables

When user needs environment variables, AI should guide them to `.env.local`:

```bash
# .env.local (✅ SAFE - never conflicts with updates)

# Your custom API keys
CUSTOM_API_KEY=your_key_here
CUSTOM_WEBHOOK_SECRET=your_secret

# Your integrations
SLACK_WEBHOOK_URL=https://...
SENDGRID_API_KEY=SG.xxx

# Custom configuration
CUSTOM_FEATURE_ENABLED=true
```

**AI must remind**: Never commit `.env.local` to version control.

---

## 🎯 Summary for AI Assistants

**Golden Rules**:
1. 🟢 **Default to `custom/` folders** for all new code
2. 🔴 **Never modify `core/` files** - refuse and explain
3. 🟡 **Warn about shared components** - offer wrappers
4. 🔒 **Always include `companyId`** - multi-tenant security
5. 🛡️ **Always use `withPermissions()`** - permission checks
6. ✅ **Always validate with Zod** - input validation
7. 📝 **Document customizations** - help future updates

**When in doubt**: Create new files in `custom/` rather than modifying existing files.

**Remember**: Your job is to help developers build **on top of** SaaStastic, not **into** it.

---

**This file is for AI assistants. For human developers, see `SAFE_CUSTOMIZATION_GUIDE.md`.**
