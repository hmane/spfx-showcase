# PnP Provisioning Template Deployment

This guide explains how to use PnP Provisioning Templates to deploy the SPFx Showcase solution.

## 📋 What is PnP Provisioning?

PnP Provisioning Templates are XML-based configuration files that define the structure and content of SharePoint sites. They allow you to:

- ✅ Deploy apps from App Catalog
- ✅ Create pages with pre-configured webparts
- ✅ Set up navigation
- ✅ Configure site settings
- ✅ Apply consistent configurations across multiple sites

## 📦 Files Included

### 1. `provisioning-template.xml`
The main PnP provisioning template that includes:

**ApplicationLifecycleManagement:**
- App ID: `d64da1f1-2376-4458-beed-2a222b12247a`
- Action: Install
- Skip Feature Deployment: true

**ClientSidePages:**
- **Showcase.aspx** - Components Showcase page
  - WebPart ID: `1ce0529a-9764-40af-8e87-ec19659ab0d9`
  - Layout: Article (full-width)
  - Section: OneColumn

- **DevToolkit.aspx** - Developer Toolkit page
  - WebPart ID: `2df1639b-8875-41bf-9f98-fc29770bc1e0`
  - Layout: Article (full-width)
  - Section: OneColumn

**Navigation:**
- Adds both pages to Current Navigation (left nav)
- Creates friendly URLs

### 2. `Apply-Provisioning.ps1`
PowerShell script that:
- Uploads `.sppkg` to App Catalog
- Publishes the app
- Applies the PnP template
- Installs app to site
- Creates pages and navigation

## 🚀 Quick Start

### Prerequisites

```powershell
# Install PnP PowerShell
Install-Module -Name PnP.PowerShell -Scope CurrentUser
```

### Step 1: Build Solution

```bash
gulp bundle --ship
gulp package-solution --ship
```

### Step 2: Apply Provisioning Template

```powershell
cd deployment

.\Apply-Provisioning.ps1 `
    -SiteUrl "https://contoso.sharepoint.com/sites/showcase" `
    -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog"
```

That's it! The script will:
1. ✅ Upload app to App Catalog
2. ✅ Publish the app
3. ✅ Install app to your site
4. ✅ Create Showcase.aspx page
5. ✅ Create DevToolkit.aspx page
6. ✅ Add navigation links

## 📝 Detailed Usage

### Basic Deployment

```powershell
.\Apply-Provisioning.ps1 `
    -SiteUrl "https://contoso.sharepoint.com/sites/showcase" `
    -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog"
```

### Skip App Upload (if already in App Catalog)

```powershell
.\Apply-Provisioning.ps1 `
    -SiteUrl "https://contoso.sharepoint.com/sites/showcase" `
    -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog" `
    -SkipAppUpload
```

### Custom Paths

```powershell
.\Apply-Provisioning.ps1 `
    -SiteUrl "https://contoso.sharepoint.com/sites/showcase" `
    -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog" `
    -TemplatePath "./custom-template.xml" `
    -SolutionPath "../build/solution/my-package.sppkg"
```

### Apply Specific Handlers Only

```powershell
# Only create pages (skip app install, navigation)
.\Apply-Provisioning.ps1 `
    -SiteUrl "https://contoso.sharepoint.com/sites/showcase" `
    -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog" `
    -Handlers "Pages"

# Only update navigation
.\Apply-Provisioning.ps1 `
    -SiteUrl "https://contoso.sharepoint.com/sites/showcase" `
    -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog" `
    -Handlers "Navigation" `
    -SkipAppUpload
```

**Available Handlers:**
- `ApplicationLifecycleManagement` - App installation
- `Pages` - Page creation
- `Navigation` - Navigation setup
- `CustomActions` - Custom actions
- `All` - All handlers (default)

## 🛠️ Customizing the Template

### Change Page Layout

Edit `provisioning-template.xml`:

```xml
<pnp:ClientSidePage
  PageName="Showcase.aspx"
  Layout="Home"                  <!-- Article, Home, SingleWebPartAppPage -->
  ...>
```

**Layout Options:**
- `Article` - Standard article layout (default)
- `Home` - Home page layout with hero web part
- `SingleWebPartAppPage` - Full-page app experience

### Add More Sections

```xml
<pnp:Sections>
  <pnp:Section Order="1" Type="OneColumn">
    <!-- First section -->
  </pnp:Section>

  <pnp:Section Order="2" Type="TwoColumn">
    <!-- Second section with 2 columns -->
  </pnp:Section>

  <pnp:Section Order="3" Type="ThreeColumn">
    <!-- Third section with 3 columns -->
  </pnp:Section>
</pnp:Sections>
```

