# Core Architecture Rules

**Purpose**: Non-negotiable architectural patterns and multi-tenant requirements that must always be enforced in SaaStastic.

**Priority**: HIGH  
**Activation**: Always

---

## File Structure Requirements

### Core Architecture
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - Reusable UI components organized by domain
- `/src/lib/` - Utility functions, configurations, and shared logic
- `/src/core/auth/` - Multi-tenant authentication abstraction (Clerk)
- `/src/core/db/` - Database client, middleware, and tenant guards
- `/src/core/rbac/` - Role-based access control provisioning
- `/src/features/` - Feature modules organized by business domain
- `/src/shared/` - Cross-module UI components, hooks, and utilities
- `/prisma/schema.prisma` - Single source of truth for database schema

### Module Organization
- Each module must have: `components/`, `hooks/`, `types/`, `utils/`
- API routes in `/src/app/api/[module]/` following RESTful conventions
- Server actions in `/src/lib/actions/[module]/` with proper validation

### Safe Customization Zones
- **Custom Features**: `/src/features/custom/` - All new business logic goes here
- **Custom Pages**: `/src/app/(app)/custom/` - All new application pages
- **Custom APIs**: `/src/app/api/custom/` - All new API endpoints
- **Protected Core**: Never modify `/src/core/**/*` files

---

## Tech Stack Requirements

### Required Technologies
- **Frontend**: Next.js 15+, React 19+, TypeScript 5+
- **Styling**: TailwindCSS 4+ with custom design system
- **Database**: PostgreSQL with Prisma ORM 6+
- **Authentication**: Clerk (production authentication provider)
- **Validation**: Zod for all API inputs and form schemas
- **State Management**: React Query for server state, React Context for client state

### Why These Technologies?
- **Next.js 15**: Server components, streaming, edge runtime support
- **React 19**: Latest performance improvements and features
- **TypeScript 5**: Enhanced type safety and developer experience
- **Prisma 6**: Type-safe database access with migrations
- **Clerk**: Production-ready auth with multi-tenant support
- **Zod**: Runtime validation with TypeScript inference

---

## Multi-Tenancy & Database Rules

### Database Requirements
- **All tenant-scoped models MUST include `companyId` field**
- Use Prisma middleware for automatic tenant scoping
- Include proper database indexes for performance (especially on `companyId`)
- Implement soft deletes with `deletedAt` timestamps
- Add audit fields: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`

### Multi-Tenant Pattern
```prisma
model YourModel {
  id          String   @id @default(cuid())
  companyId   String   // 🔒 REQUIRED for multi-tenancy
  
  // Your business fields
  name        String
  description String?
  
  // Audit trail (best practice)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime? // Soft delete
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Indexes (CRITICAL for performance)
  @@index([companyId])
  @@index([deletedAt])
}
```

### Query Pattern
```typescript
// ❌ WRONG - Security vulnerability!
const records = await db.yourModel.findMany();

// ✅ CORRECT - Tenant isolated
const records = await db.yourModel.findMany({
  where: { 
    companyId: context.companyId,
    deletedAt: null // Exclude soft-deleted
  }
});
```

---

## Security Requirements

### API Security (Non-Negotiable)
- **Implement rate limiting on all API routes**
- **Use CSRF protection for state-changing operations**
- **Validate all inputs with Zod schemas**
- **Implement proper CORS configuration**
- **Use security headers** (CSP, HSTS, X-Frame-Options, etc.)
- **All API routes MUST use `withPermissions()` middleware**

### Authentication Pattern
```typescript
import { auth } from '@clerk/nextjs/server';

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  // Render page
}
```

### API Authorization Pattern
```typescript
import { withPermissions, PERMISSIONS } from '@/shared/lib';

