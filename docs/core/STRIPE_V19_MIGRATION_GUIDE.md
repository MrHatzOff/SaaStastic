# Stripe v19 Migration Guide

**Status**: 🔴 **CRITICAL** - Required for production deployment  
**Estimated Time**: 2-3 hours  
**Risk Level**: Medium (well-documented changes, requires thorough testing)

---

## Overview

Stripe Node.js SDK was updated from v17.7.0 to v19.0.0, introducing several breaking changes that affect our billing system. This guide provides step-by-step instructions to fix all compatibility issues.

---

## Breaking Changes Summary

### 1. API Version Update
- **Old**: `2025-02-24.acacia`
- **New**: `2025-09-30.clover`
- **Impact**: 2 files

### 2. Invoice Structure Changes
- **Old**: `invoice.subscription_details?.metadata?.companyId`
- **New**: `invoice.metadata?.companyId` or fetch subscription separately
- **Impact**: 5 occurrences in webhook handlers

### 3. Subscription Property Names
- **Old**: `subscription.current_period_start` (snake_case)
- **New**: `subscription.currentPeriodStart` (camelCase)
- **Impact**: 2 occurrences in stripe-service.ts

### 4. Usage Records API
- **Old**: `stripe.subscriptionItems.createUsageRecord()`
- **New**: Method signature changed or moved
- **Impact**: 1 occurrence in stripe-service.ts

---

## Step-by-Step Fixes

### Fix #1: Update API Version (2 files)

#### File: `src/features/billing/services/stripe-service.ts`

**Location**: Line 16

**Current Code**:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});
```

**Fixed Code**:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});
```

#### File: `src/features/billing/services/webhook-handlers.ts`

**Location**: Line 8

**Current Code**:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});
```

**Fixed Code**:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});
```

---

### Fix #2: Subscription Period Properties (2 occurrences)

#### File: `src/features/billing/services/stripe-service.ts`

**Location**: Lines 486-487

**Current Code**:
```typescript
currentPeriodStart: new Date(subscription.current_period_start * 1000),
currentPeriodEnd: new Date(subscription.current_period_end * 1000),
```

**Fixed Code**:
```typescript
currentPeriodStart: new Date(subscription.currentPeriodStart * 1000),
currentPeriodEnd: new Date(subscription.currentPeriodEnd * 1000),
```

**Note**: Stripe v19 uses camelCase for property names instead of snake_case.

---

### Fix #3: Invoice Subscription Details (5 occurrences)

Stripe v19 changed how invoice metadata is accessed. We need to update all references.

#### File: `src/features/billing/services/stripe-service.ts`

**Location**: Line 521

**Current Code**:
```typescript
const companyId = invoice.subscription_details?.metadata?.companyId ||
                  invoice.metadata?.companyId;
```

**Analysis**: Need to check Stripe v19 documentation for correct property path.

**Recommended Approach**:
```typescript
// Option 1: Use invoice metadata directly (if we set it during checkout)
const companyId = invoice.metadata?.companyId;

// Option 2: Fetch subscription separately if needed
if (!companyId && invoice.subscription) {
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  companyId = subscription.metadata?.companyId;
}
```

#### File: `src/features/billing/services/webhook-handlers.ts`

**Locations**: Lines 305, 322, 340, 380, 422

**Pattern to Fix**:
```typescript
// OLD PATTERN:
if (!invoice.subscription) return;
const companyId = invoice.subscription_details?.metadata?.companyId;

// NEW PATTERN (Option 1 - Direct metadata):
const companyId = invoice.metadata?.companyId;
if (!companyId) {
  console.error('Invoice missing companyId metadata');
  return;
}

// NEW PATTERN (Option 2 - Fetch subscription):
if (!invoice.subscription) return;
const subscription = await stripe.subscriptions.retrieve(
  invoice.subscription as string
);
const companyId = subscription.metadata?.companyId;
```

**Recommendation**: Use Option 1 (direct metadata) if we're setting `companyId` in invoice metadata during checkout. Otherwise, use Option 2.

---

### Fix #4: Usage Records API (1 occurrence)

#### File: `src/features/billing/services/stripe-service.ts`

**Location**: Line 449

**Current Code**:
```typescript
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: usage,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment',
  }
);
```

**Issue**: `createUsageRecord` method signature changed in Stripe v19.

**Research Required**: Check Stripe v19 documentation for:
1. Is the method still on `subscriptionItems`?
2. Has the parameter structure changed?
3. Are there new required fields?

**Temporary Solution** (if method is deprecated):
```typescript
// Check if we're actually using usage-based billing
// If not, consider removing this code path
console.warn('Usage-based billing needs Stripe v19 update');
```

**Proper Solution** (after documentation review):
```typescript
// Update based on Stripe v19 API documentation
// Example (verify with docs):
await stripe.billing.meterEvents.create({
  event_name: 'usage',
  payload: {
    stripe_customer_id: customerId,
    value: usage.toString(),
  },
});
```

---

## Testing Checklist

### Unit Tests
```bash
# Run Stripe service tests
npm run test -- stripe-service.test.ts

# Run webhook handler tests  
npm run test -- webhook-handlers.test.ts
```

### Integration Tests

