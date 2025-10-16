# Optional Integrations Guide

**Last Updated**: October 14, 2025

This guide covers **optional** third-party services that you can integrate with SaaStastic. None of these are required for the core application to function.

---

## 🎯 What's Already Included

SaaStastic comes with these **fully integrated** services:

| Service | Purpose | Status |
|---------|---------|--------|
| **Clerk** | Authentication | ✅ **Required** - Fully integrated |
| **Stripe** | Payments & Billing | ✅ **Required** - Fully integrated |
| **PostgreSQL** | Database | ✅ **Required** - Fully integrated |

---

## 📧 Email Service (Optional)

### **Resend** - Email Delivery

**Status**: Code ready, not configured  
**Required**: No (invitation emails will fail silently)  
**Cost**: Free tier: 100 emails/day, 3,000/month

#### When You Need It:
- User invitation emails
- Password reset emails
- Notification emails
- Transactional emails

#### How to Set Up:

**Step 1: Create Resend Account**
1. Go to https://resend.com/
2. Sign up for free account
3. Verify your domain (or use their test domain)

**Step 2: Get API Key**
1. Go to https://resend.com/api-keys
2. Create new API key
3. Copy the key (starts with `re_`)

**Step 3: Add to Environment**

Add to `.env.local`:
```bash
RESEND_API_KEY="re_..."
```

**Step 4: Test**
```bash
# Start dev server
npm run dev

# Try inviting a team member
# Check email arrives
```

#### Where It's Used:
- `src/features/users/components/invite-member-modal.tsx` - Team invitations
- Email templates in `src/lib/email/` (when you create them)

#### Alternative Email Services:
You can swap Resend for:
- **SendGrid** - Popular enterprise option
- **Mailgun** - Developer-friendly
- **Amazon SES** - If on AWS already
- **Postmark** - Great for transactional emails

Just update the API client in `src/lib/email/`.

---

## 📊 Error Tracking (Optional)

### **Sentry** - Error Monitoring

**Status**: Code placeholders exist, not configured  
**Required**: No (errors will only show in logs)  
**Cost**: Free tier: 5,000 events/month

#### When You Need It:
- Production error tracking
- Performance monitoring
- Release tracking
- User session replay

#### How to Set Up:

**Step 1: Create Sentry Account**
1. Go to https://sentry.io/
2. Sign up for free account
3. Create new project (select Next.js)

**Step 2: Get DSN**
1. Project Settings → Client Keys (DSN)
2. Copy the DSN URL

**Step 3: Add to Environment**

Add to `.env.local` and `.env.production`:
```bash
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
```

**Step 4: Initialize Sentry**

Create `src/lib/sentry.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    // Add additional config here
  });
}
```

Import in `src/app/layout.tsx`:
```typescript
import '@/lib/sentry'
```

**Step 5: Test**
```typescript
// Trigger test error
throw new Error('Sentry test error');
```

Check Sentry dashboard for error.

#### Alternative Error Tracking:
- **LogRocket** - With session replay
- **Rollbar** - Simple setup
- **BugSnag** - Good mobile support
- **Datadog** - Full observability platform

---

## 📈 Analytics (Optional)

### **Recommended Options**

#### **PostHog** - Product Analytics
**Best for**: User behavior, feature flags, A/B testing  
**Cost**: Free tier: 1M events/month  
**Setup**: https://posthog.com/

#### **Plausible** - Privacy-Friendly Analytics
**Best for**: GDPR-compliant traffic analytics  
**Cost**: $9/month for 10k pageviews  
**Setup**: https://plausible.io/

#### **Mixpanel** - Event Analytics
**Best for**: User journey tracking  
**Cost**: Free tier: 20M events/year  
**Setup**: https://mixpanel.com/

#### Quick Integration:

Add to `src/app/layout.tsx`:
```typescript
// PostHog example
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com'
  })
}
```

---

## 🔍 Logging (Optional)

### **Current Setup**
SaaStastic uses `console.log` for development logging. For production, consider:

#### **Recommended Options**

**1. Datadog**
- Full observability platform
- Logs, metrics, traces
- Great for enterprises
- Setup: https://www.datadoghq.com/

**2. Logtail (by Better Stack)**
- Simple log management
- SQL queries on logs
- Affordable pricing
- Setup: https://betterstack.com/logtail

