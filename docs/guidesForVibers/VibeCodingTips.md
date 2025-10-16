# 🧩 SaaStastic AI Coding Prompts - Puzzle Pieces on Steroids

**Purpose**: This file contains copy-paste prompt "puzzle pieces" that you can stack together to create powerful, context-rich AI coding sessions. Each piece provides specific context or requests specific actions.

---

## 🎯 How to Use This File

### **The Puzzle Piece Concept**

Think of each prompt section as a LEGO brick. You **stack them together** to give your AI assistant:
1. ✅ **Perfect Context** - What they need to know
2. ✅ **Clear Task** - What you want them to do
3. ✅ **Quality Constraints** - How to do it right

### **Basic Pattern**
```
[CONTEXT PIECE] + [TASK PIECE] + [QUALITY PIECE] = Great Result
```

### **Example Session**
```markdown
Copy this:
├─ 🧩 General Onboarding (gives full context)
├─ 🧩 Multi-Tenant Security Reminder (ensures safety)
└─ 🧩 Your Specific Task (what you want built)

Paste all three together in one message to your AI.
```

---

## 📦 SECTION 1: Context & Onboarding Pieces

### 🧩 **P1.1 - Full Onboarding Template**
**When to use**: Starting any new chat session
**Copy this:**

```
Hello and welcome to the SaaStastic team! 🚀

Before we begin, please get acquainted with our codebase:

**MANDATORY READING** (Read these files in this order):
1. 📄 `GUIDES/00_LLM_CONTEXT.md` - Complete project overview, architecture, and patterns
2. 📄 `docs/guidesForVibers/LLM_ONBOARDING_CONTEXT.md` - AI-specific implementation rules
3. 📄 `.windsurf/rules/architecture.md` - Non-negotiable security rules

**KEY PRINCIPLES**:
- ✅ This is a multi-tenant B2B SaaS boilerplate
- ✅ EVERY database query MUST include `companyId`
- ✅ ALL API routes MUST use `withPermissions()` wrapper
- ✅ Create new features in `src/features/custom/` (safe zone)
- ❌ NEVER modify `src/core/` files

**CURRENT STACK**:
- Frontend: Next.js 15, React 19, TypeScript 5
- Backend: Next.js API Routes with RBAC middleware
- Database: PostgreSQL + Prisma ORM 6
- Auth: Clerk (multi-tenant aware)
- Payments: Stripe
- Styling: TailwindCSS 4 + shadcn/ui

Ready to help? Let me know what you'd like to build!
```

---

### 🧩 **P1.2 - Quick Context Reminder**
**When to use**: Mid-session when AI seems to forget the architecture
**Copy this:**

```
Quick reminder of our SaaStastic architecture:
- Multi-tenant: ALWAYS scope by `companyId`
- Security: ALL APIs need `withPermissions()` wrapper
- Validation: Use Zod schemas for all inputs
- Safe Zone: New features go in `src/features/custom/`
- Database: Prisma with audit fields (createdAt, updatedAt, createdBy, deletedAt)
```

---

### 🧩 **P1.3 - Security Principles Reinforcement**
**When to use**: Before implementing database queries or API routes
**Copy this:**

```
⚠️ CRITICAL SECURITY REQUIREMENTS:

1. **Multi-Tenant Isolation**:
   - EVERY query MUST have: `where: { companyId: context.companyId }`
   - Never trust client-provided IDs without validation
   
2. **Permission Checks**:
   - Wrap ALL API routes with `withPermissions([PERMISSIONS.X])`
   - Frontend: Use `<PermissionGuard>` for conditional rendering
   
3. **Input Validation**:
   - Define Zod schema for ALL user inputs
   - Parse with `.parse()` not `.safeParse()` (let errors bubble)

4. **Audit Trail**:
   - Include: createdBy, updatedBy, createdAt, updatedAt
   - Use soft deletes: deletedAt field instead of hard delete
```

---

## 📦 SECTION 2: Task-Specific Prompt Pieces

### 🧩 **P2.1 - Create Database Model**
**When to use**: Adding new tables/models to Prisma schema
**Copy this:**

```
Create a Prisma model for [FEATURE_NAME].

Requirements:
- Model name: [ModelName] (PascalCase)
- Fields needed: [list your specific fields]
- MUST include: companyId (String), createdAt, updatedAt, createdBy, updatedBy, deletedAt
- Add relation to Company model
- Add indexes: @@index([companyId]), @@index([deletedAt])
- Follow existing pattern in prisma/schema.prisma

After creating the model:
1. Run: npx prisma migrate dev --name add_[model_name]
2. Run: npx prisma generate
```

