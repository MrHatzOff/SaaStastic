# User Tasks & Setup Guide

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. Install Missing Dependencies
Run this command in your terminal:
```bash
npm install @radix-ui/react-progress
```

### 2. Environment Variables Setup

#### Step 1: Database Configuration
Since Prisma requires a `.env` file, you need to maintain both files:

1. Keep your `.env.local` file with all your environment variables
2. Create a `.env` file with just the database URLs for Prisma:

**.env file content:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/saastastic"
DIRECT_URL="postgresql://user:password@localhost:5432/saastastic"
```

3. Make sure `.env` is in your `.gitignore` file (add this line if missing):
```
.env
```

### 3. Stripe Account Setup

#### Step 1: Create Stripe Account
1. Go to https://stripe.com and sign up for an account
2. Navigate to the Dashboard

#### Step 2: Create Products in Stripe Dashboard
You need to create exactly 3 products with these names:

1. **Starter Plan**
   - Go to Products → Add Product
   - Name: "Starter"
   - Description: "Perfect for small teams"
   - Add pricing: $29/month (recurring)
   - Copy the Price ID (starts with `price_`)

2. **Professional Plan**
   - Add Product → Name: "Professional"
   - Description: "For growing businesses"
   - Add pricing: $99/month (recurring)
   - Copy the Price ID

3. **Enterprise Plan**
   - Add Product → Name: "Enterprise"
   - Description: "For large organizations"
   - Add pricing: $299/month (recurring)
   - Copy the Price ID

#### Step 3: Get Your API Keys
1. In Stripe Dashboard, go to Developers → API Keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

#### Step 4: Set Up Webhook
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - For local testing: Use ngrok or similar: `https://xxxxx.ngrok.io/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.*` (all subscription events)
   - `invoice.*` (all invoice events)
   - `payment_method.*` (all payment method events)
5. Copy the **Webhook signing secret** (starts with `whsec_`)

### 4. Update Your .env.local File

Add these Stripe variables to your `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY_HERE"

# Stripe Product IDs (from your Dashboard)
STRIPE_PRODUCT_STARTER="prod_XXXXXXXXXXXXX"
STRIPE_PRODUCT_PRO="prod_XXXXXXXXXXXXX"
STRIPE_PRODUCT_ENTERPRISE="prod_XXXXXXXXXXXXX"

# Stripe Price IDs (from your Dashboard)
STRIPE_PRICE_STARTER_MONTHLY="price_XXXXXXXXXXXXX"
STRIPE_PRICE_PRO_MONTHLY="price_XXXXXXXXXXXXX"
STRIPE_PRICE_ENTERPRISE_MONTHLY="price_XXXXXXXXXXXXX"
```

### 5. Other Required Services (Can be done later)

These services are referenced in the code but can be set up later:

#### Upstash Redis (for rate limiting)
- Sign up at https://upstash.com
- Create a Redis database
- Get REST URL and token

#### Sentry (for error tracking)
- Sign up at https://sentry.io
- Create a project
- Get DSN

#### Resend (for emails)
- Sign up at https://resend.com
- Get API key
- Verify your domain

## 📋 Task Checklist

- [x] Run `npm install @radix-ui/react-progress`
- [x] Create `.env` file with database URLs
- [x ] Add `.env` to `.gitignore`
- [ ] Create Stripe account
- [ ] Create 3 products in Stripe (Starter, Professional, Enterprise)
- [ ] Copy all Price IDs
- [ ] Get Stripe API keys
- [ ] Set up Stripe webhook endpoint
- [ ] Update `.env.local` with all Stripe variables
- [ ] (Optional) Set up Upstash Redis
- [ ] (Optional) Set up Sentry
- [ ] (Optional) Set up Resend

## ❓ Questions That Need Your Input

### 1. Domain Name
What domain will you use for production? This affects:
- Stripe webhook URL
- Email configuration
- CORS settings

### 2. Company Branding
What should we call the product? Currently using "SaaStastic" - should this change?

### 3. Email Sender
What email address should system emails come from? (e.g., noreply@yourdomain.com)

### 4. Support Email
What email should users contact for support? (e.g., support@yourdomain.com)

## 🔧 Troubleshooting

### If TypeScript errors persist after fixes:
1. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. Clear Next.js cache: `rm -rf .next`
3. Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

### If Prisma migration fails:
1. Make sure PostgreSQL is running
2. Check database connection string in `.env`
3. Try resetting: `npx prisma migrate reset --force`

### If Stripe webhooks don't work locally:
1. Use ngrok: `npx ngrok http 3000`
2. Update webhook URL in Stripe Dashboard with ngrok URL
3. Make sure to update the webhook secret in `.env.local`

## 📊 Current Progress Status

### Completed ✅
- Database schema with billing models
- Stripe integration services
- Webhook handlers
- Billing UI components
- User invitation system
- Role-based permissions

### In Progress 🔄
- Fixing TypeScript errors
- Installing missing UI components
- Building team management UI

### Upcoming 📅
- Admin portal
- Email service integration
- Monitoring setup
- Security enhancements
