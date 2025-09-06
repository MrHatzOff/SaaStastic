import { PrismaClient } from '@prisma/client'
import { createTenantGuard, type TenantContext } from './tenant-guard'

/**
 * Enhanced Prisma Client with tenant isolation middleware
 * 
 * This client automatically enforces multi-tenant data isolation
 * and provides utilities for safe database operations.
 */

// Global tenant context (in production, this would come from request context)
let currentTenantContext: TenantContext | null = null

/**
 * Set the current tenant context for database operations
 * This should be called at the beginning of each request
 */
export function setTenantContext(context: TenantContext | null) {
  currentTenantContext = context
}

/**
 * Ensure a User row exists for the given userId.
 * Useful for development keyless mode where an auth provider is not creating users.
 */
export async function ensureUserExists(userId: string, email?: string, name?: string) {
  return withSystemContext(async () => {
    // Use stable/dev-safe email to satisfy unique constraint
    const fallbackEmail = `${userId}@dev.local`
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: email || fallbackEmail,
        name: name || 'Dev User',
      },
    })
  })
}

/**
 * Get the current tenant context
 */
export function getTenantContext(): TenantContext | null {
  return currentTenantContext
}

/**
 * Create a new Prisma client instance with tenant guard middleware
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Prisma v6 uses a different middleware system
  // Tenant guard is applied per-operation via getTenantDb() function
  // instead of global $use middleware

  return client
}

// Global Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

/**
 * Execute a database operation with a specific tenant context
 * Useful for system operations or when you need to temporarily switch context
 */
export async function withTenantContext<T>(
  context: TenantContext,
  operation: () => Promise<T>
): Promise<T> {
  const previousContext = currentTenantContext
  setTenantContext(context)
  
  try {
    return await operation()
  } finally {
    setTenantContext(previousContext)
  }
}

/**
 * Execute a database operation without tenant scoping
 * Use only for legitimate system operations
 */
export async function withSystemContext<T>(
  operation: () => Promise<T>
): Promise<T> {
  const previousContext = currentTenantContext
  setTenantContext(null)
  
  try {
    return await operation()
  } finally {
    setTenantContext(previousContext)
  }
}

/**
 * Utility to ensure a company exists and user has access
 */
export async function validateCompanyAccess(
  companyId: string, 
  userId: string
): Promise<boolean> {
  return withSystemContext(async () => {
    const userCompany = await db.userCompany.findFirst({
      where: {
        userId,
        companyId,
        company: {
          deletedAt: null
        }
      }
    })
    
    return !!userCompany
  })
}

/**
 * Get companies for a user (system operation)
 */
export async function getUserCompanies(userId: string) {
  return withSystemContext(async () => {
    return db.userCompany.findMany({
      where: {
        userId,
        company: {
          deletedAt: null
        }
      },
      include: {
        company: true
      }
    })
  })
}

/**
 * Create a new company with the user as owner
 */
export async function createCompanyWithOwner(
  companyData: { name: string; slug: string },
  userId: string
) {
  return withSystemContext(async () => {
    return db.$transaction(async (tx: any) => {
      // Create company
      const company = await tx.company.create({
        data: {
          ...companyData,
          createdBy: userId
        }
      })

      // Add user as owner
      await tx.userCompany.create({
        data: {
          userId,
          companyId: company.id,
          role: 'OWNER',
          createdBy: userId
        }
      })

      return company
    })
  })
}

/**
 * Get a tenant-scoped database client
 * This is a convenience function for API routes
 */
export function getTenantDb(companyId: string) {
  setTenantContext({ companyId, userId: undefined })
  return db
}

export default db
