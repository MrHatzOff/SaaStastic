# SaaStastic Engineering Standards & Workflows (Proposed)

## 🧑‍💻 Coding Standards
- **Type Safety**: TypeScript strict mode, zero `any`, infer types via Zod schemas when possible.
- **Naming**: Components `PascalCase`, utilities `camelCase`, constants `SCREAMING_SNAKE_CASE`, file naming `kebab-case` (non-components).
- **Imports**: External libs → internal shared packages → relative imports.
- **React Components**: Hooks first, loading/error states, accessibility semantics, test IDs when warranted.
- **API Routes**: Wrap with `withApiMiddleware`, validate with Zod, audit log sensitive operations, sanitize responses.
- **Error Handling**: Use `handleApiError()` helper; never leak stack traces.
- **Security**: No secrets in repo, tenant isolation mandatory, CSRF + rate limiting via middleware.

## 📁 Directory Expectations
- **Modules**: Each domain module owns `components/`, `services/`, `schemas/`, `types/`, `hooks/`.
- **Shared**: Everything cross-domain lives in `modules/shared/` or `src/lib/shared/`.
- **Docs**: Curated per `documentation-usage-guide.md`; archive outdated material.

## 🔄 Development Workflow
1. Read `documentation-usage-guide.md` to confirm current source of truth.
2. Create ADR (architecture decision record) if deviating from established patterns.
3. Implement feature using module structure and coding standards.
4. Update relevant docs/workflows with new behavior and acceptance criteria.
5. Run `npm run lint`, `npm run test`, `npx tsc --noEmit`, `npx playwright test`.
6. Submit PR with checklist: tenant isolation verified, tests added, documentation updated.

## 🧪 Testing Expectations
- Unit tests for services/helpers (Vitest).
- Integration tests for API routes (Vitest + Prisma test DB).
- E2E coverage for critical flows (Playwright).
- Snapshot tests only for stable visual components.

## 🛡️ Security Checklist
- Input validation with Zod.
- Output sanitization when rendering user input.
- Rate limiting & CSRF enforcement via middleware.
- Audit logging for CRUD actions on sensitive resources.
- Soft deletes + audit fields on all tenant data models.

## 📈 Observability & Operations
- Use structured logger in `core/observability/` for production logging.
- Trace key business events to PostHog (Phase 3).
- Capture errors in Sentry with tenant context metadata.

## ✅ Review Checklist
- Tenant isolation enforced?
- Error and loading states implemented?
- Tests updated/passing?
- Documentation/workflows refreshed?
- Security checklist satisfied?

---
*Replaces `.windsurf/rules/coding-standards.md`, `.windsurf/rules/rules.md`, and `.windsurf/workflows/api-development.md` by providing a single authoritative engineering guide.*
