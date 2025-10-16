# SaaStastic Distribution Builder
# Creates a clean distribution version of the codebase for customers
# Excludes internal docs, development scripts, and business planning materials

param(
    [string]$OutputPath = "../saastastic-distribution",
    [switch]$DryRun
)

Write-Host "`n🚀 SaaStastic Distribution Builder" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Files and folders to EXCLUDE from distribution
$excludePatterns = @(
    # Documentation - Internal Only
    "docs/archived",
    "docs/launchPlan",
    "docs/guidesForVibers",
    "docs/shared",
    "docs/users",
    "docs/onboarding.md",
    "docs/windsurfrules.md",
    "docs/fix-dialog-issue-plan.md",
    "docs/integration-plan.md",
    "docs/README.md",
    
    # Scripts - Development/Debug Only
    "scripts/debug-company-context.ts",
    "scripts/debug-user.ts",
    "scripts/test-activity-api.ts",
    "scripts/test-companies-api.ts",
    "scripts/test-rbac-integration.ts",
    "scripts/test-team-api.ts",
    "scripts/check-activity-data.ts",
    "scripts/verify-rbac-state.ts",
    "scripts/seed-abc-company-activities.ts",
    "scripts/seed-sample-activities.ts",
    "scripts/manual-rbac-test-guide.md",
    "scripts/setup-stripe-products.js",
    
    # Utilities - Personal Tools
    "Utilities",
    
    # Cleanup Scripts
    "cleanup-docs.ps1",
    "cleanup-documentation.ps1",
    "create-distribution.ps1",
    
    # Database Dumps
    "dump-09262025",
    "pg-dump-09-26-2025.sql",
    
    # Duplicate Files
    ".gitignore.enhanced",
    "env.example",
    
    # IDE Specific
    ".windsurf",
    ".vscode",
    ".idea",
    
    # Environment Files (customers create their own)
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.test",
    
    # Git
    ".git"
)

# Additional patterns for automatic exclusion (already in .gitignore)
$autoExcludePatterns = @(
    "node_modules",
    ".next",
    "test-results",
    "playwright-report",
    "coverage",
    ".clerk",
    "playwright/.clerk"
)

function Test-ShouldExclude {
    param([string]$relativePath)
    
    # Check auto-exclude patterns first
    foreach ($pattern in $autoExcludePatterns) {
        if ($relativePath -like "*$pattern*") {
            return $true
        }
    }
    
    # Check manual exclude patterns
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like "$pattern*" -or $relativePath -like "*/$pattern*") {
            return $true
        }
    }
    
    return $false
}

if ($DryRun) {
    Write-Host "📋 DRY RUN MODE - No files will be copied" -ForegroundColor Yellow
    Write-Host ""
} else {
    # Check if output path exists
    if (Test-Path $OutputPath) {
        Write-Host "⚠️  Output directory already exists: $OutputPath" -ForegroundColor Red
        $response = Read-Host "Do you want to delete it and continue? (yes/no)"
        if ($response -ne "yes") {
            Write-Host "❌ Aborted." -ForegroundColor Red
            exit 1
        }
        Remove-Item -Path $OutputPath -Recurse -Force
        Write-Host "✅ Deleted existing directory" -ForegroundColor Green
        Write-Host ""
    }
    
    # Create output directory
    New-Item -ItemType Directory -Path $OutputPath | Out-Null
    Write-Host "✅ Created output directory: $OutputPath" -ForegroundColor Green
    Write-Host ""
}

# Get all files
Write-Host "📁 Analyzing files..." -ForegroundColor Cyan
$allItems = Get-ChildItem -Path . -Recurse -Force -ErrorAction SilentlyContinue

# Separate into included and excluded
$includedItems = @()
$excludedItems = @()

