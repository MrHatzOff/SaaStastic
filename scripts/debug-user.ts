/**
 * Debug User Script
 * 
 * Check user's company associations and permissions
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugUser() {
  const userId = 'user_32sB19ZNfcF9bCrgNztf0ZW33m7';
  
  console.log('🔍 Debugging user:', userId);
  
  // Get user's companies
  const userCompanies = await prisma.userCompany.findMany({
    where: { userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      },
      roleRef: {
        include: {
          permissions: {
            select: {
              key: true,
              name: true,
            }
          }
        }
      }
    }
  });
  
  console.log('\n📊 User Companies:');
  for (const uc of userCompanies) {
    console.log(`\n🏢 Company: ${uc.company.name} (${uc.company.id})`);
    console.log(`   Legacy Role: ${uc.role}`);
    console.log(`   Role ID: ${uc.roleId || 'NOT SET'}`);
    
    if (uc.roleRef) {
      console.log(`   New Role: ${uc.roleRef.name}`);
      console.log(`   Permissions: ${uc.roleRef.permissions.length}`);
      uc.roleRef.permissions.forEach(p => {
        console.log(`     - ${p.key}: ${p.name}`);
      });
    } else {
      console.log('   ❌ No RBAC role assigned');
    }
  }
  
  // Check if there are any roles for the companies
  console.log('\n🔐 Available Roles:');
  const roles = await prisma.roleModel.findMany({
    where: {
      companyId: {
        in: userCompanies.map(uc => uc.companyId)
      }
    },
    select: {
      id: true,
      name: true,
      companyId: true,
      permissions: {
        select: {
          key: true,
        }
      }
    }
  });
  
  for (const role of roles) {
    console.log(`\n📋 Role: ${role.name} (${role.id})`);
    console.log(`   Company: ${role.companyId}`);
    console.log(`   Permissions: ${role.permissions.length}`);
  }
}

async function main() {
  try {
    await debugUser();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
