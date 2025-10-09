# 🔴 PRE-LAUNCH CRITICAL TASKS

**Status**: MUST COMPLETE BEFORE DAY 1  
**Time Required**: 6-8 hours  
**Why Critical**: Customers need self-service billing and payment notifications

---

## ✅ What's Already Done

You have:
- ✅ Complete RBAC system (29 permissions)
- ✅ Team management with invitations
- ✅ Stripe checkout integration
- ✅ User activity audit logs
- ✅ Multi-tenant architecture
- ✅ 87 passing tests
- ✅ Customer documentation (6 guides)

---

## 🔴 Critical Gap #1: Stripe Customer Portal

**Problem**: Customers can't manage their own billing (update card, cancel, view invoices)

**Why It's Critical**: 
- Every SaaS product needs self-service billing
- You'll get support requests about "how do I cancel?" otherwise
- Industry standard feature

### Task 1.1: Add Stripe Customer Portal API Route (1.5 hours)

**File**: `src/app/api/billing/portal/route.ts`

**AI Prompt**:
```
Create a Next.js API route handler for Stripe Customer Portal at src/app/api/billing/portal/route.ts.

Requirements:
1. Import necessary dependencies (stripe, next auth)
2. Use withPermissions middleware to require BILLING_MANAGE permission
3. Get current user's companyId from auth context
4. Query database for company's stripeCustomerId
5. Create Stripe billing portal session with:
   - customer: stripeCustomerId
   - return_url: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing
6. Return JSON with {url: session.url}
7. Handle errors if company has no Stripe customer

Use existing patterns from src/features/billing/services/stripe-service.ts.
```

**Manual Steps**:
1. Test the API route: `curl http://localhost:3000/api/billing/portal -X POST`
2. Verify it returns a Stripe portal URL
3. Visit the URL and verify it shows billing management

---

### Task 1.2: Add "Manage Billing" Button (30 min)

**File**: `src/app/dashboard/billing/page.tsx`

**Changes Needed**:
1. Add button after subscription card
2. Button onClick calls: `window.location.href = '/api/billing/portal'`
3. Add loading state during redirect
4. Add permission guard (only OWNER/ADMIN see button)

**AI Prompt**:
```
Update src/app/dashboard/billing/page.tsx to add a "Manage Billing" button.

Add after the SubscriptionCard component (around line 117):
- Button text: "Manage Subscription"
- On click: calls /api/billing/portal POST endpoint
- Shows loading spinner while redirecting
- Only visible if user has BILLING_MANAGE permission (use PermissionGuard)
- Use shadcn/ui Button component
- Style: primary button with external link icon

Follow existing patterns in the file.
```

---

### Task 1.3: Update Billing Service (30 min)

**File**: `src/features/billing/services/stripe-service.ts`

**Add Function**:
```typescript
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}
```

**Test**: Verify function works by calling it directly

---

### Task 1.4: Test Complete Flow (30 min)

**Test Checklist**:
- [ ] User with active subscription can click "Manage Billing"
- [ ] Redirects to Stripe Customer Portal
- [ ] Can update payment method
- [ ] Can view invoice history
- [ ] Can cancel subscription (test mode)
- [ ] Returns to /dashboard/billing after actions

---

## 🔴 Critical Gap #2: Billing Notification Emails

**Problem**: Customers don't get notified when:
- Payment fails
- Subscription renews
- Subscription is cancelled

**Why It's Critical**:
- Payment failures need immediate action
- Professional SaaS sends transactional emails
- Reduces support requests

### Task 2.1: Create Email Templates (1.5 hours)

**Create 3 Templates**:

#### Template 1: Payment Failed
**File**: `src/features/billing/email-templates/payment-failed.tsx`

**AI Prompt**:
```
Create a React Email template at src/features/billing/email-templates/payment-failed.tsx for payment failure notifications.

Use @react-email/components.

Include:
- Subject: "Payment Failed - Action Required"
- Personalized greeting with customer name
- Clear explanation: payment for [plan] subscription failed
- Next steps:
  1. Update payment method (link to customer portal)
  2. If not fixed in 3 days, subscription pauses
- CTA button: "Update Payment Method" (links to portal)
- Support link at bottom
- Professional but urgent tone

Export as default.
```

---

#### Template 2: Payment Successful
**File**: `src/features/billing/email-templates/payment-successful.tsx`

**AI Prompt**:
```
Create a React Email template at src/features/billing/email-templates/payment-successful.tsx for successful payment confirmations.

Use @react-email/components.

Include:
- Subject: "Payment Confirmed - Thank You!"
- Personalized greeting
- Confirmation of payment received for [plan]
- Amount charged
- Next billing date
- Link to view invoice
- Thank you message
- Links to docs and support
- Friendly tone

Export as default.
```

