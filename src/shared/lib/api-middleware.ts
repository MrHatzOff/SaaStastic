import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { setTenantContext } from '@/core/db/client'

// Global database instance for middleware (not tenant-scoped)
const db = new PrismaClient()

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 10 // 10 requests per minute for mutating operations

// Initialize Upstash Redis client (only if environment variables are available)
let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// Initialize rate limiter with Upstash or fallback to in-memory
const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, `${RATE_LIMIT_WINDOW_MS / 1000}s`),
      analytics: true,
    })
  : null

// Fallback in-memory rate limiter for development
const rateBuckets = new Map<string, { count: number; windowStart: number }>()

function inMemoryRateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false
  bucket.count += 1
  return true
}

// Rate limiting function that uses Upstash when available
async function checkRateLimit(identifier: string): Promise<boolean> {
  if (ratelimit) {
    try {
      const result = await ratelimit.limit(identifier)
      return result.success
    } catch (error) {
      console.error('Upstash rate limit error:', error)
      // Fallback to in-memory on error
      return inMemoryRateLimit(identifier)
    }
  }
  // Use in-memory fallback
  return inMemoryRateLimit(identifier)
}

/**
 * API Response wrapper with consistent structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Create standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success,
    data,
    error,
    message,
  })
}

/**
 * Enhanced API Error class with error codes and categories
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string,
    public category?: string
  ) {
    super(message)
    this.name = 'ApiError'
    
    // Auto-assign category based on status code if not provided
    if (!this.category) {
      if (statusCode >= 400 && statusCode < 500) {
        this.category = 'CLIENT_ERROR'
      } else if (statusCode >= 500) {
        this.category = 'SERVER_ERROR'
      } else {
        this.category = 'UNKNOWN'
      }
    }
    
    // Auto-assign error code if not provided
    if (!this.code) {
      switch (statusCode) {
        case 400:
          this.code = 'BAD_REQUEST'
          break
        case 401:
          this.code = 'UNAUTHORIZED'
          break
        case 403:
          this.code = 'FORBIDDEN'
          break
        case 404:
          this.code = 'NOT_FOUND'
          break
        case 409:
          this.code = 'CONFLICT'
          break
        case 429:
          this.code = 'RATE_LIMITED'
          break
        case 500:
          this.code = 'INTERNAL_ERROR'
          break
        default:
          this.code = 'UNKNOWN_ERROR'
      }
    }
  }
}

/**
 * Predefined error types for common scenarios
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', 'CLIENT_ERROR')
    this.details = details
  }
  details?: unknown
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR', 'CLIENT_ERROR')
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR', 'CLIENT_ERROR')
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', 'CLIENT_ERROR')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR', 'CLIENT_ERROR')
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR', 'CLIENT_ERROR')
  }
}

/**
 * Helper to resolve params (handles Next.js 15 Promise-based params)
 */
async function resolveParams(params?: Record<string, string> | Promise<Record<string, string>>): Promise<Record<string, string>> {
  if (!params) return {}
  if (params instanceof Promise) {
    return await params
  }
  return params
}

/**
 * API middleware options
 */
export interface ApiMiddlewareOptions {
  requireAuth?: boolean
  requireCompany?: boolean
  allowedMethods?: string[]
  rateLimit?: boolean
  validateSchema?: z.ZodSchema
}

/**
 * Main API middleware wrapper
 */
