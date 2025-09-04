import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiMiddleware, successResponse, throwApiError, ApiContext, requireRole } from '@/lib/api-middleware'
import { getTenantDb } from '@/core/db/client'

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

const updateCustomerSchema = createCustomerSchema.partial()

/**
 * GET /api/customers - List all customers for the current company
 */
export const GET = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { companyId, userRole } = context
    
    // Require MEMBER role or higher to list customers
    requireRole(userRole, 'MEMBER', 'listing customers')
    
    const db = getTenantDb(companyId!)

    const customers = await db.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse(customers)
  },
  {
    requireAuth: true,
    requireCompany: true,
    allowedMethods: ['GET'],
    rateLimit: true,
  }
)

/**
 * POST /api/customers - Create a new customer
 */
export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { companyId, userId, validatedData, userRole } = context
    
    // Require ADMIN role or higher to create customers
    requireRole(userRole, 'ADMIN', 'creating customers')
    
    const db = getTenantDb(companyId!)

    // Check if customer with same email already exists
    if (validatedData.email) {
      const existingCustomer = await db.customer.findFirst({
        where: {
          email: validatedData.email,
          deletedAt: null,
        },
      })

      if (existingCustomer) {
        throwApiError('Customer with this email already exists', 409)
      }
    }

    const customer = await db.customer.create({
      data: {
        ...validatedData,
        companyId: companyId!,
        createdBy: userId!,
        updatedBy: userId!,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse(customer, 'Customer created successfully')
  },
  {
    requireAuth: true,
    requireCompany: true,
    allowedMethods: ['POST'],
    validateSchema: createCustomerSchema,
    rateLimit: true,
  }
)
