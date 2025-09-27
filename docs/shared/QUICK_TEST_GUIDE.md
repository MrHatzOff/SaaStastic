# 🚀 Quick Test Guide - Complete Customer Flow
## run postgres locally to create a db dump

```bash
pg_dump -U postgres -d saas_dev > saastastic.sql
```

## ✅ Prerequisites Checklist

Before testing, make sure you have:
- [ ] Stripe account created
- [ ] Products created in Stripe (run `node scripts/setup-stripe-products.js`)
- [ ] Environment variables in `.env.local`
- [ ] Development server running (`npm run dev`)

## 🎯 Step-by-Step Customer Flow Test

### Step 1: Check Your Setup
1. **Open browser:** http://localhost:3000
2. **You should see:** Homepage with navigation
3. **Click:** "Pricing" in the navigation

### Step 2: View Pricing Plans
1. **You should see:** 3 pricing plans (Starter, Professional, Enterprise)
2. **Each plan shows:** Price, features, and "Get Started" button
3. **Professional plan:** Should have "Most Popular" badge

### Step 3: Start Checkout Process
1. **Click:** "Get Started with Professional" button
2. **Button should:** Show "Loading..." then redirect
3. **You should land on:** Stripe checkout page
4. **Page should show:** Professional plan for $99/month

### Step 4: Complete Test Payment
**Use these test card details:**
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **Email:** Your email address
- **Name:** Your name

1. **Fill in the form** with test card details
2. **Click:** "Subscribe" button
3. **Payment should:** Process successfully
4. **You should be:** Redirected back to your app

### Step 5: Verify Success
1. **You should land on:** http://localhost:3000/dashboard?success=true
2. **You should see:** Green success banner saying "🎉 Subscription Activated!"
3. **You should see:** Toast notification "🎉 Welcome! Your subscription is now active."
4. **Dashboard should:** Load normally with your company info

## 🔍 Verification Steps

### Check Stripe Dashboard (Web)
1. **Go to:** https://dashboard.stripe.com/customers
2. **You should see:** New customer with your email
3. **Go to:** https://dashboard.stripe.com/subscriptions
4. **You should see:** Active subscription for Professional plan

### Check Your App
1. **Dashboard loads:** Without errors
2. **Company info:** Shows correctly
3. **Navigation works:** All links functional

## 🚨 Troubleshooting

### "Get Started" Button Does Nothing
**Problem:** Missing environment variables
**Fix:** 
1. Check `.env.local` has all Stripe variables
2. Restart server: `npm run dev`

### Redirects to Stripe but Shows Error
**Problem:** Invalid price ID
**Fix:**
1. Check Stripe Dashboard → Products
2. Copy correct Price IDs to `.env.local`
3. Restart server

### Payment Fails
**Problem:** Using wrong test card
**Fix:** Use `4242 4242 4242 4242` (always succeeds)

### Not Redirected After Payment
**Problem:** Wrong success URL
**Fix:** Check checkout-button.tsx has correct URLs

## 🎯 Expected Results

**✅ Successful Test Means:**
- Pricing page loads with 3 plans
- "Get Started" button redirects to Stripe
- Test payment completes successfully
- User redirected to dashboard with success message
- Subscription visible in Stripe Dashboard

**❌ If Any Step Fails:**
1. Check browser console for errors
2. Check terminal for server errors
3. Verify all environment variables
4. Make sure you're in Test mode in Stripe

## 🔄 Test Different Scenarios

### Test Failed Payment
- **Use card:** `4000 0000 0000 0002` (always fails)
- **Expected:** Error message, stays on checkout

### Test Canceled Checkout
- **Click:** Browser back button during checkout
- **Expected:** Returns to pricing page

### Test Different Plans
- **Try:** Starter plan checkout
- **Expected:** Shows $29/month in Stripe checkout

## 📞 Need Help?

If something doesn't work:
1. **Check the complete setup guide:** `docs/STRIPE_COMPLETE_SETUP.md`
2. **Verify environment variables** are correct
3. **Make sure Stripe is in Test mode**
4. **Check browser console** for JavaScript errors
5. **Check terminal** for server errors

## 🎉 Success!

If all steps work, you have a fully functional SaaS payment flow! 

**Next steps:**
- Customize the pricing plans
- Add more features to the dashboard
- Set up webhooks for production
- Deploy to production when ready
