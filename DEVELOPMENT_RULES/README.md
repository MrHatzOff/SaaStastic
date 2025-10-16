# 🎯 Development Rules & AI IDE Setup

This directory contains the architectural rules and coding standards used to build SaaStastic.

---

## 📚 For Human Developers

These files document our:
- **Non-negotiable architectural patterns**
- **Multi-tenant security requirements**
- **Coding standards and conventions**
- **File organization principles**

### **Read These to Understand Our Design Decisions**

- `architecture.md` - Core architecture rules and patterns
- `coding-standards.md` - Naming conventions, code organization, and best practices

**Why read these?**
- Understand the "why" behind the codebase structure
- Learn multi-tenant security patterns
- Follow consistent coding standards
- Avoid common pitfalls

---

## 🤖 For AI-Assisted Development

These rules can be configured in AI-powered IDEs to guide code generation.

### **Supported IDEs**

- **Windsurf** - See `IDE_SETUP/windsurf-setup.md`
- **Cursor** - See `IDE_SETUP/cursor-setup.md`
- **Claude Code** (Cline)** - See `IDE_SETUP/claude-code-setup.md`
- **GitHub Copilot** - See `IDE_SETUP/github-copilot-setup.md`

### **Quick Start (Windsurf Example)**

1. Create `.windsurf/` directory in your project root
2. Inside, create `rules/` subdirectory
3. Copy `architecture.md` and `coding-standards.md` to `.windsurf/rules/`
4. Restart Windsurf IDE
5. Rules automatically loaded in AI context

**Result**: AI assistants will automatically follow SaaStastic's architectural patterns when generating code.

---

## 📖 Rule Files

### **architecture.md**

Contains non-negotiable architecture rules:
- File structure requirements
- Tech stack requirements (Next.js 15, React 19, TypeScript 5, etc.)
- Multi-tenancy and database rules
- Security requirements
- Prohibited practices
- Environment configuration

**Key Principles**:
- All tenant-scoped models must include `companyId`
- Use Prisma middleware for automatic tenant scoping
- Implement rate limiting on all API routes
- Validate all inputs with Zod schemas

### **coding-standards.md**

Defines coding conventions:
- Naming conventions (PascalCase, camelCase, kebab-case)
- Code organization patterns
- API design patterns
- TypeScript standards
- Component structure patterns
- Error handling approaches

**Key Principles**:
- TypeScript strict mode with no `any` types
- Group by feature/domain, not by technical layer
- Implement proper error boundaries
- All API routes must include validation

---

## 🚀 Benefits of Using These Rules

### **For Teams**

✅ **Consistency** - All developers follow the same patterns
✅ **Onboarding** - New team members understand standards quickly
✅ **Code Review** - Clear criteria for accepting/rejecting code
✅ **Maintenance** - Easier to maintain consistent codebase

### **For AI-Assisted Development**

✅ **Guided Generation** - AI follows your architectural patterns
✅ **Security** - AI enforces multi-tenant isolation automatically
✅ **Quality** - Generated code matches your standards
✅ **Less Refactoring** - Code is right the first time

---

## 🛠️ Setting Up Your IDE

Choose your IDE and follow the setup guide:

### **Windsurf (Recommended for SaaStastic)**
See `IDE_SETUP/windsurf-setup.md`

**Why Windsurf?**
- Built specifically for AI-assisted development
- Excellent context management
- Native rule support
- Fast and responsive

### **Cursor**
See `IDE_SETUP/cursor-setup.md`

**Why Cursor?**
- VS Code fork with AI built-in
- Great for existing VS Code users
- Strong AI capabilities
- Large community

### **Claude Code (formerly Cline)**
See `IDE_SETUP/claude-code-setup.md`

**Why Claude Code?**
- Uses Claude 3.5 Sonnet (excellent for coding)
- Works as VS Code extension
- Good at following complex instructions
- Great for architectural work

### **GitHub Copilot**
See `IDE_SETUP/github-copilot-setup.md`

**Why GitHub Copilot?**
- Tight GitHub integration
- Works in multiple IDEs
- Fast inline suggestions
- Good for completing patterns

---

## 📋 Checklist: AI Setup Complete

After setting up your IDE, verify:

- [ ] Rules directory created in IDE-specific location?
- [ ] `architecture.md` copied to rules directory?
- [ ] `coding-standards.md` copied to rules directory?
- [ ] IDE restarted?
- [ ] AI assistant acknowledges rules when asked?

**Test it**: Ask your AI assistant "What are the multi-tenancy rules?" and see if it references the architecture.md file.

---

## 🔄 Keeping Rules Updated

These rules are **copied** from `.windsurf/rules/` which is the source of truth during SaaStastic development.

If you modify these rules for your project:
1. Document your changes
2. Communicate to your team
3. Re-copy to IDE rule directories
4. Restart IDEs

**Note**: If you're customizing SaaStastic, feel free to adapt these rules to your needs. They're guidelines, not restrictions.

---

## 💡 Tips for Maximum Effectiveness

### **1. Be Specific in Prompts**
```
❌ Bad: "Create a customer model"
✅ Good: "Create a customer model following our multi-tenant patterns from architecture.md"
```

### **2. Reference Rules Explicitly**
```
"Follow the API design pattern from coding-standards.md"
"Ensure this follows our multi-tenancy rules"
```

### **3. Use Rules as Teaching Tools**
Share these files with new developers to get them up to speed quickly.

### **4. Enforce in Code Review**
Reference specific rules when giving feedback:
```
"This doesn't follow the naming convention in coding-standards.md (line 15-20)"
```

### **5. Update Based on Learnings**
If you discover a better pattern, update the rules and share with the team.

---

## 🤝 Contributing Improvements

If you find ways to improve these rules:
1. Document the improvement
2. Test it thoroughly
3. Update the rule file
4. Share with the SaaStastic community

---

## 📚 Additional Resources

- **Architecture Guide**: `../GUIDES/00_ARCHITECTURE_GUIDE.md` - Human-readable architecture explanation
- **AI Context**: `../docs/guidesForVibers/AI_SYSTEM_CONTEXT.md` - AI assistant onboarding
- **AI Workflows**: `../docs/guidesForVibers/AI_WORKFLOWS.md` - Task-based AI workflows
- **Customization Guide**: `../GUIDES/05_SAFE_CUSTOMIZATION_GUIDE.md` - Safe zones for changes

---

**Last Updated**: October 14, 2025  
**Maintained by**: SaaStastic Team

*Use these rules to build consistent, secure, maintainable code!* 🚀
