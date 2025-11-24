// Schema Generators for different export formats

import {
  ExportFormat,
  ISiteColumnSchema,
  IContentTypeSchema,
  IListSchema,
  IGroupSchema,
  IPermissionLevelSchema,
  INavigationSchema,
  ISiteSettingsSchema,
} from '../types/SchemaTypes';

export interface ISchemaGeneratorInput {
  siteColumns: ISiteColumnSchema[];
  contentTypes: IContentTypeSchema[];
  lists: IListSchema[];
  groups: IGroupSchema[];
  permissionLevels: IPermissionLevelSchema[];
  navigation: INavigationSchema[];
  siteSettings: ISiteSettingsSchema[];
}

/**
 * Generate schema in the specified format
 */
export function generateSchema(
  input: ISchemaGeneratorInput,
  format: ExportFormat
): string {
  switch (format) {
    case 'pnp-json':
      return generatePnPJson(input);
    case 'pnp-xml':
      return generatePnPXml(input);
    case 'site-script':
      return generateSiteScript(input);
    case 'pnp-powershell':
      return generatePnPPowerShell(input);
    case 'cli-m365':
      return generateCliM365(input);
    case 'typescript':
      return generateTypeScript(input);
    default:
      return generatePnPJson(input);
  }
}

/**
 * Generate PnP Provisioning Template in JSON format
 */
function generatePnPJson(input: ISchemaGeneratorInput): string {
  const template: any = {
    $schema: 'https://developer.microsoft.com/json-schemas/pnp/provisioning/202209/sitetemplate.json',
    version: '1.0',
  };

  // Site Fields (Site Columns)
  if (input.siteColumns.length > 0) {
    template.siteFields = input.siteColumns.map(col => ({
      schemaXml: col.schemaXml || generateFieldSchemaXml(col),
    }));
  }

  // Content Types
  if (input.contentTypes.length > 0) {
    template.contentTypes = input.contentTypes.map(ct => ({
      id: ct.contentTypeId,
      name: ct.title,
      description: ct.description,
      group: ct.group,
      hidden: ct.hidden,
      fieldRefs: ct.fieldLinks.map(fl => ({
        id: fl.id,
        name: fl.name,
        required: fl.required,
        hidden: fl.hidden,
      })),
    }));
  }

  // Lists
  if (input.lists.length > 0) {
    template.lists = input.lists.map(list => {
      const listDef: any = {
        title: list.title,
        url: `Lists/${list.title.replace(/\s+/g, '')}`,
        templateType: list.baseTemplate,
      };

      // Only include non-default settings
      if (list.description) listDef.description = list.description;
      if (list.enableVersioning) listDef.enableVersioning = true;
      if (list.enableMinorVersions) listDef.enableMinorVersions = true;
      if (list.enableModeration) listDef.enableModeration = true;
      if (list.forceCheckout) listDef.forceCheckout = true;
      if (!list.enableAttachments) listDef.enableAttachments = false;
      if (list.enableFolderCreation) listDef.enableFolderCreation = true;
      if (list.contentTypesEnabled) listDef.contentTypesEnabled = true;

      // Clean fields - only include custom fields with important properties
      const cleanFields = list.fields
        .filter(f => !isSystemField(f.internalName))
        .map(f => generateCleanFieldDef(f));

      if (cleanFields.length > 0) {
        listDef.fields = cleanFields;
      }

      // Include views with all properties
      if (list.views.length > 0) {
        listDef.views = list.views.map(v => {
          const viewDef: any = {
            title: v.title,
            defaultView: v.defaultView,
            rowLimit: v.rowLimit,
            viewFields: v.viewFields,
          };
          // Query (raw, not escaped)
          if (v.viewQuery) viewDef.query = v.viewQuery;
          // View type
          if (v.viewType) viewDef.viewType = v.viewType;
          // Paging
          if (v.paged) viewDef.paged = v.paged;
          // Scope
          if (v.scope !== undefined) viewDef.scope = v.scope;
          // JSLink for classic rendering
          if (v.jsLink) viewDef.jsLink = v.jsLink;
          // Modern view formatting (JSON)
          if (v.customFormatter) {
            try {
              viewDef.customFormatter = JSON.parse(v.customFormatter);
            } catch {
              viewDef.customFormatter = v.customFormatter;
            }
          }
          // View data (grouping, etc.)
          if (v.viewData) viewDef.viewData = v.viewData;
          // Aggregations
          if (v.aggregations) viewDef.aggregations = v.aggregations;
          return viewDef;
        });
      }

      // Include content types if enabled
      if (list.contentTypesEnabled && list.contentTypes.length > 0) {
        listDef.contentTypeBindings = list.contentTypes.map(ct => ({ name: ct }));
      }

      return listDef;
    });
  }

  // Security
  if (input.groups.length > 0 || input.permissionLevels.length > 0) {
    template.security = {};

    if (input.groups.length > 0) {
      template.security.siteGroups = input.groups.map(g => ({
        title: g.title,
        description: g.description,
        owner: g.ownerTitle,
        allowMembersEditMembership: g.allowMembersEditMembership,
        allowRequestToJoinLeave: g.allowRequestToJoinLeave,
        autoAcceptRequestToJoinLeave: g.autoAcceptRequestToJoinLeave,
        onlyAllowMembersViewMembership: g.onlyAllowMembersViewMembership,
      }));
    }

    if (input.permissionLevels.length > 0) {
      template.security.permissions = {
        roleDefinitions: input.permissionLevels.filter(p => p.isCustom).map(p => ({
          name: p.title,
          description: p.description,
        })),
      };
    }
  }

  // Navigation
  if (input.navigation.length > 0) {
    template.navigation = {};

    const topNav = input.navigation.find(n => n.navigationType === 'topNav');
    if (topNav) {
      template.navigation.globalNavigation = {
        navigationType: 'Structural',
        structuralNavigation: {
          removeExistingNodes: false,
          navigationNodes: mapNavigationNodes(topNav.nodes),
        },
      };
    }

    const quickLaunch = input.navigation.find(n => n.navigationType === 'quickLaunch');
    if (quickLaunch) {
      template.navigation.currentNavigation = {
        navigationType: 'Structural',
        structuralNavigation: {
          removeExistingNodes: false,
          navigationNodes: mapNavigationNodes(quickLaunch.nodes),
        },
      };
    }
  }

  // Regional Settings
  const regionalSettings = input.siteSettings.find(s => s.settingsType === 'regional');
  if (regionalSettings) {
    template.regionalSettings = {
      localeId: regionalSettings.locale,
      timeZone: regionalSettings.timeZone,
    };
  }

  return JSON.stringify(template, null, 2);
}

