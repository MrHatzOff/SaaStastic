import { db } from '@/core/db/client';
import type { Role } from '@prisma/client';

export interface RolePermissions {
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canManageBilling: boolean;
  canManageCompanySettings: boolean;
  canViewAnalytics: boolean;
  canManageCustomers: boolean;
  canViewAuditLogs: boolean;
  canImpersonate: boolean;
}

export class RoleService {
  /**
   * Get permissions for a role
   */
  static getPermissions(role: Role): RolePermissions {
    switch (role) {
      case 'OWNER':
        return {
          canInviteMembers: true,
          canRemoveMembers: true,
          canManageBilling: true,
          canManageCompanySettings: true,
          canViewAnalytics: true,
          canManageCustomers: true,
          canViewAuditLogs: true,
          canImpersonate: false, // Only support staff can impersonate
        };
      case 'ADMIN':
        return {
          canInviteMembers: true,
          canRemoveMembers: true,
          canManageBilling: true,
          canManageCompanySettings: false,
          canViewAnalytics: true,
          canManageCustomers: true,
          canViewAuditLogs: true,
          canImpersonate: false,
        };
      case 'MEMBER':
        return {
          canInviteMembers: false,
          canRemoveMembers: false,
          canManageBilling: false,
          canManageCompanySettings: false,
          canViewAnalytics: false,
          canManageCustomers: true,
          canViewAuditLogs: false,
          canImpersonate: false,
        };
      case 'VIEWER':
        return {
          canInviteMembers: false,
          canRemoveMembers: false,
          canManageBilling: false,
          canManageCompanySettings: false,
          canViewAnalytics: false,
          canManageCustomers: false,
          canViewAuditLogs: false,
          canImpersonate: false,
        };
      default:
        return {
          canInviteMembers: false,
          canRemoveMembers: false,
          canManageBilling: false,
          canManageCompanySettings: false,
          canViewAnalytics: false,
          canManageCustomers: false,
          canViewAuditLogs: false,
          canImpersonate: false,
        };
    }
  }

  /**
   * Check if a user has a specific permission
   */
  static async hasPermission(
    userId: string,
    companyId: string,
    permission: keyof RolePermissions
  ): Promise<boolean> {
    const userCompany = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (!userCompany) {
      return false;
    }

    const permissions = this.getPermissions(userCompany.role);
    return permissions[permission];
  }

