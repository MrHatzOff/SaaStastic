# 🔐 RBAC Usage Guide

**Learn how to use SaaStastic's 29-permission RBAC system to build secure, permission-aware features.**

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Understanding the Permission System](#understanding-the-permission-system)
3. [Protecting API Routes](#protecting-api-routes)
4. [Building Permission-Aware UI](#building-permission-aware-ui)
5. [Using Permission Hooks](#using-permission-hooks)
6. [Common Patterns](#common-patterns)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

### Why RBAC?

SaaStastic includes a complete Role-Based Access Control (RBAC) system that:
- ✅ **Protects your API routes** automatically
- ✅ **Controls UI visibility** based on permissions
- ✅ **Supports 4 default roles** (Owner, Admin, Member, Viewer)
- ✅ **Allows custom permissions** for your features
- ✅ **Works across tenants** with perfect isolation

### The 29 System Permissions

Permissions are organized into 7 categories:

| Category | Count | Examples |
|----------|-------|----------|
| **Organization** | 4 | `org:view`, `org:update`, `org:delete`, `org:settings` |
| **Billing** | 4 | `billing:view`, `billing:update`, `billing:portal`, `billing:invoices` |
| **Team** | 5 | `team:view`, `team:invite`, `team:remove`, `team:role:update` |
| **Customers** | 5 | `customer:create`, `customer:view`, `customer:update`, `customer:delete` |
| **API Keys** | 3 | `api_key:create`, `api_key:view`, `api_key:delete` |
| **Roles** | 5 | `role:create`, `role:view`, `role:update`, `role:delete`, `role:assign` |
| **System** | 3 | `system:logs`, `system:health`, `system:impersonate` |

**Total: 29 permissions**

---

## Understanding the Permission System

### Permission Format

All permissions follow the pattern: `resource:action`

```typescript
// Examples
'org:view'           // View organization details
'customer:create'    // Create new customers
'team:role:update'   // Update team member roles
```

### The Four Default Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Owner** | 29 (all) | Company founder, full control |
| **Admin** | 25 | IT admins, operations managers |
| **Member** | 7 | Regular team members |
| **Viewer** | 5 | Read-only access, contractors |

### Where Permissions Are Defined

```typescript
// src/shared/lib/permissions.ts
export const PERMISSIONS = {
  ORG_VIEW: 'org:view',
  ORG_UPDATE: 'org:update',
  CUSTOMER_CREATE: 'customer:create',
  TEAM_INVITE: 'team:invite',
  // ... 29 total permissions
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
```

---

## Protecting API Routes

### Basic Protection

Use `withPermissions()` middleware to protect API routes:

```typescript
// src/app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { db } from '@/core/db/client';

// ✅ Protected: Only users with 'customer:view' permission can access
export const GET = withPermissions(
  async (req: NextRequest, context) => {
    const { companyId } = context;
    
    // Automatically scoped to user's company
    const customers = await db.customer.findMany({
      where: { companyId }
    });
    
    return NextResponse.json({ customers });
  },
  [PERMISSIONS.CUSTOMER_VIEW] // Required permission
);
```

### Multiple Permission Requirements

Require multiple permissions for sensitive operations:

```typescript
// src/app/api/customers/bulk-delete/route.ts
import { withPermissions, PERMISSIONS } from '@/shared/lib';

// ✅ Requires BOTH permissions
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    const { companyId } = context;
    const { customerIds } = await req.json();
    
    await db.customer.deleteMany({
      where: {
        id: { in: customerIds },
        companyId // Tenant isolation
      }
    });
    
    return NextResponse.json({ success: true });
  },
  [PERMISSIONS.CUSTOMER_DELETE, PERMISSIONS.CUSTOMER_EXPORT] // Both required
);
```

### What You Get Automatically

When using `withPermissions()`, you automatically get:

```typescript
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // context.userId       - Authenticated user ID from Clerk
    // context.companyId    - User's current company ID
    // context.permissions  - Array of user's permissions
    // context.user         - User object (id, email, name)
    // context.company      - Company object (id, name, slug)
    
    console.log(context);
    // {
    //   userId: "user_123",
    //   companyId: "company_456",
    //   permissions: ["customer:view", "customer:create", ...],
    //   user: { id: "user_123", email: "john@company.com", name: "John" },
    //   company: { id: "company_456", name: "Acme Inc", slug: "acme-inc" }
    // }
  },
  [PERMISSIONS.CUSTOMER_CREATE]
);
```

### Error Responses

The middleware returns proper error responses:

```typescript
// ❌ Not authenticated
// Status: 401
{ "error": "Authentication required" }

// ❌ No company context
// Status: 400
{ "error": "Company context required" }

// ❌ Not member of company
// Status: 403
{ "error": "Access denied: User not member of company" }

// ❌ Missing permissions
// Status: 403
{
  "error": "Insufficient permissions",
  "details": "Missing permissions: customer:delete, customer:export"
}
```

### Public Routes

For routes that don't need protection:

```typescript
// src/app/api/public/health/route.ts
export async function GET() {
  // No middleware = public access
  return NextResponse.json({ status: 'ok' });
}
```

---

## Building Permission-Aware UI

### Using `<PermissionGuard>`

The simplest way to show/hide UI elements:

```typescript
// src/components/customer-dashboard.tsx
import { PermissionGuard } from '@/shared/components/permission-guard';

export function CustomerDashboard() {
  return (
    <div>
      <h1>Customers</h1>
      
      {/* Only visible if user has customer:create permission */}
      <PermissionGuard permission="customer:create">
        <button>Add Customer</button>
      </PermissionGuard>
      
      {/* Show list to everyone with customer:view */}
      <PermissionGuard permission="customer:view">
        <CustomerList />
      </PermissionGuard>
    </div>
  );
}
```

### Multiple Permission Checks

Check for multiple permissions with `mode`:

```typescript
import { PermissionGuard } from '@/shared/components/permission-guard';

export function AdminPanel() {
  return (
    <div>
      {/* User needs ANY of these permissions */}
      <PermissionGuard
        permissions={['customer:delete', 'customer:export']}
        mode="any"
      >
        <BulkActions />
      </PermissionGuard>
      
      {/* User needs ALL of these permissions */}
      <PermissionGuard
        permissions={['org:update', 'billing:update']}
        mode="all"
      >
        <SettingsPanel />
      </PermissionGuard>
    </div>
  );
}
```

### Fallback Content

Show alternative content for users without permission:

```typescript
<PermissionGuard
  permission="billing:view"
  fallback={
    <div className="text-muted-foreground">
      Contact your admin to view billing information
    </div>
  }
>
  <BillingDetails />
</PermissionGuard>
```

---

## Using Permission Hooks

### `usePermissions()` Hook

For conditional logic in components:

```typescript
'use client';

import { usePermissions } from '@/shared/hooks/use-permissions';

export function CustomerActions() {
  const { hasPermission, PERMISSIONS } = usePermissions();
  
  const canCreate = hasPermission(PERMISSIONS.CUSTOMER_CREATE);
  const canDelete = hasPermission(PERMISSIONS.CUSTOMER_DELETE);
  const canExport = hasPermission(PERMISSIONS.CUSTOMER_EXPORT);
  
  return (
    <div className="flex gap-2">
      {canCreate && <button>Add Customer</button>}
      {canDelete && <button>Delete Selected</button>}
      {canExport && <button>Export CSV</button>}
    </div>
  );
}
```

### Check Multiple Permissions

```typescript
import { usePermissions } from '@/shared/hooks/use-permissions';

export function BulkActionsMenu() {
  const { hasAnyPermission, hasAllPermissions, PERMISSIONS } = usePermissions();
  
  // User has ANY of these permissions
  const canModify = hasAnyPermission([
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.CUSTOMER_DELETE
  ]);
  
  // User has ALL of these permissions
  const canExportAndDelete = hasAllPermissions([
    PERMISSIONS.CUSTOMER_EXPORT,
    PERMISSIONS.CUSTOMER_DELETE
  ]);
  
  return (
    <div>
      {canModify && <ActionMenu />}
      {canExportAndDelete && <DangerZone />}
    </div>
  );
}
```

### Loading States

Handle loading state properly:

```typescript
import { usePermissions } from '@/shared/hooks/use-permissions';

export function ProtectedContent() {
  const { hasPermission, loading, PERMISSIONS } = usePermissions();
  
  // Show loading skeleton while fetching permissions
  if (loading) {
    return <Skeleton />;
  }
  
  // Check permission after loaded
  if (!hasPermission(PERMISSIONS.CUSTOMER_VIEW)) {
    return <AccessDenied />;
  }
  
  return <CustomerList />;
}
```

### Get All User Permissions

```typescript
import { usePermissions } from '@/shared/hooks/use-permissions';

export function PermissionDebugger() {
  const { permissions, loading } = usePermissions();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h3>Your Permissions ({permissions.length})</h3>
      <ul>
        {permissions.map(p => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Progressive Feature Access

Show features progressively based on permissions:

```typescript
import { usePermissions } from '@/shared/hooks/use-permissions';

export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const { hasPermission, PERMISSIONS } = usePermissions();
  
  return (
    <div>
      {/* Everyone with view permission sees this */}
      <CustomerInfo customerId={customerId} />
      
      {/* Only users who can update see edit button */}
      {hasPermission(PERMISSIONS.CUSTOMER_UPDATE) && (
        <EditCustomerButton customerId={customerId} />
      )}
      
      {/* Only users who can delete see danger zone */}
      {hasPermission(PERMISSIONS.CUSTOMER_DELETE) && (
        <DeleteCustomerSection customerId={customerId} />
      )}
    </div>
  );
}
```

### Pattern 2: Conditional Navigation

Hide nav items based on permissions:

```typescript
import { usePermissions } from '@/shared/hooks/use-permissions';

export function AppNavigation() {
  const { hasPermission, hasAnyPermission, PERMISSIONS } = usePermissions();
  
  return (
    <nav>
      {/* Always visible */}
      <NavItem href="/dashboard">Dashboard</NavItem>
      
      {/* Conditional items */}
      {hasPermission(PERMISSIONS.CUSTOMER_VIEW) && (
        <NavItem href="/customers">Customers</NavItem>
      )}
      
      {hasPermission(PERMISSIONS.BILLING_VIEW) && (
        <NavItem href="/billing">Billing</NavItem>
      )}
      
      {hasAnyPermission([PERMISSIONS.TEAM_VIEW, PERMISSIONS.TEAM_INVITE]) && (
        <NavItem href="/team">Team</NavItem>
      )}
      
      {hasPermission(PERMISSIONS.ORG_SETTINGS) && (
        <NavItem href="/settings">Settings</NavItem>
      )}
    </nav>
  );
}
```

### Pattern 3: Role-Based Dashboards

Show different dashboards based on role:

```typescript
import { usePermissions } from '@/shared/hooks/use-permissions';

export function DashboardPage() {
  const { hasAnyPermission, PERMISSIONS } = usePermissions();
  
  // Check if user is admin-level
  const isAdmin = hasAnyPermission([
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.BILLING_UPDATE,
    PERMISSIONS.TEAM_INVITE
  ]);
  
  // Check if user is viewer-only
  const isViewer = !hasAnyPermission([
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_UPDATE
  ]);
  
  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  if (isViewer) {
    return <ViewerDashboard />;
  }
  
  return <MemberDashboard />;
}
```

### Pattern 4: Form Field Disabling

Disable form fields based on permissions:

```typescript
import { usePermissions } from '@/shared/hooks/use-permissions';

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const { hasPermission, PERMISSIONS } = usePermissions();
  
  const canUpdate = hasPermission(PERMISSIONS.CUSTOMER_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CUSTOMER_DELETE);
  
  return (
    <form>
      <input
        name="name"
        defaultValue={customer.name}
        disabled={!canUpdate}
      />
      
      <input
        name="email"
        defaultValue={customer.email}
        disabled={!canUpdate}
      />
      
      <div className="flex gap-2">
        <button type="submit" disabled={!canUpdate}>
          Save Changes
        </button>
        
        <button
          type="button"
          onClick={() => deleteCustomer(customer.id)}
          disabled={!canDelete}
        >
          Delete
        </button>
      </div>
    </form>
  );
}
```

---

## Best Practices

### ✅ DO: Check Permissions at Both Levels

Always protect both API and UI:

```typescript
// ✅ GOOD: Protection at API level
export const DELETE = withPermissions(
  async (req, context) => {
    // Delete customer
  },
  [PERMISSIONS.CUSTOMER_DELETE]
);

// ✅ GOOD: Protection at UI level
<PermissionGuard permission="customer:delete">
  <DeleteButton />
</PermissionGuard>
```

### ✅ DO: Use Type-Safe Permission Constants

Always import from `PERMISSIONS`:

```typescript
// ✅ GOOD: Type-safe, autocomplete works
import { PERMISSIONS } from '@/shared/lib/permissions';
const canDelete = hasPermission(PERMISSIONS.CUSTOMER_DELETE);

// ❌ BAD: String literal, typos won't be caught
const canDelete = hasPermission('customer:delte'); // Typo!
```

### ✅ DO: Handle Loading States

Always handle the loading state:

```typescript
// ✅ GOOD: Shows skeleton while loading
const { hasPermission, loading } = usePermissions();
if (loading) return <Skeleton />;
return hasPermission(PERMISSIONS.CUSTOMER_VIEW) ? <Content /> : <Denied />;

// ❌ BAD: Flashes wrong content during load
const { hasPermission } = usePermissions();
return hasPermission(PERMISSIONS.CUSTOMER_VIEW) ? <Content /> : <Denied />;
```

### ❌ DON'T: Rely on UI Protection Alone

UI checks are for UX only, not security:

```typescript
// ❌ BAD: No API protection
export async function DELETE(req: NextRequest) {
  // Anyone can call this endpoint!
  await db.customer.delete({ where: { id } });
}

// ✅ GOOD: API protection is mandatory
export const DELETE = withPermissions(
  async (req, context) => {
    await db.customer.delete({ where: { id } });
  },
  [PERMISSIONS.CUSTOMER_DELETE]
);
```

### ❌ DON'T: Hardcode Role Checks

Check permissions, not roles:

```typescript
// ❌ BAD: Checking role directly
if (user.role === 'ADMIN') {
  // What if we change admin permissions later?
}

// ✅ GOOD: Check specific permission
if (hasPermission(PERMISSIONS.CUSTOMER_DELETE)) {
  // Works regardless of role changes
}
```

---

## Troubleshooting

### Issue 1: Permission Check Always Returns False

**Symptom**: `hasPermission()` always returns `false` even though you have the permission.

**Solution**: Check the permission is loading first:

```typescript
const { hasPermission, loading, permissions } = usePermissions();

console.log('Loading:', loading);
console.log('Permissions:', permissions);
console.log('Has permission:', hasPermission(PERMISSIONS.CUSTOMER_VIEW));

if (loading) {
  return <div>Loading permissions...</div>;
}
```

### Issue 2: API Returns 403 Forbidden

**Symptom**: API route returns 403 even though you should have access.

**Debug Steps**:

1. Check your role has the permission:
```sql
-- In Prisma Studio or psql
SELECT r.name, p.key 
FROM roles r
JOIN _RolePermissions rp ON r.id = rp."A"
JOIN permissions p ON rp."B" = p.id
WHERE r."companyId" = 'your-company-id';
```

2. Verify user is assigned the role:
```sql
SELECT uc.*, r.name as role_name
FROM "UserCompany" uc
LEFT JOIN roles r ON uc."roleId" = r.id
WHERE uc."userId" = 'your-user-id';
```

3. Check the API middleware logs in terminal

### Issue 3: PermissionGuard Shows Nothing

**Symptom**: `<PermissionGuard>` component doesn't render children or fallback.

**Solution**: You must specify either `permission` or `permissions`:

```typescript
// ❌ BAD: No permission specified
<PermissionGuard>
  <Content />
</PermissionGuard>

// ✅ GOOD: Permission specified
<PermissionGuard permission="customer:view">
  <Content />
</PermissionGuard>

// ✅ GOOD: Multiple permissions
<PermissionGuard permissions={['customer:view', 'customer:create']} mode="any">
  <Content />
</PermissionGuard>
```

### Issue 4: Permissions Not Updating After Role Change

**Symptom**: User permissions don't update immediately after role change.

**Solution**: Permissions are cached for 5 minutes. Force refetch:

```typescript
import { useQueryClient } from '@tanstack/react-query';

function UpdateRoleButton() {
  const queryClient = useQueryClient();
  
  const handleRoleUpdate = async () => {
    await updateUserRole(userId, newRoleId);
    
    // Invalidate permissions cache
    queryClient.invalidateQueries({ queryKey: ['permissions'] });
  };
  
  return <button onClick={handleRoleUpdate}>Update Role</button>;
}
```

---

## Next Steps

- **[Customizing Permissions](./CUSTOMIZING_PERMISSIONS.md)** - Add your own permissions
- **[Team Management Guide](./EXTENDING_TEAM_MANAGEMENT.md)** - Manage roles and users
- **[API Reference](../core/api-reference.md)** - Complete API documentation

---

**Need Help?** 
- 📖 [RBAC Specification](../core/architecture/rbac-spec.md) - Deep technical details
- 💬 [GitHub Discussions](https://github.com/your-org/saastastic/discussions)
- 📧 [Email Support](mailto:support@saastastic.com)

---

*Last updated: October 8, 2025*
