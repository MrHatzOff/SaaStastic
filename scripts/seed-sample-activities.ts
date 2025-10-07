/**
 * Seed Sample Activities
 * 
 * Add some sample EventLog records for testing the Activity dashboard
 * Run with: npx tsx scripts/seed-sample-activities.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSampleActivities() {
  try {
    console.log('🌱 Seeding sample activities...');

    // Get the first company and user for testing
    const company = await prisma.company.findFirst();
    const user = await prisma.user.findFirst();

    if (!company || !user) {
      console.log('❌ No company or user found. Please create a company first.');
      return;
    }

    console.log(`📊 Adding activities for company: ${company.name}`);
    console.log(`👤 User: ${user.email}`);

    // Sample activities
    const activities = [
      {
        action: 'user:login',
        userId: user.id,
        companyId: company.id,
        metadata: { source: 'web', ip: '192.168.1.1' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'team:member_invited',
        userId: user.id,
        companyId: company.id,
        metadata: { invitedEmail: 'newuser@example.com', role: 'MEMBER' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'billing:subscription_updated',
        userId: user.id,
        companyId: company.id,
        metadata: { plan: 'pro', previousPlan: 'starter' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'settings:company_updated',
        userId: user.id,
        companyId: company.id,
        metadata: { field: 'name', oldValue: 'Old Name', newValue: company.name },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        action: 'security:password_changed',
        userId: user.id,
        companyId: company.id,
        metadata: { method: 'self_service' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    ];

    // Create activities with different timestamps
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - (i * 2)); // Spread over last 10 hours

      await prisma.eventLog.create({
        data: {
          ...activity,
          createdAt,
        }
      });

      console.log(`   ✅ Created: ${activity.action}`);
    }

    console.log(`\n🎉 Successfully created ${activities.length} sample activities!`);
    
    // Verify the data
    const count = await prisma.eventLog.count({
      where: { companyId: company.id }
    });
    
    console.log(`📊 Total activities for ${company.name}: ${count}`);

  } catch (error) {
    console.error('❌ Error seeding activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedSampleActivities();
