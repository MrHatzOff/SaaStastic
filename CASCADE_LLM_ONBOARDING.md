# 🚀 Cascade LLM Onboarding - SaaStastic Project

## 🎯 **PROJECT OVERVIEW**

**SaaStastic** is a **production-ready, enterprise-grade multi-tenant B2B SaaS foundation** with comprehensive RBAC system. You are joining a project that has evolved from development to **complete production readiness**.

### **Current Status: PRODUCTION-READY ENTERPRISE FOUNDATION**
- ✅ **Multi-tenant Architecture** - Complete tenant isolation with `companyId` scoping
- ✅ **Enterprise RBAC System** - 29 granular permissions across 7 categories
- ✅ **Clean Architecture** - Organized codebase (`src/core/`, `src/features/`, `src/shared/`)
- ✅ **TypeScript Excellence** - 100% source code compliance
- ✅ **Complete Integration** - Clerk auth, Stripe billing, PostgreSQL + Prisma

## 📚 **ESSENTIAL READING (READ FIRST)**

### **1. Core Documentation (MANDATORY)**
```bash
# Read these files in order before coding:
1. docs/core/product-vision-and-roadmap.md    # Strategic direction
2. docs/core/product-status.md                # Current implementation status
3. docs/core/architecture-blueprint.md        # Technical architecture
4. docs/dev/proposedUpdates/summary.md        # Project progress summary
```

### **2. RBAC System (CRITICAL)**
```bash
# RBAC is fully implemented - understand it:
src/shared/lib/permissions.ts                 # 29 permissions definitions
src/shared/lib/rbac-middleware.ts            # API protection middleware
src/shared/hooks/use-permissions.ts          # Frontend permission hooks
src/shared/components/permission-guard.tsx   # UI permission guards
docs/core/architecture/rbac-spec.md          # Complete RBAC specification
```

### **3. Development Workflows**
```bash
docs/dev/proposedUpdates/technical-workflows.md  # Development patterns
.windsurf/workflows/                             # Windsurf-specific workflows
```

## 🏗️ **ARCHITECTURE OVERVIEW**

### **File Structure (Reorganized & Clean)**
```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public pages
│   ├── (app)/             # Authenticated app
│   └── api/               # RBAC-protected API routes
├── core/                  # Core infrastructure
│   ├── auth/              # Clerk + company context
│   ├── db/                # Database client & guards
│   └── shared/            # Core exports
├── features/              # Domain modules
│   ├── billing/           # Stripe integration
│   ├── companies/         # Company management
│   ├── customers/         # Customer management
│   └── users/             # Team management
├── shared/                # Shared utilities
│   ├── components/        # Reusable components
│   ├── hooks/             # React hooks (usePermissions)
│   ├── lib/               # RBAC system, middleware
│   └── ui/                # Base UI components
```

### **Technology Stack**
- **Frontend**: Next.js 15+, React 19+, TypeScript 5+
- **Database**: PostgreSQL with Prisma ORM 6+
- **Authentication**: Clerk with multi-tenant support
- **Payments**: Stripe with webhook handling
- **Styling**: TailwindCSS 4+
- **Validation**: Zod for all schemas
- **RBAC**: Custom implementation with 29 permissions

## 🔒 **NON-NEGOTIABLE RULES**

### **Security & Multi-Tenancy (CRITICAL)**
1. **ALL database queries MUST include `companyId` scoping**
2. **ALL API routes MUST use `withPermissions()` middleware**
3. **NO dev bypasses or test code in production**
4. **ALL inputs MUST be validated with Zod schemas**
5. **Permission checks required at BOTH API and UI levels**

### **Code Quality (ENFORCED)**
1. **TypeScript strict mode - NO `any` types allowed**
2. **NO console.log statements in production code**
3. **Proper error handling with user-friendly messages**
4. **Follow established patterns - don't create new ones without discussion**

### **RBAC Integration (MANDATORY)**
1. **API Routes**: Use `withPermissions(handler, [PERMISSIONS.ACTION])`
2. **Components**: Use `usePermissions()` hook and `<PermissionGuard>`
3. **All sensitive operations require appropriate permissions**

## 🛠️ **DEVELOPMENT PATTERNS**

### **API Route Pattern (RBAC-Protected)**
```typescript
// src/app/api/[module]/route.ts
import { withPermissions, PERMISSIONS } from '@/shared/lib';

export const POST = withPermissions(
  async (req: NextRequest, context: AuthenticatedContext) => {
    const data = schema.parse(await req.json());
    // Auto-scoped by context.companyId + permission checked
    const result = await db.model.create({
      data: { ...data, companyId: context.companyId }
    });
    return NextResponse.json({ success: true, data: result });
  },
  [PERMISSIONS.CUSTOMER_CREATE] // Required permissions
);
```