  /**
   * Update a user's role
   */
  static async updateUserRole(
    targetUserId: string,
    companyId: string,
    newRole: Role,
    updatedBy: string
  ): Promise<void> {
    // Check if updater has permission
    const updaterRole = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: updatedBy,
          companyId,
        },
      },
    });

    if (!updaterRole) {
      throw new Error('You are not a member of this company');
    }

    // Only owners can change roles
    if (updaterRole.role !== 'OWNER') {
      throw new Error('Only company owners can change user roles');
    }

    // Get target user's current role
    const targetUser = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId,
        },
      },
    });

    if (!targetUser) {
      throw new Error('User is not a member of this company');
    }

    // Prevent removing the last owner
    if (targetUser.role === 'OWNER' && newRole !== 'OWNER') {
      const ownerCount = await db.userCompany.count({
        where: {
          companyId,
          role: 'OWNER',
        },
      });

      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner from the company');
      }
    }

    // Update the role
    await db.userCompany.update({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId,
        },
      },
      data: {
        role: newRole,
        updatedBy,
      },
    });

    // Log the event
    await db.eventLog.create({
      data: {
        action: 'team.role_changed',
        userId: updatedBy,
        companyId,
        metadata: {
          targetUserId,
          oldRole: targetUser.role,
          newRole,
        },
      },
    });
  }

  /**
   * Remove a user from a company
   */
  static async removeUserFromCompany(
    targetUserId: string,
    companyId: string,
    removedBy: string
  ): Promise<void> {
    // Check if remover has permission
    const removerRole = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: removedBy,
          companyId,
        },
      },
    });

    if (!removerRole) {
      throw new Error('You are not a member of this company');
    }

    const permissions = this.getPermissions(removerRole.role);
    if (!permissions.canRemoveMembers) {
      throw new Error('You do not have permission to remove team members');
    }

    // Get target user
    const targetUser = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId,
        },
      },
    });

    if (!targetUser) {
      throw new Error('User is not a member of this company');
    }

    // Prevent removing the last owner
    if (targetUser.role === 'OWNER') {
      const ownerCount = await db.userCompany.count({
        where: {
          companyId,
          role: 'OWNER',
        },
      });

      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner from the company');
      }
    }

    // Prevent users from removing themselves
    if (targetUserId === removedBy) {
      throw new Error('You cannot remove yourself from the company. Please ask another admin.');
    }

    // Remove the user
    await db.userCompany.delete({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId,
        },
      },
    });

    // Log the event
    await db.eventLog.create({
      data: {
        action: 'team.member_removed',
        userId: removedBy,
        companyId,
        metadata: {
          targetUserId,
          targetRole: targetUser.role,
        },
      },
    });
  }

  /**
   * Transfer ownership of a company
   */
  static async transferOwnership(
    newOwnerId: string,
    companyId: string,
    currentOwnerId: string
  ): Promise<void> {
    // Verify current owner
    const currentOwner = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: currentOwnerId,
          companyId,
        },
      },
    });

    if (!currentOwner || currentOwner.role !== 'OWNER') {
      throw new Error('Only the current owner can transfer ownership');
    }

    // Verify new owner is a member
    const newOwner = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: newOwnerId,
          companyId,
        },
      },
    });

    if (!newOwner) {
      throw new Error('New owner must be a member of the company');
    }

    // Transfer ownership in a transaction
    await db.$transaction(async (tx) => {
      // Make new owner an OWNER
      await tx.userCompany.update({
        where: {
          userId_companyId: {
            userId: newOwnerId,
            companyId,
          },
        },
        data: {
          role: 'OWNER',
          updatedBy: currentOwnerId,
        },
      });

      // Demote current owner to ADMIN
      await tx.userCompany.update({
        where: {
          userId_companyId: {
            userId: currentOwnerId,
            companyId,
          },
        },
        data: {
          role: 'ADMIN',
          updatedBy: currentOwnerId,
        },
      });

      // Log the event
      await tx.eventLog.create({
        data: {
          action: 'team.ownership_transferred',
          userId: currentOwnerId,
          companyId,
          metadata: {
            newOwnerId,
            previousOwnerId: currentOwnerId,
          },
        },
      });
    });
  }

  /**
   * Get team members for a company
   */
  static async getTeamMembers(
    companyId: string,
    userId: string
  ): Promise<Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    joinedAt: Date;
    permissions: RolePermissions;
  }>> {
    // Check if user is a member
    const userCompany = await db.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (!userCompany) {
      throw new Error('You are not a member of this company');
    }

    const members = await db.userCompany.findMany({
      where: {
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        {
          role: 'asc', // OWNER first, then ADMIN, MEMBER, VIEWER
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    return members.map((member) => ({
      id: member.user.id,
      email: member.user.email,
      name: member.user.name,
      role: member.role,
      joinedAt: member.createdAt,
      permissions: this.getPermissions(member.role),
    }));
  }

  /**
   * Check if role change is allowed
   */
  static canChangeRole(
    currentRole: Role,
    targetRole: Role,
    newRole: Role
  ): boolean {
    // Only owners can change roles
    if (currentRole !== 'OWNER') {
      return false;
    }

    // Cannot demote yourself from owner if you're the last one
    // This check should be done with database query
    if (targetRole === 'OWNER' && newRole !== 'OWNER') {
      // Additional check needed for last owner
      return true; // Will be validated in updateUserRole
    }

    return true;
  }

  /**
   * Get role hierarchy level
   */
  static getRoleLevel(role: Role): number {
    switch (role) {
      case 'OWNER':
        return 4;
      case 'ADMIN':
        return 3;
      case 'MEMBER':
        return 2;
      case 'VIEWER':
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Check if user can perform action on target user
   */
  static async canPerformActionOnUser(
    actorId: string,
    targetId: string,
    companyId: string,
    action: 'remove' | 'changeRole'
  ): Promise<boolean> {
    if (actorId === targetId && action === 'remove') {
      return false; // Cannot remove yourself
    }

    const [actor, target] = await Promise.all([
      db.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: actorId,
            companyId,
          },
        },
      }),
      db.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: targetId,
            companyId,
          },
        },
      }),
    ]);

    if (!actor || !target) {
      return false;
    }

    const actorPermissions = this.getPermissions(actor.role);

    if (action === 'remove') {
      return actorPermissions.canRemoveMembers;
    }

    if (action === 'changeRole') {
      return actor.role === 'OWNER';
    }

    return false;
  }
}
