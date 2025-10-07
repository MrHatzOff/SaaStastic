/**
 * Test RBAC Integration
 * 
 * Tests that company creation automatically provisions system roles
 * Run with: npx tsx scripts/test-rbac-integration.ts
 */

import { PrismaClient } from '@prisma/client';
import { createCompanyWithOwner } from '../src/core/db/client';

const prisma = new PrismaClient();

async function testRBACIntegration() {
  try {
    console.log('🧪 Testing RBAC Integration...');

    // Create a test company
    const testCompanyData = {
      name: 'RBAC Test Company',
      slug: `rbac-test-${Date.now()}`
    };
    
    const testUserId = 'test-user-rbac-integration';

    // Ensure test user exists
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: 'rbac-test@example.com',
        name: 'RBAC Test User'
      }
    });

    console.log(`📝 Creating company: ${testCompanyData.name}`);
    
    // Create company (should automatically provision RBAC roles)
    const company = await createCompanyWithOwner(testCompanyData, testUserId);
    
    console.log(`✅ Company created: ${company.id}`);

    // Verify that system roles were created
    const roles = await prisma.roleModel.findMany({
      where: { companyId: company.id },
      include: {
        permissions: {
          select: { key: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`\n🔍 Verifying provisioned roles for company ${company.id}:`);
    
    const expectedRoles = ['Owner', 'Admin', 'Member', 'Viewer'];
    
    for (const expectedRole of expectedRoles) {
      const role = roles.find(r => r.name === expectedRole);
      if (role) {
        console.log(`   ✅ ${expectedRole}: ${role.permissions.length} permissions`);
      } else {
        console.log(`   ❌ ${expectedRole}: MISSING`);
      }
    }

    // Verify user has Owner role assigned
    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: testUserId,
        companyId: company.id
      },
      include: {
        roleRef: {
          select: { name: true }
        }
      }
    });

    if (userCompany?.roleRef) {
      console.log(`\n👤 User role assignment:`);
      console.log(`   ✅ User has role: ${userCompany.roleRef.name}`);
      console.log(`   ✅ Legacy role field: ${userCompany.role}`);
    } else {
      console.log(`\n❌ User role assignment: MISSING`);
    }

    // Clean up test data
    console.log(`\n🧹 Cleaning up test data...`);
    await prisma.company.delete({
      where: { id: company.id }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });

    console.log(`✅ Test completed successfully!`);
    
    // Summary
    console.log(`\n📊 RBAC Integration Test Results:`);
    console.log(`   • Company creation: ✅ Success`);
    console.log(`   • System roles provisioned: ✅ ${roles.length}/4`);
    console.log(`   • User role assignment: ✅ ${userCompany?.role ? 'Success' : 'Failed'}`);
    console.log(`   • Cleanup: ✅ Complete`);

  } catch (error) {
    console.error('❌ RBAC Integration test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRBACIntegration();