#### 1. Checkout Flow
- [ ] Create checkout session
- [ ] Complete payment
- [ ] Verify subscription created
- [ ] Check database subscription record
- [ ] Verify metadata includes `companyId`

#### 2. Webhook Events
- [ ] Test `checkout.session.completed`
- [ ] Test `customer.subscription.created`
- [ ] Test `customer.subscription.updated`
- [ ] Test `customer.subscription.deleted`
- [ ] Test `invoice.payment_succeeded`
- [ ] Test `invoice.payment_failed`

#### 3. Billing Portal
- [ ] Access billing portal
- [ ] Update payment method
- [ ] Change subscription plan
- [ ] Cancel subscription

#### 4. Usage-Based Billing (if applicable)
- [ ] Record usage
- [ ] Verify usage appears in Stripe dashboard
- [ ] Check invoice includes usage charges

---

## Manual Testing Script

```bash
# 1. Start development server
npm run dev

# 2. Test checkout flow
# - Navigate to /pricing
# - Click "Subscribe" on a plan
# - Complete checkout with test card: 4242 4242 4242 4242
# - Verify redirect to dashboard
# - Check database for subscription record

# 3. Test webhooks (use Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded

# 4. Check logs for errors
# - Review console output
# - Check database records
# - Verify no TypeScript errors
```

---

## Rollback Plan

If issues arise during migration:

```bash
# 1. Revert Stripe package
npm install stripe@17.7.0

# 2. Revert code changes
git checkout HEAD -- src/features/billing/

# 3. Verify build
npm run build

# 4. Document issues for investigation
```

---

## Verification Commands

After completing all fixes:

```bash
# 1. Type check
npx tsc --noEmit
# Expected: 11 errors (only .next/types, no Stripe errors)

# 2. Build
npm run build
# Expected: Clean build

# 3. Lint
npm run lint
# Expected: 53 warnings (same as before, no new errors)
```

---

## Additional Resources

- [Stripe Node.js v19 Changelog](https://github.com/stripe/stripe-node/releases/tag/v19.0.0)
- [Stripe Node.js v18 Changelog](https://github.com/stripe/stripe-node/releases/tag/v18.0.0)
- [Stripe API Version 2025-09-30](https://stripe.com/docs/upgrades#2025-09-30)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)

---

## Junior Developer Instructions

**Task**: Fix Stripe v19 compatibility issues

**Prerequisites**:
- Read this entire guide
- Have Stripe test account credentials
- Understand our billing flow (see `docs/core/architecture/billing.md`)

**Steps**:

1. **Create feature branch**
   ```bash
   git checkout -b fix/stripe-v19-compatibility
   ```

2. **Fix API versions** (Easy - 5 minutes)
   - Update both files as shown in Fix #1
   - Save and run `npx tsc --noEmit` to verify

3. **Fix subscription properties** (Easy - 5 minutes)
   - Update camelCase properties as shown in Fix #2
   - Save and run `npx tsc --noEmit` to verify

4. **Fix invoice metadata** (Medium - 30 minutes)
   - Research: Check our checkout code to see if we set `companyId` in invoice metadata
   - If yes: Use Option 1 (direct metadata access)
   - If no: Use Option 2 (fetch subscription)
   - Update all 5 occurrences
   - Test with `npx tsc --noEmit`

5. **Fix usage records** (Hard - 1 hour)
   - Read Stripe v19 documentation for usage-based billing
   - Determine if we're using this feature
   - If not using: Add TODO comment and skip
   - If using: Update API call per documentation
   - Test thoroughly

6. **Run tests**
   ```bash
   npm run build
   npm run lint
   npx tsc --noEmit
   ```

7. **Manual testing**
   - Follow "Manual Testing Script" section
   - Document any issues found

8. **Create PR**
   - Include test results
   - Note any deviations from this guide
   - Request review from senior developer

**Estimated Time**: 2-3 hours total

**When to Ask for Help**:
- If TypeScript errors don't match this guide
- If tests fail unexpectedly
- If unsure about metadata approach
- If usage records API is unclear

---

## Senior Developer Notes

### Architecture Considerations

1. **Metadata Strategy**
   - Verify we're setting `companyId` in invoice metadata during checkout
   - If not, update `createCheckoutSession` to include it
   - This simplifies webhook handlers significantly

2. **Usage-Based Billing**
   - Assess if we're actually using this feature
   - If not, consider removing the code path
   - If yes, research Stripe's new Billing Meters API

3. **Error Handling**
   - Add proper error handling for missing metadata
   - Log errors with sufficient context for debugging
   - Consider adding Sentry alerts for billing failures

4. **Testing Strategy**
   - Add comprehensive unit tests for webhook handlers
   - Create E2E tests for complete billing flow
   - Set up Stripe test fixtures for consistent testing

### Performance Considerations

- Invoice webhook handlers fetch subscription separately (Option 2)
- This adds API call latency
- Consider caching subscription data or using metadata (Option 1)

### Security Considerations

- Verify webhook signature validation still works
- Ensure `companyId` metadata can't be spoofed
- Test with malformed webhook payloads

---

**Last Updated**: 2025-10-01  
**Status**: Ready for implementation  
**Assigned To**: TBD
