---
activation: always
priority: high
description: "Core architecture patterns and multi-tenant requirements that must always be enforced"
---

# Core Architecture Rules

## File Structure Requirements

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

## Tech Stack Requirements

### Required Technologies
- **Frontend**: Next.js 15+, React 19+, TypeScript 5+
- **Styling**: TailwindCSS 4+ with custom design system
- **Database**: PostgreSQL with Prisma ORM 6+
- **Authentication**: Clerk (production) + dev company switcher (development)
- **Validation**: Zod for all API inputs and form schemas
- **State Management**: React Query for server state, React Context for client state

## Multi-Tenancy & Database Rules

### Database Requirements
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

## Prohibited Practices

### Security Violations
- Never bypass `companyId` scoping in database queries
- Never expose sensitive data in client-side code
- Never commit secrets or API keys to version control

### Architecture Violations
- Do not introduce global state outside designated providers
- Do not duplicate business logic across modules
- Do not create circular dependencies between modules
- Do not bypass validation in API routes

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
