# LLM Onboarding Context for SaaStastic

**For AI Coding Assistants (Cursor, Windsurf, Cline, GitHub Copilot, etc.)**

This file provides complete context for AI assistants helping developers customize SaaStastic. Follow these instructions exactly to provide safe, correct, and maintainable code.

---

## 🚨 MANDATORY READING - READ THESE FIRST

**Before doing ANYTHING, you MUST read these files:**

### **1. Core System Context** (ALWAYS READ FIRST)
```
📄 GUIDES/00_LLM_CONTEXT.md
```
- **Why**: Complete project overview, tech stack, architecture
- **When**: Start of EVERY session
- **Read**: Entire file (Product status, architecture, multi-tenancy, RBAC)

### **2. Safe Customization Guide** (READ BEFORE ANY CODE CHANGES)
```
📄 GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md
```
- **Why**: Learn what's safe to modify vs. what will break updates
- **When**: Before creating or modifying ANY file
- **Read**: Entire file (it's organized by safety zones)

### **3. Architecture Rules** (MEMORIZE THESE)
```
📄 .windsurf/rules/architecture.md
```
- **Why**: Non-negotiable security and architecture requirements
- **When**: Before ANY database query, API route, or component
- **Must Follow**: 100% - these are security-critical

---

## 📋 Quick Start Checklist

**When you start helping a developer:**

- [ ] **Step 1**: Read `GUIDES/00_LLM_CONTEXT.md` (complete file)
- [ ] **Step 2**: Ask developer: "What are you trying to build?"
- [ ] **Step 3**: Based on their answer, read relevant guide (see Task Matrix below)
- [ ] **Step 4**: Check if it's in a SAFE zone (GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md)
- [ ] **Step 5**: If core file modification needed → **REFUSE** and offer safe alternative
- [ ] **Step 6**: Generate code with ALL security patterns (multi-tenant, RBAC, validation)
- [ ] **Step 7**: Verify code against checklist before presenting

---

## 🎯 Task-Based File Matrix

**Use this to know which files to read for each type of task:**

### **Task: Adding a New Feature**

**READ THESE FILES:**
1. `GUIDES/00_LLM_CONTEXT.md` (Architecture section)
2. `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` (Safe Zones section)
3. `.windsurf/rules/architecture.md` (Non-negotiable rules)

**CREATE FILES IN:**
```
src/features/custom/[feature-name]/
├── components/
├── services/
├── types/
└── hooks/
```

**EXAMPLE CONVERSATION:**
```
Developer: "I want to add a CRM module"

AI Response:
Let me read the relevant documentation first...
[Read GUIDES/00_LLM_CONTEXT.md]
[Read GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md]

I'll create a CRM module in the safe zone:

Structure:
- src/features/custom/crm/
- src/app/(app)/custom/crm/
- src/app/api/custom/crm/

This keeps your customization separate from core files 
and safe from update conflicts.

Ready to proceed? (Y/n)
```

---

### **Task: Adding an API Endpoint**

**READ THESE FILES:**
1. `GUIDES/00_LLM_CONTEXT.md` (API Patterns section)
2. `.windsurf/rules/architecture.md` (Multi-tenant rules)
3. Existing API routes in `src/app/api/` (for patterns)

**MUST INCLUDE:**
- ✅ `withPermissions()` wrapper
- ✅ `companyId` in all queries
- ✅ Zod validation
- ✅ Error handling
- ✅ Proper TypeScript types

**TEMPLATE TO USE:**
```typescript
// src/app/api/custom/[feature]/[action]/route.ts

import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/core/db/client';

// STEP 1: Define validation schema
const schema = z.object({
  name: z.string().min(1),
  // ... other fields
});

// STEP 2: Create permission-protected endpoint
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    try {
      // STEP 3: Validate input
      const body = await req.json();
      const data = schema.parse(body);
      
      // STEP 4: Database query WITH companyId (CRITICAL!)
      const result = await db.yourModel.create({
        data: {
          ...data,
          companyId: context.companyId, // ALWAYS INCLUDE
          createdBy: context.userId,
        },
      });
      
      // STEP 5: Return success
      return NextResponse.json({ 
        success: true, 
        data: result 
      });
      
    } catch (error) {
      // STEP 6: Error handling
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
  [PERMISSIONS.CUSTOMER_READ] // STEP 7: Specify required permissions
);
```

**VERIFICATION CHECKLIST:**
- [ ] Uses `withPermissions()` wrapper?
- [ ] Includes `companyId` in database query?
- [ ] Validates input with Zod?
- [ ] Has error handling?
- [ ] Has TypeScript types?
- [ ] In `src/app/api/custom/` folder?

---

### **Task: Adding a Database Model**

**READ THESE FILES:**
1. `.windsurf/rules/architecture.md` (Database rules)
2. `GUIDES/00_LLM_CONTEXT.md` (Multi-Tenancy section)
3. `prisma/schema.prisma` (See existing patterns)

**MUST INCLUDE:**
- ✅ `companyId` field (MANDATORY for multi-tenancy)
- ✅ `@@index([companyId])` (For performance)
- ✅ Audit fields (createdAt, updatedAt, createdBy)
- ✅ Soft delete (deletedAt field)
- ✅ Relation to Company model

**TEMPLATE TO USE:**
```prisma
// Add to prisma/schema.prisma

model YourCustomModel {
  id          String   @id @default(cuid())
  companyId   String   // ⚠️ CRITICAL: Always required!
  
  // Your fields
  name        String
  description String?
  status      String   @default("active")
  
  // Audit fields (best practice)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime? // Soft delete
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  creator     User?    @relation("CustomModelCreator", fields: [createdBy], references: [id])
  
  // Indexes (IMPORTANT for performance)
  @@index([companyId])
  @@index([deletedAt])
  @@index([createdAt])
}

// Also add to Company model:
model Company {
  // ... existing fields
  yourCustomModels YourCustomModel[] // Add this line
}
```

**AFTER CREATING MODEL:**
```bash
# Tell developer to run:
npx prisma migrate dev --name add_your_custom_model
npx prisma generate
```

**VERIFICATION CHECKLIST:**
- [ ] Has `companyId` field?
- [ ] Has `@@index([companyId])`?
- [ ] Has audit fields?
- [ ] Has soft delete field?
- [ ] Added relation to Company model?
- [ ] Named clearly and descriptively?

---

### **Task: Creating a Page/Route**

**READ THESE FILES:**
1. `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` (Custom Pages section)
2. `GUIDES/00_LLM_CONTEXT.md` (Naming conventions section)

**CREATE IN:**
```
src/app/(app)/custom/[feature-name]/page.tsx
```

**TEMPLATE TO USE:**
```typescript
// src/app/(app)/custom/[feature-name]/page.tsx

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { YourComponent } from '@/features/custom/[feature]/components/YourComponent';

export default async function CustomFeaturePage() {
  // STEP 1: Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  
  // STEP 2: Render your component
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Feature</h1>
      <YourComponent />
    </div>
  );
}

// STEP 3: Add metadata
export const metadata = {
  title: 'Your Feature | SaaStastic',
  description: 'Description of your feature',
};
```

---

### **Task: Modifying Existing Component**

**⚠️ STOP! READ THIS FIRST:**

**READ THESE FILES:**
1. `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` (Caution Zones section)

**DECISION TREE:**

```
Is the file in src/core/?
├─ YES → ❌ REFUSE - Offer wrapper alternative
└─ NO → Continue...

Is the file in src/shared/components/?
├─ YES → ⚠️ WARN - Suggest wrapper
└─ NO → Continue...

Is the file in src/features/custom/?
├─ YES → ✅ SAFE - Proceed
└─ NO → ⚠️ WARN - Suggest wrapper
```

**ALWAYS OFFER WRAPPER APPROACH:**
```typescript
// INSTEAD OF: Modifying src/shared/components/data-table.tsx
// DO THIS: Create wrapper

// src/features/custom/components/MyCustomDataTable.tsx
import { DataTable } from '@/shared/components/data-table';

export function MyCustomDataTable(props) {
  return (
    <div className="my-custom-wrapper">
      {/* Your additions */}
      <DataTable {...props} />
      {/* More additions */}
    </div>
  );
}
```

---

### **Task: Adding Custom Permissions**

**READ THESE FILES:**
1. `GUIDES/00_LLM_CONTEXT.md` (RBAC System section)
2. `GUIDES/04_RBAC_USAGE.md` (Permission patterns)

**DO NOT MODIFY:**
- ❌ `src/shared/lib/permissions.ts` (Core permissions)

**INSTEAD CREATE:**
```typescript
// src/features/custom/lib/custom-permissions.ts

export const CUSTOM_PERMISSIONS = {
  // Your feature permissions
  YOUR_FEATURE_CREATE: 'your-feature:create',
  YOUR_FEATURE_READ: 'your-feature:read',
  YOUR_FEATURE_UPDATE: 'your-feature:update',
  YOUR_FEATURE_DELETE: 'your-feature:delete',
} as const;

export type CustomPermission = typeof CUSTOM_PERMISSIONS[keyof typeof CUSTOM_PERMISSIONS];
```

**THEN ADD TO DATABASE:**
```typescript
// Tell developer to run this script or add manually

// Option 1: Manual (for now)
// Go to database and insert:
INSERT INTO "Permission" (id, name, description, category)
VALUES 
  (gen_random_uuid(), 'your-feature:create', 'Create your feature', 'Custom'),
  (gen_random_uuid(), 'your-feature:read', 'View your feature', 'Custom'),
  (gen_random_uuid(), 'your-feature:update', 'Update your feature', 'Custom'),
  (gen_random_uuid(), 'your-feature:delete', 'Delete your feature', 'Custom');

// Option 2: Script (better)
// Create: scripts/seed-custom-permissions.ts
```

**USE IN API ROUTES:**
```typescript
import { withPermissions } from '@/shared/lib';
import { CUSTOM_PERMISSIONS } from '@/features/custom/lib/custom-permissions';

export const POST = withPermissions(
  async (req, context) => {
    // Your logic
  },
  [CUSTOM_PERMISSIONS.YOUR_FEATURE_CREATE]
);
```

---

### **Task: Styling/Design Changes**

**READ THESE FILES:**
1. `GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` (Design Tokens section)

**SAFE TO MODIFY:**
- ✅ `tailwind.config.js` (extend, don't replace)
- ✅ Any CSS in `src/features/custom/`
- ✅ Component-specific styles

**TEMPLATE:**
```javascript
// tailwind.config.js

module.exports = {
  // ... existing config
  theme: {
    extend: {
      // ADD your custom colors
      colors: {
        'brand-primary': '#your-color',
        'brand-secondary': '#your-color',
      },
      // ADD your custom fonts
      fontFamily: {
        'brand': ['Your Font', 'sans-serif'],
      },
    },
  },
};
```

---

## 🔒 SECURITY RULES (NEVER BREAK THESE)

### **Rule 1: Always Include companyId**

**WRONG:**
```typescript
const users = await db.user.findMany();
```

**RIGHT:**
```typescript
const users = await db.user.findMany({
  where: { companyId: context.companyId },
});
```

**AI ACTION**: If you see a query without `companyId`, **ADD IT AUTOMATICALLY**.

---

### **Rule 2: Always Use withPermissions()**

**WRONG:**
```typescript
export async function POST(req: NextRequest) {
  // No permission check
}
```

**RIGHT:**
```typescript
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // Has permission check
  },
  [PERMISSIONS.REQUIRED]
);
```

**AI ACTION**: If you see an API route without `withPermissions()`, **REFUSE** to generate code.

---

### **Rule 3: Always Validate Input**

**WRONG:**
```typescript
const data = await req.json();
// Use data directly
```

**RIGHT:**
```typescript
const schema = z.object({
  name: z.string().min(1),
});
const data = schema.parse(await req.json());
```

**AI ACTION**: **ALWAYS** generate Zod schemas for input validation.

---

### **Rule 4: Never Modify Core Files**

**Core files (NEVER MODIFY):**
```
src/core/**/*
src/shared/lib/permissions.ts
src/shared/lib/rbac-middleware.ts
src/shared/lib/api-middleware.ts
prisma/migrations/*/migration.sql (existing)
```

**AI ACTION**: If asked to modify these, **REFUSE** and offer wrapper/extension approach.

---

## 🤖 AI Response Templates

### **When Refusing Core Modification**

```markdown
❌ I cannot modify `[file-path]` - it's a core file.

**Why**: Core files receive updates. Modifying them will:
- Break your ability to get updates
- Cause merge conflicts
- Potentially introduce security issues

**Better Approach**:
[Provide specific wrapper or extension solution]

Would you like me to implement the safe alternative?
```

---

### **When Warning About Caution Zone**

```markdown
⚠️ Warning: `[file-path]` may receive updates.

**Options**:
1. **Recommended**: Create wrapper in `src/features/custom/`
2. **Acceptable**: Modify directly (document changes clearly)

Which approach would you prefer?
```

---

### **When Creating New Feature**

```markdown
I'll create a new [feature] module in the safe customization zone.

**Files to create**:
1. ✅ src/features/custom/[feature]/components/
2. ✅ src/features/custom/[feature]/services/
3. ✅ src/app/(app)/custom/[feature]/page.tsx
4. ✅ src/app/api/custom/[feature]/route.ts

**Features**:
- ✅ Multi-tenant secured (companyId scoping)
- ✅ Permission-protected APIs
- ✅ Input validation with Zod
- ✅ Full TypeScript types
- ✅ Safe from update conflicts

Shall I proceed? (Y/n)
```

---

## 📚 Common Scenarios & Solutions

### **Scenario 1: Developer Wants to Add User Profile Picture**

**WRONG APPROACH:**
Modify User model directly

**RIGHT APPROACH:**
```typescript
// Create UserProfile extension model
model UserProfile {
  id        String  @id @default(cuid())
  userId    String  @unique
  avatarUrl String?
  bio       String?
  
  user      User    @relation(fields: [userId], references: [id])
}
```

---

### **Scenario 2: Developer Wants Custom Dashboard Widget**

**WRONG APPROACH:**
Modify `src/app/(app)/dashboard/page.tsx`

**RIGHT APPROACH:**
```typescript
// Create custom dashboard page
// src/app/(app)/custom/my-dashboard/page.tsx

import { DashboardLayout } from '@/shared/components/layouts/DashboardLayout';
import { MyCustomWidget } from '@/features/custom/components/MyCustomWidget';

export default function MyDashboard() {
  return (
    <DashboardLayout>
      <MyCustomWidget />
    </DashboardLayout>
  );
}
```

---

### **Scenario 3: Developer Wants to Change Navigation**

**WRONG APPROACH:**
Modify `src/shared/components/nav/nav.tsx`

**RIGHT APPROACH:**
```typescript
// Add custom nav items to existing nav
// Document the change clearly

// src/app/(app)/layout.tsx
// CUSTOMIZED: Added custom CRM link (2025-10-12)
<NavItem href="/custom/crm">CRM</NavItem>
```

---

## 🎯 Code Generation Checklist

**Before presenting ANY code to developer, verify:**

- [ ] **Safe Zone**: Is code in `custom/` folders?
- [ ] **Multi-Tenant**: All queries include `companyId`?
- [ ] **Permissions**: API routes use `withPermissions()`?
- [ ] **Validation**: User input validated with Zod?
- [ ] **Types**: All TypeScript types defined?
- [ ] **Errors**: Proper error handling included?
- [ ] **Comments**: Complex logic explained?
- [ ] **Imports**: Correct import paths used?

---

## 🆘 When Developer Gets Stuck

### **Common Issues & Solutions**

**Issue: "I'm getting TypeScript errors"**

**AI Response:**
```
Let me check the error. Please share the full error message.

Common causes:
1. Missing import statement
2. Incorrect type definition
3. Missing Prisma client regeneration

Run: npx prisma generate
Then: npm run dev
```

---

**Issue: "Database query returns no results"**

**AI Response:**
```
Did you include companyId in the query?

Check:
1. Query has: where: { companyId: context.companyId }
2. User is authenticated
3. User belongs to a company
4. Database has test data

Show me your query code.
```

---

**Issue: "API route returns 403 Forbidden"**

**AI Response:**
```
Permission check is failing. Let's debug:

1. Is the API route using withPermissions()?
2. Does the user have required permission?
3. Check: Select * from "Permission" where userId = '[user-id]'

What permission are you checking for?
```

---

## 📖 File Reference Quick Links

**Core Documentation:**
```
GUIDES/00_LLM_CONTEXT.md                     - Project overview & architecture
GUIDES/01_SETUP_GUIDE.md                     - Initial setup
.windsurf/rules/architecture.md              - Non-negotiable rules
```

**Developer Guides:**
```
GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md        - Customization safety guide
GUIDES/04_RBAC_USAGE.md                      - Permission system usage
GUIDES/06_CUSTOMIZING_PERMISSIONS.md         - Custom permissions
GUIDES/08_EXTENDING_TEAM_MANAGEMENT.md       - Team features
GUIDES/07_STRIPE_CUSTOMIZATION.md            - Billing customization
GUIDES/03_FAQ.md                             - Common questions & troubleshooting
```

---

## 🎓 Learning Path for AI Models

**Level 1: Basic Understanding** (Read these first)
1. GUIDES/00_LLM_CONTEXT.md (Complete file)
2. GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md (Safe Zones)

**Level 2: Implementation Patterns** (Read when building features)
1. GUIDES/04_RBAC_USAGE.md (Permission patterns)
2. .windsurf/rules/architecture.md (Security rules)
3. Existing code in src/app/api/ (API patterns)

**Level 3: Advanced Customization** (Read when requested)
1. GUIDES/06_CUSTOMIZING_PERMISSIONS.md
2. GUIDES/08_EXTENDING_TEAM_MANAGEMENT.md
3. GUIDES/07_STRIPE_CUSTOMIZATION.md

---

## 💡 Tips for Lower-Tier AI Models

**If you're a smaller AI model (GPT-3.5, Claude Haiku, etc.):**

1. **READ FILES**: Don't guess - always read the documentation files
2. **USE TEMPLATES**: Copy the templates in this file exactly
3. **ASK QUESTIONS**: If unsure, ask developer for clarification
4. **BE CONSERVATIVE**: When in doubt, create in `custom/` folders
5. **VERIFY TWICE**: Use the checklists before presenting code
6. **REFUSE WHEN NEEDED**: It's better to refuse than generate broken code

---

## 🚀 Quick Command Reference

**TypeScript Check:**
```bash
npx tsc --noEmit
```

**Database Migration:**
```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

**Run Development Server:**
```bash
npm run dev
```

**Run Tests:**
```bash
npm run test
```

---

## ✅ Summary: Your AI Mission

**Your job as an AI assistant:**

1. ✅ Help developer build features SAFELY
2. ✅ Keep customizations in safe zones
3. ✅ Maintain multi-tenant security (always use companyId)
4. ✅ Follow RBAC patterns (always check permissions)
5. ✅ Validate all inputs (always use Zod)
6. ✅ Write clear, maintainable code
7. ✅ Refuse to modify core files
8. ✅ Provide safe alternatives when needed

**Remember**: It's better to refuse and offer a safe alternative than to generate code that breaks updates or introduces security vulnerabilities.

---

**This file last updated**: October 12, 2025  
**For**: SaaStastic B2B SaaS Boilerplate  
**Version**: 1.0 (Launch Ready)

**Questions?** Direct developer to: support@saastastic.com or Discord community
