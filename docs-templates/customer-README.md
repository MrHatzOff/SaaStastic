# SaaStastic - Enterprise SaaS Boilerplate

**Production-ready Next.js 15 boilerplate** with authentication, billing, RBAC, and multi-tenancy built-in. Skip months of development and launch your SaaS in days, not months.

---

## 🚀 Features

### Authentication & Security
- 🔐 **Clerk Authentication** - Production-ready auth with social logins, 2FA, and session management
- 🏢 **Multi-Tenant Architecture** - Perfect data isolation between customers
- 🔒 **Row-Level Security** - All database queries automatically scoped by company
- 👥 **Team Invitations** - Email-based team member invitations with role assignment

### Billing & Payments
- 💳 **Stripe Integration** - Complete checkout flow with webhooks
- 🎫 **Subscription Management** - Automatic plan upgrades, downgrades, and cancellations
- 📧 **Payment Notifications** - Email alerts for successful payments, failures, and cancellations
- 🔄 **Customer Portal** - Self-service billing management (update cards, view invoices, cancel)

### Access Control
- 🛡️ **29-Permission RBAC System** - Granular permission control across 7 categories
- 👤 **4 System Roles** - Owner, Admin, Member, Viewer (auto-provisioned per tenant)
- ⚡ **Permission Guards** - UI and API protection with easy-to-use hooks
- 🎯 **Custom Roles** - Create unlimited custom roles with specific permission sets

### Developer Experience
- ✅ **87 Passing Tests** - 60 unit tests + 27 E2E tests with Playwright
- 📚 **Comprehensive Documentation** - Setup guides, API docs, and customization guides
- 🎨 **Modern UI** - TailwindCSS 4 with shadcn/ui components
- 🔧 **TypeScript First** - Full type safety across frontend and backend
- 📊 **Activity Audit Logs** - Track all user actions for compliance and debugging

---

## 📋 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL + Prisma ORM 6 |
| **Authentication** | Clerk |
| **Payments** | Stripe |
| **UI** | React 19 + TailwindCSS 4 + shadcn/ui |
| **Testing** | Vitest + Playwright |
| **Email** | Ready for Resend/SendGrid integration |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ database
- **Clerk** account (free tier available)
- **Stripe** account (test mode works)

### 1. Clone & Install

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 2. Environment Setup

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your credentials
```

**Required Environment Variables**:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saastastic"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> 📘 **See [Setup Guide](docs/guides/SETUP_GUIDE.md) for detailed instructions**

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed RBAC roles (creates 4 system roles per company)
npx tsx scripts/seed-rbac.ts

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the landing page!

### 5. Create Your First Account

1. Click "Sign In" and create a new account
2. Complete the onboarding flow (company creation)
3. You'll be redirected to the dashboard as a company Owner

**🎉 You're ready to build!**

---

## 📚 Documentation

### Getting Started
- **[Setup Guide](docs/guides/SETUP_GUIDE.md)** - Complete installation and configuration
- **[FAQ](docs/guides/FAQ.md)** - Common questions and troubleshooting

### Customization Guides
- **[RBAC Usage](docs/guides/RBAC_USAGE.md)** - How to use permissions and roles
- **[Customizing Permissions](docs/guides/CUSTOMIZING_PERMISSIONS.md)** - Add your own permissions
- **[Extending Team Management](docs/guides/EXTENDING_TEAM_MANAGEMENT.md)** - Team features
- **[Stripe Customization](docs/guides/STRIPE_CUSTOMIZATION.md)** - Billing and pricing
- **[Safe Customization Guide](docs/guides/SAFE_CUSTOMIZATION_GUIDE.md)** - Best practices

### Architecture & Testing
- **[E2E Testing Guide](docs/core/E2E_TESTING_GUIDE.md)** - Running and writing tests
- **[Dependency Updates](docs/core/DEPENDENCY_UPDATE_PLAN.md)** - Maintenance strategy
- **[Test Documentation](docs/testing/TEST_SUITE_DOCUMENTATION.md)** - Test coverage details

---

## 🎯 What's Included

### Pages & Features

**Public Pages**:
- Landing page with hero, features, pricing
- About page
- Contact page
- Pricing page with Stripe integration

**Authenticated Pages**:
- Smart onboarding flow (company creation)
- Dashboard with company context
- Team management (invite, manage, remove members)
- User activity logs with filtering
- Billing portal (subscriptions, invoices, payment methods)
- Profile management

**API Routes**:
- Company management (CRUD)
- Team management (invitations, roles)
- User permissions (RBAC)
- Stripe webhooks (subscription events)
- Activity logging

### Database Models

- **Company** - Multi-tenant organization
- **User** - Clerk user reference
- **UserCompany** - Many-to-many with role assignment
- **Role** - Custom roles with permissions
- **RolePermission** - Permission assignments
- **Subscription** - Stripe subscription data
- **Invoice** - Stripe invoice records
- **EventLog** - Activity audit trail
- **Invitation** - Pending team invitations

---

## 🛡️ Security Features

### Multi-Tenant Isolation
- ✅ All database queries scoped by `companyId`
- ✅ Prisma middleware enforces tenant boundaries
- ✅ API middleware validates company access
- ✅ Zero cross-tenant data leakage

### Permission System
- ✅ 29 granular permissions across 7 categories
- ✅ UI components auto-hide based on permissions
- ✅ API routes protected with permission checks
- ✅ Role-based access control (RBAC)

### Best Practices
- ✅ Environment variables for secrets
- ✅ CSRF protection on state-changing operations
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React escaping)

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests (60 tests)
npm test

# E2E tests (27 tests)
npm run test:e2e

# Test coverage
npm run test:coverage

# Interactive test UI
npm run test:ui
```