**Section Types:**
- `OneColumn` - Full width
- `TwoColumn` - Two equal columns
- `ThreeColumn` - Three equal columns
- `OneColumnFullWidth` - Full bleed
- `TwoColumnLeft` - Left column wider
- `TwoColumnRight` - Right column wider

### Add WebPart Properties

```xml
<pnp:CanvasControl
  WebPartType="Custom"
  ControlId="YOUR-WEBPART-ID"
  Order="1"
  Column="1">

  <pnp:CanvasControlProperties>
    <pnp:CanvasControlProperty Key="title" Value="My Title" />
    <pnp:CanvasControlProperty Key="description" Value="My Description" />
    <pnp:CanvasControlProperty Key="customProperty" Value="Custom Value" />
  </pnp:CanvasControlProperties>
</pnp:CanvasControl>
```

### Add More Pages

```xml
<pnp:ClientSidePages>
  <!-- Existing pages -->

  <pnp:ClientSidePage
    PageName="CustomPage.aspx"
    Title="My Custom Page"
    Layout="Article"
    Overwrite="true">

    <pnp:Sections>
      <pnp:Section Order="1" Type="OneColumn">
        <pnp:Controls>
          <!-- Add your webparts here -->
        </pnp:Controls>
      </pnp:Section>
    </pnp:Sections>
  </pnp:ClientSidePage>
</pnp:ClientSidePages>
```

### Customize Navigation

```xml
<pnp:Navigation>
  <pnp:CurrentNavigation>
    <pnp:NavigationNode Title="Home" Url="{site}/SitePages/Home.aspx" />
    <pnp:NavigationNode Title="Showcase" Url="{site}/SitePages/Showcase.aspx" />
    <pnp:NavigationNode Title="Toolkit" Url="{site}/SitePages/DevToolkit.aspx" />

    <!-- Add nested navigation -->
    <pnp:NavigationNode Title="Resources" Url="" IsExternal="false">
      <pnp:NavigationNode Title="Documentation" Url="{site}/SitePages/Docs.aspx" />
      <pnp:NavigationNode Title="Help" Url="{site}/SitePages/Help.aspx" />
    </pnp:NavigationNode>
  </pnp:CurrentNavigation>
</pnp:Navigation>
```

## 🔄 Updating Existing Deployment

### Upgrade App Version

1. Update version in `config/package-solution.json`:
   ```json
   {
     "solution": {
       "version": "1.0.1.0"
     }
   }
   ```

2. Rebuild:
   ```bash
   gulp bundle --ship
   gulp package-solution --ship
   ```

3. Redeploy:
   ```powershell
   .\Apply-Provisioning.ps1 `
       -SiteUrl "https://contoso.sharepoint.com/sites/showcase" `
       -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog"
   ```

The script will detect the new version and prompt to upgrade.

### Update Pages Only

If app is already deployed and you just want to update pages:

```powershell
.\Apply-Provisioning.ps1 `
    -SiteUrl "https://contoso.sharepoint.com/sites/showcase" `
    -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog" `
    -Handlers "Pages" `
    -SkipAppUpload
```

## 📊 Template Structure

```xml
<pnp:Provisioning>
  <pnp:Templates>
    <pnp:ProvisioningTemplate>

      <!-- 1. App Installation -->
      <pnp:ApplicationLifecycleManagement>
        <pnp:Apps>
          <pnp:App AppId="..." Action="Install" />
        </pnp:Apps>
      </pnp:ApplicationLifecycleManagement>

      <!-- 2. Pages Creation -->
      <pnp:ClientSidePages>
        <pnp:ClientSidePage>
          <pnp:Sections>
            <pnp:Section>
              <pnp:Controls>
                <pnp:CanvasControl ... />
              </pnp:Controls>
            </pnp:Section>
          </pnp:Sections>
        </pnp:ClientSidePage>
      </pnp:ClientSidePages>

      <!-- 3. Navigation -->
      <pnp:Navigation>
        <pnp:CurrentNavigation>
          <pnp:NavigationNode ... />
        </pnp:CurrentNavigation>
      </pnp:Navigation>

      <!-- 4. Optional: Custom Actions -->
      <pnp:CustomActions>
        <!-- Custom actions here -->
      </pnp:CustomActions>

    </pnp:ProvisioningTemplate>
  </pnp:Templates>
</pnp:Provisioning>
```

## 🧪 Manual Template Application

If you prefer to apply the template manually:

```powershell
# 1. Connect to site
Connect-PnPOnline -Url "https://contoso.sharepoint.com/sites/showcase" -Interactive

# 2. Apply template
Invoke-PnPSiteTemplate -Path "./provisioning-template.xml"

# Or apply specific handlers
Invoke-PnPSiteTemplate -Path "./provisioning-template.xml" -Handlers "Pages,Navigation"

# With parameters
$parameters = @{
    "SiteTitle" = "My Showcase"
    "SiteDescription" = "Component Showcase Site"
}
Invoke-PnPSiteTemplate -Path "./provisioning-template.xml" -Parameters $parameters
```

