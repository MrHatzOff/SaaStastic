import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/core/db/client';

/**
 * GET /api/user/onboarding-status
 * 
 * Check if user has completed onboarding (has a company)
 */
export const GET = async (_request: NextRequest) => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has a company
    const userCompany = await db.userCompany.findFirst({
      where: { userId },
      include: { 
        company: {
          select: {
            name: true,
            slug: true,
          }
        }
      },
    });

    return NextResponse.json({
      hasCompany: !!userCompany,
      companyName: userCompany?.company?.name,
      companySlug: userCompany?.company?.slug,
    });
  } catch (error: unknown) {
    console.error('Onboarding status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}