### Test Coverage

- ✅ **RBAC Permissions** - All 29 permissions validated
- ✅ **Tenant Isolation** - Multi-tenant security verified
- ✅ **Stripe Webhooks** - Payment event handling
- ✅ **User Invitations** - Team collaboration flows
- ✅ **Billing Flows** - Checkout and portal access
- ✅ **Authentication** - Clerk integration

---

## 🚀 Deployment

### Recommended Platforms

**Vercel** (Easiest):
```bash
npm install -g vercel
vercel
```

**Railway** (Database + App):
- Connect GitHub repo
- Add PostgreSQL service
- Deploy automatically

**AWS/GCP/Azure**:
- See [Deployment Guide](docs/users/getting-started/DEPLOYMENT.md)

### Environment Variables

Set all variables from `.env.example` in your deployment platform:
- Database URL (use connection pooling for serverless)
- Clerk credentials (production keys)
- Stripe credentials (live keys)
- App URL (your production domain)

### Pre-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Use production Clerk keys
- [ ] Use live Stripe keys (after testing in test mode)
- [ ] Set up Stripe webhook endpoint in Stripe dashboard
- [ ] Configure database backups
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Test checkout flow in production mode
- [ ] Verify email notifications work

---

## 🎨 Customization

### Branding

Update these files with your brand:
- `src/app/layout.tsx` - Site metadata, colors
- `public/` - Replace logos and favicons
- `tailwind.config.ts` - Brand colors
- Landing page components in `src/app/`

### Permissions

Add your own permissions in:
- `src/shared/lib/permissions.ts` - Define new permissions
- Update role templates in `src/core/rbac/default-roles.ts`
- See [Customizing Permissions](docs/guides/CUSTOMIZING_PERMISSIONS.md)

### Stripe Plans

1. Create products in Stripe Dashboard
2. Update `src/features/billing/config/plans.ts`
3. Update pricing page in `src/app/pricing/page.tsx`
4. See [Stripe Customization](docs/guides/STRIPE_CUSTOMIZATION.md)

---

## 📊 Project Structure

```
saastastic/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── core/                   # Core infrastructure
│   │   ├── auth/              # Authentication utilities
│   │   ├── db/                # Database client & middleware
│   │   └── rbac/              # RBAC provisioning
│   ├── features/              # Feature modules
│   │   ├── billing/           # Stripe integration
│   │   ├── companies/         # Company management
│   │   ├── customers/         # Customer module
│   │   └── users/             # User & team management
│   └── shared/                # Shared utilities & components
├── prisma/                    # Database schema & migrations
├── tests/                     # Unit & E2E tests
├── docs/                      # Documentation
└── scripts/                   # Utility scripts
```

---

## 🆘 Support & Help

### Documentation
- Start with [Setup Guide](docs/guides/SETUP_GUIDE.md)
- Check [FAQ](docs/guides/FAQ.md) for common issues
- Review [Safe Customization Guide](docs/guides/SAFE_CUSTOMIZATION_GUIDE.md)

### Common Issues

**Database Connection Error**:
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Ensure database exists: `createdb saastastic`

**Clerk Authentication Not Working**:
- Verify both Clerk keys are set
- Check Clerk Dashboard for correct URLs
- Ensure you're using correct environment (dev/prod)

**Stripe Webhooks Failing**:
- Use Stripe CLI for local development: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook secret matches
- Check Stripe Dashboard event logs

**Tests Failing**:
- Run `npm install` to ensure deps are updated
- Check `.env.test` has correct variables
- Try: `rm -rf .next && npm test`

---

## 📝 License

[Your license type here]

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Clerk](https://clerk.com/) - Authentication
- [Stripe](https://stripe.com/) - Payments
- [Prisma](https://www.prisma.io/) - Database ORM
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vitest](https://vitest.dev/) - Testing
- [Playwright](https://playwright.dev/) - E2E testing

---

**Built with SaaStastic** 🚀

Ready to launch your SaaS? Start customizing and ship your product!
