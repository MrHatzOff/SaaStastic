# 🎯 Complete Stripe Setup & Testing Guide

This guide will walk you through setting up Stripe from scratch and testing the complete customer payment flow.

## 📍 Part 1: Verify Your Stripe Products Were Created

### Step 1: Check Stripe Dashboard (On the Web)
1. **Open your web browser**
2. **Go to:** https://dashboard.stripe.com
3. **Sign in** to your Stripe account
4. **Click on "Products"** in the left sidebar
5. **You should see 3 products:**
   - ✅ Starter ($29.00/month)
   - ✅ Professional ($99.00/month) 
   - ✅ Enterprise ($299.00/month)

**If you DON'T see these products:**
- The script may have failed
- You might be in Live mode instead of Test mode
- Check the toggle in the top-left corner - it should say "Test mode"

### Step 2: Get Your Price IDs (On the Web)
1. **In Stripe Dashboard**, click on each product
2. **Copy the Price ID** for each (starts with `price_`)
3. **Write them down** - you'll need these

## 📍 Part 2: Configure Your Local App

### Step 3: Update Environment Variables (In Windsurf)
1. **In Windsurf**, open your `.env.local` file
2. **Add these variables** (replace with your actual values):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs (from Step 2)
STRIPE_PRICE_STARTER_MONTHLY=price_YOUR_STARTER_PRICE_ID
STRIPE_PRICE_PRO_MONTHLY=price_YOUR_PRO_PRICE_ID  
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_YOUR_ENTERPRISE_PRICE_ID

# App URL for local testing
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Get Your Publishable Key (On the Web)
1. **In Stripe Dashboard**, go to **Developers → API Keys**
2. **Copy your Publishable key** (starts with `pk_test_`)
3. **Add it to `.env.local`** as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Step 5: Set Up Webhook for Local Testing (On the Web)
1. **In Stripe Dashboard**, go to **Developers → Webhooks**
2. **Click "Add endpoint"**
3. **Endpoint URL:** `http://localhost:3000/api/webhooks/stripe`
4. **Select these events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Click "Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_`)
7. **Add it to `.env.local`** as `STRIPE_WEBHOOK_SECRET`

## 📍 Part 3: Create Missing Components

The pricing page needs a checkout component. Let me create it:

### Step 6: Create Checkout Component (In Windsurf)
**Create file:** `src/components/billing/checkout-button.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  priceId: string;
  planName: string;
  className?: string;
}

export function CheckoutButton({ priceId, planName, className }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        `Get Started with ${planName}`
      )}
    </Button>
  );
}
```

### Step 7: Update Pricing Page (In Windsurf)
**Edit file:** `src/app/pricing/page.tsx`

Add the checkout button to each pricing plan:

```typescript
import { CheckoutButton } from '@/components/billing/checkout-button';

// In your pricing cards, replace the existing button with:
<CheckoutButton 
  priceId={process.env.STRIPE_PRICE_STARTER_MONTHLY!}
  planName="Starter"
/>

<CheckoutButton 
  priceId={process.env.STRIPE_PRICE_PRO_MONTHLY!}
  planName="Professional"
/>

<CheckoutButton 
  priceId={process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!}
  planName="Enterprise"
/>
```

## 📍 Part 4: Test the Complete Customer Flow

### Step 8: Start Your Development Server (In Windsurf Terminal)
```bash
npm run dev
```

### Step 9: Test the Customer Journey

#### 🌐 **Customer Perspective - Complete Flow:**

**1. Browse the Website**
- **Open browser:** http://localhost:3000
- **Click:** "Pricing" in the navigation
- **See:** Three pricing plans displayed

**2. Select a Plan**
- **Click:** "Get Started with Professional" button
- **What happens:** Button shows "Loading..." then redirects to Stripe

**3. Stripe Checkout Page**
- **You'll see:** Stripe's secure checkout page
- **It shows:** Professional plan for $99/month
- **Enter test card:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **Email:** Your email address

