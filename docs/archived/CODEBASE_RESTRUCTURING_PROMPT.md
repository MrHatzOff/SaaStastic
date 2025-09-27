# SaaStastic Codebase Restructuring Prompt

## 🎯 Goal
Restructure the SaaStastic codebase to achieve better separation between marketing and SaaS application code while maintaining Next.js App Router compatibility.

## 📋 Current Structure Analysis
```
src/
├── app/                      # ✅ Next.js routes (MUST stay in src/app/)
│   ├── page.tsx             # Marketing: Homepage
│   ├── about/page.tsx       # Marketing: About page
│   ├── contact/page.tsx     # Marketing: Contact page
│   ├── faq/page.tsx         # Marketing: FAQ page
│   ├── sign-in/page.tsx     # Bridge: Authentication
│   ├── sign-up/page.tsx     # Bridge: Authentication
│   ├── onboarding/          # SaaS: Company setup
│   ├── dashboard/           # SaaS: Main application
│   ├── api/                 # Mixed: API routes
│   └── globals.css          # Mixed: Global styles
├── components/              # Mixed: UI components
├── lib/                     # Mixed: Utilities
└── core/                    # Mixed: Business logic
```

## 🎯 Target Structure
```
src/
├── app/                      # ✅ Next.js routes (unchanged)
├── components/               # Restructured
│   ├── marketing/           # Marketing-specific components
│   ├── app/                 # SaaS-specific components
│   └── shared/              # Cross-domain components
├── lib/                      # Restructured
│   ├── shared/              # Cross-domain utilities
│   └── app/                 # SaaS-specific utilities
└── core/                     # Restructured
    ├── shared/              # Cross-domain business logic
    └── app/                 # SaaS-specific business logic
```

## 📝 Implementation Steps

### [✅]Phase 1: Create New Directory Structure

**🔧 Tool Reminder:** Use `run_command` tool for terminal operations, not `read_terminal`.

1. **Create component directories:**
   ```powershell
   # Windows PowerShell commands (use run_command tool)
   [✅]New-Item -ItemType Directory -Path "src/components/marketing" -Force
       -note: already existed and contains many files.
   [✅]New-Item -ItemType Directory -Path "src/components/app" -Force
   [✅]New-Item -ItemType Directory -Path "src/components/shared" -Force
   ```

2. **Create lib directories:**
   ```powershell
   [✅]New-Item -ItemType Directory -Path "src/lib/shared" -Force
   [✅]New-Item -ItemType Directory -Path "src/lib/app" -Force
   ```

3. **Create core directories:**
   ```powershell
   [✅]New-Item -ItemType Directory -Path "src/core/shared" -Force
   [✅]New-Item -ItemType Directory -Path "src/core/app" -Force
   ```

**⚠️ Verification:** After each `run_command`, check the exit code and output to ensure the command succeeded.

### Phase 2: Analyze Current Files

4. **Inventory current components:**
   - List all files in `src/components/`
   - Categorize each as: marketing, app, or shared
   - Document current import usage

5. **Inventory current lib files:**
   - List all files in `src/lib/`
   - Categorize each as: shared or app
   - Document current import usage

6. **Inventory current core files:**
   - List all files in `src/core/`
   - Categorize each as: shared or app
   - Document current import usage

### Phase 3: File Movement Strategy

#### Components Classification:

7. **Marketing Components** (move to `src/components/marketing/`):
   - Components used only on marketing pages (`/`, `/about`, `/contact`, `/faq`)
   - Marketing-specific UI elements
   - Landing page components

8. **App Components** (move to `src/components/app/`):
   - Components used only in dashboard/onboarding (`/dashboard/*`, `/onboarding/*`)
   - SaaS-specific UI elements
   - Business application components

9. **Shared Components** (move to `src/components/shared/`):
   - UI components used by both marketing and app
   - Generic form components
   - Layout components
   - Base UI primitives

#### Lib Files Classification:

10. **Shared Lib** (move to `src/lib/shared/`):
    - Utility functions used by both marketing and app
    - Generic helpers
    - API clients used by both domains

11. **App Lib** (move to `src/lib/app/`):
    - Business logic utilities
    - SaaS-specific helpers
    - App domain utilities

#### Core Files Classification:

12. **Shared Core** (move to `src/core/shared/`):
    - Cross-domain business logic
    - Database utilities
    - Authentication logic

13. **App Core** (move to `src/core/app/`):
    - SaaS-specific business logic
    - Company management
    - Multi-tenant logic

