# Company Context Documentation

This file documents the company context system used for multi-tenant authentication.

## Current Implementation

The company context is now implemented in `company-provider.tsx` with support for both development and production modes.

### Development Mode (Keyless)
- Automatically enabled when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is not set
- Uses mock companies for testing
- Shows development company switcher widget
- Company preferences stored in localStorage

### Production Mode (Clerk)
- Enabled when Clerk keys are properly configured
- Integrates with Clerk authentication
- Fetches real company data from API
- Company preferences stored in Clerk user metadata

## API Routes (App Router)

### GET /api/companies
Fetches companies for the authenticated user.

```typescript
// /src/app/api/companies/route.ts
import { withApiMiddleware, successResponse } from '@/lib/api-middleware'
import { db, withSystemContext } from '@/core/db/client'

export const GET = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userId } = context

    const companies = await withSystemContext(async () => {
      return db.company.findMany({
        where: {
          deletedAt: null,
          users: {
            some: {
              userId: userId!,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          users: {
            where: {
              userId: userId!,
            },
            select: {
              role: true,
            }
          }
        },
      })
    })

    const companiesWithRole = companies.map((company: any) => ({
      ...company,
      role: company.users[0]?.role || 'MEMBER',
      users: undefined,
    }))

    return successResponse(companiesWithRole)
  },
  {
    requireAuth: true,
    allowedMethods: ['GET'],
    rateLimit: true,
  }
)
```

## Usage

```typescript
import { useCompany, useCurrentCompany } from '@/core/auth/company-provider'

function MyComponent() {
  const { currentCompany, companies, switchCompany } = useCompany()
  const company = useCurrentCompany() // Throws if no company selected
  
  return (
    <div>
      <h1>{company.name}</h1>
      <select onChange={(e) => switchCompany(e.target.value)}>
        {companies.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}
```

## See Also

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Complete authentication guide
- [TENANTING.md](./TENANTING.md) - Multi-tenancy architecture
