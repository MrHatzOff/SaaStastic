/**
 * RBAC Middleware for API Routes
 * 
 * Provides permission-based access control for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/core/db/client';
import { PERMISSIONS, type Permission } from './permissions';

export interface AuthenticatedContext {
  userId: string;
  companyId: string;
  permissions: Permission[];
  user: {
    id: string;
    email: string;
    name?: string;
  };
  company: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Enhanced API middleware that includes RBAC permission checking
 */
export function withPermissions<T = unknown>(
  handler: (req: NextRequest, context: AuthenticatedContext) => Promise<NextResponse>,
  requiredPermissions: Permission[] = []
) {
  return async (req: NextRequest, routeContext?: T): Promise<NextResponse> => {
    try {
      // Get authentication from Clerk
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Get company context from headers, query params, or user's default company
      let companyId = req.headers.get('x-company-id') || 
                      req.nextUrl.searchParams.get('companyId');

      // If no companyId provided, get user's first company (most common case)
      if (!companyId) {
        const userCompanyRecord = await db.userCompany.findFirst({
          where: { userId },
          select: { companyId: true },
          orderBy: { createdAt: 'desc' }
        });
        
        companyId = userCompanyRecord?.companyId || null;
        
        if (!companyId) {
          return NextResponse.json(
            { error: 'Company context required. User does not belong to any company.' },
            { status: 400 }
          );
        }
      }

      // Verify user belongs to company and get their role
      const userCompany = await db.userCompany.findFirst({
        where: {
          userId,
          companyId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          roleRef: {
            include: {
              permissions: true,
            }
          }
        }
      });

      if (!userCompany) {
        return NextResponse.json(
          { error: 'Access denied: User not member of company' },
          { status: 403 }
        );
      }

      // Get user permissions
      let userPermissions: Permission[] = [];

      if (userCompany.roleRef) {
        // New RBAC system - get permissions from role
        userPermissions = userCompany.roleRef.permissions.map(p => p.key as Permission);
      } else {
        // Fallback to legacy role system during migration
        const legacyRole = userCompany.role;
        userPermissions = getLegacyRolePermissions(legacyRole);
      }

      // Check required permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
          const missingPermissions = requiredPermissions.filter(p => 
            !userPermissions.includes(p)
          );
          
          return NextResponse.json(
            { 
              error: 'Insufficient permissions',
              details: `Missing permissions: ${missingPermissions.join(', ')}`
            },
            { status: 403 }
          );
        }
      }

      // Create authenticated context
      const context: AuthenticatedContext = {
        userId,
        companyId,
        permissions: userPermissions,
        user: {
          id: userCompany.user.id,
          email: userCompany.user.email,
          name: userCompany.user.name || undefined
        },
        company: userCompany.company,
      };

      // Call the handler with authenticated context
      return await handler(req, context);

    } catch (error) {
      console.error('RBAC Middleware Error:', error);
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Legacy role permission mapping for backward compatibility
 * This will be used during the migration period
 */
function getLegacyRolePermissions(role: string): Permission[] {
  switch (role) {
    case 'OWNER':
      return [
        // Full access to everything
        PERMISSIONS.ORG_VIEW,
        PERMISSIONS.ORG_UPDATE,
        PERMISSIONS.ORG_DELETE,
        PERMISSIONS.ORG_SETTINGS,
        PERMISSIONS.BILLING_VIEW,
        PERMISSIONS.BILLING_UPDATE,
        PERMISSIONS.BILLING_PORTAL,
        PERMISSIONS.BILLING_INVOICES,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.TEAM_INVITE,
        PERMISSIONS.TEAM_REMOVE,
        PERMISSIONS.TEAM_ROLE_UPDATE,
        PERMISSIONS.TEAM_SETTINGS,
        PERMISSIONS.CUSTOMER_CREATE,
        PERMISSIONS.CUSTOMER_VIEW,
        PERMISSIONS.CUSTOMER_UPDATE,
        PERMISSIONS.CUSTOMER_DELETE,
        PERMISSIONS.CUSTOMER_EXPORT,
        PERMISSIONS.API_KEY_CREATE,
        PERMISSIONS.API_KEY_VIEW,
        PERMISSIONS.API_KEY_DELETE,
        PERMISSIONS.ROLE_CREATE,
        PERMISSIONS.ROLE_VIEW,
        PERMISSIONS.ROLE_UPDATE,
        PERMISSIONS.ROLE_DELETE,
        PERMISSIONS.ROLE_ASSIGN,
      ];

    case 'ADMIN':
      return [
        PERMISSIONS.ORG_VIEW,
        PERMISSIONS.ORG_UPDATE,
        PERMISSIONS.ORG_SETTINGS,
        PERMISSIONS.BILLING_VIEW,
        PERMISSIONS.BILLING_UPDATE,
        PERMISSIONS.BILLING_PORTAL,
        PERMISSIONS.BILLING_INVOICES,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.TEAM_INVITE,
        PERMISSIONS.TEAM_REMOVE,
        PERMISSIONS.TEAM_ROLE_UPDATE,
        PERMISSIONS.TEAM_SETTINGS,
        PERMISSIONS.CUSTOMER_CREATE,
        PERMISSIONS.CUSTOMER_VIEW,
        PERMISSIONS.CUSTOMER_UPDATE,
        PERMISSIONS.CUSTOMER_DELETE,
        PERMISSIONS.CUSTOMER_EXPORT,
        PERMISSIONS.API_KEY_CREATE,
        PERMISSIONS.API_KEY_VIEW,
        PERMISSIONS.API_KEY_DELETE,
        PERMISSIONS.ROLE_VIEW,
        PERMISSIONS.ROLE_ASSIGN,
      ];

    case 'MEMBER':
      return [
        PERMISSIONS.ORG_VIEW,
        PERMISSIONS.BILLING_VIEW,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.CUSTOMER_CREATE,
        PERMISSIONS.CUSTOMER_VIEW,
        PERMISSIONS.CUSTOMER_UPDATE,
        PERMISSIONS.ROLE_VIEW,
      ];

    case 'VIEWER':
      return [
        PERMISSIONS.ORG_VIEW,
        PERMISSIONS.BILLING_VIEW,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.CUSTOMER_VIEW,
        PERMISSIONS.ROLE_VIEW,
      ];

    default:
      return [PERMISSIONS.ORG_VIEW]; // Minimal permissions
  }
}

/**
 * Utility function to check if a user has a specific permission
 */
export async function hasPermission(
  userId: string,
  companyId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const userCompany = await db.userCompany.findFirst({
      where: {
        userId,
        companyId,
      },
      include: {
        roleRef: {
          include: {
            permissions: true,
          }
        }
      }
    });

    if (!userCompany) {
      return false;
    }

    let userPermissions: Permission[] = [];

    if (userCompany.roleRef) {
      userPermissions = userCompany.roleRef.permissions.map(p => p.key as Permission);
    } else {
      userPermissions = getLegacyRolePermissions(userCompany.role);
    }

    return userPermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user in a company
 */
export async function getUserPermissions(
  userId: string,
  companyId: string
): Promise<Permission[]> {
  try {
    const userCompany = await db.userCompany.findFirst({
      where: {
        userId,
        companyId,
      },
      include: {
        roleRef: {
          include: {
            permissions: true,
          }
        }
      }
    });

    if (!userCompany) {
      return [];
    }

    if (userCompany.roleRef) {
      return userCompany.roleRef.permissions.map(p => p.key as Permission);
    } else {
      return getLegacyRolePermissions(userCompany.role);
    }
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}