export function withApiMiddleware(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = {}
) {
  return async (req: NextRequest, routeContext?: { params?: Record<string, string> | Promise<Record<string, string>> }): Promise<NextResponse> => {
    const startTime = Date.now()
    const url = req.url
    const method = req.method

    // Declare variables at function scope for error logging
    let userId: string | null = null
    let companyId: string | null = null
    let userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null = null

    try {
      // Method validation
      if (options.allowedMethods && !options.allowedMethods.includes(req.method!)) {
        return createApiResponse(false, null, `Method ${req.method} not allowed`, undefined)
      }

      // Rate limiting for mutating operations
      if (options.rateLimit && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method!)) {
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1'
        const rateOk = await checkRateLimit(ip)
        if (!rateOk) {
          return NextResponse.json(
            { success: false, error: 'Rate limit exceeded' },
            { status: 429 }
          )
        }
      }

      // Authentication
      if (options.requireAuth || options.requireCompany) {
        try {
          // CRITICAL FIX: In Clerk 6.x with Next.js 15 App Router,
          // auth() returns a Promise in API routes that must be awaited
          const authData = await auth()
          
          // Extract userId from auth data
          const authUserId = authData?.userId || null
          
          if (!authUserId) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Authentication required',
                code: 'UNAUTHENTICATED'
              },
              { status: 401 }
            )
          }

          userId = authUserId
          
          // Don't try to get companyId from metadata yet - let it be fetched from database
          companyId = null

          // If companyId still not found, try to get it from user companies
          if (!companyId && authUserId) {
            try {
              const userCompany = await db.userCompany.findFirst({
                where: { userId: authUserId },
                select: { companyId: true },
                orderBy: { createdAt: 'desc' }
              })
              companyId = userCompany?.companyId || null
            } catch (error) {
              console.error('Failed to fetch user company:', error)
              // Don't fail the request if we can't fetch the company
            }
          }

          if (options.requireCompany && !companyId) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Company context required',
                code: 'COMPANY_REQUIRED'
              },
              { status: 403 }
            )
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return NextResponse.json(
            { 
              success: false, 
              error: 'Authentication failed',
              code: 'AUTH_ERROR'
            },
            { status: 401 }
          )
        }

        // Fetch user role for the company if we have both userId and companyId
        if (userId && companyId) {
          try {
            const userCompany = await db.userCompany.findFirst({
              where: {
                userId: userId,
                companyId: companyId,
              },
              select: {
                role: true,
              },
            })
            userRole = userCompany?.role || null
          } catch (error) {
            console.error('Failed to fetch user role:', error)
            userRole = null
          }
        }
      }

      // Request body validation
      let validatedData: unknown = null
      if (options.validateSchema && ['POST', 'PUT', 'PATCH'].includes(req.method!)) {
        try {
          const body = await req.json()
          validatedData = options.validateSchema.parse(body)
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              {
                success: false,
                error: 'Validation failed',
                details: error.issues.map((issue) => ({
                  path: issue.path.join('.'),
                  message: issue.message,
                })),
              },
              { status: 400 }
            )
          }
          throw error
        }
      }

      // Set tenant context for database operations
      if (companyId && userId) {
        setTenantContext({ companyId, userId })
      }

      // Create context
      const context: ApiContext = {
        userId,
        companyId,
        userRole,
        validatedData,
        params: (await resolveParams(routeContext?.params)) || {},
      }

      // Call the actual handler
      const response = await handler(req, context)
      const duration = Date.now() - startTime
      
      // TODO: Replace with proper structured logging service in production
      // console.log(`[${new Date().toISOString()}] ${method} ${url} - ${response.status} - ${duration}ms - user:${userId || 'anon'} - company:${companyId || 'none'} - role:${userRole || 'none'}`)

      return response

    } catch (error) {
      const duration = Date.now() - startTime
      
      // Ensure we have safe values for logging
      const safeUserId = (typeof userId === 'string') ? userId : 'anon'
      const safeCompanyId = (typeof companyId === 'string') ? companyId : 'none'
      const safeUserRole = (typeof userRole === 'string') ? userRole : 'none'
      
      console.error(`[${new Date().toISOString()}] ${method} ${url} - ERROR - ${duration}ms - user:${safeUserId} - company:${safeCompanyId} - role:${safeUserRole}`, error)

      if (error instanceof ApiError) {
        return NextResponse.json(
          { 
            success: false, 
            error: error.message,
            code: error.code,
            category: error.category
          },
          { status: error.statusCode }
        )
      }
      // For unknown errors, don't leak stack traces
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR',
          category: 'SERVER_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * API Context passed to API handlers
 */
export interface ApiContext {
  userId: string | null
  companyId: string | null
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null
  validatedData: unknown
  params: Record<string, string>
}

/**
 * Helper to throw API errors
 */
export function throwApiError(message: string, statusCode: number = 400, code?: string): never {
  throw new ApiError(message, statusCode, code)
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return createApiResponse(true, data, undefined, message)
}

/**
 * Error response helper
 */
export function errorResponse(error: string, statusCode: number = 400): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error },
    { status: statusCode }
  )
}

/**
 * Role hierarchy for permission checks
 */
const ROLE_HIERARCHY = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
}

/**
 * Check if user has required role or higher
 */
export function hasRole(userRole: string | null, requiredRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'): boolean {
  if (!userRole) return false
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole]
  return userLevel >= requiredLevel
}

/**
 * Validate user has required role, throw error if not
 */
export function requireRole(userRole: string | null, requiredRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER', action: string): void {
  if (!hasRole(userRole, requiredRole)) {
    throwApiError(`Insufficient permissions. ${action} requires ${requiredRole} role or higher.`, 403)
  }
}
