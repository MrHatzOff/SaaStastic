# Safe Customization Guide

**For Developers & Founders Building with SaaStastic**

This guide helps you customize SaaStastic safely while preserving your ability to receive updates. Follow these zones to avoid merge conflicts and maintain compatibility with future releases.

---

## 🎯 Philosophy: Composition Over Modification

**Golden Rule**: Extend and compose, don't modify core files.

Think of SaaStastic as a foundation. Build **on top** of it, not **into** it.

---

## ✅ Safe Zones: Customize Freely

These areas are **designed for your customizations**. Modify without worry:

### **1. Custom Feature Modules** ⭐ PRIMARY CUSTOMIZATION ZONE

```
src/features/custom/
├── components/           # Your custom UI components
├── hooks/               # Your custom React hooks
├── services/            # Your business logic
├── types/               # Your TypeScript types
└── utils/               # Your utility functions
```

**Example**: Building a custom CRM module
```typescript
// src/features/custom/crm/
├── components/
│   ├── DealPipeline.tsx
│   ├── LeadList.tsx
│   └── ContactCard.tsx
├── hooks/
│   └── use-deals.ts
├── services/
│   └── deal-service.ts
└── types/
    └── crm-types.ts
```

**Why it's safe**: These folders don't exist in the base template, so zero conflicts.

---

### **2. Custom Pages & Routes**

```
src/app/(app)/custom/
├── my-feature/
│   ├── page.tsx
│   ├── layout.tsx
│   └── loading.tsx
└── another-feature/
    └── page.tsx
```

**Example**: Adding a custom analytics dashboard
```typescript
// src/app/(app)/custom/analytics/page.tsx
import { MyCustomChart } from '@/features/custom/analytics/components/MyCustomChart';

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Custom Analytics</h1>
      <MyCustomChart />
    </div>
  );
}
```

**Why it's safe**: Route is namespaced under `/custom/`, won't conflict with our routes.

---

### **3. Custom API Routes**

```
src/app/api/custom/
├── my-endpoint/
│   └── route.ts
└── webhooks/
    └── external-service/
        └── route.ts
```

**Example**: Adding a custom API endpoint
```typescript
// src/app/api/custom/my-endpoint/route.ts
import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // Your custom logic here
    return NextResponse.json({ success: true });
  },
  [PERMISSIONS.CUSTOMER_READ] // Reuse existing permissions
);
```

**Why it's safe**: API route is namespaced under `/api/custom/`, won't conflict.

---

### **4. Environment Variables**

```
.env.local           # Your local overrides (SAFE)
.env.production      # Your production secrets (SAFE)
```

**Always safe**: Environment files are gitignored and won't conflict with updates.

---

### **5. Public Assets**

```
public/
├── images/
│   └── your-logo.png          # SAFE
├── fonts/
│   └── your-custom-font.woff  # SAFE
└── docs/
    └── your-pdfs/             # SAFE
```

**Why it's safe**: Public folder is for your static assets. We never touch it.

---

### **6. Design Tokens & Styling**

```
tailwind.config.js       # SAFE to extend
src/shared/ui/theme/     # Create your own theme files here
```

**Example**: Custom color scheme
```javascript
// tailwind.config.js
module.exports = {
  // ... existing config
  theme: {
    extend: {
      colors: {
        // Add your brand colors
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... your colors
        },
      },
    },
  },
};
```

**Why it's safe**: You're extending, not replacing. Merge conflicts are rare and easy to resolve.

---

### **7. Database Migrations (Your Own)**

```
prisma/migrations/
├── 20250101000000_saastastic_base/        # OUR migrations (DON'T TOUCH)
└── 20250915123456_your_custom_feature/    # YOUR migrations (SAFE)
```

**Best Practice**: Prefix your migrations with a clear naming convention
```bash
npx prisma migrate dev --name "custom_crm_deals_table"
npx prisma migrate dev --name "custom_analytics_events"
```

**Why it's safe**: Migrations are append-only. New migrations won't conflict with ours.

---

## ⚠️ Caution Zones: Modify Carefully

These areas CAN be customized, but expect **merge conflicts** during updates:

### **1. Shared Components**

```
src/shared/components/
├── data-table.tsx       # ⚠️ CAUTION
├── modal.tsx            # ⚠️ CAUTION
└── form-fields.tsx      # ⚠️ CAUTION
```

**Strategy**: 
- **Option A**: Extend instead of modify
  ```typescript
  // src/features/custom/components/MyDataTable.tsx
  import { DataTable } from '@/shared/components/data-table';
  
  export function MyDataTable(props) {
    return <DataTable {...props} className="my-custom-styles" />;
  }
  ```

- **Option B**: Copy and rename
  ```typescript
  // src/features/custom/components/CustomDataTable.tsx
  // Full copy of DataTable with your modifications
  ```

**Why caution**: We may update these components. If you modify them directly, you'll get conflicts.

---

### **2. Feature Module Components**

```
src/features/billing/components/
src/features/users/components/
src/features/customers/components/
```

