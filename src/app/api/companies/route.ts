import { NextRequest } from 'next/server'
import { db } from '@/core/db/client'

/**
 * GET /api/companies - List all companies for the current user
 */
export const GET = async (req: NextRequest) => {
  try {
    // Query actual companies from database
    const companies = await db.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json({
      success: true,
      data: companies,
      message: 'Companies retrieved successfully'
    })
  } catch (error) {
    console.error('Companies API error:', error)
    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * POST /api/companies - Create a new company
 */
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()

    // Simple validation
    if (!body.name || !body.slug) {
      return Response.json({
        success: false,
        error: 'Name and slug are required'
      }, { status: 400 })
    }

    // Create company with minimal required fields
    const company = await db.company.create({
      data: {
        name: body.name,
        slug: body.slug,
        // Optional fields can be null/undefined
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    })

    return Response.json({
      success: true,
      data: company,
      message: 'Company created successfully'
    })
  } catch (error: any) {
    console.error('Create company API error:', error)

    // Handle specific database errors
    if (error.code === 'P2002') {
      return Response.json({
        success: false,
        error: 'Company slug already exists'
      }, { status: 409 })
    }

    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
