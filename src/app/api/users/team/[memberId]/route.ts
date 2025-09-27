import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RoleService } from '@/features/users/services/role-service';
import { db } from '@/core/db/client';

// DELETE - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params
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

    // Remove member
    await RoleService.removeUserFromCompany(
      memberId,
      userCompany.companyId,
      userId
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Remove member error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('permission') ? 403 : 500 }
    );
  }
}