## 📤 Export Existing Site as Template

To create a template from an existing site:

```powershell
Connect-PnPOnline -Url "https://contoso.sharepoint.com/sites/showcase" -Interactive

# Export full site template
Get-PnPSiteTemplate -Out "my-template.xml"

# Export specific handlers
Get-PnPSiteTemplate -Out "pages-only.xml" -Handlers "Pages,Navigation"

# Include all content
Get-PnPSiteTemplate -Out "full-template.xml" -IncludeAllPages
```

## 🔐 Permissions Required

- **Site Collection Administrator** on target site
- **App Catalog Administrator** or **Tenant Administrator** for app deployment
- **Manage Web** permissions for page creation

## ⚠️ Troubleshooting

### Issue: App not installing

**Error:** "App could not be installed"

**Solutions:**
1. Wait 30 seconds after uploading to App Catalog
2. Verify app is published in App Catalog
3. Check app is available at tenant level (`-Scope Tenant`)
4. Manually install once:
   ```powershell
   Connect-PnPOnline -Url "YOUR-SITE" -Interactive
   $app = Get-PnPApp | Where-Object {$_.Title -eq "spfx-showcase-client-side-solution"}
   Install-PnPApp -Identity $app.Id -Wait
   ```

### Issue: Pages not created

**Error:** "Page already exists" or "Page not created"

**Solutions:**
1. Set `Overwrite="true"` in template
2. Delete existing pages first
3. Check you have page creation permissions
4. Apply only Pages handler:
   ```powershell
   -Handlers "Pages"
   ```

### Issue: WebParts not appearing

**Solutions:**
1. Ensure app is installed (not just uploaded)
2. Wait 1-2 minutes after app installation
3. Check WebPart IDs match manifests
4. Clear browser cache
5. Verify from workbench first

### Issue: Navigation not updating

**Solutions:**
1. Apply navigation separately:
   ```powershell
   -Handlers "Navigation"
   ```
2. Check navigation permissions
3. Manually add via UI first to test
4. Verify {site} token is replaced correctly

## 📚 Additional Resources

- **PnP Provisioning Schema:** https://github.com/pnp/PnP-Provisioning-Schema
- **PnP PowerShell Docs:** https://pnp.github.io/powershell/
- **Site Template Cmdlets:** https://pnp.github.io/powershell/cmdlets/
- **Sample Templates:** https://github.com/pnp/pnp-provisioning-templates

## 🎯 Best Practices

1. **Version Control Templates**
   - Keep templates in source control
   - Tag versions with solution versions
   - Document all changes

2. **Test in Development**
   - Always test templates in dev environment first
   - Validate all handlers work independently
   - Test upgrade scenarios

3. **Use Parameters**
   - Parameterize site-specific values
   - Use tokens like `{site}`, `{sitecollection}`
   - Make templates reusable

4. **Modular Templates**
   - Create separate templates for different purposes
   - Combine templates for complex deployments
   - Use `-Handlers` for targeted updates

5. **Error Handling**
   - Always use `-ErrorAction Continue` for bulk operations
   - Log all operations
   - Have rollback plan

## 🔄 CI/CD Integration

### Azure DevOps Pipeline Example

```yaml
trigger:
  - main

pool:
  vmImage: 'windows-latest'

steps:
  - task: PowerShell@2
    displayName: 'Install PnP PowerShell'
    inputs:
      targetType: 'inline'
      script: |
        Install-Module -Name PnP.PowerShell -Force -Scope CurrentUser

  - task: PowerShell@2
    displayName: 'Apply Provisioning Template'
    inputs:
      targetType: 'filePath'
      filePath: 'deployment/Apply-Provisioning.ps1'
      arguments: >
        -SiteUrl "$(SiteUrl)"
        -AppCatalogUrl "$(AppCatalogUrl)"
        -SkipAppUpload
```

### GitHub Actions Example

```yaml
name: Deploy SPFx Showcase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: windows-latest

    steps:
      - uses: actions/checkout@v2

      - name: Install PnP PowerShell
        shell: pwsh
        run: |
          Install-Module -Name PnP.PowerShell -Force -Scope CurrentUser

      - name: Apply Provisioning
        shell: pwsh
        run: |
          ./deployment/Apply-Provisioning.ps1 `
            -SiteUrl "${{ secrets.SITE_URL }}" `
            -AppCatalogUrl "${{ secrets.APP_CATALOG_URL }}"
```

---

**Happy Provisioning!** 🚀
