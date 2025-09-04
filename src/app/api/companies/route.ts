import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiMiddleware, successResponse, throwApiError, ApiContext } from '@/lib/api-middleware'
import { db, withSystemContext, ensureUserExists } from '@/core/db/client'

// Validation schemas
const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  slug: z.string().min(1, 'Company slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
})

const updateCompanySchema = createCompanySchema.partial()

/**
 * GET /api/companies - List all companies for the current user
 */
export const GET = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userId } = context

    const companies = await withSystemContext(async () => {
      return db.company.findMany({
        where: {
          deletedAt: null,
          users: {
            some: {
              userId: userId!,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          users: {
            where: {
              userId: userId!,
            },
            select: {
              role: true,
            }
          }
        },
      })
    })

    // Transform to include user role
    const companiesWithRole = companies.map((company: any) => ({
      ...company,
      role: company.users[0]?.role || 'MEMBER',
      users: undefined, // Remove users array from response
    }))

    return successResponse(companiesWithRole)
  },
  {
    requireAuth: true,
    allowedMethods: ['GET'],
    rateLimit: true,
  }
)

/**
 * POST /api/companies - Create a new company
 */
export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userId, validatedData } = context
    // Use system context for company creation

    // In dev keyless mode, ensure stub user exists so relation constraints pass
    if (userId) {
      await ensureUserExists(userId)
    }

    return withSystemContext(async () => {
      // Check if slug already exists
      const existingCompany = await db.company.findFirst({
      where: {
        slug: validatedData.slug,
        deletedAt: null,
      },
    })

    if (existingCompany) {
      throwApiError('Company with this slug already exists', 409)
    }

    // Create company and add user as owner
    const company = await db.company.create({
      data: {
        ...validatedData,
        createdBy: userId!,
        updatedBy: userId!,
        users: {
          create: {
            userId: userId!,
            role: 'OWNER',
            createdBy: userId!,
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    })

      return successResponse({ ...company, role: 'OWNER' }, 'Company created successfully')
    })
  },
  {
    requireAuth: true,
    allowedMethods: ['POST'],
    validateSchema: createCompanySchema,
    rateLimit: true,
  }
)
