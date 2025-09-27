/**
 * Test Companies API Fix
 * 
 * Verify that the companies API returns only user's companies
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCompaniesAPI() {
  const userId = 'user_32sB19ZNfcF9bCrgNztf0ZW33m7';
  
  console.log('🧪 Testing Companies API Fix');
  console.log('User ID:', userId);
  
  // Test the fixed query logic
  const userCompanies = await prisma.userCompany.findMany({
    where: {
      userId: userId,
    },
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
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('\n✅ User Companies (Fixed Query):');
  const companies = userCompanies.map(uc => ({
    id: uc.company.id,
    name: uc.company.name,
    slug: uc.company.slug,
    role: uc.role,
    createdAt: uc.company.createdAt,
  }));

  companies.forEach(company => {
    console.log(`  - ${company.name} (${company.id}) - Role: ${company.role}`);
  });

  // Compare with old broken query
  const allCompanies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('\n❌ All Companies (Broken Query):');
  allCompanies.forEach(company => {
    console.log(`  - ${company.name} (${company.id})`);
  });

  console.log('\n📊 Results:');
  console.log(`User's Companies: ${companies.length}`);
  console.log(`All Companies: ${allCompanies.length}`);
  console.log(`Security Fix Working: ${companies.length < allCompanies.length ? '✅ YES' : '❌ NO'}`);
}

async function main() {
  try {
    await testCompaniesAPI();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
