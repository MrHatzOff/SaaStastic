import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RoleService } from '@/features/users/services/role-service';
import { db } from '@/core/db/client';

// GET - Fetch team members
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company
    const userCompany = await db.userCompany.findFirst({
      where: { userId },
      select: { companyId: true },
    });

    if (!userCompany) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    // Get team members
    const members = await RoleService.getTeamMembers(
      userCompany.companyId,
      userId
    );

    return NextResponse.json({ members });
  } catch (error: unknown) {
    console.error('Get team members error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team members';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
