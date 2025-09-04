# Multi-Tenant SaaS Boilerplate - Product Requirements Document

## Overview

This repository provides a **production-ready, reusable SaaS boilerplate** for building multi-tenant B2B applications. It emphasizes security, scalability, and developer experience with modern tools and best practices.

## Vision

Create the definitive starting point for multi-tenant SaaS applications that:
- **Scales from MVP to enterprise** with proper architecture foundations
- **Enforces security by default** with tenant isolation and modern auth
- **Accelerates development** with comprehensive tooling and documentation
- **Maintains code quality** through automated testing and clear standards

## Core Principles

### 1. Multi-Tenancy First
- All data models scoped by `companyId` from day one
- Automatic tenant isolation through Prisma middleware
- Row-level security ready for enterprise scale
- Company context enforced at middleware level

### 2. Security by Default
- Modern authentication with Clerk + development fallbacks
- Rate limiting on all API endpoints
- Input validation with Zod schemas
- Security headers and CSRF protection
- Comprehensive audit trails

### 3. Developer Experience
- Type-safe APIs with server actions
- Comprehensive Windsurf rules for AI coding
- Hot reload with proper error boundaries
- Automated testing and code quality tools

## Technical Architecture

### Tech Stack

#### Core Framework
- **Frontend**: Next.js 15+ with App Router
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: TailwindCSS 4+ with custom design system
- **Database**: PostgreSQL with Prisma ORM 6+

#### Authentication & Security
- **Production Auth**: Clerk with multi-tenant support
- **Development Auth**: Clerk Test mode (no keyless bypass) *[Updated 2025-09-03]*
- **Rate Limiting**: Upstash Redis-based limiting
- **Validation**: Zod for all inputs and schemas

#### State Management & APIs
- **Server State**: TanStack Query for caching and synchronization
- **Client State**: React Context for UI state
- **API Layer**: Next.js server actions with next-safe-action
- **Real-time**: Ready for WebSocket integration

#### Testing & Quality
- **E2E Testing**: Playwright for critical user flows
- **Unit Testing**: Vitest for utilities and business logic
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **Type Safety**: TypeScript strict mode, no `any` types

#### Observability & Performance
- **Error Tracking**: Sentry for production monitoring
- **Performance**: Bundle analyzer and Core Web Vitals
- **Logging**: Structured logging with tenant context
- **Health Checks**: API endpoints for system monitoring

### File Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth-related pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities and configurations
│   │   ├── actions/           # Server actions
│   │   ├── auth/              # Auth utilities
│   │   ├── db/                # Database client and utilities
│   │   └── validations/       # Zod schemas
├── core/                      # Core business logic
│   ├── auth/                  # Multi-tenant auth abstraction
│   ├── db/                    # Database middleware and guards
│   ├── observability/         # Logging and monitoring
│   └── security/              # Security utilities
├── modules/                   # Feature modules
│   ├── company/               # Company management
│   ├── customers/             # Customer management
│   └── shared/                # Cross-module utilities
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── tests/                     # Test files
│   ├── e2e/                   # Playwright tests
│   └── unit/                  # Unit tests
└── docs/                      # Documentation
```

## Database Schema

### Core Models

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  
  companies UserCompany[]
  feedback  Feedback[]
  logs      EventLog[]
  
  @@index([email])
  @@index([deletedAt])
}

model Company {
  id          String       @id @default(cuid())
  name        String
  slug        String       @unique
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?
  createdBy   String?
  updatedBy   String?
  
  users       UserCompany[]
  customers   Customer[]
  eventLogs   EventLog[]
  feedbacks   Feedback[]
  
  @@index([slug])
  @@index([deletedAt])
}

model UserCompany {
  id        String   @id @default(cuid())
  userId    String
  companyId String
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
  createdBy String?
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@unique([userId, companyId])
  @@index([companyId])
  @@index([userId])
}

model Customer {
  id        String   @id @default(cuid())
  name      String
  email     String?
  phone     String?
  notes     String?
  companyId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  createdBy String?
  updatedBy String?
  
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId])
  @@index([email])
  @@index([deletedAt])
}

model EventLog {
  id        String   @id @default(cuid())
  action    String
  metadata  Json?
  userId    String
  companyId String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId])
  @@index([userId])
  @@index([createdAt])
  @@index([action])
}

model Feedback {
  id        String   @id @default(cuid())
  message   String   @db.Text
  rating    Int?
  userId    String
  companyId String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId])
  @@index([userId])
  @@index([createdAt])
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}
```

### Key Schema Features

- **Audit Fields**: `createdBy`, `updatedBy` on all mutable models
- **Soft Deletes**: `deletedAt` timestamps for data retention
- **Performance Indexes**: Optimized for tenant-scoped queries
- **Cascading Deletes**: Proper cleanup when companies/users are removed
- **Flexible Metadata**: JSON fields for extensible data storage

## Security Requirements

### Authentication Flow *[Updated 2025-09-03]*
1. **Development**: Clerk Test mode with real authentication (no dev switcher UI)
2. **Production**: Clerk-based authentication with company context
3. **Session Management**: Company selection stored in Clerk user metadata
4. **Route Protection**: Middleware enforces authentication and company context
5. **Simplified UX**: Removed dev-mode company switcher to reduce complexity

### Multi-Tenant Isolation
- **Database Level**: All queries automatically scoped by `companyId`
- **Middleware Level**: Prisma middleware enforces tenant boundaries
- **API Level**: Server actions validate company access
- **UI Level**: Company context provider prevents cross-tenant data access

