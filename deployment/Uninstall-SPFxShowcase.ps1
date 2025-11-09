<#
.SYNOPSIS
    Uninstalls the SPFx Showcase solution from SharePoint

.DESCRIPTION
    This script removes pages, uninstalls the app from the site, and optionally
    removes it from the App Catalog.

.PARAMETER SiteUrl
    The site URL where the solution is installed

.PARAMETER AppCatalogUrl
    The App Catalog URL (optional - for complete removal)

.PARAMETER RemoveFromAppCatalog
    Remove the solution from the App Catalog completely

.PARAMETER KeepPages
    Keep the pages but remove the webparts

.EXAMPLE
    .\Uninstall-SPFxShowcase.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"

.EXAMPLE
    .\Uninstall-SPFxShowcase.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase" -RemoveFromAppCatalog

.NOTES
    Requires: PnP.PowerShell module
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [string]$AppCatalogUrl,

    [Parameter(Mandatory = $false)]
    [switch]$RemoveFromAppCatalog,

    [Parameter(Mandatory = $false)]
    [switch]$KeepPages
)

$ErrorActionPreference = "Stop"
$AppName = "spfx-showcase-client-side-solution"

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

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

try {
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Magenta"
    Write-ColorOutput "   SPFx Showcase Uninstall Script" "Magenta"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Magenta"
    Write-Host ""

    Write-Warning "This will remove the SPFx Showcase solution from: $SiteUrl"
    Write-Host ""
    $confirm = Read-Host "Are you sure you want to continue? (Y/N)"

    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "Uninstall cancelled." -ForegroundColor Yellow
        exit 0
    }

    # Step 1: Connect to site
    Write-Step "Connecting to site..."
    Connect-PnPOnline -Url $SiteUrl -Interactive
    Write-Success "Connected successfully"

    # Step 2: Remove pages
    if (-not $KeepPages) {
        Write-Step "Removing pages..."

        try {
            $showcasePage = Get-PnPPage -Identity "Showcase.aspx" -ErrorAction SilentlyContinue
            if ($showcasePage) {
                Remove-PnPPage -Identity "Showcase.aspx" -Force
                Write-Success "Removed: Showcase.aspx"
            }
            else {
                Write-Warning "Page not found: Showcase.aspx"
            }
        }
        catch {
            Write-Warning "Failed to remove Showcase.aspx: $($_.Exception.Message)"
        }

        try {
            $devToolkitPage = Get-PnPPage -Identity "DevToolkit.aspx" -ErrorAction SilentlyContinue
            if ($devToolkitPage) {
                Remove-PnPPage -Identity "DevToolkit.aspx" -Force
                Write-Success "Removed: DevToolkit.aspx"
            }
            else {
                Write-Warning "Page not found: DevToolkit.aspx"
            }
        }
        catch {
            Write-Warning "Failed to remove DevToolkit.aspx: $($_.Exception.Message)"
        }
    }
    else {
        Write-Warning "Skipping page removal (KeepPages flag set)"
    }

    # Step 3: Uninstall app from site
    Write-Step "Uninstalling app from site..."

    try {
        $app = Get-PnPApp | Where-Object { $_.Title -eq $AppName -and $_.InstalledVersion }

        if ($app) {
            Uninstall-PnPApp -Identity $app.Id
            Write-Success "App uninstalled from site"

            # Wait for uninstall
            Write-Host "  Waiting for uninstall to complete..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
        else {
            Write-Warning "App is not installed on this site"
        }
    }
    catch {
        Write-Warning "Failed to uninstall app: $($_.Exception.Message)"
    }

    # Step 4: Remove from App Catalog (optional)
    if ($RemoveFromAppCatalog) {
        Write-Step "Removing from App Catalog..."

        if (-not $AppCatalogUrl) {
            Write-Host "  Detecting App Catalog URL..." -ForegroundColor Gray
            $AppCatalogUrl = Get-PnPTenantAppCatalogUrl
        }

        if ($AppCatalogUrl) {
            Write-Host "  Connecting to App Catalog: $AppCatalogUrl" -ForegroundColor Gray
            Connect-PnPOnline -Url $AppCatalogUrl -Interactive

            try {
                $catalogApp = Get-PnPApp -Scope Tenant | Where-Object { $_.Title -eq $AppName }

                if ($catalogApp) {
                    Remove-PnPApp -Identity $catalogApp.Id -Scope Tenant
                    Write-Success "Removed from App Catalog"
                }
                else {
                    Write-Warning "App not found in App Catalog"
                }
            }
            catch {
                Write-ErrorMsg "Failed to remove from App Catalog: $($_.Exception.Message)"
            }
        }
        else {
            Write-Warning "Could not detect App Catalog URL. Use -AppCatalogUrl parameter."
        }
    }

    # Success summary
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Green"
    Write-ColorOutput "   Uninstall Completed!" "Green"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Green"
    Write-Host ""

    Write-Host "Summary:" -ForegroundColor Cyan
    if (-not $KeepPages) {
        Write-Host "  ✓ Pages removed" -ForegroundColor Green
    }
    else {
        Write-Host "  ○ Pages kept" -ForegroundColor Yellow
    }
    Write-Host "  ✓ App uninstalled from site" -ForegroundColor Green
    if ($RemoveFromAppCatalog) {
        Write-Host "  ✓ Removed from App Catalog" -ForegroundColor Green
    }
    else {
        Write-Host "  ○ Still available in App Catalog" -ForegroundColor Yellow
    }
    Write-Host ""
}
catch {
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Red"
    Write-ColorOutput "   Uninstall Failed!" "Red"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Red"
    Write-Host ""
    Write-ErrorMsg "Error: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Gray
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""
    exit 1
}
