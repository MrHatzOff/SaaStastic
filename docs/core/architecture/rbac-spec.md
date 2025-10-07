# 🔐 RBAC System Technical Specification

_Last updated: 2025-09-27_

## 1. Overview

This document outlines the production RBAC implementation that now ships with SaaStastic. The system relies on Clerk authentication, Prisma models, and shared libraries under `src/shared/lib/` and `src/shared/hooks/` to deliver 29 granular permissions, system roles, and multi-layer enforcement.

## 2. Core Components

### 2.1 Database Schema

```prisma
// prisma/schema.prisma (excerpt)

model Permission {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  description String?
  category    String
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  roles       RoleModel[] @relation("RolePermissions")

  @@index([category])
  @@index([isSystem])
  @@map("permissions")
}

model RoleModel {
  id          String   @id @default(cuid())
  name        String
  description String?
  isSystem    Boolean  @default(false)
  companyId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  company     Company     @relation(fields: [companyId], references: [id], onDelete: Cascade)
  permissions Permission[] @relation("RolePermissions")
  userCompanies UserCompany[]
  invitations UserInvitation[] @relation("InvitationRole")

  @@unique([name, companyId])
  @@index([companyId])
  @@map("roles")
}

model UserCompany {
  id        String   @id @default(cuid())
  userId    String
  companyId String
  roleId    String?
  role      Role     @default(MEMBER) // legacy enum

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  roleRef   RoleModel? @relation(fields: [roleId], references: [id], onDelete: SetNull)

  @@unique([userId, companyId])
  @@index([companyId])
  @@index([roleId])
}
```

### 2.2 Standard Roles & Permissions

Permissions live in `src/shared/lib/permissions.ts` and are grouped for UI display. Highlights:

| Category | Permissions |
| --- | --- |
| Organization | `org:view`, `org:update`, `org:delete`, `org:settings` |
| Billing | `billing:view`, `billing:update`, `billing:portal`, `billing:invoices` |
| Team | `team:view`, `team:invite`, `team:remove`, `team:role:update`, `team:settings` |
| Customers | `customer:create`, `customer:view`, `customer:update`, `customer:delete`, `customer:export` |
| API | `api_key:create`, `api_key:view`, `api_key:delete` |
| System (future admin surface) | `system:logs`, `system:health`, `system:impersonate` |
| Roles | `role:create`, `role:view`, `role:update`, `role:delete`, `role:assign` |

`DEFAULT_ROLE_PERMISSIONS` maps these 29 permissions into system roles seeded per tenant:

- **Owner**: Receives every permission value (`...Object.values(PERMISSIONS)`).
- **Admin**: Full organization, billing, team, customer, API, and role management minus destructive operations (`org:delete`, admin-only system perms).
- **Member**: Read/write customer operations, read-only organization/billing/team, may create customers.
- **Viewer**: Read-only access across organization, billing, team, customers, and roles.

The seed script (`scripts/seed-rbac.ts`) assigns these roles to every existing tenant and migrates legacy enum roles into the new model.

## 3. API Implementation

### 3.1 Permission Middleware

API enforcement lives in `src/shared/lib/rbac-middleware.ts` and wraps handlers with Clerk-authenticated context:

```typescript
import { PERMISSIONS, type Permission } from '@/shared/lib/permissions';
import { withPermissions } from '@/shared/lib/rbac-middleware';

export const POST = withPermissions(async (req, context) => {
  const payload = await req.json();
  const result = await db.customer.create({
    data: {
      ...payload,
      companyId: context.companyId,
      createdBy: context.userId,
    },
  });

  return NextResponse.json({ success: true, data: result });
}, [PERMISSIONS.CUSTOMER_CREATE]);
```

`withPermissions` performs the following:

- Retrieves the authenticated user via `auth()` from `@clerk/nextjs/server`.
- Resolves `companyId` from the `x-company-id` header or query string.
- Fetches the user’s `UserCompany` record, linking the `roleRef` and eager-loading its permissions.
- Falls back to enum roles (`UserCompany.role`) during migration to avoid lockouts.
- Verifies every `requiredPermission` before invoking the handler.
- Injects an `AuthenticatedContext` containing `user`, `company`, `permissions`, and IDs.

### 3.2 Usage in API Routes

Combine `withPermissions` with `withApiMiddleware` for validation, rate limiting, and CSRF enforcement:

```typescript
export const POST = withApiMiddleware(
  withPermissions(handler, [PERMISSIONS.CUSTOMER_CREATE]),
  {
    requireAuth: true,
    requireCompany: true,
    validateSchema: customerSchema,
  }
);
```

## 4. Frontend Integration

### 4.1 Permission Hooks

