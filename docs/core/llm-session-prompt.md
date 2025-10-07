# Cascade Session Prompt – RBAC Provisioning Helper

Copy everything in this file into the FIRST message when opening a fresh Cascade chat.

---

## 📚 Required Context
- Review `docs/core/llm-system-context.md` for full product vision, architecture rules, RBAC patterns, and coding standards.
- Keep `docs/core/architecture/rbac-spec.md` open for schema details, default permissions, and middleware flow.
- Reference `docs/core/enterprise-boilerplate-roadmap.md` to understand current status and outstanding enterprise tasks.

## 🧭 Current Objective
Implement an idempotent RBAC provisioning helper that runs during company creation so every tenant automatically receives the four system roles with the correct permission sets.

## 🛠️ Task Scope
1. Create `src/core/rbac/provisioner.ts` (or equivalent) that exports `provisionSystemRolesForCompany(companyId, tx)`.
2. Ensure the helper:
   - Reads default role definitions from a centralized template (create `src/core/rbac/default-roles.ts` if needed).
   - Executes inside an existing Prisma transaction (`tx` parameter) and is safe to call multiple times.
   - Enforces uniqueness (e.g., unique constraint on `(companyId, slug)` and `upsert` logic) to avoid duplicate roles.
3. Update the company creation workflow (likely `src/features/companies/services/create-company-service.ts` or equivalent) to invoke the helper within the same transaction.
4. Add/adjust tests or scripts validating that new companies receive Owner/Admin/Member/Viewer roles with the correct 29-permission assignments.
5. Document the flow in `docs/users/guides/rbac-setup-guide.md` and append a note to `docs/core/llm-system-context.md` under RBAC to reflect the new helper location.

## ✅ Acceptance Criteria
- New companies automatically have the four system roles populated.
- Re-running the provisioning helper does not create duplicates or throw (idempotent behavior proven).
- Existing role seeding scripts (`scripts/seed-rbac.ts`) reuse the shared template to avoid divergence.
- Updated documentation clearly points to `src/core/rbac/` as the RBAC infrastructure home.

## 🔬 Verification Checklist
- Run `npx tsc --noEmit`.
- Run relevant Vitest/Playwright suites touching company creation or RBAC (`npm run test` or targeted command if available).
- If schema changes are required, run `npx prisma migrate dev --name rbac-role-provisioner` and update docs accordingly.

## 📄 Deliverables
- Code changes for helper, transaction integration, and updated seeds/tests.
- Documentation updates (`docs/users/guides/rbac-setup-guide.md`, `docs/core/llm-system-context.md`).
- Summary message describing implementation details, tests executed, and any follow-up work.

---

_End of prompt. Paste into new Cascade chat as-is and then wait for the assistant to respond._