**Strategy**: 
- Prefer creating new components in `src/features/custom/`
- If you must modify, **document your changes**:
  ```typescript
  // src/features/billing/components/SubscriptionCard.tsx
  // CUSTOMIZED: Added custom pricing tier display (2025-09-15)
  // CUSTOMIZED: Changed button colors to match brand (2025-09-20)
  ```

**Why caution**: These are part of our core product. Updates likely.

---

### **3. Layouts & Navigation**

```
src/app/(app)/layout.tsx        # ⚠️ CAUTION
src/shared/components/nav/      # ⚠️ CAUTION
src/shared/components/sidebar/  # ⚠️ CAUTION
```

**Strategy**: Add items, don't restructure
```typescript
// src/app/(app)/layout.tsx
// ✅ GOOD: Adding a new nav item
<Nav>
  {/* Existing items */}
  <NavItem href="/custom/my-feature">My Feature</NavItem>
</Nav>

// ❌ BAD: Completely rewriting the layout
```

**Why caution**: Layout changes affect the entire app. We may add features that require layout changes.

---

## 🔴 Danger Zones: DO NOT MODIFY

These files are **core infrastructure**. Modifying them will **break your ability to update**:

### **1. Core Infrastructure**

```
src/core/
├── auth/              # 🔴 NEVER MODIFY
├── db/                # 🔴 NEVER MODIFY
├── rbac/              # 🔴 NEVER MODIFY
└── observability/     # 🔴 NEVER MODIFY
```

**Why**: These are the foundation. Breaking them breaks everything.

**If you need changes**: Request a feature from us or wait for an update.

---

### **2. RBAC System**

```
src/shared/lib/permissions.ts        # 🔴 NEVER MODIFY
src/shared/lib/rbac-middleware.ts    # 🔴 NEVER MODIFY
src/shared/hooks/use-permissions.ts  # 🔴 NEVER MODIFY
```

**Exception**: Adding custom permissions (see below)

**Why**: RBAC is security-critical. Bugs here = security vulnerabilities.

---

### **3. Database Schema (Core Models)**

```prisma
// prisma/schema.prisma

model User { }           // 🔴 DON'T MODIFY
model Company { }        // 🔴 DON'T MODIFY
model Role { }           // 🔴 DON'T MODIFY
model Permission { }     // 🔴 DON'T MODIFY
model Subscription { }   // 🔴 DON'T MODIFY
```

**What you CAN do**: Add your own models
```prisma
// ✅ SAFE: Add your custom models
model Deal {
  id          String   @id @default(cuid())
  companyId   String   // Always include for multi-tenancy!
  name        String
  value       Float
  createdAt   DateTime @default(now())
  
  company     Company  @relation(fields: [companyId], references: [id])
  
  @@index([companyId])
}
```

**Why**: We'll add fields to core models. If you've modified them, conflicts are guaranteed.

---

### **4. API Middleware**

```
src/shared/lib/api-middleware.ts     # 🔴 NEVER MODIFY
src/shared/lib/auth-helpers.ts       # 🔴 NEVER MODIFY
src/shared/lib/tenant-guards.ts      # 🔴 NEVER MODIFY
```

**Why**: Security and multi-tenancy are handled here. Don't break them.

---

### **5. Database Migrations (Ours)**

```
prisma/migrations/
├── 20250101_initial_setup/          # 🔴 NEVER MODIFY
├── 20250102_add_rbac/               # 🔴 NEVER MODIFY
└── 20250103_add_billing/            # 🔴 NEVER MODIFY
```

**Never**:
- Edit existing migration files
- Delete migration files
- Change migration order

**Why**: Migrations are immutable. Changing them breaks your database.

---

## 🎨 Common Customization Patterns

### **Pattern 1: Adding Custom Permissions**

```typescript
// src/features/custom/lib/custom-permissions.ts
export const CUSTOM_PERMISSIONS = {
  DEAL_CREATE: 'deal:create',
  DEAL_READ: 'deal:read',
  DEAL_UPDATE: 'deal:update',
  DEAL_DELETE: 'deal:delete',
} as const;

// Use in API routes
import { withPermissions } from '@/shared/lib';
import { CUSTOM_PERMISSIONS } from '@/features/custom/lib/custom-permissions';

export const POST = withPermissions(
  async (req, context) => {
    // Your logic
  },
  [CUSTOM_PERMISSIONS.DEAL_CREATE]
);
```

**Then add to database**:
```sql
INSERT INTO "Permission" (id, name, description, category)
VALUES 
  (gen_random_uuid(), 'deal:create', 'Create deals', 'Custom'),
  (gen_random_uuid(), 'deal:read', 'View deals', 'Custom');
```

---

### **Pattern 2: Extending User Model**

**Don't modify User model directly**. Use a related model:

```prisma
// prisma/schema.prisma

// ✅ GOOD: Create a profile extension
model UserProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  bio       String?
  avatar    String?
  timezone  String?
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
}

// Add relation to User (we'll preserve this in updates)
model User {
  // ... existing fields
  profile   UserProfile?
}
```

---

### **Pattern 3: Custom Dashboard Widgets**