`src/shared/hooks/use-permissions.ts` fetches permissions via React Query and the `/api/users/permissions` endpoint (protected by `withPermissions` sans requirements):

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useCompany } from '@/core/auth/company-provider';
import { PERMISSIONS, type Permission } from '@/shared/lib/permissions';
import { useQuery } from '@tanstack/react-query';

export function usePermissions() {
  const { user, isLoaded } = useUser();
  const { currentCompany } = useCompany();

  const {
    data: permissions = [],
    isLoading,
  } = useQuery({
    queryKey: ['permissions', user?.id, currentCompany?.id],
    queryFn: () => fetchPermissions(currentCompany!.id),
    enabled: isLoaded && !!user && !!currentCompany?.id,
    staleTime: 5 * 60 * 1000,
  });

  const hasPermission = (permission: Permission) => permissions.includes(permission);
  const hasAnyPermission = (required: Permission[]) => required.some(hasPermission);
  const hasAllPermissions = (required: Permission[]) => required.every(hasPermission);

  return {
    permissions,
    loading: isLoading || !isLoaded,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    PERMISSIONS,
  };
}
```

### 4.2 Protected Components

```tsx
import { PermissionGuard } from '@/shared/components/permission-guard';
import { PERMISSIONS } from '@/shared/lib/permissions';

<PermissionGuard permission={PERMISSIONS.TEAM_REMOVE} fallback={null}>
  <ConfirmRemoveButton memberId={member.id} />
</PermissionGuard>
```

Specialized guards such as `TeamManagementGuard` and `BillingGuard` wrap common permission bundles.

## 5. Migration Plan

### 5.1 Database Migrations

Migration files under `prisma/migrations/20240924164507_enable_rbac/` (timestamp may vary) introduce the new tables. Key points:

- Creates `permissions`, `roles`, and the `_RolePermissions` join table.
- Adds `roleId` to `user_companies` and `user_invitations` with `SetNull` semantics.
- Seeds default roles and permissions via `scripts/seed-rbac.ts` immediately after migration.

### 5.2 Data Migration

`scripts/seed-rbac.ts` performs the following in order:

1. Upserts every permission defined in `PERMISSION_DEFINITIONS`.
2. Creates/updates system roles (Owner/Admin/Member/Viewer) per tenant.
3. Reconciles existing `UserCompany` rows by mapping legacy enum roles to the new role IDs.
4. Prints counts for auditing and can be safely rerun.

## 6. Testing Strategy

### 6.1 Unit Tests
- Validate `withPermissions` error branches using mocked contexts.
- Test `getUserPermissions()` and `hasPermission()` helpers against seeded fixtures.

### 6.2 Integration Tests
- Exercise RBAC-protected API routes with users assigned to each system role.
- Verify `POST /api/users/team/[memberId]/role` enforces `team:role:update`.

### 6.3 E2E Tests
- Cover invite → accept → role change flows in Playwright.
- Confirm UI hides destructive actions when permissions are missing (e.g., remove member button).

## 7. Security Considerations

1. **Permission Escalation**
   - Only users with `role:assign` may change roles or issue invitations.
   - Invitation flows enforce permissions server-side before creating tokens.

2. **Audit Logging**
   - `EventLog` captures role changes and removals with `companyId`, `userId`, and metadata.
   - Future admin portal work will surface these logs.

3. **Rate Limiting**
   - RBAC endpoints inherit rate limiting via `withApiMiddleware`.
   - Recommend Upstash or similar for distributed deployments.

## 8. Future Enhancements

1. **Custom Roles**
   - Allow admins to create custom roles
   - UI for managing role permissions

2. **Resource-Level Permissions**
   - Fine-grained access control
   - Team/department-based permissions

3. **Temporary Permissions**
   - Time-based access
   - Approval workflows

## 9. Rollout Plan

1. **Phase 1: Core Implementation** (Complete)
   - Database schema + migrations
   - `withPermissions` middleware + shared helpers
   - Default roles and permissions seeded automatically

2. **Phase 2: Management UI** (Complete)
   - Team members list with role badges and actions
   - Invitation modal with role pickers
   - Activity dashboard summarizing RBAC events

3. **Phase 3: Advanced Features** (Planned)
   - Custom role builder UI
   - System impersonation & audit tooling
   - Admin support portal surface

## 10. Rollback Plan

1. **Database Rollback**
   - Use `prisma migrate reset` in development; restore backups in production prior to downgrade.
   - Re-running the seed script after restore ensures role-permission integrity.

2. **Code Rollback**
   - Keep RBAC gate usage behind feature flags when introducing new permissions.
   - Maintain backward compatibility by preserving legacy enum roles until all tenants migrate.

---
*Last Updated: 2025-09-22*
