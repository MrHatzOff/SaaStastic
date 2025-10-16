# 🤖 Claude Code (Cline) Setup for SaaStastic

**Claude Code** (formerly Cline) is a VS Code extension that uses Claude 3.5 Sonnet for coding assistance. Excellent for following complex architectural patterns.

---

## 📦 Installation

### **Step 1: Install VS Code**
If you don't have it already:
1. Download from [https://code.visualstudio.com](https://code.visualstudio.com)
2. Install for your platform

### **Step 2: Install Cline Extension**
1. Open VS Code
2. Go to Extensions (Ctrl/Cmd + Shift + X)
3. Search for "Cline"
4. Click Install
5. Restart VS Code

### **Step 3: Configure API Key**
1. Get Claude API key from [https://console.anthropic.com](https://console.anthropic.com)
2. Open Cline settings (click Cline icon in sidebar)
3. Enter your API key
4. Select Claude 3.5 Sonnet as model

---

## ⚙️ Configure Rules for Cline

### **Method 1: Custom Instructions (Recommended)**

Cline supports custom instructions that persist across sessions.

1. **Open Cline Settings**
2. **Find "Custom Instructions" section**
3. **Add SaaStastic Rules:**

```markdown
# SaaStastic Development Rules

You are helping develop SaaStastic, a multi-tenant B2B SaaS boilerplate.

## CRITICAL SECURITY RULES (Non-Negotiable)

1. **Multi-Tenant Isolation**
   - ALL database queries MUST include: `where: { companyId: context.companyId }`
   - NEVER bypass companyId scoping
   - Example:
     ```typescript
     // ❌ WRONG
     await db.customer.findMany()
     
     // ✅ CORRECT
     await db.customer.findMany({ where: { companyId: context.companyId }})
     ```

2. **RBAC Protection**
   - ALL API routes MUST use `withPermissions()` wrapper
   - Example:
     ```typescript
     export const POST = withPermissions(
       async (req, context) => { /* handler */ },
       [PERMISSIONS.FEATURE_CREATE]
     )
     ```

3. **Input Validation**
   - ALL user inputs MUST be validated with Zod schemas
   - NEVER trust client data

4. **Safe Zones**
   - Create new features in: `src/features/custom/`
   - Create new pages in: `src/app/(app)/custom/`
   - Create new APIs in: `src/app/api/custom/`
   - NEVER modify: `src/core/**/*` (core infrastructure)

## Database Model Pattern

```prisma
model YourModel {
  id          String   @id @default(cuid())
  companyId   String   // 🔒 REQUIRED for multi-tenancy
  
  // Your business fields
  name        String
  
  // Audit trail (best practice)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime? // Soft delete
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id])
  
  // Indexes (CRITICAL)
  @@index([companyId])
  @@index([deletedAt])
}
```

## Naming Conventions

- Components: PascalCase (`UserProfile.tsx`)
- Functions: camelCase (`getUserData`)
- Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- Files: kebab-case (`user-utils.ts`)

## TypeScript Rules

- TypeScript strict mode: ALWAYS
- NO `any` types (use `unknown` if truly needed)
- All functions must be properly typed

## Before Generating Code, Verify:

- [ ] Safe zone? (Creating in `src/features/custom/`)
- [ ] Multi-tenant? (All queries include `companyId`)
- [ ] Permissions? (API uses `withPermissions()`)
- [ ] Validation? (Zod schema for inputs)
- [ ] Types? (All TypeScript types defined)

For complete rules, refer to:
- DEVELOPMENT_RULES/architecture.md
- DEVELOPMENT_RULES/coding-standards.md
```

### **Method 2: Workspace Instructions**

Create a file: `.vscode/cline_instructions.md` in your project:

```bash
mkdir -p .vscode
New-Item -ItemType File -Path .vscode/cline_instructions.md
```

Then copy the same content as Method 1 into this file.

---

## 🧪 Test the Setup

### **Test 1: Verify Rules Are Active**

Open Cline chat and ask:
```
What are the multi-tenancy rules for this project?
```

Expected: Should mention `companyId` scoping, `withPermissions()`, safe zones

### **Test 2: Code Generation**

Ask Cline:
```
Create a Prisma model for tracking products in inventory.
Follow the project's patterns.
```

Verify the generated model:
✅ Has `companyId` field
✅ Has audit fields
✅ Has proper indexes
✅ Has relation to Company

---

## 💡 Using Cline Effectively

### **Task-Based Development**

Cline excels at breaking down complex tasks:

```
I want to add a complete CRM feature to SaaStastic.

Please:
1. Read DEVELOPMENT_RULES/architecture.md
2. Create database model following multi-tenant pattern
3. Create API routes with proper RBAC
4. Create React components with TypeScript
5. Include tests

Work through this step-by-step, asking for approval at each stage.
```

### **Referencing Files**

Use `@filename` to reference specific files:

```
@architecture.md What's the pattern for API routes?
@UserProfile.tsx Create a similar component for Products
```

### **Mode Selection**

Cline has different modes:

**Ask Mode**: Questions and planning
```
How should I structure a notification system for multi-tenant?
```

**Edit Mode**: File modifications
```
Add error handling to this API route following our patterns
```

**Architect Mode**: Multi-file changes
```
Refactor the customer module to use the new RBAC system
```

