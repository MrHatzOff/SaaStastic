/**
 * SaaStastic Helper Utilities
 *
 * Common patterns and utilities for building multi-tenant SaaS applications
 */

import { ApiContext, requireRole, AuthorizationError, NotFoundError } from '@/shared/lib/api-middleware'
import { getTenantDb } from '@/core/db/client'
import { PrismaClient, Role } from '@prisma/client'

/**
 * Database operation helpers
 */

/**
 * Get tenant-scoped database instance
 */
export function getDb(context: ApiContext) {
  if (!context.companyId) {
    throw new AuthorizationError('Company context required')
  }
  return getTenantDb(context.companyId)
}

/**
 * Execute database operation with automatic tenant scoping
 */
export async function withTenantDb<T>(
  context: ApiContext,
  operation: (db: PrismaClient) => Promise<T>
): Promise<T> {
  const db = getDb(context)
  return operation(db)
}

/**
 * Role and permission helpers
 */

/**
 * Assert user has specific role and belongs to company
 */
export function assertRoleAndMembership(
  userRole: string | null,
  requiredRole: Role,
  action: string
) {
  if (!userRole) {
    throw new AuthorizationError('User role not found')
  }

  requireRole(userRole, requiredRole, action)
}

/**
 * Check if user can perform action based on role
 */
export function canPerformAction(userRole: string | null, requiredRole: Role): boolean {
  if (!userRole) return false

  const roleHierarchy = {
    [Role.OWNER]: 4,
    [Role.ADMIN]: 3,
    [Role.MEMBER]: 2,
    [Role.VIEWER]: 1
  }

  const userLevel = roleHierarchy[userRole as Role] || 0
  const requiredLevel = roleHierarchy[requiredRole]

  return userLevel >= requiredLevel
}

/**
 * Resource ownership helpers
 */

/**
 * Verify user owns or can access a resource
 */
export async function verifyResourceAccess(
  context: ApiContext,
  resourceType: 'customer' | 'event' | 'feedback',
  resourceId: string,
  requiredRole: Role = Role.MEMBER
) {
  const db = getDb(context)

  let resource: unknown = null

  switch (resourceType) {
    case 'customer':
      resource = await db.customer.findFirst({
        where: {
          id: resourceId,
          deletedAt: null
        }
      })
      break
    case 'event':
      resource = await db.eventLog.findFirst({
        where: {
          id: resourceId
        }
      })
      break
    case 'feedback':
      resource = await db.feedback.findFirst({
        where: {
          id: resourceId
        }
      })
      break
  }

  if (!resource) {
    throw new NotFoundError(resourceType)
  }

  // Additional role check if required
  if (requiredRole !== Role.MEMBER) {
    assertRoleAndMembership(context.userRole, requiredRole, `access ${resourceType}`)
  }

  return resource
}

/**
 * Common CRUD helpers
 */

/**
 * Soft delete helper with audit trail
 */
export async function softDelete(
  context: ApiContext,
  table: 'customer' | 'event' | 'feedback',
  id: string
) {
  const db = getDb(context)

  switch (table) {
    case 'customer':
      return await db.customer.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          ...(context.userId && { updatedBy: context.userId })
        }
      })
    case 'event':
      // EventLog doesn't support soft delete, use hard delete
      return await db.eventLog.delete({ where: { id } })
    case 'feedback':
      // Feedback doesn't support soft delete, use hard delete  
      return await db.feedback.delete({ where: { id } })
  }
}

/**
 * Create with audit trail
 */
export function createWithAudit(data: Record<string, unknown>, context: ApiContext) {
  return {
    ...data,
    createdBy: context.userId,
    updatedBy: context.userId
  }
}

/**
 * Update with audit trail
 */
export function updateWithAudit(data: Record<string, unknown>, context: ApiContext) {
  return {
    ...data,
    updatedBy: context.userId,
    updatedAt: new Date()
  }
}

/**
 * Validation helpers
 */

/**
 * Validate required fields
 */
export function validateRequired<T>(data: T, fields: (keyof T)[]): void {
  const missing = fields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}

/**
 * Pagination helpers
 */

/**
 * Standard pagination parameters
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

/**
 * Calculate pagination values
 */
export function getPaginationParams(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 10))
  const offset = (page - 1) * limit

  return {
    page,
    limit,
    offset,
    orderBy: options.orderBy || 'createdAt',
    orderDirection: options.orderDirection || 'desc'
  }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: ReturnType<typeof getPaginationParams>
) {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page * pagination.limit < total,
      hasPrev: pagination.page > 1
    }
  }
}

/**
 * Logging helpers
 */
/**
 * Structured logging for API operations
 */
export function logApiOperation(
  operation: string,
  context: ApiContext,
  resourceId?: string,
  metadata?: Record<string, unknown>
) {
  // TODO: Replace with proper structured logging service in production
  // console.log(`[${new Date().toISOString()}] API Operation:`, {
  //   operation,
  //   userId: context.userId,
  //   companyId: context.companyId,
  //   userRole: context.userRole,
  //   resourceId,
  //   metadata,
  // });
}
/**
 * Company context helpers
 */

/**
 * Get user's companies with roles
 */
export async function getUserCompanies(userId: string) {
  const db = new PrismaClient()

  return await db.userCompany.findMany({
    where: { userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  })
}

/**
 * Validate company membership
 */
export async function validateCompanyMembership(userId: string, companyId: string) {
  const db = new PrismaClient()

  const membership = await db.userCompany.findFirst({
    where: {
      userId,
      companyId
    }
  })

  if (!membership) {
    throw new AuthorizationError('User is not a member of this company')
  }

  return membership
}
