
/**
 * Field type mapping configuration
 * Maps SharePoint field types to TypeScript types, components, and utilities
 */

export interface IFieldTypeMapping {
  // TypeScript type
  tsType: string | ((field: any) => string);

  // spfx-toolkit type (for imports)
  spfxType?: string;

  // Extractor method name
  extractorMethod: string;

  // Edit mode component
  editComponent: string;
  editProps?: any | ((field: any) => any);

  // View mode renderer (code string)
  viewRenderer: string | ((fieldName: string) => string);

  // Zod schema
  zodSchema: string | ((field: any) => string);

  // Default value
  defaultValue: any | ((field: any) => any);

  // Whether to generate enum
  generateEnum?: boolean;

  // Additional imports needed
  additionalImports?: string[];
}

export const FIELD_TYPE_MAPPINGS: Record<string, IFieldTypeMapping> = {
  Text: {
    tsType: 'string',
    extractorMethod: 'string',
    editComponent: 'SPTextField',
    editProps: { mode: 'singleline' },
    viewRenderer: (fn) => `<div>{data?.${fn} || '-'}</div>`,
    zodSchema: 'z.string()',
    defaultValue: ''
  },

  Note: {
    tsType: 'string',
    extractorMethod: 'string',
    editComponent: 'SPTextField',
    editProps: { mode: 'multiline', rows: 4 },
    viewRenderer: (fn) => `<div style={{ whiteSpace: 'pre-wrap' }}>{data?.${fn} || '-'}</div>`,
    zodSchema: 'z.string()',
    defaultValue: ''
  },

  Number: {
    tsType: 'number',
    extractorMethod: 'number',
    editComponent: 'SPNumberField',
    editProps: {},
    viewRenderer: (fn) => `<div>{data?.${fn} ?? '-'}</div>`,
    zodSchema: 'z.preprocess((arg) => arg === null || arg === undefined || arg === "" ? null : Number(arg), z.number().nullable())',
    defaultValue: null
  },

  Currency: {
    tsType: 'number',
    extractorMethod: 'currency',
    editComponent: 'SPNumberField',
    editProps: (field: any) => ({
      format: { decimals: 2, currencyCode: 'USD' }
    }),
    viewRenderer: (fn) => `<div>\${data?.${fn}?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '-'}</div>`,
    zodSchema: 'z.preprocess((arg) => arg === null || arg === undefined || arg === "" ? null : Number(arg), z.number().nullable())',
    defaultValue: null
  },

  DateTime: {
    tsType: 'Date',
    extractorMethod: 'date',
    editComponent: 'SPDateField',
    editProps: {},
    viewRenderer: (fn) => `<div>{data?.${fn}?.toLocaleDateString() || '-'}</div>`,
    zodSchema: 'z.preprocess((arg) => { if (typeof arg === "string" || arg instanceof Date) return new Date(arg); return arg; }, z.date()).nullable()',
    defaultValue: null
  },

  Boolean: {
    tsType: 'boolean',
    extractorMethod: 'boolean',
    editComponent: 'SPBooleanField',
    editProps: { displayType: 'toggle' },
    viewRenderer: (fn) => `<Icon iconName={data?.${fn} ? 'CheckMark' : 'Cancel'} />`,
    zodSchema: 'z.boolean()',
    defaultValue: false,
    additionalImports: ['Icon']
  },

  User: {
    tsType: 'IPrincipal',
    spfxType: 'IPrincipal',
    extractorMethod: 'user',
    editComponent: 'SPUserField',
    editProps: { allowMultiple: false },
    viewRenderer: (fn) => `{data?.${fn} ? (
      <UserPersona
        userIdentifier={data.${fn}.email || data.${fn}.loginName}
        displayName={data.${fn}.title}
        size={40}
        displayMode="avatarAndName"
        showLivePersona
      />
    ) : '-'}`,
    zodSchema: 'z.object({ id: z.string(), email: z.string().optional(), title: z.string().optional(), loginName: z.string().optional() }).nullable()',
    defaultValue: null,
    additionalImports: ['UserPersona']
  },

  UserMulti: {
    tsType: 'IPrincipal[]',
    spfxType: 'IPrincipal',
    extractorMethod: 'userMulti',
    editComponent: 'SPUserField',
    editProps: { allowMultiple: true },
    viewRenderer: (fn) => `<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {data?.${fn}?.map((user, idx) => (
        <UserPersona
          key={idx}
          userIdentifier={user.email || user.loginName}
          displayName={user.title}
          size={32}
          displayMode="avatarAndName"
        />
      ))}
    </div>`,
    zodSchema: 'z.array(z.object({ id: z.string(), title: z.string().optional() }))',
    defaultValue: [],
    additionalImports: ['UserPersona']
  },

  Lookup: {
    tsType: 'SPLookup',
    spfxType: 'SPLookup',
    extractorMethod: 'lookup',
    editComponent: 'SPLookupField',
    editProps: (field: any) => ({
      dataSource: {
        listNameOrId: field.LookupList,
        displayField: 'Title'
      }
    }),
    viewRenderer: (fn) => `<div>{data?.${fn}?.title || '-'}</div>`,
    zodSchema: 'z.object({ id: z.number(), title: z.string().optional() }).nullable()',
    defaultValue: null
  },

  LookupMulti: {
    tsType: 'SPLookup[]',
    spfxType: 'SPLookup',
    extractorMethod: 'lookupMulti',
    editComponent: 'SPLookupField',
    editProps: (field: any) => ({
      allowMultiple: true,
      dataSource: {
        listNameOrId: field.LookupList,
        displayField: 'Title'
      }
    }),
    viewRenderer: (fn) => `<div>{data?.${fn}?.map(l => l.title).join(', ') || '-'}</div>`,
    zodSchema: 'z.array(z.object({ id: z.number(), title: z.string().optional() }))',
    defaultValue: []
  },

  TaxonomyFieldType: {
    tsType: 'SPTaxonomy',
    spfxType: 'SPTaxonomy',
    extractorMethod: 'taxonomy',
    editComponent: 'SPTaxonomyField',
    editProps: (field: any) => ({
      dataSource: {
        termSetId: field.TermSetId || 'TERM_SET_ID'
      }
    }),
    viewRenderer: (fn) => `<div>{data?.${fn}?.label || '-'}</div>`,
    zodSchema: 'z.object({ label: z.string().optional(), termId: z.string().optional(), wssId: z.number().optional() }).nullable()',
    defaultValue: null
  },

  TaxonomyFieldTypeMulti: {
    tsType: 'SPTaxonomy[]',
    spfxType: 'SPTaxonomy',
    extractorMethod: 'taxonomyMulti',
    editComponent: 'SPTaxonomyField',
    editProps: (field: any) => ({
      allowMultiple: true,
      dataSource: {
        termSetId: field.TermSetId || 'TERM_SET_ID'
      }
    }),
    viewRenderer: (fn) => `<div>{data?.${fn}?.map(t => t.label).join(', ') || '-'}</div>`,
    zodSchema: 'z.array(z.object({ label: z.string().optional(), termId: z.string().optional(), wssId: z.number().optional() }))',
    defaultValue: []
  },

  URL: {
    tsType: 'SPUrl',
    spfxType: 'SPUrl',
    extractorMethod: 'url',
    editComponent: 'SPUrlField',
    editProps: {},
    viewRenderer: (fn) => `{data?.${fn}?.url ? (
      <a href={data.${fn}.url} target="_blank" rel="noopener noreferrer">
        {data.${fn}.description || data.${fn}.url}
      </a>
    ) : '-'}`,
    zodSchema: 'z.object({ url: z.string().url(), description: z.string().optional() }).nullable()',
    defaultValue: null
  },

  Choice: {
    tsType: (field: any) => `${field.InternalName}Enum`,
    extractorMethod: 'choice',
    editComponent: 'SPChoiceField',
    editProps: (field: any) => ({
      choices: field.Choices || [],
      displayType: 'dropdown'
    }),
    viewRenderer: (fn) => `<div>{data?.${fn} || '-'}</div>`,
    zodSchema: (field: any) => {
      if (field.Choices && field.Choices.length > 0) {
        return `z.enum([${field.Choices.map((c: string) => `'${c}'`).join(', ')}])`;
      }
      return 'z.string()';
    },
    defaultValue: (field: any) => field.Choices?.[0] || '',
    generateEnum: true
  },

  MultiChoice: {
    tsType: (field: any) => `${field.InternalName}Enum[]`,
    extractorMethod: 'multiChoice',
    editComponent: 'SPChoiceField',
    editProps: (field: any) => ({
      choices: field.Choices || [],
      allowMultiple: true,
      displayType: 'checkboxes'
    }),
    viewRenderer: (fn) => `<div>{data?.${fn}?.join(', ') || '-'}</div>`,
    zodSchema: (field: any) => {
      if (field.Choices && field.Choices.length > 0) {
        return `z.array(z.enum([${field.Choices.map((c: string) => `'${c}'`).join(', ')}]))`;
      }
      return 'z.array(z.string())';
    },
    defaultValue: [],
    generateEnum: true
  }
};

