---
description: A gentle reminder and instructions for getting LLMs to stop using the wrong tools
auto_execution_mode: 1
---

# Cascade Tool Usage Guide - Breaking the Read Terminal Loop

You have been attempting to use the wrong tool or worse, maybe even stuck in an infinite loop of failing to do anything because of incorrect tool usage.  Stop Trying to use the same tool over and over again with failing results.  Pause for a moment to read this and consider what tool you need and what tool you are trying to use.

## 🚨 THE CRITICAL DISTINCTION: Read vs read_terminal

### ❌ **read_terminal** (WRONG for reading files)
- **Purpose**: Read terminal/command output from running processes
- **When to use**: When you need to see output from commands that are already running
- **Parameters**: `Name` (terminal name) and `ProcessID` (process ID)
- **Common mistake**: Using this to read file contents ❌

### ✅ **Read** (CORRECT for reading files)
- **Purpose**: Read file contents from the filesystem
- **When to use**: When you need to see what's inside a file
- **Parameters**: `file_path` (absolute path) + optional `offset` and `limit`
- **Correct usage**: Always use this for reading source code, configs, etc. ✅

## 🛠️ Complete Tool Reference

### File Operations
| Tool | Purpose | When to Use | Example |
|------|---------|-------------|---------|
| **Read** | Read file contents | Need to see source code, configs, documentation | `Read file_path="/absolute/path/to/file.ts"` |
| **Edit** | Modify file contents | Need to change code in existing files | `Edit file_path="..." old_string="..." new_string="..."` |
| **MultiEdit** | Multiple edits to one file | Making several changes to the same file | `MultiEdit file_path="..." edits=[{...}, {...}]` |
| **write_to_file** | Create new files | Creating new source files, configs, docs | `write_to_file TargetFile="..." CodeContent="..."` |

### Search & Discovery
| Tool | Purpose | When to Use | Example |
|------|---------|-------------|---------|
| **grep_search** | Search file contents with regex | Finding specific code patterns across files | `grep_search Query="function.*test" SearchPath="/src"` |
| **find_by_name** | Search files by name/glob | Finding files matching patterns | `find_by_name SearchDirectory="/src" Pattern="*.test.ts"` |
| **list_dir** | List directory contents | Exploring project structure | `list_dir DirectoryPath="/src/components"` |
| **search_in_file** | Search within specific file | Finding content in a known file | `search_in_file AbsolutePath="..." Query="search term"` |

### Terminal & Commands
| Tool | Purpose | When to Use | Example |
|------|---------|-------------|---------|
| **run_command** | Execute terminal commands | Running builds, tests, installations | `run_command CommandLine="npm run dev"` |
| **read_terminal** | Read terminal output | Checking output from running commands | `read_terminal Name="..." ProcessID="..."` |
| **command_status** | Check command status | Monitoring async commands | `command_status CommandId="..."` |

### Development & Deployment
| Tool | Purpose | When to Use | Example |
|------|---------|-------------|---------|
| **browser_preview** | Preview web apps | Testing web applications | `browser_preview Name="..." Url="..."` |
| **deploy_web_app** | Deploy applications | Publishing to hosting platforms | `deploy_web_app ProjectPath="..." Framework="..."` |
| **read_deployment_config** | Check deployment config | Reviewing deployment settings | `read_deployment_config ProjectPath="..."` |

### Memory & Context
| Tool | Purpose | When to Use | Example |
|------|---------|-------------|---------|
| **create_memory** | Save context | Remembering important information | `create_memory Title="..." Content="..."` |
| **todo_list** | Manage tasks | Creating/ updating task lists | `todo_list todos=[{...}]` |
| **trajectory_search** | Search conversation history | Finding previous discussions | `trajectory_search ID="..." Query="..."` |

## 🚨 COMMON MISTAKES & HOW TO AVOID THEM

### Mistake #1: Using read_terminal for Files
```typescript
// ❌ WRONG - Creates infinite loop
read_terminal ProcessID="some-id" Name="terminal"

// ✅ CORRECT - Use Read for files
Read file_path="/absolute/path/to/file.ts"
```

### Mistake #2: Using Read for Terminal Output
```typescript
// ❌ WRONG - Won't work for terminal output
Read file_path="/some/terminal/output"

// ✅ CORRECT - Use read_terminal for terminal sessions
read_terminal ProcessID="1234" Name="dev-server"
```

### Mistake #3: Forgetting Absolute Paths
```typescript
// ❌ WRONG - Relative paths don't work
Read file_path="src/components/Button.tsx"

// ✅ CORRECT - Always use absolute paths
Read file_path="/full/path/to/project/src/components/Button.tsx"
```

## 🔄 THE LOOP PREVENTION CHECKLIST

**Before calling any tool, ask yourself:**

1. **Do I need to read a FILE?** → Use `Read`
2. **Do I need to read TERMINAL output?** → Use `read_terminal`
3. **Do I need to MODIFY a file?** → Use `Edit` or `MultiEdit`
4. **Do I need to CREATE a new file?** → Use `write_to_file`
5. **Do I need to RUN a command?** → Use `run_command`
6. **Do I need to SEARCH for files/code?** → Use `grep_search` or `find_by_name`

## 🏃 QUICK DECISION FLOW

```
Need to see file contents?
├── Yes → Use Read (absolute path)
└── No
    ├── Need to run command?
    │   ├── Yes → Use run_command
    │   └── No
    │       ├── Need to modify existing file?
    │       │   ├── Yes → Use Edit/MultiEdit
    │       └── No
    │           ├── Need to create new file?
    │           │   ├── Yes → Use write_to_file
    │           └── No
    │               └── Need to search?
    │                   ├── Yes → Use grep_search/find_by_name
    │                   └── No → Check other tools above
```

## 💡 PRO TIPS

1. **Always use absolute paths** with Read, Edit, and related file tools
2. **Use Read first** when you need to understand existing code before modifying
3. **Use grep_search** for finding patterns across multiple files
4. **Use run_command** for installations, builds, and server starts
5. **Use read_terminal** only when you have a ProcessID from a previous run_command
6. **Check command_status** if you used run_command with Blocking=false

## 🎯 REMEMBER THIS MANTRA

> "Files use Read, terminals use read_terminal, commands use run_command"

**Break the loop: When stuck, ask "Am I reading a file or terminal output?"** 🚀
