# SPEC-001-SaaS-Boilerplate

## Background

This repo is intended to be a **reusable SaaS boilerplate** for building multi-tenant B2B SaaS applications. It should serve as the foundation for this project (our business management app) and other SaaS projects. The boilerplate emphasizes:

* Next.js frontend with modular structure
* PostgreSQL with Prisma ORM
* Clerk authentication with unified marketing + B2B flow
* Multi-tenant support from day one
* Clean repo documentation, rules, and developer onboarding
* Extensible file structure for adding new modules

## Requirements

### Must Haves

* **Next.js app** with modular folder structure
* **Database:** PostgreSQL via Prisma

  * **Development DB:** Local Postgres install (Windows/Chocolatey or native)
  * **Production DB:** Neon (serverless managed Postgres)
* **Auth:** Clerk for production with unified marketing + B2B experience
* **Schema:** Core models (User, Company, Customer, EventLog, Feedback)
* **Multi-tenant enforcement:** `companyId` scoping, simplified tenant setup
* **Roles:** `owner`, `admin`, `member`
* **Unified Experience:** Marketing pages + B2B app in single codebase
* **Onboarding Flow:** First-time users → Company setup → Dashboard
* **Documentation files:** PRD, Vision, Contributing/Dev, Windsurf Rules, Tenanting.md
* **Windsurf Rules** file for LLM-assisted coding
* **README.md** with tech stack, dev env setup, and usage

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # REST API routes with middleware
│   │   ├── dashboard/         # Protected dashboard pages
│   │   └── onboarding/        # Company setup flow
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   └── customers/        # Customer-specific components
│   └── core/                 # Business logic and utilities
│       ├── auth/             # Authentication & company context
│       └── db/               # Database client & tenant guards
├── prisma/
│   └── schema.prisma         # Database schema with multi-tenancy
└── docs/                     # Documentation
```

## 🔧 Setup & Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account (for authentication)

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

### Installation
```bash
npm install
npm run db:push    # Create database and apply schema
npm run dev       # Start development server
```

### Database Commands
```bash
npm run db:push     # Apply schema changes
npm run db:migrate  # Create new migration
npm run db:studio   # Open Prisma Studio
npm run db:generate # Regenerate Prisma client
```

## 🔐 Security Features

### Multi-Tenant Isolation
- **Database Level**: Automatic companyId scoping via Prisma middleware
- **API Level**: Company context validation on all routes
- **Frontend Level**: Company context provider with role-based access

### Authentication & Authorization
- **Clerk Integration**: Secure authentication with session management
- **Role-Based Access**: OWNER, ADMIN, MEMBER roles per company
- **API Protection**: All routes require authentication and company context
- **Rate Limiting**: Built-in protection against abuse

## 📚 Key Components

### CompanyProvider
Manages company context and user authentication state:
```typescript
const { currentCompany, companies, switchCompany } = useCompany()
```

### API Middleware
Automatic tenant isolation and authentication:
```typescript
export const GET = withApiMiddleware(
  async (req, context) => {
    const { companyId, userId } = context
    // All queries automatically scoped to companyId
  },
  { requireAuth: true, requireCompany: true }
)
```

### Database Schema
Multi-tenant design with proper relationships:
```prisma
model Company {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  // ... audit fields
  users     UserCompany[]
  customers Customer[]
}

model Customer {
  id        String   @id @default(cuid())
  name      String
  email     String?
  companyId String   // Automatic tenant isolation
  company   Company  @relation(fields: [companyId])
}
```

## 🎯 User Flow

1. **Sign Up/Login** → Clerk modal authentication
2. **Company Setup** → Create company with unique slug
3. **Dashboard** → Company overview and management
4. **Customer Management** → Add/view customers (company-scoped)

## 🚦 Development Notes

### 🚀 Current Status

**✅ WORKING FEATURES:**
- ✅ **Authentication**: Clerk integration with modal sign-in/sign-up
- ✅ **Company Onboarding**: Create companies with unique slugs
- ✅ **Dashboard**: Basic dashboard with company overview
- ✅ **Database**: PostgreSQL with Prisma ORM, tenant-scoped queries
- ✅ **API Routes**: RESTful API with proper middleware
- ✅ **Customer Management**: Add/view customers (with company isolation)

**⚠️ KNOWN ISSUES (FIXED):**
- ✅ **Company Context for Customers**: Fixed - re-enabled tenant guard middleware
- ✅ **Link Styling**: Fixed - added proper hover states and cursor pointers
- ✅ **Performance**: Fixed - optimized Sentry configuration for development

**🔧 RECENT FIXES:**
- **Database Tenant Guard**: Re-enabled for proper company isolation
- **Sentry Performance**: Reduced sampling rates in development
- **Link Styling**: Added proper hover states and cursor pointers
- **Slug Generation**: User-friendly short suffixes instead of timestamps

## 📖 Documentation
npm install

3. Install Postgres locally (Windows):

   * Download installer: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   * Or via Chocolatey: `choco install postgresql`
4. Create local DB `saas_dev` and set connection string in `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/saas_dev"
```

5. Run migrations

```powershell
npx prisma migrate dev --name init
```

6. Run dev server

```powershell
npm run dev
```

### Development Flow

* **Marketing Pages:** Add to `/src/app/` (public routes)
* **B2B Features:** Add to `/modules/` with proper company scoping
* **Authentication:** Use Clerk hooks and company provider
* **API Routes:** Add to `/src/app/api/` with simplified middleware
* **Components:** Marketing components in `/components/marketing/`, shared in `/components/ui/`
* **Database:** Use Prisma client from `/core/db/`
* **Commit PRs:** Follow CONTRIBUTING.md guidelines

### Milestones

1. ✅ Scaffold unified marketing + B2B structure
2. ✅ Implement Clerk authentication with modal flows
3. ✅ Create company onboarding flow for new users
4. ✅ Build marketing pages (landing, about, contact, FAQ)
5. ✅ Implement dashboard with company-specific data
6. ✅ Add simplified tenant isolation (companyId scoping)
7. ✅ Create API routes with proper authentication
8. ✅ Document unified architecture and user flows
9. 🔄 Add comprehensive testing (Playwright E2E)
10. 🔄 Implement observability and error tracking

### Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript 5
- **Styling:** TailwindCSS with custom design system
- **Authentication:** Clerk (Test mode for dev, Production for live)
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** Vercel (frontend), Neon (database)
- **Testing:** Playwright for E2E, Jest for unit tests
- **Monitoring:** Sentry for error tracking

## Gathering Results

* Repo should run locally without Docker, using Postgres install
* Deployable to Vercel with Neon DB
* Multi-tenant enforced by `tenantGuard`
* Documentation supports onboarding juniors easily

