# Windsurf Rules Activation Guide

## Overview

The Windsurf rules are split into 4 files with different activation modes for better control and performance:

## Rule Files & Activation Modes

### 1. **architecture.md** - Always Active ⚡
- **Activation**: `always` (automatic)
- **Purpose**: Core architecture patterns, multi-tenancy, security
- **When Active**: Always enforced during development
- **No Action Required**: These rules are always on

### 2. **coding-standards.md** - Manual Activation 🔧
- **Activation**: `manual` (requires user action)
- **Purpose**: Naming conventions, code patterns, TypeScript standards
- **When to Activate**: During active coding, code reviews, refactoring

### 3. **quality.md** - Context-Sensitive 🎯
- **Activation**: `context` (automatic based on triggers)
- **Purpose**: Performance standards, testing requirements, monitoring
- **Auto-Triggers**: Files containing `test`, `spec`, `performance`, `*.test.ts`, `*.spec.ts`
- **When Active**: Automatically when working on tests or performance

### 4. **documentation.md** - Manual Activation 📝
- **Activation**: `manual` (requires user action)
- **Purpose**: JSDoc standards, API docs, project documentation
- **When to Activate**: Writing documentation, updating README files

## How to Use Rule Activation

### Automatic Rules (No Action Needed)
- **architecture.md**: Always active - enforces core patterns
- **quality.md**: Auto-activates when editing test files or performance code

### Manual Activation Commands
```bash
# Activate coding standards for development work
windsurf rules activate coding-standards

# Activate documentation standards for doc writing
windsurf rules activate documentation

# Deactivate when done
windsurf rules deactivate coding-standards
windsurf rules deactivate documentation

# Check which rules are currently active
windsurf rules status
```

### Context-Sensitive Triggers
The **quality.md** rules automatically activate when you:
- Edit files containing: `*.test.ts`, `*.spec.ts`, `playwright.config.ts`
- Work with keywords: `test`, `spec`, `performance`, `benchmark`, `optimize`
- Open files in `/tests/` directory

## Recommended Workflow

### 🏗️ **Architecture Work** (Always Active)
- File structure changes
- Adding new modules
- Database schema updates
- Security implementations

### 💻 **Active Development** 
```bash
windsurf rules activate coding-standards
# Code your features
windsurf rules deactivate coding-standards
```

### 🧪 **Testing & Performance**
- Rules auto-activate when editing test files
- No manual activation needed
- Focus on test coverage and performance standards

### 📚 **Documentation Writing**
```bash
windsurf rules activate documentation
# Write/update docs
windsurf rules deactivate documentation
```

## File Locations

Move these files from `docs/windsurf-rules/` to:
```
.windsurf/rules/
├── architecture.md      # Always active
├── coding-standards.md  # Manual activation
├── quality.md          # Context-sensitive
└── documentation.md     # Manual activation
```

## Benefits of This Approach

- **Performance**: Only relevant rules are active
- **Focus**: Avoid rule fatigue during specific tasks
- **Flexibility**: Choose when to enforce coding standards
- **Automation**: Testing rules activate automatically
- **Core Safety**: Architecture rules always protect the codebase

## Rule Priority System

1. **High Priority**: architecture.md (always enforced)
2. **Medium Priority**: coding-standards.md, quality.md (task-specific)
3. **Low Priority**: documentation.md (as-needed basis)

This system ensures core patterns are always maintained while giving you control over when to apply detailed coding standards and documentation requirements.
