# Authentication & Multi-Tenant Access Control

This document explains how authentication and multi-tenant access control works in the SaaS boilerplate, emphasizing security and proper tenant isolation.

## Overview

The authentication system is built around **Clerk authentication with role-based access control** and **automatic multi-tenant data isolation**.

### Key Principles
- **Clerk Test Mode in Development**: Always use Clerk authentication, even in development
- **No Dev Company Switcher**: Removed complex dev UI to simplify development experience
- **Role-Based Access Control**: MEMBER/ADMIN/OWNER permissions for all operations
- **Automatic Tenant Scoping**: All database queries automatically filtered by `companyId`

## Authentication Flow

### Development Mode (Clerk Test Mode)
1. **Setup Clerk Test Keys** in `.env.local`:
   ```bash
   CLERK_SECRET_KEY="sk_test_your_test_key_here"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_test_key_here"
   ```

2. **Company Context** is automatically managed via Clerk user metadata
3. **Role Assignment** happens through the `UserCompany` relationship in the database

### Production Mode (Clerk Production)
1. **Use Production Clerk Keys**:
   ```bash
   CLERK_SECRET_KEY="sk_live_your_production_key_here"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_your_production_key_here"
   ```

2. **Same authentication flow** as development - no code changes required
3. **Enhanced security** with production Clerk features

## Role-Based Access Control

All API operations enforce role-based permissions:

| Operation | MEMBER | ADMIN | OWNER |
|-----------|--------|-------|-------|
| List Customers | ✅ | ✅ | ✅ |
| View Customer Details | ✅ | ✅ | ✅ |
| Create Customers | ❌ | ✅ | ✅ |
| Update Customers | ❌ | ✅ | ✅ |
| Delete Customers | ❌ | ❌ | ✅ |

### API Implementation
```typescript
// Automatic role validation in API handlers
export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { userRole } = context
    
    // Require ADMIN role or higher to create customers
    requireRole(userRole, 'ADMIN', 'creating customers')
    
    // Implementation...
  }
)
```

## Multi-Tenant Data Isolation

### Database Layer
- **Automatic Scoping**: All queries filtered by `companyId` via Prisma middleware
- **Soft Deletes**: Company/Customer models use soft deletes (`deletedAt`)
- **Audit Trail**: All changes tracked with `createdBy`/`updatedBy` fields

### API Layer  
- **Tenant Context**: Every request includes authenticated user's `companyId`
- **Role Validation**: Permission checks before any data operations
- **Rate Limiting**: Distributed rate limiting on all mutating operations

## File Structure

```
core/auth/
├── company-provider.tsx    # Company context provider (Clerk-only)
└── company-provider.tsx    # No dev switcher component

src/lib/
├── api-middleware.ts       # Centralized auth, roles, rate limiting
└── rate-limit.ts          # Upstash Redis rate limiting

prisma/
├── schema.prisma          # Multi-tenant schema with proper indexes
└── migrations/           # Database schema changes
```

## Development Setup

### Environment Configuration
```bash
# Required for both development and production
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Optional - rate limiting (uses in-memory fallback if not set)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Optional - Sentry monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

### Database Setup
```bash
# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init
```

## Security Features

### Authentication Security
- **Clerk JWT Tokens**: Secure session management
- **Automatic Token Refresh**: Seamless user experience
- **Proper Logout**: Complete session cleanup

### Data Security
- **Tenant Isolation**: Row-level security at database level
- **Input Validation**: Zod schemas for all API inputs
- **Audit Logging**: Complete change history
- **Soft Deletes**: Data retention without exposure

### API Security
- **Rate Limiting**: Distributed protection against abuse
- **Request Logging**: Centralized monitoring and debugging
- **Error Handling**: No stack trace leaks in production
- **CORS Configuration**: Proper cross-origin policies

## Debugging

### Common Issues

1. **Authentication not working**
   - Verify Clerk keys are set in `.env.local`
   - Check Clerk dashboard for test application setup
   - Ensure user is added to a company in the database

2. **Company context missing**
   - Check that user has `UserCompany` record in database
   - Verify `companyId` is set in Clerk user metadata
   - Check API middleware logs for role validation errors

3. **Permission denied errors**
   - Verify user role in `UserCompany` table
   - Check role hierarchy (OWNER > ADMIN > MEMBER)
   - Review API logs for specific permission checks

### Debug Commands
```bash
# Check environment variables
echo $CLERK_SECRET_KEY
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# View user company relationships
npx prisma studio

# Check API logs in development
# Logs appear in terminal with format:
# [timestamp] METHOD /path status duration user:ID company:ID role:ROLE
```

## Components & Hooks

### Provider Components
- `CompanyProvider` - Manages company context from Clerk
- `ClerkProvider` - Handles authentication state

### Custom Hooks
- `useCompany()` - Access current company and available companies
- `useCurrentCompany()` - Get current company (throws if none selected)
- `useCompanyRole(requiredRole)` - Check user permissions

## Migration Notes

### From Previous Versions
- **Removed**: Dev company switcher UI and keyless mode
- **Added**: Role-based access control and automatic tenant scoping
- **Enhanced**: Security with distributed rate limiting and audit trails

### Breaking Changes
- Development now requires Clerk Test keys (no more keyless mode)
- All API endpoints now enforce role permissions
- Company selection stored in Clerk metadata (not localStorage)

This simplified, secure approach provides a much cleaner development experience while maintaining enterprise-grade security and multi-tenant isolation.