**4. Complete Purchase**
- **Click:** "Subscribe" 
- **What happens:** Payment processes, redirects back to your app
- **You land on:** Dashboard with success message

**5. Account Created**
- **You now have:** A user account with Professional subscription
- **You can:** Access all Professional features

### Step 10: Verify Everything Worked (Multiple Places)

#### ✅ **Check in Stripe Dashboard (On the Web):**
1. **Go to:** https://dashboard.stripe.com/customers
2. **You should see:** New customer with your email
3. **Go to:** https://dashboard.stripe.com/subscriptions  
4. **You should see:** Active subscription for Professional plan

#### ✅ **Check in Your App (In Browser):**
1. **Go to:** http://localhost:3000/dashboard
2. **You should see:** Dashboard showing your subscription
3. **Go to:** http://localhost:3000/billing (if you have this page)
4. **You should see:** Current plan and billing info

#### ✅ **Check Database (In Windsurf):**
**Run in terminal:**
```bash
npx prisma studio
```
- **Check:** User table has your user
- **Check:** Subscription table has your subscription
- **Check:** Company table has your company

## 📍 Part 5: Test Different Scenarios

### Scenario 1: Successful Payment
- **Use card:** `4242 4242 4242 4242` (Always succeeds)
- **Expected:** User gets access, subscription created

### Scenario 2: Failed Payment  
- **Use card:** `4000 0000 0000 0002` (Always fails)
- **Expected:** User stays on checkout, sees error message

### Scenario 3: Cancel Checkout
- **Click:** Browser back button during checkout
- **Expected:** Returns to pricing page with "canceled=true" parameter

## 📍 Part 6: Troubleshooting Common Issues

### ❌ "Get Started" Button Does Nothing
**Problem:** Missing environment variables
**Solution:** 
1. Check `.env.local` has all Stripe variables
2. Restart development server: `npm run dev`

### ❌ Checkout Page Shows Error
**Problem:** Invalid price ID or API key
**Solution:**
1. Verify price IDs in Stripe Dashboard match `.env.local`
2. Check API key is correct and starts with `sk_test_`

### ❌ Webhook Errors in Console
**Problem:** Webhook endpoint not reachable
**Solution:**
1. For local testing, webhooks to localhost won't work from Stripe
2. Use ngrok or test without webhooks initially
3. Webhooks are mainly for production

### ❌ User Not Redirected After Payment
**Problem:** Success URL not configured
**Solution:** Check the `successUrl` in checkout-button.tsx

## 📍 Part 7: Production Setup (When Ready)

### For Production Deployment:
1. **Switch to Live Mode** in Stripe Dashboard
2. **Get Live API keys** (start with `sk_live_` and `pk_live_`)
3. **Update webhook URL** to your production domain
4. **Test with real card** (small amount)
5. **Set up proper error monitoring**

## 🎯 Quick Test Checklist

- [ ] Products visible in Stripe Dashboard
- [ ] Environment variables in `.env.local`
- [ ] Development server running (`npm run dev`)
- [ ] Pricing page loads at http://localhost:3000/pricing
- [ ] "Get Started" button redirects to Stripe
- [ ] Test card payment completes successfully
- [ ] User redirected back to dashboard
- [ ] Subscription visible in Stripe Dashboard
- [ ] User can access dashboard features

## 🆘 Need Help?

**If something doesn't work:**
1. **Check browser console** for JavaScript errors
2. **Check terminal** for server errors  
3. **Check Stripe Dashboard logs** for API errors
4. **Verify all environment variables** are set correctly
5. **Make sure you're in Test mode** in Stripe

**Common beginner mistakes:**
- Forgetting to restart server after changing `.env.local`
- Using Live mode keys instead of Test mode
- Missing environment variables
- Wrong price IDs copied from Stripe

This should get you a fully working payment flow! 🚀
