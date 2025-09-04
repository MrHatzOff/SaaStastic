# TENANTING.md

This document defines the rules and best practices for maintaining **multi-tenant isolation** across the entire SaaS boilerplate. Every contributor must follow these guidelines.

---

## 🔑 Core Principles

1. **Tenant Isolation:** Every row in the database must be associated with a `companyId`.
2. **Scoped Queries Only:** All Prisma queries must filter by `companyId`.
3. **No Cross-Tenant Leakage:** Never allow users to access or modify data belonging to another company.
4. **Role-Aware Access:** `UserCompany.role` controls permissions inside a company.

---

## 🗄️ Schema Enforcement

* Every business-related model includes a `companyId` foreign key.
* Example:

```prisma
model Customer {
  id         String   @id @default(cuid())
  companyId  String
  name       String
  email      String?
  createdAt  DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id])
}
```

---

## 🔒 TenantGuard Middleware

* A shared Prisma middleware exists in `/core/db/tenantGuard.ts`.
* It ensures all queries include `companyId` automatically.
* Example usage:

```ts
const customers = await prisma.customer.findMany({
  where: { companyId: ctx.companyId },
});
```

---

## 👥 User & Roles

* Users belong to one or more companies via `UserCompany`.
* Roles:

  * **owner** → full control, billing
  * **admin** → manage team + data
  * **member** → normal usage
* Always check `ctx.role` before sensitive actions.

---

## 🛠 Development Practices

* ✅ Always pass `companyId` from context/session.
* ✅ Use `useCompany()` hook in frontend.
* ✅ Write tests for tenant isolation.
* ❌ Never hardcode `companyId` in code.
* ❌ Never return raw queries without tenant filtering.

---

## 🧪 Testing Tenanting

1. Seed at least **two companies** in dev DB.
2. Add users with different roles (OWNER, ADMIN, MEMBER) to each company.
3. Test role-based access control for all CRUD operations.
4. Verify tenant isolation (e.g., customers from Company A never appear in Company B).
5. Test rate limiting enforcement on mutating operations.

---

## 🔮 Future Enhancements

* Enable Postgres **Row-Level Security (RLS)** for stronger guarantees.
* Add automated tests to enforce `companyId` filtering.
* Support **subdomain-based tenancy** (e.g., `companyA.app.com`).

---

## Multi-Tenancy Architecture Guide

This document provides a comprehensive guide to the multi-tenant architecture implemented in this SaaS boilerplate, including best practices for maintaining proper tenant isolation and security.

## 🏗️ Architecture Overview

This boilerplate implements a **shared database, shared schema** multi-tenancy model with **row-level security (RLS)** enforcement at multiple layers.

### Key Principles
- **Complete Data Isolation** - No tenant can access another tenant's data
- **Automatic Scoping** - All database queries automatically filtered by tenant
- **Performance Optimized** - Indexes and query patterns designed for multi-tenancy
- **Security First** - Multiple layers of protection against data leakage

## 🔒 Tenant Isolation Layers

### 1. Database Layer (Prisma Middleware)

**Location**: `core/db/tenant-guard.ts`

Every database operation is automatically scoped by `companyId`:

```typescript
// Automatic tenant scoping
const customers = await db.customer.findMany() 
// Becomes: SELECT * FROM customers WHERE companyId = 'current-tenant-id'

// Manual queries also get scoped
const result = await db.customer.findFirst({
  where: { email: 'user@example.com' }
})
// Becomes: WHERE email = 'user@example.com' AND companyId = 'current-tenant-id'
```

**Features**:
- Automatic `companyId` injection on all CREATE operations
- Automatic `companyId` filtering on all READ operations
- Soft delete enforcement (`deletedAt` filtering)
- Audit field population (`createdBy`, `updatedBy`)
- System operation bypass for admin tasks

### 2. API Layer (Request Middleware)

**Location**: `src/lib/api-middleware.ts`

All API endpoints enforce tenant context:

```typescript
export const GET = withApiMiddleware(handler, {
  requireAuth: true,
  requireCompany: true, // Enforces tenant context
  rateLimit: true,
  validateSchema: customerSchema
})
```

**Protection**:
- Authentication validation
- Company context requirement
- Rate limiting per tenant
- Input validation and sanitization
- Error handling without data leakage

### 3. UI Layer (React Context)

**Location**: `core/auth/company-provider.tsx`

Components automatically receive tenant-scoped data:

```typescript
function CustomerList() {
  const company = useCurrentCompany()
  // All data automatically scoped to current company
  const { data: customers } = useQuery('/api/customers')
}
```

## 🗄️ Database Schema Design

### Tenant-Aware Tables

All business data tables include tenant isolation fields:

