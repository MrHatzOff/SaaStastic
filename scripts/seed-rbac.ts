/**
 * RBAC Seed Script
 * 
 * Populates the database with default permissions and roles
 * Run with: npx tsx scripts/seed-rbac.ts
 */

import { PrismaClient } from '@prisma/client';
import { 
  PERMISSION_DEFINITIONS, 
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS 
} from '../src/shared/lib/permissions';

const prisma = new PrismaClient();

async function seedPermissions() {
  console.log('🔐 Seeding permissions...');

  const permissions = Object.entries(PERMISSION_DEFINITIONS).map(([key, def]) => ({
    key,
    name: def.name,
    description: def.description,
    category: def.category,
    isSystem: def.isSystem || false,
  }));

  // Use upsert to avoid duplicates
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        name: permission.name,
        description: permission.description,
        category: permission.category,
        isSystem: permission.isSystem,
      },
      create: permission,
    });
  }

  console.log(`✅ Created/updated ${permissions.length} permissions`);
  return permissions;
}

async function seedRolesForCompany(companyId: string) {
  console.log(`🏢 Seeding roles for company: ${companyId}`);

  const roleDefinitions = [
    {
      name: 'Owner',
      description: 'Full access to all features and settings',
      isSystem: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.OWNER,
    },
    {
      name: 'Admin', 
      description: 'Administrative access with most permissions',
      isSystem: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.ADMIN,
    },
    {
      name: 'Member',
      description: 'Standard member with basic access',
      isSystem: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.MEMBER,
    },
    {
      name: 'Viewer',
      description: 'Read-only access to most features',
      isSystem: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.VIEWER,
    },
  ];

  const createdRoles = [];

  for (const roleDef of roleDefinitions) {
    // Create or update the role
    const role = await prisma.roleModel.upsert({
      where: {
        name_companyId: {
          name: roleDef.name,
          companyId,
        }
      },
      update: {
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
        companyId,
      },
    });

    // Get permission IDs for this role
    const permissionRecords = await prisma.permission.findMany({
      where: {
        key: {
          in: roleDef.permissions,
        }
      },
      select: { id: true }
    });

    // Connect permissions to role (clear existing first)
    await prisma.roleModel.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: permissionRecords.map(p => ({ id: p.id }))
        }
      }
    });

    createdRoles.push(role);
    console.log(`✅ Created/updated role: ${roleDef.name} with ${roleDef.permissions.length} permissions`);
  }

  return createdRoles;
}

async function migrateExistingUsers() {
  console.log('👥 Migrating existing users to RBAC system...');

  // Get all companies
  const companies = await prisma.company.findMany({
    select: { id: true, name: true }
  });

  let migratedCount = 0;

  for (const company of companies) {
    console.log(`Processing company: ${company.name}`);

    // Seed roles for this company
    const roles = await seedRolesForCompany(company.id);
    const roleMap = new Map(roles.map(r => [r.name, r.id]));

    // Get users in this company who don't have roleId set
    const userCompanies = await prisma.userCompany.findMany({
      where: {
        companyId: company.id,
        roleId: null, // Only migrate users without new role
      },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    for (const userCompany of userCompanies) {
      // Map legacy role to new role
      let newRoleId: string | null = null;
      
      switch (userCompany.role) {
        case 'OWNER':
          newRoleId = roleMap.get('Owner') || null;
          break;
        case 'ADMIN':
          newRoleId = roleMap.get('Admin') || null;
          break;
        case 'MEMBER':
          newRoleId = roleMap.get('Member') || null;
          break;
        case 'VIEWER':
          newRoleId = roleMap.get('Viewer') || null;
          break;
        default:
          newRoleId = roleMap.get('Member') || null; // Default to Member
      }

      if (newRoleId) {
        await prisma.userCompany.update({
          where: { id: userCompany.id },
          data: { roleId: newRoleId }
        });

        migratedCount++;
        console.log(`✅ Migrated user ${userCompany.user.email} from ${userCompany.role} to new RBAC system`);
      }
    }
  }

  console.log(`✅ Migrated ${migratedCount} users to RBAC system`);
}

async function main() {
  try {
    console.log('🚀 Starting RBAC seed process...');

    // 1. Seed all permissions
    await seedPermissions();

    // 2. Migrate existing users
    await migrateExistingUsers();

    console.log('🎉 RBAC seed completed successfully!');
    
    // Show summary
    const permissionCount = await prisma.permission.count();
    const roleCount = await prisma.roleModel.count();
    const userCount = await prisma.userCompany.count({
      where: { roleId: { not: null } }
    });

    console.log('\n📊 Summary:');
    console.log(`   Permissions: ${permissionCount}`);
    console.log(`   Roles: ${roleCount}`);
    console.log(`   Users migrated: ${userCount}`);

  } catch (error) {
    console.error('❌ Error during RBAC seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  main();
}