/**
 * Get field type mapping for a SharePoint field
 */
export function getFieldTypeMapping(field: any): IFieldTypeMapping | undefined {
  const fieldType = normalizeFieldType(field.TypeAsString || field.FieldTypeKind);
  return FIELD_TYPE_MAPPINGS[fieldType];
}

/**
 * Normalize field type string
 */
export function normalizeFieldType(fieldType: string): string {
  // Map variations to standard types
  const typeMap: Record<string, string> = {
    'Text': 'Text',
    'Note': 'Note',
    'Number': 'Number',
    'Currency': 'Currency',
    'DateTime': 'DateTime',
    'Boolean': 'Boolean',
    'User': 'User',
    'UserMulti': 'UserMulti',
    'Lookup': 'Lookup',
    'LookupMulti': 'LookupMulti',
    'URL': 'URL',
    'Choice': 'Choice',
    'MultiChoice': 'MultiChoice',
    'TaxonomyFieldType': 'TaxonomyFieldType',
    'TaxonomyFieldTypeMulti': 'TaxonomyFieldTypeMulti',
    'Computed': 'Text', // Treat as text
    'Calculated': 'Text', // Treat as text
    'Integer': 'Number',
    'Counter': 'Number',
    'Guid': 'Text'
  };

  return typeMap[fieldType] || 'Text';
}

