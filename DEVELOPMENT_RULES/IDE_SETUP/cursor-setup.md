# 🖱️ Cursor IDE Setup for SaaStastic

**Cursor** is a VS Code fork with AI built directly into the editor. Great for developers already familiar with VS Code.

---

## 📦 Installation

1. Download Cursor from [https://cursor.sh](https://cursor.sh)
2. Install for your platform (Windows, macOS, Linux)
3. Open Cursor
4. Sign in with your account
5. Configure AI model (GPT-4, Claude, etc.)

---

## ⚙️ Configure Rules

### **Step 1: Create Cursor Rules File**

Cursor uses a `.cursorrules` file in your project root.

```bash
# In your SaaStastic project root
New-Item -ItemType File -Path .cursorrules
```

### **Step 2: Combine Rules**

Cursor's `.cursorrules` file should contain combined rules. Create it with this content:

```markdown
# SaaStastic Development Rules

## Core Architecture Rules (Priority: HIGH)

### Multi-Tenancy Requirements
- ALL tenant-scoped models MUST include `companyId` field
- ALL database queries MUST scope by companyId
- Example: `where: { companyId: context.companyId }`

### Security Requirements
- ALL API routes MUST use `withPermissions()` wrapper
- ALL inputs MUST be validated with Zod schemas
- NEVER expose sensitive data in client-side code
- NEVER commit secrets to version control

### File Structure
- New features go in: `src/features/custom/`
- New pages go in: `src/app/(app)/custom/`
- New APIs go in: `src/app/api/custom/`
- NEVER modify: `src/core/**/*`

### Database Model Pattern
```prisma
model YourModel {
  id          String   @id @default(cuid())
  companyId   String   // REQUIRED
  
  // Your fields
  name        String
  
  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime?
  
  company     Company  @relation(fields: [companyId], references: [id])
  @@index([companyId])
  @@index([deletedAt])
}
```

### API Route Pattern
```typescript
import { withPermissions, PERMISSIONS } from '@/shared/lib';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
});

export const POST = withPermissions(
  async (req, context) => {
    const body = await req.json();
    const data = schema.parse(body);
    
    const result = await db.model.create({
      data: {
        ...data,
        companyId: context.companyId,
        createdBy: context.userId,
      },
    });
    
    return NextResponse.json({ success: true, data: result });
  },
  [PERMISSIONS.REQUIRED_PERMISSION]
);
```

## Coding Standards (Priority: MEDIUM)

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Functions: camelCase (`getUserData`)
- Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- Files: kebab-case (`user-utils.ts`)

### TypeScript Requirements
- Use TypeScript strict mode
- NO `any` types (use `unknown` if needed)
- All function parameters must be typed
- Use Zod for runtime validation

### Import Organization
1. External libraries
2. Internal absolute imports
3. Relative imports
4. Styles

For complete rules, see:
- DEVELOPMENT_RULES/architecture.md
- DEVELOPMENT_RULES/coding-standards.md
```

### **Step 3: Save and Restart**

1. Save `.cursorrules` file
2. Restart Cursor IDE
3. Rules will be automatically loaded

---

## 🧪 Test the Setup

### **Verify Rules Are Active**

1. Open Cursor chat (Ctrl/Cmd + L)
2. Ask: "What are the multi-tenancy rules for this project?"
3. AI should mention `companyId` scoping and reference the rules

### **Test Code Generation**

In Cursor chat:
```
Create a new Prisma model for tracking tasks.
Follow the project's multi-tenant patterns.
```

Expected result:
✅ Includes `companyId` field
✅ Has proper indexes
✅ Includes audit fields
✅ Follows naming conventions

---

## 💡 Using Cursor Effectively

### **Cursor Chat (Ctrl/Cmd + L)**

Best for:
- Planning features
- Getting architecture advice
- Complex multi-step tasks
- Code review

**Example:**
```
I need to add a note-taking feature to SaaStastic.

Requirements:
1. Multi-tenant with companyId scoping
2. RBAC protection (only members and above)
3. Rich text editor support
4. Full CRUD API

Can you help me plan the implementation following our rules?
```

### **Cursor Composer (Ctrl/Cmd + I)**

Best for:
- Inline code modifications
- Quick fixes
- Refactoring
- Adding features to existing files

**Example:**
Select a function and press Ctrl/Cmd + I:
```
Add error handling to this function following our error patterns
```

### **Tab Autocomplete**

Cursor's autocomplete learns from:
- Your `.cursorrules` file
- Your codebase patterns
- Recent edits

Start typing and let Cursor suggest code that follows your patterns.

---

## 🔧 Cursor-Specific Features

### **@-Mentions in Chat**

