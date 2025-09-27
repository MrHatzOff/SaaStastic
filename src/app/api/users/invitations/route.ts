import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/shared/lib/rbac-middleware';
import { PERMISSIONS } from '@/shared/lib/permissions';
import { InvitationService } from '@/features/users/services/invitation-service';
import { z } from 'zod';

// Schema for creating invitations
const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

const bulkInviteSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(10),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
  message: z.string().optional(),
});

// GET - List pending invitations
export const GET = withPermissions(
  async (request: NextRequest, context) => {
    try {
      // List invitations
      const invitations = await InvitationService.listInvitations(
        context.companyId,
        context.userId
      );

      return NextResponse.json({ invitations });
    } catch (error: unknown) {
      console.error('List invitations error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to list invitations' },
        { status: 500 }
      );
    }
  },
  [PERMISSIONS.TEAM_VIEW]
);

// POST - Create new invitation(s)
export const POST = withPermissions(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();

      // Check if bulk invite
      if (Array.isArray(body.emails)) {
        const validatedData = bulkInviteSchema.parse(body);
        
        const result = await InvitationService.bulkInvite(
          validatedData.emails,
          context.companyId,
          validatedData.role,
          context.userId
        );

        return NextResponse.json(result);
      } else {
        // Single invitation
        const validatedData = createInvitationSchema.parse(body);
        
        const invitation = await InvitationService.createInvitation({
          email: validatedData.email,
          companyId: context.companyId,
          role: validatedData.role,
          invitedBy: context.userId,
        });

        return NextResponse.json({ invitation });
      }
    } catch (error: unknown) {
      console.error('Create invitation error:', error);

      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid request data', details: (error as unknown as { errors: unknown }).errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create invitation' },
        { status: 500 }
      );
    }
  },
  [PERMISSIONS.TEAM_INVITE]
);

// DELETE - Cancel an invitation
export const DELETE = withPermissions(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const invitationId = searchParams.get('id');

      if (!invitationId) {
        return NextResponse.json(
          { error: 'Invitation ID is required' },
          { status: 400 }
        );
      }

      await InvitationService.cancelInvitation(invitationId, context.userId);

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      console.error('Cancel invitation error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to cancel invitation' },
        { status: 500 }
      );
    }
  },
  [PERMISSIONS.TEAM_INVITE]
);
