import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiMiddleware, successResponse, throwApiError, requireRole } from '@/shared/lib'
import type { ApiContext } from '@/shared/lib'
import { db } from '@/core/shared'

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

// const updateCustomerSchema = createCustomerSchema.partial()

/**
 * GET /api/customers - List all customers for the current company
 */
export const GET = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userRole } = context
    
    // Require MEMBER role or higher to list customers
    requireRole(userRole, 'MEMBER', 'listing customers')
    
    // Use the global db instance - tenant scoping handled by middleware
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
    
    // Use the global db instance - tenant scoping handled by middleware
    
    // Check for email conflicts
    const data = validatedData as { email?: string; name?: string; [key: string]: unknown }
    if (data.email) {
      const existingCustomer = await db.customer.findFirst({
        where: {
          email: data.email,
          deletedAt: null,
          companyId: companyId!,
        },
      })

      if (existingCustomer) {
        throwApiError('Customer with this email already exists', 409)
      }
    }

    const customer = await db.customer.create({
      data: {
        name: (data.name as string) || '',
        email: data.email as string,
        phone: data.phone as string || null,
        notes: data.notes as string || null,
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
