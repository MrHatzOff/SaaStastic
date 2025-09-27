# Authentication & Multi-Tenant Access Control

This document explains how authentication and multi-tenant access control works in the SaaS boilerplate, emphasizing security and proper tenant isolation.

## Overview

The authentication system is built around **Clerk authentication with unified marketing + B2B experience** and **automatic multi-tenant data isolation**.

### Key Principles
- **Unified Marketing + B2B Experience**: Single codebase for marketing pages and SaaS application
- **Clerk Modal Authentication**: Clean sign-in/sign-up flows without page redirects
- **Automatic Company Onboarding**: First-time users guided through company setup
- **Role-Based Access Control**: MEMBER/ADMIN/OWNER permissions for all operations
- **Simplified Tenant Setup**: Company-specific data isolation without complex middleware

## User Experience Flow

### Marketing → Authentication → Onboarding → B2B App

#### **Phase 1: Marketing (Public)**
```
📄 Public Pages: /, /about, /contact, /faq
   ↓
🎯 "Sign In" / "Get Started" buttons (modal overlays)
   ↓
```

#### **Phase 2: Clerk Authentication**
```
🔐 Modal Authentication (no page redirects)
   ↓ Email/Password or Social login
   ↓
```

#### **Phase 3: Company Onboarding (First-Time Users Only)**
```
🏢 Automatic redirect: /onboarding/company-setup
   ↓ Company creation form (Name + Slug)
   ↓ Company created in database
   ↓
```

#### **Phase 4: B2B Dashboard**
```
📊 Redirect to: /dashboard
   ↓ Company-specific data & features
   ↓ Returning users skip onboarding
```

### Smart User Detection
- **New Users**: Sign up → Company setup → Dashboard
- **Returning Users**: Sign in → Dashboard (direct)
- **No Companies**: Automatic onboarding flow
- **Existing Companies**: Stored in Clerk metadata

## Authentication Implementation

### Clerk Configuration
```typescript
// src/app/providers.tsx
<ClerkProvider>
  <CompanyProvider>
    {/* App content */}
  </CompanyProvider>
</ClerkProvider>

// Navigation with modal auth
<SignedOut>
  <SignInButton mode="modal">Sign In</SignInButton>
  <SignUpButton mode="modal">Get Started</SignUpButton>
</SignedOut>
```

### Company Provider Logic
```typescript
// Automatic user flow management
useEffect(() => {
  if (isLoaded && user) {
    loadUserCompanies()
  }
}, [isLoaded, user])

// First-time user detection
if (companiesData.data.length === 0) {
  redirect('/onboarding/company-setup')  // New user onboarding
} else {
  setCurrentCompany(companiesData.data[0])  // Returning user
}
```

## Role-Based Access Control

All operations enforce role-based permissions:

| Operation | MEMBER | ADMIN | OWNER |
|-----------|--------|-------|-------|
| List Customers | ✅ | ✅ | ✅ |
| View Customer Details | ✅ | ✅ | ✅ |
| Create Customers | ❌ | ✅ | ✅ |
| Update Customers | ❌ | ✅ | ✅ |
| Delete Customers | ❌ | ❌ | ✅ |

### API Implementation
```typescript
// Simplified API routes (no complex middleware)
export const GET = async (req: NextRequest) => {
  // Basic JSON responses
  return Response.json({ success: true, data: [] })
}

export const POST = async (req: NextRequest) => {
  // Simple company creation
  const company = await db.company.create({ data: req.body })
  return Response.json({ success: true, data: company })
}
```

## Multi-Tenant Data Isolation

### Database Layer
- **Automatic Scoping**: All queries filtered by `companyId` via Prisma middleware
- **Soft Deletes**: Company/Customer models use soft deletes (`deletedAt`)
- **Audit Trail**: All changes tracked with `createdBy`/`updatedBy` fields

### API Layer
- **Simplified Approach**: Direct API routes without complex middleware
- **Basic Authentication**: Clerk user context available via hooks
- **Company Scoping**: Manual `companyId` filtering in queries

## File Structure

```
/src
├── app
│   ├── sign-in/[[...sign-in]]/     # Clerk sign-in (modal)
│   ├── sign-up/[[...sign-up]]/     # Clerk sign-up (modal)
│   ├── onboarding/company-setup/   # Company creation flow
│   ├── dashboard/                  # Protected B2B app
│   └── api/companies/              # Company management APIs
├── components
│   └── marketing/navigation.tsx    # Modal auth buttons
└── core
    ├── auth/company-provider.tsx   # Company context + onboarding logic
    └── db/client.ts               # Simplified Prisma client
```

## Development Setup

### Environment Configuration
```bash
# Required for both development and production
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Optional - database connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/saas_dev"
```

### Clerk Dashboard Setup
1. Create application at [clerk.com](https://clerk.com)
2. Configure sign-in/sign-up methods
3. Set redirect URLs:
   - After sign-in: `http://localhost:3000/dashboard`
   - After sign-up: `http://localhost:3000/dashboard`

## Security Features

### Authentication Security
- **Clerk JWT Tokens**: Secure session management
- **Automatic Token Refresh**: Seamless user experience
- **Proper Logout**: Complete session cleanup

### Data Security
- **Company Isolation**: All data scoped by companyId
- **Input Validation**: Basic validation on API inputs
- **Clean Architecture**: Separation of marketing vs B2B concerns

## Debugging

### Common Issues

1. **Modal authentication not working**
   - Verify Clerk keys are set in `.env.local`
   - Check Clerk dashboard for correct application setup
   - Ensure sign-in/sign-up routes exist

2. **Company onboarding not triggering**
   - Check that user has no companies in database
   - Verify `/api/companies` returns empty array
   - Check browser network tab for redirect requests

3. **Dashboard not loading**
   - Ensure user has a company created
   - Check company provider state in React dev tools
   - Verify dashboard route is not protected incorrectly

### Debug Commands
```bash
# Check environment variables
echo $CLERK_SECRET_KEY
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# View database state
npx prisma studio

# Check API responses
curl http://localhost:3000/api/companies
```

## Components & Hooks

### Provider Components
- `ClerkProvider` - Handles authentication state
- `CompanyProvider` - Manages company context and onboarding flow

### Custom Hooks
- `useCompany()` - Access current company and available companies
- `useCurrentCompany()` - Get current company (returns null if none)
- `useUser()` - Clerk user authentication state

## Migration Notes

### From Previous Versions
- **Removed**: Complex API middleware and tenant guard
- **Added**: Unified marketing + B2B experience with modal auth
- **Simplified**: Company onboarding flow and database setup

### Architecture Changes
- **Unified App**: Marketing and B2B in single codebase
- **Modal Auth**: No page redirects for sign-in/sign-up
- **Automatic Onboarding**: First-time users guided through setup
- **Simplified APIs**: Direct routes without complex middleware

This approach provides a much cleaner, more maintainable SaaS boilerplate while maintaining security and multi-tenant isolation.
