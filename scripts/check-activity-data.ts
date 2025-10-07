/**
 * Check Activity Data
 * 
 * Debug which company has activities and what the current state is
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkActivities() {
  try {
    console.log('🔍 Checking activity data...');
    
    // Check all companies
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { eventLogs: true }
        }
      }
    });
    
    console.log('📊 Companies and their activity counts:');
    for (const company of companies) {
      console.log(`   ${company.name} (${company.slug}): ${company._count.eventLogs} activities`);
    }
    
    // Check recent activities
    const recentActivities = await prisma.eventLog.findMany({
      include: {
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\n📝 Recent activities:');
    for (const activity of recentActivities) {
      console.log(`   ${activity.action} by ${activity.user?.email} in company ${activity.companyId} at ${activity.createdAt}`);
    }
    
    // Check if "abc company" exists
    const abcCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { contains: 'abc', mode: 'insensitive' } },
          { slug: { contains: 'abc', mode: 'insensitive' } }
        ]
      }
    });
    
    if (abcCompany) {
      console.log(`\n🏢 Found ABC company: ${abcCompany.name} (ID: ${abcCompany.id})`);
      
      const abcActivities = await prisma.eventLog.count({
        where: { companyId: abcCompany.id }
      });
      
      console.log(`   Activities for ABC company: ${abcActivities}`);
    } else {
      console.log('\n❌ No ABC company found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivities();