---

## 🔧 Cline-Specific Features

### **Automatic Context**

Cline automatically includes:
- Open files
- Project structure
- Custom instructions
- Recent changes

### **Step-by-Step Execution**

Cline can execute complex tasks autonomously:

```
Create a complete task management feature:

1. Database model with multi-tenant setup
2. API routes (CRUD operations)
3. React components (list, form, card)
4. Permission checks throughout
5. Tests for critical paths

Execute this step-by-step.
```

### **Approval Gates**

Cline asks for approval before:
- Making file changes
- Running commands
- Installing packages

This gives you control while still being efficient.

---

## 🚨 Troubleshooting

### **Instructions Not Being Followed**

**Problem**: Cline ignores custom instructions

**Solutions**:
1. Verify custom instructions are saved
2. Restart VS Code
3. Reference instructions explicitly: "Follow the rules in custom instructions"
4. Check API key is valid

### **Context Too Large**

**Problem**: "Context window exceeded" error

**Solutions**:
1. Close unnecessary files
2. Break task into smaller pieces
3. Use "Ask" mode for planning before "Edit" mode
4. Clear chat history and start fresh

### **Slow Response Times**

**Problem**: Cline is slow to respond

**Solutions**:
1. Check internet connection
2. Verify API key has credits
3. Use Claude 3 Haiku for simple tasks (faster)
4. Reduce context size

---

## 📊 Cline vs Other Tools

| Feature | Cline | Windsurf | Cursor |
|---------|-------|----------|--------|
| **Model** | Claude 3.5 | Codeium | GPT-4/Claude |
| **Task Breaking** | ✅ Excellent | ✅ Good | ⚠️ Manual |
| **Approval Gates** | ✅ Yes | ⚠️ Limited | ⚠️ Limited |
| **Custom Instructions** | ✅ Yes | ✅ Yes | ✅ Yes |
| **VS Code Integration** | ✅ Extension | ❌ Separate | ✅ Fork |
| **Cost** | 💰 Pay per use | 💰 Subscription | 💰 Subscription |

---

## 🎯 Recommended Workflow

### **For New Features**

1. **Planning Phase:**
   ```
   I need to add [FEATURE] to SaaStastic.
   
   First, read our architecture rules and help me plan:
   - Database schema
   - API endpoints needed
   - React components
   - Permission requirements
   ```

2. **Implementation Phase:**
   ```
   Let's implement step-by-step:
   
   Step 1: Create the Prisma model
   [Wait for approval]
   
   Step 2: Create API routes with RBAC
   [Wait for approval]
   
   Step 3: Create React components
   [Wait for approval]
   ```

3. **Review Phase:**
   ```
   Review the code we just created:
   - Does it follow multi-tenant patterns?
   - Are all inputs validated?
   - Are permissions checked?
   - Is TypeScript strict mode compliant?
   ```

### **For Bug Fixes**

```
There's a bug: [describe issue]

Error message: [paste error]

Relevant file: [paste code]

Help me fix this following our patterns.
```

### **For Refactoring**

```
I want to refactor [COMPONENT/MODULE]:

Current state: [describe]
Desired state: [describe]
Constraints: Must follow our architecture rules

Please plan the refactoring before making changes.
```

---

## 🎓 Best Practices

### **1. Start with Context**

Begin sessions by giving Cline context:
```
I'm working on the inventory module in SaaStastic.
Read DEVELOPMENT_RULES/architecture.md to understand our patterns.
```

### **2. Reference Existing Code**

```
@CustomerService.ts Create a similar service for Products
```

### **3. Be Specific About Requirements**

```
❌ Vague: "Add a feature for notes"

✅ Specific: "Add a notes feature with:
- Multi-tenant isolation
- RBAC protection (Member and above)
- Rich text support
- Full CRUD API following our patterns
- Tests for critical paths"
```

### **4. Review Before Approving**

Always review Cline's proposed changes before approving:
- Check for `companyId` scoping
- Verify permission checks
- Ensure input validation
- Check TypeScript types

### **5. Iterative Improvement**

```
Good start! Now let's improve:
1. Add error handling
2. Add loading states
3. Improve TypeScript types
```

---

## 🎓 Learning Resources

### **Cline Documentation**
- [GitHub Repository](https://github.com/cline/cline)
- [Usage Guide](https://github.com/cline/cline#usage)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)

### **Claude API**
- [Anthropic Docs](https://docs.anthropic.com)
- [Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Best Practices](https://docs.anthropic.com/claude/docs/best-practices)

### **SaaStastic Resources**
- `DEVELOPMENT_RULES/architecture.md` - Architecture rules
- `DEVELOPMENT_RULES/coding-standards.md` - Coding standards
- `docs/guidesForVibers/VibeCodingTips.md` - Prompt templates

---

## ✅ Setup Complete Checklist

- [ ] VS Code installed
- [ ] Cline extension installed
- [ ] Claude API key configured
- [ ] Claude 3.5 Sonnet selected as model
- [ ] Custom instructions added
- [ ] Test prompt verified rules are active
- [ ] Code generation test successful
- [ ] Approval workflow understood

---

**Cline + Claude 3.5 + SaaStastic Rules = Architectural Excellence** 🎯

**Last Updated**: October 14, 2025
