// src/webparts/showcase/components/CamlQueryBuilder/utils/exportTemplates.ts

import { ExportFormat } from '../types/CamlTypes';

export function generateExportCode(
  camlXML: string,
  format: ExportFormat,
  listTitle: string,
  siteUrl: string
): string {
  switch (format) {
    case 'caml':
      return camlXML;

    case 'pnpjs':
      return generatePnPJSCode(camlXML, listTitle);

    case 'pnppowershell':
      return generatePnPPowerShellCode(camlXML, listTitle, siteUrl);

    case 'rest':
      return generateRESTCode(camlXML, listTitle, siteUrl);

    default:
      return camlXML;
  }
}

function generatePnPJSCode(camlXML: string, listTitle: string): string {
  // Escape backticks in CAML XML
  const escapedXML = camlXML.replace(/`/g, '\\`');

  return `// PnP JS (SPFx) - Import required modules
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";

// Initialize PnP with SPFx context
const sp = spfi().using(SPFx(this.context));

// Execute CAML query
const items = await sp.web.lists
  .getByTitle("${listTitle}")
  .getItemsByCAMLQuery({
    ViewXml: \`${escapedXML}\`
  });

console.log(\`Retrieved \${items.length} items\`, items);

// Process results
items.forEach(item => {
  console.log(item.Title, item);
});`;
}

function generatePnPPowerShellCode(camlXML: string, listTitle: string, siteUrl: string): string {
  return `# PnP PowerShell - Connect to SharePoint site
Connect-PnPOnline -Url "${siteUrl}" -Interactive

# Define CAML query
$camlQuery = @"
${camlXML}
"@

# Execute query
$items = Get-PnPListItem -List "${listTitle}" -Query $camlQuery

# Display results
Write-Host "Retrieved $($items.Count) items"
$items | Format-Table Title, Id, Created, Modified

# Process each item
foreach ($item in $items) {
    Write-Host "Title: $($item["Title"])"
    # Access other fields as needed
}`;
}

function generateRESTCode(camlXML: string, listTitle: string, siteUrl: string): string {
  // Escape backslashes and quotes for JSON
  const escapedXML = camlXML.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '');

  return `// REST API - Execute CAML query using fetch
const siteUrl = "${siteUrl}";
const listTitle = "${listTitle}";

const requestData = {
  query: {
    ViewXml: "${escapedXML}"
  }
};

fetch(\`\${siteUrl}/_api/web/lists/getbytitle('\${listTitle}')/GetItems\`, {
  method: 'POST',
  headers: {
    'Accept': 'application/json;odata=verbose',
    'Content-Type': 'application/json;odata=verbose',
    'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value
  },
  body: JSON.stringify(requestData)
})
  .then(response => response.json())
  .then(data => {
    const items = data.d.results;
    console.log(\`Retrieved \${items.length} items\`, items);

    // Process results
    items.forEach(item => {
      console.log(item.Title, item);
    });
  })
  .catch(error => {
    console.error('Error executing CAML query:', error);
  });`;
}

export function getExportFormatLabel(format: ExportFormat): string {
  const labels: Record<ExportFormat, string> = {
    caml: 'CAML XML',
    pnpjs: 'PnP JS (SPFx)',
    pnppowershell: 'PnP PowerShell',
    rest: 'REST API',
  };
  return labels[format] || 'CAML XML';
}

export function getExportFormatDescription(format: ExportFormat): string {
  const descriptions: Record<ExportFormat, string> = {
    caml: 'Pure CAML XML for use in any SharePoint context',
    pnpjs: 'TypeScript code using @pnp/sp library for SPFx',
    pnppowershell: 'PowerShell script using PnP.PowerShell module',
    rest: 'JavaScript using SharePoint REST API',
  };
  return descriptions[format] || '';
}

export function getExportFileExtension(format: ExportFormat): string {
  const extensions: Record<ExportFormat, string> = {
    caml: 'xml',
    pnpjs: 'ts',
    pnppowershell: 'ps1',
    rest: 'js',
  };
  return extensions[format] || 'txt';
}