```typescript
// src/features/custom/components/CustomDashboard.tsx
import { DashboardLayout } from '@/shared/components/layouts/DashboardLayout';
import { MyWidget } from './MyWidget';

export function CustomDashboard() {
  return (
    <DashboardLayout>
      {/* Reuse our layout */}
      <MyWidget />
      <AnotherWidget />
    </DashboardLayout>
  );
}
```

---

### **Pattern 4: Wrapping Core Components**

```typescript
// src/features/custom/components/BrandedSubscriptionCard.tsx
import { SubscriptionCard } from '@/features/billing/components/SubscriptionCard';

export function BrandedSubscriptionCard(props) {
  return (
    <div className="custom-wrapper">
      <div className="brand-banner">Premium Plan</div>
      <SubscriptionCard {...props} />
    </div>
  );
}
```

---

## 🔄 Handling Updates

### **When We Release an Update**

1. **Review the changelog** (we'll provide detailed notes)
2. **Check for breaking changes** (we'll mark them clearly)
3. **Test in a branch first**

```bash
# Create update branch
git checkout -b update-v1.2.0

# Pull our changes
git fetch saastastic
git merge saastastic/main

# Check for conflicts
git status

# If conflicts...
git diff
```

### **Resolving Conflicts**

**If conflict in a SAFE ZONE**: Keep your version
```bash
git checkout --ours src/features/custom/my-file.ts
```

**If conflict in a CAUTION ZONE**: Merge carefully
```bash
# Open file, review both versions
# Keep our core logic + your customizations
```

**If conflict in a DANGER ZONE**: Keep ours, re-apply your changes
```bash
git checkout --theirs src/core/auth/provider.tsx
# Then re-add your modifications (if absolutely necessary)
```

---

## 📋 Pre-Update Checklist

Before pulling updates:

- [ ] **Commit all your changes**
  ```bash
  git add .
  git commit -m "Pre-update checkpoint"
  ```

- [ ] **Document your modifications**
  ```bash
  # Create a list
  git diff saastastic/main > my-customizations.diff
  ```

- [ ] **Run tests**
  ```bash
  npm run test
  ```

- [ ] **Backup database** (production)
  ```bash
  pg_dump database_name > backup.sql
  ```

- [ ] **Create update branch**
  ```bash
  git checkout -b update-v1.2.0
  ```

---

## 🆘 Emergency: "I Modified Core Files"

Don't panic. Here's how to recover:

### **Option 1: Cherry-pick your changes**

```bash
# Start fresh from our latest
git checkout saastastic/main -b fresh-start

# Cherry-pick only your custom commits
git cherry-pick <your-commit-hash>

# Skip commits that modified core files
```

### **Option 2: Manual merge**

```bash
# Create a patch of your changes
git diff saastastic/main > my-changes.patch

# Reset to clean state
git reset --hard saastastic/main

# Apply your changes manually
patch -p1 < my-changes.patch

# Review and fix
```

### **Option 3: Start over (nuclear option)**

```bash
# Export your custom code
cp -r src/features/custom /tmp/backup
cp -r src/app/custom /tmp/backup

# Clone fresh
git clone <repo> fresh-saastastic

# Copy back your custom code
cp -r /tmp/backup/custom fresh-saastastic/src/features/
```

---

## ✅ Best Practices Summary

1. **Use the `custom/` folders** for all your code
2. **Extend, don't modify** core components
3. **Document your changes** with comments
4. **Test updates in a branch** before merging to main
5. **Keep a changelog** of your customizations
6. **Ask us before modifying core files**

---

## 🎯 Recommended Folder Structure

Here's what a well-organized custom project looks like:

```
your-saastastic-project/
├── src/
│   ├── features/
│   │   ├── billing/              # Ours (don't touch)
│   │   ├── users/                # Ours (don't touch)
│   │   └── custom/               # YOURS ⭐
│   │       ├── crm/
│   │       │   ├── components/
│   │       │   ├── services/
│   │       │   └── types/
│   │       ├── analytics/
│   │       └── integrations/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/        # Ours (caution)
│   │   │   └── custom/           # YOURS ⭐
│   │   │       ├── crm/
│   │   │       │   └── page.tsx
│   │   │       └── analytics/
│   │   │           └── page.tsx
│   │   └── api/
│   │       ├── users/            # Ours (don't touch)
│   │       └── custom/           # YOURS ⭐
│   │           ├── crm/
│   │           └── webhooks/
│   └── core/                     # Ours (NEVER TOUCH) 🔴
├── prisma/
│   ├── schema.prisma             # Add models, don't modify ours
│   └── migrations/
│       ├── 20250101_base/        # Ours (don't touch)
│       └── 20250915_custom/      # YOURS ⭐
├── public/                       # YOURS (all safe) ⭐
├── .env.local                    # YOURS (all safe) ⭐
└── tailwind.config.js            # Extend (caution) ⚠️
```

---

## 📞 Need Help?

**Before modifying core files**, reach out:
- 📧 Email: support@saastastic.com
- 💬 Discord: #technical-support
- 📖 Docs: https://docs.saastastic.com

We're here to help you customize safely!

---

**Remember**: The best customization is the one that doesn't fight with updates. Build on top, extend, compose—and you'll thank yourself later.

Happy building! 🚀