foreach ($item in $allItems) {
    $relativePath = $item.FullName.Substring((Get-Location).Path.Length + 1)
    
    if (Test-ShouldExclude $relativePath) {
        $excludedItems += $item
    } else {
        $includedItems += $item
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Total items scanned: $($allItems.Count)"
Write-Host "  Items to include: $($includedItems.Count)" -ForegroundColor Green
Write-Host "  Items to exclude: $($excludedItems.Count)" -ForegroundColor Red
Write-Host ""

if ($DryRun) {
    Write-Host "✅ Files that WILL be included:" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    
    $currentPath = (Get-Location).Path
    foreach ($item in $includedItems) {
        if ($item.PSIsContainer -eq $false) {
            $fullPath = $item.FullName
            $pathLength = $currentPath.Length + 1
            $relativePath = $fullPath.Substring($pathLength)
            Write-Host "  ✓ $relativePath" -ForegroundColor DarkGreen
        }
    }
    
    Write-Host ""
    Write-Host "❌ Files that WILL be excluded:" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    
    $count = 0
    foreach ($item in $excludedItems) {
        if ($item.PSIsContainer -eq $false) {
            $count = $count + 1
            if ($count -le 50) {
                $fullPath = $item.FullName
                $relativePath = $fullPath.Substring($pathLength)
                Write-Host "  ✗ $relativePath" -ForegroundColor DarkGray
            }
        }
    }
    
    if ($count -gt 50) {
        $remaining = $count - 50
        Write-Host "  ... and $remaining more" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "💡 Run without -DryRun flag to create actual distribution" -ForegroundColor Yellow
}
else {
    # Copy files
    Write-Host "📦 Copying files to distribution folder..." -ForegroundColor Cyan
    $copiedFiles = 0
    $copiedDirs = 0
    
    foreach ($item in $includedItems) {
        $relativePath = $item.FullName.Substring((Get-Location).Path.Length + 1)
        $destPath = Join-Path $OutputPath $relativePath
        
        if ($item.PSIsContainer) {
            if (-not (Test-Path $destPath)) {
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
                $copiedDirs++
            }
        } else {
            $destDir = Split-Path $destPath -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item $item.FullName $destPath -Force
            $copiedFiles++
            
            # Progress indicator
            if ($copiedFiles % 100 -eq 0) {
                Write-Host "  Copied $copiedFiles files..." -ForegroundColor DarkGray
            }
        }
    }
    
    Write-Host ""
    Write-Host "✅ Distribution created successfully!" -ForegroundColor Green
    Write-Host "  Directories: $copiedDirs" -ForegroundColor Green
    Write-Host "  Files: $copiedFiles" -ForegroundColor Green
    Write-Host "  Location: $OutputPath" -ForegroundColor Green
    Write-Host ""
    
    # Check for required files
    Write-Host "🔍 Checking for required files..." -ForegroundColor Cyan
    $requiredFiles = @(
        "README.md",
        ".env.example",
        "package.json",
        "tsconfig.json",
        "next.config.ts"
    )
    
    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $OutputPath $file
        if (Test-Path $filePath) {
            Write-Host "  ✓ $file" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
            $missingFiles += $file
        }
    }
    
    Write-Host ""
    
    if ($missingFiles.Count -gt 0) {
        Write-Host "⚠️  WARNING: Missing required files!" -ForegroundColor Yellow
        Write-Host "   You need to create these files before distribution:" -ForegroundColor Yellow
        $missingFiles | ForEach-Object {
            Write-Host "   - $_" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    # Next steps
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "  1. Review the distribution folder: $OutputPath"
    Write-Host "  2. ⚠️  Create customer-facing README.md (if missing)"
    Write-Host "  3. ⚠️  Add LICENSE file"
    Write-Host "  4. Test that the app runs from the distribution folder:"
    Write-Host "     cd $OutputPath"
    Write-Host "     npm install"
    Write-Host "     npm run dev"
    Write-Host "  5. Create private GitHub repository"
    Write-Host "  6. Push distribution to GitHub:"
    Write-Host "     cd $OutputPath"
    Write-Host "     git init"
    Write-Host "     git add ."
    Write-Host "     git commit -m `"SaaStastic v1.0 - Initial Distribution`""
    Write-Host "     git remote add origin <your-repo-url>"
    Write-Host "     git push -u origin main"
    Write-Host "  7. Add customers as collaborators when they purchase"
    Write-Host ""
    Write-Host "✨ Distribution ready for testing!" -ForegroundColor Green
}

Write-Host ""
