# Test Setup Guide

**Last Updated**: October 14, 2025  
**Time Required**: 15-20 minutes

This guide walks you through setting up your testing environment so you can run the **87 automated tests** (60 unit + 27 E2E) that come with SaaStastic.

---

## 📋 Prerequisites

Before setting up tests, you need:
- ✅ Development environment running (`npm run dev`)
- ✅ PostgreSQL database running
- ✅ Clerk account (free tier works)
- ✅ Stripe account in test mode (free)

---

## 🚀 Quick Setup (TL;DR)

```bash
# 1. Copy environment template
cp .env.test.example .env.test

# 2. Edit .env.test with your test credentials (see detailed steps below)

# 3. Create test database
createdb saastastic_test

# 4. Run migrations on test database
DATABASE_URL="postgresql://user:password@localhost:5432/saastastic_test" npx prisma migrate deploy

# 5. Run the setup script
npm run test:setup

# 6. Run tests!
npm run test          # Unit tests
npm run test:e2e      # E2E tests
```

---

## 📝 Detailed Setup Steps

### Step 1: Create Test Environment File

Copy the example file:
```bash
cp .env.test.example .env.test
```

Now edit `.env.test` with your test credentials (see steps below).

---

### Step 2: Set Up Test Database

**Create a separate test database**:
```bash
createdb saastastic_test
```

**Run migrations**:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/saastastic_test" npx prisma migrate deploy
```

**Why a separate database?**  
Tests create, modify, and delete data. You don't want test data mixed with your development data!

---

### Step 3: Set Up Clerk Test User

#### 3a. Create a Clerk Test Instance

1. Go to https://dashboard.clerk.com/
2. Create a **new application** for testing (or use your existing dev instance)
3. Navigate to **API Keys** and copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)

Add these to your `.env.test` file.

#### 3b. Create a Test User

Option A: **Use Clerk Dashboard (Recommended)**
1. Go to **Users** in your Clerk dashboard
2. Click **Create User**
3. Fill in:
   - Email: `test@example.com` (or any email you want)
   - Password: `TestPassword123!` (or any secure password)
4. Click **Create**

Option B: **Use Sign-Up Flow**
1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000/sign-up
3. Create an account with email/password
4. Complete the onboarding flow

**Add credentials to `.env.test`**:
```bash
CLERK_TEST_USER_EMAIL="test@example.com"
CLERK_TEST_USER_PASSWORD="TestPassword123!"
```

---

### Step 4: Set Up Stripe Test Keys

#### 4a. Get Stripe Test API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test Mode** (toggle in top-right)
3. Copy:
   - `Publishable key` (starts with `pk_test_`)
   - `Secret key` (starts with `sk_test_`)

Add these to your `.env.test` file:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

#### 4b. Create Test Products

Run the Stripe product setup script:
```bash
node scripts/setup-stripe-products.mjs
```

This creates three test products:
- **Starter** ($29/month)
- **Professional** ($99/month)
- **Enterprise** ($299/month)

The script will output the price IDs. Copy them to your `.env.test` file:
```bash
STRIPE_STARTER_PRICE_ID="price_test_..."
STRIPE_PROFESSIONAL_PRICE_ID="price_test_..."
STRIPE_ENTERPRISE_PRICE_ID="price_test_..."
```

#### 4c. Set Up Webhook Secret (Optional for E2E)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `http://localhost:3000/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

Add to `.env.test`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_test_..."
```

---

### Step 5: Verify Configuration

Your `.env.test` should now look like:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/saastastic_test"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_TEST_USER_EMAIL="test@example.com"
CLERK_TEST_USER_PASSWORD="TestPassword123!"

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

STRIPE_STARTER_PRICE_ID="price_test_..."
STRIPE_PROFESSIONAL_PRICE_ID="price_test_..."
STRIPE_ENTERPRISE_PRICE_ID="price_test_..."

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="test"
```

---

## 📂 Test File Structure

After setup, your test environment will include:

```
├── .env.test                          # Your test credentials (NOT in Git)
├── playwright/
│   └── .clerk/
│       └── user.json                  # Auto-generated auth state (NOT in Git)
├── tests/
│   ├── e2e/                          # End-to-end tests
│   │   ├── auth-setup.ts             # Creates user.json automatically
│   │   ├── auth.spec.ts
│   │   ├── billing.spec.ts
│   │   ├── companies.spec.ts
│   │   └── customers.spec.ts
│   └── unit/                         # Unit tests
│       ├── rbac-permissions.test.ts
│       ├── stripe-webhooks.test.ts
│       ├── tenant-isolation.test.ts
│       └── user-invitations.test.ts
```

