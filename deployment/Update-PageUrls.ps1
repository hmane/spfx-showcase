<#
.SYNOPSIS
    Updates the cross-linking URLs in both webparts after deployment

.DESCRIPTION
    This helper script updates the hardcoded page URLs in the Showcase and DeveloperToolkit
    components to match your actual SharePoint site URL.

.PARAMETER SiteUrl
    The SharePoint site URL (e.g., https://contoso.sharepoint.com/sites/showcase)

.EXAMPLE
    .\Update-PageUrls.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"

.NOTES
    This script modifies the source TypeScript files. Run this before building your solution.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n▶ $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

try {
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Magenta"
    Write-ColorOutput "   Update Page URLs" "Magenta"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Magenta"
    Write-Host ""

    # Parse site URL
    $uri = [System.Uri]$SiteUrl
    $siteRelativePath = $uri.LocalPath

    Write-Step "Site URL: $SiteUrl"
    Write-Host "  Site relative path: $siteRelativePath" -ForegroundColor Gray

    # File paths
    $showcasePath = "../src/webparts/showcase/components/Showcase.tsx"
    $devToolkitPath = "../src/webparts/developerToolkit/components/DeveloperToolkit.tsx"

    # Update Showcase.tsx
    Write-Step "Updating Showcase.tsx..."

    if (-not (Test-Path $showcasePath)) {
        Write-ErrorMsg "File not found: $showcasePath"
        exit 1
    }

    $showcaseContent = Get-Content $showcasePath -Raw
    $oldUrl = '/sites/YourSite/SitePages/DevToolkit.aspx'
    $newUrl = "$siteRelativePath/SitePages/DevToolkit.aspx"

    if ($showcaseContent -match [regex]::Escape($oldUrl)) {
        $showcaseContent = $showcaseContent -replace [regex]::Escape($oldUrl), $newUrl
        $showcaseContent | Out-File -FilePath $showcasePath -Encoding UTF8 -NoNewline
        Write-Success "Updated: $oldUrl → $newUrl"
    }
    else {
        Write-Success "URL already updated or not found"
    }

    # Update DeveloperToolkit.tsx
    Write-Step "Updating DeveloperToolkit.tsx..."

    if (-not (Test-Path $devToolkitPath)) {
        Write-ErrorMsg "File not found: $devToolkitPath"
        exit 1
    }

    $devToolkitContent = Get-Content $devToolkitPath -Raw
    $oldUrl = '/sites/YourSite/SitePages/Showcase.aspx'
    $newUrl = "$siteRelativePath/SitePages/Showcase.aspx"

    if ($devToolkitContent -match [regex]::Escape($oldUrl)) {
        $devToolkitContent = $devToolkitContent -replace [regex]::Escape($oldUrl), $newUrl
        $devToolkitContent | Out-File -FilePath $devToolkitPath -Encoding UTF8 -NoNewline
        Write-Success "Updated: $oldUrl → $newUrl"
    }
    else {
        Write-Success "URL already updated or not found"
    }

    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Green"
    Write-ColorOutput "   URLs Updated Successfully!" "Green"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Green"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Build the solution:" -ForegroundColor White
    Write-Host "     gulp bundle --ship" -ForegroundColor Gray
    Write-Host "     gulp package-solution --ship" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Deploy using:" -ForegroundColor White
    Write-Host "     .\Deploy-SPFxShowcase.ps1 -SiteUrl '$SiteUrl'" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Red"
    Write-ColorOutput "   Update Failed!" "Red"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Red"
    Write-Host ""
    Write-ErrorMsg "Error: $($_.Exception.Message)"
    Write-Host ""
    exit 1
}
