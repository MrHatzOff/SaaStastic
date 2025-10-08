import { withApiMiddleware, createApiResponse } from '@/shared/lib/api-middleware'

export const GET = withApiMiddleware(
  async () => {
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
