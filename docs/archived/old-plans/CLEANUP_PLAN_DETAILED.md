# Detailed Cleanup Plan for Junior Developers
**Created**: October 6, 2025  
**Estimated Time**: 6-8 hours  
**Difficulty**: Beginner to Intermediate

This plan provides step-by-step instructions for cleaning up the SaaStastic codebase to prepare it for production deployment.

---

## 📋 **Prerequisites**

Before starting, ensure you have:
- [ ] Visual Studio Code or similar editor installed
- [ ] Git installed and configured
- [ ] Project cloned and dependencies installed (`npm install`)
- [ ] Able to run `npm run dev` successfully
- [ ] Basic understanding of TypeScript and React

---

## 🎯 **Goals**

1. Remove all unused code (imports, variables, functions)
2. Fix ESLint warnings (<10 remaining)
3. Remove debug console.log statements
4. Fix React hook dependencies
5. Optimize component rendering
6. Clean up old test files

**Success Criteria**: 
- ESLint warnings reduced from ~55 to <10
- Zero console.log statements in production code
- Clean `npm run lint` output

---

## 🚀 **Step-by-Step Instructions**

### Phase 1: Remove Unused Imports and Variables (2 hours)

#### 1.1 Run ESLint to See All Warnings

```bash
npm run lint -- --max-warnings=999 > lint-output.txt
```

This creates a file with all warnings. Open `lint-output.txt` to see the list.

#### 1.2 Fix Unused Variables in API Routes

**File**: `src/app/api/auth/sync-user/route.ts`  
**Issue**: `_request` parameter is unused  
**Fix**:
```typescript
// BEFORE
export async function POST(_request: Request) {

// AFTER
export async function POST() {
```

**File**: `src/app/api/health/route.ts`  
**Issue**: `_req` and `_context` are unused  
**Fix**:
```typescript
// BEFORE
export const GET = withApiMiddleware(async (_req, _context) => {

// AFTER
export const GET = withApiMiddleware(async () => {
```

**File**: `src/app/api/user/onboarding-status/route.ts`  
**Issue**: `request` parameter is unused  
**Fix**:
```typescript
// BEFORE
export const GET = withApiMiddleware(async (request: NextRequest, context) => {

// AFTER
export const GET = withApiMiddleware(async (_request: NextRequest, context) => {
```
*Note: Prefix with underscore if you must keep the parameter for type signature*

**File**: `src/app/api/users/team/route.ts`  
**Issue**: `request` parameter is unused  
**Fix**:
```typescript
// BEFORE
export const GET = withPermissions(async (request: NextRequest, context) => {

// AFTER
export const GET = withPermissions(async (_request: NextRequest, context) => {
```

**File**: `src/app/api/webhooks/clerk/route.ts`  
**Issue**: `_req` is unused  
**Fix**:
```typescript
// BEFORE
export const POST = withApiMiddleware(async (_req, context) => {

// AFTER
export const POST = withApiMiddleware(async (_req, context) => {
```
*Already prefixed correctly - no action needed*

#### 1.3 Fix Unused Variables in Dashboard Pages

**File**: `src/app/dashboard/companies/page.tsx`  
**Issue**: `err` in catch block is unused  
**Fix**:
```typescript
// BEFORE
} catch (err) {
  setError('Failed to fetch companies')
}

// AFTER
} catch {
  setError('Failed to fetch companies')
}
```

**File**: `src/app/dashboard/customers/page.tsx`  
**Issue**: Multiple `err` and `Badge` import unused  
**Fix**:
```typescript
// Remove unused import
// BEFORE
import { Badge } from '@/shared/ui/badge'

// AFTER - Remove this line if Badge is not used

// Fix catch blocks
// BEFORE
} catch (err) {

// AFTER
} catch {
```

**File**: `src/app/pricing/page.tsx`  
**Issue**: `index` in map is unused  
**Fix**:
```typescript
// BEFORE
{plans.map((plan, index) => (

// AFTER
{plans.map((plan) => (
```

#### 1.4 Fix Unused Imports in Core Files

**File**: `src/core/auth/company-provider.tsx`  
**Issue**: `createDefaultCompany` is unused  
**Action**: Remove the import and function if not used

