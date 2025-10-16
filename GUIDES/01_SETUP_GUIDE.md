# 🚀 SaaStastic Setup Guide

**Goal**: Get you from zero to deployed in under 30 minutes.

This guide walks you through setting up SaaStastic locally and deploying to production. Follow each step carefully, and you'll have a running multi-tenant B2B SaaS application with authentication, billing, and RBAC.

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have the following installed and ready:

### Required Software
- [ ] **Node.js 18.17+** - [Download here](https://nodejs.org/)
  ```bash
  # Check your version
  node --version  # Should show v18.17 or higher
  ```

- [ ] **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
  ```bash
  # Check your version
  psql --version  # Should show 14.0 or higher
  ```

- [ ] **Git** - [Download here](https://git-scm.com/downloads)
  ```bash
  git --version
  ```

### Required Accounts (Free tiers available)
- [ ] **Clerk Account** - [Sign up here](https://clerk.com) - Authentication & user management
- [ ] **Stripe Account** - [Sign up here](https://stripe.com) - Payment processing
- [ ] **Database Provider** (for production) - Choose one:
  - [Vercel Postgres](https://vercel.com/storage/postgres) (recommended)
  - [Supabase](https://supabase.com) (good free tier)
  - [Neon](https://neon.tech) (serverless PostgreSQL)
  - [Railway](https://railway.app) (simple deployment)

### Optional Services
- [ ] **Vercel Account** - [Sign up here](https://vercel.com) - For easy deployment
- [ ] **Sentry Account** - [Sign up here](https://sentry.io) - Error tracking
- [ ] **Resend Account** - [Sign up here](https://resend.com) - Email service

---

## 🔧 Step 1: Project Setup

### 1.1 Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/saastastic.git
cd saastastic

# Install dependencies (this may take 2-3 minutes)
npm install

# Verify installation
npm run build  # Should complete without errors
```

**Troubleshooting**: If `npm install` fails, delete `node_modules` and `package-lock.json`, then try again.

---

## 🗄️ Step 2: Database Setup

### 2.1 Local Development Database

#### Option A: Using Local PostgreSQL

```bash
# Create a new database
createdb saastastic_dev

# Or using psql
psql -U postgres
CREATE DATABASE saastastic_dev;
\q
```

Your connection string will look like:
```
postgresql://postgres:your_password@localhost:5432/saastastic_dev
```

#### Option B: Using Docker

```bash
# Create a docker-compose.yml in your project root
docker-compose up -d
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: saastastic_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Connection string: `postgresql://postgres:postgres@localhost:5432/saastastic_dev`

### 2.2 Production Database Setup

Choose your preferred provider and create a database:

**Vercel Postgres** (Recommended):
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Create new project → Storage → Postgres
3. Copy the `DATABASE_URL` connection string

**Supabase**:
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string → Connection pooling
4. Copy the connection string and change `[YOUR-PASSWORD]` to your actual password

**Neon**:
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string from the dashboard

---

## 🔐 Step 3: Clerk Authentication Setup

Clerk provides authentication, user management, and company switching.

### 3.1 Create Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click **"+ Create Application"**
3. Name it (e.g., "SaaStastic Dev")
4. Select authentication methods:
   - ✅ Email (required)
   - ✅ Google (recommended)
   - ✅ GitHub (recommended)
   - Others optional
5. Click **"Create Application"**

### 3.2 Get API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy the following values:

```bash
# These are shown immediately after creating your app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

⚠️ **Important**: 
- `pk_test_*` keys are for development
- `pk_live_*` keys are for production
- Never commit secret keys to version control

### 3.3 Configure Clerk Settings

#### Set Application URLs
1. Go to **Paths** in Clerk dashboard
2. Configure these paths:
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up`
   - **After sign-in URL**: `/dashboard`
   - **After sign-up URL**: `/dashboard`

#### Enable Organization Mode (Multi-Tenancy)
1. Go to **Organizations** in sidebar
2. Toggle **"Enable Organizations"** ON
3. Set **"Organization Profile URL"**: `/dashboard/settings`

### 3.4 Optional: Clerk Webhooks

For syncing users to your database automatically:

1. Go to **Webhooks** in Clerk dashboard
2. Click **"+ Add Endpoint"**
3. Enter your endpoint URL: `https://your-domain.com/api/webhooks/clerk`
4. Select events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
   - ✅ organization.created
   - ✅ organizationMembership.created
5. Copy the **Signing Secret**:
   ```bash
   CLERK_WEBHOOK_SECRET="whsec_..."
   ```

---

## 💳 Step 4: Stripe Payment Setup

Stripe handles subscription billing and payment processing.

### 4.1 Get Stripe API Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click **"Developers"** → **"API Keys"**
3. Copy your test keys:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

⚠️ **Test vs Live Mode**:
- Start in **Test Mode** (toggle in top right of Stripe dashboard)
- Use test credit cards: `4242 4242 4242 4242`, any future date, any CVC
- Switch to **Live Mode** before accepting real payments

### 4.2 Create Products & Prices

#### Option A: Using Stripe Dashboard (Recommended for beginners)

1. Go to **Products** → **+ Add Product**
2. Create a product:
   ```
   Name: Starter Plan
   Description: Perfect for small teams
   ```
3. Add a price:
   ```
   Pricing Model: Recurring
   Price: $29.00
   Billing Period: Monthly
   ```
4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_...`)

Repeat for other tiers (e.g., Professional, Enterprise).

#### Option B: Using Stripe CLI

```bash
# Install Stripe CLI
stripe login

# Create product
stripe products create \
  --name="Starter Plan" \
  --description="Perfect for small teams"

# Create price (replace prod_xxx with your product ID)
stripe prices create \
  --product=prod_xxx \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month
```

### 4.3 Configure Stripe Webhooks

Webhooks are **CRITICAL** for subscription management.

#### For Local Development (Stripe CLI)

```bash
# Install Stripe CLI if not already installed
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook signing secret:
# whsec_...
# Add this to your .env.local
```

#### For Production

1. Go to **Developers** → **Webhooks** → **+ Add Endpoint**
2. Enter endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen to:
   ```
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.paid
   ✅ invoice.payment_failed
   ✅ invoice.payment_action_required
   ```
4. Click **"Add endpoint"**
5. Copy the **Signing Secret** (starts with `whsec_...`)

```bash
STRIPE_WEBHOOK_SECRET="whsec_..."
```

⚠️ **Without webhooks, subscription updates won't sync to your database!**

---

## ⚙️ Step 5: Environment Variables

### 5.1 Create Environment File

```bash
# Copy the example file
cp .env.example .env.local
```

### 5.2 Fill in Required Variables

Open `.env.local` and add your values:

```bash
# ============================================
# DATABASE (REQUIRED)
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/database"

# ============================================
# CLERK AUTHENTICATION (REQUIRED)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Optional: For webhook user syncing
# CLERK_WEBHOOK_SECRET="whsec_..."

# ============================================
# STRIPE PAYMENTS (REQUIRED)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# APPLICATION CONFIG
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ============================================
# OPTIONAL SERVICES
# ============================================

# Sentry Error Tracking (Optional)
# SENTRY_DSN="https://...@sentry.io/..."
# NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Resend Email Service (Optional)
# RESEND_API_KEY="re_..."

# Upstash Redis Rate Limiting (Optional)
# UPSTASH_REDIS_REST_URL="https://...upstash.io"
# UPSTASH_REDIS_REST_TOKEN="..."
```

### 5.3 Environment Variable Reference

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | Your database provider |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Clerk public key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | ✅ Yes | Clerk secret key | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | Stripe public key | Stripe Dashboard → API Keys |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe secret key | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | Stripe webhook signing secret | Stripe Dashboard → Webhooks |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your application URL | `http://localhost:3000` for dev |
| `NODE_ENV` | ✅ Yes | Environment mode | `development` or `production` |
| `CLERK_WEBHOOK_SECRET` | ⚠️ Recommended | Clerk webhook secret | Clerk Dashboard → Webhooks |
| `SENTRY_DSN` | 🔵 Optional | Sentry error tracking | Sentry Dashboard |
| `RESEND_API_KEY` | 🔵 Optional | Email service key | Resend Dashboard |
| `UPSTASH_REDIS_REST_URL` | 🔵 Optional | Redis rate limiting | Upstash Dashboard |

---

## 🗃️ Step 6: Database Migration

### 6.1 Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# You should see output like:
# ✔ Generated Prisma Client
# ✔ The migration has been created successfully
```

### 6.2 Seed RBAC System

Initialize the permission system:

```bash
# Seed permissions and default roles
npx tsx scripts/seed-rbac.ts

# Expected output:
# ✅ Created 29 permissions
# ✅ RBAC system seeded successfully
```

This creates the 29 system permissions used throughout the application.

### 6.3 Verify Database Setup

```bash
# Open Prisma Studio to view your database
npx prisma studio

# This opens http://localhost:5555
# You should see tables like:
# - User
# - Company
# - Permission (29 rows)
# - RoleModel
# - etc.
```

---

## 🚀 Step 7: Run Your Application

### 7.1 Start Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

You should see:
- ✅ Landing page loads
- ✅ "Sign In" button works
- ✅ Clerk authentication modal opens

### 7.2 Create Your First Account

1. Click **"Sign In"**
2. Click **"Sign up"** at the bottom
3. Create an account using email or social login
4. You'll be redirected to `/dashboard`
5. Complete the onboarding flow:
   - Create your company
   - Select a subscription plan (use test card `4242 4242 4242 4242`)
   - You're in! 🎉

### 7.3 Verify Everything Works

Check these features:

```bash
✅ Authentication
   - Sign up / Sign in works
   - Profile page accessible
   
✅ Multi-Tenancy
   - Company created automatically
   - Dashboard shows company name
   
✅ RBAC System
   - You have OWNER role (29 permissions)
   - All menu items visible
   
✅ Billing
   - Stripe checkout works
   - Subscription appears in dashboard
   - "Manage Billing" button works
```

---

## 🌐 Step 8: Production Deployment

### Option A: Vercel (Recommended - 5 minutes)

#### 8.1 Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel auto-detects Next.js settings ✅

#### 8.2 Add Environment Variables

In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add all variables from your `.env.local`:
   - ⚠️ Use **PRODUCTION** keys (not test keys!)
   - ⚠️ Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
   - ⚠️ Use production database URL

```bash
# Production values example
DATABASE_URL="postgresql://prod-connection-string"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Production webhook!
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

#### 8.3 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your app is live! 🚀

#### 8.4 Run Production Migrations

After first deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run migration in production
vercel env pull .env.production
npx prisma migrate deploy
npx tsx scripts/seed-rbac.ts
```

#### 8.5 Update Webhooks

Update your webhook URLs to production:

**Clerk**:
- Change endpoint to: `https://your-app.vercel.app/api/webhooks/clerk`

**Stripe**:
- Change endpoint to: `https://your-app.vercel.app/api/webhooks/stripe`
- Generate new webhook secret
- Update `STRIPE_WEBHOOK_SECRET` in Vercel

### Option B: Docker Deployment

#### 8.1 Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### 8.2 Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: saastastic
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 8.3 Deploy

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx tsx scripts/seed-rbac.ts
```

### Option C: Manual VPS Deployment

```bash
# On your server (Ubuntu/Debian)
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Clone repository
git clone https://github.com/your-org/saastastic.git
cd saastastic

# Install dependencies
npm install

# Create production environment file
nano .env.production

# Build application
npm run build

# Run migrations
npx prisma migrate deploy
npx tsx scripts/seed-rbac.ts

# Start with PM2
npm install -g pm2
pm2 start npm --name "saastastic" -- start
pm2 startup
pm2 save
```

---

## 🐛 Troubleshooting

### Issue 1: "Database connection failed"

**Symptoms**: Can't connect to PostgreSQL

**Solutions**:
```bash
# Check if PostgreSQL is running
# Mac/Linux:
pg_isready

# Check your connection string format
# Should be: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Test connection manually
psql "postgresql://user:pass@localhost:5432/dbname"

# Common fixes:
# 1. Wrong password
# 2. Database doesn't exist (run: createdb your_db_name)
# 3. PostgreSQL not running (run: brew services start postgresql)
# 4. Firewall blocking port 5432
```

### Issue 2: "Clerk authentication fails" or 401 errors

**Symptoms**: Sign in doesn't work, redirect loops

**Solutions**:
```bash
# 1. Verify your keys are correct
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Should start with pk_test_ or pk_live_

# 2. Check Clerk dashboard paths match:
# Sign-in URL: /sign-in
# Sign-up URL: /sign-up
# After sign-in: /dashboard

# 3. Clear browser cookies/cache

# 4. Check that NEXT_PUBLIC_APP_URL matches your current URL
# Development: http://localhost:3000
# Production: https://your-domain.com

# 5. Restart dev server
npm run dev
```

### Issue 3: "Stripe webhook not working"

**Symptoms**: Subscriptions don't update, payments not recorded

**Solutions**:
```bash
# Development:
# 1. Run Stripe CLI webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 2. Copy the webhook signing secret to .env.local
STRIPE_WEBHOOK_SECRET="whsec_..."

# 3. Keep stripe listen running while testing

# Production:
# 1. Verify webhook endpoint in Stripe dashboard
# 2. Check webhook signing secret is correct
# 3. Test webhook with "Send test webhook" button
# 4. Check logs in Stripe dashboard → Webhooks → [your endpoint]

# Debug webhook issues:
# Check server logs: vercel logs (for Vercel)
# Verify endpoint returns 200 status
```

### Issue 4: "Prisma Client not generated"

**Symptoms**: Import errors, TypeScript errors about Prisma

**Solutions**:
```bash
# Regenerate Prisma Client
npx prisma generate

# If that fails, clear and regenerate
rm -rf node_modules/.prisma
npx prisma generate

# Restart TypeScript server in your editor
# VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Issue 5: "Permission denied" or RBAC not working

**Symptoms**: Features not visible, "Access denied" errors

**Solutions**:
```bash
# 1. Verify RBAC was seeded
npx prisma studio
# Check Permissions table has 29 rows

# 2. Re-seed if needed
npx tsx scripts/seed-rbac.ts

# 3. Check user has role assigned
# In Prisma Studio, check UserCompany table
# Should have roleId pointing to a RoleModel

# 4. Create new company to test
# New companies auto-provision all 4 roles

# 5. Check permission keys match
# See src/shared/lib/permissions.ts for canonical list
```

### Issue 6: "Build fails in production"

**Symptoms**: `npm run build` fails

**Solutions**:
```bash
# 1. Check TypeScript errors
npm run build 2>&1 | grep error

# 2. Ensure Prisma client is generated
npx prisma generate

# 3. Check environment variables are set
echo $DATABASE_URL
# If empty in production, add to your deployment platform

# 4. Clear build cache
rm -rf .next
npm run build

# 5. Check Node.js version
node --version  # Should be 18.17+
```

### Issue 7: "Rate limit errors" or "Too many requests"

**Symptoms**: API calls fail with 429 status

**Solutions**:
```bash
# If using Upstash rate limiting:
# 1. Verify Upstash credentials
echo $UPSTASH_REDIS_REST_URL

# 2. Increase rate limits in code:
# Edit src/shared/lib/api-middleware.ts
# Adjust rate limit values

# If not using rate limiting:
# Comment out rate limiting middleware
# (Not recommended for production)
```

### Issue 8: Email invitations not working

**Symptoms**: Invitation emails not sent

**Solutions**:
```bash
# 1. Check if Resend API key is set
echo $RESEND_API_KEY

# 2. In development, emails are logged to console
# Check your terminal for email output

# 3. Verify "From" email is verified in Resend
# Resend Dashboard → Domains → Verify domain

# 4. Check invitation created in database
# Prisma Studio → UserInvitation table

# Alternative: Use SendGrid or other email provider
# Update src/features/users/services/invitation-service.ts
```

---

## ✅ Post-Setup Checklist

Before going live, verify:

### Security
- [ ] All secret keys are production values (not test keys)
- [ ] `.env.local` is in `.gitignore`
- [ ] Environment variables set in hosting platform
- [ ] Database has SSL enabled (`?sslmode=require`)
- [ ] Stripe webhooks using production signing secret
- [ ] CORS settings configured properly

### Functionality
- [ ] Sign up / Sign in works
- [ ] Company creation works
- [ ] Stripe checkout completes successfully
- [ ] Subscription shown in dashboard
- [ ] User invitations send emails
- [ ] RBAC permissions enforced
- [ ] All 29 permissions seeded in database

### Performance
- [ ] Database connection pooling configured
- [ ] Images optimized
- [ ] Rate limiting enabled (if using Upstash)
- [ ] Error tracking enabled (Sentry)

### Testing
- [ ] Complete one full signup → subscribe flow
- [ ] Test with multiple users/companies
- [ ] Verify tenant isolation (data separation)
- [ ] Test role permissions (Owner vs Member)
- [ ] Run E2E tests: `npm run test:e2e`

---

## 🤖 Using AI Coding Assistants

**SaaStastic is the ONLY B2B SaaS boilerplate optimized for AI coding assistants!**

### For Developers Using AI Tools (Cursor, Windsurf, Cline, GitHub Copilot)

If you're using AI coding assistants, SaaStastic includes comprehensive guides to help your AI build features safely:

1. **LLM Onboarding Context** → `docs/guidesForVibers/LLM_ONBOARDING_CONTEXT.md`
   - Complete guide for AI assistants
   - Task-based file matrix (AI knows which files to read)
   - Security rules (prevents multi-tenant bugs)
   - Code templates (ready to use)
   - Verification checklists

2. **Safe Customization Guide** → `docs/guides/SAFE_CUSTOMIZATION_GUIDE.md`
   - Learn what's safe to modify
   - Avoid breaking updates
   - Best practices for customization

### How to Use with Your AI

**At the start of each session, tell your AI**:
```
I'm working on SaaStastic. Please read:
1. docs/guidesForVibers/LLM_ONBOARDING_CONTEXT.md (for context)
2. docs/guides/SAFE_CUSTOMIZATION_GUIDE.md (for safety zones)

Then help me with [your task]
```

**This ensures**:
- ✅ AI follows multi-tenant security patterns
- ✅ AI checks permissions on all API routes
- ✅ AI validates input with Zod
- ✅ AI creates files in safe zones (won't break updates)
- ✅ Code is production-ready, not just "works locally"

### Bonus Content (Professional+ Tiers)

**If you purchased Professional, Agency, Enterprise, or Forever tier**:

📦 **AI Workflow Toolkit** (included)
- Location: `bonus/ai-dev-tasks/`
- Snarktank's AI Dev Tasks system (Apache 2.0 licensed)
- PRD generation, task lists, structured workflows
- Works with ANY AI model

📦 **Launch Success Kit** (Agency+ tiers)
- Location: `bonus/launch-kit/`
- Complete launch planning system
- Generate launch plans in minutes
- Codebase-aware tailoring

**To use these**, see their respective README files in the `bonus/` folder.

---

## 📚 Next Steps

After setup is complete:

1. **🤖 Set Up AI Assistant** (Recommended First Step)
   - Read `docs/guidesForVibers/LLM_ONBOARDING_CONTEXT.md`
   - Configure your AI tool (Cursor, Windsurf, etc.)
   - Point AI to this guide for safe development

2. **Customize Your App**
   - Update branding in `src/lib/site-config.ts`
   - Add your logo to `public/`
   - Customize marketing pages in `src/app/(marketing)/`
   - **Use**: `docs/guides/SAFE_CUSTOMIZATION_GUIDE.md` for guidance

3. **Configure Billing**
   - Create your pricing tiers in Stripe
   - Update prices in dashboard

4. **Invite Your Team**
   - Add team members through `/dashboard/team`
   - Assign appropriate roles

5. **Read Documentation**
   - [Safe Customization Guide](./SAFE_CUSTOMIZATION_GUIDE.md) ⭐ **Start here**
   - [RBAC Usage Guide](./RBAC_USAGE.md)
   - [Customization Guide](./CUSTOMIZING_PERMISSIONS.md)
   - [API Reference](../core/api-reference.md)
   - [AI Onboarding (for developers)](../guidesForVibers/LLM_ONBOARDING_CONTEXT.md)

---

## 🆘 Still Having Issues?

### Check These Resources

1. **Documentation**: [docs/](../docs/)
2. **GitHub Issues**: [Search existing issues](https://github.com/your-org/saastastic/issues)
3. **Discussions**: [Community discussions](https://github.com/your-org/saastastic/discussions)

### Getting Help

When asking for help, provide:
- Operating system and version
- Node.js version (`node --version`)
- PostgreSQL version (`psql --version`)
- Error messages (full stack trace)
- Steps to reproduce
- What you've already tried

### Common Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**🎉 Congratulations!** You now have a fully functional multi-tenant B2B SaaS application.

**Total setup time**: ~25 minutes (if all prerequisites are ready)

**Questions?** Open an issue or discussion on GitHub.

---

*Last updated: October 12, 2025 - Added AI coding assistant guides and bonus content sections*
