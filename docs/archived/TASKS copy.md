---

# 📋 TASKS.md — Multi-Tenant SaaS Boilerplate Setup

This checklist walks you through building the SaaS boilerplate from scratch.
Follow steps **in order**. Check items off as you complete them ✅.

---

## 1. Initialize Project

* [ ] Open **PowerShell** in your dev folder.
* [ ] Create the project directory:

  ```powershell
  mkdir saas-boilerplate
  cd saas-boilerplate
  git init
  ```
* [ ] Create Next.js app:

  ```powershell
  npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```

  **Answers for prompts:**

  * Use TypeScript? → `Yes`
  * Use Tailwind? → `Yes`
  * Use ESLint? → `Yes`
  * Use `src/` directory? → `Yes`
  * Use App Router? → `Yes`
  * Customize import alias? → `@/*`

---

## 2. Setup Monorepo

* [ ] Create folders:

  ```powershell
  mkdir apps\api
  mkdir core\auth core\db core\observability core\flags
  mkdir modules\company modules\finance modules\shared
  mkdir docs
  mkdir prisma
  mkdir public\images
  ```
* [ ] Update `package.json` (root) with workspaces:

  ```json
  {
    "private": true,
    "workspaces": ["apps/*", "core/*", "modules/*"]
  }
  ```

---

## 3. Setup Database (Postgres + Prisma)

* [ ] Install Postgres locally (choose **ONE**):

  * **Option A:** [Download Installer](https://www.postgresql.org/download/windows/)
  * **Option B:** Chocolatey:

    ```powershell
    choco install postgresql
    ```
* [ ] Install Prisma:

  ```powershell
  npm install -D prisma
  npm install @prisma/client
  npx prisma init
  ```
* [ ] Update `.env`:

  ```
  DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/saas_dev"
  ```

---

## 4. Define Schema

* [ ] Edit `/prisma/schema.prisma` to include:

  ```prisma
  model User {
    id        String   @id @default(cuid())
    email     String   @unique
    name      String?
    companies UserCompany[]
    createdAt DateTime @default(now())
  }

  model Company {
    id        String   @id @default(cuid())
    name      String
    users     UserCompany[]
    customers Customer[]
    createdAt DateTime @default(now())
  }

  model UserCompany {
    id        String   @id @default(cuid())
    userId    String
    companyId String
    role      String

    user    User    @relation(fields: [userId], references: [id])
    company Company @relation(fields: [companyId], references: [id])
  }

  model Customer {
    id        String   @id @default(cuid())
    companyId String
    name      String
    email     String?
    createdAt DateTime @default(now())

    company Company @relation(fields: [companyId], references: [id])
  }

  model EventLog {
    id        String   @id @default(cuid())
    companyId String
    message   String
    createdAt DateTime @default(now())
  }

  model Feedback {
    id        String   @id @default(cuid())
    userId    String
    message   String
    createdAt DateTime @default(now())

    user User @relation(fields: [userId], references: [id])
  }
  ```
* [ ] Run migration:

  ```powershell
  npx prisma migrate dev --name init
  ```

---

## 5. Setup Clerk Auth

* [ ] Install Clerk:

  ```powershell
  npm install @clerk/nextjs
  ```
* [ ] Create app at [Clerk Dashboard](https://dashboard.clerk.com).
* [ ] Add to `.env`:

  ```
  CLERK_SECRET_KEY=your-secret
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-publishable
  ```
* [ ] Wrap layout with Clerk:
  `apps/web/src/app/layout.tsx`

  ```tsx
  import { ClerkProvider } from "@clerk/nextjs";

  export default function RootLayout({ children }) {
    return (
      <ClerkProvider>
        <html lang="en">
          <body>{children}</body>
        </html>
      </ClerkProvider>
    );
  }
  ```

---

## 6. Add Dev Company Switcher

* [ ] Create `/core/auth/CompanyContext.tsx` with mock dropdown switcher for local dev.
* [ ] Use Clerk-backed provider in production.

---

## 7. Add Pages

* [ ] Create basic routes:

  ```powershell
  cd apps/web/src/app
  mkdir landing about faq contact dashboard
  ```
* [ ] Add `page.tsx` in each.

---

## 8. Add Docs

* [ ] Create files:

  ```powershell
  cd docs
  echo "# Product Requirements Document" > MVP_PRD.md
  echo "# Vision" > VISION.md
  echo "# Contribution Guide" > CONTRIBUTING&DEV.md
  echo "# Windsurf Rules" > WINDSURFRULES.json
  echo "# Architecture" > ARCHITECTURE.md
  echo "# Tenanting" > TENANTING.md
  ```

---

## 9. Setup Tailwind UI

* [ ] Install:

  ```powershell
  npm install @headlessui/react @heroicons/react
  npx shadcn-ui init
  ```

---

## 10. Run App

* [ ] Start dev server:

  ```powershell
  npm run dev
  ```
* Default: [http://localhost:3000](http://localhost:3000)
* Change port (optional):

  ```powershell
  set PORT=3009; npm run dev
  ```

---

## 11. Turbopack (Optional)

* [ ] To try Turbopack instead of Webpack (faster but experimental):

  ```powershell
  npm run dev -- --turbo
  ```
* ✅ Default remains Webpack for stability & compatibility.

---

## 12. Future Enhancements

* [ ] Stripe billing (payments, subscriptions).
* [ ] Neon Postgres (production).
* [ ] Observability (EventLog + optional Umami).
* [ ] Feedback form integration.
* [ ] Design system polish.
* [ ] Test harness (Playwright or Vitest).

---

📌 At the end of this checklist you’ll have:
✔️ A multi-tenant SaaS boilerplate (Next.js + Clerk + Prisma + Postgres)
✔️ File structure and docs in place
✔️ Ready for MVP feature development

---