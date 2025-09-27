# 🔐 RBAC System Technical Specification

## 1. Overview

This document outlines the technical implementation of the Role-Based Access Control (RBAC) system for SaaStastic. The system provides fine-grained access control while maintaining simplicity and performance.

## 2. Core Components

### 2.1 Database Schema

```prisma
// prisma/schema.prisma

// Permission Definitions
model Permission {
  id          String   @id @default(cuid())
  key         String   @unique // e.g., 'project:create'
  name        String   // e.g., 'Create Projects'
  description String?
  category    String   // e.g., 'Projects', 'Billing', 'Team'
  
  // System permissions cannot be modified
  isSystem    Boolean  @default(false)
  
  // Relationships
  roles       Role[]
  
  @@map("permissions")
}

// Role Definitions
model Role {
  id          String   @id @default(cuid())
  name        String
  description String?
  isSystem    Boolean  @default(false)
  
  // Relationships
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  permissions Permission[] @relation("RolePermissions")
  teamMembers TeamMember[]
  
  @@unique([name, companyId])
  @@map("roles")
}

// Team Member Assignment
model TeamMember {
  id        String   @id @default(cuid())
  userId    String
  companyId String
  roleId    String
  
  // Relationships
  user      User     @relation(fields: [userId], references: [id])
  company   Company  @relation(fields: [companyId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])
  
  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, companyId])
  @@map("team_members")
}
```

### 2.2 Standard Roles & Permissions

#### System Roles (Predefined)

1. **System Owner**
   - Full access to all features
   - Can manage organization settings
   - Can manage billing
   - Can manage team members and roles

2. **Billing Manager**
   - View and update billing information
   - Download invoices
   - Update payment methods

3. **Team Admin**
   - Invite/remove team members
   - Assign roles (except System Owner)
   - Manage team settings

4. **Developer**
   - Manage API keys
   - View system logs
   - Access developer tools

5. **Member**
   - Basic application access
   - View company resources
   - Limited settings access

#### Standard Permissions

```typescript
// lib/permissions.ts
export const PERMISSIONS = {
  // Organization
  ORG_VIEW: 'org:view',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  
  // Billing
  BILLING_VIEW: 'billing:view',
  BILLING_UPDATE: 'billing:update',
  
  // Team
  TEAM_INVITE: 'team:invite',
  TEAM_REMOVE: 'team:remove',
  TEAM_ROLE_UPDATE: 'team:role:update',
  
  // Projects
  PROJECT_CREATE: 'project:create',
  PROJECT_VIEW: 'project:view',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  
  // API Keys
  API_KEY_CREATE: 'api_key:create',
  API_KEY_VIEW: 'api_key:view',
  API_KEY_DELETE: 'api_key:delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
```

## 3. API Implementation

### 3.1 Permission Middleware

```typescript
// lib/middleware/withPermissions.ts
import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from '@/lib/permissions';

type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export function withPermissions(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  requiredPermissions: Permission[] = []
) {
  return async (req: NextRequest, context: any) => {
    const { user } = context;
    
    // Skip if no permissions required
    if (!requiredPermissions.length) {
      return handler(req, context);
    }
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return handler(req, context);
  };
}
```

### 3.2 Usage in API Routes

```typescript
// app/api/projects/route.ts
import { withApiMiddleware } from '@/lib/middleware/withApiMiddleware';
import { withPermissions } from '@/lib/middleware/withPermissions';
import { PERMISSIONS } from '@/lib/permissions';

export const POST = withApiMiddleware(
  withPermissions(
    async (req: NextRequest, context) => {
      // Your route handler
      return NextResponse.json({ success: true });
    },
    [PERMISSIONS.PROJECT_CREATE] // Required permissions
  )
);
```

## 4. Frontend Integration

### 4.1 Permission Hooks

```typescript
// hooks/usePermissions.ts
import { useSession } from 'next-auth/react';
import { PERMISSIONS } from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  
  const hasPermission = (permission: string): boolean => {
    if (!session?.user?.permissions) return false;
    return session.user.permissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!session?.user?.permissions) return false;
    return permissions.some(p => session.user?.permissions?.includes(p));
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    PERMISSIONS // Export all permissions for easy access
  };
}
```

### 4.2 Protected Components

```tsx
// components/shared/PermissionGuard.tsx
'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

type PermissionGuardProps = {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallback?: ReactNode;
};

export function PermissionGuard({
  children,
  requiredPermission,
  requiredPermissions = [],
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }
  
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
```

## 5. Migration Plan

### 5.1 Database Migrations

```prisma
// prisma/migrations/YYYYMMDD_add_rbac/migration.sql
-- Create permissions table
CREATE TABLE permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create roles table
CREATE TABLE roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "companyId" TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(name, "companyId")
);

-- Create role_permissions join table
CREATE TABLE "_RolePermissions" (
  "A" TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE
);

-- Update team_members table
ALTER TABLE team_members 
ADD COLUMN "roleId" TEXT REFERENCES roles(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX "team_members_role_id_idx" ON team_members("roleId");
CREATE INDEX "_RolePermissions_AB_unique" ON "_RolePermissions"("A", "B");
CREATE INDEX "_RolePermissions_B_index" ON "_RolePermissions"("B");
```

### 5.2 Data Migration

Create a script to:
1. Insert system permissions
2. Create default roles
3. Assign existing users to appropriate roles
4. Migrate any existing permission logic

## 6. Testing Strategy

### 6.1 Unit Tests
- Test permission checks
- Test role assignments
- Test middleware behavior

### 6.2 Integration Tests
- Test API endpoints with different permission sets
- Test role management flows
- Test team member invitations

### 6.3 E2E Tests
- Test complete user flows with different roles
- Test permission boundaries
- Test error states

## 7. Security Considerations

1. **Permission Escalation**
   - Validate role assignments
   - Prevent users from assigning permissions they don't have

2. **Audit Logging**
   - Log all permission changes
   - Track role assignments
   - Monitor permission usage

3. **Rate Limiting**
   - Protect role/permission endpoints
   - Prevent brute force attacks

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

1. **Phase 1: Core Implementation**
   - Database schema
   - Basic RBAC middleware
   - Default roles and permissions

2. **Phase 2: Management UI**
   - Role management
   - Team member management
   - Permission auditing

3. **Phase 3: Advanced Features**
   - Custom roles
   - Resource-level permissions
   - Advanced reporting

## 10. Rollback Plan

1. **Database Rollback**
   - Migration rollback scripts
   - Backup before deployment

2. **Code Rollback**
   - Feature flags
   - Versioned API endpoints

---
*Last Updated: 2025-09-22*
