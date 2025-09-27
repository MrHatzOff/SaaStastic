# SaaStastic Technical Workflows (Proposed)

## 🧠 LLM / Developer Onboarding
1. Read `product-vision-and-roadmap.md` → understand mission, phases, success metrics.
2. Read `architecture-blueprint.md` → internalize system boundaries, guardrails, and planned evolution.
3. Read `coding-standards-and-workflows.md` → memorize coding + security standards.
4. Pull repo, install deps with `npm install`, configure `.env` from `env.example`.
5. Run `npm run lint`, `npm run test`, `npx tsc --noEmit`, `npx playwright test` to verify local environment.
6. Review open issues/board; pick tasks aligned with current phase and acceptance criteria.

## 🚀 Feature & API Development Flow
1. Confirm requirement in PRD phase tracker and create ADR if pattern deviation.
2. Design contract: schema definition, response shape, tenant isolation checks.
3. Implement API route using `withApiMiddleware`, Zod validation, audit logging.
4. Build/adjust module UI + hooks; ensure loading/error states, accessibility.
5. Add tests: unit (service/helpers), integration (API), E2E (critical flows).
6. Update docs + changelog; confirm acceptance criteria.
7. Run full QA command suite before PR.

## 🗃️ Database Schema Change Flow
1. Document intent and impact (models, relations, indexes, security) in ADR.
2. Update `prisma/schema.prisma` with required fields (`companyId`, audit fields, soft delete).
3. Generate migration: `npx prisma migrate dev --name <change>`.
4. Validate data impact; add seeds/data migration if needed.
5. Run `npx prisma generate` and update affected services/tests.
6. Execute QA suite; update docs and observability alerts if new telemetry.

## 🚢 Release & Operations
1. Merge to main triggers CI (lint, type, test, migrate, Playwright).
2. Deploy preview → smoke test marketing/app routes.
3. Verify Stripe webhook + Clerk integration in staging.
4. Review Sentry/PostHog dashboards for regressions (Phase 3+).
5. Promote to production after sign-off; monitor health + audit logs.
6. Capture retrospective notes for next iteration.

---
*Supersedes `.windsurf/workflows/llm-context.md`, `.windsurf/workflows/api-development.md`, and `.windsurf/workflows/database-changes.md`, delivering a concise, end-to-end workflow reference.*
