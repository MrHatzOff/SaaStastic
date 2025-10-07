# Dependency Update Plan for Intern
**Created**: October 6, 2025  
**Estimated Time**: 3-4 hours  
**Difficulty**: Beginner-Friendly  
**Safety Level**: Medium (includes rollback procedures)

This plan guides you through updating all SaaStastic dependencies to their latest stable versions safely and systematically.

---

## 🎯 **Goals**

1. Update all npm packages to latest stable versions
2. Test application after each major update
3. Document any breaking changes
4. Ensure all tests still pass

**Success Criteria**:
- All packages updated to latest stable versions
- `npm audit` shows 0 vulnerabilities
- All tests passing after updates
- Application runs without errors

---

## ⚠️ **Before You Start - IMPORTANT**

### Safety First

1. **Create a backup branch**:
   ```bash
   git checkout -b dependency-updates-backup
   git push origin dependency-updates-backup
   ```

2. **Create a working branch**:
   ```bash
   git checkout -b dependency-updates
   ```

3. **Verify you can rollback**:
   ```bash
   # If anything breaks, you can always do:
   git checkout main
   git branch -D dependency-updates
   ```

### Prerequisites

- [ ] Git installed and configured
- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Access to project repository
- [ ] Ability to run `npm run dev` successfully

---

## 📊 **Current Dependency Status**

### Core Dependencies (as of Oct 2025)
```json
{
  "@clerk/nextjs": "^6.31.8",
  "@prisma/client": "^6.14.0",
  "next": "15.5.0",
  "react": "19.1.0",
  "stripe": "^19.0.0",
  "zod": "^4.0.17"
}
```

### Dev Dependencies
```json
{
  "@playwright/test": "^1.55.0",
  "prisma": "^6.15.0",
  "typescript": "^5"
}
```

---

## 🚀 **Step-by-Step Update Process**

### Phase 1: Check Current Status (15 minutes)

#### 1.1 Check for Outdated Packages

```bash
npm outdated
```

This shows a table with current vs latest versions. Example output:
```
Package           Current  Wanted  Latest
next              15.5.0   15.5.0  15.5.1
@clerk/nextjs     6.31.8   6.31.8  6.32.0
```

**Save this output** to a file:
```bash
npm outdated > outdated-packages-before.txt
```

#### 1.2 Check for Security Vulnerabilities

```bash
npm audit
```

**Expected**: 0 vulnerabilities (or low-risk only)

If you see HIGH or CRITICAL vulnerabilities:
1. Note them down
2. They should be fixed during this process

#### 1.3 Check Current Node/npm Versions

```bash
node --version
npm --version
```

**Requirements**:
- Node: v18.x or higher
- npm: v9.x or higher

---

### Phase 2: Update Development Dependencies (45 minutes)

Start with dev dependencies - they're safer to update first.

#### 2.1 Update TypeScript

```bash
npm install -D typescript@latest
```

**Test**:
```bash
npx tsc --noEmit
```

**Expected**: Same errors as before (only `.next/types/` errors are acceptable)

#### 2.2 Update ESLint

```bash
npm install -D eslint@latest eslint-config-next@latest
```

**Test**:
```bash
npm run lint
```