### Phase 4: Execute File Moves

**🔧 Tool Reminder:** Use `run_command` tool for file operations. Always specify `Cwd` parameter.

14. **Move component files:**
   ```powershell
   # Windows PowerShell move commands (use run_command tool)
   Move-Item -Path "src/components/ui/button.tsx" -Destination "src/components/shared/ui/button.tsx" -Force
   Move-Item -Path "src/components/customers/customer-form-modal.tsx" -Destination "src/components/app/customers/customer-form-modal.tsx" -Force
   # Repeat for each file based on categorization
   ```

15. **Move lib files:**
   ```powershell
   Move-Item -Path "src/lib/api-client.ts" -Destination "src/lib/shared/api-client.ts" -Force
   Move-Item -Path "src/lib/company-utils.ts" -Destination "src/lib/app/company-utils.ts" -Force
   ```

16. **Move core files:**
   ```powershell
   Move-Item -Path "src/core/db.ts" -Destination "src/core/shared/db.ts" -Force
   Move-Item -Path "src/core/company-logic.ts" -Destination "src/core/app/company-logic.ts" -Force
   ```

**⚠️ Verification:** After each move, verify the file exists in the new location using `list_dir` tool.

### Phase 5: Update Import Paths

17. **Update component imports throughout codebase:**
    ```typescript
    // Before
    import { Button } from '@/components/ui/button'

    // After (if moved to shared)
    import { Button } from '@/components/shared/ui/button'
    // OR use barrel export
    import { Button } from '@/components/shared'
    ```

18. **Update lib imports:**
    ```typescript
    // Before
    import { apiClient } from '@/lib/api'

    // After (if moved to shared)
    import { apiClient } from '@/lib/shared/api'
    ```

19. **Update core imports:**
    ```typescript
    // Before
    import { db } from '@/core/db'

    // After (if moved to shared)
    import { db } from '@/core/shared/db'
    ```

### Phase 6: Update Barrel Exports

20. **Create index.ts files for clean imports:**
    ```typescript
    // src/components/shared/index.ts
    export * from './ui/button'
    export * from './ui/input'
    // ... other shared component exports
    ```

21. **Update main barrel exports:**
    ```typescript
    // src/components/index.ts (if keeping main index)
    export * from './shared'
    export * from './marketing'
    export * from './app'
    ```

### Phase 7: Update Documentation

22. **Update all documentation files to reflect new structure:**

#### README.md Updates:
- Update file structure diagram to show new organization
- Update import examples in code blocks
- Update component usage examples
- Update API middleware examples

**Before:**
```typescript
import { Button } from '@/components/ui/button'
import { db } from '@/core/db'
```

**After:**
```typescript
import { Button } from '@/components/shared'
import { db } from '@/core/shared'
```

#### CONTRIBUTING.md Updates:
- Update development setup instructions
- Update import examples in coding guidelines
- Update file organization examples
- Update testing setup instructions

#### API.md Updates:
- Update all import statements in API examples
- Update middleware usage examples
- Update component import examples
- Update route handler examples

#### AUTHENTICATION.md Updates:
- Update component import examples
- Update provider usage examples
- Update authentication flow examples

#### TENANTING.md Updates:
- Update import statements for tenant logic
- Update middleware examples
- Update database client examples

#### DEPLOYMENT.md Updates:
- Update any build configuration examples
- Update environment variable references
- Update deployment script examples

#### CUSTOMIZATION_GUIDE.md Updates:
- Update component import examples
- Update theming examples
- Update UI customization examples

### Documentation Update Strategy:

23. **Search and replace pattern:**
    ```powershell
    # Windows PowerShell commands for finding imports (use run_command tool)
    Get-ChildItem -Path "docs/" -Filter "*.md" -Recurse | Select-String -Pattern "@/components/"
    Get-ChildItem -Path "docs/" -Filter "*.md" -Recurse | Select-String -Pattern "@/lib/"
    Get-ChildItem -Path "docs/" -Filter "*.md" -Recurse | Select-String -Pattern "@/core/"
    ```

**🔧 Tool Reminder:** Use `grep_search` tool for searching file contents, not `run_command` for grep operations.

24. **Update each import systematically:**
    - `@/components/ui/*` → `@/components/shared/ui/*`
    - `@/components/customers/*` → `@/components/app/customers/*`
    - `@/lib/*` → `@/lib/shared/*` (if shared) or `@/lib/app/*` (if app-specific)
    - `@/core/*` → `@/core/shared/*` (if shared) or `@/core/app/*` (if app-specific)

