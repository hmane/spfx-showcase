<#
.SYNOPSIS
    Applies PnP provisioning template to deploy SPFx Showcase solution

.DESCRIPTION
    This script uses PnP PowerShell to apply a provisioning template that:
    - Uploads and deploys the .sppkg to Site Collection App Catalog
    - Installs the app to the site
    - Creates Showcase.aspx and DevToolkit.aspx pages
    - Adds navigation links

    Uses ClientId authentication and site collection app catalog.

.PARAMETER SiteUrl
    The target site URL where the solution will be deployed

.PARAMETER TemplatePath
    Path to the PnP provisioning template (defaults to ./provisioning-template.xml)

.PARAMETER SolutionPath
    Path to the .sppkg file (defaults to ../sharepoint/solution/spfx-showcase.sppkg)

.PARAMETER SkipAppUpload
    Skip uploading the app to App Catalog (if already uploaded)

.PARAMETER Handlers
    Specific handlers to apply (default: All). Options: Pages, Navigation

.EXAMPLE
    .\Apply-Provisioning.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"

.EXAMPLE
    .\Apply-Provisioning.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase" -SkipAppUpload

.EXAMPLE
    .\Apply-Provisioning.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase" -Handlers "Pages,Navigation"

.NOTES
    Requires: PnP.PowerShell module (Install-Module -Name PnP.PowerShell)
    Uses ClientId: 970bb320-0d49-4b4a-aa8f-c3f4b1e5928f for authentication
    Uses site collection app catalog
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [string]$TemplatePath = "./provisioning-template.xml",

    [Parameter(Mandatory = $false)]
    [string]$SolutionPath = "../sharepoint/solution/spfx-showcase.sppkg",

    [Parameter(Mandatory = $false)]
    [switch]$SkipAppUpload,

    [Parameter(Mandatory = $false)]
    [string]$Handlers = "All"
)

$ErrorActionPreference = "Stop"
$ClientId = "970bb320-0d49-4b4a-aa8f-c3f4b1e5928f"
$AppId = "d64da1f1-2376-4458-beed-2a222b12247a"
$AppTitle = "spfx-showcase-client-side-solution"