### Security Headers
```typescript
// Security configuration
{
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

## API Design Patterns

### Server Actions Pattern
```typescript
'use server'

import { auth } from '@clerk/nextjs/server'
import { createSafeAction } from '@/lib/create-safe-action'
import { CreateCustomerSchema } from '@/lib/validations/customer'

export const createCustomer = createSafeAction(
  CreateCustomerSchema,
  async (data) => {
    const { userId } = auth()
    const { companyId } = await getCompanyContext()
    
    // Implementation with automatic tenant scoping
    return await db.customer.create({
      data: { ...data, companyId, createdBy: userId }
    })
  }
)
```

### API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    await rateLimit(request)
    
    // Authentication
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validation
    const body = await request.json()
    const validatedData = schema.parse(body)
    
    // Implementation with tenant scoping
    // ...
    
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Development Workflow

### Environment Setup
1. Clone repository and install dependencies
2. Set up local PostgreSQL database
3. Configure environment variables from `.env.example`
4. Run database migrations
5. Start development server with hot reload

### Code Quality Standards
- **TypeScript**: Strict mode with comprehensive type coverage
- **Testing**: Unit tests for utilities, E2E for user flows
- **Linting**: ESLint with Next.js and TypeScript rules
- **Formatting**: Prettier with consistent code style
- **Pre-commit**: Husky hooks for quality checks

### Module Development
- **Domain-Driven Design**: Group by business domain, not technical layer
- **Barrel Exports**: Clean imports with `index.ts` files
- **Type Safety**: Zod schemas for all external inputs
- **Error Handling**: Comprehensive error boundaries and logging

## Performance Standards

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### Database Performance
- **Query Optimization**: Proper indexes for all tenant-scoped queries
- **Connection Pooling**: Configured for production scale
- **Caching Strategy**: TanStack Query for client-side caching
- **Pagination**: Cursor-based pagination for large datasets

## Deployment Architecture

### Production Environment
- **Hosting**: Vercel with Edge Runtime support
- **Database**: Neon PostgreSQL with connection pooling
- **CDN**: Vercel Edge Network for global performance
- **Monitoring**: Sentry for error tracking and performance

### Environment Configuration
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # For migrations

# Authentication
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."

# Security
NEXTAUTH_SECRET="..."
RATE_LIMIT_REDIS_URL="redis://..."

# Monitoring
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."

# Feature Flags
NODE_ENV="production"
ENABLE_ANALYTICS="true"
```

## Success Metrics *[Updated 2025-09-03]*

### Technical Metrics
- **Security**: Zero tenant data leaks, comprehensive audit trails, no hard deletes
- **Performance**: Core Web Vitals in green across all pages
- **Reliability**: 99.9% uptime with proper error handling
- **Scalability**: Sub-second response times under distributed rate limiting

### Developer Experience Metrics
- **Setup Time**: < 15 minutes from clone to running locally (Clerk Test keys required)
- **Documentation Coverage**: 100% of public APIs documented
- **Test Coverage**: > 80% for critical business logic + authorization edge cases
- **Code Quality**: Zero TypeScript errors, consistent formatting, no dev-mode complexity

## Migration Strategy

### From Existing Projects
1. **Database Migration**: Scripts to migrate existing schemas
2. **Auth Migration**: Utilities to migrate user accounts
3. **Data Migration**: Tools for tenant data separation
4. **Feature Migration**: Modular approach for gradual adoption

### Upgrade Path
- **Semantic Versioning**: Clear upgrade paths between versions
- **Breaking Changes**: Comprehensive migration guides
- **Backward Compatibility**: Deprecation warnings before removals
- **Community Support**: Active maintenance and issue resolution

## Future Roadmap

### Phase 1: Core Foundation (Current) *[Updated 2025-09-03]*
- Multi-tenant authentication and authorization (Clerk-only approach)
- Database schema with proper indexing and soft deletes
- Security middleware and distributed rate limiting (Upstash)
- Basic UI components and design system
- Comprehensive testing coverage (E2E + integration)
- Production observability (Sentry + request logging)

### Phase 2: Enhanced Features
- Advanced role-based permissions
- Real-time notifications and updates
- Comprehensive analytics dashboard
- Advanced caching and performance optimization

### Phase 3: Enterprise Features
- Single Sign-On (SSO) integration
- Advanced audit logging and compliance
- Multi-region deployment support
- Advanced monitoring and alerting

### Phase 4: Ecosystem Integration
- Third-party API integrations
- Webhook system for external services
- Plugin architecture for extensibility
- Marketplace for community modules

## Getting Started

### Quick Start
```bash
# Clone and setup
git clone https://github.com/your-org/saas-boilerplate.git
cd saas-boilerplate
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your configuration

# Database setup
npx prisma migrate dev --name init
npx prisma generate

# Start development
npm run dev
```

### Next Steps
1. Review the [Windsurf Rules](./windsurfrules.md) for AI-assisted development
2. Follow the [Task List](./TASKS.md) for systematic implementation
3. Read the [Contributing Guide](./CONTRIBUTING.md) for development workflow
4. Check the [Architecture Documentation](./ARCHITECTURE.md) for deep dives

## Support and Community

- **Documentation**: Comprehensive guides and API references
- **Examples**: Real-world implementation examples
- **Community**: Active Discord community for support
- **Professional Services**: Architecture consulting available

---

*This boilerplate represents years of SaaS development experience distilled into a production-ready foundation. Use it to build the next generation of B2B applications with confidence.*
