# ⚙️ Customizing Permissions Guide

**Learn how to add custom permissions for your features and modify role assignments in SaaStastic.**

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Adding New Permissions](#adding-new-permissions)
3. [Assigning Permissions to Roles](#assigning-permissions-to-roles)
4. [Creating Custom Roles](#creating-custom-roles)
5. [Database Seeding](#database-seeding)
6. [Testing Your Permissions](#testing-your-permissions)
7. [Real-World Examples](#real-world-examples)
8. [Best Practices](#best-practices)

---

## Introduction

### When to Add Custom Permissions

Add custom permissions when you're building features that:
- ✅ Need fine-grained access control
- ✅ Should be available to some roles but not others
- ✅ Involve sensitive data or operations
- ✅ Will be toggled on/off for different customers

### Permission Naming Convention

Follow the pattern: `resource:action`

```typescript
// ✅ GOOD: Clear, follows pattern
'project:create'
'document:export'
'report:generate'

// ❌ BAD: Unclear, doesn't follow pattern
'add_project'
'documentExport'
'reports'
```

---

## Adding New Permissions

### Step 1: Define Permission Constants

Add your permissions to `src/shared/lib/permissions.ts`:

```typescript
// src/shared/lib/permissions.ts
export const PERMISSIONS = {
  // ... existing permissions ...
  
  // Project Management (your new feature)
  PROJECT_CREATE: 'project:create',
  PROJECT_VIEW: 'project:view',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ARCHIVE: 'project:archive',
  PROJECT_EXPORT: 'project:export',
  
  // Document Management
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_SHARE: 'document:share',
  DOCUMENT_DELETE: 'document:delete',
} as const;
```

### Step 2: Add Permission Metadata

Add descriptions for your permissions:

```typescript
// src/shared/lib/permissions.ts
export const PERMISSION_DEFINITIONS: Record<Permission, {
  name: string;
  description: string;
  category: PermissionCategory;
  isSystem?: boolean;
}> = {
  // ... existing definitions ...
  
  // Your new permissions
  [PERMISSIONS.PROJECT_CREATE]: {
    name: 'Create Projects',
    description: 'Create new projects in the workspace',
    category: PERMISSION_CATEGORIES.PROJECTS, // You'll need to add this category
  },
  [PERMISSIONS.PROJECT_VIEW]: {
    name: 'View Projects',
    description: 'View project details and status',
    category: PERMISSION_CATEGORIES.PROJECTS,
  },
  [PERMISSIONS.PROJECT_UPDATE]: {
    name: 'Update Projects',
    description: 'Edit project details and settings',
    category: PERMISSION_CATEGORIES.PROJECTS,
  },
  [PERMISSIONS.PROJECT_DELETE]: {
    name: 'Delete Projects',
    description: 'Permanently delete projects',
    category: PERMISSION_CATEGORIES.PROJECTS,
  },
  [PERMISSIONS.PROJECT_ARCHIVE]: {
    name: 'Archive Projects',
    description: 'Archive completed or inactive projects',
    category: PERMISSION_CATEGORIES.PROJECTS,
  },
  [PERMISSIONS.PROJECT_EXPORT]: {
    name: 'Export Projects',
    description: 'Export project data to CSV or PDF',
    category: PERMISSION_CATEGORIES.PROJECTS,
  },
};
```

### Step 3: Add Permission Category (if needed)

If you're adding a new category:

```typescript
// src/shared/lib/permissions.ts
export const PERMISSION_CATEGORIES = {
  ORGANIZATION: 'Organization',
  BILLING: 'Billing',
  TEAM: 'Team',
  CUSTOMERS: 'Customers',
  API: 'API',
  SYSTEM: 'System',
  ROLES: 'Roles',
  
  // Your new categories
  PROJECTS: 'Projects',
  DOCUMENTS: 'Documents',
} as const;
```

---

## Assigning Permissions to Roles

### Step 4: Update Default Role Permissions

Assign your permissions to the appropriate roles:

```typescript
// src/shared/lib/permissions.ts
export const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: [
    // Full access to everything (existing + new)
    ...Object.values(PERMISSIONS),
  ],
  
  ADMIN: [
    // ... existing admin permissions ...
    
    // Add project permissions for admins
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_ARCHIVE,
    PERMISSIONS.PROJECT_EXPORT,
    
    // Documents (all except delete)
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_SHARE,
  ],
  
  MEMBER: [
    // ... existing member permissions ...
    
    // Members can view and create projects
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_UPDATE, // Can update their own
    
    // Documents (read and create)
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_CREATE,
  ],
  
  VIEWER: [
    // ... existing viewer permissions ...
    
    // Viewers can only view
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
  ],
} as const;
```

---

## Creating Custom Roles

### Creating a Role via API

You can create custom roles with specific permission sets:

```typescript
// Example: Create a "Project Manager" role
const response = await fetch('/api/roles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-company-id': companyId,
  },
  body: JSON.stringify({
    name: 'Project Manager',
    description: 'Manages projects but no billing or team access',
    permissions: [
      'org:view',
      'project:create',
      'project:view',
      'project:update',
      'project:delete',
      'project:archive',
      'project:export',
      'document:create',
      'document:view',
      'document:share',
      'customer:view',
    ],
  }),
});

const role = await response.json();
```

### Creating a Role Programmatically

```typescript
// src/lib/actions/roles.ts
import { db } from '@/core/db/client';
import { PERMISSIONS } from '@/shared/lib/permissions';

export async function createProjectManagerRole(companyId: string) {
  // Create the role
  const role = await db.roleModel.create({
    data: {
      name: 'Project Manager',
      slug: 'project-manager',
      description: 'Manages projects and documents',
      companyId,
      isSystem: false, // Custom role
    },
  });
  
  // Get permission IDs
  const permissionKeys = [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_ARCHIVE,
    PERMISSIONS.PROJECT_EXPORT,
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_SHARE,
    PERMISSIONS.CUSTOMER_VIEW,
  ];
  
  const permissions = await db.permission.findMany({
    where: {
      key: { in: permissionKeys },
    },
  });
  
  // Connect permissions to role
  await db.roleModel.update({
    where: { id: role.id },
    data: {
      permissions: {
        connect: permissions.map(p => ({ id: p.id })),
      },
    },
  });
  
  return role;
}
```

---

## Database Seeding

### Step 5: Update Permission Seed Script

Add your new permissions to the database:

```typescript
// scripts/seed-rbac.ts
import { db } from '@/core/db/client';
import { PERMISSIONS, PERMISSION_DEFINITIONS } from '@/shared/lib/permissions';

async function seedPermissions() {
  console.log('🔐 Seeding permissions...');
  
  // Get all permission keys
  const permissionKeys = Object.values(PERMISSIONS);
  
  for (const key of permissionKeys) {
    const definition = PERMISSION_DEFINITIONS[key];
    
    await db.permission.upsert({
      where: { key },
      create: {
        key,
        name: definition.name,
        description: definition.description,
        category: definition.category,
        isSystem: definition.isSystem || false,
      },
      update: {
        name: definition.name,
        description: definition.description,
        category: definition.category,
        isSystem: definition.isSystem || false,
      },
    });
  }
  
  console.log(`✅ Seeded ${permissionKeys.length} permissions`);
}

// Run the seed
seedPermissions().catch(console.error);
```

### Step 6: Run the Seed Script

```bash
# Seed permissions into database
npx tsx scripts/seed-rbac.ts

# Or use npm script if configured
npm run db:seed
```

### Step 7: Update Existing Companies

If you have existing companies, update their roles:

```typescript
// scripts/update-role-permissions.ts
import { db } from '@/core/db/client';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '@/shared/lib/permissions';

async function updateExistingRoles() {
  // Get all companies
  const companies = await db.company.findMany();
  
  for (const company of companies) {
    console.log(`Updating roles for company: ${company.name}`);
    
    // Get system roles for this company
    const ownerRole = await db.roleModel.findFirst({
      where: { companyId: company.id, slug: 'system-owner' },
    });
    
    const adminRole = await db.roleModel.findFirst({
      where: { companyId: company.id, slug: 'system-admin' },
    });
    
    // Get new permissions
    const newProjectPermissions = await db.permission.findMany({
      where: {
        key: {
          in: [
            PERMISSIONS.PROJECT_CREATE,
            PERMISSIONS.PROJECT_VIEW,
            PERMISSIONS.PROJECT_UPDATE,
            PERMISSIONS.PROJECT_DELETE,
          ],
        },
      },
    });
    
    // Update owner role (add all permissions)
    if (ownerRole) {
      await db.roleModel.update({
        where: { id: ownerRole.id },
        data: {
          permissions: {
            connect: newProjectPermissions.map(p => ({ id: p.id })),
          },
        },
      });
    }
    
    // Update admin role
    if (adminRole) {
      await db.roleModel.update({
        where: { id: adminRole.id },
        data: {
          permissions: {
            connect: newProjectPermissions.map(p => ({ id: p.id })),
          },
        },
      });
    }
  }
  
  console.log('✅ Updated all company roles');
}

updateExistingRoles().catch(console.error);
```

---

## Testing Your Permissions

### Test in API Routes

```typescript
// src/app/api/projects/route.ts
import { withPermissions, PERMISSIONS } from '@/shared/lib';

// Test your new permission
export const POST = withPermissions(
  async (req, context) => {
    const { companyId, userId } = context;
    const data = await req.json();
    
    const project = await db.project.create({
      data: {
        ...data,
        companyId,
        createdBy: userId,
      },
    });
    
    return NextResponse.json({ project });
  },
  [PERMISSIONS.PROJECT_CREATE] // Your new permission!
);
```

### Test in UI Components

```typescript
// src/components/project-list.tsx
import { usePermissions } from '@/shared/hooks/use-permissions';
import { PermissionGuard } from '@/shared/components/permission-guard';

export function ProjectList() {
  const { hasPermission, PERMISSIONS } = usePermissions();
  
  return (
    <div>
      <h1>Projects</h1>
      
      {/* Test your permission */}
      <PermissionGuard permission={PERMISSIONS.PROJECT_CREATE}>
        <button>New Project</button>
      </PermissionGuard>
      
      {/* Conditional rendering */}
      {hasPermission(PERMISSIONS.PROJECT_EXPORT) && (
        <button>Export All</button>
      )}
    </div>
  );
}
```

### Test Script

Create a test script to verify permissions:

```typescript
// scripts/test-permissions.ts
import { db } from '@/core/db/client';
import { PERMISSIONS } from '@/shared/lib/permissions';

async function testPermissions() {
  const testUserId = 'user_123';
  const testCompanyId = 'company_456';
  
  // Get user's role and permissions
  const userCompany = await db.userCompany.findFirst({
    where: { userId: testUserId, companyId: testCompanyId },
    include: {
      roleRef: {
        include: { permissions: true },
      },
    },
  });
  
  if (!userCompany?.roleRef) {
    console.log('❌ User has no role assigned');
    return;
  }
  
  const userPermissions = userCompany.roleRef.permissions.map(p => p.key);
  
  console.log(`\n👤 User: ${testUserId}`);
  console.log(`🏢 Company: ${testCompanyId}`);
  console.log(`👔 Role: ${userCompany.roleRef.name}`);
  console.log(`🔐 Permissions: ${userPermissions.length}\n`);
  
  // Test specific permissions
  const testsToRun = [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_EXPORT,
  ];
  
  testsToRun.forEach(permission => {
    const has = userPermissions.includes(permission);
    const emoji = has ? '✅' : '❌';
    console.log(`${emoji} ${permission}: ${has}`);
  });
}

testPermissions().catch(console.error);
```

Run it:

```bash
npx tsx scripts/test-permissions.ts
```

---

## Real-World Examples

### Example 1: Blog/Content Management

```typescript
// Add blog permissions
export const PERMISSIONS = {
  // ... existing ...
  
  // Blog Management
  BLOG_POST_CREATE: 'blog:post:create',
  BLOG_POST_PUBLISH: 'blog:post:publish',
  BLOG_POST_DELETE: 'blog:post:delete',
  BLOG_COMMENT_MODERATE: 'blog:comment:moderate',
} as const;

// Assign to roles
export const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: [...allPermissions],
  ADMIN: [
    // ...
    PERMISSIONS.BLOG_POST_CREATE,
    PERMISSIONS.BLOG_POST_PUBLISH,
    PERMISSIONS.BLOG_POST_DELETE,
    PERMISSIONS.BLOG_COMMENT_MODERATE,
  ],
  MEMBER: [
    // Members can write but not publish
    PERMISSIONS.BLOG_POST_CREATE,
  ],
  VIEWER: [
    // Viewers can only read (no special permission needed)
  ],
};
```

### Example 2: File Management

```typescript
// Add file permissions
export const PERMISSIONS = {
  // ... existing ...
  
  // File Management
  FILE_UPLOAD: 'file:upload',
  FILE_DOWNLOAD: 'file:download',
  FILE_DELETE: 'file:delete',
  FILE_SHARE_EXTERNAL: 'file:share:external',
} as const;

// Different sharing rules per role
export const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: [...allPermissions],
  ADMIN: [
    // ...
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_DOWNLOAD,
    PERMISSIONS.FILE_DELETE,
    PERMISSIONS.FILE_SHARE_EXTERNAL,
  ],
  MEMBER: [
    // Can upload and download, but not delete or share externally
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_DOWNLOAD,
  ],
  VIEWER: [
    // Can only download
    PERMISSIONS.FILE_DOWNLOAD,
  ],
};
```

### Example 3: Analytics/Reporting

```typescript
// Add analytics permissions
export const PERMISSIONS = {
  // ... existing ...
  
  // Analytics
  ANALYTICS_VIEW_BASIC: 'analytics:view:basic',
  ANALYTICS_VIEW_DETAILED: 'analytics:view:detailed',
  ANALYTICS_EXPORT: 'analytics:export',
  ANALYTICS_CREATE_DASHBOARD: 'analytics:dashboard:create',
} as const;

// Progressive access
export const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: [...allPermissions],
  ADMIN: [
    // ...
    PERMISSIONS.ANALYTICS_VIEW_BASIC,
    PERMISSIONS.ANALYTICS_VIEW_DETAILED,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.ANALYTICS_CREATE_DASHBOARD,
  ],
  MEMBER: [
    // Basic analytics only
    PERMISSIONS.ANALYTICS_VIEW_BASIC,
  ],
  VIEWER: [
    // Very limited analytics
    PERMISSIONS.ANALYTICS_VIEW_BASIC,
  ],
};
```

---

## Best Practices

### ✅ DO: Be Specific with Permissions

```typescript
// ✅ GOOD: Specific permissions
PERMISSIONS.PROJECT_ARCHIVE = 'project:archive'
PERMISSIONS.PROJECT_DELETE = 'project:delete'

// ❌ BAD: Too broad
PERMISSIONS.PROJECT_MANAGE = 'project:manage' // What does "manage" mean?
```

### ✅ DO: Document Permission Purpose

```typescript
// ✅ GOOD: Clear description
[PERMISSIONS.PROJECT_ARCHIVE]: {
  name: 'Archive Projects',
  description: 'Move completed projects to archive. Projects can be restored later.',
  category: PERMISSION_CATEGORIES.PROJECTS,
}

// ❌ BAD: Vague description
[PERMISSIONS.PROJECT_ARCHIVE]: {
  name: 'Archive',
  description: 'Archive things',
  category: PERMISSION_CATEGORIES.PROJECTS,
}
```

### ✅ DO: Think About Permission Hierarchy

```typescript
// ✅ GOOD: Logical hierarchy
// To delete, you need both view and delete permissions
if (hasPermission(PERMISSIONS.PROJECT_VIEW) && 
    hasPermission(PERMISSIONS.PROJECT_DELETE)) {
  // Show delete button
}

// Make sense: Can't delete what you can't see
```

### ❌ DON'T: Create Too Many Permissions

```typescript
// ❌ BAD: Too granular
PERMISSIONS.PROJECT_UPDATE_NAME = 'project:update:name'
PERMISSIONS.PROJECT_UPDATE_DESCRIPTION = 'project:update:description'
PERMISSIONS.PROJECT_UPDATE_DEADLINE = 'project:update:deadline'

// ✅ GOOD: One permission for related actions
PERMISSIONS.PROJECT_UPDATE = 'project:update'
```

### ✅ DO: Consider Future Expansion

```typescript
// ✅ GOOD: Room for growth
PERMISSIONS.DOCUMENT_VIEW = 'document:view'
PERMISSIONS.DOCUMENT_CREATE = 'document:create'
PERMISSIONS.DOCUMENT_UPDATE = 'document:update'
PERMISSIONS.DOCUMENT_DELETE = 'document:delete'
// Later: PERMISSIONS.DOCUMENT_VERSION = 'document:version'
// Later: PERMISSIONS.DOCUMENT_COMMENT = 'document:comment'
```

---

## Next Steps

- **[RBAC Usage Guide](./RBAC_USAGE.md)** - How to use permissions in your code
- **[Team Management](./EXTENDING_TEAM_MANAGEMENT.md)** - Manage roles and users
- **[Database Schema](../../prisma/schema.prisma)** - See how permissions are stored

---

**Need Help?** 
- 📖 [Permission System Reference](../core/architecture/rbac-spec.md)
- 💬 [GitHub Discussions](https://github.com/your-org/saastastic/discussions)
- 📧 [Email Support](mailto:support@saastastic.com)

---

*Last updated: October 8, 2025*