/**
 * Check if field should be excluded by default
 */
export function shouldExcludeField(field: any): boolean {
  const excludedFields = [
    'ContentTypeId',
    '_UIVersionString',
    'ComplianceAssetId',
    'FileLeafRef',
    'FileDirRef',
    'FSObjType',
    'FileRef',
    '_EditMenuTableStart',
    '_EditMenuTableEnd',
    'LinkFilenameNoMenu',
    'LinkFilename',
    'LinkFilename2',
    'DocIcon',
    'ServerUrl',
    'EncodedAbsUrl',
    'BaseName',
    'FileSizeDisplay',
    'ItemChildCount',
    'FolderChildCount',
    '_ComplianceFlags',
    '_ComplianceTag',
    '_ComplianceTagWrittenTime',
    '_ComplianceTagUserId',
    'AppAuthor',
    'AppEditor',
    '_IsRecord'
  ];

  return (
    field.Hidden ||
    field.ReadOnlyField ||
    excludedFields.includes(field.InternalName) ||
    field.InternalName.startsWith('_') ||
    field.InternalName.startsWith('ows')
  );
}

/**
 * Get list of common fields to include by default
 */
export function getCommonFields(): string[] {
  return [
    'Title',
    'ID',
    'Created',
    'Modified',
    'Author',
    'Editor'
  ];
}
