# Production Readiness Cleanup Plan

## Status: In Progress
**Started**: 2025-10-01
**Target**: Clean build with 0 errors, minimal warnings

## Critical Issues (Blocking Build)

### 1. TypeScript Build Errors (11 errors in .next/types/)
- [ ] `.next/types/app/api/companies/[id]/route.ts` (3 errors)
- [ ] `.next/types/app/api/companies/route.ts` (2 errors)  
- [ ] `.next/types/app/api/customers/[id]/route.ts` (3 errors)
- [ ] `.next/types/app/api/customers/route.ts` (2 errors)
- [ ] `.next/types/app/api/health/route.ts` (1 error)

**Root Cause**: Next.js 15 route handler type system expects specific param types
**Solution**: Update API middleware to properly handle Next.js 15's async params or add type assertions

## Lint Warnings (55 warnings - Non-blocking but should fix)

### Unused Imports/Variables (Easy Fixes)
- [ ] `src/app/api/auth/sync-user/route.ts` - Remove `_request`
- [ ] `src/app/api/companies/[id]/route.ts` - Remove unused imports
- [ ] `src/app/api/health/route.ts` - Remove `_req`, `_context`
- [ ] `src/app/api/user/onboarding-status/route.ts` - Remove `request`
- [ ] `src/app/api/users/team/route.ts` - Remove `request`
- [ ] `src/app/api/webhooks/clerk/route.ts` - Remove `_req`
- [ ] `src/app/dashboard/companies/page.tsx` - Remove `err`
- [ ] `src/app/dashboard/customers/page.tsx` - Remove `Badge`, `err` (3x)
- [ ] `src/app/pricing/page.tsx` - Remove `index`
- [ ] `src/core/auth/company-provider.tsx` - Remove `createDefaultCompany`
- [ ] `src/core/db/client.ts` - Remove `createTenantGuard`
- [ ] `src/core/db/tenant-guard.ts` - Remove `args`
- [ ] `src/core/rbac/provisioner.ts` - Remove `SYSTEM_ROLE_TEMPLATES`
- [ ] `src/features/billing/components/billing-history.tsx` - Remove `error`
- [ ] `src/features/billing/components/subscription-card.tsx` - Remove `onDowngrade`
- [ ] `src/features/billing/services/webhook-handlers.ts` - Remove unused imports, `event`
- [ ] `src/features/users/components/team-management-page.tsx` - Remove `hasPermission`
- [ ] `src/features/users/components/team-members-list.tsx` - Remove `memberRole`
- [ ] `src/features/users/components/user-activity-dashboard.tsx` - Remove unused icon imports
- [ ] `src/features/users/services/invitation-service.ts` - Remove `teamSize`, `subscription`
- [ ] `src/shared/lib/api-middleware.ts` - Remove `duration`
- [ ] `src/shared/lib/rbac-middleware.ts` - Remove `routeContext`
- [ ] `src/shared/lib/saas-helpers.ts` - Remove unused params
- [ ] `tests/e2e/companies.spec.ts` - Remove unused vars
- [ ] `tests/e2e/customers.spec.ts` - Remove unused vars
- [ ] `tests/e2e/test-utils.ts` - Remove `user`

### React Hook Dependencies (Requires Careful Review)
- [ ] `src/core/auth/company-provider.tsx:52` - Add `loadUserCompanies` to deps
- [ ] `src/features/billing/components/billing-history.tsx:24` - Add `fetchInvoices` to deps
- [ ] `src/features/users/components/user-activity-dashboard.tsx:71` - Add `fetchActivities`, `hasPermission` to deps

### Next.js Optimization
- [ ] `src/shared/ui/avatar.tsx:26` - Replace `<img>` with `<Image />` from `next/image`

## Package Updates

### Safe Updates (Recommended)
- [x] Provided commands for safe package updates
- [ ] User to run update commands
- [ ] Verify build after updates

### Review Required
- [ ] Stripe v17 → v19 (breaking changes - review changelog first)

## Testing Checklist
- [ ] `npm run build` - Clean build with 0 errors
- [ ] `npm run lint` - 0 errors, minimal warnings
- [ ] `npx tsc --noEmit` - 0 errors
- [ ] Manual testing of key features
- [ ] RBAC provisioning works
- [ ] Activity dashboard works
- [ ] Team management works

## Notes
- Focus on critical build errors first
- Then clean up lint warnings systematically
- Test after each major change
- Document any breaking changes or workarounds
