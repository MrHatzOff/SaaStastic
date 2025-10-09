/**
 * RBAC Middleware for API Routes
 * 
 * Provides comprehensive permission-based access control for Next.js API endpoints.
 * Automatically handles authentication, tenant context resolution, and permission checking.
 * 
 * @module rbac-middleware
 * @see docs/guides/RBAC_USAGE.md#protecting-api-routes
 * @see docs/guides/CUSTOMIZING_PERMISSIONS.md
 * 
 * @example
 * ```typescript
 * // Protect an API route
 * export const POST = withPermissions(
 *   async (req, context) => {
 *     // context.userId, context.companyId, context.permissions available
 *     const data = await db.customer.create({
 *       data: { ...input, companyId: context.companyId }
 *     });
 *     return NextResponse.json({ data });
 *   },
 *   [PERMISSIONS.CUSTOMER_CREATE] // Required permissions
 * );
 * ```
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
 * Enhanced API middleware with RBAC permission checking.
 * 
 * Wraps your API route handler with:
 * - Clerk authentication verification
 * - Company context resolution (from headers or user's default)
 * - User company membership validation
 * - Permission checking against required permissions
 * - Automatic error responses for auth/permission failures
 * 
 * @template T - Optional route context type for Next.js dynamic routes
 * @param handler - Your API route handler function
 * @param requiredPermissions - Array of permissions required to access this endpoint
 * @returns Wrapped handler that enforces authentication and permissions
 * 
 * @example
 * ```typescript
 * // Single permission requirement
 * export const POST = withPermissions(
 *   async (req: NextRequest, context: AuthenticatedContext) => {
 *     const { userId, companyId, permissions } = context;
 *     
 *     // Your logic here - user is authenticated and has permission
 *     const customer = await db.customer.create({
 *       data: {
 *         ...data,
 *         companyId, // Automatically scoped
 *         createdBy: userId,
 *       }
 *     });
 *     
 *     return NextResponse.json({ customer });
 *   },
 *   [PERMISSIONS.CUSTOMER_CREATE]
 * );
 * 
 * // Multiple permissions required
 * export const DELETE = withPermissions(
 *   async (req, context) => {
 *     // User must have BOTH permissions
 *     await db.customer.deleteMany({ where: { companyId: context.companyId } });
 *     return NextResponse.json({ success: true });
 *   },
 *   [PERMISSIONS.CUSTOMER_DELETE, PERMISSIONS.CUSTOMER_EXPORT]
 * );
 * 
 * // No permissions (just authentication)
 * export const GET = withPermissions(
 *   async (req, context) => {
 *     // Just need to be authenticated, no specific permission
 *     return NextResponse.json({ user: context.user });
 *   }
 * );
 * ```
 * 
 * @see {@link AuthenticatedContext}
 * @see {@link hasPermission}
 * @see docs/guides/RBAC_USAGE.md
 */
export function withPermissions<T = unknown>(
  handler: (req: NextRequest, context: AuthenticatedContext) => Promise<NextResponse>,
  requiredPermissions: Permission[] = []
) {
  return async (req: NextRequest, _routeContext?: T): Promise<NextResponse> => {
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
 * Check if a user has a specific permission in a company.
 * Server-side utility function for permission checking outside of middleware.
 * 
 * @param userId - The user ID to check
 * @param companyId - The company ID context
 * @param permission - The permission string to check for
 * @returns Promise resolving to true if user has permission, false otherwise
 * 
 * @example
 * ```typescript
 * // In a server action or API route
 * const canDelete = await hasPermission(
 *   'user_123',
 *   'company_456',
 *   PERMISSIONS.CUSTOMER_DELETE
 * );
 * 
 * if (!canDelete) {
 *   throw new Error('Permission denied');
 * }
 * ```
 * 
 * @see {@link getUserPermissions}
 * @see {@link withPermissions}
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
 * Get all permissions for a user in a company.
 * Server-side utility to fetch complete permission list for a user.
 * 
 * @param userId - The user ID to get permissions for
 * @param companyId - The company ID context
 * @returns Promise resolving to array of permission strings
 * 
 * @example
 * ```typescript
 * // Get all user permissions
 * const permissions = await getUserPermissions('user_123', 'company_456');
 * console.log(`User has ${permissions.length} permissions:`, permissions);
 * // ['customer:view', 'customer:create', 'team:view', ...]
 * 
 * // Check specific permissions
 * const canCreate = permissions.includes(PERMISSIONS.CUSTOMER_CREATE);
 * const canDelete = permissions.includes(PERMISSIONS.CUSTOMER_DELETE);
 * ```
 * 
 * @see {@link hasPermission}
 * @see {@link withPermissions}
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
