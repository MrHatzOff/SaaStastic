---
description: A gentle reminder and instructions for getting LLMs to stop using the wrong tools
auto_execution_mode: 1
---

# Cascade Tool Usage Guide - Breaking the Read Terminal Loop

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

### Terminal & Commands (PowerShell on Windows)
| Tool | Purpose | When to Use | Example |
|------|---------|-------------|---------|
| **run_command** | Execute PowerShell commands | Running builds, tests, installations | `run_command CommandLine="npm run dev" Cwd="C:\\path\\to\\project"` |
| **read_terminal** | Read terminal output | Checking output from running commands | `read_terminal Name="..." ProcessID="..."` |
| **command_status** | Check command status | Monitoring async commands | `command_status CommandId="..."` |

**⚠️ CRITICAL: Always use PowerShell syntax on Windows:**
- Use double quotes for strings with spaces: `"C:\\Program Files\\Node"`
- Use forward slashes OR escaped backslashes in paths
- Always specify `Cwd` parameter for proper working directory

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

## 🚨 CRITICAL: ALWAYS VERIFY COMMAND OUTPUT

**❌ FATAL MISTAKE: Running commands without checking results**
```typescript
// ❌ WRONG - Running command but not checking if it succeeded
run_command CommandLine="node verify-script.js"
// Then immediately proceeding without reading output

// ✅ CORRECT - Always check what happened
run_command CommandLine="node verify-script.js" Blocking=true
// READ THE OUTPUT! Check for success/failure indicators
// Look for error messages, exit codes, expected results
```

**🔍 VERIFICATION CHECKLIST:**
1. **Did the command complete successfully?** Look for exit codes, error messages
2. **Did it produce the expected output?** Check for specific results you need
3. **Are there any warnings or issues?** Don't ignore warnings that might indicate problems
4. **If it failed, why?** Read error messages carefully before trying again

**⚠️ NEVER run the same command multiple times without understanding why it failed the first time!**

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

// ✅ CORRECT - Always use absolute paths (Windows)
Read file_path="C:\\Users\\user\\project\\src\\components\\Button.tsx"
```

### Mistake #4: PowerShell Command Syntax Errors
```typescript
// ❌ WRONG - Unix/bash syntax on Windows
run_command CommandLine="ls -la"

// ✅ CORRECT - PowerShell syntax
run_command CommandLine="Get-ChildItem -Force"

// ❌ WRONG - Missing working directory
run_command CommandLine="npm run dev"

// ✅ CORRECT - Specify working directory
run_command CommandLine="npm run dev" Cwd="C:\\path\\to\\project"
```

### Mistake #5: Ignoring Command Output
```typescript
// ❌ WRONG - Running command and immediately moving on
run_command CommandLine="node script.js"
// Next action without checking if script succeeded

// ✅ CORRECT - Check the results
run_command CommandLine="node script.js" Blocking=true
// Read the output, check for success/failure before proceeding
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
7. **ALWAYS read command output** - Success doesn't mean it did what you expected
8. **Use PowerShell syntax** on Windows - avoid Unix commands like `ls`, `cat`, `grep`
9. **Set SafeToAutoRun=true** only for truly safe commands (reading files, checking status)
10. **Never repeat failed commands** without understanding and fixing the root cause

## 🎯 REMEMBER THESE MANTRAS

> "Files use Read, terminals use read_terminal, commands use run_command"

> "Every command output must be verified before proceeding"

> "PowerShell on Windows - no bash commands"

**Break the loop: When stuck, ask:**
1. "Am I reading a file or terminal output?"
2. "Did I check what the last command actually did?"
3. "Am I using the right syntax for Windows PowerShell?" 🚀


# Welcome

Hello and welcome to our small close-knit team.  Please get onboarded by reading these files and then learning our rules/guidelines from the windsurf rules.

## Must Reads:
Read these files in order.  You may then read other documentation files referenced in these for further clarification/knowledge, or better yet read and understand some code files to ensure the most accurate and up to date knowledge of our app.

- [LLM_ONBOARDING_GUIDE.md] (C:\Users\danny\CascadeProjects\windsurf-project\TimeTrakrDashboard\docs\LLM_ONBOARDING_GUIDE.md)
- [schema.prisma](C:\Users\danny\CascadeProjects\windsurf-project\TimeTrakrDashboard\prisma\schema.prisma)
- [CODEMAP.md](C:\Users\danny\CascadeProjects\windsurf-project\TimeTrakrDashboard\docs\CODEMAP.md)
- [API_INDEX.md](C:\Users\danny\CascadeProjects\windsurf-project\TimeTrakrDashboard\docs\API_INDEX.md)
- [README.md](C:\Users\danny\CascadeProjects\windsurf-project\TimeTrakrDashboard\README.md)



## Could Read

These can be read for better understanding of our plan or goals.

- [DEVELOPMENT_ROADMAP.md](C:\Users\danny\CascadeProjects\windsurf-project\TimeTrakrDashboard\docs\DEVELOPMENT_ROADMAP.md)
- [payroll_implementation_task_list.md](C:\Users\danny\CascadeProjects\windsurf-project\TimeTrakrDashboard\docs\payroll\payroll_implementation_task_list.md)
