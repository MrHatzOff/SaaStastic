# 🏗️ SaaStastic Codebase Reorganization Plan

## **Current Status**
- ✅ New directory structure created (`src/core/`, `src/features/`, `src/shared/`)
- ✅ **FIXED**: Duplicated files cleaned up
- ✅ **MAJOR PROGRESS**: ~90% of reorganization complete!
- 🔄 **REMAINING**: Just a few final moves and cleanup (see tasks below)

## **What Needs to be Done**

### **Phase 1: Clean Up Duplicates** ✅
Remove the incorrectly copied files:
- ✅ `src/core/auth/company-provider.tsx` (duplicate)
- ✅ `src/core/db/client.ts` (duplicate) 
- ✅ `src/core/db/tenant-guard.ts` (duplicate)
- ✅ `src/features/billing/components/billing-history.tsx` (duplicate)

### **Phase 2: Move Files (Don't Copy)**
Use VSCode's file explorer to **drag and drop** files to new locations. This will automatically update imports.

#### **Core Infrastructure Files**
✅ **FROM** `src/core/shared/` **TO** respective core directories:
```
src/core/shared/auth/company-provider.tsx → src/core/auth/company-provider.tsx
src/core/shared/auth/CompanyContext.md → src/core/auth/CompanyContext.md
src/core/shared/db/client.ts → src/core/db/client.ts
src/core/shared/db/tenant-guard.ts → src/core/db/tenant-guard.ts
```

#### **Feature Modules**
✅**FROM** `src/modules/` **TO** `src/features/`:
```
src/modules/billing/ → src/features/billing/
├── components/
├── schemas/
├── services/
└── types/

src/modules/users/ → src/features/users/
├── components/
├── services/
└── (create schemas/, types/ directories)
```

#### **Shared Components**
✅ **FROM** `src/components/shared/` **TO** `src/shared/components/`:
```
src/components/shared/ui/ → src/shared/components/ui/
src/components/shared/index.ts → src/shared/components/index.ts
```

#### **Shared Utilities**
✅ **FROM** `src/lib/shared/` **TO** `src/shared/lib/`:
```
src/lib/shared/ → src/shared/lib/
├── api-middleware.ts
├── app-config.ts
├── security-headers.ts
├── site-config.ts
├── test-data.ts
├── utils.ts
└── index.ts
```

#### **Shared Hooks**
✅ **FROM** `src/hooks/` **TO** `src/shared/hooks/`:
```
src/hooks/ → src/shared/hooks/
├── use-onboarding-status.ts
└── use-user-sync.ts
```

#### **App-Specific Components**
✅ **FROM** `src/components/app/` **TO** respective features:
```
src/components/app/companies/ → src/features/companies/components/
src/components/app/customers/ → src/features/customers/components/
```

#### **Marketing Components**
✅ **FROM** `src/components/marketing/` **TO** `src/features/marketing/components/`:
```
src/components/marketing/ → src/features/marketing/components/
├── features-section.tsx
├── footer.tsx
├── hero-section.tsx
├── navigation.tsx
└── pricing-section.tsx
```

#### **Billing Components**
✅ **FROM** `src/components/billing/` **TO** `src/features/billing/components/`:
```
src/components/billing/checkout-button.tsx → src/features/billing/components/checkout-button.tsx
```

#### **App-Specific Lib Files**
**ANALYSIS NEEDED** - `src/lib/app/saas-helpers.ts`:

**File Contents Analysis:**
- Contains SaaS-specific utilities (tenant DB helpers, role checking, etc.)
- Used across multiple features (billing, users, companies)
- Provides common patterns for multi-tenant operations
- **VERDICT**: This is **SHARED INFRASTRUCTURE** - should move to `src/shared/lib/`

**DECISION FOR NEXT LLM:**
```
✅ src/lib/app/saas-helpers.ts → src/shared/lib/saas-helpers.ts
✅ src/lib/app/index.ts → (merge with src/shared/lib/index.ts)
```

**Why it's shared:**
- Used by multiple features (not app-specific)
- Contains reusable multi-tenant patterns
- Core infrastructure for SaaS operations
- Would be useful for any SaaS built on this foundation

### **REMAINING TASKS FOR NEXT LLM:**