function mapNavigationNodes(nodes: any[]): any[] {
  return nodes.map(n => ({
    title: n.title,
    url: n.url,
    isExternal: n.isExternal,
    children: n.children ? mapNavigationNodes(n.children) : [],
  }));
}

/**
 * Generate PnP Provisioning Template in XML format
 */
function generatePnPXml(input: ISchemaGeneratorInput): string {
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<pnp:Provisioning xmlns:pnp="http://schemas.dev.office.com/PnP/2021/03/ProvisioningSchema">
  <pnp:Templates ID="CONTAINER-TEMPLATES">
    <pnp:ProvisioningTemplate ID="TEMPLATE-1" Version="1">
`;

  // Site Columns
  if (input.siteColumns.length > 0) {
    xml += `      <pnp:SiteFields>\n`;
    input.siteColumns.forEach(col => {
      xml += `        ${generateCleanSiteColumnXml(col)}\n`;
    });
    xml += `      </pnp:SiteFields>\n`;
  }

  // Content Types
  if (input.contentTypes.length > 0) {
    xml += `      <pnp:ContentTypes>\n`;
    input.contentTypes.forEach(ct => {
      xml += `        <pnp:ContentType ID="${ct.contentTypeId}" Name="${escapeXml(ct.title)}" Description="${escapeXml(ct.description || '')}" Group="${escapeXml(ct.group || '')}">\n`;
      if (ct.fieldLinks.length > 0) {
        xml += `          <pnp:FieldRefs>\n`;
        ct.fieldLinks.forEach(fl => {
          xml += `            <pnp:FieldRef ID="${fl.id}" Name="${fl.name}" Required="${fl.required}" Hidden="${fl.hidden}" />\n`;
        });
        xml += `          </pnp:FieldRefs>\n`;
      }
      xml += `        </pnp:ContentType>\n`;
    });
    xml += `      </pnp:ContentTypes>\n`;
  }

  // Lists
  if (input.lists.length > 0) {
    xml += `      <pnp:Lists>\n`;
    input.lists.forEach(list => {
      xml += `        <pnp:ListInstance Title="${escapeXml(list.title)}" Description="${escapeXml(list.description || '')}" TemplateType="${list.baseTemplate}" Url="Lists/${list.title.replace(/\s+/g, '')}"`;
      if (list.enableVersioning) xml += ` EnableVersioning="TRUE"`;
      if (list.contentTypesEnabled) xml += ` ContentTypesEnabled="TRUE"`;
      xml += `>\n`;

      // Fields - only custom fields with clean schema
      const customFields = list.fields.filter(f => !isSystemField(f.internalName));
      if (customFields.length > 0) {
        xml += `          <pnp:Fields>\n`;
        customFields.forEach(f => {
          xml += `            ${generateCleanFieldXml(f)}\n`;
        });
        xml += `          </pnp:Fields>\n`;
      }

      // Views
      if (list.views.length > 0) {
        xml += `          <pnp:Views>\n`;
        list.views.forEach(v => {
          const viewFields = v.viewFields.map((vf: string) => `<FieldRef Name="${vf}" />`).join('');
          // Build view attributes
          let viewAttrs = `DisplayName="${escapeXml(v.title)}" DefaultView="${v.defaultView}" RowLimit="${v.rowLimit}"`;
          if (v.viewType) viewAttrs += ` ViewType="${v.viewType}"`;
          if (v.paged) viewAttrs += ` Paged="TRUE"`;
          if (v.scope !== undefined) viewAttrs += ` Scope="${v.scope}"`;

          xml += `            <pnp:View ${viewAttrs}>\n`;
          xml += `              <ViewFields>${viewFields}</ViewFields>\n`;

          // Query - output raw XML (not escaped since it's already XML)
          if (v.viewQuery) {
            xml += `              <Query>${v.viewQuery}</Query>\n`;
          }

          // JSLink for classic rendering
          if (v.jsLink) {
            xml += `              <JSLink>${escapeXml(v.jsLink)}</JSLink>\n`;
          }

          // ViewData (grouping settings)
          if (v.viewData) {
            xml += `              <ViewData>${v.viewData}</ViewData>\n`;
          }

          // Aggregations
          if (v.aggregations) {
            xml += `              <Aggregations>${v.aggregations}</Aggregations>\n`;
          }

          // Custom formatter (modern view formatting) - store as CDATA
          if (v.customFormatter) {
            xml += `              <CustomFormatter><![CDATA[${v.customFormatter}]]></CustomFormatter>\n`;
          }

          xml += `            </pnp:View>\n`;
        });
        xml += `          </pnp:Views>\n`;
      }

      xml += `        </pnp:ListInstance>\n`;
    });
    xml += `      </pnp:Lists>\n`;
  }

  // Security
  if (input.groups.length > 0) {
    xml += `      <pnp:Security>\n`;
    xml += `        <pnp:SiteGroups>\n`;
    input.groups.forEach(g => {
      xml += `          <pnp:SiteGroup Title="${escapeXml(g.title)}" Description="${escapeXml(g.description || '')}" Owner="${escapeXml(g.ownerTitle || '')}" />\n`;
    });
    xml += `        </pnp:SiteGroups>\n`;
    xml += `      </pnp:Security>\n`;
  }

  xml += `    </pnp:ProvisioningTemplate>
  </pnp:Templates>
</pnp:Provisioning>`;

  return xml;
}

/**
 * Generate Site Script JSON
 */
function generateSiteScript(input: ISchemaGeneratorInput): string {
  const script: any = {
    $schema: 'https://developer.microsoft.com/json-schemas/sp/site-design-script-actions.schema.json',
    actions: [],
    version: 1,
  };

  // Site Columns - use createSiteColumn action
  input.siteColumns.forEach(col => {
    script.actions.push({
      verb: 'createSiteColumn',
      fieldType: col.fieldType,
      internalName: col.internalName,
      displayName: col.title,
      isRequired: col.required,
      group: col.group,
    });
  });

  // Content Types
  input.contentTypes.forEach(ct => {
    script.actions.push({
      verb: 'createContentType',
      name: ct.title,
      description: ct.description,
      parentId: ct.parentId || '0x01',
      hidden: ct.hidden,
    });
  });

  // Lists
  input.lists.forEach(list => {
    script.actions.push({
      verb: 'createSPList',
      listName: list.title,
      templateType: list.baseTemplate,
      subactions: list.fields.map(f => ({
        verb: 'addSPField',
        fieldType: f.fieldType,
        displayName: f.title,
        internalName: f.internalName,
        isRequired: f.required,
      })),
    });
  });

  return JSON.stringify(script, null, 2);
}

/**
 * Generate PnP PowerShell commands
 */
function generatePnPPowerShell(input: ISchemaGeneratorInput): string {
  const lines: string[] = [
    '# PnP PowerShell Provisioning Script',
    '# Generated by Schema Explorer',
    '',
    '# Connect to site',
    '$siteUrl = "https://tenant.sharepoint.com/sites/yoursite"',
    'Connect-PnPOnline -Url $siteUrl -Interactive',
    '',
  ];

  // Site Columns
  if (input.siteColumns.length > 0) {
    lines.push('# Site Columns');
    input.siteColumns.forEach(col => {
      lines.push(`Add-PnPField -DisplayName "${col.title}" -InternalName "${col.internalName}" -Type ${col.fieldType} -Group "${col.group}"`);
    });
    lines.push('');
  }

  // Content Types
  if (input.contentTypes.length > 0) {
    lines.push('# Content Types');
    input.contentTypes.forEach(ct => {
      lines.push(`Add-PnPContentType -Name "${ct.title}" -Description "${ct.description}" -Group "${ct.group}"`);
    });
    lines.push('');
  }

  // Lists
  if (input.lists.length > 0) {
    lines.push('# Lists and Libraries');
    input.lists.forEach(list => {
      const template = list.baseTemplate === 101 ? 'DocumentLibrary' : 'GenericList';
      lines.push(`New-PnPList -Title "${list.title}" -Template ${template}`);

      // Add fields
      list.fields.filter(f => !f.readOnly).forEach(f => {
        lines.push(`Add-PnPField -List "${list.title}" -DisplayName "${f.title}" -InternalName "${f.internalName}" -Type ${f.fieldType}`);
      });
    });
    lines.push('');
  }

  // Groups
  if (input.groups.length > 0) {
    lines.push('# SharePoint Groups');
    input.groups.filter(g => g.groupType === 'custom').forEach(g => {
      lines.push(`New-PnPGroup -Title "${g.title}" -Description "${g.description}"`);
    });
    lines.push('');
  }

  lines.push('Write-Host "Provisioning complete!" -ForegroundColor Green');

  return lines.join('\n');
}

/**
 * Generate CLI for Microsoft 365 commands
 */
function generateCliM365(input: ISchemaGeneratorInput): string {
  const lines: string[] = [
    '#!/bin/bash',
    '# CLI for Microsoft 365 Provisioning Script',
    '# Generated by Schema Explorer',
    '',
    '# Login',
    'm365 login',
    '',
    'SITE_URL="https://tenant.sharepoint.com/sites/yoursite"',
    '',
  ];

  // Site Columns
  if (input.siteColumns.length > 0) {
    lines.push('# Site Columns');
    input.siteColumns.forEach(col => {
      lines.push(`m365 spo field add --webUrl "$SITE_URL" --title "${col.title}" --type ${col.fieldType} --group "${col.group}"`);
    });
    lines.push('');
  }

  // Content Types
  if (input.contentTypes.length > 0) {
    lines.push('# Content Types');
    input.contentTypes.forEach(ct => {
      lines.push(`m365 spo contenttype add --webUrl "$SITE_URL" --name "${ct.title}" --description "${ct.description}" --group "${ct.group}"`);
    });
    lines.push('');
  }

  // Lists
  if (input.lists.length > 0) {
    lines.push('# Lists');
    input.lists.forEach(list => {
      const template = list.baseTemplate === 101 ? 'DocumentLibrary' : 'GenericList';
      lines.push(`m365 spo list add --webUrl "$SITE_URL" --title "${list.title}" --baseTemplate ${template}`);
    });
    lines.push('');
  }

  lines.push('echo "Provisioning complete!"');

  return lines.join('\n');
}

/**
 * Generate TypeScript interfaces
 */
function generateTypeScript(input: ISchemaGeneratorInput): string {
  const lines: string[] = [
    '// TypeScript Interfaces',
    '// Generated by Schema Explorer',
    '',
  ];

  // Generate interfaces for each list
  input.lists.forEach(list => {
    const interfaceName = `I${toPascalCase(list.title)}Item`;

    lines.push(`/**`);
    lines.push(` * ${list.title} list item interface`);
    if (list.description) {
      lines.push(` * ${list.description}`);
    }
    lines.push(` */`);
    lines.push(`export interface ${interfaceName} {`);
    lines.push(`  Id: number;`);

    list.fields.forEach(f => {
      const tsType = mapFieldTypeToTs(f.fieldType);
      const optional = !f.required ? '?' : '';
      lines.push(`  ${f.internalName}${optional}: ${tsType};`);
    });

    lines.push(`}`);
    lines.push('');
  });

  // Generate enums for choice fields in site columns
  input.siteColumns.filter(col => col.fieldType === 'Choice' && col.choices).forEach(col => {
    const enumName = toPascalCase(col.internalName || col.title) + 'Choice';
    lines.push(`export enum ${enumName} {`);
    col.choices?.forEach(choice => {
      const key = toPascalCase(choice).replace(/[^a-zA-Z0-9]/g, '');
      lines.push(`  ${key} = '${choice}',`);
    });
    lines.push(`}`);
    lines.push('');
  });

  return lines.join('\n');
}

// Helper functions
function generateFieldSchemaXml(col: ISiteColumnSchema): string {
  return `<Field ID="{${col.id}}" Name="${col.internalName}" DisplayName="${col.title}" Type="${col.fieldType}" Group="${col.group}" />`;
}

function _generateViewSchemaXml(view: any): string {
  const fields = view.viewFields.map((f: string) => `<FieldRef Name="${f}" />`).join('');
  return `<View DisplayName="${escapeXml(view.title)}" DefaultView="${view.defaultView}" Type="HTML"><ViewFields>${fields}</ViewFields><RowLimit>${view.rowLimit}</RowLimit></View>`;
}

// Export for potential use
export { _generateViewSchemaXml as generateViewSchemaXml };

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function mapFieldTypeToTs(fieldType: string): string {
  const typeMap: Record<string, string> = {
    Text: 'string',
    Note: 'string',
    Number: 'number',
    Currency: 'number',
    Integer: 'number',
    Counter: 'number',
    DateTime: 'string',
    Boolean: 'boolean',
    User: '{ Id: number; Title: string; EMail?: string }',
    Lookup: '{ Id: number; Title: string }',
    Choice: 'string',
    MultiChoice: 'string[]',
    URL: '{ Url: string; Description: string }',
    Guid: 'string',
    TaxonomyFieldType: '{ Label: string; TermGuid: string }',
    TaxonomyFieldTypeMulti: '{ Label: string; TermGuid: string }[]',
  };
  return typeMap[fieldType] || 'unknown';
}

// System fields to exclude from schema export
const SYSTEM_FIELDS = [
  'ContentType', 'Title', 'ID', 'Created', 'Author', 'Modified', 'Editor',
  'Attachments', 'Edit', 'LinkTitleNoMenu', 'LinkTitle', 'DocIcon',
  'ItemChildCount', 'FolderChildCount', 'AppAuthor', 'AppEditor',
  'ContentTypeId', 'SyncClientId', 'ComplianceAssetId', 'GUID',
  'FileDirRef', 'FSObjType', 'PermMask', 'FileRef', 'FileLeafRef',
  'UniqueId', 'File_x0020_Type', 'HTML_x0020_File_x0020_Type',
  'SMTotalFileStreamSize', 'SMLastModifiedDate', 'SMTotalFileCount',
  '_ComplianceFlags', '_ComplianceTag', '_ComplianceTagWrittenTime',
  '_ComplianceTagUserId', '_IsRecord', '_CommentCount', '_LikeCount',
  '_ColorTag', '_ColorHex', '_Emoji', '_DisplayName',
];

function isSystemField(internalName: string): boolean {
  return SYSTEM_FIELDS.includes(internalName) ||
         internalName.startsWith('_') ||
         internalName.startsWith('ows_');
}

// Generate clean field definition with only important properties in proper order
function generateCleanFieldDef(field: any): any {
  const def: any = {
    internalName: field.internalName,
    displayName: field.title,
    type: field.fieldType,
  };

  // Add required if true
  if (field.required) def.required = true;

  // Add indexed if true
  if (field.indexed) def.indexed = true;

  // Client-side rendering (SPFx Field Customizer)
  if (field.clientSideComponentId) {
    def.clientSideComponentId = field.clientSideComponentId;
    if (field.clientSideComponentProperties) {
      try {
        def.clientSideComponentProperties = JSON.parse(field.clientSideComponentProperties);
      } catch {
        def.clientSideComponentProperties = field.clientSideComponentProperties;
      }
    }
  }

  // Modern column formatting (JSON)
  if (field.customFormatter) {
    try {
      def.customFormatter = JSON.parse(field.customFormatter);
    } catch {
      def.customFormatter = field.customFormatter;
    }
  }

  return def;
}

// Properties to exclude from field schema (SharePoint internal/auto-generated)
const EXCLUDED_FIELD_PROPERTIES = [
  'ColName', 'RowOrdinal', 'SourceID', 'Version', 'Customization',
  'PITarget', 'PIAttribute', 'PrimaryPITarget', 'PrimaryPIAttribute',
  'Aggregation', 'Node', 'WebId', 'ListId', 'FieldId',
  'AuthoringInfo', 'AllowDeletion', 'AppCreatedInSharePoint',
  'DisplaceOnUpgrade', 'FromBaseType', 'Overwrite', 'Viewable',
  'Sealed', 'ShowInFileDlg', 'ShowInVersionHistory',
];

// Properties that should come first in a specific order
const FIELD_PROPERTY_ORDER = [
  'ID', 'Type', 'DisplayName', 'Name', 'StaticName', 'Required',
  'Group', 'Description', 'MaxLength', 'NumLines', 'RichText',
  'Min', 'Max', 'Decimals', 'Format', 'FillInChoice',
  'List', 'ShowField', 'Mult', 'UserSelectionMode', 'UserSelectionScope',
  'Indexed', 'EnforceUniqueValues', 'Hidden', 'ReadOnly',
  'ClientSideComponentId', 'ClientSideComponentProperties',
];

// Generate clean field XML by parsing and filtering schemaXml
function generateCleanFieldXml(field: any): string {
  if (!field.schemaXml) {
    // Fallback if no schemaXml available
    return generateFallbackFieldXml(field);
  }

  // Parse the schemaXml to extract attributes
  const attrs = parseFieldAttributes(field.schemaXml);

  // Filter out excluded properties
  const filteredAttrs = new Map<string, string>();
  attrs.forEach((value, key) => {
    if (!EXCLUDED_FIELD_PROPERTIES.includes(key)) {
      filteredAttrs.set(key, value);
    }
  });

  // Build XML with properties in preferred order
  let xml = '<Field';

  // First add properties in preferred order
  FIELD_PROPERTY_ORDER.forEach(prop => {
    if (filteredAttrs.has(prop)) {
      xml += ` ${prop}="${filteredAttrs.get(prop)}"`;
      filteredAttrs.delete(prop);
    }
  });

  // Then add remaining properties
  filteredAttrs.forEach((value, key) => {
    xml += ` ${key}="${value}"`;
  });

  // Handle custom formatter
  if (field.customFormatter) {
    xml += `>\n              <CustomFormatter><![CDATA[${field.customFormatter}]]></CustomFormatter>\n            </Field>`;
    return xml;
  }

  // Check if original has child elements (like CHOICES)
  const childContent = extractFieldChildElements(field.schemaXml);
  if (childContent) {
    xml += `>${childContent}</Field>`;
    return xml;
  }

  xml += ' />';
  return xml;
}

// Parse field XML attributes into a Map
function parseFieldAttributes(schemaXml: string): Map<string, string> {
  const attrs = new Map<string, string>();
  // Match attribute="value" patterns
  const attrRegex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(schemaXml)) !== null) {
    attrs.set(match[1], match[2]);
  }
  return attrs;
}

// Extract child elements from field XML (CHOICES, Default, Formula, etc.)
function extractFieldChildElements(schemaXml: string): string | null {
  // Check if it's a self-closing tag
  if (schemaXml.trim().endsWith('/>')) {
    return null;
  }

  // Extract content between > and </Field>
  const match = schemaXml.match(/>([^]*)<\/Field>/i);
  if (match && match[1].trim()) {
    return match[1];
  }
  return null;
}

// Fallback field XML generation when schemaXml is not available
function generateFallbackFieldXml(field: any): string {
  let xml = `<Field`;
  xml += ` ID="{${field.id}}"`;
  xml += ` Type="${field.fieldType}"`;
  xml += ` DisplayName="${escapeXml(field.title)}"`;
  xml += ` Name="${field.internalName}"`;
  xml += ` StaticName="${field.internalName}"`;
  if (field.required) xml += ` Required="TRUE"`;
  if (field.indexed) xml += ` Indexed="TRUE"`;
  if (field.clientSideComponentId) {
    xml += ` ClientSideComponentId="${field.clientSideComponentId}"`;
    if (field.clientSideComponentProperties) {
      xml += ` ClientSideComponentProperties="${escapeXml(field.clientSideComponentProperties)}"`;
    }
  }
  if (field.customFormatter) {
    xml += `>\n              <CustomFormatter><![CDATA[${field.customFormatter}]]></CustomFormatter>\n            </Field>`;
    return xml;
  }
  xml += ` />`;
  return xml;
}

// Generate clean site column XML by parsing and filtering schemaXml
function generateCleanSiteColumnXml(col: ISiteColumnSchema): string {
  if (!col.schemaXml) {
    // Fallback if no schemaXml available
    return generateFallbackSiteColumnXml(col);
  }

  // Parse the schemaXml to extract attributes
  const attrs = parseFieldAttributes(col.schemaXml);

  // Filter out excluded properties
  const filteredAttrs = new Map<string, string>();
  attrs.forEach((value, key) => {
    if (!EXCLUDED_FIELD_PROPERTIES.includes(key)) {
      filteredAttrs.set(key, value);
    }
  });

  // Build XML with properties in preferred order
  let xml = '<Field';

  // First add properties in preferred order
  FIELD_PROPERTY_ORDER.forEach(prop => {
    if (filteredAttrs.has(prop)) {
      xml += ` ${prop}="${filteredAttrs.get(prop)}"`;
      filteredAttrs.delete(prop);
    }
  });

  // Then add remaining properties
  filteredAttrs.forEach((value, key) => {
    xml += ` ${key}="${value}"`;
  });

  // Check if original has child elements (like CHOICES)
  const childContent = extractFieldChildElements(col.schemaXml);
  if (childContent) {
    xml += `>${childContent}</Field>`;
    return xml;
  }

  xml += ' />';
  return xml;
}

// Fallback site column XML generation when schemaXml is not available
function generateFallbackSiteColumnXml(col: ISiteColumnSchema): string {
  let xml = `<Field`;
  xml += ` ID="{${col.id}}"`;
  xml += ` Type="${col.fieldType}"`;
  xml += ` DisplayName="${escapeXml(col.title)}"`;
  xml += ` Name="${col.internalName}"`;
  xml += ` StaticName="${col.internalName}"`;
  if (col.required) xml += ` Required="TRUE"`;
  xml += ` Group="${escapeXml(col.group)}"`;
  if (col.indexed) xml += ` Indexed="TRUE"`;
  xml += ` />`;
  return xml;
}

