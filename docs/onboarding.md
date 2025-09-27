# 🚀 SaaStastic Onboarding Guide

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Quick Start](#-quick-start)
- [Architecture Patterns](#-architecture-patterns)
- [Development Workflow](#-development-workflow)
- [Code Standards](#-code-standards)
- [Troubleshooting](#-troubleshooting)

## 🌟 Project Overview

### Core Components (See `docs/core/product-status.md` for full progress)
- **Authentication**: Clerk (working ✅)
- **Billing**: Stripe (working ✅)
- **Database**: PostgreSQL + Prisma (working ✅)
- **Frontend**: Next.js 15 + TypeScript (working ✅)

### Current Status Highlights
- ✅ **Phase 1A** complete (auth, billing, onboarding foundations)
- 🔄 **Phase 1B** in progress (code quality, documentation, workflows)
- ❌ **Phase 2** upcoming (enhanced team collaboration)
- ❌ **Phase 3** planned (support & operations tooling)

### Non-Negotiable Rules (See `docs/core/coding-standards-and-workflows.md`)
1. **Multi-tenant isolation**: Every query MUST include `companyId`.
2. **No dev bypasses**: All authentication flows through Clerk.
3. **TypeScript strict**: Zero `any` types; validate inputs with Zod.
4. **Security first**: Enforce audit trails, CSRF protection, and rate limiting.
5. **Clean architecture**: Follow module boundaries and shared abstractions.
6. **Compliance ready**: Default posture aligns with GDPR/CCPA expectations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Stripe account
- Clerk account

### Setup
```bash
# 1. Clone the repository
git clone [repo-url]
cd saastastic

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run database migrations
npx prisma migrate dev

# 5. Start development server
npm run dev
```

## 🏗 Architecture Patterns

### API Endpoint Pattern
```typescript
export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // 1. Validate input with Zod
    const data = schema.parse(await req.json());
    
    // 2. Check permissions (automatic via middleware)
    // context.userId and context.companyId are validated
    
    // 3. Execute with tenant isolation
    const result = await db.model.create({
      data: { 
        ...data, 
        companyId: context.companyId,
        createdBy: context.userId
      }
    });
    
    return NextResponse.json({ success: true, data: result });
  }
);
```

### Component Pattern
```typescript
interface ComponentProps {
  companyId: string;
  // ... other props
}

export function Component({ companyId }: ComponentProps) {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Proper error boundaries and loading states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* component content */}</div>;
}
```

## 🔄 Development Workflow

### Branch Naming
```
feat/add-user-management
fix/billing-calculation
chore/update-deps
```

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test path/to/test.spec.ts
```

## 📏 Code Standards

### TypeScript
- No `any` types
- Explicit return types
- Proper error handling
- Use interfaces for public API

### Styling
- Tailwind CSS for styling
- CSS Modules for component-specific styles
- Follow BEM naming convention

## 🛠 Troubleshooting

### Common Issues
1. **Database Connection Issues**
   - Verify `.env` credentials
   - Check if PostgreSQL is running
   - Run `npx prisma generate`

2. **Type Errors**
   - Run `npx tsc --noEmit`
   - Check for missing types
   - Verify Prisma client is generated

3. **Authentication Problems**
   - Verify Clerk credentials
   - Check callback URLs
   - Clear browser cache

## 📚 Additional Resources
- [Architecture Documentation](./dev/architecture/ARCHITECTURE_V2.md)
- [API Reference](./dev/API.md)
- [Contributing Guide](./dev/CONTRIBUTING.md)

---
*Last Updated: 2025-09-22*