#### **1. Move Remaining Billing Services** ✅
**NOTE:  These files already exist in the destination.  Possibly duplicate, Possibly different. Determine which and how to proceed properly.**
```
src/modules/billing/services/stripe-service.ts → src/features/billing/services/stripe-service.ts 
src/modules/billing/services/webhook-handlers.ts → src/features/billing/services/webhook-handlers.ts
```

#### **2. Move App-Specific Lib Files** ✅
```
✅ src/lib/app/saas-helpers.ts → src/shared/lib/saas-helpers.ts
src/lib/app/index.ts → (merge with src/shared/lib/index.ts)
```

#### **3. Check Remaining Components** ✅
Investigate what's left in `src/components/app/` (1 item) and move appropriately.

#### **4. Clean Up Empty Directories** ✅
After moves, remove:
- `src/modules/` (should be empty)
- `src/lib/app/` (should be empty)  
- `src/components/app/` (if empty)
- `src/core/shared/` (except index.ts if needed)

### **Phase 3: Update Import References**
After moving files, update any remaining import references that VSCode didn't catch:

#### **Common Import Updates Needed:**
```typescript
// OLD
import { ... } from '@/components/shared/ui/...'
import { ... } from '@/lib/shared/...'
import { ... } from '@/core/shared/...'
import { ... } from '@/modules/...'

// NEW  
import { ... } from '@/shared/components/ui/...'
import { ... } from '@/shared/lib/...'
import { ... } from '@/core/...'
import { ... } from '@/features/...'
```

### **Phase 4: Update Configuration Files**
Update path mappings and references:

#### **tsconfig.json** - Add path mappings:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/features/*": ["./src/features/*"], 
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

#### **tailwind.config.ts** - Update content paths:
```typescript
content: [
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/core/**/*.{js,ts,jsx,tsx,mdx}",
]
```

### **Phase 5: Clean Up Empty Directories**
Remove empty directories after moves:
- `src/modules/` (should be empty)
- `src/core/shared/` (should be empty)
- `src/components/` (reorganized)
- `src/lib/` (reorganized)
- `src/hooks/` (moved to shared)

### **Phase 6: Verification**
Run the verification checklist from `REORGANIZATION_CHECKLIST.md`

---

## **LLM Context for Next Session**

### **Essential Reading Order:**
1. **This file** (`CODEBASE_REORGANIZATION_PLAN.md`) - The complete plan
2. **`REORGANIZATION_CHECKLIST.md`** - Verification steps
3. **`/docs/core/architecture/rbac-spec.md`** - Next major feature after reorganization

### **Key Context:**
- **Project**: SaaStastic - Production-ready multi-tenant B2B SaaS starter
- **Current Phase**: Codebase reorganization (before RBAC implementation)
- **Problem**: Files were copied instead of moved, creating duplicates
- **Goal**: Clean file structure for easier RBAC implementation
- **Architecture**: Multi-tenant with strict `companyId` scoping on all operations

### **Critical Rules:**
- **NEVER bypass tenant isolation** - all DB queries must include `companyId`
- **Use Clerk authentication only** - no dev bypasses
- **TypeScript strict mode** - no `any` types
- **Move files, don't copy** - use VSCode drag & drop for auto-import updates

### **Current Status:**
- ✅ TypeScript errors mostly resolved (production-ready)
- ✅ Core architecture solid (auth, db, multi-tenant)
- ✅ Stripe integration working
- ✅ **IN PROGRESS**: File reorganization
- ⏳ **NEXT**: RBAC implementation

### **Immediate Task:**
Execute this reorganization plan systematically, then verify with checklist.

### **Success Criteria:**
- Clean directory structure matching the plan
- All imports working correctly
- No duplicate files
- All tests passing
- Ready for RBAC implementation

---

## **Tools & Commands for Next Session**

### **Verification Commands:**
```bash
# Check TypeScript
npx tsc --noEmit

# Check build
npm run build

# Check for duplicate files
# (manually verify no duplicates exist)

# Run development server
npm run dev
```

### **File Operations:**
- Use VSCode file explorer drag & drop (auto-updates imports)
- Use `Edit` tool for import path updates
- Use `Read` tool to verify file contents
- Use `list_dir` to verify directory structure

### **DO NOT:**
- Copy files (creates duplicates)
- Use terminal `mv` commands (doesn't update imports)
- Skip verification steps
- Rush through without testing
