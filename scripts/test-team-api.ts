/**
 * Test Team API Response
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTeamAPI() {
  const userId = 'user_32sB19ZNfcF9bCrgNztf0ZW33m7';
  const companyId = 'cmfrqoy6i0000mszkkth84pg1';
  
  console.log('🧪 TESTING TEAM API');
  console.log('User ID:', userId);
  console.log('Company ID:', companyId);
  console.log('=====================================\n');

  try {
    // Test the exact query from RoleService.getTeamMembers
    console.log('1. Testing UserCompany lookup...');
    const userCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    console.log('UserCompany result:', userCompany);

    if (!userCompany) {
      console.log('❌ User is not a member of this company');
      return;
    }

    console.log('✅ User is a member with role:', userCompany.role);

    // Test the team members query
    console.log('\n2. Testing team members query...');
    const members = await prisma.userCompany.findMany({
      where: {
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        {
          role: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    console.log('Raw members result:', JSON.stringify(members, null, 2));

    // Transform like the service does
    const transformedMembers = members.map((member) => ({
      id: member.user.id,
      email: member.user.email,
      name: member.user.name,
      role: member.role,
      joinedAt: member.createdAt,
    }));

    console.log('\n3. Transformed members:');
    console.log(JSON.stringify(transformedMembers, null, 2));

    console.log('\n✅ Team API should return:', transformedMembers.length, 'members');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testTeamAPI();
}
