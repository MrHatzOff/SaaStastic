import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiMiddleware, successResponse, throwApiError, ApiContext } from '@/shared/lib/api-middleware'
import { db, withSystemContext } from '@/core/db/client'

// Next.js 15 route segment config
export const dynamic = 'force-dynamic'

// Validation schemas
const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  slug: z.string().min(1, 'Company slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
})

/**
 * GET /api/companies/[id] - Get a specific company
 */
export const GET = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userId, params } = context
    const companyId = params.id

    const company = await withSystemContext(async () => {
      return db.company.findFirst({
        where: {
          id: companyId,
          deletedAt: null,
          users: {
            some: {
              userId: userId!,
            }
          }
        },
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

    if (!company) {
      throwApiError('Company not found', 404)
    }

    return successResponse({
      ...company,
      role: company.users[0]?.role || 'MEMBER',
      users: undefined,
    })
  },
  {
    requireAuth: true,
    allowedMethods: ['GET'],
    rateLimit: true,
  }
)

/**
 * PUT /api/companies/[id] - Update a company
 */
export const PUT = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userId, validatedData, params } = context
    const companyId = params.id

    return withSystemContext(async () => {
      // Check if user has permission to update company
      const userCompany = await db.userCompany.findFirst({
        where: {
          companyId,
          userId: userId!,
          role: { in: ['OWNER', 'ADMIN'] }, // Only owners and admins can update
        },
      })

      if (!userCompany) {
        throwApiError('Permission denied. Only company owners and admins can update company information.', 403)
      }

      // Check if company exists
      const existingCompany = await db.company.findFirst({
        where: {
          id: companyId,
          deletedAt: null,
        },
      })

      if (!existingCompany) {
        throwApiError('Company not found', 404)
      }

      // Check for slug conflicts if slug is being updated
      const data = validatedData as { slug?: string; name?: string; [key: string]: unknown }
      if (data.slug && data.slug !== existingCompany.slug) {
        const slugConflict = await db.company.findFirst({
          where: {
            slug: data.slug,
            id: { not: companyId },
            deletedAt: null,
          },
        })

        if (slugConflict) {
          throwApiError('Company with this slug already exists', 409)
        }
      }

      const company = await db.company.update({
        where: { id: companyId },
        data: {
          ...data,
          updatedBy: userId!,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return successResponse({ ...company, role: userCompany.role }, 'Company updated successfully')
    })
  },
  {
    requireAuth: true,
    allowedMethods: ['PUT'],
    validateSchema: updateCompanySchema,
    rateLimit: true,
  }
)

/**
 * DELETE /api/companies/[id] - Soft delete a company
 */
export const DELETE = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userId, params } = context
    const companyId = params.id

    return withSystemContext(async () => {
      // Check if user is company owner
      const userCompany = await db.userCompany.findFirst({
        where: {
          companyId,
          userId: userId!,
          role: 'OWNER', // Only owners can delete companies
        },
      })

      if (!userCompany) {
        throwApiError('Permission denied. Only company owners can delete companies.', 403)
      }

      // Check if company exists
      const existingCompany = await db.company.findFirst({
        where: {
          id: companyId,
          deletedAt: null,
        },
      })

      if (!existingCompany) {
        throwApiError('Company not found', 404)
      }

      // Soft delete company and all related data
      await db.$transaction([
        // Delete company
        db.company.update({
          where: { id: companyId },
          data: {
            deletedAt: new Date(),
            updatedBy: userId!,
            updatedAt: new Date(),
          },
        }),
        // Delete all customers
        db.customer.updateMany({
          where: { companyId },
          data: {
            deletedAt: new Date(),
            updatedBy: userId!,
            updatedAt: new Date(),
          },
        }),
      ])

      return successResponse(null, 'Company deleted successfully')
    })
  },
  {
    requireAuth: true,
    allowedMethods: ['DELETE'],
    rateLimit: true,
  }
)