25. **Verify documentation examples work:**
    - Test any code examples in documentation
    - Ensure all import paths are correct
    - Check that documentation builds correctly

26. **Update any inline code examples:**
    ```markdown
    # Before
    ```typescript
    import { CustomerFormModal } from '@/components/customers/customer-form-modal'
    ```

    # After
    ```typescript
    import { CustomerFormModal } from '@/components/app'
    ```
    ```

27. **Update file structure diagrams:**
    - Update README.md architecture diagrams
    - Update any folder structure illustrations
    - Update file organization examples

28. **Update contribution guidelines:**
    - Update coding standards examples
    - Update import organization examples
    - Update file naming conventions if changed

### Phase 8: Testing & Verification

**🔧 Tool Reminder:** Use `run_command` tool for npm/build commands, always specify `Cwd` and check exit codes.

29. **Run the application:**
    ```powershell
    # Use run_command tool with proper Cwd
    npm run dev
    ```

30. **Test all routes:**
    - Marketing pages: `/`, `/about`, `/contact`, `/faq`
    - Authentication: `/sign-in`, `/sign-up`
    - SaaS pages: `/dashboard`, `/onboarding/company-setup`
    - API routes: `/api/*`

31. **Verify imports work:**
    - Check browser console for import errors
    - Test all interactive features
    - Verify component rendering

32. **Run tests (if any exist):**
    ```powershell
    npm test
    ```

33. **Check TypeScript compilation:**
    ```powershell
    npm run build
    ```

**⚠️ Verification:** Always check `run_command` exit codes. If exit code ≠ 0, investigate the error before proceeding.

### Phase 9: Clean Up

**🔧 Tool Reminder:** Use `run_command` tool for cleanup operations. Use `list_dir` to verify empty directories.

34. **Remove empty directories:**
    ```powershell
    # Windows PowerShell commands for cleanup (use run_command tool)
    Get-ChildItem -Path "src/components" -Directory | Where-Object { $_.GetFileSystemInfos().Count -eq 0 } | Remove-Item
    Get-ChildItem -Path "src/lib" -Directory | Where-Object { $_.GetFileSystemInfos().Count -eq 0 } | Remove-Item
    Get-ChildItem -Path "src/core" -Directory | Where-Object { $_.GetFileSystemInfos().Count -eq 0 } | Remove-Item
    ```

35. **Update .gitignore if needed**

36. **Update any build/deployment scripts**

**⚠️ Verification:** Use `list_dir` tool to confirm directories were removed successfully.

## 🔍 Critical Considerations

### Next.js App Router Constraints
- ❌ **DO NOT move any files from `src/app/`**
- ❌ **DO NOT restructure `src/app/` directory**
- ✅ **Keep all route files in `src/app/`**

### Import Path Strategy
- Use barrel exports (`index.ts`) for clean imports
- Update all relative imports to absolute paths
- Consider keeping main index files for backward compatibility

### Testing Strategy
- Test all routes after restructuring
- Verify API endpoints still work
- Check component rendering
- Validate TypeScript compilation

## 🎯 Success Criteria

- ✅ Application builds successfully (`npm run build`)
- ✅ All routes work (`npm run dev`)
- ✅ No import errors in browser console
- ✅ All interactive features function
- ✅ TypeScript compilation passes
- ✅ File structure is clearly organized
- ✅ Documentation is updated

## 🚨 Potential Issues & Solutions

### Import Resolution Issues
- **Problem:** Absolute imports break after moving files
- **Solution:** Update all import statements to new paths

### Missing Exports
- **Problem:** Components not exported from new locations
- **Solution:** Create proper barrel exports (`index.ts`)

### Build Failures
- **Problem:** Next.js can't find moved files
- **Solution:** Ensure all imports are updated correctly

### TypeScript Errors
- **Problem:** Type imports break
- **Solution:** Update type import paths

## 📋 Checklist

- [ ] Directory structure created
- [ ] Files inventoried and categorized
- [ ] Files moved to correct locations
- [ ] Import paths updated
- [ ] Barrel exports created
- [ ] Documentation updated
- [ ] Application tested
- [ ] TypeScript compilation verified
- [ ] Empty directories cleaned up

## 🎉 Completion

After completing all steps, the codebase should have:
- Clear separation between marketing and SaaS code
- Maintainable file organization
- Working Next.js application
- Updated documentation
- All tests passing
