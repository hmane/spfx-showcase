# SPFx Showcase - Deployment

Automated deployment using PnP Provisioning Templates with Site Collection App Catalog.

## 📦 Files

| File | Purpose |
|------|---------|
| **provisioning-template.xml** | PnP provisioning schema (app, pages, navigation) |
| **Apply-Provisioning.ps1** | PowerShell deployment script |
| **Update-PageUrls.ps1** | Updates cross-linking URLs in source code |
| **Uninstall-SPFxShowcase.ps1** | Clean removal script |
| **PNP-PROVISIONING.md** | Complete documentation and customization guide |
| **PNP-QUICK-START.md** | Fast 3-step deployment guide |

## 🚀 Quick Start

### Prerequisites
```powershell
Install-Module -Name PnP.PowerShell -Scope CurrentUser
```

### Deployment Steps

**1. Update URLs** (one-time setup)
```powershell
.\Update-PageUrls.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"
```

**2. Build Solution**
```bash
cd ..
gulp bundle --ship
gulp package-solution --ship
```

**3. Deploy** (only SiteUrl required!)
```powershell
cd deployment
.\Apply-Provisioning.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"
```

## 🔑 Authentication

- **ClientId:** `970bb320-0d49-4b4a-aa8f-c3f4b1e5928f` (hardcoded)
- **Method:** Interactive authentication with Azure AD
- **App Catalog:** Site Collection App Catalog

## 📖 Documentation

- **Quick Start:** [PNP-QUICK-START.md](PNP-QUICK-START.md)
- **Full Guide:** [PNP-PROVISIONING.md](PNP-PROVISIONING.md)

## 🎯 What Gets Deployed

✅ App uploaded to Site Collection App Catalog
✅ App installed to site
✅ **Showcase.aspx** - Components Showcase page
✅ **DevToolkit.aspx** - Developer Toolkit page
✅ Navigation links added

## 🔧 Common Commands

### First Deployment
```powershell
.\Apply-Provisioning.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"
```

### App Already in Catalog
```powershell
.\Apply-Provisioning.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase" -SkipAppUpload
```

### Update Pages Only
```powershell
.\Apply-Provisioning.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase" -Handlers "Pages" -SkipAppUpload
```

### Uninstall
```powershell
.\Uninstall-SPFxShowcase.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"
```

## ⚙️ Site Collection App Catalog

The script automatically:
- ✅ Detects if Site Collection App Catalog exists
- ✅ Creates it if needed (`Add-PnPSiteCollectionAppCatalog`)
- ✅ Uploads app with `-Scope Site`
- ✅ Installs app with `-Scope Site`

## 📚 Resources

- [PnP Provisioning Schema](https://github.com/pnp/PnP-Provisioning-Schema)
- [PnP PowerShell](https://pnp.github.io/powershell/)
- [SPFx Documentation](https://docs.microsoft.com/sharepoint/dev/spfx/)
- [Site Collection App Catalog](https://docs.microsoft.com/sharepoint/dev/general-development/site-collection-app-catalog)