# Helper functions
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
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
    Write-ColorOutput "   SPFx Showcase - PnP Provisioning" "Magenta"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Magenta"
    Write-Host ""

    # Step 1: Check prerequisites
    Write-Step "Checking prerequisites..."

    # Check PnP PowerShell
    $pnpModule = Get-Module -Name PnP.PowerShell -ListAvailable
    if (-not $pnpModule) {
        Write-ErrorMsg "PnP.PowerShell module not found!"
        Write-Host ""
        Write-Host "Install it with:" -ForegroundColor Yellow
        Write-Host "  Install-Module -Name PnP.PowerShell -Scope CurrentUser" -ForegroundColor White
        Write-Host ""
        exit 1
    }
    Write-Success "PnP.PowerShell module found (Version: $($pnpModule.Version))"

    # Check template file
    if (-not (Test-Path $TemplatePath)) {
        Write-ErrorMsg "Template file not found: $TemplatePath"
        exit 1
    }
    Write-Success "Provisioning template found: $TemplatePath"

    # Check solution file (if not skipping upload)
    if (-not $SkipAppUpload) {
        $resolvedSolutionPath = Resolve-Path $SolutionPath -ErrorAction SilentlyContinue
        if (-not $resolvedSolutionPath -or -not (Test-Path $resolvedSolutionPath)) {
            Write-ErrorMsg "Solution file not found: $SolutionPath"
            Write-Host ""
            Write-Host "Build the solution first:" -ForegroundColor Yellow
            Write-Host "  gulp bundle --ship" -ForegroundColor White
            Write-Host "  gulp package-solution --ship" -ForegroundColor White
            Write-Host ""
            exit 1
        }
        $SolutionPath = $resolvedSolutionPath.Path
        Write-Success "Solution package found: $SolutionPath"
    }

    # Step 2: Connect to site
    Write-Step "Connecting to site..."
    Write-Host "  Site URL: $SiteUrl" -ForegroundColor Gray
    Write-Host "  Client ID: $ClientId" -ForegroundColor Gray

    try {
        Connect-PnPOnline -Url $SiteUrl -Interactive -ClientId $ClientId
        Write-Success "Connected successfully"
    }
    catch {
        Write-ErrorMsg "Failed to connect to site: $($_.Exception.Message)"
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  • Ensure you have Site Collection Admin rights" -ForegroundColor White
        Write-Host "  • Check if the site URL is correct" -ForegroundColor White
        Write-Host "  • Verify ClientId is registered in Azure AD" -ForegroundColor White
        Write-Host ""
        exit 1
    }

    # Step 3: Upload app to Site Collection App Catalog (if not skipping)
    if (-not $SkipAppUpload) {
        Write-Step "Uploading solution to Site Collection App Catalog..."

        try {
            # Check if site collection app catalog exists
            $appCatalog = Get-PnPSiteCollectionAppCatalog -ErrorAction SilentlyContinue

            if (-not $appCatalog) {
                Write-Warning "Site Collection App Catalog not found. Creating it..."
                Add-PnPSiteCollectionAppCatalog
                Write-Success "Site Collection App Catalog created"
                Start-Sleep -Seconds 5
            }
            else {
                Write-Success "Site Collection App Catalog found"
            }

            # Check if app exists
            $existingApp = Get-PnPApp -Scope Site | Where-Object { $_.Title -eq $AppTitle }

            if ($existingApp) {
                Write-Warning "App already exists in App Catalog (Version: $($existingApp.AppCatalogVersion))"
                $overwrite = Read-Host "Do you want to upgrade? (Y/N)"

                if ($overwrite -eq "Y" -or $overwrite -eq "y") {
                    Write-Host "  Upgrading app..." -ForegroundColor Gray
                    Add-PnPApp -Path $SolutionPath -Scope Site -Overwrite -Publish
                    Write-Success "App upgraded successfully!"
                }
                else {
                    Write-Warning "Using existing app in catalog"
                }
            }
            else {
                Write-Host "  Uploading and publishing app..." -ForegroundColor Gray
                Add-PnPApp -Path $SolutionPath -Scope Site -Publish
                Write-Success "App uploaded and published!"
            }

            Write-Host "  Waiting for deployment..." -ForegroundColor Gray
            Start-Sleep -Seconds 10
        }
        catch {
            Write-ErrorMsg "Failed to upload app: $($_.Exception.Message)"
            Write-Host ""
            Write-Host "Troubleshooting:" -ForegroundColor Yellow
            Write-Host "  • Ensure Site Collection App Catalog is enabled" -ForegroundColor White
            Write-Host "  • Verify you have permissions to deploy apps" -ForegroundColor White
            Write-Host "  • Check if the .sppkg file is valid" -ForegroundColor White
            Write-Host ""
            throw
        }
    }
    else {
        Write-Step "Skipping app upload (SkipAppUpload flag set)"
    }

    # Step 4: Install app to site
    Write-Step "Installing app to site..."

    try {
        $availableApp = Get-PnPApp -Scope Site | Where-Object { $_.Title -eq $AppTitle }

        if ($availableApp) {
            if (-not $availableApp.InstalledVersion) {
                Write-Host "  Installing app..." -ForegroundColor Gray
                Install-PnPApp -Identity $availableApp.Id -Scope Site -Wait
                Write-Success "App installed to site"
                Start-Sleep -Seconds 10
            }
            else {
                Write-Success "App already installed (Version: $($availableApp.InstalledVersion))"

                if ($availableApp.CanUpgrade) {
                    $upgrade = Read-Host "  An upgrade is available. Upgrade now? (Y/N)"
                    if ($upgrade -eq "Y" -or $upgrade -eq "y") {
                        Update-PnPApp -Identity $availableApp.Id -Scope Site
                        Write-Success "App upgraded"
                        Start-Sleep -Seconds 10
                    }
                }
            }
        }
        else {
            Write-Warning "App not found in catalog. It may still be deploying..."
            Start-Sleep -Seconds 15

            # Try again
            $availableApp = Get-PnPApp -Scope Site | Where-Object { $_.Title -eq $AppTitle }
            if ($availableApp -and -not $availableApp.InstalledVersion) {
                Install-PnPApp -Identity $availableApp.Id -Scope Site -Wait
                Write-Success "App installed to site"
                Start-Sleep -Seconds 10
            }
        }
    }
    catch {
        Write-Warning "App installation warning: $($_.Exception.Message)"
        Write-Host "  Continuing with provisioning..." -ForegroundColor Gray
    }

    # Step 5: Create pages programmatically
    Write-Step "Creating pages programmatically..."

    try {
        # Create Showcase page
        Write-Host "  Creating Showcase.aspx..." -ForegroundColor Gray

        $showcasePage = Get-PnPPage -Identity "Showcase.aspx" -ErrorAction SilentlyContinue
        if ($showcasePage) {
            Write-Warning "Showcase.aspx already exists. Removing..."
            Remove-PnPPage -Identity "Showcase.aspx" -Force
        }

        # Add new page with Article layout first (we'll convert to full-width)
        $showcasePage = Add-PnPPage -Name "Showcase" -LayoutType Article -Title "Components Showcase"

        # Get the installed app/component
        $showcaseComponentId = "1ce0529a-9764-40af-8e87-ec19659ab0d9"

        # Add the SPFx webpart using the correct method
        $webPartXml = @"
<webParts>
  <webPart xmlns='http://schemas.microsoft.com/WebPart/v3'>
    <metaData>
      <type name='Microsoft.SharePoint.WebPartPages.ClientSideWebPart, Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c' />
      <importErrorMessage>Cannot import this web part.</importErrorMessage>
    </metaData>
    <data>
      <properties>
        <property name='ComponentId' type='string'>$showcaseComponentId</property>
        <property name='WebPartData' type='string'>{&quot;id&quot;:&quot;$showcaseComponentId&quot;,&quot;instanceId&quot;:&quot;$(New-Guid)&quot;,&quot;title&quot;:&quot;Showcase&quot;,&quot;description&quot;:&quot;Component Library Showcase&quot;,&quot;serverProcessedContent&quot;:{&quot;htmlStrings&quot;:{},&quot;searchablePlainTexts&quot;:{},&quot;imageSources&quot;:{},&quot;links&quot;:{}},&quot;dataVersion&quot;:&quot;1.0&quot;,&quot;properties&quot;:{&quot;description&quot;:&quot;Showcase&quot;}}</property>
      </properties>
    </data>
  </webPart>
</webParts>
"@

        # Try using Add-PnPPageWebPart with proper component reference
        try {
            # Get available components
            $availableComponents = Get-PnPAvailableClientSideComponents -Page "Showcase.aspx"
            $showcaseComponent = $availableComponents | Where-Object { $_.Id -eq $showcaseComponentId }

            if ($showcaseComponent) {
                Add-PnPPageWebPart -Page "Showcase.aspx" -Component $showcaseComponent
                Write-Success "Added Showcase webpart using component reference"
            } else {
                Write-Warning "Component not found in available components. Adding manually..."
                # Fallback: Add using DefaultWebPartType
                Add-PnPPageWebPart -Page "Showcase.aspx" -DefaultWebPartType "ClientWebPart" -WebPartProperties @{
                    "webPartId" = $showcaseComponentId
                    "componentId" = $showcaseComponentId
                    "title" = "Components Showcase"
                    "description" = "Component Library Showcase"
                }
            }
        } catch {
            Write-Warning "Failed to add webpart: $($_.Exception.Message)"
        }

        # Convert page to full-width layout
        Set-PnPPage -Identity "Showcase.aspx" -LayoutType SingleWebPartAppPage -Publish
        Write-Success "Showcase.aspx created with full-width layout"

        # Create Developer Toolkit page
        Write-Host "  Creating DevToolkit.aspx..." -ForegroundColor Gray

        $devToolkitPage = Get-PnPPage -Identity "DevToolkit.aspx" -ErrorAction SilentlyContinue
        if ($devToolkitPage) {
            Write-Warning "DevToolkit.aspx already exists. Removing..."
            Remove-PnPPage -Identity "DevToolkit.aspx" -Force
        }

        # Add new page with Article layout first (we'll convert to full-width)
        $devToolkitPage = Add-PnPPage -Name "DevToolkit" -LayoutType Article -Title "Developer Toolkit"

        # Get the installed app/component
        $toolkitComponentId = "2df1639b-8875-41bf-9f98-fc29770bc1e0"

        # Try using Add-PnPPageWebPart with proper component reference
        try {
            # Get available components
            $availableComponents = Get-PnPAvailableClientSideComponents -Page "DevToolkit.aspx"
            $toolkitComponent = $availableComponents | Where-Object { $_.Id -eq $toolkitComponentId }

            if ($toolkitComponent) {
                Add-PnPPageWebPart -Page "DevToolkit.aspx" -Component $toolkitComponent
                Write-Success "Added Developer Toolkit webpart using component reference"
            } else {
                Write-Warning "Component not found in available components. Adding manually..."
                # Fallback: Add using DefaultWebPartType
                Add-PnPPageWebPart -Page "DevToolkit.aspx" -DefaultWebPartType "ClientWebPart" -WebPartProperties @{
                    "webPartId" = $toolkitComponentId
                    "componentId" = $toolkitComponentId
                    "title" = "Developer Toolkit"
                    "description" = "Developer Toolkit - Comprehensive tools for SPFx development"
                }
            }
        } catch {
            Write-Warning "Failed to add webpart: $($_.Exception.Message)"
        }

        # Convert page to full-width layout
        Set-PnPPage -Identity "DevToolkit.aspx" -LayoutType SingleWebPartAppPage -Publish
        Write-Success "DevToolkit.aspx created with full-width layout"

        # Add navigation links
        Write-Host "  Adding navigation links..." -ForegroundColor Gray

        # Check if navigation nodes exist and add them
        $navNodes = Get-PnPNavigationNode -Location QuickLaunch

        $showcaseNav = $navNodes | Where-Object { $_.Title -eq "Components Showcase" }
        if (-not $showcaseNav) {
            Add-PnPNavigationNode -Title "Components Showcase" `
                -Url "$SiteUrl/SitePages/Showcase.aspx" `
                -Location QuickLaunch `
                -ErrorAction SilentlyContinue
        }

        $toolkitNav = $navNodes | Where-Object { $_.Title -eq "Developer Toolkit" }
        if (-not $toolkitNav) {
            Add-PnPNavigationNode -Title "Developer Toolkit" `
                -Url "$SiteUrl/SitePages/DevToolkit.aspx" `
                -Location QuickLaunch `
                -ErrorAction SilentlyContinue
        }

        Write-Success "Navigation links added"
    }
    catch {
        Write-ErrorMsg "Failed to create pages: $($_.Exception.Message)"
        Write-Host "  Error details: $($_.Exception)" -ForegroundColor Gray
        throw
    }

    # Step 6: Verify pages
    Write-Step "Verifying deployment..."

    $showcasePage = Get-PnPPage -Identity "Showcase.aspx" -ErrorAction SilentlyContinue
    $devToolkitPage = Get-PnPPage -Identity "DevToolkit.aspx" -ErrorAction SilentlyContinue

    if ($showcasePage) {
        Write-Success "Showcase.aspx created successfully"
    }
    else {
        Write-Warning "Showcase.aspx not found"
    }

    if ($devToolkitPage) {
        Write-Success "DevToolkit.aspx created successfully"
    }
    else {
        Write-Warning "DevToolkit.aspx not found"
    }

    # Success summary
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Green"
    Write-ColorOutput "   Provisioning Completed Successfully!" "Green"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Green"
    Write-Host ""

    Write-Host "Deployment Summary:" -ForegroundColor Cyan
    Write-Host "  Target Site: $SiteUrl" -ForegroundColor White
    Write-Host "  App Catalog: Site Collection" -ForegroundColor White
    Write-Host ""
    Write-Host "Pages Created:" -ForegroundColor Cyan
    Write-Host "  • Components Showcase: $SiteUrl/SitePages/Showcase.aspx" -ForegroundColor White
    Write-Host "  • Developer Toolkit:    $SiteUrl/SitePages/DevToolkit.aspx" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open the pages in your browser" -ForegroundColor White
    Write-Host "  2. Verify both webparts are working" -ForegroundColor White
    Write-Host "  3. Test cross-linking navigation" -ForegroundColor White
    Write-Host ""

}
catch {
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Red"
    Write-ColorOutput "   Provisioning Failed!" "Red"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Red"
    Write-Host ""
    Write-ErrorMsg "Error: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Gray
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""

    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  • Ensure you have Site Collection Admin rights" -ForegroundColor White
    Write-Host "  • Verify Site Collection App Catalog is enabled" -ForegroundColor White
    Write-Host "  • Check if the app is published in catalog" -ForegroundColor White
    Write-Host "  • Wait a few minutes and try again" -ForegroundColor White
    Write-Host ""

    exit 1
}
finally {
    # Disconnect
    Disconnect-PnPOnline -ErrorAction SilentlyContinue
}