Reference specific files or docs:
```
@architecture.md What's the pattern for adding a new API route?
@UserProfile.tsx How should I structure a similar component for products?
```

### **Codebase Indexing**

Cursor indexes your entire codebase. This means:
- AI understands your project structure
- Can reference any file
- Knows existing patterns

### **Privacy Mode**

Enable privacy mode in settings to:
- Keep code on your machine
- Disable telemetry
- Use local models (if configured)

---

## 🚨 Troubleshooting

### **Rules Not Being Followed**

**Problem**: AI doesn't follow `.cursorrules`

**Solutions**:
1. Verify `.cursorrules` exists in project root
2. Restart Cursor
3. Reference rules explicitly: "Follow the patterns in .cursorrules"
4. Check file is valid Markdown

### **Autocomplete Too Aggressive**

**Problem**: Tab autocomplete suggests too much

**Solutions**:
1. Settings → Cursor Tab → Adjust aggressiveness
2. Use partial accepts (Ctrl/Cmd + →)
3. Disable in specific file types

### **Context Window Issues**

**Problem**: AI seems to forget earlier context

**Solutions**:
1. Use @-mentions to reference specific files
2. Break large tasks into smaller pieces
3. Start new chat for new features
4. Use Composer for localized changes

---

## 📊 Cursor vs Other IDEs

| Feature | Cursor | Windsurf | VS Code + Copilot |
|---------|--------|----------|-------------------|
| **Based On** | VS Code | Custom | VS Code |
| **Rules File** | ✅ `.cursorrules` | ✅ `.windsurf/rules/` | ⚠️ Comments |
| **Chat** | ✅ Built-in | ✅ Built-in | ⚠️ Limited |
| **Composer** | ✅ Yes | ⚠️ Flow mode | ❌ No |
| **VS Code Extensions** | ✅ Compatible | ❌ No | ✅ Native |
| **Autocomplete** | ✅ Context-aware | ✅ Context-aware | ✅ Pattern-based |

---

## 🎯 Recommended Workflow

### **For New Features**

1. **Plan in Chat:**
   ```
   Help me design a notification system for SaaStastic.
   Follow our multi-tenant architecture from .cursorrules
   ```

2. **Implement with Composer:**
   - Open relevant files
   - Use Composer (Ctrl/Cmd + I) for inline changes
   - Reference existing patterns

3. **Review and Refine:**
   - Ask Chat to review for rule compliance
   - Run tests
   - Fix any issues

### **For Bug Fixes**

1. **Describe Problem in Chat:**
   ```
   This API route is returning data from all companies, not just the user's.
   Help me fix it according to our multi-tenant rules.
   ```

2. **Apply Fix with Composer:**
   - Select problematic code
   - Use Composer to fix
   - Verify fix follows patterns

### **For Refactoring**

1. **Plan in Chat:**
   ```
   I want to refactor the customer module to use our new pattern.
   What's the best approach?
   ```

2. **Execute Step-by-Step:**
   - Use Composer for each file
   - Maintain test coverage
   - Verify TypeScript compilation

---

## 🎓 Learning Resources

### **Cursor Documentation**
- [Official Docs](https://docs.cursor.sh)
- [Keyboard Shortcuts](https://docs.cursor.sh/shortcuts)
- [Chat Features](https://docs.cursor.sh/chat)
- [Composer Guide](https://docs.cursor.sh/composer)

### **SaaStastic Resources**
- `DEVELOPMENT_RULES/architecture.md` - Complete architecture rules
- `DEVELOPMENT_RULES/coding-standards.md` - Coding conventions
- `docs/guidesForVibers/VibeCodingTips.md` - Prompt templates

---

## 💡 Pro Tips

### **Tip 1: Use @ Commands**
```
@architecture.md What's the API pattern?
@codebase How is authentication handled?
```

### **Tip 2: Partial Accepts**
Press Ctrl/Cmd + → to accept one word at a time from suggestions.

### **Tip 3: Chat History**
Your chat history persists. Reference previous conversations.

### **Tip 4: Model Selection**
Use GPT-4 for architecture decisions, faster models for simple completions.

### **Tip 5: Extension Compatibility**
Install your favorite VS Code extensions - they all work in Cursor.

---

## ✅ Setup Complete Checklist

- [ ] Cursor installed and signed in
- [ ] `.cursorrules` file created in project root
- [ ] Rules content added and saved
- [ ] Cursor restarted
- [ ] Test chat verified rules are active
- [ ] Autocomplete working with rules
- [ ] @-mentions working in chat
- [ ] Model preference configured

---

**Cursor + SaaStastic Rules = VS Code Power + AI Intelligence** 🎯

**Last Updated**: October 14, 2025
