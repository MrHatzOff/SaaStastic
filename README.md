# 🚀 SaaStastic - Enterprise B2B SaaS Foundation

**Production-Ready Multi-Tenant B2B SaaS Boilerplate**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Status**: ✅ **Production Ready** (October 5, 2025)

A complete, enterprise-grade B2B SaaS foundation with multi-tenancy, RBAC, Stripe billing, and team management. Built with Next.js 15, React 19, TypeScript, and PostgreSQL.

## ✨ What's Included

- 🔐 **Multi-Tenant Architecture** - Complete tenant isolation with row-level security
- 🎭 **29-Permission RBAC System** - Owner, Admin, Member, Viewer roles with granular permissions
- 💳 **Stripe Integration** - Subscription billing, webhooks, customer portal
- 👥 **Team Management** - User invitations, role assignment, activity tracking
- 🏢 **Company Management** - Multi-company support with automatic RBAC provisioning
- 📊 **Dashboard & Analytics** - User activity, audit logs, system health
- 🎨 **Modern UI** - TailwindCSS 4, shadcn/ui components, responsive design
- 🔒 **Clerk Authentication** - Social login, magic links, multi-factor auth
- ✅ **TypeScript Strict Mode** - 100% type-safe codebase
- 🧪 **E2E Testing** - Playwright test suite for critical flows

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/saastastic.git
cd saastastic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run database migrations
npx prisma migrate dev

# Seed RBAC permissions
npx tsx scripts/seed-rbac.ts

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 🔑 Recent Updates (October 5, 2025)

### ✅ Critical Fixes Applied
- **Clerk 6.x Authentication**: Fixed async auth() handling
- **User Auto-Sync**: Automatic user creation from Clerk
- **RBAC Middleware**: Auto-fetch company context
- **Performance**: Removed timeout-causing code (23s → <1s)

See [AUTHENTICATION_FIX_SUMMARY.md](./AUTHENTICATION_FIX_SUMMARY.md) for details.

## 📖 Usage Guide

### Customizing Your SaaS

1. **Update Branding** - Edit `src/lib/site-config.ts` to customize:
   - Company name and tagline
   - Features and pricing
   - Contact information
   - FAQ content

2. **Add Your Features** - Create modules in `/modules/your-feature/`:
   - Components in `/components`
   - API routes in `/routes` 
   - Database schemas in `/schemas`

3. **Customize UI** - Modify components in `/src/components/`:
   - Update colors in Tailwind config
   - Add your logo and branding
   - Customize marketing pages

### Multi-Tenant Development

```typescript
// Use RBAC-protected API routes
import { withPermissions } from '@/shared/lib/rbac-middleware';
import { PERMISSIONS } from '@/shared/lib/permissions';

export const POST = withPermissions(
  async (req: NextRequest, context) => {
    // context.userId - authenticated user
    // context.companyId - auto-fetched from user's company
    // context.permissions - user's permissions
    
    const data = await db.customer.create({
      data: {
        ...input,
        companyId: context.companyId // Automatic tenant scoping
      }
    });
    return NextResponse.json({ data });
  },
  [PERMISSIONS.CUSTOMER_CREATE] // Required permissions
);

// Use permission guards in components
import { PermissionGuard } from '@/shared/components/permission-guard';

function MyComponent() {
  return (
    <PermissionGuard permission="customer:create">
      <CreateButton />
    </PermissionGuard>
  );
}
```

## 🏢 Multi-Tenancy & RBAC

This boilerplate implements **enterprise-grade multi-tenancy** with RBAC:

- **Database Level** - All queries automatically scoped by `companyId`
- **API Level** - RBAC middleware enforces permissions on all endpoints
- **UI Level** - Permission guards control feature access
- **29 Permissions** - Across Organization, Billing, Team, Customers, API, Roles, System
- **4 System Roles** - Owner (29), Admin (25), Member (7), Viewer (5) permissions
- **Auto-Provisioning** - Roles and permissions created automatically per company

See [docs/core/architecture/rbac-spec.md](./docs/core/architecture/rbac-spec.md) for detailed architecture.

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 📁 Project Structure

### Core Directories

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public marketing pages
│   ├── (app)/             # Authenticated dashboard
│   │   └── dashboard/     # Main app interface
│   └── api/               # RBAC-protected API routes
│
├── core/                  # Core infrastructure
│   ├── auth/              # Clerk integration, company provider
│   ├── db/                # Prisma client, tenant guards
│   └── rbac/              # RBAC provisioning, default roles
│
├── features/              # Domain modules
│   ├── billing/           # Stripe integration
│   ├── companies/         # Company management
│   ├── customers/         # Customer management
│   └── users/             # Team management
│
├── shared/                # Shared utilities
│   ├── components/        # Reusable components
│   ├── hooks/             # React hooks (usePermissions)
│   ├── lib/               # RBAC middleware, permissions
│   └── ui/                # shadcn/ui base components
│
└── lib/                   # Server actions
    └── actions/           # Domain-specific actions
