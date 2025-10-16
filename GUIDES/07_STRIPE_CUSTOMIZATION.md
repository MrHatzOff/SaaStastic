# 💳 Stripe Customization Guide

**Learn how to customize SaaStastic's Stripe billing integration, add subscription plans, implement metered billing, and handle webhooks.**

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Understanding the Billing System](#understanding-the-billing-system)
3. [Customizing Subscription Plans](#customizing-subscription-plans)
4. [Checkout Customization](#checkout-customization)
5. [Metered Billing](#metered-billing)
6. [Customer Portal](#customer-portal)
7. [Webhook Handling](#webhook-handling)
8. [Invoice Customization](#invoice-customization)
9. [Testing](#testing)
10. [Real-World Examples](#real-world-examples)

---

## Introduction

### What's Included

SaaStastic's Stripe integration provides:
- ✅ **Subscription management** (create, update, cancel)
- ✅ **Checkout sessions** with customizable plans
- ✅ **Customer portal** for self-service
- ✅ **Webhook handling** for all events
- ✅ **Invoice management** and payment history
- ✅ **Usage tracking** for metered billing
- ✅ **Multi-tenant isolation** (separate Stripe customers per company)

### Key Files

| File | Purpose |
|------|---------|
| `src/features/billing/services/stripe-service.ts` | Core Stripe operations |
| `src/features/billing/services/webhook-handlers.ts` | Webhook event processing |
| `src/app/api/billing/checkout/route.ts` | Checkout session creation |
| `src/app/api/billing/portal/route.ts` | Customer portal access |
| `src/app/api/webhooks/stripe/route.ts` | Webhook endpoint |

---

## Understanding the Billing System

### Data Flow

```
User → Checkout Button → Stripe Checkout → Webhook → Database → UI Update
```

1. User clicks "Subscribe" button
2. API creates Stripe checkout session
3. User completes payment on Stripe
4. Stripe sends webhook to your app
5. Webhook handler updates database
6. UI shows updated subscription status

### Database Schema

```prisma
model Subscription {
  id                   String   @id
  companyId            String   @unique
  stripeSubscriptionId String   @unique
  stripePriceId        String
  status               SubscriptionStatus
  currentPeriodEnd     DateTime
  // ...
}

model Invoice {
  id              String   @id
  companyId       String
  stripeInvoiceId String   @unique
  amountPaid      Int
  status          InvoiceStatus
  // ...
}
```

---

## Customizing Subscription Plans

### Step 1: Create Plans in Stripe Dashboard

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click **"+ Add Product"**
3. Configure your plan:
   ```
   Name: Professional Plan
   Description: Perfect for growing teams
   Pricing: $99/month (recurring)
   ```
4. Copy the **Price ID** (starts with `price_...`)

### Step 2: Update Environment Variables

Add your price IDs:

```bash
# .env.local
STRIPE_PRICE_STARTER_MONTHLY="price_1ABC..."
STRIPE_PRICE_PRO_MONTHLY="price_2DEF..."
STRIPE_PRICE_ENTERPRISE_MONTHLY="price_3GHI..."

STRIPE_PRODUCT_STARTER="prod_ABC..."
STRIPE_PRODUCT_PRO="prod_DEF..."
STRIPE_PRODUCT_ENTERPRISE="prod_GHI..."
```

### Step 3: Define Plans in Code

```typescript
// src/features/billing/services/stripe-service.ts
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams',
    stripePriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    stripeProductId: process.env.STRIPE_PRODUCT_STARTER!,
    price: 2900, // $29.00 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 5 team members',
      '10 GB storage',
      '1,000 API calls/month',
      'Email support',
    ],
    limits: {
      users: 5,
      storage: 10,
      apiCalls: 1000,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses',
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    stripeProductId: process.env.STRIPE_PRODUCT_PRO!,
    price: 9900, // $99.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 20 team members',
      '100 GB storage',
      '10,000 API calls/month',
      'Priority support',
      'Advanced analytics',
    ],
    limits: {
      users: 20,
      storage: 100,
      apiCalls: 10000,
    },
  },
  // Add more plans...
];
```

### Step 4: Add Annual Plans

Offer annual billing with discount:

```typescript
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // ... monthly plans ...
  
  {
    id: 'professional-annual',
    name: 'Professional',
    description: 'Save 20% with annual billing',
    stripePriceId: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    stripeProductId: process.env.STRIPE_PRODUCT_PRO!,
    price: 95040, // $950.40 (20% off $99 × 12)
    currency: 'usd',
    interval: 'year',
    features: [
      '2 months free (annual billing)',
      'Up to 20 team members',
      '100 GB storage',
      // ... other features
    ],
    limits: {
      users: 20,
      storage: 100,
      apiCalls: 10000,
    },
    savings: {
      percentage: 20,
      amount: 23760, // $237.60 saved per year
    },
  },
];
```

### Step 5: Create Pricing Page Component

```typescript
// src/components/pricing-table.tsx
import { SUBSCRIPTION_PLANS } from '@/features/billing/services/stripe-service';
import { Button } from '@/shared/ui/button';
import { Check } from 'lucide-react';

export function PricingTable() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  
  const plansToShow = SUBSCRIPTION_PLANS.filter(
    plan => plan.interval === billingPeriod
  );

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setBillingPeriod('month')}
          className={billingPeriod === 'month' ? 'font-bold' : ''}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod('year')}
          className={billingPeriod === 'year' ? 'font-bold' : ''}
        >
          Annual <span className="text-green-600">Save 20%</span>
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plansToShow.map(plan => (
          <div key={plan.id} className="border rounded-lg p-6">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-muted-foreground">{plan.description}</p>
            
            <div className="my-6">
              <span className="text-4xl font-bold">
                ${(plan.price / 100).toFixed(0)}
              </span>
              <span className="text-muted-foreground">
                /{plan.interval}
              </span>
            </div>

            {plan.savings && (
              <div className="text-sm text-green-600 mb-4">
                Save ${(plan.savings.amount / 100).toFixed(0)}/year
              </div>
            )}

            <Button className="w-full" onClick={() => handleSubscribe(plan.id)}>
              Subscribe
            </Button>

            <ul className="mt-6 space-y-3">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Checkout Customization

### Custom Checkout Parameters

```typescript
// src/features/billing/services/stripe-service.ts
export async function createCheckoutSession({
  companyId,
  priceId,
  successUrl,
  cancelUrl,
  trialDays = 0,
  couponId,
  allowPromotionCodes = true,
}: {
  companyId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  couponId?: string;
  allowPromotionCodes?: boolean;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    
    // Optional features
    subscription_data: trialDays > 0 ? {
      trial_period_days: trialDays,
    } : undefined,
    
    discounts: couponId ? [{ coupon: couponId }] : undefined,
    allow_promotion_codes: allowPromotionCodes,
    
    // Customization
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
    
    // Tax collection (if enabled)
    automatic_tax: { enabled: true },
    
    // Custom metadata
    metadata: {
      companyId,
      planId: priceId,
    },
  });

  return session;
}
```

### Adding Free Trials

```typescript
// Offer 14-day trial
const session = await createCheckoutSession({
  companyId,
  priceId: 'price_pro_monthly',
  successUrl: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${baseUrl}/pricing`,
  trialDays: 14, // 14-day free trial
});
```

### Coupon Codes

Create coupons in Stripe and apply them:

```typescript
// Auto-apply coupon for first-time customers
const session = await createCheckoutSession({
  companyId,
  priceId: 'price_pro_monthly',
  successUrl,
  cancelUrl,
  couponId: 'LAUNCH50', // 50% off first month
  allowPromotionCodes: true, // User can also enter codes
});
```

---

## Metered Billing

### Setting Up Usage-Based Pricing

Perfect for API calls, storage, or compute usage.

#### Step 1: Create Metered Price in Stripe

1. Create a product in Stripe Dashboard
2. Set pricing model to **"Usage is metered"**
3. Choose:
   - **Graduated**: Different rates for different tiers
   - **Volume**: Same rate for all usage
   - **Package**: Charge per package of units

```
Example: API Calls
- First 1,000 calls: $0.01 each
- Next 9,000 calls: $0.008 each
- Over 10,000 calls: $0.005 each
```

#### Step 2: Record Usage

```typescript
// src/features/billing/services/usage-tracking.ts
export async function recordUsage({
  companyId,
  metric,
  quantity,
  timestamp = new Date(),
}: {
  companyId: string;
  metric: string;
  quantity: number;
  timestamp?: Date;
}) {
  // Save to database for tracking
  await db.usageRecord.create({
    data: {
      companyId,
      metric,
      quantity,
      timestamp,
    },
  });

  // Get subscription
  const subscription = await db.subscription.findUnique({
    where: { companyId },
  });

  if (!subscription) return;

  // Report to Stripe
  await stripe.subscriptionItems.createUsageRecord(
    subscription.stripeSubscriptionId,
    {
      quantity,
      timestamp: Math.floor(timestamp.getTime() / 1000),
      action: 'increment',
    }
  );
}
```

#### Step 3: Track Usage in Your App

```typescript
// Track API calls
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    const { companyId } = context;
    
    // Your API logic
    const result = await processApiCall(req);
    
    // Record usage
    await recordUsage({
      companyId,
      metric: 'api_calls',
      quantity: 1,
    });
    
    return NextResponse.json({ result });
  },
  [PERMISSIONS.API_KEY_CREATE]
);
```

#### Step 4: Show Usage to Customers

```typescript
// src/components/usage-dashboard.tsx
export function UsageDashboard({ companyId }: { companyId: string }) {
  const [usage, setUsage] = useState({
    apiCalls: 0,
    storage: 0,
  });

  useEffect(() => {
    fetchUsage();
  }, [companyId]);

  const fetchUsage = async () => {
    const response = await fetch('/api/billing/usage');
    const data = await response.json();
    setUsage(data.usage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>API Calls</span>
              <span>{usage.apiCalls.toLocaleString()} / 10,000</span>
            </div>
            <Progress value={(usage.apiCalls / 10000) * 100} />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span>Storage</span>
              <span>{usage.storage} GB / 100 GB</span>
            </div>
            <Progress value={(usage.storage / 100) * 100} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Customer Portal

### Customizing Portal Settings

Configure what customers can do in the portal:

```typescript
// src/features/billing/services/stripe-service.ts
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    
    // Configure features
    flow_data: {
      type: 'subscription_update',
      subscription_update: {
        subscription: subscriptionId,
      },
    },
  });

  return session;
}
```

### Portal Configuration (Stripe Dashboard)

1. Go to **Settings** → **Billing** → **Customer Portal**
2. Configure:
   - ✅ **Update subscription** - Let customers upgrade/downgrade
   - ✅ **Cancel subscription** - Allow self-service cancellation
   - ✅ **Update payment method** - Change credit card
   - ✅ **View invoice history** - Download past invoices
   - ❌ **Update billing address** - Disable if you collect this elsewhere

### Custom Portal Link

```typescript
// src/components/billing-button.tsx
export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    
    const response = await fetch('/api/billing/portal', {
      method: 'POST',
    });
    
    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Manage Billing'}
    </Button>
  );
}
```

---

## Webhook Handling

### Understanding Webhook Events

SaaStastic handles these critical events:

| Event | What It Means | Action Taken |
|-------|---------------|--------------|
| `checkout.session.completed` | Customer completed checkout | Create/update subscription |
| `customer.subscription.updated` | Subscription changed | Update subscription status |
| `customer.subscription.deleted` | Subscription cancelled | Mark subscription as cancelled |
| `invoice.paid` | Payment successful | Record payment |
| `invoice.payment_failed` | Payment failed | Send notification |

### Adding Custom Webhook Handlers

```typescript
// src/features/billing/services/webhook-handlers.ts
export async function handleCustomEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.trial_will_end':
      await handleTrialEnding(event);
      break;
    
    case 'invoice.upcoming':
      await handleUpcomingInvoice(event);
      break;
    
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event);
      break;
  }
}

async function handleTrialEnding(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  // Get company
  const dbSubscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    include: { company: true },
  });

  if (!dbSubscription) return;

  // Send notification
  await sendEmail({
    to: dbSubscription.company.ownerEmail,
    subject: 'Your trial ends in 3 days',
    template: 'trial-ending',
    data: {
      companyName: dbSubscription.company.name,
      trialEndDate: subscription.trial_end,
    },
  });
  
  // Log activity
  await logActivity({
    action: 'billing:trial:ending',
    companyId: dbSubscription.companyId,
    metadata: { trialEndDate: subscription.trial_end },
  });
}
```

### Testing Webhooks Locally

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

---

## Invoice Customization

### Adding Logo and Branding

1. Go to Stripe Dashboard → **Settings** → **Branding**
2. Upload logo and set colors
3. Invoices will automatically include your branding

### Custom Invoice Metadata

```typescript
// Add metadata to invoices
await stripe.invoices.create({
  customer: customerId,
  metadata: {
    companyId: company.id,
    companyName: company.name,
    department: 'Engineering',
    costCenter: 'CC-1234',
  },
});
```

### Accessing Invoices

```typescript
// src/app/api/billing/invoices/route.ts
export const GET = withPermissions(
  async (req: NextRequest, context) => {
    const { companyId } = context;

    const invoices = await db.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 12, // Last 12 months
    });

    return NextResponse.json({ invoices });
  },
  [PERMISSIONS.BILLING_INVOICES]
);
```

### Invoice List Component

```typescript
// src/components/invoice-list.tsx
export function InvoiceList() {
  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => fetch('/api/billing/invoices').then(r => r.json()),
  });

  return (
    <div className="space-y-2">
      {invoices?.invoices.map((invoice: Invoice) => (
        <div key={invoice.id} className="flex justify-between items-center p-4 border rounded">
          <div>
            <p className="font-medium">{invoice.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div className="text-right">
            <p className="font-medium">
              ${(invoice.amountPaid / 100).toFixed(2)}
            </p>
            <Badge variant={invoice.status === 'PAID' ? 'default' : 'destructive'}>
              {invoice.status}
            </Badge>
          </div>
          
          {invoice.invoicePdf && (
            <Button size="sm" variant="outline" asChild>
              <a href={invoice.invoicePdf} target="_blank">Download</a>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Testing

### Test Mode vs Live Mode

Always test in **Test Mode** first:

```typescript
// Use test keys in .env.local
STRIPE_SECRET_KEY="sk_test_..." // Test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

// Use live keys in production only
// STRIPE_SECRET_KEY="sk_live_..."
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### Test Card Numbers

```typescript
// Successful payment
4242 4242 4242 4242

// Payment requires authentication
4000 0025 0000 3155

// Payment fails
4000 0000 0000 9995

// Insufficient funds
4000 0000 0000 9995
```

### Testing Subscription Lifecycle

```bash
# 1. Create subscription
stripe trigger checkout.session.completed

# 2. Update subscription
stripe trigger customer.subscription.updated

# 3. Invoice paid
stripe trigger invoice.paid

# 4. Payment failed
stripe trigger invoice.payment_failed

# 5. Subscription cancelled
stripe trigger customer.subscription.deleted
```

---

## Real-World Examples

### Example 1: Seat-Based Pricing

Charge per team member:

```typescript
// When adding team member
export async function addTeamMember(companyId: string, userId: string) {
  // Add member to database
  await db.userCompany.create({
    data: { userId, companyId, role: 'MEMBER' },
  });

  // Update Stripe subscription quantity
  const subscription = await db.subscription.findUnique({
    where: { companyId },
  });

  if (subscription) {
    const memberCount = await db.userCompany.count({
      where: { companyId },
    });

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{
        id: subscription.stripeItemId,
        quantity: memberCount, // Charge for actual members
      }],
      proration_behavior: 'always_invoice', // Prorate immediately
    });
  }
}
```

### Example 2: Feature Flags Based on Plan

```typescript
// Check if feature is available
export function useFeatureAccess(feature: string) {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => fetch('/api/billing/subscription').then(r => r.json()),
  });

  const plan = SUBSCRIPTION_PLANS.find(
    p => p.stripePriceId === subscription?.stripePriceId
  );

  const hasFeature = plan?.features.includes(feature);

  return { hasFeature, plan };
}

// Usage
function AdvancedAnalytics() {
  const { hasFeature } = useFeatureAccess('Advanced analytics');

  if (!hasFeature) {
    return <UpgradePrompt feature="Advanced analytics" />;
  }

  return <AnalyticsDashboard />;
}
```

### Example 3: Grace Period for Failed Payments

```typescript
// Handle failed payment with grace period
async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  
  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
    include: { company: true },
  });

  if (!subscription) return;

  // Set grace period (7 days)
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'PAST_DUE',
      gracePeriodEnd,
    },
  });

  // Send notification
  await sendEmail({
    to: subscription.company.ownerEmail,
    subject: 'Payment failed - Update your payment method',
    template: 'payment-failed',
    data: {
      gracePeriodEnd,
      updateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    },
  });
}
```

---

## Next Steps

- **[RBAC Usage Guide](./RBAC_USAGE.md)** - Control billing access
- **[Team Management](./EXTENDING_TEAM_MANAGEMENT.md)** - Manage users per plan
- **[Stripe Documentation](https://stripe.com/docs)** - Official Stripe docs

---

**Need Help?** 
- 📖 [Billing Architecture](../core/architecture/billing-spec.md)
- 💬 [GitHub Discussions](https://github.com/your-org/saastastic/discussions)
- 📧 [Email Support](mailto:support@saastastic.com)

---

*Last updated: October 8, 2025*
