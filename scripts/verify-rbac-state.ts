/**
 * RBAC State Verification Script
 * 
 * Quickly verify the current state of RBAC in the database
 * Run with: npx tsx scripts/verify-rbac-state.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRBACState() {
  console.log('🔍 Verifying RBAC State...\n');

  try {
    // 1. Check companies and their roles
    console.log('1. 🏢 Company Role Coverage:');
    const companiesWithRoles = await prisma.company.findMany({
      include: {
        roles: {
          where: { isSystem: true },
          select: { name: true, slug: true }
        },
        _count: {
          select: { roles: { where: { isSystem: true } } }
        }
      }
    });

    for (const company of companiesWithRoles) {
      const roleCount = company._count.roles;
      const status = roleCount === 4 ? '✅' : '❌';
      console.log(`   ${status} ${company.name}: ${roleCount}/4 system roles`);
      
      if (roleCount > 0) {
        const roleNames = company.roles.map(r => r.name).join(', ');
        console.log(`      Roles: ${roleNames}`);
      }
    }

    // 2. Check permission assignments per role
    console.log('\n2. 🔐 Role Permission Counts:');
    const rolePermissions = await prisma.roleModel.findMany({
      where: { isSystem: true },
      include: {
        _count: {
          select: { permissions: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const expectedCounts = {
      'Owner': 29,
      'Admin': 25, 
      'Member': 7,
      'Viewer': 5
    };

    for (const role of rolePermissions) {
      const expected = expectedCounts[role.name as keyof typeof expectedCounts] || 0;
      const actual = role._count.permissions;
      const status = actual === expected ? '✅' : '❌';
      console.log(`   ${status} ${role.name}: ${actual}/${expected} permissions`);
    }

    // 3. Check users without roleId
    console.log('\n3. 👥 User Role Assignments:');
    const usersWithoutRoleId = await prisma.userCompany.findMany({
      where: { roleId: null },
      include: {
        user: { select: { email: true } },
        company: { select: { name: true } }
      }
    });

    if (usersWithoutRoleId.length === 0) {
      console.log('   ✅ All users have roleId assigned');
    } else {
      console.log(`   ❌ ${usersWithoutRoleId.length} users missing roleId:`);
      for (const uc of usersWithoutRoleId) {
        console.log(`      • ${uc.user.email} in ${uc.company.name}`);
      }
    }

    // 4. Summary stats
    console.log('\n4. 📊 Summary Statistics:');
    const totalCompanies = await prisma.company.count();
    const totalRoles = await prisma.roleModel.count({ where: { isSystem: true } });
    const totalUsers = await prisma.userCompany.count();
    const usersWithRoles = await prisma.userCompany.count({ where: { roleId: { not: null } } });

    console.log(`   • Companies: ${totalCompanies}`);
    console.log(`   • System Roles: ${totalRoles} (expected: ${totalCompanies * 4})`);
    console.log(`   • Users: ${totalUsers}`);
    console.log(`   • Users with RBAC roles: ${usersWithRoles}/${totalUsers}`);

    // 5. Health check
    console.log('\n5. 🏥 Health Check:');
    const issues = [];
    
    if (totalRoles !== totalCompanies * 4) {
      issues.push(`Missing system roles (expected ${totalCompanies * 4}, got ${totalRoles})`);
    }
    
    if (usersWithoutRoleId.length > 0) {
      issues.push(`${usersWithoutRoleId.length} users missing roleId`);
    }

    const rolesWithWrongPermissions = rolePermissions.filter(role => {
      const expected = expectedCounts[role.name as keyof typeof expectedCounts];
      return expected && role._count.permissions !== expected;
    });

    if (rolesWithWrongPermissions.length > 0) {
      issues.push(`${rolesWithWrongPermissions.length} roles have incorrect permission counts`);
    }

    if (issues.length === 0) {
      console.log('   ✅ RBAC system is healthy!');
    } else {
      console.log('   ❌ Issues detected:');
      issues.forEach(issue => console.log(`      • ${issue}`));
    }

  } catch (error) {
    console.error('❌ Error verifying RBAC state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyRBACState();
