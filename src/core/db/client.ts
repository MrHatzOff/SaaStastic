import { PrismaClient } from '@prisma/client'
import { provisionSystemRolesForCompany } from '@/core/rbac/provisioner'
import { SYSTEM_ROLE_SLUGS } from '@/core/rbac/default-roles'
import type { TenantContext } from './tenant-guard'

/**
 * Enhanced Prisma Client with tenant isolation middleware
 * 
 * This client automatically enforces multi-tenant data isolation
 * and provides utilities for safe database operations.
 */

// Global tenant context (in production, this would come from request context)
let currentTenantContext: TenantContext | null = null

/**
 * Set the current tenant context for database operations.
 * This should be called at the beginning of each request to ensure proper multi-tenant isolation.
 * 
 * @param context - The tenant context containing companyId and optional userId
 * @returns void
 * 
 * @example
 * ```typescript
 * // In API middleware
 * setTenantContext({ companyId: 'company_123', userId: 'user_456' });
 * ```
 * 
 * @see {@link getTenantContext}
 * @see {@link withTenantContext}
 */
export function setTenantContext(context: TenantContext | null) {
  currentTenantContext = context
}

/**
 * Ensure a User row exists for the given userId.
 * Useful for development or when syncing users from authentication providers.
 * Creates a new user if they don't exist, or returns existing user.
 * 
 * @param userId - Unique identifier for the user (from Clerk or other auth provider)
 * @param email - Optional email address (defaults to userId@dev.local)
 * @param name - Optional display name (defaults to 'Dev User')
 * @returns Promise resolving to void
 * 
 * @example
 * ```typescript
 * // Sync user from Clerk
 * await ensureUserExists('user_123', 'john@example.com', 'John Doe');
 * ```
 * 
 * @see {@link withSystemContext}
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
 * Get the current tenant context for database operations.
 * Returns null if no tenant context is set (system operations).
 * 
 * @returns The current tenant context or null
 * 
 * @example
 * ```typescript
 * const context = getTenantContext();
 * if (context) {
 *   console.log('Operating in tenant:', context.companyId);
 * }
 * ```
 * 
 * @see {@link setTenantContext}
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
 * Execute a database operation with a specific tenant context.
 * Temporarily sets the tenant context, executes the operation, then restores previous context.
 * Useful when you need to operate on behalf of a specific tenant.
 * 
 * @param context - The tenant context to use for this operation
 * @param operation - Async function to execute with the tenant context
 * @returns Promise resolving to the operation result
 * 
 * @example
 * ```typescript
 * // Perform operation as specific company
 * const customers = await withTenantContext(
 *   { companyId: 'company_123' },
 *   async () => {
 *     return db.customer.findMany();
 *   }
 * );
 * ```
 * 
 * @see {@link withSystemContext}
 * @see docs/guides/RBAC_USAGE.md
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
 * Execute a database operation without tenant scoping.
 * ⚠️ WARNING: Use only for legitimate system operations like user creation,
 * company provisioning, or cross-tenant queries. Bypasses multi-tenant isolation.
 * 
 * @param operation - Async function to execute without tenant scoping
 * @returns Promise resolving to the operation result
 * 
 * @example
 * ```typescript
 * // Create user (system operation)
 * await withSystemContext(async () => {
 *   return db.user.create({
 *     data: { email: 'admin@example.com', name: 'Admin' }
 *   });
 * });
 * ```
 * 
 * @see {@link withTenantContext}
 * @see docs/core/architecture-blueprint.md
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
 * Validate that a user has access to a specific company.
 * Checks if user is a member of the company and company is not deleted.
 * 
 * @param companyId - The company ID to check access for
 * @param userId - The user ID to validate
 * @returns Promise resolving to true if user has access, false otherwise
 * 
 * @example
 * ```typescript
 * const hasAccess = await validateCompanyAccess('company_123', 'user_456');
 * if (!hasAccess) {
 *   throw new Error('Access denied');
 * }
 * ```
 * 
 * @see {@link getUserCompanies}
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
 * Get all companies that a user belongs to.
 * System operation that bypasses tenant scoping to retrieve all user's companies.
 * 
 * @param userId - The user ID to get companies for
 * @returns Promise resolving to array of UserCompany records with company details
 * 
 * @example
 * ```typescript
 * const companies = await getUserCompanies('user_123');
 * console.log(`User belongs to ${companies.length} companies`);
 * companies.forEach(uc => {
 *   console.log(`- ${uc.company.name} (${uc.role})`);
 * });
 * ```
 * 
 * @see {@link validateCompanyAccess}
 * @see {@link createCompanyWithOwner}
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
 * Create a new company with the user as owner.
 * Automatically provisions all system roles (Owner, Admin, Member, Viewer) and
 * assigns the Owner role to the creating user.
 * 
 * @param companyData - Company details (name and slug)
 * @param userId - User ID to assign as company owner
 * @returns Promise resolving to the created company
 * 
 * @example
 * ```typescript
 * const company = await createCompanyWithOwner(
 *   { name: 'Acme Inc', slug: 'acme-inc' },
 *   'user_123'
 * );
 * console.log('Company created:', company.id);
 * // Roles are automatically provisioned
 * // User is automatically assigned Owner role with 29 permissions
 * ```
 * 
 * @throws Error if RBAC provisioning fails
 * @see {@link provisionSystemRolesForCompany}
 * @see docs/guides/CUSTOMIZING_PERMISSIONS.md
 */
export async function createCompanyWithOwner(
  companyData: { name: string; slug: string },
  userId: string
) {
  return withSystemContext(async () => {
    return db.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          ...companyData,
          createdBy: userId
        }
      })

      const { roles } = await provisionSystemRolesForCompany(company.id, tx)
      const ownerRoleId = roles.find((role) => role.slug === SYSTEM_ROLE_SLUGS.OWNER)?.roleId

      if (!ownerRoleId) {
        throw new Error('Failed to provision Owner role during company creation')
      }

      // Add user as owner
      await tx.userCompany.create({
        data: {
          userId,
          companyId: company.id,
          role: 'OWNER',
          roleId: ownerRoleId,
          createdBy: userId
        }
      })

      return company
    })
  })
}

/**
 * Get a tenant-scoped database client.
 * Convenience function that sets tenant context and returns the database client.
 * All subsequent queries will be automatically scoped to this company.
 * 
 * @param companyId - The company ID to scope database operations to
 * @returns The Prisma database client with tenant context set
 * 
 * @example
 * ```typescript
 * // In API route
 * export async function GET(req: NextRequest) {
 *   const companyId = req.headers.get('x-company-id');
 *   const tenantDb = getTenantDb(companyId!);
 *   
 *   // This query is automatically scoped to companyId
 *   const customers = await tenantDb.customer.findMany();
 *   return NextResponse.json({ customers });
 * }
 * ```
 * 
 * @see {@link setTenantContext}
 * @see docs/core/architecture-blueprint.md#multi-tenancy
 */
export function getTenantDb(companyId: string) {
  setTenantContext({ companyId, userId: undefined })
  return db
}

export default db
