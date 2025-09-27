import { NextRequest } from 'next/server'
import { withApiMiddleware, createApiResponse, ApiContext } from '@/shared/lib/api-middleware'

export const GET = withApiMiddleware(
  async (_req: NextRequest, _context: ApiContext) => {
    return createApiResponse(true, {
      status: 'ok',
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    })
  },
  {
    allowedMethods: ['GET'],
  }
)
