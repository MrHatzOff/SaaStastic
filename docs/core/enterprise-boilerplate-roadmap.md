# Enterprise Boilerplate Roadmap

A living plan for evolving SaaStastic into a fully featured enterprise SaaS boilerplate. Status icons use ✅ (complete), 🟨 (in progress), and ⬜ (not started).

## Application Snapshot
- ✅ **Product Scope** — Multi-tenant B2B SaaS covering marketing, onboarding, billing, and team collaboration with Clerk + Stripe + PostgreSQL.
- ✅ **Architecture Pattern** — Next.js App Router with `src/core/`, `src/features/`, and `src/shared/` separation, enforcing company scoping and RBAC.
- 🟨 **Operational Maturity** — Solid development workflows established; observability and production support playbooks are partially defined.

## Status Dashboard
- ✅ **Core Platform** — Authentication, marketing site, onboarding flow, and tenant-aware dashboard delivered.
- ✅ **Revenue & Billing** — Stripe checkout, subscription lifecycle, and webhook handling with RBAC coverage in place.
- ✅ **Tenant Security** — 29-permission RBAC system, with API middleware and frontend guards enforcing company isolation.
- 🟨 **Team Collaboration** — Enhanced team management UI, invitations, and audit dashboards shipping incrementally.
- ⬜ **Support & Operations** — Admin support portal, real-time health monitoring, and self-service analytics pending.

## Feature Roadmap
### Completed Foundations
- ✅ **Authentication & Identity** — Clerk integration with user-company sync, protected routes, and tenant guards.
- ✅ **Billing & Monetization** — Subscription plans, webhook processing, and customer billing portal access.
- ✅ **RBAC Core** — Role/permission schema, provisioning logic, middleware, and permission-aware UI helpers.

### Remaining Feature Enhancements
- 🟨 **Team Collaboration Enhancements** — Complete invite modal UX, bulk role reassignment, and activity dashboards in `src/features/users/`.
- ⬜ **Customer Support Portal** — Build secure impersonation tools, ticketing workflows, and audit viewers under `src/features/support/`.
- ⬜ **Customer Lifecycle Automation** — Add churn recovery emails, usage limits, and entitlement checks across modules.

## Infrastructure & Operations
- ✅ **Database Foundation** — Prisma schema with company scoping, soft deletes, audit fields, and role provisioning helpers.
- ✅ **Continuous Quality** — TypeScript strict mode, ESLint clean state, and structured documentation workflows.
- 🟨 **Observability Stack** — Define logging, metrics, and tracing contracts inside `src/core/observability/`, including Sentry integration.
- ⬜ **Operational Runbooks** — Author incident response guides, deployment playbooks, and tenant onboarding automation scripts.
- ⬜ **Background Processing** — Introduce job queue/workers (e.g., BullMQ) for email, billing reconciliation, and audit exports.

## Security & Compliance
- ✅ **Tenant Isolation** — Verified company scoping for all database interactions plus automated role seeding during company creation.
- ✅ **Input Validation** — Zod schema coverage for API routes and server actions with consistent error handling responses.
- 🟨 **Rate Limiting & CSRF Hardening** — Expand middleware to cover all state-changing endpoints and document configuration knobs.
- ⬜ **Compliance Tooling** — Add exportable audit logs, data retention policies, and configurable security headers (CSP, HSTS).
- ⬜ **Secrets Management** — Document rotation procedures and recommend vault integration for production deployments.

## Testing & Quality Gates
- ✅ **Static Analysis** — ESLint, TypeScript, and pre-commit validations run cleanly.
- 🟨 **Automated Regression** — Expand Playwright suites to cover RBAC edge cases, billing flows, and invitation journeys.
- ⬜ **Integration & Load Testing** — Add Prisma-backed integration tests, contract tests for webhooks, and load tests simulating multi-tenant spikes.
- ⬜ **Release Validation** — Establish checklist: `npm run lint`, `npm run test`, `npm run build`, targeted smoke tests, and database migration dry-runs.

## Documentation & Workflows
- 🟨 **Feature Guides** — Continue enriching `docs/users/guides/` (e.g., RBAC setup) with end-to-end walkthroughs for each module.
- ⬜ **Operations Handbook** — Produce support guides, SLA definitions, and escalation paths for future customer success teams.

### ✅ Recently Completed
- **RBAC Provisioner** (`src/core/rbac/`): ✅ **COMPLETE** - Implemented `provisionSystemRolesForCompany(companyId, tx)` helper that runs during company creation to automatically provision Owner/Admin/Member/Viewer roles with correct permission sets. Fully idempotent via unique constraints. Integration tested and working.

## Action Checklist
- 🟨 **Finalize Team Management UI** — Complete UI polish, accessibility, and QA for bulk actions and invitations.
- ⬜ **Build Support Portal MVP** — Add impersonation guardrails, ticket intake, and activity replay tools.
- ⬜ **Harden Security Middleware** — Universal rate limiting, CSRF tokens, security headers, and CORS presets documented and enforced.
- ⬜ **Expand Automated Testing** — Achieve >80% coverage on critical paths, load test multi-tenant scenarios, and automate release gates.
- ⬜ **Author Operations Playbooks** — Document deployment, rollback, incident response, and tenant lifecycle procedures.

{{ ... }}
- ⬜ **Run Full Regression Suite** — Execute unit, integration, and E2E tests before milestone sign-off.
- ⬜ **Verify Database Migrations** — Use `prisma migrate dev` and shadow database checks for every schema change.
- ⬜ **Perform Security Review** — Review RBAC rules, audit logs, and middleware coverage prior to release.
- ⬜ **Update Documentation** — Sync `docs/core/` and workflow files after delivering each major feature or infrastructure capability.

---
*Last updated: September 27, 2025*
