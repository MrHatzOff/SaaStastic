/**
 * Debug Company Context Issue
 * 
 * Investigate why user is suddenly in "ABC company" and bulk dialog appears
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCompanyContext() {
  const userId = 'user_32sB19ZNfcF9bCrgNztf0ZW33m7';
  
  console.log('🔍 DEBUGGING COMPANY CONTEXT ISSUE');
  console.log('User ID:', userId);
  console.log('=====================================\n');

  // 1. Check all companies in database
  console.log('📊 ALL COMPANIES IN DATABASE:');
  const allCompanies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  
  allCompanies.forEach((company, index) => {
    console.log(`  ${index + 1}. ${company.name} (${company.id})`);
    console.log(`     Slug: ${company.slug}`);
    console.log(`     Created: ${company.createdAt}`);
    console.log('');
  });

  // 2. Check user's company relationships
  console.log('👤 USER COMPANY RELATIONSHIPS:');
  const userCompanies = await prisma.userCompany.findMany({
    where: { userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (userCompanies.length === 0) {
    console.log('  ❌ NO COMPANY RELATIONSHIPS FOUND!');
  } else {
    userCompanies.forEach((uc, index) => {
      console.log(`  ${index + 1}. ${uc.company.name} (${uc.company.id})`);
      console.log(`     Role: ${uc.role}`);
      console.log(`     Joined: ${uc.createdAt}`);
      console.log(`     Role ID: ${uc.roleId || 'None'}`);
      console.log('');
    });
  }

  // 3. Check if there are multiple users in the system
  console.log('👥 ALL USERS IN DATABASE:');
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  allUsers.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.email} (${user.id})`);
    console.log(`     Name: ${user.name || 'None'}`);
    console.log(`     Created: ${user.createdAt}`);
    console.log('');
  });

  // 4. Check roles for the user's company
  console.log('🔐 ROLES IN USER\'S COMPANY:');
  if (userCompanies.length > 0) {
    const companyId = userCompanies[0].company.id;
    const roles = await prisma.roleModel.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        isSystem: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    roles.forEach((role: any, index: number) => {
      console.log(`  ${index + 1}. ${role.name} (${role.id})`);
      console.log(`     System: ${role.isSystem}`);
      console.log(`     Created: ${role.createdAt}`);
      console.log('');
    });
  }

  // 5. Check team members in the company
  console.log('👥 TEAM MEMBERS IN COMPANY:');
  if (userCompanies.length > 0) {
    const companyId = userCompanies[0].company.id;
    const teamMembers = await prisma.userCompany.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    teamMembers.forEach((member, index) => {
      console.log(`  ${index + 1}. ${member.user.email} (${member.user.id})`);
      console.log(`     Name: ${member.user.name || 'None'}`);
      console.log(`     Role: ${member.role}`);
      console.log(`     Current User: ${member.userId === userId ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
  }

  console.log('🎯 ANALYSIS:');
  console.log(`Total Companies: ${allCompanies.length}`);
  console.log(`User's Companies: ${userCompanies.length}`);
  console.log(`Total Users: ${allUsers.length}`);
  
  if (userCompanies.length > 1) {
    console.log('⚠️  WARNING: User belongs to multiple companies!');
    console.log('   This could cause company context switching issues.');
  }
  
  if (allCompanies.length > userCompanies.length) {
    console.log('⚠️  WARNING: There are companies the user doesn\'t belong to!');
    console.log('   This confirms the multi-tenant security fix was needed.');
  }
}

async function main() {
  try {
    await debugCompanyContext();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