```prisma
model Customer {
  id        String   @id @default(cuid())
  companyId String   // Tenant isolation field
  name      String
  email     String?
  
  // Audit fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft delete
  createdBy String
  updatedBy String
  
  // Relationships
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Performance indexes
  @@index([companyId])
  @@index([companyId, email])
}
```

### Key Design Patterns

1. **Tenant ID Field**: Every tenant-specific table has `companyId`
2. **Performance Indexes**: All queries optimized with compound indexes
3. **Cascading Deletes**: Proper cleanup when companies are deleted
4. **Audit Fields**: Track who created/modified records
5. **Soft Deletes**: Recoverable data deletion with `deletedAt`

## 🛡️ Security Implementation

### Tenant Context Management

```typescript
// Setting tenant context (server-side only)
setTenantContext({ companyId: 'tenant-123', userId: 'user-456' })

// All subsequent queries automatically scoped
const data = await db.customer.findMany() // Only tenant-123 data
```

### API Security Patterns

```typescript
// Secure API endpoint
export const GET = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { companyId } = context // Guaranteed to be set
    const db = getTenantDb(companyId) // Pre-scoped database client
    
    // This query is automatically tenant-scoped
    const customers = await db.customer.findMany()
    return successResponse(customers)
  },
  {
    requireAuth: true,
    requireCompany: true, // Critical for tenant isolation
    rateLimit: true
  }
)
```

### Authentication Integration

**Location**: `core/auth/company-provider.tsx`

Company context is managed through Clerk authentication:

```typescript
// Company selection stored in Clerk user metadata
function CompanyProvider({ children }) {
  const { user, isLoaded } = useUser()
  
  // Company context loaded from Clerk metadata
  const [currentCompany, setCurrentCompany] = useState(null)
  
  useEffect(() => {
    if (user) {
      // Load company from Clerk metadata
      const companyId = user.unsafeMetadata?.companyId
      
      if (companyId) {
        // Fetch company details and set context
        loadUserCompanies()
      }
    }
  }, [user])
}
```

**Key Changes from Previous Version:**
- ✅ Removed dev company switcher UI component
- ✅ Always uses Clerk authentication (no keyless mode)
- ✅ Company context stored in Clerk user metadata
- ✅ Simplified development experience

## 🚀 Performance Optimization

### Performance Indexes

Strategic indexing for multi-tenant queries:

```prisma
model Customer {
  // Single tenant queries
  @@index([companyId])
  
  // Compound indexes for common query patterns
  @@index([companyId, email])
  @@index([companyId, createdAt])    // Added for performance
  @@index([companyId, deletedAt])    // Added for performance
}

model EventLog {
  // Single tenant queries  
  @@index([companyId])
  @@index([userId])
  @@index([createdAt])
  @@index([action])
  
  // Compound indexes for common query patterns
  @@index([companyId, createdAt])    // Added for performance
}

model Feedback {
  // Single tenant queries
  @@index([companyId])
  @@index([userId])
  @@index([createdAt])
  
  // Compound indexes for common query patterns  
  @@index([companyId, createdAt])    // Added for performance
}
```

### Query Patterns

Optimized query patterns for multi-tenant data:

```typescript
// Good: Uses compound index
const customers = await db.customer.findMany({
  where: {
    companyId: 'tenant-123',
    deletedAt: null
  },
  orderBy: { createdAt: 'desc' }
})

// Avoid: Cross-tenant queries (blocked by middleware anyway)
const allCustomers = await db.customer.findMany() // Without tenant filter
```

## 🔧 Development Best Practices

### 1. Always Use Tenant Context

```typescript
// ✅ Good: Use tenant-aware hooks
function MyComponent() {
  const company = useCurrentCompany()
  const { data } = useSWR(`/api/customers?companyId=${company.id}`)
}

// ❌ Bad: Direct database access in components
function MyComponent() {
  const customers = await db.customer.findMany() // Server-side only!
}
```

### 2. API Route Patterns

```typescript
// ✅ Good: Use middleware for tenant isolation
export const GET = withApiMiddleware(handler, {
  requireCompany: true
})

// ❌ Bad: Manual tenant checking
export async function GET(req: NextRequest) {
  const companyId = req.headers.get('x-company-id') // Unreliable
}
```

### 3. Database Operations

```typescript
// ✅ Good: Let middleware handle tenant scoping
const customer = await db.customer.create({
  data: { name: 'John Doe', email: 'john@example.com' }
  // companyId automatically added by middleware
})

// ❌ Bad: Manual companyId management
const customer = await db.customer.create({
  data: { 
    name: 'John Doe', 
    email: 'john@example.com',
    companyId: getCurrentCompanyId() // Error-prone
  }
})
```