**Expected**: Similar warnings as before (we'll fix these in cleanup phase)

#### 2.3 Update Playwright

```bash
npm install -D @playwright/test@latest
npx playwright install
```

**Test**:
```bash
npm run test:e2e -- --reporter=list
```

**Expected**: Tests should pass or have same known failures

#### 2.4 Update Prisma

```bash
npm install -D prisma@latest
npm install @prisma/client@latest
```

**After updating, regenerate Prisma Client**:
```bash
npx prisma generate
```

**Test database connection**:
```bash
npx prisma db push --skip-generate
```

**Expected**: "Database is already in sync with Prisma schema"

#### 2.5 Update TailwindCSS

```bash
npm install -D tailwindcss@latest @tailwindcss/postcss@latest
```

**Test**:
```bash
npm run dev
```

Open browser to `http://localhost:3000` and verify:
- [ ] Styles load correctly
- [ ] No console errors
- [ ] Pages render properly

#### 2.6 Commit Dev Dependency Updates

```bash
git add package.json package-lock.json
git commit -m "Update dev dependencies: TypeScript, ESLint, Playwright, Prisma, TailwindCSS"
```

---

### Phase 3: Update UI Libraries (30 minutes)

These are relatively safe but test carefully.

#### 3.1 Update Radix UI Components

```bash
npm install @radix-ui/react-dialog@latest @radix-ui/react-label@latest @radix-ui/react-progress@latest @radix-ui/react-select@latest @radix-ui/react-slot@latest @radix-ui/react-tabs@latest
```

**Test**: Navigate through the app and verify:
- [ ] Modals/dialogs work
- [ ] Form inputs work
- [ ] Tab navigation works
- [ ] Progress bars display correctly

#### 3.2 Update Lucide Icons

```bash
npm install lucide-react@latest
```

**Test**: Verify icons render correctly on:
- [ ] Dashboard
- [ ] Navigation menu
- [ ] Buttons
- [ ] Team management page

#### 3.3 Update Styling Utilities

```bash
npm install clsx@latest tailwind-merge@latest class-variance-authority@latest
```

**Test**:
```bash
npm run dev
```

Visual check: All components should look the same

#### 3.4 Commit UI Library Updates

```bash
git add package.json package-lock.json
git commit -m "Update UI libraries: Radix UI, Lucide, styling utilities"
```

---

### Phase 4: Update Core Framework (1 hour)

**⚠️ CRITICAL**: This is the most important phase. Test thoroughly!

#### 4.1 Update Next.js

**Check Next.js changelog first**:
```bash
# Open in browser
https://github.com/vercel/next.js/releases
```

Look for breaking changes between 15.5.0 and latest version.

**Update**:
```bash
npm install next@latest
```

**Test thoroughly**:
```bash
# Clean build
rm -rf .next
npm run build

# If build succeeds:
npm run dev
```

**Test all critical pages**:
- [ ] Homepage (`/`)
- [ ] Sign in (`/sign-in`)
- [ ] Dashboard (`/dashboard`)
- [ ] Pricing (`/pricing`)
- [ ] API routes working (check Network tab)

**If build fails**: 
```bash
# Rollback
git checkout package.json package-lock.json
npm install
```
Document the error and ask for help.

#### 4.2 Update React

**⚠️ Warning**: React 19 is new. Only update if Next.js supports latest version.

**Check compatibility**:
- Read Next.js release notes
- Ensure Next.js explicitly supports the React version

**If compatible**:
```bash
npm install react@latest react-dom@latest
npm install -D @types/react@latest @types/react-dom@latest
```

**Test**:
```bash
npm run dev
```

Test all interactive features:
- [ ] Forms submit correctly
- [ ] State updates work
- [ ] No hydration errors in console

**If you see errors**: Rollback immediately
```bash
git checkout package.json package-lock.json
npm install
```

#### 4.3 Commit Framework Updates

**Only commit if everything works**:
```bash
git add package.json package-lock.json
git commit -m "Update Next.js and React to latest versions"
```

---

### Phase 5: Update Authentication & Payments (1 hour)

**⚠️ HIGH RISK**: These are critical for app functionality.

#### 5.1 Update Clerk

**Check Clerk changelog**:
```bash
# Open in browser
https://clerk.com/changelog
```

**Update**:
```bash
npm install @clerk/nextjs@latest
npm install -D @clerk/testing@latest
```

**Test authentication flow**:
1. Start dev server: `npm run dev`
2. Sign out if signed in
3. Sign in with test credentials
4. Verify:
   - [ ] Sign in works
   - [ ] Dashboard loads
   - [ ] User menu works
   - [ ] Company context loads
   - [ ] Sign out works

**Test E2E**:
```bash
npm run test:e2e -- auth.spec.ts
```

**If authentication breaks**: ROLLBACK IMMEDIATELY
```bash
git checkout package.json package-lock.json
npm install
```

#### 5.2 Update Stripe

**⚠️ CRITICAL**: Read Stripe migration guide first!

**Check Stripe changelog**:
```bash
# Open in browser
https://github.com/stripe/stripe-node/releases
```

**Current version**: 19.0.0  
**If there's v20+**: READ THE MIGRATION GUIDE FIRST

**Update**:
```bash
npm install stripe@latest
```

**Test billing**:
1. Navigate to `/pricing`
2. Verify pricing displays correctly
3. (Don't actually checkout - that's okay)
4. Navigate to `/dashboard/billing`
5. Verify subscription status displays

**Test webhook handling**:
```bash
# Check webhook route compiles
npm run build
```

Look for any TypeScript errors in:
- `src/app/api/webhooks/stripe/route.ts`
- `src/features/billing/services/stripe-service.ts`
- `src/features/billing/services/webhook-handlers.ts`

**If Stripe breaks**: ROLLBACK
```bash
git checkout package.json package-lock.json
npm install
```

#### 5.3 Commit Auth & Payment Updates

**Only if all tests pass**:
```bash
git add package.json package-lock.json
git commit -m "Update Clerk and Stripe to latest versions"
```

---

### Phase 6: Update Remaining Dependencies (30 minutes)

These are lower-risk updates.

#### 6.1 Update React Query

```bash
npm install @tanstack/react-query@latest
```

**Test**: Verify data fetching works:
- [ ] Dashboard loads data
- [ ] Company list populates
- [ ] Customer list populates

#### 6.2 Update Utility Libraries

```bash
npm install uuid@latest zod@latest dotenv@latest
```

**Test**:
```bash
npm run build
```

Should complete without errors.

#### 6.3 Update Sentry

```bash
npm install @sentry/nextjs@latest
```

**Test**: Build completes without errors
```bash
npm run build
```

#### 6.4 Update Rate Limiting

```bash
npm install @upstash/ratelimit@latest @upstash/redis@latest
```

**Test**: API routes work correctly
- Test any API endpoint in browser
- Should not see rate limit errors (unless you spam requests)

#### 6.5 Update Server Actions

```bash
npm install next-safe-action@latest
```

**Test**: Server actions work
- Company creation
- User invitations
- Any forms that use server actions

#### 6.6 Update Theme & Notifications

```bash
npm install next-themes@latest sonner@latest
```

**Test**:
- [ ] Theme switcher works (if implemented)
- [ ] Toast notifications display correctly
- [ ] Dark/light mode toggles (if implemented)

#### 6.7 Commit Remaining Updates

```bash
git add package.json package-lock.json
git commit -m "Update React Query, utilities, Sentry, and UI libraries"
```

---

### Phase 7: Final Verification (1 hour)

#### 7.1 Run Full Test Suite

```bash
# TypeScript check
npx tsc --noEmit

# ESLint check
npm run lint

# Build check
npm run build

# E2E tests
npm run test:e2e
```

**Expected Results**:
- TypeScript: 0 errors in `/src`, acceptable errors in `.next/types/`
- ESLint: Similar warnings as before (<60)
- Build: Completes successfully
- E2E: All tests pass

#### 7.2 Security Audit

```bash
npm audit
```

**Expected**: 0 vulnerabilities

**If you see vulnerabilities**:
```bash
npm audit fix
```

**If critical vulnerabilities remain**:
1. Document them
2. Ask senior developer for guidance

#### 7.3 Check Package Sizes

```bash
npm run build
```

Look at the output - bundle sizes should be similar or smaller than before.

**Red flag**: If bundle size increased by >20%, investigate which package caused it.

#### 7.4 Manual Testing Checklist

Start the app:
```bash
npm run dev
```

Test these critical flows:

**Authentication**:
- [ ] Sign up works (use test email)
- [ ] Sign in works
- [ ] Sign out works

**Company Management**:
- [ ] Dashboard loads
- [ ] Company creation works
- [ ] Company switching works (if multi-company)

**Billing** (visual check only - don't checkout):
- [ ] Pricing page loads
- [ ] Plans display correctly
- [ ] Billing dashboard accessible

**Team Management**:
- [ ] Team page loads
- [ ] Team members display
- [ ] Invite modal opens

**Customer Management**:
- [ ] Customer list loads
- [ ] Customer creation works
- [ ] Customer details display

#### 7.5 Document Any Changes

Create a file called `DEPENDENCY_UPDATE_NOTES.md`:

```markdown
# Dependency Update Notes - [DATE]

## Packages Updated

### Major Updates
- Next.js: 15.5.0 → [new version]
- React: 19.1.0 → [new version]
- Clerk: 6.31.8 → [new version]
- Stripe: 19.0.0 → [new version]

### Minor Updates
- [List other notable updates]

## Breaking Changes

[Document any breaking changes you encountered]

## Issues Encountered

[Document any issues and how you resolved them]

## Test Results

- TypeScript: ✅ PASS / ❌ FAIL
- ESLint: ✅ PASS / ❌ FAIL
- Build: ✅ PASS / ❌ FAIL
- E2E Tests: ✅ PASS / ❌ FAIL
- Manual Testing: ✅ PASS / ❌ FAIL

## Next Steps

[Any remaining items or follow-up needed]
```

---

## 🆘 **Troubleshooting Guide**

### Problem: "npm install" fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Problem: TypeScript errors after update

**Check**:
1. Is the error in your code or in `node_modules`?
2. Is it in `.next/types/`? (Those are okay)
3. Run `npx tsc --noEmit` to see all errors

**Solution**: If errors in your code, ask for help. Don't try to fix complex TypeScript errors alone.

### Problem: Build fails after update

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Try building again
npm run build
```

If still failing, rollback the last update:
```bash
git log --oneline
git revert [commit-hash]
npm install
```

### Problem: Tests fail after update

**Solution**:
1. Check if tests were passing before update
2. If tests have same failures as before: acceptable
3. If new failures: rollback the update

### Problem: Application doesn't start

**Solution**:
```bash
# Check for errors
npm run dev

# If you see port conflict
npx kill-port 3000

# Try again
npm run dev
```

### Problem: Clerk authentication breaks

**Solution**:
```bash
# Rollback Clerk immediately
git checkout package.json package-lock.json
npm install

# Document the issue
echo "Clerk update from [old] to [new] caused auth failure" >> DEPENDENCY_UPDATE_NOTES.md
```

### Problem: Stripe integration breaks

**Solution**:
```bash
# Rollback Stripe immediately  
git checkout package.json package-lock.json
npm install

# Check Stripe changelog for breaking changes
# Ask senior developer for guidance
```

---

## ✅ **Completion Checklist**

Before marking complete:

- [ ] All packages updated to latest stable versions
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] `npm run build` completes successfully
- [ ] `npm run test:e2e` passes
- [ ] Manual testing completed successfully
- [ ] `DEPENDENCY_UPDATE_NOTES.md` created
- [ ] All changes committed to git
- [ ] Branch pushed to remote

---

## 📝 **Final Steps**

### Create Pull Request

```bash
# Push your branch
git push origin dependency-updates

# Create PR description
```

**PR Description Template**:
```markdown
## Dependency Updates

### Summary
Updated all npm packages to latest stable versions as of [DATE].

### Packages Updated
- Next.js: 15.5.0 → [version]
- React: 19.1.0 → [version]
- Clerk: 6.31.8 → [version]
- Stripe: 19.0.0 → [version]
- [List other major updates]

### Testing Completed
- ✅ TypeScript compilation
- ✅ ESLint checks
- ✅ Build process
- ✅ E2E test suite
- ✅ Manual testing of critical flows

### Breaking Changes
[List any breaking changes or "None"]

### Notes
[Any additional notes]

### Checklist
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Application runs without errors
- [ ] Documentation updated
```

---

## 🎉 **Success Criteria**

You've successfully completed this task when:

✅ All dependencies updated to latest stable  
✅ Zero security vulnerabilities  
✅ All tests passing  
✅ Application runs without errors  
✅ Documentation complete  
✅ Changes committed and pushed  
✅ Pull request created  

**Estimated time**: 3-4 hours  
**Your actual time**: _____ hours

---

## 📞 **When to Ask for Help**

**Ask for help immediately if**:
- Authentication stops working
- Payment/billing breaks
- Application won't start
- Build process fails completely
- You see "CRITICAL" security vulnerabilities
- Major TypeScript errors in your code
- React rendering errors

**It's okay to ask for help!** Updates can be tricky, especially for critical dependencies like Clerk and Stripe.

---

**Remember**: Safety first! It's better to rollback and ask for help than to push broken code.

**Good luck!** 🚀
