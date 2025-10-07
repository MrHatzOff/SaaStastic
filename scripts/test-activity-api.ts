/**
 * Test Activity API
 * 
 * Test the /api/audit/activities endpoint to see what's causing the error
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testActivityAPI() {
  try {
    console.log('🧪 Testing Activity API logic...');

    // Find ABC company
    const abcCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { contains: 'abc', mode: 'insensitive' } },
          { slug: { contains: 'abc', mode: 'insensitive' } }
        ]
      }
    });

    if (!abcCompany) {
      console.log('❌ ABC company not found');
      return;
    }

    console.log(`🏢 Testing for company: ${abcCompany.name} (${abcCompany.id})`);

    // Simulate the API query logic
    const now = new Date();
    const dateFilter = new Date();
    dateFilter.setDate(now.getDate() - 7); // Last 7 days

    const whereClause = {
      companyId: abcCompany.id,
      createdAt: {
        gte: dateFilter,
      },
    };

    console.log('📅 Date filter:', dateFilter.toISOString());
    console.log('🔍 Where clause:', JSON.stringify(whereClause, null, 2));

    // Test the query
    const activities = await prisma.eventLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    console.log(`\n📊 Found ${activities.length} activities:`);
    
    for (const activity of activities) {
      console.log(`   • ${activity.action} by ${activity.user?.email} at ${activity.createdAt}`);
    }

    // Test the transformation logic
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.action,
      description: activity.action,
      userId: activity.userId,
      userName: activity.user?.name,
      userEmail: activity.user?.email || 'Unknown',
      companyId: activity.companyId,
      createdAt: activity.createdAt,
      metadata: activity.metadata,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
    }));

    console.log('\n✅ Transformation successful');
    console.log('📦 Sample transformed activity:', JSON.stringify(transformedActivities[0], null, 2));

    // Check user permissions
    const userCompany = await prisma.userCompany.findFirst({
      where: { companyId: abcCompany.id },
      include: {
        roleRef: {
          include: {
            permissions: {
              select: { key: true }
            }
          }
        }
      }
    });

    if (userCompany?.roleRef) {
      const hasSystemLogs = userCompany.roleRef.permissions.some(p => p.key === 'system:logs');
      console.log(`\n🔐 User has SYSTEM_LOGS permission: ${hasSystemLogs ? '✅ YES' : '❌ NO'}`);
      console.log(`   Role: ${userCompany.roleRef.name}`);
      console.log(`   Total permissions: ${userCompany.roleRef.permissions.length}`);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActivityAPI();