**File**: `src/core/db/client.ts`  
**Issue**: `createTenantGuard` is unused  
**Action**: Remove the import if not used

**File**: `src/core/db/tenant-guard.ts`  
**Issue**: `args` parameter is unused  
**Fix**:
```typescript
// BEFORE
function middleware(args: any) {

// AFTER
function middleware() {
```

**File**: `src/core/rbac/provisioner.ts`  
**Issue**: `SYSTEM_ROLE_TEMPLATES` is unused  
**Action**: Remove if not exported or used elsewhere

#### 1.5 Fix Unused Imports in Feature Components

**File**: `src/features/billing/components/billing-history.tsx`  
**Issue**: `error` variable is unused  
**Fix**:
```typescript
// BEFORE
const [error, setError] = useState<string | null>(null)

// AFTER - Remove if truly unused, or use it to display errors
const [error, setError] = useState<string | null>(null)

{error && <div className="text-red-500">{error}</div>}
```

**File**: `src/features/billing/components/subscription-card.tsx`  
**Issue**: `onDowngrade` prop is unused  
**Action**: Remove from props interface if not implemented

**File**: `src/features/billing/services/webhook-handlers.ts`  
**Issue**: Multiple unused imports and `event` parameter  
**Action**: Remove unused Stripe type imports and fix:
```typescript
// BEFORE
async function handleSubscriptionUpdated(event: Stripe.Event) {

// AFTER - If event is unused
async function handleSubscriptionUpdated() {
```

#### 1.6 Fix Unused Variables in User Features

**File**: `src/features/users/components/team-management-page.tsx`  
**Issue**: `hasPermission` from usePermissions is unused  
**Fix**:
```typescript
// BEFORE
const { hasPermission, isLoading } = usePermissions()

// AFTER - If hasPermission is not used
const { isLoading } = usePermissions()
```

**File**: `src/features/users/components/team-members-list.tsx`  
**Issue**: `memberRole` is unused  
**Action**: Remove the variable declaration if not used

**File**: `src/features/users/components/user-activity-dashboard.tsx`  
**Issue**: Unused icon imports  
**Action**: Remove unused Lucide React icon imports

**File**: `src/features/users/services/invitation-service.ts`  
**Issue**: `teamSize` and `subscription` variables are unused  
**Action**: Remove unused variable declarations

#### 1.7 Fix Unused Variables in Shared Libraries

**File**: `src/shared/lib/api-middleware.ts`  
**Issue**: `duration` variable is unused  
**Action**: Either use it for logging or remove it

**File**: `src/shared/lib/rbac-middleware.ts`  
**Issue**: `routeContext` is unused  
**Action**: Remove if not needed for debugging

**File**: `src/shared/lib/saas-helpers.ts`  
**Issue**: Unused parameters in helper functions  
**Action**: Prefix with underscore or remove

#### 1.8 Fix Test Files

**File**: `tests/e2e/companies.spec.ts`  
**Issue**: Unused variables in tests  
**Action**: Remove unused variable declarations

**File**: `tests/e2e/customers.spec.ts`  
**Issue**: Unused variables in tests  
**Action**: Remove unused variable declarations

**File**: `tests/e2e/test-utils.ts`  
**Issue**: `user` variable is unused  
**Action**: Remove if not needed

---

### Phase 2: Fix React Hook Dependencies (1 hour)

React hook dependency warnings can cause bugs. We need to fix these carefully.

#### 2.1 Understanding the Warning

When you see:
```
React Hook useEffect has a missing dependency: 'fetchData'
```

This means the effect uses a function that could change, potentially causing stale closures.

#### 2.2 Fix company-provider.tsx

**File**: `src/core/auth/company-provider.tsx` (Line 52)  
**Issue**: `loadUserCompanies` not in dependency array

**Option 1 - Add to dependencies** (if function can change):
```typescript
useEffect(() => {
  loadUserCompanies()
}, [userId, loadUserCompanies])
```

**Option 2 - Wrap in useCallback** (preferred):
```typescript
const loadUserCompanies = useCallback(async () => {
  // ... existing code
}, [userId]) // Add dependencies that loadUserCompanies uses

useEffect(() => {
  loadUserCompanies()
}, [loadUserCompanies])
```

#### 2.3 Fix billing-history.tsx

