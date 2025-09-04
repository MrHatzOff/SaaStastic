# Get-CleanTree.ps1
# Script to generate a clean project structure tree for code projects, 
# ignoring build artifacts, node_modules, and other non-essential files
# 
# Author: Cascade
# Date: 2025-04-17
#
# =================================================================
# INSTRUCTIONS:
# =================================================================
# 
# PURPOSE:
#   This script generates a clean directory tree representation of your code project,
#   excluding build artifacts, dependency directories, and other non-essential files
#   that would clutter the output. The result is saved in both markdown and
#   (optionally) text format.
#
# USAGE:
#   1. Save this script in your project's root directory or any location of your choice
#   2. Open PowerShell and navigate to the directory containing this script
#   3. Run the script with desired parameters:
#      - Basic usage: ./Get-CleanTree.ps1
#      - With custom root: ./Get-CleanTree.ps1 -RootPath "C:/MyProject"
#      - With custom output: ./Get-CleanTree.ps1 -OutputPath "MyStructure.md"
#      - With text output: ./Get-CleanTree.ps1 -AlsoOutputTxt
#
# PARAMETERS:
#   -RootPath: The root directory to start generating the tree from.
#              Default: Current directory (.)
#
#   -OutputPath: The path where the markdown output will be saved.
#                Default: ProjectStructure.md in the current directory
#
#   -AlsoOutputTxt: Switch to also generate a plain text version of the output.
#                   The file will have the same name as OutputPath but with .txt extension.
#                   Default: Disabled (only markdown output is generated)
#
# OUTPUT:
#   The script creates a file with the tree structure in markdown format.
#   If -AlsoOutputTxt is specified, it also creates a plain text version.
#   Both files will be saved to the location specified by OutputPath
#   (or ProjectStructure.md/.txt in the current directory by default).
#
# CUSTOMIZATION:
#   You can customize the ignored directories and files by modifying the $IgnoreList array(Line 57).
#   Add patterns for any additional files or directories you want to exclude.
#
# =================================================================

param (
    [string]$RootPath = ".",
    [string]$OutputPath = "ProjectStructure.md",
    [switch]$AlsoOutputTxt
)

# Directories and files to ignore
$IgnoreList = @(
    # Dependency directories
    "node_modules",
    "bower_components",
    "vendor",
    # "packages", # Removed as it contains essential shared code
    ".nuget",
    "venv",
    # ".env", # Replaced by wildcard below
    "env",
    ".venv",
    "__pycache__",
    ".turbo",
    ".next",
    
    # Version control
    ".git",
    ".svn",
    ".hg",
    
    # Build directories
    "dist",
    "build",
    "out",
    "bin",
    "obj",
    "target",
    
    # Cache directories
    # ".next/cache", # Covered by .next
    ".cache",
    ".parcel-cache",
    ".webpack",
    
    # IDE and editor directories
    ".vscode",
    ".idea",
    ".vs",
    ".project",
    
    # Test and coverage
    "coverage",
    ".nyc_output",
    "test-results", # Added for completeness

    # OS and metadata files
    ".DS_Store",
    "Thumbs.db",

    # Config files less relevant to structure
    "components.json", # shadcn-ui config
    "jest-e2e.json",

    # Specific file patterns to ignore
    ".env*",         # Ignore all environment files
    "*.log",         # Ignore all log files
    "*.tsbuildinfo"  # Ignore TypeScript build info files
)

# Get current date and time
$CurrentDateTime = Get-Date -Format "MM/dd/yyyy HH:mm:ss"

# Initialize output strings
$OutputHeader = "Project Structure at $CurrentDateTime`r`n"
$OutputHeader += "-" * 40 + "`r`n`r`n"

# Initialize output content
$OutputContent = ""