---

### 🧩 **P2.2 - Create API Route**
**When to use**: Building new backend endpoints
**Copy this:**

```
Create a Next.js 15 API route for [ACTION] on [RESOURCE].

Requirements:
- Location: src/app/api/custom/[feature]/[action]/route.ts
- Use: withPermissions() wrapper
- Required permission: [PERMISSIONS.X]
- Zod validation schema for input
- Scope ALL queries by companyId
- Return NextResponse.json() with consistent format
- Handle errors properly (400 for validation, 500 for server errors)
- TypeScript strict mode compliant

Pattern to follow: Look at src/app/api/users/team/route.ts
```

---

### 🧩 **P2.3 - Create React Component**
**When to use**: Building UI components
**Copy this:**

```
Create a React component for [FEATURE_NAME].

Requirements:
- Component name: [ComponentName] (PascalCase)
- Location: src/features/custom/[feature]/components/
- Use TypeScript with proper interface for props
- Styling: TailwindCSS classes (follow existing patterns)
- UI components: Reuse from src/shared/ui/ (shadcn/ui)
- Handle loading and error states
- Use proper semantic HTML and accessibility attributes
- If permission-gated: Wrap in <PermissionGuard permission={PERMISSIONS.X}>

Design style: Match existing SaaStastic components (clean, modern, professional)
```

---

### 🧩 **P2.4 - Create Page Route**
**When to use**: Adding new pages to the app
**Copy this:**

```
Create a Next.js 15 page for [FEATURE_NAME].

Requirements:
- Location: src/app/(app)/custom/[feature]/page.tsx
- Server component (default Next.js 15 pattern)
- Add authentication check: await auth() from '@clerk/nextjs/server'
- Redirect if not authenticated
- Add metadata export (title, description)
- Import components from src/features/custom/[feature]/components/
- Use DashboardLayout or create custom layout

Include proper TypeScript types and follow Next.js 15 App Router conventions.
```

---

### 🧩 **P2.5 - Add Server Action**
**When to use**: Creating form handlers or server mutations
**Copy this:**

```
Create a server action for [ACTION_NAME].

Requirements:
- Location: src/lib/actions/custom/[feature]-actions.ts
- Add 'use server' directive at top
- Get tenant context: const { companyId, userId } = await requireTenantContext()
- Zod validation for inputs
- Database operation scoped by companyId
- Return type-safe result object
- Handle errors with try/catch
- Add to audit log if significant action

Follow pattern in src/lib/actions/ existing files.
```

---

## 📦 SECTION 3: Feature-Specific Puzzle Pieces

### 🧩 **P3.1 - Add Custom Permission**
**When to use**: Need new permission beyond the 29 built-in ones
**Copy this:**

```
Add custom permissions for [FEATURE_NAME].

Steps:
1. Create: src/features/custom/[feature]/lib/permissions.ts
2. Define permissions:
   ```typescript
   export const CUSTOM_PERMISSIONS = {
     [FEATURE]_CREATE: 'custom:[feature]:create',
     [FEATURE]_READ: 'custom:[feature]:read',
     [FEATURE]_UPDATE: 'custom:[feature]:update',
     [FEATURE]_DELETE: 'custom:[feature]:delete',
   } as const;
   ```
3. Insert into database manually OR create seed script
4. Assign to roles via admin dashboard

DO NOT modify src/shared/lib/permissions.ts - keep custom permissions separate.
```

---

### 🧩 **P3.2 - Add Stripe Integration Feature**
**When to use**: Extending billing capabilities
**Copy this:**

```
Extend Stripe integration for [FEATURE_NAME].

Requirements:
- Read GUIDES/07_STRIPE_CUSTOMIZATION.md first
- Webhook handler: src/app/api/webhooks/stripe/route.ts
- Service layer: src/modules/billing/services/
- Use existing Stripe client from @/modules/billing/services/stripe-service
- Add proper webhook signature verification
- Update Subscription or Invoice models if needed
- Test with Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe

Keep consistent with existing patterns in billing module.
```

---

### 🧩 **P3.3 - Add Email Feature**
**When to use**: Implementing transactional emails
**Copy this:**

```
Add email functionality for [EMAIL_TYPE].

Requirements:
- Provider: Resend (configured in .env.local)
- Template location: src/features/custom/[feature]/templates/
- Use React Email for templates (HTML + text versions)
- Send function: src/features/custom/[feature]/services/email-service.ts
- Queue mechanism: Consider adding job queue for production
- Include unsubscribe link if marketing email
- Log sent emails in database for audit trail

Check GUIDES/11_OPTIONAL_INTEGRATIONS.md for Resend setup.
```

