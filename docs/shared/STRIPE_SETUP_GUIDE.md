# 🚀 Quick Stripe Setup Guide

## Step 1: Get Your Stripe API Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Sign in to your Stripe account
3. Copy your **Secret key** (starts with `sk_test_` for test mode)

## Step 2: Set Your API Key

### Option A: Add to .env.local (Recommended)
1. Open your `.env.local` file
2. Add this line:
```bash
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

### Option B: Set Environment Variable
**Windows (PowerShell):**
```powershell
$env:STRIPE_SECRET_KEY="sk_test_your_actual_key_here"
```

**Windows (CMD):**
```cmd
set STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

## Step 3: Run the Setup Script

```bash
node scripts/setup-stripe-products.js
```

## What This Script Does

✅ Creates 3 products in your Stripe account:
- Starter ($29/month)
- Professional ($99/month) 
- Enterprise ($299/month)

✅ Creates both monthly and yearly prices for each

✅ Generates a `stripe-env-vars.txt` file with all the environment variables you need

## Step 4: Copy Environment Variables

After the script runs successfully:

1. Open the generated `stripe-env-vars.txt` file
2. Copy all the variables
3. Add them to your `.env.local` file

## Troubleshooting

### "Authentication required" error
- Double-check your API key starts with `sk_test_` or `sk_live_`
- Make sure there are no extra spaces or quotes
- Verify you're using the Secret key, not the Publishable key

### "Cannot find module" error
- Make sure you're running from the project root directory
- Run `npm install` to ensure all dependencies are installed

### Script runs but no products created
- Check your Stripe Dashboard at [Products page](https://dashboard.stripe.com/products)
- Make sure you're looking in the right mode (Test vs Live)

## Alternative: Manual Setup

If the script doesn't work, you can create products manually:

1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Click "Add Product"
3. Create these products:

**Starter:**
- Name: "Starter"
- Price: $29.00 monthly recurring
- Copy the Price ID → `STRIPE_PRICE_STARTER_MONTHLY`

**Professional:**
- Name: "Professional"  
- Price: $99.00 monthly recurring
- Copy the Price ID → `STRIPE_PRICE_PRO_MONTHLY`

**Enterprise:**
- Name: "Enterprise"
- Price: $299.00 monthly recurring  
- Copy the Price ID → `STRIPE_PRICE_ENTERPRISE_MONTHLY`

Then add these to your `.env.local`:
```bash
STRIPE_PRICE_STARTER_MONTHLY=price_1234567890
STRIPE_PRICE_PRO_MONTHLY=price_0987654321
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1122334455
```

## Next Steps

After setup is complete:
1. ✅ Products created in Stripe
2. ✅ Environment variables added to `.env.local`
3. ✅ Restart your development server: `npm run dev`
4. ✅ Test the billing flow in your app

## Need Help?

- Check the [Stripe Dashboard](https://dashboard.stripe.com) to verify products were created
- Look at the `stripe-env-vars.txt` file for the exact variables to copy
- Make sure your `.env.local` file has all the required Stripe variables
