import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/core/db/client';
import { RoleService } from '@/features/users/services/role-service';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

// PATCH - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // Get user's company
    const userCompany = await db.userCompany.findFirst({
      where: { userId },
      select: { companyId: true },
    });

    if (!userCompany) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    // Update role
    await RoleService.updateUserRole(
      memberId,
      userCompany.companyId,
      validatedData.role,
      userId
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Update role error:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as unknown as { errors: unknown[] };
      return NextResponse.json(
        { error: 'Invalid request data', details: zodError.errors },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('permission') ? 403 : 500 }
    );
  }
}
