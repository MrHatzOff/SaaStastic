# 🎨 SaaStastic Customization Guide

This guide will help you customize SaaStastic to match your brand and business needs.

## 🚀 Quick Start (5 Minutes)

The fastest way to make SaaStastic your own:

### 1. Update App Configuration
Edit `src/lib/shared/app-config.ts`:

```typescript
export const appConfig = {
  business: {
    name: "Your SaaS Name",           // ← Change this
    tagline: "Your Value Proposition", // ← And this
    domain: "yourdomain.com",         // ← Your domain
    contact: {
      support: "support@yourdomain.com", // ← Your emails
      sales: "sales@yourdomain.com",
    }
  },
  // ... rest stays the same initially
}
```

### 2. Replace Logo Files
Add your logo files to `/public/images/`:
- `logo-light.svg` - Logo for light mode
- `logo-dark.svg` - Logo for dark mode  
- `favicon.ico` - Browser favicon

### 3. Update Environment Variables
Copy `.env.example` to `.env.local` and add your keys:

```bash
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
# Add your Stripe, database, and other service keys
```

### 4. Test Your Changes
```bash
npm run dev
```

Visit `http://localhost:3000` to see your customized app!

## 📁 Configuration Files Overview

### Primary Configuration Files
| File | Purpose | What to Change |
|------|---------|----------------|
| `src/lib/shared/app-config.ts` | Main app settings | Business info, pricing, features |
| `src/lib/shared/site-config.ts` | Marketing content | Homepage, about, FAQ content |
| `.env.local` | Environment variables | API keys, database URLs |
| `tailwind.config.js` | Design system | Colors, fonts, spacing |

### Quick Reference: What Goes Where

**Business Information** → `app-config.ts`
```typescript
business: {
  name: "Your SaaS",
  domain: "yourdomain.com", 
  contact: { support: "support@yourdomain.com" }
}
```

**Pricing Plans** → `app-config.ts`
```typescript
billing: {
  plans: {
    starter: { name: "Starter", price: 29 },
    // Update prices and features here
  }
}
```

**Marketing Content** → `site-config.ts`
```typescript
features: [
  { title: "Your Feature", description: "What it does" }
],
faq: [
  { question: "Your FAQ", answer: "Your answer" }
]
```

## 🎨 Branding & Design

### Logo Setup
1. **Add logo files** to `/public/images/`:
   ```
   /public/images/
   ├── logo-light.svg    # Logo for light theme
   ├── logo-dark.svg     # Logo for dark theme
   └── favicon.ico       # Browser icon
   ```

2. **Update app-config.ts**:
   ```typescript
   branding: {
     logo: {
       text: "YourSaaS",
       light: "/images/logo-light.svg",
       dark: "/images/logo-dark.svg"
     }
   }
   ```

### Color Customization

#### Option 1: Simple Color Change (Recommended)
Update `app-config.ts`:
```typescript
branding: {
  colors: {
    primary: "blue",    // blue, green, purple, red, etc.
    accent: "indigo"
  }
}
```

#### Option 2: Custom Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',  // Your main brand color
        600: '#2563eb',
        // ... full color scale
      }
    }
  }
}
```

### Typography
Update fonts in `app-config.ts`:
```typescript
branding: {
  fonts: {
    sans: "Inter",        // Main font
    mono: "JetBrains Mono" // Code font
  }
}
```

## 💰 Pricing & Billing Setup

### 1. Configure Your Plans
Edit `app-config.ts`:

```typescript
billing: {
  plans: {
    starter: {
      name: "Starter Plan",
      price: 29,                    // Monthly price in dollars
      yearlyPrice: 290,             // Yearly price (optional)
      stripePriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
      features: [
        "Up to 5 users",
        "10GB storage",
        "Basic support"
      ],
      limits: {
        users: 5,
        storage: 10,
        apiCalls: 10000
      }
    }
    // Add more plans...
  }
}
```

### 2. Set Up Stripe Products
Run the automated setup script:
```bash
# Set your Stripe secret key
export STRIPE_SECRET_KEY=sk_test_your_key_here