## 🧪 Testing Multi-Tenancy

### Unit Tests

```typescript
describe('Tenant Isolation', () => {
  it('should only return tenant-specific data', async () => {
    // Set tenant context
    setTenantContext({ companyId: 'tenant-1', userId: 'user-1' })
    
    // Create test data
    await db.customer.create({ data: { name: 'Customer 1' } })
    
    // Switch tenant
    setTenantContext({ companyId: 'tenant-2', userId: 'user-2' })
    
    // Should not see tenant-1 data
    const customers = await db.customer.findMany()
    expect(customers).toHaveLength(0)
  })
})
```

### Integration Tests

```typescript
describe('API Tenant Isolation', () => {
  it('should enforce tenant boundaries', async () => {
    // Create data for tenant-1
    const response1 = await request(app)
      .post('/api/customers')
      .set('Authorization', 'Bearer tenant-1-token')
      .send({ name: 'Customer 1' })
    
    // Try to access from tenant-2
    const response2 = await request(app)
      .get('/api/customers')
      .set('Authorization', 'Bearer tenant-2-token')
    
    expect(response2.body.data).toHaveLength(0)
  })
})
```

## 🚨 Common Pitfalls & Solutions

### 1. Client-Side Database Access
**Problem**: Importing Prisma client in React components
```typescript
// ❌ This will cause browser errors
import db from '@/core/db/client'
```

**Solution**: Use API routes for all database operations
```typescript
// ✅ Use API calls instead
const { data } = useSWR('/api/customers')
```

### 2. Missing Tenant Context
**Problem**: API routes without company requirement
```typescript
// ❌ No tenant isolation
export async function GET() {
  return db.customer.findMany() // Returns all tenants' data!
}
```

**Solution**: Always use middleware with `requireCompany`
```typescript
// ✅ Tenant-isolated
export const GET = withApiMiddleware(handler, {
  requireCompany: true
})
```

### 3. Cross-Tenant Data Leakage
**Problem**: Using IDs from URLs without validation
```typescript
// ❌ Potential data leakage
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return db.customer.findUnique({ where: { id: params.id } })
}
```

**Solution**: Tenant middleware automatically prevents this
```typescript
// ✅ Safe - middleware ensures tenant scoping
export const GET = withApiMiddleware(
  async (req, { params }) => {
    // This query is automatically tenant-scoped
    const customer = await db.customer.findUnique({ 
      where: { id: params.id } 
    })
    return successResponse(customer)
  },
  { requireCompany: true }
)
```

## 📊 Monitoring & Observability

### Tenant Metrics
- Query performance per tenant
- Data growth per tenant
- API usage per tenant
- Error rates per tenant

### Security Monitoring
- Failed tenant access attempts
- Cross-tenant query attempts (should be zero)
- Authentication failures
- Unusual data access patterns

## 🔄 Migration Strategies

### Adding New Tenant-Aware Tables

1. **Create Migration**:
```prisma
model NewFeature {
  id        String   @id @default(cuid())
  companyId String   // Always include tenant field
  // ... other fields
  
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  @@index([companyId])
}
```

2. **Update Tenant Guard**: The middleware automatically handles new tables with `companyId`

3. **Create API Routes**: Use the same middleware patterns

### Tenant Data Migration

```typescript
// Safe tenant data migration
async function migrateTenantData() {
  const companies = await db.company.findMany()
  
  for (const company of companies) {
    setTenantContext({ companyId: company.id, userId: 'system' })
    
    // Perform tenant-specific migration
    await db.oldTable.updateMany({
      data: { newField: 'default-value' }
    })
  }
}
```

## 📋 Checklist for New Features

When adding new features, ensure:

- [ ] Database tables include `companyId` field
- [ ] Proper indexes on tenant fields
- [ ] API routes use `withApiMiddleware` with `requireCompany: true`
- [ ] Components use `useCurrentCompany()` hook
- [ ] Tests verify tenant isolation
- [ ] No direct database imports in client components
- [ ] Proper error handling without data leakage

## 🎯 Summary

This multi-tenant architecture provides:

- **Automatic tenant isolation** at database, API, and UI layers
- **Performance optimization** with proper indexing
- **Security by design** with multiple protection layers
- **Developer-friendly** patterns that prevent common mistakes
- **Scalable architecture** that grows with your SaaS

The key to successful multi-tenancy is **consistency** - always use the provided patterns and middleware to ensure tenant isolation is maintained across your entire application.

---

## ✅ Summary

Multi-tenancy is non-negotiable. **Every row, every query, every view must be company-scoped.**

Following this guide ensures data safety, privacy, and trust for all tenants.