function Should-Ignore {
    param (
        [string]$Path
    )
    
    # Get the relative path from the root
    $RelativePath = $Path.Substring($RootPath.Length).TrimStart('\\')
    if ($RelativePath -eq "") {
        $RelativePath = "."
    }
    
    # Get the file/directory name
    $Name = Split-Path -Leaf $Path
    
    # Check against ignore list
    foreach ($IgnoreItem in $IgnoreList) {
        # Handle wildcards
        if ($IgnoreItem.Contains("*")) {
            $WildcardPattern = $IgnoreItem -replace "\*", ".*"
            if ($Name -match $WildcardPattern -or $RelativePath -match $WildcardPattern) {
                return $true
            }
        }
        # Handle exact matches
        elseif (
            $Name -eq $IgnoreItem -or
            $RelativePath -eq $IgnoreItem -or
            $RelativePath.StartsWith("$IgnoreItem\\") -or
            $RelativePath.Contains("\\$IgnoreItem\\") -or
            $RelativePath.EndsWith("\\$IgnoreItem")
        ) {
            return $true
        }
    }
    
    return $false
}

function Get-DirectoryTree {
    param (
        [string]$Path,
        [int]$Level = 0
    )
    
    # Skip if it should be ignored
    if ($Level -gt 0 -and (Should-Ignore -Path $Path)) {
        return
    }
    
    # Create indent based on level
    $Indent = ""
    for ($i = 0; $i -lt $Level; $i++) {
        $Indent += "  "
    }
    
    # Add the current directory to the output
    if ($Level -gt 0) {
        $Name = Split-Path -Leaf $Path
        $script:OutputContent += "$Indent|-- $Name`r`n"
    }
    
    # Get all items in this directory
    $Items = @()
    try {
        $Items = Get-ChildItem -Path $Path -Force -ErrorAction SilentlyContinue | 
        Sort-Object { - $_.PSIsContainer }, { $_.Name } # Directories first, then files
    }
    catch {
        Write-Warning "Could not access ${Path}: $($_.Exception.Message)"
        return
    }
    
    # Process directories
    $Directories = $Items | Where-Object { $_.PSIsContainer }
    foreach ($Directory in $Directories) {
        if (-not (Should-Ignore -Path $Directory.FullName)) {
            Get-DirectoryTree -Path $Directory.FullName -Level ($Level + 1)
        }
    }
    
    # Process files
    $Files = $Items | Where-Object { -not $_.PSIsContainer }
    foreach ($File in $Files) {
        if (-not (Should-Ignore -Path $File.FullName)) {
            $FileIndent = $Indent + "  "
            $script:OutputContent += "$FileIndent|-- $($File.Name)`r`n"
        }
    }
}

# Ensure root path is absolute
try {
    $RootPath = (Resolve-Path $RootPath -ErrorAction Stop).Path
}
catch {
    Write-Error "Error: The specified root path '$RootPath' does not exist or is not accessible."
    exit 1
}

# Verify the root path is a directory
if (-not (Test-Path -Path $RootPath -PathType Container)) {
    Write-Error "Error: The specified root path '$RootPath' is not a directory."
    exit 1
}

Write-Host "Generating project structure from '$RootPath'..."
Write-Host "This may take a moment depending on the size of your project..."

# Call the function to build the directory tree
Get-DirectoryTree -Path $RootPath

# Create the final output
$FinalOutput = $OutputHeader + $OutputContent

# Ensure the output directory exists
$OutputDir = Split-Path -Parent $OutputPath
if ($OutputDir -and -not (Test-Path -Path $OutputDir -PathType Container)) {
    New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null
}

# Save to file
try {
    $FinalOutput | Out-File -FilePath $OutputPath -Encoding UTF8 -ErrorAction Stop
    Write-Host " Project structure saved to $OutputPath"
    
    # Save to text file if requested
    if ($AlsoOutputTxt) {
        $TxtOutputPath = [System.IO.Path]::ChangeExtension($OutputPath, "txt")
        $FinalOutput | Out-File -FilePath $TxtOutputPath -Encoding UTF8 -ErrorAction Stop
        Write-Host " Project structure also saved to $TxtOutputPath"
    }
}
catch {
    Write-Error "Error saving output file: $($_.Exception.Message)"
    exit 1
}

Write-Host "Done!" -ForegroundColor Green
Write-Host "Ignored patterns: $($IgnoreList.Count) patterns configured"
