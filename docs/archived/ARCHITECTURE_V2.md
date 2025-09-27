# SaaStastic Architecture V2 - Current Implementation

## 🏗️ **Current Architecture Status**

### ✅ **Implemented Components**

#### Authentication Layer
```
Clerk Integration ✅
├── User sync webhook (/api/webhooks/clerk)
├── Company context provider (company-provider.tsx)
├── Protected route middleware (middleware.ts)
└── Multi-tenant user management
```

#### Database Layer
```
PostgreSQL + Prisma ✅
├── Multi-tenant schema with companyId isolation
├── Audit fields (createdBy, updatedBy, createdAt, updatedAt)
├── Soft deletes with deletedAt timestamps
├── Event logging for compliance
└── Proper indexes for performance
```

#### API Architecture
```
Next.js API Routes ✅
├── withApiMiddleware for consistent patterns
├── Zod validation for all inputs
├── Automatic tenant scoping
├── Rate limiting with Upstash Redis
└── Comprehensive error handling
```

#### Billing System
```
Stripe Integration ✅
├── Checkout session creation (/api/billing/checkout)
├── Webhook event handling (/api/webhooks/stripe)
├── Subscription lifecycle management
├── Invoice generation and storage
└── Customer portal integration
```

#### Frontend Architecture
```
Next.js 15 + React 19 ✅
├── App Router with proper layouts
├── TailwindCSS design system
├── Reusable component library
├── TypeScript strict mode
└── Client-side state management
```

## 🔧 **Established Patterns**

### API Route Pattern
```typescript
// Standard API route implementation
export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      // 1. Parse and validate input
      const data = createSchema.parse(await req.json());
      
      // 2. Check permissions (automatic via middleware)
      // context.userId and context.companyId are validated
      
      // 3. Execute business logic with tenant scoping
      const result = await db.model.create({
        data: {
          ...data,
          companyId: context.companyId,
          createdBy: context.userId
        }
      });
      
      // 4. Log the action for audit
      await logEvent({
        action: 'model.created',
        userId: context.userId,
        companyId: context.companyId,
        metadata: { modelId: result.id }
      });
      
      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
```

### Component Pattern
```typescript
// Standard component implementation
interface ComponentProps {
  companyId: string;
  // ... other props with proper types
}

export function Component({ companyId }: ComponentProps) {
  // 1. State management
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Data fetching with proper error handling
  const { data: queryData, isLoading, error: queryError } = useQuery({
    queryKey: ['resource', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/resource?companyId=${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });
  
  // 3. Loading and error states
  if (isLoading) return <LoadingSpinner />;
  if (queryError) return <ErrorMessage error={queryError.message} />;
  
  // 4. Render with proper accessibility
  return (
    <div className="space-y-4">
      {/* Component content */}
    </div>
  );
}
```

### Database Query Pattern
```typescript
// All queries must include tenant scoping
const getCustomers = async (companyId: string, userId: string) => {
  return await db.customer.findMany({
    where: {
      companyId, // REQUIRED: Tenant isolation
      deletedAt: null // Soft delete filtering
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Create operations with audit fields
const createCustomer = async (data: CreateCustomerData, context: ApiContext) => {
  return await db.customer.create({
    data: {
      ...data,
      companyId: context.companyId, // REQUIRED: Tenant scoping
      createdBy: context.userId,     // REQUIRED: Audit trail
      updatedBy: context.userId
    }
  });
};
```

## 📁 **File Structure (Current)**

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Public marketing pages
│   │   ├── page.tsx             # Landing page
│   │   ├── about/page.tsx       # About page
│   │   ├── contact/page.tsx     # Contact page
│   │   └── pricing/page.tsx     # Pricing page
│   ├── (app)/                   # Protected application routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── customers/           # Customer management
│   │   ├── billing/             # Billing pages
│   │   └── settings/            # Company settings
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── billing/             # Billing endpoints
│   │   ├── companies/           # Company management
│   │   ├── customers/           # Customer endpoints
│   │   └── webhooks/            # Webhook handlers
│   └── globals.css              # Global styles
│
├── components/                   # Reusable UI components
│   ├── app/                     # Application-specific components
│   │   ├── companies/           # Company management UI
│   │   └── customers/           # Customer management UI
│   ├── billing/                 # Billing-related components
│   ├── marketing/               # Marketing page components
│   └── shared/                  # Shared UI components
│       └── ui/                  # Base UI components (shadcn/ui)
│
├── core/                        # Core infrastructure
│   └── shared/                  # Shared core modules
│       ├── auth/                # Authentication utilities
│       │   └── company-provider.tsx
│       └── db/                  # Database utilities
│           ├── client.ts        # Prisma client
│           └── tenant-guard.ts  # Tenant isolation middleware
│
├── lib/                         # Utility libraries
│   ├── app/                     # App-specific utilities
│   │   └── saas-helpers.ts      # SaaS helper functions
│   └── shared/                  # Shared utilities
│       ├── api-middleware.ts    # API middleware
│       ├── env.ts               # Environment validation
│       └── utils.ts             # General utilities
│
└── modules/                     # Feature modules
    ├── billing/                 # Billing module
    │   ├── components/          # Billing UI components
    │   ├── services/            # Billing business logic
    │   └── types/               # Billing type definitions
    └── users/                   # User management module
        ├── components/          # User management UI
        └── services/            # User management logic
