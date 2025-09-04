# Prompt: Comprehensive Review & Finalization of a B2B SaaS Boilerplate
Act as a senior software engineer with 20+ years of experience in full stack development, with a focus on building scalable, maintainable, and secure software systems for b2b companies. You have a deep understanding of modern web development technologies, including Next.js, TypeScript, Prisma, PostgreSQL, and Clerk for authentication. You are experienced in building multi-tenant SaaS applications and have a strong track record of delivering high-quality software solutions.

## 1. High-Level Objective

Review, enhance, and finalize this Next.js multi-tenant SaaS boilerplate repository. The goal of this app  is to produce modern, powerful, clean, functional, and well-documented template that is ready for production use as a starting repo for b2b multi-tenant SaaS applications. The App should be easy to adapt to any b2b multi-tenant SaaS application. Address all identified issues, from architectural gaps to specific bugs, and ensure all core functionalities are working as expected in development mode.

## 2. Project Background

This repository is a boilerplate for building multi-tenant B2B SaaS applications. Key technologies include Next.js, TypeScript, Prisma, PostgreSQL, and Clerk for authentication. A core feature is a development-mode "company switcher" that allows for testing multi-tenant features without requiring live Clerk credentials.

## 3. Primary Objectives

### 3.1. Comprehensive Project Review & Assessment
- **Analyze Project Plans**: Review the Product Requirements Document (`docs/REPO_PRD.md`) and the task list (`docs/TASKS.md`).
- **Current Progress**: Compare the project's current state against the plans and identify any missing features, architectural inconsistencies, or documentation gaps.
- **Review Documentation**: Assess the clarity, completeness, and accuracy of all documentation in the `docs/` directory.
- **Critique Windsurf Rules**: Evaluate the four Windsurf rule files located in `.windsurf/rules/`. Assess their structure, content, and the proposed activation strategy (`docs/WINDSURF_RULES_GUIDE.md`). Recommend improvements for clarity and effectiveness.
- **Review Code and Identify Gaps**: Review the plans/code for any missing features, architectural inconsistencies, or documentation gaps that will prevent this from being an extremely functional, useful and adapatable starting point for a b2b multi-tenant SaaS application.  We do want to keep dependencies to an absolute minimum and not use any paid services unless absolutely necessary.

### 3.2. Fix Critical Authentication Bug: "Company Switcher"
- **Problem**: The application incorrectly redirects to the Clerk sign-in page during development, even when Clerk keys are commented out in the `.env` file. This prevents the use of the local development company switcher.
- **Expected Behavior**: When `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is not present, the application should default to a "keyless" or "development" mode, rendering a mock company switcher UI instead of redirecting to Clerk.
- **Key Files**:
    - `core/auth/company-provider.tsx`: Likely contains the logic that decides between production (Clerk) and development mode.
    - `middleware.ts`: May contain routing logic that incorrectly enforces Clerk authentication.
    - `.env.example`: Shows how Clerk keys are configured.
    - `src/lib/env.ts`: Contains environment variable validation logic that might be causing crashes.
- **Task**: Debug and fix the authentication flow to ensure the development company switcher is used when Clerk keys are not provided.

### 3.3. Resolve Environment & Dependency Errors
- **Problem**: The application fails to run due to missing dependencies (`@upstash/ratelimit`, `@upstash/redis`) and environment variable validation errors (`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXTAUTH_SECRET`).
- **Task**:

    0.  Determine and explain why we have to have these dependencies, or how we can refactor without them.  If we have to have them proceed with teh rest of 3.2, if not, proceed accordingly.
    1.  Install all required dependencies.
    2.  Correct the environment validation logic in `src/lib/env.ts` to be compatible with the keyless development mode (i.e., do not throw errors if Clerk keys are missing when in dev mode).
    3.  Ensure the `NEXTAUTH_SECRET` is correctly configured or generated.

### 3.4. Finalize and Stabilize
- **Goal**: Ensure the application is stable and all core CRUD functionalities are working in development mode.
- **Tasks**:
    1.  After fixing the auth and environment issues, run the application.
    2.  Verify that you can create, read, update, and delete Companies, Customers, and Users using the UI in development mode.
    3.  Address any network errors or bugs encountered during CRUD operations.
    4.  Clean up any remaining console errors or warnings.

## 4. Suggested Workflow

1.  **Install Dependencies**: Begin by running `npm install` to ensure all packages are present.
2.  **Fix Environment Validation**: Address the startup crash by fixing the environment validation logic.
3.  **Fix Auth Bug**: Tackle the company switcher/Clerk redirection issue.
4.  **Verify CRUD**: Test and ensure core application features are working.
5.  **Conduct Review**: With a running application, perform the comprehensive review of docs and code.
6.  **Summarize Findings**: Provide a clear summary of all changes made, issues fixed, and any remaining recommendations.

## 5. Final Deliverable

A fully functional, stable, and well-documented SaaS boilerplate where:
- The development server starts and serves all completed pages without errors.
- The development company switcher works correctly without redirecting to Clerk.
- Core CRUD operations for key models are functional.
- All high-priority issues identified during the review are addressed.
