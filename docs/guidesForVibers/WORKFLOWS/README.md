# 🔄 SaaStastic Feature Development Workflow System

**Based on the ai-dev-tasks methodology by Ryan Carson**  
**Adapted for SaaStastic multi-tenant architecture**

**Apache 2.0 License** - See ATTRIBUTION.md

---

## 📚 What is This?

A systematic, three-phase approach to building complex features with AI assistance:

1. **Create PRD** - Define requirements collaboratively
2. **Generate Tasks** - Break down into implementable steps  
3. **Execute** - Implement one task at a time with quality gates

**Why use this system?**
- ✅ **Clarity** - Clear requirements before coding
- ✅ **Quality** - Built-in testing and review gates
- ✅ **Collaboration** - AI and human work together iteratively
- ✅ **Documentation** - PRDs and task lists serve as documentation
- ✅ **Accountability** - Track progress with checkboxes

---

## 🎯 When to Use This

### **Perfect For:**
- Complex multi-step features (CRM, inventory, reporting)
- Features requiring database + API + UI changes
- Features with unclear requirements
- Learning SaaStastic architecture through guided implementation

### **Not Needed For:**
- Simple UI changes
- Single-file modifications
- Bug fixes
- Configuration changes

---

## 📂 Workflow Files

### **1. create-prd.md** - Creating Product Requirements
Use this when:
- Starting a new feature
- Requirements are unclear
- Need to align with stakeholders

**Output**: `prd-[feature-name].md` in `/tasks/` directory

### **2. generate-tasks.md** - Breaking Down Implementation
Use this when:
- You have a completed PRD
- Ready to start implementation
- Need a structured development plan

**Output**: `tasks-prd-[feature-name].md` in `/tasks/` directory

### **3. process-tasks.md** - Task-by-Task Execution
Use this when:
- Tasks are generated
- Ready to implement
- Want quality gates at each step

**Process**: Complete sub-tasks one-by-one with testing

---

## 🚀 Quick Start

### **Step 1: Create PRD**

```
I want to build a [FEATURE_NAME] for SaaStastic.

Please follow the process in docs/guidesForVibers/WORKFLOWS/create-prd.md

First, read:
- GUIDES/00_ARCHITECTURE_GUIDE.md  
- DEVELOPMENT_RULES/architecture.md

Then ask me clarifying questions about:
- User stories and goals
- Multi-tenant requirements
- RBAC permission needs
- Data model requirements
- UI/UX expectations
```

### **Step 2: Generate Tasks**

```
I have a completed PRD at tasks/prd-[feature-name].md

Please follow the process in docs/guidesForVibers/WORKFLOWS/generate-tasks.md

Generate implementation tasks following SaaStastic patterns.
```

### **Step 3: Execute Tasks**

```
Let's implement the feature using tasks-prd-[feature-name].md

Follow the process in docs/guidesForVibers/WORKFLOWS/process-tasks.md

Complete one sub-task at a time, asking for approval before proceeding.
```

---

## 🏗️ SaaStastic-Specific Adaptations

The Ryan Carson methodology has been adapted to include:

### **Multi-Tenant Considerations**
- PRD templates include "Multi-Tenant Requirements" section
- Task generation verifies `companyId` scoping
- Implementation checklist includes tenant isolation

### **RBAC Integration**
- PRD templates include "Permission Requirements" section
- Tasks include permission setup and testing
- Checklists verify `withPermissions()` usage

### **Security Gates**
- Input validation requirements in PRD
- Security checklist in task execution
- Tenant isolation tests required

### **SaaStastic File Structure**
- Tasks use SaaStastic's safe zones (`src/features/custom/`)
- Respect core files (`src/core/**/*` is off-limits)
- Follow established naming conventions

---

## 📊 Workflow Comparison

| Aspect | Original (Ryan Carson) | SaaStastic Adaptation |
|--------|------------------------|----------------------|
| **PRD Template** | Generic SaaS | Multi-tenant + RBAC |
| **Task Structure** | Standard breakdown | Includes security checks |
| **File Locations** | Generic paths | SaaStastic safe zones |
| **Testing** | Standard tests | + Tenant isolation tests |
| **Commit Protocol** | Basic | + Security verification |

---

## 💡 Pro Tips

### **Tip 1: Front-Load Clarity**
Spend time on the PRD. Clear requirements = faster implementation.

### **Tip 2: Use Examples**
Reference existing SaaStastic features in your PRD (e.g., "Like the customer module but for...")

### **Tip 3: Break It Down**
If tasks seem too large, ask AI to break them down further.

### **Tip 4: Test As You Go**
Don't skip the testing steps. Catch issues early.

### **Tip 5: Document Decisions**
Use PRD "Open Questions" section to track important decisions.

---

## 🎓 Learning the System

### **Beginner Path**
1. Read all three workflow files
2. Try a simple feature (e.g., note-taking)
3. Follow process exactly
4. Learn SaaStastic patterns through guided implementation

### **Intermediate Path**
1. Use for medium-complexity features
2. Adapt workflows to your style
3. Create feature-specific templates

### **Advanced Path**
1. Use for architecture-level changes
2. Extend workflows with custom steps
3. Teach the system to your team

---

## 📁 Directory Structure

```
docs/guidesForVibers/WORKFLOWS/
├── README.md                    # This file
├── create-prd.md               # Phase 1: Requirements
├── generate-tasks.md           # Phase 2: Task breakdown
├── process-tasks.md            # Phase 3: Implementation
├── ATTRIBUTION.md              # Credit to Ryan Carson
└── templates/
    ├── prd-template.md         # PRD template for SaaStastic
    └── example-prd.md          # Example completed PRD
```

---

## 🤝 Contributing

If you improve these workflows:
1. Test improvements on real features
2. Document what changed and why
3. Share with SaaStastic community

---

## 📚 Additional Resources

### **SaaStastic Documentation**
- `GUIDES/00_ARCHITECTURE_GUIDE.md` - Architecture overview
- `DEVELOPMENT_RULES/architecture.md` - Non-negotiable rules
- `docs/guidesForVibers/VibeCodingTips.md` - Prompt templates

### **Original Methodology**
- [ai-dev-tasks Repository](https://github.com/snarktank/ai-dev-tasks)
- Ryan Carson's workflow system

---

## 🎯 Success Metrics

You're using this workflow successfully when:
- ✅ Features are delivered with clear requirements
- ✅ Implementation follows SaaStastic patterns
- ✅ Security and multi-tenancy are never afterthoughts
- ✅ Code is tested and documented
- ✅ Team understands feature scope and design

---

**This workflow transforms AI assistance from "code generator" to "development partner"** 🤝

**Last Updated**: October 14, 2025  
**Maintained by**: SaaStastic Team  
**Based on**: Ryan Carson's ai-dev-tasks (Apache 2.0)
