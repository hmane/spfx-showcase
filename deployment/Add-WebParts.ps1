<#
.SYNOPSIS
    Adds SPFx webparts to existing pages

.DESCRIPTION
    This script adds the Showcase and Developer Toolkit webparts to existing pages.
    Pages must already exist.

.PARAMETER SiteUrl
    The site URL where pages exist

.EXAMPLE
    .\Add-WebParts.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"

.NOTES
    Uses ClientId: 970bb320-0d49-4b4a-aa8f-c3f4b1e5928f for authentication
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl
)

$ErrorActionPreference = "Stop"
$ClientId = "970bb320-0d49-4b4a-aa8f-c3f4b1e5928f"

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
    Write-ColorOutput "   Add WebParts to Pages" "Magenta"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Magenta"
    Write-Host ""

    # Connect
    Write-Step "Connecting to site..."
    Connect-PnPOnline -Url $SiteUrl -Interactive -ClientId $ClientId
    Write-Success "Connected successfully"

    # Component IDs
    $showcaseComponentId = "1ce0529a-9764-40af-8e87-ec19659ab0d9"
    $toolkitComponentId = "2df1639b-8875-41bf-9f98-fc29770bc1e0"

    # Add to Showcase.aspx
    Write-Step "Adding webpart to Showcase.aspx..."

    $showcasePage = Get-PnPPage -Identity "Showcase.aspx" -ErrorAction SilentlyContinue
    if (-not $showcasePage) {
        Write-ErrorMsg "Showcase.aspx not found. Please create the page first."
    }
    else {
        # Get available components
        $components = Get-PnPAvailableClientSideComponents -Page "Showcase.aspx"
        Write-Host "  Found $($components.Count) available components" -ForegroundColor Gray

        # Find the Showcase component
        $showcaseComponent = $components | Where-Object { $_.Id -eq $showcaseComponentId }

        if ($showcaseComponent) {
            Write-Host "  Component found: $($showcaseComponent.Name)" -ForegroundColor Gray
            Write-Host "  Component ID: $($showcaseComponent.Id)" -ForegroundColor Gray
            Write-Host "  Component Type: $($showcaseComponent.ComponentType)" -ForegroundColor Gray

            # Remove existing webparts on the page
            $existingWebParts = Get-PnPPageComponent -Page "Showcase.aspx"
            foreach ($wp in $existingWebParts) {
                Remove-PnPPageComponent -Page "Showcase.aspx" -InstanceId $wp.InstanceId -Force
                Write-Host "  Removed existing webpart: $($wp.InstanceId)" -ForegroundColor Gray
            }

            # Add the webpart
            Add-PnPPageWebPart -Page "Showcase.aspx" -Component $showcaseComponent -Section 1 -Column 1
            Write-Success "Showcase webpart added successfully"
        }
        else {
            Write-ErrorMsg "Showcase component not found. Available components:"
            $components | ForEach-Object {
                Write-Host "  - $($_.Name) (ID: $($_.Id))" -ForegroundColor Gray
            }
        }
    }

    # Add to DevToolkit.aspx
    Write-Step "Adding webpart to DevToolkit.aspx..."

    $toolkitPage = Get-PnPPage -Identity "DevToolkit.aspx" -ErrorAction SilentlyContinue
    if (-not $toolkitPage) {
        Write-ErrorMsg "DevToolkit.aspx not found. Please create the page first."
    }
    else {
        # Get available components
        $components = Get-PnPAvailableClientSideComponents -Page "DevToolkit.aspx"
        Write-Host "  Found $($components.Count) available components" -ForegroundColor Gray

        # Find the Developer Toolkit component
        $toolkitComponent = $components | Where-Object { $_.Id -eq $toolkitComponentId }

        if ($toolkitComponent) {
            Write-Host "  Component found: $($toolkitComponent.Name)" -ForegroundColor Gray
            Write-Host "  Component ID: $($toolkitComponent.Id)" -ForegroundColor Gray
            Write-Host "  Component Type: $($toolkitComponent.ComponentType)" -ForegroundColor Gray

            # Remove existing webparts on the page
            $existingWebParts = Get-PnPPageComponent -Page "DevToolkit.aspx"
            foreach ($wp in $existingWebParts) {
                Remove-PnPPageComponent -Page "DevToolkit.aspx" -InstanceId $wp.InstanceId -Force
                Write-Host "  Removed existing webpart: $($wp.InstanceId)" -ForegroundColor Gray
            }

            # Add the webpart
            Add-PnPPageWebPart -Page "DevToolkit.aspx" -Component $toolkitComponent -Section 1 -Column 1
            Write-Success "Developer Toolkit webpart added successfully"
        }
        else {
            Write-ErrorMsg "Developer Toolkit component not found. Available components:"
            $components | ForEach-Object {
                Write-Host "  - $($_.Name) (ID: $($_.Id))" -ForegroundColor Gray
            }
        }
    }

    # Convert pages to full-width layout
    Write-Step "Converting pages to full-width layout..."

    if ($showcasePage) {
        Set-PnPPage -Identity "Showcase.aspx" -LayoutType SingleWebPartAppPage
        Write-Success "Showcase.aspx converted to full-width layout"
    }

    if ($toolkitPage) {
        Set-PnPPage -Identity "DevToolkit.aspx" -LayoutType SingleWebPartAppPage
        Write-Success "DevToolkit.aspx converted to full-width layout"
    }

    # Publish pages
    Write-Step "Publishing pages..."

    if ($showcasePage) {
        Set-PnPPage -Identity "Showcase.aspx" -Publish
        Write-Success "Showcase.aspx published"
    }

    if ($toolkitPage) {
        Set-PnPPage -Identity "DevToolkit.aspx" -Publish
        Write-Success "DevToolkit.aspx published"
    }

    # Success
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Green"
    Write-ColorOutput "   WebParts Added Successfully!" "Green"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Green"
    Write-Host ""

    Write-Host "Pages:" -ForegroundColor Cyan
    Write-Host "  • Showcase.aspx: $SiteUrl/SitePages/Showcase.aspx" -ForegroundColor White
    Write-Host "  • DevToolkit.aspx: $SiteUrl/SitePages/DevToolkit.aspx" -ForegroundColor White
    Write-Host ""

}
catch {
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Red"
    Write-ColorOutput "   Failed!" "Red"
    Write-ColorOutput "═══════════════════════════════════════════════════════════" "Red"
    Write-Host ""
    Write-ErrorMsg "Error: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Gray
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""
    exit 1
}
finally {
    Disconnect-PnPOnline -ErrorAction SilentlyContinue
}
