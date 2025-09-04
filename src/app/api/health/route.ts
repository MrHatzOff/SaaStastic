import { NextRequest } from 'next/server'
import { withApiMiddleware, createApiResponse, ApiContext } from '@/lib/api-middleware'

export const GET = withApiMiddleware(
  async (req: NextRequest, _context: ApiContext) => {
    const devKeyless = process.env.NODE_ENV === 'development' && !process.env.CLERK_SECRET_KEY
    const companyId = req.cookies.get('dev-company-id')?.value || null

    return createApiResponse(true, {
      status: 'ok',
      env: process.env.NODE_ENV,
      devKeyless,
      companyId,
    })
  },
  {
    allowedMethods: ['GET'],
  }
)
