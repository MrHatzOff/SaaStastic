/**
 * Seed Activities for ABC Company
 * 
 * Add sample activities specifically for the "abc company" that the user is viewing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAbcCompanyActivities() {
  try {
    console.log('🌱 Seeding activities for ABC Company...');

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

    // Find a user in this company
    const userCompany = await prisma.userCompany.findFirst({
      where: { companyId: abcCompany.id },
      include: { user: true }
    });

    if (!userCompany) {
      console.log('❌ No user found in ABC company');
      return;
    }

    console.log(`📊 Adding activities for: ${abcCompany.name} (${abcCompany.id})`);
    console.log(`👤 User: ${userCompany.user.email}`);

    // Sample activities for ABC company
    const activities = [
      {
        action: 'user:login',
        userId: userCompany.userId,
        companyId: abcCompany.id,
        metadata: { source: 'web', ip: '192.168.1.100' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'team:role_updated',
        userId: userCompany.userId,
        companyId: abcCompany.id,
        metadata: { targetUser: 'john@abc.com', oldRole: 'MEMBER', newRole: 'ADMIN' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'settings:security_updated',
        userId: userCompany.userId,
        companyId: abcCompany.id,
        metadata: { setting: 'two_factor_auth', enabled: true },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'billing:payment_method_added',
        userId: userCompany.userId,
        companyId: abcCompany.id,
        metadata: { type: 'credit_card', last4: '4242' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'team:member_removed',
        userId: userCompany.userId,
        companyId: abcCompany.id,
        metadata: { removedUser: 'temp@abc.com', reason: 'left_company' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'api:key_generated',
        userId: userCompany.userId,
        companyId: abcCompany.id,
        metadata: { keyName: 'Production API Key', permissions: ['read', 'write'] },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    ];

    // Create activities with different timestamps over the last few days
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - (i * 4)); // Spread over last 24 hours

      await prisma.eventLog.create({
        data: {
          ...activity,
          createdAt,
        }
      });

      console.log(`   ✅ Created: ${activity.action}`);
    }

    console.log(`\n🎉 Successfully created ${activities.length} activities for ABC Company!`);
    
    // Verify the data
    const count = await prisma.eventLog.count({
      where: { companyId: abcCompany.id }
    });
    
    console.log(`📊 Total activities for ${abcCompany.name}: ${count}`);

  } catch (error) {
    console.error('❌ Error seeding ABC company activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAbcCompanyActivities();
