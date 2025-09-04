import { Prisma } from '@prisma/client'

/**
 * Tenant Guard Middleware for Prisma
 * 
 * Automatically enforces companyId scoping on all database queries to ensure
 * multi-tenant isolation. This middleware intercepts all Prisma operations
 * and adds/validates companyId filters.
 */

export interface TenantContext {
  companyId: string
  userId?: string
}

// Models that require tenant scoping (all lowercase for consistent matching)
const TENANT_SCOPED_MODELS = [
  'company',
  'usercompany', 
  'customer',
  'eventlog',
  'feedback'
] as const

type TenantScopedModel = (typeof TENANT_SCOPED_MODELS)[number]

/**
 * Creates a Prisma middleware that enforces tenant isolation
 * @param getTenantContext - Function to get current tenant context
 * @returns Prisma middleware function
 */
export function createTenantGuard(
  getTenantContext: () => TenantContext | null
) {
  return async (params: any, next: any) => {
    const context = getTenantContext()
    
    // Skip tenant scoping if no context (e.g., system operations)
    if (!context?.companyId) {
      return next(params)
    }

    const { model, action, args } = params
    
    // Only apply to tenant-scoped models
    if (!model || !TENANT_SCOPED_MODELS.includes(model.toLowerCase() as TenantScopedModel)) {
      return next(params)
    }

    // Apply tenant scoping based on operation type
    switch (action) {
      case 'create':
      case 'createMany':
        return handleCreate(params, next, context)
      
      case 'findFirst':
      case 'findFirstOrThrow':
      case 'findUnique':
      case 'findUniqueOrThrow':
      case 'findMany':
        return handleRead(params, next, context)
      
      case 'update':
      case 'updateMany':
      case 'upsert':
        return handleUpdate(params, next, context)
      
      case 'delete':
      case 'deleteMany':
        return handleDelete(params, next, context)
      
      case 'count':
      case 'aggregate':
      case 'groupBy':
        return handleAggregate(params, next, context)
      
      default:
        return next(params)
    }
  }
}

/**
 * Handle create operations - inject companyId
 */
function handleCreate(
  params: any,
  next: (params: any) => Promise<any>,
  context: TenantContext
) {
  const { model, args } = params

  if (model?.toLowerCase() === 'company') {
    // For company creation, don't auto-inject companyId
    return next(params)
  }

  // Inject companyId into create data
  if (args.data) {
    if (Array.isArray(args.data)) {
      // createMany
      args.data = args.data.map((item: any) => ({
        ...item,
        companyId: context.companyId,
        ...(context.userId && { createdBy: context.userId })
      }))
    } else {
      // create/upsert
      args.data = {
        ...args.data,
        companyId: context.companyId,
        ...(context.userId && { createdBy: context.userId })
      }
    }
  }

  return next(params)
}

/**
 * Handle read operations - filter by companyId
 */
function handleRead(
  params: any,
  next: (params: any) => Promise<any>,
  context: TenantContext
) {
  const { model, args } = params

  if (model?.toLowerCase() === 'user') {
    // Users are not directly scoped by companyId
    return next(params)
  }

  // Special-case userCompany: no deletedAt column
  if (model?.toLowerCase() === 'usercompany') {
    args.where = {
      ...args.where,
      companyId: context.companyId,
    }
    return next(params)
  }

  // Add companyId filter to where clause and exclude soft-deleted records by default
  args.where = {
    ...args.where,
    companyId: context.companyId,
    deletedAt: null,
  }

  return next(params)
}

/**
 * Handle update operations - filter by companyId and inject updatedBy
 */
function handleUpdate(
  params: any,
  next: (params: any) => Promise<any>,
  context: TenantContext
) {
  const { model, args } = params

  if (model?.toLowerCase() === 'user') {
    return next(params)
  }

  if (model?.toLowerCase() === 'usercompany') {
    // Only scope by companyId for userCompany; no deletedAt or updatedBy
    args.where = {
      ...args.where,
      companyId: context.companyId,
    }
    return next(params)
  }

  // Add companyId filter to where clause
  args.where = {
    ...args.where,
    companyId: context.companyId,
    deletedAt: null,
  }

  // Inject updatedBy into update data
  if (args.data && context.userId) {
    args.data = {
      ...args.data,
      updatedBy: context.userId
    }
  }

  return next(params)
}

/**
 * Handle delete operations - filter by companyId (soft delete)
 */
function handleDelete(
  params: any,
  next: (params: any) => Promise<any>,
  context: TenantContext
) {
  const { model, args } = params

  if (model?.toLowerCase() === 'user') {
    return next(params)
  }

  if (model?.toLowerCase() === 'usercompany') {
    // For userCompany, perform actual deletes but scope by companyId
    args.where = {
      ...args.where,
      companyId: context.companyId,
    }
    return next(params)
  }

  // Convert delete to soft delete (update deletedAt)
  const newParams = {
    ...params,
    action: params.action === 'delete' ? 'update' : 'updateMany',
    args: {
      ...args,
      where: {
        ...args.where,
        companyId: context.companyId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        ...(context.userId && { updatedBy: context.userId })
      }
    }
  }

  return next(newParams)
}

/**
 * Handle aggregate operations - filter by companyId
 */
function handleAggregate(
  params: any,
  next: (params: any) => Promise<any>,
  context: TenantContext
) {
  const { model, args } = params

  if (model?.toLowerCase() === 'user') {
    return next(params)
  }

  if (model?.toLowerCase() === 'usercompany') {
    args.where = {
      ...args.where,
      companyId: context.companyId,
    }
    return next(params)
  }

  // Add companyId filter to where clause
  args.where = {
    ...args.where,
    companyId: context.companyId,
    deletedAt: null,
  }

  return next(params)
}

/**
 * Utility function to bypass tenant guard for system operations
 * Use sparingly and only for legitimate system-level operations
 */
export function withoutTenantGuard<T>(
  operation: () => Promise<T>
): Promise<T> {
  // This would need to be implemented with a context provider
  // that temporarily disables tenant scoping
  return operation()
}

/**
 * Type-safe helper for tenant context
 */
export function createTenantContext(companyId: string, userId?: string): TenantContext {
  return { companyId, userId }
}
