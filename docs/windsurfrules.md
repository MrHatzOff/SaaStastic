# Windsurf Rules for Complete Multi-Tenant B2B SaaS Boilerplate

## Description
Windsurf rules to enforce production-ready multi-tenant B2B SaaS architecture, covering the complete customer lifecycle from marketing to customer support and operations.

## File Structure Rules

### Core Architecture
- `/src/app/(marketing)/` - Public marketing pages (landing, pricing, about, contact)
- `/src/app/(app)/` - Protected SaaS application with tenant isolation
- `/src/app/(admin)/` - Support team portal with impersonation capabilities
- `/src/app/api/` - API routes with tenant scoping and validation
- `/src/components/` - Reusable UI components organized by domain
- `/src/lib/` - Utility functions, configurations, and shared logic
- `/core/auth/` - Multi-tenant authentication with Clerk integration
- `/core/db/` - Database client, middleware, and tenant guards
- `/core/observability/` - Comprehensive monitoring, logging, and analytics
- `/core/support/` - Customer support tools and impersonation system
- `/modules/` - Feature modules organized by business domain
- `/modules/shared/` - Cross-module UI components, hooks, and utilities
- `/prisma/schema.prisma` - Complete database schema with audit trails
- `/scripts/` - Backup, recovery, and maintenance automation

### Module Organization
- Each module must have: `components/`, `services/`, `schemas/`, `types/`, `hooks/`
- API routes in `/src/app/api/[module]/` following RESTful conventions
- Server actions in `/src/lib/actions/[module]/` with proper validation
- Business logic in `modules/[domain]/services/` with comprehensive error handling

## Tech Stack Rules

### Required Core Technologies
- **Frontend**: Next.js 15+, React 19+, TypeScript 5+
- **Styling**: TailwindCSS 4+ with custom design system
- **Database**: PostgreSQL with Prisma ORM 6+
- **Authentication**: Clerk with multi-tenant company context
- **Validation**: Zod for all API inputs and form schemas
- **State Management**: React Query for server state, React Context for client state
- **Rate Limiting**: Upstash Redis for API rate limiting

### Required Business Technologies
- **Payments**: Stripe for subscription and billing management
- **Email**: Resend for transactional emails and notifications
- **File Storage**: Cloudflare R2 for user-uploaded content
- **Error Tracking**: Sentry for production monitoring and alerting
- **Analytics**: PostHog for user behavior and product analytics
- **Monitoring**: Uptime Robot for service health monitoring

### Development Tools
- **Testing**: Playwright for E2E, Vitest for unit tests
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Performance**: Bundle analyzer and Core Web Vitals monitoring
- **CI/CD**: GitHub Actions for automated testing and deployment

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
- All tenant-scoped models must include `companyId` field with proper indexing
- Use Prisma middleware for automatic tenant scoping and security
- Include comprehensive database indexes for multi-tenant performance
- Implement soft deletes with `deletedAt` timestamps on all user data
- Add complete audit fields: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- Include billing models: `Subscription`, `Invoice`, `PaymentMethod`
- Add comprehensive audit logging with `EventLog` model
- Implement proper foreign key constraints with cascade deletes

### Security Requirements
- Implement comprehensive rate limiting on all API routes (per tenant and global)
- Use CSRF protection for all state-changing operations
- Validate all inputs with Zod schemas and sanitize outputs
- Implement proper CORS configuration for production
- Use comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
- Implement secure customer impersonation with audit trails and time limits
- Add intrusion detection and automated threat response
- Ensure all sensitive operations require proper authentication and authorization
- Implement input sanitization and XSS protection
- Add comprehensive logging for all security-relevant events

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

# Payments & Billing
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email & Communications
RESEND_API_KEY="re_..."

# File Storage
CLOUDFLARE_R2_ACCESS_KEY_ID="..."
CLOUDFLARE_R2_SECRET_ACCESS_KEY="..."
CLOUDFLARE_R2_BUCKET_NAME="..."

# Monitoring & Analytics
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."
POSTHOG_API_KEY="phc_..."
UPTIME_ROBOT_API_KEY="..."

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Feature Flags & Environment
NODE_ENV="development|production"
NEXT_PUBLIC_APP_URL="https://..."
ADMIN_EMAIL_DOMAINS="company.com,support.com"
```

## Business Logic Requirements

### Billing & Subscription Management
- All subscription operations must be idempotent and handle Stripe webhooks
- Implement proper dunning management for failed payments
- Support usage-based billing with accurate metering
- Generate PDF invoices with proper tax calculations
- Handle subscription lifecycle events (trials, upgrades, cancellations)

### Customer Support Infrastructure
- Implement secure impersonation with comprehensive audit trails
- Provide real-time system health monitoring and alerting
- Track user engagement and feature usage analytics
- Enable support team to view and search audit logs
- Implement automated backup verification and disaster recovery

### User Management & Teams
- Support role-based access control (Owner, Admin, Member, Viewer)
- Implement secure team member invitations with email verification
- Track user activity and maintain comprehensive audit logs
- Prepare infrastructure for future SSO integration
- Support bulk user operations with proper validation

## Documentation Requirements

### Code Documentation
- All public functions must have comprehensive JSDoc comments
- Complex business logic must be documented inline with examples
- API routes must have OpenAPI/Swagger documentation
- Database schema changes must be documented in migration files
- All security-sensitive code must include security considerations

### Project Documentation
- README.md with complete setup instructions and architecture overview
- PRD.md with comprehensive product requirements and implementation plan
- DEPLOYMENT.md with production deployment and operations guide
- API documentation with example requests/responses for all endpoints
- Troubleshooting guide for common issues and error scenarios
- Architecture decision records for major design choices
- Security audit documentation and compliance procedures
