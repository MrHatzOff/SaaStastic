# 🚀 SaaStastic Deployment Guide

This guide covers everything you need to deploy SaaStastic to production, including service setup, environment configuration, and deployment options.

## 📋 Pre-Deployment Checklist

### 1. Customize Your Application
- [ ] Update `src/lib/shared/app-config.ts` with your branding and business info
- [ ] Replace logo files in `/public/images/`
- [ ] Update `src/lib/shared/site-config.ts` for marketing pages
- [ ] Customize email templates in `/emails/`

### 2. Set Up Required Services
- [ ] Stripe account and products
- [ ] Database (PostgreSQL)
- [ ] Email service (Resend/SendGrid)
- [ ] File storage (Cloudflare R2/AWS S3)
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog/Google Analytics)

## 🏗️ Service Setup Guide

### 1. Stripe Configuration

#### Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete business verification
3. Enable your account for live payments

#### Create Products & Prices
Run this script to create your products automatically:

```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to your Stripe account
stripe login

# Create products (update prices in the script as needed)
node scripts/setup-stripe-products.js
```

Or create manually in Stripe Dashboard:

**Starter Plan**
- Product Name: "Starter"
- Price: $29/month (recurring)
- Copy the Price ID → `STRIPE_PRICE_STARTER_MONTHLY`

**Professional Plan**
- Product Name: "Professional" 
- Price: $99/month (recurring)
- Copy the Price ID → `STRIPE_PRICE_PRO_MONTHLY`

**Enterprise Plan**
- Product Name: "Enterprise"
- Price: $299/month (recurring)
- Copy the Price ID → `STRIPE_PRICE_ENTERPRISE_MONTHLY`

#### Set Up Webhooks
1. Go to Developers → Webhooks in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.*`
   - `invoice.*`
   - `payment_method.*`
4. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 2. Database Setup

#### Option A: Neon (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string → `DATABASE_URL`

#### Option B: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string → `DATABASE_URL`

#### Option C: Self-Hosted
Set up PostgreSQL on your server and create connection string.

### 3. Email Service Setup

#### Option A: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Get API key → `RESEND_API_KEY`

#### Option B: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key → `SENDGRID_API_KEY`
3. Verify sender identity

### 4. File Storage Setup

#### Option A: Cloudflare R2 (Recommended)
1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Go to R2 Object Storage
3. Create bucket → `R2_BUCKET_NAME`
4. Create API token → `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

#### Option B: AWS S3
1. Create S3 bucket
2. Set up IAM user with S3 permissions
3. Get credentials → `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

### 5. Error Tracking Setup

#### Sentry
1. Sign up at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Copy DSN → `SENTRY_DSN`

### 6. Analytics Setup

#### PostHog (Product Analytics)
1. Sign up at [posthog.com](https://posthog.com)
2. Create project
3. Copy project key → `NEXT_PUBLIC_POSTHOG_KEY`

#### Google Analytics (Optional)
1. Set up GA4 property
2. Copy Measurement ID → `NEXT_PUBLIC_GA_ID`

## 🌍 Deployment Options

### Option 1: Vercel (Recommended)

#### Why Vercel?
- ✅ Built for Next.js
- ✅ Automatic deployments
- ✅ Edge functions
- ✅ Built-in analytics
- ✅ Easy environment variables

#### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

### Option 2: Railway

#### Deploy to Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Option 3: DigitalOcean App Platform

#### Deploy to DigitalOcean
1. Create new app from GitHub
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Add environment variables
4. Deploy

### Option 4: Self-Hosted (Docker)

#### Using Docker
```bash
# Build image
docker build -t saastastic .

# Run container
docker run -p 3000:3000 --env-file .env saastastic
```

## 🔧 Environment Variables

Create these environment variables in your deployment platform:

### Required Variables
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Stripe Products
STRIPE_PRICE_STARTER_MONTHLY="price_..."
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_ENTERPRISE_MONTHLY="price_..."

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"
```

### Optional Variables
```bash
# Email
RESEND_API_KEY="re_..."

# File Storage
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."

# Error Tracking
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_GA_ID="G-..."

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## 🔒 Security Checklist

### Before Going Live
- [ ] Use live Stripe keys (not test keys)
- [ ] Enable Stripe webhook signature verification
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting with Redis
- [ ] Set up monitoring and alerts
- [ ] Configure security headers
- [ ] Set up SSL/TLS certificates
- [ ] Enable database SSL
- [ ] Review and test all API endpoints
- [ ] Set up backup procedures

### Security Headers
Add these to your deployment platform:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 📊 Monitoring & Maintenance

### Set Up Monitoring
1. **Uptime Monitoring**: Use UptimeRobot or Pingdom
2. **Error Tracking**: Sentry for error monitoring
3. **Performance**: Vercel Analytics or Google PageSpeed
4. **Database**: Monitor connection pool and query performance

### Regular Maintenance
- [ ] Monitor error rates and fix issues
- [ ] Review and rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Monitor billing and usage metrics
- [ ] Review security logs

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Database Connection Issues
- Check connection string format
- Verify database is accessible from deployment platform
- Ensure SSL is properly configured

#### Stripe Webhook Issues
- Verify webhook URL is accessible
- Check webhook signing secret
- Review webhook event logs in Stripe Dashboard

#### Email Delivery Issues
- Verify domain authentication
- Check spam folders
- Review email service logs

## 📞 Support

If you need help with deployment:

1. Check our [troubleshooting guide](./TROUBLESHOOTING.md)
2. Search [GitHub issues](https://github.com/saastastic/saastastic/issues)
3. Join our [Discord community](https://discord.gg/saastastic)
4. Contact support: support@saastastic.com

## 🎉 Post-Deployment

After successful deployment:

1. **Test Core Functionality**
   - [ ] User registration and login
   - [ ] Company creation and switching
   - [ ] Team invitations
   - [ ] Subscription checkout
   - [ ] Webhook processing

2. **Set Up Analytics**
   - [ ] Configure conversion tracking
   - [ ] Set up user behavior analytics
   - [ ] Monitor key metrics

3. **Launch Marketing**
   - [ ] Update marketing site content
   - [ ] Set up SEO
   - [ ] Configure social media links
   - [ ] Launch advertising campaigns

Congratulations! Your SaaS is now live! 🚀
