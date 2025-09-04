import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiMiddleware, successResponse, throwApiError, ApiContext, requireRole } from '@/lib/api-middleware'
import { getTenantDb } from '@/core/db/client'

// Validation schemas
const updateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/customers/[id] - Get a specific customer
 */
export const GET = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { companyId, params, userRole } = context
    
    // Require MEMBER role or higher to read customers
    requireRole(userRole, 'MEMBER', 'reading customers')
    
    const db = getTenantDb(companyId!)
    const customerId = params.id

    const customer = await db.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
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

    if (!customer) {
      throwApiError('Customer not found', 404)
    }

    return successResponse(customer)
  },
  {
    requireAuth: true,
    requireCompany: true,
    allowedMethods: ['GET'],
    rateLimit: true,
  }
)

/**
 * PUT /api/customers/[id] - Update a customer
 */
export const PUT = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { companyId, userId, validatedData, params, userRole } = context
    
    // Require ADMIN role or higher to update customers
    requireRole(userRole, 'ADMIN', 'updating customers')
    
    const db = getTenantDb(companyId!)
    const customerId = params.id

    // Check if customer exists
    const existingCustomer = await db.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
      },
    })

    if (!existingCustomer) {
      throwApiError('Customer not found', 404)
    }

    // Check for email conflicts if email is being updated
    if (validatedData.email && validatedData.email !== existingCustomer.email) {
      const emailConflict = await db.customer.findFirst({
        where: {
          email: validatedData.email,
          id: { not: customerId },
          deletedAt: null,
        },
      })

      if (emailConflict) {
        throwApiError('Customer with this email already exists', 409)
      }
    }

    const customer = await db.customer.update({
      where: { id: customerId },
      data: {
        ...validatedData,
        updatedBy: userId!,
        updatedAt: new Date(),
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

    return successResponse(customer, 'Customer updated successfully')
  },
  {
    requireAuth: true,
    requireCompany: true,
    allowedMethods: ['PUT'],
    validateSchema: updateCustomerSchema,
    rateLimit: true,
  }
)

/**
 * DELETE /api/customers/[id] - Soft delete a customer
 */
export const DELETE = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { companyId, userId, params, userRole } = context
    
    // Require OWNER role to delete customers
    requireRole(userRole, 'OWNER', 'deleting customers')
    
    const db = getTenantDb(companyId!)
    const customerId = params.id

    // Check if customer exists
    const existingCustomer = await db.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
      },
    })

    if (!existingCustomer) {
      throwApiError('Customer not found', 404)
    }

    // Soft delete
    await db.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: new Date(),
        updatedBy: userId!,
        updatedAt: new Date(),
      },
    })

    return successResponse(null, 'Customer deleted successfully')
  },
  {
    requireAuth: true,
    requireCompany: true,
    allowedMethods: ['DELETE'],
    rateLimit: true,
  }
)