**3. Papertrail**
- Simple, reliable
- Good search capabilities
- Free tier: 50MB/month
- Setup: https://www.papertrail.com/

---

## 🚨 Uptime Monitoring (Optional)

### **Recommended Options**

#### **UptimeRobot**
**Cost**: Free for 50 monitors  
**Setup**: https://uptimerobot.com/  
**What to monitor**:
- Homepage (https://yourdomain.com)
- API health (https://yourdomain.com/api/health)
- Database connectivity

#### **BetterUptime**
**Cost**: Free tier included  
**Setup**: https://betterstack.com/uptime  
**Features**: Status pages, incident management

---

## 🎨 Feature Flags (Optional)

### **Recommended: Posthog**
Comes with analytics + feature flags.

### **Alternative: LaunchDarkly**
Industry standard, enterprise-ready.  
**Cost**: Free tier: 1,000 MAU  
**Setup**: https://launchdarkly.com/

---

## 💬 Customer Support (Optional)

### **Intercom**
**Best for**: Chat support, knowledge base  
**Cost**: Starts at $39/month  
**Setup**: https://www.intercom.com/

### **Crisp**
**Best for**: Budget-conscious startups  
**Cost**: Free tier available  
**Setup**: https://crisp.chat/

### **Plain**
**Best for**: Developer-focused support  
**Cost**: Starts at $29/month  
**Setup**: https://plain.com/

---

## 📝 Recommended Setup Order

### **Phase 1: MVP Launch** (Core Only)
```
✅ Clerk (authentication) - Required
✅ Stripe (billing) - Required  
✅ PostgreSQL (database) - Required
```

### **Phase 2: First Customers**
```
✅ Resend (emails) - Needed for invitations
✅ Sentry (errors) - Catch production issues
✅ Uptime monitoring - Know when you're down
```

### **Phase 3: Growth**
```
✅ Analytics (PostHog/Mixpanel) - Understand users
✅ Logging (Datadog/Logtail) - Debug production
✅ Customer support (Intercom/Crisp) - Help users
```

### **Phase 4: Scale**
```
✅ Feature flags (LaunchDarkly) - Safe rollouts
✅ Performance monitoring - Optimize bottlenecks
✅ Advanced observability - Full stack visibility
```

---

## 💰 Cost Estimate

### **Free Tier (You can start with $0/month)**
- Clerk: Free up to 10,000 MAUs
- Stripe: Pay only on revenue (2.9% + 30¢)
- PostgreSQL: $0-25/month (Supabase/Neon free tier)
- Resend: Free up to 3,000 emails/month
- Sentry: Free up to 5,000 errors/month
- UptimeRobot: Free for 50 monitors

**Total: $0-25/month** for first ~1,000 users

### **Growing ($100-500/month)**
- Clerk: $25-100/month
- Stripe: Revenue-based
- PostgreSQL: $25-100/month
- Resend: $20/month
- Sentry: $26/month
- Analytics: $0-50/month
- Support tool: $39/month

**Total: ~$135-315/month** base + revenue-based fees

---

## 🔧 How to Add New Integrations

### **Step 1: Install Package**
```bash
npm install [package-name]
```

### **Step 2: Create Client**
Create `src/lib/[service-name].ts`:
```typescript
import ServiceClient from 'service-sdk';

export const client = new ServiceClient({
  apiKey: process.env.SERVICE_API_KEY,
  // config...
});
```

### **Step 3: Add Environment Variables**
Add to `.env.example` and `.env.local`:
```bash
SERVICE_API_KEY="..."
```

### **Step 4: Use in Code**
```typescript
import { client } from '@/lib/service-name';

// Use the client
await client.doSomething();
```

### **Step 5: Update Documentation**
Add to this guide for future reference!

---

## 📚 More Resources

- **Clerk Docs**: https://clerk.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Integrations**: https://nextjs.org/docs/app/building-your-application/integrations

---

## ❓ FAQ

**Q: Do I need to set these up before launching?**  
A: No! Only Clerk, Stripe, and PostgreSQL are required. Add others as needed.

**Q: Can I use different services?**  
A: Absolutely! These are recommendations. Use what works for your team.

**Q: What if I already have these services?**  
A: Perfect! Just add your API keys to the environment variables.

**Q: How do I know which tier to choose?**  
A: Start with free tiers. Upgrade when you hit limits.

---

**Remember**: Focus on shipping your product first. Add integrations when you need them, not before! 🚀
