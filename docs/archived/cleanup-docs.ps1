# Documentation Cleanup Script
# Date: October 9, 2025

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Documentation Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Working directory: $scriptDir" -ForegroundColor Green
Write-Host ""

# Create archive directories
Write-Host "[STEP 1] Creating archive directories..." -ForegroundColor Yellow

$archiveDirs = @(
    "docs\archived\session-summaries",
    "docs\archived\session-planning",
    "docs\archived\old-plans",
    "docs\archived\completed-tasks",
    "docs\archived\architecture-history"
)

foreach ($dir in $archiveDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Green
    }
}

Write-Host ""

# Archive root files
Write-Host "[STEP 2] Archiving root directory files..." -ForegroundColor Yellow

$rootFiles = @{
    "DEPENDENCY_UPDATE_PLAN.md" = "docs\archived\session-planning"
    "DOCUMENTATION_CLEANUP_PLAN.md" = "docs\archived\session-planning"
    "DOCUMENTATION_ORGANIZATION.md" = "docs\archived\session-planning"
    "MARKETING_PRIMER_SAASTASTIC.md" = "docs\archived\session-planning"
    "QUICK_START_GUIDE.md" = "docs\archived\session-planning"
    "QUICK_START_NEXT_STEPS.md" = "docs\archived\session-planning"
    "REORGANIZATION_CHECKLIST.md" = "docs\archived\session-planning"
    "START_HERE.md" = "docs\archived\session-planning"
    "START_HERE_NEXT_SESSION.md" = "docs\archived\session-planning"
}

foreach ($file in $rootFiles.Keys) {
    if (Test-Path $file) {
        $dest = Join-Path $rootFiles[$file] $file
        Move-Item -Path $file -Destination $dest -Force
        Write-Host "  Archived: $file" -ForegroundColor Green
    }
}

Write-Host ""

# Archive session summaries
Write-Host "[STEP 3] Archiving session summaries..." -ForegroundColor Yellow

$sessionFiles = @(
    "docs\core\SESSION_SUMMARY_2025-10-01.md",
    "docs\core\SESSION_SUMMARY_2025-10-05.md",
    "docs\core\CURRENTNOTES.md"
)

foreach ($file in $sessionFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path -Leaf $file
        Move-Item -Path $file -Destination "docs\archived\session-summaries\$fileName" -Force
        Write-Host "  Archived: $fileName" -ForegroundColor Green
    }
}

Write-Host ""

# Archive old plans
Write-Host "[STEP 4] Archiving old plans..." -ForegroundColor Yellow

$oldPlans = @(
    "docs\core\BOILERPLATE_LAUNCH_PLAN.md",
    "docs\core\NEXT_SESSION_QUICK_START.md",
    "docs\core\CLEANUP_AND_ORGANIZATION_PLAN_V2.md",
    "docs\core\DEPLOYMENT_READINESS_REPORT.md",
    "docs\core\PRODUCTION_READINESS_PLAN.md",
    "docs\core\PRODUCTION_DEPLOYMENT_CHECKLIST.md",
    "docs\core\DIRECTOR_ONBOARDING_SUMMARY.md",
    "docs\core\DOCUMENTATION_INDEX.md",
    "docs\core\documentation-summary.md",
    "docs\core\error-context.md",
    "docs\core\PREMIUM_PRICING_STRATEGY.md",
    "docs\core\PRICING_MODEL_COMPARISON.md"
)

foreach ($file in $oldPlans) {
    if (Test-Path $file) {
        $fileName = Split-Path -Leaf $file
        Move-Item -Path $file -Destination "docs\archived\old-plans\$fileName" -Force
        Write-Host "  Archived: $fileName" -ForegroundColor Green
    }
}

Write-Host ""

# Archive completed tasks
Write-Host "[STEP 5] Archiving completed tasks..." -ForegroundColor Yellow

$completedTasks = @(
    "docs\core\STRIPE_V19_FIX_SUMMARY.md",
    "docs\core\STRIPE_V19_MIGRATION.md",
    "docs\core\STRIPE_V19_MIGRATION_GUIDE.md",
    "docs\core\QUICK_FIX_COMMANDS.md",
    "docs\core\QUICK_FIXES_APPLIED.md"
)

foreach ($file in $completedTasks) {
    if (Test-Path $file) {
        $fileName = Split-Path -Leaf $file
        Move-Item -Path $file -Destination "docs\archived\completed-tasks\$fileName" -Force
        Write-Host "  Archived: $fileName" -ForegroundColor Green
    }
}

Write-Host ""

# Archive old architecture files
Write-Host "[STEP 6] Archiving old architecture files..." -ForegroundColor Yellow

$archFiles = @(
    "docs\core\architecture\10-6-25_FileStructure&Descriptions.md",
    "docs\core\architecture\FileStructure-Oct_6_2025.md"
)

foreach ($file in $archFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path -Leaf $file
        Move-Item -Path $file -Destination "docs\archived\architecture-history\$fileName" -Force
        Write-Host "  Archived: $fileName" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation is now organized:" -ForegroundColor Yellow
Write-Host "  - Root: 5 essential files" -ForegroundColor White
Write-Host "  - docs/launchPlan: 8 active launch files" -ForegroundColor White
Write-Host "  - docs/guides: 6 customer guides" -ForegroundColor White
Write-Host "  - docs/core: 12 current references" -ForegroundColor White
Write-Host "  - docs/archived: 30 historical files" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review docs/launchPlan/NEW_SESSION_SUMMARY.md" -ForegroundColor White
Write-Host "  2. Start with MASTER_LAUNCH_PLAN.md when ready to launch" -ForegroundColor White
Write-Host ""