**File**: `src/features/billing/components/billing-history.tsx` (Line 24)  
**Issue**: `fetchInvoices` not in dependency array

**Fix**:
```typescript
const fetchInvoices = useCallback(async () => {
  setLoading(true)
  try {
    // ... existing fetch logic
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
  } finally {
    setLoading(false)
  }
}, []) // Add any external dependencies

useEffect(() => {
  fetchInvoices()
}, [fetchInvoices])
```

#### 2.4 Fix user-activity-dashboard.tsx

**File**: `src/features/users/components/user-activity-dashboard.tsx` (Line 71)  
**Issue**: `fetchActivities` and `hasPermission` not in deps

**Fix**:
```typescript
const fetchActivities = useCallback(async () => {
  if (!hasPermission('activity:view')) return
  
  setLoading(true)
  try {
    // ... existing fetch logic
  } catch (err) {
    console.error('Failed to fetch activities:', err)
  } finally {
    setLoading(false)
  }
}, [hasPermission]) // Add hasPermission as dependency

useEffect(() => {
  fetchActivities()
}, [fetchActivities])
```

---

### Phase 3: Remove Console.log Statements (1 hour)

Console.log statements should not be in production code. We'll remove them or replace with proper logging.

#### 3.1 Find All Console Logs

Run this command in PowerShell:
```powershell
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String "console.log" | Select-Object -ExpandProperty Path -Unique
```

Or in Git Bash:
```bash
grep -r "console.log" src/ --include="*.ts" --include="*.tsx" -l
```

#### 3.2 Removal Strategy

For each file with console.log:

**Development Only Logs** - Keep with condition:
```typescript
// BEFORE
console.log('User data:', userData)

// AFTER
if (process.env.NODE_ENV === 'development') {
  console.log('User data:', userData)
}
```

**Error Logs** - Replace with proper error handling:
```typescript
// BEFORE
console.log('Error:', error)

// AFTER
// Remove the console.log, we have proper error boundaries
```

**Debug Logs in Middleware** - Remove entirely:
```typescript
// BEFORE
console.log('Auth middleware running...')

// AFTER - Remove this line completely
```

**Informational Logs** - Replace with structured logging:
```typescript
// BEFORE
console.log('Company created:', companyId)

// AFTER
// Use observability helper (when implemented)
// logger.info('Company created', { companyId })
// For now, remove
```

#### 3.3 Common Files to Check

- `src/shared/lib/api-middleware.ts`
- `src/shared/lib/rbac-middleware.ts`
- `src/app/api/*/route.ts` (all API routes)
- `src/core/auth/company-provider.tsx`
- Any test helper files (keep console.log in tests)

**Important**: Keep console.log in test files (`tests/e2e/*.ts`) - those are fine!

---

### Phase 4: Replace `<img>` with Next.js `<Image />` (30 minutes)

Next.js Image component provides automatic optimization.

#### 4.1 Fix avatar.tsx

**File**: `src/shared/ui/avatar.tsx` (Line 26)

**Before**:
```typescript
<img 
  src={src} 
  alt={alt} 
  className="aspect-square h-full w-full"
/>
```

**After**:
```typescript
import Image from 'next/image'

<Image
  src={src}
  alt={alt}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Note**: Parent container must have `position: relative` for `fill` to work.

#### 4.2 Search for Other Image Tags

```powershell
Get-ChildItem -Path src -Recurse -Include *.tsx | Select-String "<img"
```

Fix any other instances following the same pattern.

---

### Phase 5: Clean Up Old Documentation and Code (1 hour)

#### 5.1 Review CLEANUP_PLAN.md

The original `CLEANUP_PLAN.md` lists some items. Let's verify:

- [ ] Check if `.next/types/` errors are still present
- [ ] Verify TypeScript build status
- [ ] Check if package updates are needed (next phase)

#### 5.2 Remove Obsolete Comments

Look for and remove:
- TODO comments that are completed
- Old commented-out code
- Outdated architecture notes

**How to Find**:
```powershell
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String "// TODO|//TODO"
```

Review each TODO:
- If done: Remove the comment
- If still valid: Keep it
- If outdated: Remove it

#### 5.3 Remove Unused Test Files

Check `tests/e2e/` for:
- Old test files no longer needed
- Duplicate test utilities
- Commented-out test cases

**Keep**: All current test files unless explicitly outdated

---

### Phase 6: Final Verification (1 hour)

#### 6.1 Run ESLint Again

```bash
npm run lint
```

**Expected**: <10 warnings remaining

#### 6.2 Run TypeScript Check

```bash
npx tsc --noEmit
```

**Expected**: 0 errors in `/src` directory  
**Acceptable**: Errors only in `.next/types/` (Next.js generated)

#### 6.3 Test the Application

```bash
npm run dev
```

Navigate to:
1. [ ] Homepage loads
2. [ ] Sign in works
3. [ ] Dashboard accessible
4. [ ] Company creation works
5. [ ] No console errors in browser devtools

#### 6.4 Run E2E Tests

```bash
npm run test:e2e
```

**Expected**: All tests pass or only known issues remain

---

## 📊 **Progress Tracking**

Create a file called `CLEANUP_PROGRESS.md` and track your progress:

```markdown
# Cleanup Progress Tracker