---

## 📦 SECTION 4: Debugging & Problem-Solving Pieces

### 🧩 **P4.1 - Debug Authentication Issue**
**When to use**: Getting 401 errors or auth not working
**Copy this:**

```
Debug authentication issue: [describe the problem]

Checklist to verify:
1. Is Clerk properly configured? Check .env.local for CLERK_SECRET_KEY
2. Is the middleware running? Check src/middleware.ts
3. API route using: `await auth()` from '@clerk/nextjs/server'?
4. User exists in database? Check User table
5. UserCompany relation exists? Check UserCompany table
6. Company context being passed? Look at company-provider.tsx
7. Browser console errors? Check Network tab for 401 responses

Common fixes:
- Clear .clerk cache and restart dev server
- Verify Clerk webhook is receiving events
- Check that auth() is awaited (Clerk 6.x requirement)
```

---

### 🧩 **P4.2 - Debug Permission Denied**
**When to use**: Getting 403 Forbidden errors
**Copy this:**

```
Debug permission denied error for [action/route].

Steps to diagnose:
1. Check what permission is required: Look at API route withPermissions([X])
2. Check user's permissions: Query database or call /api/users/permissions
3. Verify user has correct role: Check UserCompany.roleId
4. Check role has permission: Query RoleModel permissions relation
5. Frontend: Use usePermissions() hook to see client-side permissions

Quick database check:
```sql
SELECT u.email, r.name as role, p.key as permission
FROM "User" u
JOIN "UserCompany" uc ON u.id = uc."userId"
JOIN "roles" r ON uc."roleId" = r.id
JOIN "_RolePermissions" rp ON r.id = rp."A"
JOIN "permissions" p ON rp."B" = p.id
WHERE u.id = '[user-id]' AND uc."companyId" = '[company-id]';
```

Solution: Either grant permission to role OR assign user a role with permission.
```

---

### 🧩 **P4.3 - Debug TypeScript Errors**
**When to use**: Build failing with type errors
**Copy this:**

```
Fix TypeScript errors in [file/component].

Troubleshooting steps:
1. Run: npx tsc --noEmit (shows all errors)
2. Check Prisma client: npx prisma generate (regenerate types)
3. Verify imports are correct (no missing exports)
4. Check tsconfig.json paths are correct
5. Restart TS server in IDE
6. Clear .next folder: rm -rf .next && npm run dev

Common issues:
- Prisma client out of sync: Run prisma generate
- Missing types: npm install @types/[package]
- Circular imports: Refactor import structure
```

---

## 📦 SECTION 5: Full Feature Build Combinations

### 🧩 **P5.1 - Complete CRUD Feature**
**When to use**: Building a full Create, Read, Update, Delete feature
**Stack these together:**

```
[Copy P1.1 - Full Onboarding]

I want to build a complete CRUD feature for [RESOURCE_NAME].

[Copy P1.3 - Security Principles]

Please implement:

1. [Copy P2.1 - Database Model] for [ResourceName]
   Fields: [list all fields you need]

2. [Copy P2.2 - API Routes] for:
   - POST /api/custom/[resource] (create)
   - GET /api/custom/[resource] (list)
   - GET /api/custom/[resource]/[id] (get one)
   - PATCH /api/custom/[resource]/[id] (update)
   - DELETE /api/custom/[resource]/[id] (soft delete)

3. [Copy P2.3 - React Components] for:
   - [Resource]List (table view)
   - [Resource]Card (single item display)
   - Create[Resource]Modal (form)
   - Edit[Resource]Modal (form)

4. [Copy P2.4 - Page Route] at /custom/[resource]

Ensure everything follows SaaStastic patterns with proper multi-tenant scoping and RBAC.
```

---

### 🧩 **P5.2 - Add Third-Party Integration**
**When to use**: Integrating external APIs or services
**Stack these:**

```
[Copy P1.1 - Full Onboarding]

I want to integrate [SERVICE_NAME] into SaaStastic.

[Copy P1.3 - Security Principles]

Requirements:
1. API Key storage: .env.local (NEVER commit to git)
2. Service wrapper: src/features/custom/integrations/[service]/
3. API client class with methods for main operations
4. Error handling for external API failures
5. Rate limiting awareness
6. Webhook handler if service sends webhooks (src/app/api/webhooks/[service]/)
7. Database model to store sync data/state
8. UI to configure integration (settings page)

Follow the Stripe integration pattern in src/modules/billing/ as reference.
```

---

## 📦 SECTION 6: Quality & Testing Pieces