```

### Key Files

- `prisma/schema.prisma` - Database schema with RBAC tables
- `src/middleware.ts` - Clerk authentication middleware
- `src/shared/lib/permissions.ts` - 29 permission definitions
- `src/shared/lib/rbac-middleware.ts` - API protection middleware
- `src/core/rbac/provisioner.ts` - Automatic role provisioning

## 🔧 Configuration

### Site Configuration
Edit `src/lib/site-config.ts` to customize:
- Company information
- Features and pricing
- Contact details
- FAQ content

### Environment Variables
See `.env.example` for all available options:
- Database connections
- Authentication keys
- Feature flags
- External service configurations

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database
- **Development**: Local PostgreSQL
- **Production**: Neon, Supabase, or any PostgreSQL provider

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

### Essential Reading
- [**LLM Onboarding**](./CASCADE_LLM_ONBOARDING.md) - Start here for complete overview
- [**Authentication Fix Summary**](./AUTHENTICATION_FIX_SUMMARY.md) - Recent fixes (Oct 2025)
- [**Current Status**](./docs/core/CURRENTNOTES.md) - Latest updates and next steps

### Technical Documentation
- [**Product Vision & Roadmap**](./docs/core/product-vision-and-roadmap.md) - Strategic direction
- [**Product Status**](./docs/core/product-status.md) - Implementation status
- [**Architecture Blueprint**](./docs/core/architecture-blueprint.md) - System architecture
- [**RBAC Specification**](./docs/core/architecture/rbac-spec.md) - Permission system details
- [**LLM System Context**](./docs/core/llm-system-context.md) - AI assistant reference
- [**E2E Testing Guide**](./docs/core/E2E_TESTING_GUIDE.md) - Testing procedures

### Development Guides
- [**API Reference**](./docs/core/api-reference.md) - Endpoint documentation
- [**RBAC Setup Guide**](./docs/users/guides/rbac-setup-guide.md) - Permission setup
- [**Deployment Guide**](./docs/users/getting-started/DEPLOYMENT_GUIDE.md) - Production deployment

## 🧪 Testing

```bash
# Unit tests with Vitest
npm run test

# E2E tests with Playwright
npm run test:e2e

# Test specific tenant isolation
npm run test:tenancy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 Email: support@yourdomain.com

## 🙏 Acknowledgments

Built with these amazing technologies:
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library with latest features
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety
- [Prisma 6](https://prisma.io/) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Clerk](https://clerk.dev/) - Authentication
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components
- [Zod](https://zod.dev/) - Schema validation
- [Playwright](https://playwright.dev/) - E2E testing

## 🎯 Key Features Deep Dive

### Multi-Tenant Architecture
- **Row-Level Security**: Every query automatically scoped by `companyId`
- **Tenant Isolation**: Complete data separation between companies
- **Company Switching**: Users can belong to multiple companies
- **Automatic Provisioning**: RBAC roles created on company creation

### RBAC System (29 Permissions)
- **Organization** (6): settings, billing, members, roles, delete, transfer
- **Billing** (5): view, manage, subscriptions, invoices, cancel
- **Team** (4): view, invite, manage, remove
- **Customers** (7): view, create, update, delete, export, import, manage
- **API** (3): read, write, admin
- **Roles** (2): view, manage
- **System** (2): health, logs

### Stripe Integration
- **Subscription Management**: Create, update, cancel subscriptions
- **Webhook Handling**: Automated event processing
- **Customer Portal**: Self-service billing management
- **Usage Tracking**: Ready for metered billing (Stripe v19)

### Team Management
- **Email Invitations**: Send invites with role assignment
- **Bulk Operations**: Manage multiple users at once
- **Activity Tracking**: Comprehensive audit trail
- **Role Assignment**: Fine-grained permission control

---

**Ready to build your enterprise SaaS?** This boilerplate gives you months of development work out of the box.

**Questions?** See [docs/core/CURRENTNOTES.md](./docs/core/CURRENTNOTES.md) for latest status or [AUTHENTICATION_FIX_SUMMARY.md](./AUTHENTICATION_FIX_SUMMARY.md) for troubleshooting.
