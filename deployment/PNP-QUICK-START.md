# PnP Provisioning - Quick Start

**Site Collection App Catalog deployment with ClientId authentication.**

## Prerequisites

```powershell
Install-Module -Name PnP.PowerShell -Scope CurrentUser
```

## 3-Step Deployment

### 1️⃣ Build Solution

```bash
gulp bundle --ship
gulp package-solution --ship
```

### 2️⃣ Update Page URLs (One-time)

```powershell
cd deployment
.\Update-PageUrls.ps1 -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE"
```

Then rebuild:
```bash
cd ..
gulp bundle --ship
gulp package-solution --ship
```

### 3️⃣ Deploy (Only SiteUrl Required!)

```powershell
cd deployment
.\Apply-Provisioning.ps1 -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE"
```

**Done!** 🎉

---

## What Gets Deployed

✅ **Site Collection App Catalog** created (if not exists)
✅ **App Package** uploaded to catalog
✅ **App** installed to your site
✅ **Showcase.aspx** page with ShowcaseWebPart
✅ **DevToolkit.aspx** page with DeveloperToolkitWebPart
✅ **Navigation links** added to both pages

---

## Authentication

- **ClientId:** `970bb320-0d49-4b4a-aa8f-c3f4b1e5928f` (hardcoded)
- **Method:** Interactive browser authentication
- **No AppCatalogUrl needed** - uses site collection app catalog

---

## Common Scenarios

### First-Time Deployment
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

### Upgrade App
```bash
# Update version in config/package-solution.json
# Rebuild
gulp bundle --ship
gulp package-solution --ship
```
```powershell
# Redeploy (will prompt to upgrade)
.\Apply-Provisioning.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/showcase"
```

---

## Troubleshooting

### PnP PowerShell not found
```powershell
Install-Module -Name PnP.PowerShell -Scope CurrentUser -Force
```

### App not installing
1. Wait 30 seconds after upload
2. Verify Site Collection App Catalog is enabled
3. Check app permissions

### Pages not created
1. Ensure `Overwrite="true"` in template
2. Delete existing pages manually
3. Check site permissions

### WebParts not showing
1. Wait 1-2 minutes after deployment
2. Clear browser cache
3. Verify app is installed (not just uploaded)

---

## Site Collection App Catalog

**Automatic Setup:**
- Script detects if catalog exists
- Creates it if needed
- No manual setup required!

**Manual Enable** (if needed):
```powershell
Connect-PnPOnline -Url "https://contoso.sharepoint.com/sites/showcase" -Interactive -ClientId "970bb320-0d49-4b4a-aa8f-c3f4b1e5928f"
Add-PnPSiteCollectionAppCatalog
```

---

## For More Details

📖 **Full Documentation:** See [PNP-PROVISIONING.md](PNP-PROVISIONING.md)

**Topics Covered:**
- Detailed template customization
- Advanced deployment scenarios
- Complete troubleshooting guide
- Multi-site deployment

---

## Next Steps After Deployment

1. ✅ Navigate to: `{SiteUrl}/SitePages/Showcase.aspx`
2. ✅ Navigate to: `{SiteUrl}/SitePages/DevToolkit.aspx`
3. ✅ Test cross-linking between pages
4. ✅ Verify all 12 showcase components work
5. ✅ Verify all 5 developer tool sections work

**Happy Provisioning!** 🚀