### 🧩 **P6.1 - Add Tests**
**When to use**: Adding test coverage for your feature
**Copy this:**

```
Add tests for [FEATURE_NAME].

Requirements:
1. Unit tests: tests/unit/[feature].test.ts
   - Test service functions
   - Test utility functions
   - Mock database calls

2. API tests: tests/integration/api/[feature].test.ts
   - Test all endpoints
   - Test permission checks
   - Test validation errors
   - Test multi-tenant isolation

3. E2E tests (if applicable): tests/e2e/[feature].spec.ts
   - Test user workflows
   - Use Playwright
   - Test happy path + error cases

Run tests:
- Unit: npm run test
- E2E: npx playwright test

Follow patterns in existing test files.
```

---

### 🧩 **P6.2 - Code Review Request**
**When to use**: Before committing major changes
**Copy this:**

```
Please review this code for:

✅ **Security**:
- All queries scoped by companyId?
- Permission checks on API routes?
- Input validation with Zod?
- No SQL injection vulnerabilities?

✅ **Code Quality**:
- TypeScript strict mode compliant?
- No 'any' types?
- Proper error handling?
- Consistent naming conventions?

✅ **Performance**:
- Database indexes on companyId?
- No N+1 queries?
- Proper pagination for lists?

✅ **Maintainability**:
- Code is DRY (Don't Repeat Yourself)?
- Functions are single-purpose?
- Comments for complex logic?
- Follows existing patterns?

Flag any issues and suggest improvements.
```

---

## 🎯 Pro Tips for Maximum AI Productivity

### **1. Start Every Session with Context**
Always begin with P1.1 (Full Onboarding). Even experienced AIs benefit from context refresh.

### **2. Stack for Specificity**
```
Generic: "Build a CRM"  ❌ (Too vague)
Specific: [P1.1 + P1.3 + P5.1 + P6.1]  ✅ (Clear requirements)
```

### **3. Reference Existing Code**
Add to any prompt: "Follow the pattern in src/app/api/users/team/route.ts"

### **4. Be Explicit About Safety**
When in doubt, add: "Create this in src/features/custom/ to keep it safe from core updates."

### **5. Request Incremental Delivery**
For large features: "Let's build this in phases. Start with the database model and API routes."

### **6. Ask for Explanations**
Add: "Explain your implementation decisions and any trade-offs."

---

## 📚 Quick Reference Card

```
┌─────────────────────────────────────────┐
│  SAASTASTIC AI CODING CHEAT SHEET       │
├─────────────────────────────────────────┤
│ START SESSION:      Use P1.1            │
│ ADD SECURITY:       Use P1.3            │
│ DATABASE MODEL:     Use P2.1            │
│ API ROUTE:          Use P2.2            │
│ REACT COMPONENT:    Use P2.3            │
│ NEW PAGE:           Use P2.4            │
│ FULL CRUD:          Use P5.1            │
│ DEBUG AUTH:         Use P4.1            │
│ DEBUG PERMISSIONS:  Use P4.2            │
│ CODE REVIEW:        Use P6.2            │
└─────────────────────────────────────────┘
```

---

## 📦 SECTION 7: Feature Development Workflow (Ryan Carson Method)

**What is this?** A systematic approach to building complex features with AI. Based on the ai-dev-tasks system by Ryan Carson (Apache 2.0).

**Full Documentation**: `docs/guidesForVibers/WORKFLOWS/`

### **The Three-Phase Process**

**Phase 1: Create PRD** → Define requirements collaboratively  
**Phase 2: Generate Tasks** → Break down into steps  
**Phase 3: Execute** → Implement with quality gates

---

### 🧩 **P7.1 - Quick Start: Feature PRD**

**When to use**: Planning complex features (CRM, inventory system, reporting)

**Copy this:**

```
I want to build [FEATURE_NAME] for SaaStastic.

Please help me create a Product Requirements Document using this process:

1. Read: docs/guidesForVibers/WORKFLOWS/create-prd.md
2. Read: GUIDES/00_ARCHITECTURE_GUIDE.md (understand SaaStastic patterns)
3. Read: DEVELOPMENT_RULES/architecture.md (security requirements)

Ask me clarifying questions about:
- User stories and goals
- Multi-tenant requirements (how does companyId scoping work?)
- Permission requirements (what RBAC permissions are needed?)
- Data model needs (what tables/fields?)
- UI/UX expectations (what should users see?)
- Integration points (APIs, webhooks, etc.)

After I answer, generate a comprehensive PRD following the SaaStastic template.

Let's start with your clarifying questions.
```