## Phase 1: Unused Imports (2 hours)
- [ ] API routes (8 files)
- [ ] Dashboard pages (3 files)
- [ ] Core files (4 files)
- [ ] Feature components (6 files)
- [ ] User features (3 files)
- [ ] Shared libraries (3 files)
- [ ] Test files (3 files)

## Phase 2: React Hooks (1 hour)
- [ ] company-provider.tsx
- [ ] billing-history.tsx
- [ ] user-activity-dashboard.tsx

## Phase 3: Console Logs (1 hour)
- [ ] Found all instances
- [ ] Fixed/removed all instances

## Phase 4: Image Tags (30 min)
- [ ] avatar.tsx fixed
- [ ] Other instances checked

## Phase 5: Documentation Cleanup (1 hour)
- [ ] TODOs reviewed
- [ ] Old comments removed
- [ ] Test files cleaned

## Phase 6: Verification (1 hour)
- [ ] ESLint passes
- [ ] TypeScript clean
- [ ] App tested manually
- [ ] E2E tests run

**Total Estimated Time**: 6.5 hours  
**Your Actual Time**: _____ hours
```

---

## 🎯 **Common Mistakes to Avoid**

1. **Don't Remove Used Code**: Always verify a variable/import is truly unused before removing
2. **Don't Break Tests**: After each change, run the affected tests
3. **Don't Batch Too Many Changes**: Make small, focused commits
4. **Don't Skip Verification**: Always test after making changes
5. **Don't Remove Type Annotations**: Keep TypeScript types even if parameter is unused (prefix with `_`)

---

## 💡 **Pro Tips**

1. **Use Git**: Commit after each phase so you can rollback if needed
   ```bash
   git add .
   git commit -m "Phase 1: Removed unused imports"
   ```

2. **Use VS Code Auto-Fix**: Many ESLint errors can be auto-fixed:
   - Open VS Code
   - Open Command Palette (Ctrl+Shift+P)
   - Run "ESLint: Fix all auto-fixable Problems"

3. **Test Frequently**: Don't wait until the end to test
   ```bash
   npm run dev
   ```
   Check the browser for errors after each major change

4. **Ask for Help**: If you're unsure about removing something, ask!

---

## ✅ **Completion Checklist**

When you've finished all phases:

- [ ] ESLint warnings < 10
- [ ] No console.log in production code
- [ ] All React hook dependencies fixed
- [ ] Images using Next.js Image component
- [ ] Old TODOs removed
- [ ] TypeScript compilation clean (src/ directory)
- [ ] Application runs without errors
- [ ] E2E tests passing
- [ ] Git commits made for each phase
- [ ] `CLEANUP_PROGRESS.md` updated

---

## 📞 **Questions or Issues?**

If you encounter problems:

1. **Check the error message carefully**
2. **Search in the codebase** for similar patterns
3. **Refer to documentation** in `docs/` folder
4. **Ask your senior developer** if stuck

**Common Issues**:
- "Cannot find module": Check import paths
- "Unused variable": Prefix with `_` if needed for type signature
- "Hook dependency": Wrap function in `useCallback`
- "Type error": Don't remove type annotations

---

**Good luck! Take your time and make incremental progress. Quality over speed!** 🚀


<function_calls>
<invoke name="read_terminal">
<parameter name="ProcessID">61
