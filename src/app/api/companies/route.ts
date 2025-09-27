import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/db/client'
import { withApiMiddleware, type ApiContext } from '@/shared/lib/api-middleware'

/**
 * GET /api/companies - List all companies for the current user
 */
export const GET = withApiMiddleware(
  async (_req: NextRequest, context: ApiContext) => {
    try {
      if (!context.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
          },
          { status: 401 }
        )
      }

      // Query companies that the user belongs to (CRITICAL: Multi-tenant security)
      const userCompanies = await db.userCompany.findMany({
        where: {
          userId: context.userId,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              createdAt: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Transform to match expected format and include role
      const companies = userCompanies.map(uc => ({
        id: uc.company.id,
        name: uc.company.name,
        slug: uc.company.slug,
        role: uc.role,
        createdAt: uc.company.createdAt,
      }))

      return NextResponse.json({
        success: true,
        data: companies,
        message: 'Companies retrieved successfully'
      })
    } catch (error) {
      console.error('Companies API error:', error)
      return NextResponse.json({
        success: false,
        error: 'Internal server error'
      }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  }
)

/**
 * POST /api/companies - Create a new company
 */
export const POST = withApiMiddleware(
  async (_req: NextRequest, context: ApiContext) => {
    try {
      const body = await _req.json()

      // Simple validation
      if (!body.name) {
        return NextResponse.json({
          success: false,
          error: 'Company name is required'
        }, { status: 400 })
      }

      // Auto-generate slug from company name
      const baseSlug = body.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 20); // Limit length
      
      const randomSuffix = Math.random().toString(36).substring(2, 5);
      const slug = `${baseSlug}-${randomSuffix}`;

      // Ensure user exists in database first
      if (!context.userId) {
        return NextResponse.json({
          success: false,
          error: 'User ID not found. Please sign in again.'
        }, { status: 401 })
      }

      const user = await db.user.findUnique({
        where: { id: context.userId },
      });

      if (!user) {
        // This should not happen if auth middleware is working correctly
        return NextResponse.json({
          success: false,
          error: 'User not found. Please sign in again.'
        }, { status: 400 })
      }

      // Use transaction to ensure atomicity
      const result = await db.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: body.name,
            slug: slug,
            createdBy: context.userId
          },
        });

        // Create UserCompany relationship with OWNER role
        const userCompany = await tx.userCompany.create({
          data: {
            userId: context.userId!,
            companyId: company.id,
            role: 'OWNER',
            createdBy: context.userId!,
          },
        });

        // Log the company creation
        await tx.eventLog.create({
          data: {
            action: 'company.created',
            userId: context.userId!,
            companyId: company.id,
            metadata: {
              companyName: company.name,
              companySlug: company.slug,
            },
          },
        });

        return { company, userCompany };
      });

      return NextResponse.json({
        success: true,
        data: {
          id: result.company.id,
          name: result.company.name,
          slug: result.company.slug,
          role: result.userCompany.role,
          createdAt: result.company.createdAt,
        },
        message: 'Company created successfully'
      })
    } catch (error: unknown) {
      console.error('Create company API error:', error)

      // Handle specific database errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Company slug already exists'
        }, { status: 409 })
      }

      return NextResponse.json({
        success: false,
        error: 'Internal server error'
      }, { status: 500 })
    }
  }
)
