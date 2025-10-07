# Quick Fix Commands - Production Readiness

**Use this file for rapid execution of fixes across sessions**

---

## Immediate Actions (This Session)

### 1. Verify Build is Fixed
```bash
npm run build
```
**Expected**: Clean build with 0 errors

### 2. Check TypeScript
```bash
npx tsc --noEmit
```
**Expected**: 0 errors

### 3. Update Packages (Recommended)
```bash
# Update all safe packages
npm update

# Update Stripe to v19 (see STRIPE_V19_MIGRATION.md for details)
npm install stripe@19.0.0

# Update Node types
npm install --save-dev @types/node@latest

# Regenerate Prisma client
npx prisma generate

# Verify
npm run build
```

---

## Systematic Lint Cleanup

### Phase 1: API Routes (11 files)

```bash
# Files with unused parameters - prefix with underscore
```

**Files to fix**:
1. `src/app/api/health/route.ts` - `_req`, `_context`
2. `src/app/api/users/team/route.ts` - `request` → `_request`
3. `src/app/api/webhooks/clerk/route.ts` - `_req`

### Phase 2: React Components (8 files)

**Remove unused imports**:
1. `src/app/dashboard/customers/page.tsx` - Remove `Badge`
2. `src/features/users/components/user-activity-dashboard.tsx` - Remove unused icons
3. `src/features/billing/components/subscription-card.tsx` - Remove `onDowngrade`

### Phase 3: Services (4 files)

**Remove unused variables**:
1. `src/features/users/services/invitation-service.ts` - `teamSize`, `subscription`
2. `src/shared/lib/api-middleware.ts` - `duration`
3. `src/shared/lib/rbac-middleware.ts` - `routeContext`

---

## React Hook Fixes

### Fix 1: company-provider.tsx
```typescript
// Add loadUserCompanies to dependencies
useEffect(() => {
  loadUserCompanies();
}, [loadUserCompanies]);  // Add this dependency
```

### Fix 2: billing-history.tsx
```typescript
// Wrap fetchInvoices in useCallback
const fetchInvoices = useCallback(async () => {
  // ... existing code
}, [companyId]);  // Add dependencies

useEffect(() => {
  fetchInvoices();
}, [fetchInvoices]);
```

### Fix 3: user-activity-dashboard.tsx
```typescript
// Wrap fetchActivities in useCallback
const fetchActivities = useCallback(async () => {
  // ... existing code
}, [companyId, userId, filterType, dateRange, hasPermission]);

useEffect(() => {
  if (hasPermission(PERMISSIONS.SYSTEM_LOGS)) {
    fetchActivities();
  }
}, [fetchActivities, hasPermission]);
```

---

## Next.js Image Fix

### avatar.tsx
```typescript
// Replace
<img src={src} alt={alt} />

// With
import Image from 'next/image';
<Image src={src} alt={alt} width={40} height={40} />
```

---

## Verification Commands

### After Each Fix
```bash
npm run lint
npx tsc --noEmit
```

### Final Verification
```bash
npm run build
npm run lint
npx tsc --noEmit
npm run test  # If tests exist
```

---

## Session Handoff

### To Continue in New Session

Say: "Continue production readiness cleanup from Phase [X] in `docs/core/PRODUCTION_READINESS_PLAN.md`"

### To Fix All Remaining

Say: "Fix all remaining lint warnings and React hook dependencies per `docs/core/QUICK_FIX_COMMANDS.md`"

### To Focus on Specific Area

Say: "Fix only [API routes | React components | Services] lint warnings"

---

## Progress Tracking

Update this section after each session:

### Session 1 (2025-10-01)
- ✅ Created production readiness plan
- ✅ Analyzed Stripe v19 migration (recommended)
- ✅ Fixed sync-user route corruption
- ⏳ Pending: Package updates
- ⏳ Pending: Lint cleanup

### Session 2 (Date)
- [ ] Package updates completed
- [ ] Lint warnings: X → Y
- [ ] React hooks fixed: X/3
- [ ] Build status: [errors/warnings]

### Session 3 (Date)
- [ ] Final cleanup
- [ ] Documentation updates
- [ ] Testing completed
- [ ] Production ready: YES/NO

---

## Emergency Rollback

If something breaks:

```bash
# Revert last commit
git reset --hard HEAD~1

# Or revert specific file
git checkout HEAD -- path/to/file.ts

# Reinstall dependencies
npm install

# Verify
npm run build
```

---

**Last Updated**: 2025-10-01  
**Current Phase**: 1 (Critical Fixes)  
**Next Phase**: 2 (Package Updates)
