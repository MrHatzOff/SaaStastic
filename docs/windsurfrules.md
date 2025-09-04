# Windsurf Rules for Multi-Tenant SaaS Boilerplate

## Description
Windsurf rules to enforce multi-tenant SaaS architecture, tech stack, and coding standards for reusable boilerplate applications.

## File Structure Rules

### Core Architecture
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - Reusable UI components organized by domain
- `/src/lib/` - Utility functions, configurations, and shared logic
- `/core/auth/` - Multi-tenant authentication abstraction (dev switcher + Clerk)
- `/core/db/` - Database client, middleware, and tenant guards
- `/core/observability/` - Logging, monitoring, and error tracking
- `/modules/` - Feature modules organized by business domain
- `/modules/shared/` - Cross-module UI components, hooks, and utilities
- `/prisma/schema.prisma` - Single source of truth for database schema

### Module Organization
- Each module must have: `components/`, `hooks/`, `types/`, `utils/`
- API routes in `/src/app/api/[module]/` following RESTful conventions
- Server actions in `/src/lib/actions/[module]/` with proper validation

## Tech Stack Rules

### Required Technologies
- **Frontend**: Next.js 15+, React 19+, TypeScript 5+
- **Styling**: TailwindCSS 4+ with custom design system
- **Database**: PostgreSQL with Prisma ORM 6+
- **Authentication**: Clerk (production) + dev company switcher (development)
- **Validation**: Zod for all API inputs and form schemas
- **State Management**: React Query for server state, React Context for client state

### Development Tools
- **Testing**: Playwright for E2E, Vitest for unit tests
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Error Tracking**: Sentry for production error monitoring
- **Performance**: Bundle analyzer and Core Web Vitals monitoring

## Coding Standards

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case for non-components (`user-utils.ts`)
- **Database**: snake_case for columns, PascalCase for models

### Code Organization
- Group by feature/domain, not by technical layer
- Use barrel exports (`index.ts`) for clean imports
- Implement proper error boundaries for each major feature
- All API routes must include input validation and error handling
- Use TypeScript strict mode with no `any` types

### Database & Multi-Tenancy
- All tenant-scoped models must include `companyId` field
- Use Prisma middleware for automatic tenant scoping
- Include proper database indexes for performance
- Implement soft deletes with `deletedAt` timestamps
- Add audit fields: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`

### Security Requirements
- Implement rate limiting on all API routes
- Use CSRF protection for state-changing operations
- Validate all inputs with Zod schemas
- Implement proper CORS configuration
- Use security headers (CSP, HSTS, etc.)

## API Design Patterns

### Server Actions
```typescript
// Use this pattern for all server actions
export async function createUser(data: CreateUserSchema) {
  const validatedData = createUserSchema.parse(data);
  const { userId } = auth();
  // Implementation with proper error handling
}
```

### API Routes
```typescript
// Use this pattern for all API routes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    // Implementation with tenant scoping
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}
```

## Testing Requirements

### Unit Tests
- All utility functions must have unit tests
- Database operations must have integration tests
- Use factories for test data generation

### E2E Tests
- Critical user flows must have E2E tests
- Multi-tenant isolation must be tested
- Authentication flows must be tested

## Performance Standards

### Core Web Vitals
- LCP < 2.5s for all pages
- FID < 100ms for all interactions
- CLS < 0.1 for all page loads

### Database Performance
- All queries must be optimized with proper indexes
- Use pagination for large data sets
- Implement query result caching where appropriate

## Prohibited Practices

### Security Violations
- Never bypass `companyId` scoping in database queries
- Never expose sensitive data in client-side code
- Never use `any` type in TypeScript
- Never commit secrets or API keys to version control

### Architecture Violations
- Do not introduce global state outside designated providers
- Do not duplicate business logic across modules
- Do not create circular dependencies between modules
- Do not bypass validation in API routes

### Performance Anti-Patterns
- Do not fetch data in components without proper loading states
- Do not create unnecessary re-renders with improper dependencies
- Do not use blocking operations in the main thread

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."

# Monitoring
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."

# Feature Flags
NODE_ENV="development|production"
```

## Documentation Requirements

### Code Documentation
- All public functions must have JSDoc comments
- Complex business logic must be documented inline
- API routes must have OpenAPI/Swagger documentation
- Database schema changes must be documented in migration files

### Project Documentation
- README.md with setup instructions and architecture overview
- CONTRIBUTING.md with development workflow and standards
- API documentation with example requests/responses
- Deployment guide with environment setup instructions
