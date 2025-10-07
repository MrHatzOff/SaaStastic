/**
 * Bulk Team Operations API Route
 * 
 * DELETE /api/users/team/bulk - Remove multiple team members
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/shared/lib/rbac-middleware';
import { PERMISSIONS } from '@/shared/lib/permissions';
import { z } from 'zod';
import { db } from '@/core/db/client';

const bulkDeleteSchema = z.object({
  memberIds: z.array(z.string()).min(1, 'At least one member ID is required'),
});

export const DELETE = withPermissions(
  async (req: NextRequest, context) => {
    try {
      const body = await req.json();
      const { memberIds } = bulkDeleteSchema.parse(body);

      // Verify all members belong to the current company
      const membersToRemove = await db.userCompany.findMany({
        where: {
          id: { in: memberIds },
          companyId: context.companyId,
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            }
          }
        }
      });

      if (membersToRemove.length !== memberIds.length) {
        return NextResponse.json(
          { error: 'Some members not found or not in your company' },
          { status: 404 }
        );
      }

      // Check if trying to remove themselves
      const currentUserMember = membersToRemove.find(m => m.userId === context.userId);
      if (currentUserMember) {
        return NextResponse.json(
          { error: 'Cannot remove yourself from the team' },
          { status: 400 }
        );
      }

      // Check for owner protection
      const owners = membersToRemove.filter(m => m.role === 'OWNER');
      if (owners.length > 0) {
        // Count total owners in company
        const totalOwners = await db.userCompany.count({
          where: {
            companyId: context.companyId,
            role: 'OWNER',
          }
        });

        if (totalOwners <= owners.length) {
          return NextResponse.json(
            { error: 'Cannot remove all owners. At least one owner must remain.' },
            { status: 400 }
          );
        }
      }

      // Remove the members
      await db.userCompany.deleteMany({
        where: {
          id: { in: memberIds },
          companyId: context.companyId,
        }
      });

      // Log the bulk removal
      await db.eventLog.create({
        data: {
          action: 'TEAM_BULK_REMOVE',
          companyId: context.companyId,
          userId: context.userId,
          metadata: {
            description: `Bulk removed ${membersToRemove.length} team members`,
            removedMembers: membersToRemove.map(m => ({
              id: m.id,
              email: m.user.email,
              name: m.user.name,
              role: m.role,
            }))
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: `Successfully removed ${membersToRemove.length} team members`,
        removedCount: membersToRemove.length,
      });

    } catch (error) {
      console.error('Bulk remove team members error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.issues },
          { status: 400 }
        );
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to remove team members';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  },
  [PERMISSIONS.TEAM_REMOVE]
);
