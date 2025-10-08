import { db } from '@/core/db/client';
import { randomBytes } from 'crypto';
import type { Role } from '@prisma/client';

export interface InvitationData {
  email: string;
  companyId: string;
  role: Role;
  invitedBy: string;
}

export interface InvitationResponse {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  inviteUrl: string;
}

export class InvitationService {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly EXPIRY_HOURS = 72; // 3 days

  /**
   * Generate a secure invitation token
   */
  private static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  /**
   * Calculate expiry date for invitation
   */
  private static getExpiryDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() + this.EXPIRY_HOURS);
    return date;
  }

  /**
   * Create a new team invitation
   */
  static async createInvitation(
    data: InvitationData
  ): Promise<InvitationResponse> {
    const { email, companyId, role, invitedBy } = data;

    // Check if user already exists in the company
    const existingUser = await db.userCompany.findFirst({
      where: {
        company: { id: companyId },
        user: { email },
      },
    });

    if (existingUser) {
      throw new Error('User is already a member of this company');
    }

    // Check if there's a pending invitation
    const existingInvitation = await db.userInvitation.findFirst({
      where: {
        email,
        companyId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      throw new Error('An invitation has already been sent to this email');
    }

    // Check if inviter has permission to invite
    const inviter = await db.userCompany.findFirst({
      where: {
        userId: invitedBy,
        companyId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!inviter) {
      throw new Error('You do not have permission to invite team members');
    }

    // Check team size limits based on subscription
    // TODO: Implement team size limits based on subscription tier
    // const teamSize = await db.userCompany.count({ where: { companyId } });
    // const subscription = await db.subscription.findUnique({
    //   where: { companyId },
    //   select: { stripePriceId: true, status: true },
    // });
    // This would need to be integrated with StripeService.checkFeatureLimit
    // For now, we'll allow unlimited invitations

    // Create the invitation
    const token = this.generateToken();
    const expiresAt = this.getExpiryDate();

    const invitation = await db.userInvitation.create({
      data: {
        email,
        companyId,
        role,
        token,
        expiresAt,
        invitedBy,
      },
      include: {
        company: true,
        inviter: true,
      },
    });

    // Generate invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/accept?token=${token}`;

    // Send invitation email (to be implemented with email service)
    // await EmailService.sendInvitation({
    //   to: email,
    //   inviterName: invitation.inviter.name || invitation.inviter.email,
    //   companyName: invitation.company.name,
    //   inviteUrl,
    //   expiresAt,
    // });

    return {
      id: invitation.id,
      email: invitation.email,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      inviteUrl,
    };
  }

  /**
   * Accept an invitation
   */
  static async acceptInvitation(
    token: string,
    userId: string
  ): Promise<{ companyId: string; role: Role }> {
    // Find the invitation
    const invitation = await db.userInvitation.findUnique({
      where: { token },
      include: {
        company: true,
      },
    });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.acceptedAt) {
      throw new Error('This invitation has already been accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('This invitation has expired');
    }

    // Get the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the email matches
    if (user.email !== invitation.email) {
      throw new Error('This invitation was sent to a different email address');
    }

    // Check if user is already a member
    const existingMembership = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: invitation.companyId,
        },
      },
    });

    if (existingMembership) {
      throw new Error('You are already a member of this company');
    }

    // Accept the invitation in a transaction
    const result = await db.$transaction(async (tx) => {
      // Mark invitation as accepted
      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      // Add user to company
      const membership = await tx.userCompany.create({
        data: {
          userId,
          companyId: invitation.companyId,
          role: invitation.role,
          createdBy: invitation.invitedBy,
        },
      });

      // Log the event
      await tx.eventLog.create({
        data: {
          action: 'team.member_joined',
          userId,
          companyId: invitation.companyId,
          metadata: {
            invitationId: invitation.id,
            role: invitation.role,
            invitedBy: invitation.invitedBy,
          },
        },
      });

      return membership;
    });

    return {
      companyId: result.companyId,
      role: result.role,
    };
  }

  /**
   * Cancel an invitation
   */
  static async cancelInvitation(
    invitationId: string,
    userId: string
  ): Promise<void> {
    const invitation = await db.userInvitation.findUnique({
      where: { id: invitationId },
      include: {
        company: {
          include: {
            users: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new Error('Cannot cancel an accepted invitation');
    }

    // Check if user has permission to cancel
    const userRole = invitation.company.users[0]?.role;
    if (!userRole || (userRole !== 'OWNER' && userRole !== 'ADMIN')) {
      throw new Error('You do not have permission to cancel this invitation');
    }

    // Delete the invitation
    await db.userInvitation.delete({
      where: { id: invitationId },
    });

    // Log the event
    await db.eventLog.create({
      data: {
        action: 'team.invitation_cancelled',
        userId,
        companyId: invitation.companyId,
        metadata: {
          invitationId,
          inviteeEmail: invitation.email,
        },
      },
    });
  }

  /**
   * Resend an invitation
   */
  static async resendInvitation(
    invitationId: string,
    userId: string
  ): Promise<InvitationResponse> {
    const invitation = await db.userInvitation.findUnique({
      where: { id: invitationId },
      include: {
        company: {
          include: {
            users: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new Error('This invitation has already been accepted');
    }

    // Check if user has permission
    const userRole = invitation.company.users[0]?.role;
    if (!userRole || (userRole !== 'OWNER' && userRole !== 'ADMIN')) {
      throw new Error('You do not have permission to resend this invitation');
    }

    // Generate new token and expiry
    const token = this.generateToken();
    const expiresAt = this.getExpiryDate();

    // Update the invitation
    const updated = await db.userInvitation.update({
      where: { id: invitationId },
      data: {
        token,
        expiresAt,
      },
    });

    // Generate invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/accept?token=${token}`;

    // Resend invitation email
    // await EmailService.sendInvitation({
    //   to: updated.email,
    //   inviteUrl,
    //   expiresAt,
    // });

    return {
      id: updated.id,
      email: updated.email,
      token: updated.token,
      expiresAt: updated.expiresAt,
      inviteUrl,
    };
  }

  /**
   * List pending invitations for a company
   */
  static async listInvitations(
    companyId: string,
    userId: string
  ): Promise<Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
    expiresAt: Date;
    inviter: {
      id: string;
      email: string;
      name: string | null;
    };
  }>> {
    // Check if user has permission
    const userCompany = await db.userCompany.findFirst({
      where: {
        userId,
        companyId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!userCompany) {
      throw new Error('You do not have permission to view invitations');
    }

    const invitations = await db.userInvitation.findMany({
      where: {
        companyId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        inviter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      status: 'pending',
      inviter: inv.inviter,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
    }));
  }

  /**
   * Bulk invite team members
   */
  static async bulkInvite(
    emails: string[],
    companyId: string,
    role: Role,
    invitedBy: string
  ): Promise<{ successful: InvitationResponse[]; failed: { email: string; error: string }[] }> {
    const successful: InvitationResponse[] = [];
    const failed: { email: string; error: string }[] = [];

    for (const email of emails) {
      try {
        const invitation = await this.createInvitation({
          email,
          companyId,
          role,
          invitedBy,
        });
        successful.push(invitation);
      } catch (error: unknown) {
        failed.push({
          email,
          error: error instanceof Error ? error.message : 'Failed to send invitation',
        });
      }
    }

    return { successful, failed };
  }
}