---

### 🧩 **P7.2 - Generate Implementation Tasks**

**When to use**: You have a completed PRD and ready to implement

**Copy this:**

```
I have a completed PRD at tasks/prd-[feature-name].md

Please follow the task generation process from docs/guidesForVibers/WORKFLOWS/generate-tasks.md

Requirements:
1. Read the PRD thoroughly
2. Assess current SaaStastic codebase for existing patterns
3. Generate high-level parent tasks first
4. Wait for my approval
5. Then generate detailed sub-tasks for each parent task

SaaStastic-specific requirements:
- All features go in src/features/custom/
- All database models must include companyId
- All API routes must use withPermissions()
- Follow patterns in DEVELOPMENT_RULES/architecture.md

Ready? Start with the high-level tasks.
```

---

### 🧩 **P7.3 - Execute Task-by-Task**

**When to use**: Tasks generated, ready to implement

**Copy this:**

```
Let's implement the feature using tasks-prd-[feature-name].md

Follow the execution protocol from docs/guidesForVibers/WORKFLOWS/process-tasks.md

Rules:
1. Implement ONE sub-task at a time
2. After completing each sub-task:
   - Mark it [x] in the task list
   - Ask me for approval before proceeding
3. After completing ALL sub-tasks in a parent task:
   - Run: npm run test
   - If tests pass: git add . && git commit
   - Mark parent task [x]

Security checklist for EVERY sub-task:
- [ ] Multi-tenant: queries include companyId?
- [ ] RBAC: API routes use withPermissions()?
- [ ] Validation: inputs validated with Zod?
- [ ] TypeScript: no 'any' types?
- [ ] Tests: critical paths tested?

Ready to start with sub-task 1.1?
```

---

### 🎯 When to Use Each Phase

| Phase | Use For | Don't Use For |
|-------|---------|---------------|
| **PRD** | Complex features, unclear requirements | Simple UI changes, bug fixes |
| **Tasks** | Multi-step implementation | Single-file modifications |
| **Execute** | Building from scratch | Minor tweaks |

---

### 💡 Pro Tips for Workflow Success

**1. Front-Load Clarity**
Spend time on PRD questions. 30 minutes of planning saves hours of refactoring.

**2. Reference Existing Features**
In your PRD: "Similar to the customer module, but for..."

**3. Break Down Large Tasks**
If a sub-task seems too big, ask: "Break sub-task 2.3 into smaller pieces"

**4. Don't Skip Tests**
The test-then-commit protocol catches bugs early and ensures quality.

**5. Save PRDs and Tasks**
These files are your documentation. Keep them in `/tasks/` directory.

---

### 📊 Workflow vs. Puzzle Pieces

**Use Puzzle Pieces (Sections 1-6)** when:
- Quick feature additions
- You know exactly what you want
- Single-file changes
- Copy-paste and adapt approach

**Use Workflow System (Section 7)** when:
- Complex features with multiple moving parts
- Requirements need clarification
- Learning SaaStastic architecture
- Systematic, step-by-step approach needed

**Use Both**: Start with workflow for planning, use puzzle pieces during implementation!

---

### 🎓 Example: Building a CRM Module

**Phase 1: PRD (15 minutes)**
```
[Use P7.1]
- Clarifying questions about CRM needs
- Document: contacts, companies, deals, activities
- RBAC: Member and above can access
- UI: List view, detail view, forms
```

**Phase 2: Tasks (10 minutes)**
```
[Use P7.2]
Parent Tasks:
1.0 Database Schema (4 sub-tasks)
2.0 API Routes (8 sub-tasks)
3.0 React Components (6 sub-tasks)
4.0 Tests (3 sub-tasks)
```

**Phase 3: Execute (2-4 hours)**
```
[Use P7.3]
1.1 Create Contact model ✅
1.2 Create Company model ✅
[Test] → [Commit] → [Next parent task]
```

**Result**: Fully-functional CRM module with proper security, testing, and documentation.

---

### 🔗 Related Resources

- **Full Workflow Docs**: `docs/guidesForVibers/WORKFLOWS/`
- **Ryan Carson Attribution**: `docs/guidesForVibers/WORKFLOWS/ATTRIBUTION.md`
- **SaaStastic Architecture**: `GUIDES/00_ARCHITECTURE_GUIDE.md`
- **Development Rules**: `DEVELOPMENT_RULES/architecture.md`

---

**Last Updated**: October 14, 2025  
**Version**: 2.0 (Puzzle Pieces on Steroids Edition)  
**Maintained by**: SaaStastic Team

*Happy Building! 🚀*