# Run the setup script
node scripts/setup-stripe-products.js
```

This creates your Stripe products and generates the environment variables you need.

### 3. Update Environment Variables
Add the generated Stripe IDs to `.env.local`:
```bash
STRIPE_PRICE_STARTER_MONTHLY="price_1234567890"
STRIPE_PRICE_PRO_MONTHLY="price_0987654321"
# ... etc
```

## ✨ Feature Configuration

### Enable/Disable Features
Control what features are available in `app-config.ts`:

```typescript
features: {
  // Core Features
  billing: true,           // Stripe billing
  teams: true,             // Team invitations
  invitations: true,       // User invitations
  fileUploads: false,      // File upload system
  
  // Advanced Features  
  analytics: true,         // Usage analytics
  auditLogs: true,         // Audit trail
  apiAccess: false,        // API endpoints for customers
  
  // Admin Features
  adminPortal: true,       // Support admin panel
  impersonation: false,    // Customer impersonation
  
  // Marketing Features
  blog: false,             // Blog system
  changelog: false,        // Product updates
}
```

### Feature-Based Pricing
Limit features by plan:

```typescript
// In your components, check user's plan
import { appConfig, isFeatureEnabled } from '@/lib/shared/app-config'

// Check if feature is enabled globally
if (isFeatureEnabled('analytics')) {
  // Show analytics
}

// Check user's plan limits
const userPlan = getPlan(user.planId)
if (userPlan.limits.users > currentTeamSize) {
  // Allow adding more users
}
```

## 📧 Email Customization

### Email Configuration
Update `app-config.ts`:
```typescript
email: {
  from: {
    name: "Your SaaS Team",
    address: "noreply@yourdomain.com"
  },
  templates: {
    welcome: { subject: "Welcome to Your SaaS!" },
    invitation: { subject: "Join {{companyName}} on Your SaaS" }
  }
}
```

### Custom Email Templates
Create email templates in `/emails/`:

```typescript
// emails/welcome.tsx
export default function WelcomeEmail({ userName }: { userName: string }) {
  return (
    <div>
      <h1>Welcome to Your SaaS, {userName}!</h1>
      <p>We're excited to have you on board...</p>
    </div>
  )
}
```

## 🌐 Domain & Deployment

### Domain Setup
1. **Update app-config.ts**:
   ```typescript
   business: {
     domain: "yourdomain.com",
     url: "https://yourdomain.com"
   }
   ```

2. **Update environment variables**:
   ```bash
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```

3. **Configure CORS**:
   ```typescript
   security: {
     cors: {
       origins: [
         "https://yourdomain.com",
         "https://www.yourdomain.com"
       ]
     }
   }
   ```

### Deployment Platforms
- **Vercel** (Recommended): Connect GitHub repo
- **Railway**: One-click deploy
- **DigitalOcean**: App Platform
- **Self-hosted**: Docker container

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔧 Advanced Customization

### Adding New Pages
1. Create page: `src/app/your-page/page.tsx`
2. Add navigation link in header component
3. Update sitemap

### Custom Dashboard Widgets
```typescript
// src/components/dashboard/custom-widget.tsx
export function CustomWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Custom Widget</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your custom content */}
      </CardContent>
    </Card>
  )
}
```

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name your-change`
3. Update TypeScript types

### New API Endpoints
```typescript
// src/app/api/your-endpoint/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Your API logic here
  return NextResponse.json({ data: 'your-data' })
3. **CTAs**: Use action-oriented language ("Get Started", "Try Free")
4. **Social Proof**: Add testimonials, logos, metrics where relevant

### Environment Variables

Update `.env.local` with your specific values:

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_COMPANY_NAME="Your Company"
```

## Testing Your Changes

1. Start the development server: `npm run dev`
2. Navigate to each page to verify changes
3. Test responsive design on different screen sizes
4. Verify all links and contact information work correctly

## Deployment Checklist

Before deploying your customized site:

- [ ] Updated all placeholder content in `site-config.ts`
- [ ] Replaced contact information with real details
- [ ] Updated social media links
- [ ] Added your logo and favicon
- [ ] Tested all forms and contact methods
- [ ] Verified pricing information is accurate
- [ ] Updated meta tags for SEO
- [ ] Tested responsive design
- [ ] Checked all internal and external links

## SEO Optimization

Add meta tags to each page:

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Your Company',
  description: 'Learn about our mission and values...',
}
```

## Analytics Integration

Add your analytics tracking code to `src/app/layout.tsx`:

```tsx
// Google Analytics, Mixpanel, etc.
```

This guide should help you quickly customize the boilerplate for your specific SaaS application while maintaining the professional design and functionality.