---

#### Template 3: Subscription Cancelled
**File**: `src/features/billing/email-templates/subscription-cancelled.tsx`

**AI Prompt**:
```
Create a React Email template at src/features/billing/email-templates/subscription-cancelled.tsx for cancellation confirmations.

Use @react-email/components.

Include:
- Subject: "Subscription Cancelled"
- Personalized greeting
- Confirmation subscription is cancelled
- Access continues until [end date]
- Data export available (link)
- Feedback form link (optional)
- Re-subscribe option if they change mind
- Warm but understanding tone

Export as default.
```

---

### Task 2.2: Update Stripe Webhook Handler (1.5 hours)

**File**: `src/app/api/webhooks/stripe/route.ts`

**AI Prompt**:
```
Update the Stripe webhook handler at src/app/api/webhooks/stripe/route.ts to send email notifications.

Add email sending for these events:
1. invoice.payment_failed - send payment-failed template
2. invoice.payment_succeeded - send payment-successful template
3. customer.subscription.deleted - send subscription-cancelled template

For each event:
1. Get customer email from database using stripeCustomerId
2. Get subscription details
3. Call Resend API to send appropriate template
4. Log success/failure
5. Handle errors gracefully (don't fail webhook)

Use existing Resend setup from invitation-service.ts as reference.
```

**Manual Steps**:
1. Add Resend imports
2. Install @react-email/components if not installed: `npm install @react-email/components`
3. Test each webhook event in Stripe test mode

---

### Task 2.3: Test Email Flow (1 hour)

**Test Checklist**:
- [ ] Create test subscription in Stripe test mode
- [ ] Trigger payment success → Check email arrives
- [ ] Trigger payment failure → Check urgent email arrives
- [ ] Cancel subscription → Check cancellation email arrives
- [ ] Verify all links work in emails
- [ ] Test on mobile email client

**Stripe Test Mode Triggers**:
- Payment success: Use card `4242424242424242`
- Payment failure: Use card `4000000000000341`
- Cancel: Use Stripe dashboard to cancel test subscription

---

## 📋 Pre-Launch Checklist Summary

Before starting Day 1 of MASTER_LAUNCH_PLAN:

- [ ] Task 1.1: Stripe Customer Portal API route ✅ (1.5 hrs)
- [ ] Task 1.2: "Manage Billing" button added ✅ (30 min)
- [ ] Task 1.3: Billing service updated ✅ (30 min)
- [ ] Task 1.4: Portal flow tested ✅ (30 min)
- [ ] Task 2.1: Email templates created ✅ (1.5 hrs)
- [ ] Task 2.2: Webhook handler updated ✅ (1.5 hrs)
- [ ] Task 2.3: Email flow tested ✅ (1 hr)

**Total Time**: 6-7 hours

---

## ✅ After These Tasks

You'll have:
- ✅ Self-service billing (industry standard)
- ✅ Payment notification emails (professional)
- ✅ Reduced support burden (customers can help themselves)
- ✅ 100% launch-ready product

**Then**: Start Day 1 of MASTER_LAUNCH_PLAN.md with confidence! 🚀

---

## 🔧 Environment Variables Needed

Add these to `.env.local` and production:

```bash
# Stripe (should already have these)
STRIPE_SECRET_KEY="sk_test_..."  # or sk_live_ for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Resend (should already have this)
RESEND_API_KEY="re_..."

# App URL (for return URLs)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # or production URL
```

---

## 📚 Documentation Updates Needed

After completing these tasks, update:

**File**: `docs/guides/STRIPE_CUSTOMIZATION.md`
- Add section on Customer Portal integration
- Document the /api/billing/portal endpoint
- Explain how customers manage their billing

**File**: `docs/guides/SETUP_GUIDE.md` (already complete)
- No changes needed, already comprehensive

**File**: `docs/guides/FAQ.md` (already complete)
- Already covers billing questions

---

## 🚨 Common Issues

### Issue: "No Stripe customer found"
**Solution**: Ensure company has completed checkout flow and `stripeCustomerId` is saved

### Issue: Email template not rendering
**Solution**: Check @react-email/components is installed, import paths correct

### Issue: Webhook not triggering emails
**Solution**: Check Resend API key, verify "from" email is verified domain

---

**Next Step**: Complete these 7 tasks (6-7 hours), then proceed to Day 1 of MASTER_LAUNCH_PLAN.md
