# SaaStastic Technical Workflows

## 🔄 **Development Workflows**

### Daily Development Workflow
1. **Start Session**
   ```bash
   # Check current status
   npx tsc --noEmit
   npm run lint
   
   # Start development
   npm run dev
   ```

2. **Before Making Changes**
   - Read `/docs/core/architecture-blueprint.md` for patterns
   - Check `/docs/core/product-status.md` for current priorities
   - Follow patterns in similar existing files

3. **Code Quality Checks**
   ```bash
   # Type checking
   npx tsc --noEmit
   
   # Linting
   npm run lint
   
   # Testing (when implemented)
   npm run test
   ```

### API Development Workflow

#### Creating New API Routes
1. **Use RBAC-Protected Pattern (NEW!)**
   ```typescript
   // src/app/api/[module]/route.ts
   import { withPermissions, PERMISSIONS } from '@/shared/lib';
   import { schema } from '@/features/[module]/schemas';
   
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

2. **Required Elements**
   - ✅ Use `withPermissions` for tenant scoping + permission checking
   - ✅ Specify required permissions array
   - ✅ Validate inputs with Zod schemas
   - ✅ Include `companyId` in all database operations
   - ✅ Proper error handling with user-friendly messages
   - ✅ Audit logging for sensitive operations

### Database Workflow

#### Schema Changes
1. **Update Prisma Schema**
   ```bash
   # Edit prisma/schema.prisma
   # Add new model or modify existing
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name descriptive_change_name
   ```

3. **Update Types**
   ```bash
   npx prisma generate
   ```

4. **Verify Multi-tenancy**
   - Ensure new models include `companyId` if tenant-scoped
   - Add audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
   - Include `deletedAt` for soft deletes

### Component Development Workflow

#### Creating New Components
1. **Follow RBAC-Aware Structure (NEW!)**
   ```typescript
   // src/features/[domain]/components/ComponentName.tsx
   import { usePermissions, PermissionGuard } from '@/shared/hooks/use-permissions';
   
   interface ComponentProps {
     // other props with proper types (companyId from context)
   }
   
   export function ComponentName(props: ComponentProps) {
     const { hasPermission } = usePermissions();
     const { data, isLoading, error } = useQuery({
       queryKey: ['resource'],
       queryFn: () => fetchResource()
     });
     
     if (isLoading) return <LoadingSpinner />;
     if (error) return <ErrorMessage error={error} />;
     
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

2. **Required Patterns**
   - ✅ Proper TypeScript interfaces
   - ✅ Loading and error states
   - ✅ Permission-based conditional rendering
   - ✅ Company context from usePermissions hook
   - ✅ Consistent styling with design system

## 🔒 **Security Workflows**

### Multi-tenancy & RBAC Checklist
Before deploying any feature:
- [ ] All database queries include `companyId` scoping
- [ ] API routes use `withPermissions` with appropriate permission requirements
- [ ] Frontend components use permission guards for sensitive actions
- [ ] No hardcoded company references
- [ ] Proper role-based access control implemented
- [ ] Permission checks at both API and UI levels
- [ ] Audit logging for sensitive actions

### Code Review Checklist
- [ ] No `any` types used
- [ ] Proper error handling
- [ ] Input validation with Zod
- [ ] No console.log in production code
- [ ] TypeScript strict mode compliance
- [ ] Security patterns followed

## 🧪 **Testing Workflows**

### Manual Testing Checklist
1. **Multi-tenancy**
   - Create two companies
   - Verify data isolation
   - Test role permissions

2. **Authentication**
   - Sign up flow
   - Sign in flow
   - Company context switching

3. **Billing**
   - Stripe checkout
   - Webhook processing
   - Portal access

### Automated Testing (Future)
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📚 **Documentation Workflows**

### When to Update Documentation
- **Architecture Changes**: Update `docs/core/architecture-blueprint.md`
- **New Features**: Update `docs/core/product-status.md`
- **API Changes**: Update `docs/core/api-reference.md`
- **Workflow Changes**: Update this document

### Documentation Structure
```
docs/
├── core/                 # Canonical references
│   ├── architecture-blueprint.md
│   ├── product-status.md
│   └── api-reference.md
├── features/            # Feature-specific guides
├── workflows/           # Windsurf workflows
└── archived/           # Historical documents
```

## 🚀 **Deployment Workflows**

### Pre-deployment Checklist
1. **Code Quality**
   ```bash
   npx tsc --noEmit     # Zero TypeScript errors
   npm run lint         # Zero linting errors
   npm run build        # Successful build
   ```

2. **Database**
   ```bash
   npx prisma migrate status  # All migrations applied
   npx prisma generate        # Client up to date
   ```

3. **Environment**
   - [ ] Environment variables configured
   - [ ] Stripe webhooks configured
   - [ ] Clerk authentication configured
   - [ ] Database connection verified

### Deployment Steps (Future)
1. **Staging Deployment**
   - Deploy to staging environment
   - Run smoke tests
   - Verify integrations

2. **Production Deployment**
   - Deploy to production
   - Monitor error rates
   - Verify key workflows

## 🔧 **Troubleshooting Workflows**

### Common Issues

#### TypeScript Errors
1. **Check strict mode compliance**
   ```bash
   npx tsc --noEmit
   ```

2. **Common fixes**
   - Replace `any` with proper types
   - Add proper error handling
   - Use type guards for unknown types

#### Multi-tenancy Issues
1. **Verify tenant scoping**
   - Check all queries include `companyId`
   - Verify middleware is applied
   - Test with multiple companies

#### Build Issues
1. **Clear caches**
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run build
   ```

---

*These workflows ensure consistent, secure, and maintainable development practices for the SaaStastic platform.*