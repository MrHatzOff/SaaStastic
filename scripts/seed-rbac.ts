/**
 * RBAC Seed Script
 * 
 * Populates the database with default permissions and roles
 * Run with: npx tsx scripts/seed-rbac.ts
 */

import { PrismaClient } from '@prisma/client';
import { PERMISSION_DEFINITIONS } from '../src/shared/lib/permissions';
import { provisionSystemRolesForCompany } from '../src/core/rbac/provisioner';
import { SYSTEM_ROLE_TEMPLATE_LIST } from '../src/core/rbac/default-roles';

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

async function migrateExistingUsers() {
  console.log('👥 Migrating existing users to RBAC system...');

  // Get all companies
  const companies = await prisma.company.findMany({
    select: { id: true, name: true }
  });

  let migratedCount = 0;

  for (const company of companies) {
    console.log(`Processing company: ${company.name}`);

    // Provision system roles for this company
    const { roles } = await provisionSystemRolesForCompany(company.id, prisma);
    const roleMap = new Map(roles.map(role => [role.slug, role.roleId]));

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
          newRoleId = roleMap.get('system-owner') || null;
          break;
        case 'ADMIN':
          newRoleId = roleMap.get('system-admin') || null;
          break;
        case 'MEMBER':
          newRoleId = roleMap.get('system-member') || null;
          break;
        case 'VIEWER':
          newRoleId = roleMap.get('system-viewer') || null;
          break;
        default:
          newRoleId = roleMap.get('system-member') || null; // Default to Member
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

    // 2. Ensure system roles are provisioned for every company
    const companies = await prisma.company.findMany({ select: { id: true, name: true } });

    for (const company of companies) {
      console.log(`🏢 Provisioning roles for company: ${company.name}`);
      const { roles } = await provisionSystemRolesForCompany(company.id, prisma);

      for (const template of SYSTEM_ROLE_TEMPLATE_LIST) {
        const roleMeta = roles.find((role) => role.slug === template.slug);
        if (!roleMeta?.roleId) {
          throw new Error(`Failed to provision ${template.name} role for company ${company.id}`);
        }
        console.log(`   • ${template.name} → ${roleMeta.roleId}`);
      }
    }

    // 3. Migrate existing users
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