### **Component Pattern (Permission-Aware)**
```typescript
// src/features/[domain]/components/Component.tsx
import { usePermissions, PermissionGuard } from '@/shared/hooks/use-permissions';

export function Component() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {/* Always visible content */}
      <PermissionGuard permission="customer:update">
        <EditButton />
      </PermissionGuard>
      {hasPermission('customer:delete') && <DeleteButton />}
    </div>
  );
}
```

### **Database Pattern (Tenant-Scoped)**
```typescript
// All queries automatically scoped by companyId via middleware
const customers = await db.customer.findMany({
  where: {
    companyId: context.companyId, // ALWAYS required
    // other filters
  }
});
```

## 🎯 **CURRENT PRIORITIES**

### **✅ COMPLETED (Don't Redo)**
- Multi-tenant architecture with complete security
- RBAC system with 29 permissions (fully implemented)
- Codebase reorganization and TypeScript cleanup
- Clerk authentication and Stripe billing integration
- Database schema with RBAC tables and migration

### **🔄 CURRENT FOCUS (Phase 2B)**
- Enhanced team management UI with role assignment
- Email invitation system UI (database schema ready)
- User activity dashboard and audit trail viewer
- Bulk operations for team management

### **⏳ FUTURE (Phase 3)**
- Admin portal for customer support
- System health monitoring
- Advanced analytics and reporting

## 🔍 **HOW TO FIND THINGS**

### **Code Location Guide**
```bash
# RBAC System
src/shared/lib/permissions.ts           # Permission definitions
src/shared/lib/rbac-middleware.ts       # API middleware
src/shared/hooks/use-permissions.ts     # Frontend hooks
src/app/api/users/permissions/route.ts  # Permission API

# Authentication
src/core/auth/company-provider.tsx      # Company context
src/core/db/client.ts                   # Database client

# Features
src/features/billing/                   # Stripe integration
src/features/customers/                 # Customer management
src/features/users/                     # Team management

# Database
prisma/schema.prisma                    # Complete schema with RBAC
scripts/seed-rbac.ts                    # RBAC data seeding
```

### **Documentation Navigation**
```bash
# Strategic Documents
docs/core/product-vision-and-roadmap.md    # Vision & roadmap
docs/core/product-status.md                # Implementation status

# Technical Documents  
docs/core/architecture-blueprint.md        # Architecture overview
docs/core/architecture/rbac-spec.md        # RBAC specification

# Development Guides
docs/dev/proposedUpdates/technical-workflows.md  # Development patterns
docs/dev/proposedUpdates/summary.md              # Progress summary
```

## ⚡ **QUICK START CHECKLIST**

### **Before Making Any Changes**
- [ ] Read the 4 essential documentation files listed above
- [ ] Understand the RBAC system and permission structure
- [ ] Review existing code patterns in similar files
- [ ] Verify you understand multi-tenant security requirements

### **For New Features**
- [ ] Determine required permissions from `src/shared/lib/permissions.ts`
- [ ] Use `withPermissions()` for API routes
- [ ] Use `usePermissions()` and `<PermissionGuard>` for UI
- [ ] Include `companyId` scoping in all database operations
- [ ] Add proper TypeScript types and Zod validation

### **Quality Checks**
- [ ] TypeScript strict mode compliance (no `any` types)
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Permission checks at both API and UI levels
- [ ] Multi-tenant security verified

## 🚨 **COMMON MISTAKES TO AVOID**

1. **Don't bypass RBAC** - Every operation needs permission checks
2. **Don't skip `companyId` scoping** - All tenant data must be scoped
3. **Don't use old patterns** - Use the updated RBAC-aware patterns
4. **Don't create new architecture** - Follow established patterns
5. **Don't ignore TypeScript errors** - Fix them, don't suppress them

## 🎉 **SUCCESS CRITERIA**

### **You're Ready When You Can:**
- Explain the RBAC system and its 29 permissions
- Write a new API route with proper permission protection
- Create a component with permission-based conditional rendering
- Understand the multi-tenant security model
- Navigate the codebase and find relevant files quickly

### **Your Code Should:**
- Pass TypeScript strict mode with zero errors
- Include proper permission checks
- Follow established patterns exactly
- Include comprehensive error handling
- Maintain multi-tenant security

---

## 🏆 **REMEMBER: EXCELLENCE IS THE STANDARD**

SaaStastic is a **production-ready enterprise foundation**. Every line of code should reflect this standard. You're not building a prototype - you're enhancing a complete, secure, scalable B2B SaaS platform that's ready for business deployment.

**When in doubt, ask questions. When certain, code with excellence.**

---

*This document provides everything needed to start contributing effectively to SaaStastic. Read the essential documentation, understand the RBAC system, follow the patterns, and maintain our standard of excellence.*
