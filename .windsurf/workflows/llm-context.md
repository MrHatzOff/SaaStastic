---
name: llm-context
description: Provides essential context for LLMs working on SaaStastic
priority: high
trigger: manual
---

# 🧠 SaaStastic LLM Context

## 🏗️ Core Architecture Principles

### Multi-tenancy (NON-NEGOTIABLE)
- **Every** database query MUST include `companyId`
- Use `withApiMiddleware` for all API routes
- Never expose data across tenant boundaries

### Data Handling
- Always use soft deletes (`deletedAt` field)
- Maintain audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- Validate all inputs with Zod

---

## 📚 Key Documentation

1. **Architecture**
   - Location: `docs/core/architecture-blueprint.md`
   - Purpose: Canonical system design, patterns, and guardrails

2. **Product Requirements**
   - Location: `docs/core/product-status.md`
   - Purpose: Current implementation status, priorities, and roadmap

3. **Coding Standards**
   - Location: `.windsurf/rules/coding-standards.md`
   - Purpose: Code style and patterns

---

## 🚨 Critical Decision Framework

### When Changing Database Schema
1. Check impact on multi-tenancy
2. Add/update migrations
3. Update Prisma client
4. Update related API endpoints

### When Adding API Endpoints
1. Use `withApiMiddleware`
2. Validate inputs with Zod
3. Handle errors gracefully
4. Document the endpoint

### When Fixing TypeScript Errors
1. Never use `any` type
2. Fix root cause, don't suppress
3. Add proper type guards
4. Update related types if needed

---

## 💡 Pro Tips

- Run `npx tsc --noEmit` to catch type errors
- Check tenant isolation in all database queries
- Use the shared UI components from `components/shared`
- Follow the established patterns in similar files

---

🔍 **Remember**: When in doubt, ask for clarification rather than making assumptions.
