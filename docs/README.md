# SPEC-001-SaaS-Boilerplate

## Background

This repo is intended to be a **reusable SaaS boilerplate** for building multi-tenant B2B SaaS applications. It should serve as the foundation for this project (our business management app) and other SaaS projects. The boilerplate emphasizes:

* Next.js frontend with modular structure
* PostgreSQL with Prisma ORM
* Clerk authentication (with development Company Switcher fallback)
* Multi-tenant support from day one
* Clean repo documentation, rules, and developer onboarding
* Extensible file structure for adding new modules

## Requirements

### Must Haves

* **Next.js app** with modular folder structure
* **Database:** PostgreSQL via Prisma

  * **Development DB:** Local Postgres install (Windows/Chocolatey or native)
  * **Production DB:** Neon (serverless managed Postgres)
* **Auth:** Clerk for production + simple Company Switcher for local development
* **Schema:** Core models (User, Company, UserCompany, Customer, EventLog, Feedback)
* **Multi-tenant enforcement:** `companyId` scoping, Prisma middleware (`tenantGuard`), future Row Level Security (RLS)
* **Roles:** `owner`, `admin`, `member`
* **Funnel pages:** Landing, FAQs, About, Contact, Dashboard (placeholder)
* **Documentation files:** PRD, Vision, Contributing/Dev, Windsurf Rules, Tenanting.md
* **Windsurf Rules** file for LLM-assisted coding
* **README.md** with tech stack, dev env setup, and usage

### Should Haves

* Shared **UI design system** (colors, typography, spacing, tailwind theme)
* **Test harness** (Jest + React Testing Library)
* Basic **observability stub** (`/core/observability`) logging into DB
* Basic **feature flag stub** (`/core/flags`)
* Optional **feedback form** route + DB storage

### Could Haves

* Stripe integration (planned for v2)
* Email notifications (planned for v2)
* Feature usage analytics dashboard

## Method

### Architecture Overview

* **Frontend:** Next.js 15 + TailwindCSS + modular routing
* **Backend:** Next.js API routes, Prisma ORM
* **Database:** PostgreSQL (local for dev, Neon for prod)
* **Auth:** Clerk (prod), Dev Company Switcher (dev)
* **File Structure:**

```
/apps
  /web         # Next.js frontend
  /api         # Next.js API routes
/core
  /auth        # Clerk + Dev Company Switcher
  /db          # Prisma client + tenantGuard middleware
  /observability # Event logging stub
  /flags       # Feature flag stub
/docs
  MVP_PRD.md
  VISION.md
  CONTRIBUTING&DEV.md
  WINDSURFRULES.json
  ARCHITECTURE.md
  TENANTING.md
/modules
  /company     # Company/Admin features
  /finance     # Finance module placeholder
  /shared      # UI components, constants
/prisma
  schema.prisma
/public
  /images
```

### Schema Highlights

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())

  companies UserCompany[]
  feedback  Feedback[]
  logs      EventLog[]
}

model Company {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())

  members   UserCompany[]
  customers Customer[]
  logs      EventLog[]
}

model UserCompany {
  id        String   @id @default(cuid())
  userId    String
  companyId String
  role      String   // owner, admin, member

  user      User     @relation(fields: [userId], references: [id])
  company   Company  @relation(fields: [companyId], references: [id])
}

model Customer {
  id        String   @id @default(cuid())
  companyId String
  name      String
  email     String?  @unique
  phone     String?
  notes     String?
  createdAt DateTime @default(now())

  company   Company  @relation(fields: [companyId], references: [id])
}

model EventLog {
  id        String   @id @default(cuid())
  companyId String?
  userId    String?
  eventType String
  metadata  Json?
  createdAt DateTime @default(now())
}

model Feedback {
  id        String   @id @default(cuid())
  userId    String?
  message   String
  createdAt DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id])
}
```

## Implementation

### Setup & Installation

1. Clone repo

```powershell
git clone https://github.com/your-org/saas-boilerplate.git
cd saas-boilerplate
```

2. Install dependencies

```powershell
npm install
```

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

* Code modules inside `/modules`
* Use `useCompany()` from `/core/auth` for tenant awareness
* Commit PRs following CONTRIBUTING.md

## Milestones

1. Scaffold repo structure
2. Add Clerk + Dev Company Switcher
3. Implement schema + migrations
4. Build landing, about, faq, contact pages
5. Implement dashboard placeholder
6. Add EventLog + Feedback system
7. Document tenanting in TENANTING.md
8. Finalize README.md

## Gathering Results

* Repo should run locally without Docker, using Postgres install
* Deployable to Vercel with Neon DB
* Multi-tenant enforced by `tenantGuard`
* Documentation supports onboarding juniors easily