export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // context.companyId - Automatically scoped
    // context.userId - Authenticated user
    // context.permissions - User's permission set
    
    // Your implementation
  },
  [PERMISSIONS.FEATURE_CREATE] // Required permission
);
```

---

## Prohibited Practices

### Security Violations (NEVER DO THIS)
- ❌ Never bypass `companyId` scoping in database queries
- ❌ Never expose sensitive data in client-side code
- ❌ Never commit secrets or API keys to version control
- ❌ Never trust client-provided IDs without validation
- ❌ Never use `any` type in TypeScript (use `unknown` if needed)

### Architecture Violations (AVOID)
- ❌ Do not introduce global state outside designated providers
- ❌ Do not duplicate business logic across modules
- ❌ Do not create circular dependencies between modules
- ❌ Do not bypass validation in API routes
- ❌ Do not modify files in `/src/core/**/*` directory

---

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saastastic"

# Authentication (Clerk)
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Monitoring (Optional)
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Feature Flags
NODE_ENV="development|production|test"
```

### Environment File Security
- **Never commit `.env.local` to git**
- Use `.env.example` as template
- Document all required variables
- Use different credentials per environment
- Rotate secrets regularly

---

## API Design Patterns

### RESTful Conventions
- `GET /api/resource` - List resources
- `GET /api/resource/[id]` - Get single resource
- `POST /api/resource` - Create resource
- `PATCH /api/resource/[id]` - Update resource
- `DELETE /api/resource/[id]` - Delete/soft-delete resource

### Response Format
```typescript
// Success
{
  "success": true,
  "data": { /* result */ }
}

// Error
{
  "error": "Error message",
  "details": [ /* validation errors */ ]
}
```

### Input Validation Pattern
```typescript
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// In API route
const data = createSchema.parse(body); // Throws on invalid
```

---

## Performance Guidelines

### Database Optimization
- **Always add indexes on `companyId`** for tenant-scoped models
- Use `select` to limit returned fields
- Implement pagination for list endpoints
- Use database transactions for multi-step operations
- Avoid N+1 queries (use `include` or separate queries)

### Frontend Optimization
- Use React Server Components where possible
- Implement proper loading states
- Use React Query for caching
- Lazy load heavy components
- Optimize images with Next.js Image component

---

## Testing Requirements

### Test Coverage Goals
- Unit tests for all service functions
- Integration tests for all API routes
- E2E tests for critical user workflows
- Permission tests for RBAC enforcement
- Multi-tenant isolation tests

### Test Pattern
```typescript
import { describe, it, expect } from 'vitest';

describe('CustomerService', () => {
  it('should enforce multi-tenant isolation', async () => {
    const company1Data = await service.getCustomers('company-1');
    const company2Data = await service.getCustomers('company-2');
    
    expect(company1Data).not.toContainEqual(
      expect.objectContaining({ companyId: 'company-2' })
    );
  });
});
```

---

## Migration Guidelines

### Database Migration Process
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Review generated SQL in `prisma/migrations/`
4. Test migration on development database
5. Commit migration files to git
6. Run migration on staging, then production

### Migration Best Practices
- **Never modify existing migrations** (create new one instead)
- Test migrations on copy of production data
- Ensure migrations are reversible when possible
- Document breaking changes clearly
- Use transactions for data migrations

---

## Error Handling

### Standard Error Patterns
```typescript
try {
  // Operation
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  // Validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.errors },
      { status: 400 }
    );
  }
  
  // Permission errors
  if (error instanceof PermissionError) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    );
  }
  
  // Unexpected errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Documentation Requirements

### Code Documentation
- Add JSDoc comments for public functions
- Document complex logic with inline comments
- Keep README files updated
- Document API endpoints with examples
- Maintain changelog for breaking changes

### When to Document
- New features or modules
- Complex algorithms or business logic
- Security-critical code
- Non-obvious design decisions
- Workarounds for known issues

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test` and `npx playwright test`)
- [ ] TypeScript compilation successful (`npx tsc --noEmit`)
- [ ] Linting passed (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Clerk production keys set
- [ ] Error tracking configured (Sentry)
- [ ] Build successful (`npm run build`)
- [ ] Performance tested under load

---

**These rules are non-negotiable for maintaining the security, performance, and maintainability of SaaStastic.**

**Last Updated**: October 14, 2025  
**Priority**: HIGH  
**Enforcement**: Always
