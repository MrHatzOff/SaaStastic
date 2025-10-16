# SaaStastic Distribution Builder
# Creates a clean distribution version of the codebase

param(
    [string]$OutputPath = "../saastastic-distribution",
    [switch]$DryRun
)

Write-Host ""
Write-Host "SaaStastic Distribution Builder" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Files and folders to EXCLUDE from distribution
$excludePatterns = @(
    # Internal documentation folders
    "docs\archived",
    "docs\launchPlan",
    "docs\shared",
    "docs\users",
    "docs\core",
    
    # Root-level internal docs
    "docs\onboarding.md",
    "docs\windsurfrules.md",
    "docs\fix-dialog-issue-plan.md",
    "docs\integration-plan.md",
    "docs\README.md",
    
    # Debug and test scripts
    "scripts\debug-company-context.ts",
    "scripts\debug-user.ts",
    "scripts\test-activity-api.ts",
    "scripts\test-companies-api.ts",
    "scripts\test-rbac-integration.ts",
    "scripts\test-team-api.ts",
    "scripts\check-activity-data.ts",
    "scripts\verify-rbac-state.ts",
    "scripts\seed-abc-company-activities.ts",
    "scripts\seed-sample-activities.ts",
    "scripts\manual-rbac-test-guide.md",
    "scripts\setup-stripe-products.js",
    
    # Utilities and distribution scripts
    "Utilities",
    "cleanup-docs.ps1",
    "cleanup-documentation.ps1",
    "create-distribution.ps1",
    "create-dist.ps1",
    "distribution-test.txt",
    
    # Database dumps
    "dump-09262025",
    "pg-dump-09-26-2025.sql",
    
    # Duplicate/old files
    ".gitignore.enhanced",
    "env.example",
    
    # IDE and environment files
    ".windsurf",
    ".vscode",
    ".idea",
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.test",
    ".git"
)

# Auto-exclude patterns (build artifacts, etc.)
$autoExclude = @(
    "node_modules",
    ".next",
    "test-results",
    "playwright-report",
    "coverage",
    ".clerk",
    "playwright/.clerk"
)

function Test-ShouldExclude {
    param([string]$path)
    
    # Check auto-exclude patterns (build artifacts)
    foreach ($pattern in $autoExclude) {
        if ($path -like "*$pattern*") {
            return $true
        }
    }
    
    # Check manual exclude patterns
    foreach ($pattern in $excludePatterns) {
        # Pattern contains backslash - it's a path pattern
        if ($pattern.Contains("\")) {
            # Check if path starts with pattern or contains it after a backslash
            if ($path -eq $pattern -or $path -like "$pattern\*" -or $path -like "*\$pattern" -or $path -like "*\$pattern\*") {
                return $true
            }
        }
        # No backslash - could be a root file or directory
        else {
            # Check if it's the exact path (root level file/dir)
            if ($path -eq $pattern) {
                return $true
            }
            # Check if it's a subdirectory starting from root
            if ($path -like "$pattern\*") {
                return $true
            }
        }
    }
    
    return $false
}

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be copied" -ForegroundColor Yellow
    Write-Host ""
}
else {
    if (Test-Path $OutputPath) {
        Write-Host "Output directory already exists: $OutputPath" -ForegroundColor Red
        $response = Read-Host "Delete and continue? (yes/no)"
        if ($response -ne "yes") {
            Write-Host "Aborted" -ForegroundColor Red
            exit 1
        }
        Remove-Item -Path $OutputPath -Recurse -Force
        Write-Host "Deleted existing directory" -ForegroundColor Green
        Write-Host ""
    }
    
    New-Item -ItemType Directory -Path $OutputPath | Out-Null
    Write-Host "Created output directory: $OutputPath" -ForegroundColor Green
    Write-Host ""
}

# Get all files
Write-Host "Analyzing files..." -ForegroundColor Cyan
$allItems = Get-ChildItem -Path . -Recurse -Force -ErrorAction SilentlyContinue

# Separate included and excluded
$includedItems = @()
$excludedItems = @()
$currentPath = (Get-Location).Path

foreach ($item in $allItems) {
    $fullPath = $item.FullName
    $pathLen = $currentPath.Length + 1
    $relativePath = $fullPath.Substring($pathLen)
    
    if (Test-ShouldExclude $relativePath) {
        $excludedItems += $item
    }
    else {
        $includedItems += $item
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Total items: $($allItems.Count)"
Write-Host "  To include: $($includedItems.Count)" -ForegroundColor Green
Write-Host "  To exclude: $($excludedItems.Count)" -ForegroundColor Red
Write-Host ""

if ($DryRun) {
    Write-Host "Files that WILL be included:" -ForegroundColor Green
    Write-Host "============================" -ForegroundColor Green
    
    $fileCount = 0
    foreach ($item in $includedItems) {
        if ($item.PSIsContainer -eq $false) {
            $fullPath = $item.FullName
            $pathLen = $currentPath.Length + 1
            $relativePath = $fullPath.Substring($pathLen)
            Write-Host "  + $relativePath" -ForegroundColor DarkGreen
            $fileCount++
        }
    }
    
    Write-Host ""
    Write-Host "Files that WILL be excluded:" -ForegroundColor Red
    Write-Host "============================" -ForegroundColor Red
    
    $excludedCount = 0
    foreach ($item in $excludedItems) {
        if ($item.PSIsContainer -eq $false) {
            $excludedCount++
            if ($excludedCount -le 50) {
                $fullPath = $item.FullName
                $pathLen = $currentPath.Length + 1
                $relativePath = $fullPath.Substring($pathLen)
                Write-Host "  - $relativePath" -ForegroundColor DarkGray
            }
        }
    }
    
    if ($excludedCount -gt 50) {
        $remaining = $excludedCount - 50
        Write-Host "  ... and $remaining more files" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "Run without -DryRun to create distribution" -ForegroundColor Yellow
}
else {
    Write-Host "Copying files..." -ForegroundColor Cyan
    $copiedFiles = 0
    $copiedDirs = 0
    
    foreach ($item in $includedItems) {
        $fullPath = $item.FullName
        $pathLen = $currentPath.Length + 1
        $relativePath = $fullPath.Substring($pathLen)
        $destPath = Join-Path $OutputPath $relativePath
        
        if ($item.PSIsContainer) {
            if (-not (Test-Path $destPath)) {
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
                $copiedDirs++
            }
        }
        else {
            $destDir = Split-Path $destPath -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item $fullPath $destPath -Force
            $copiedFiles++
            
            if ($copiedFiles % 100 -eq 0) {
                Write-Host "  Copied $copiedFiles files..." -ForegroundColor DarkGray
            }
        }
    }
    
    Write-Host ""
    Write-Host "Distribution created!" -ForegroundColor Green
    Write-Host "  Directories: $copiedDirs" -ForegroundColor Green
    Write-Host "  Files: $copiedFiles" -ForegroundColor Green
    Write-Host "  Location: $OutputPath" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy customer README: cp docs-templates/customer-README.md $OutputPath/README.md"
    Write-Host "2. Copy LICENSE: cp docs-templates/LICENSE-COMMERCIAL.md $OutputPath/LICENSE"
    Write-Host "3. Test: cd $OutputPath && npm install && npm run dev"
    Write-Host "4. Create GitHub repo and push"
}

Write-Host ""