```

## 🔒 **Security Architecture**

### Multi-Tenant Isolation
```typescript
// Database middleware ensures all queries are scoped
const tenantGuard = (companyId: string) => ({
  create: (args: any) => ({
    ...args,
    data: { ...args.data, companyId }
  }),
  findMany: (args: any) => ({
    ...args,
    where: { ...args.where, companyId }
  }),
  findFirst: (args: any) => ({
    ...args,
    where: { ...args.where, companyId }
  })
  // ... other operations
});
```

### API Security Layers
1. **Edge Middleware** - Route protection and security headers
2. **API Middleware** - Authentication, validation, rate limiting
3. **Database Middleware** - Automatic tenant scoping
4. **Audit Logging** - Comprehensive action tracking

### Authentication Flow
```
User Request → Clerk Auth Check → Company Context → API Middleware → Business Logic
     ↓              ↓                    ↓              ↓              ↓
Security Headers → JWT Validation → Company Access → Input Validation → Tenant Scoped Query
```

## 🚀 **Performance Optimizations**

### Database Performance
- **Indexes**: Proper indexing on companyId and frequently queried fields
- **Connection Pooling**: Prisma connection pooling for scalability
- **Query Optimization**: Select only required fields, proper pagination

### Frontend Performance
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with optimization
- **Caching**: React Query for client-side caching
- **Bundle Analysis**: Regular bundle size monitoring

### API Performance
- **Rate Limiting**: Redis-based rate limiting per tenant
- **Response Caching**: Strategic caching for read-heavy operations
- **Compression**: Automatic response compression
- **Error Handling**: Efficient error responses without stack traces

## 📊 **Monitoring & Observability**

### Current Implementation
```typescript
// Event logging for audit and monitoring
await logEvent({
  action: 'customer.created',
  userId: context.userId,
  companyId: context.companyId,
  metadata: {
    customerId: customer.id,
    customerEmail: customer.email
  },
  timestamp: new Date(),
  ipAddress: getClientIP(req),
  userAgent: req.headers.get('user-agent')
});
```

### Metrics Collection
- **API Response Times**: Automatic timing for all endpoints
- **Error Rates**: Comprehensive error tracking and categorization
- **User Activity**: Detailed action logging for analytics
- **System Health**: Database connection and performance monitoring

## 🔄 **Development Workflow**

### Code Quality Standards
1. **TypeScript Strict Mode** - Zero `any` types allowed
2. **ESLint Rules** - Comprehensive linting with auto-fix
3. **Prettier Formatting** - Consistent code formatting
4. **Pre-commit Hooks** - Automated quality checks

### Testing Strategy
```
Unit Tests (Vitest)
├── Core business logic
├── Utility functions
└── Component logic

Integration Tests (Playwright)
├── API endpoint testing
├── Database operations
└── Authentication flows

E2E Tests (Playwright)
├── Critical user journeys
├── Multi-tenant scenarios
└── Payment flows
```

## 🎯 **Next Phase Architecture**

### Phase 2: Enhanced User Management
```
modules/users/
├── components/
│   ├── team-invitation-modal.tsx
│   ├── role-selector.tsx
│   ├── user-activity-log.tsx
│   └── bulk-operations.tsx
├── services/
│   ├── invitation-service.ts
│   ├── role-service.ts
│   └── activity-service.ts
└── types/
    └── user-types.ts
```

### Phase 3: Admin Support Portal
```
src/app/(admin)/
├── layout.tsx                   # Admin-only layout
├── dashboard/page.tsx           # Support dashboard
├── impersonate/
│   ├── page.tsx                # Company search
│   └── [companyId]/page.tsx    # Safe impersonation
├── analytics/
│   ├── health/page.tsx         # System health
│   └── usage/page.tsx          # Usage analytics
└── api/
    ├── impersonate/route.ts    # Secure impersonation
    └── analytics/route.ts      # Analytics data
```

## 📋 **Architecture Principles**

### Non-Negotiable Rules
1. **Tenant Isolation**: Every query MUST include companyId
2. **No Dev Bypasses**: All authentication through Clerk
3. **Audit Everything**: Log all sensitive actions
4. **Type Safety**: Strict TypeScript with proper validation
5. **Modular Design**: Clear separation of concerns

### Best Practices
1. **Error Boundaries**: Graceful error handling at component level
2. **Loading States**: Proper loading indicators for all async operations
3. **Accessibility**: WCAG 2.1 AA compliance for all UI components
4. **Performance**: Optimize for Core Web Vitals
5. **Security**: Defense in depth with multiple security layers

---

*This architecture document reflects the current implementation state and provides the foundation for future development phases.*