**Note**: The `playwright/.clerk/user.json` file is **automatically created** when you run E2E tests for the first time. It stores the authenticated session state so you don't have to log in for every test. If tests start failing, delete this file and it will be regenerated.

---

## ✅ Run Tests

### Unit Tests (60 tests)

```bash
npm run test
```

These tests run **instantly** (no browser, no network calls):
- RBAC permissions (18 tests)
- Tenant isolation (12 tests)
- Stripe webhooks (15 tests)
- User invitations (15 tests)

### E2E Tests (27 tests)

**Start dev server first**:
```bash
npm run dev
```

**In another terminal, run E2E tests**:
```bash
npm run test:e2e
```

These tests open a real browser and test:
- Authentication flows
- Billing checkout
- Company management
- Customer management

**Visual mode (watch tests run)**:
```bash
npm run test:e2e:ui
```

---

## 🐛 Troubleshooting

### "CLERK_TEST_USER_EMAIL must be set"

**Problem**: `.env.test` file not found or incomplete.

**Fix**:
1. Make sure `.env.test` exists in root directory
2. Check that all required variables are set
3. Restart your terminal/IDE to reload environment

---

### "Authentication failed - unexpected final URL"

**Problem**: Test user doesn't exist in Clerk or credentials are wrong.

**Fix**:
1. Log into Clerk dashboard
2. Go to **Users** → find your test user
3. Verify email matches `.env.test`
4. Reset password if needed
5. Try running tests again

---

### "Stripe API error: Invalid API Key"

**Problem**: Stripe test keys are missing or incorrect.

**Fix**:
1. Go to https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test Mode** (not Live Mode!)
3. Copy the correct keys to `.env.test`
4. Restart dev server

---

### "Database connection error"

**Problem**: Test database doesn't exist or wrong credentials.

**Fix**:
```bash
# Create database
createdb saastastic_test

# Run migrations
DATABASE_URL="postgresql://user:password@localhost:5432/saastastic_test" npx prisma migrate deploy

# Try tests again
npm run test
```

---

### "Port 3000 is already in use"

**Problem**: Dev server is already running or another app is using port 3000.

**Fix**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

Then update `.env.test`:
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

---

## 🔒 Security Best Practices

### ⚠️ NEVER use production credentials for testing!

**Do**:
- ✅ Use Clerk's **Development** instance
- ✅ Use Stripe's **Test Mode** keys
- ✅ Use a separate **test database**
- ✅ Use fake/test email addresses
- ✅ Keep `.env.test` in `.gitignore`

**Don't**:
- ❌ Use production Clerk instance
- ❌ Use Stripe Live Mode keys
- ❌ Use production database
- ❌ Use real customer emails
- ❌ Commit `.env.test` to Git

---

## 📊 What Gets Tested

### Unit Tests (60)
- **RBAC Permissions** - All 29 permissions validated
- **Tenant Isolation** - Multi-tenant security
- **Stripe Webhooks** - Payment processing
- **User Invitations** - Team collaboration

### E2E Tests (27)
- **Authentication** - Sign up, sign in, company creation
- **Billing** - Checkout, payment methods, invoices
- **Company Management** - CRUD operations
- **Customer Management** - CRUD operations

### Skipped Tests (3)
These require manual testing:
- Plan upgrades (async Stripe webhooks)
- Plan downgrades (async Stripe webhooks)
- Subscription cancellation (complex webhook flow)

See `docs/guides/MANUAL_TESTING_GUIDE.md` for manual test procedures.

---

## 🎯 Next Steps

Once tests are set up and passing:

1. **Run tests before commits**:
   ```bash
   npm run test && npm run test:e2e
   ```

2. **Set up CI/CD**: Add tests to your GitHub Actions workflow

3. **Write new tests**: As you add features, add tests!

4. **Monitor coverage**: Run `npm run test:coverage`

---

## 📚 Additional Resources

- **Test Suite Documentation**: `docs/guides/TEST_SUITE_DOCUMENTATION.md`
- **Manual Testing Guide**: `docs/guides/MANUAL_TESTING_GUIDE.md`
- **Playwright Docs**: https://playwright.dev/
- **Vitest Docs**: https://vitest.dev/

---

**Questions?** Check the FAQ or open an issue on GitHub.

**Tests passing?** 🎉 You're ready to develop with confidence!
