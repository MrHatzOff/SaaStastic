import { z } from 'zod'

/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at startup to ensure
 * the application has proper configuration before running.
 */

// Base schema shared across environments
const baseSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid PostgreSQL URL').optional(),

  // Error Tracking
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Feature Flags
  ENABLE_ANALYTICS: z.string().optional().transform(val => val === 'true').default(false),
  ENABLE_DEBUG_LOGGING: z.string().optional().transform(val => val === 'true').default(false),

  // Email (future use)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(val => (val ? parseInt(val) : undefined)).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // File Storage (future use)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
})

// Development/Test: Clerk keys optional; NEXTAUTH_SECRET len not enforced
const devSchema = baseSchema.extend({
  // Clerk Authentication (optional in dev/test)
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

  // NextAuth (optional for future use)
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Rate Limiting (optional)
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
})

// Production: Clerk keys required; strong NextAuth secret if provided
const prodSchema = baseSchema.extend({
  // Clerk Authentication (required in production)
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),

  // NextAuth (optional, but if present must be strong)
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Rate Limiting (optional)
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
})

// Select schema based on environment
const envSchema = (process.env.NODE_ENV === 'production') ? prodSchema : devSchema

export type Env = z.infer<typeof envSchema>

/**
 * Validate and parse environment variables
 * Throws an error if validation fails
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

// Validate environment variables at module load
export const env = validateEnv()

/**
 * Type-safe environment variable access
 * Use this instead of process.env for better type safety
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  return env[key]
}

/**
 * Check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Check if we're in production mode
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test'

/**
 * Get database URL with fallback to DIRECT_URL for migrations
 */
export const getDatabaseUrl = (forMigration = false): string => {
  if (forMigration && env.DIRECT_URL) {
    return env.DIRECT_URL
  }
  return env.DATABASE_URL
}

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = env.ENABLE_ANALYTICS

/**
 * Check if debug logging is enabled
 */
export const isDebugLoggingEnabled = env.ENABLE_DEBUG_LOGGING || isDevelopment
