import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { CodeOutputPanel } from './components/CodeOutputPanel';
import { FieldConfigurationPanel } from './components/FieldConfigurationPanel';
import { SharePointSourcePanel } from './components/SharePointSourcePanel';
import { SPCRUDGenerator } from './services/SPCRUDGenerator';
import { SPFormComponentGenerator } from './services/SPFormComponentGenerator';
import { SPInterfaceGenerator } from './services/SPInterfaceGenerator';
import { SPStoreGenerator } from './services/SPStoreGenerator';
import { SPZodSchemaGenerator } from './services/SPZodSchemaGenerator';
import { IConfiguredField, IGenerationResult, ISPField } from './types/SPFormBuilderTypes';
import { getFieldTypeMapping, shouldExcludeField } from './utils/fieldTypeMapping';
import { NameConverter } from './utils/nameConverter';

export const SPFormBuilder: React.FC = () => {
  const [listTitle, setListTitle] = useState<string>('');
  const [fields, setFields] = useState<IConfiguredField[]>([]);

  /**
   * Generate complete package with all files
   */
  const generateCompletePackage = useCallback((parts: {
    interfaceCode: string;
    enums: string;
    zodSchema: string;
    formComponent: string;
    crud: string;
    store: string;
    viewComponent: string;
  }): string => {
    const sections: string[] = [];

    if (parts.enums) {
      sections.push(`// ===== ENUMS =====\n\n${parts.enums}`);
    }

    if (parts.interfaceCode) {
      sections.push(`// ===== INTERFACE =====\n\n${parts.interfaceCode}`);
    }

    if (parts.zodSchema) {
      sections.push(`// ===== ZOD SCHEMA =====\n\n${parts.zodSchema}`);
    }

    if (parts.crud) {
      sections.push(`// ===== CRUD OPERATIONS =====\n\n${parts.crud}`);
    }

    if (parts.store) {
      sections.push(`// ===== ZUSTAND STORE =====\n\n${parts.store}`);
    }

    if (parts.formComponent) {
      sections.push(`// ===== FORM COMPONENT =====\n\n${parts.formComponent}`);
    }

    return sections.join('\n\n');
  }, []);

  /**
   * Handle fields loaded from SharePoint
   */
  const handleFieldsLoaded = useCallback((loadedListTitle: string, spFields: ISPField[]) => {
    setListTitle(loadedListTitle);

    // Ensure system fields are present
    const systemFieldNames = ['ID', 'Title', 'Created', 'Modified', 'Author', 'Editor', 'Attachments'];
    const missingSystemFields: ISPField[] = [];

    systemFieldNames.forEach(fieldName => {
      if (!spFields.find(f => f.InternalName === fieldName)) {
        // Add missing system field
        missingSystemFields.push({
          InternalName: fieldName,
          Title: fieldName === 'Author' ? 'Created By' : fieldName === 'Editor' ? 'Modified By' : fieldName,
          TypeAsString: fieldName === 'ID' ? 'Number' : (fieldName === 'Created' || fieldName === 'Modified') ? 'DateTime' : (fieldName === 'Author' || fieldName === 'Editor') ? 'User' : fieldName === 'Attachments' ? 'Boolean' : 'Text',
          Required: fieldName === 'ID' || fieldName === 'Title',
          ReadOnlyField: fieldName !== 'Title',
          Hidden: false
        });
      }
    });

    const allFields = [...missingSystemFields, ...spFields];

    // Configure fields
    const configuredFields: IConfiguredField[] = allFields.map((field, index) => {
      const mapping = getFieldTypeMapping(field);
      const camelCaseName = NameConverter.toCamelCase(field.InternalName);
      const pascalCaseName = field.InternalName;

      // Determine if field should be included by default
      const isExcluded = shouldExcludeField(field);

      // System fields should be in the list but unselected by default
      // Exception: Title field should be selected by default as users can change it
      const isSystemField = systemFieldNames.includes(field.InternalName);
      const isTitleField = field.InternalName === 'Title';

      return {
        ...field,
        isIncluded: isTitleField || (!isSystemField && !isExcluded),
        order: index,
        label: field.Title,
        camelCaseName,
        pascalCaseName,
        tsType: typeof mapping?.tsType === 'function' ? mapping.tsType(field) : mapping?.tsType || 'string',
        spfxType: mapping?.spfxType,
        zodSchema: typeof mapping?.zodSchema === 'function' ? mapping.zodSchema(field) : mapping?.zodSchema || 'z.string()',
        extractorMethod: mapping?.extractorMethod || 'string',
        editComponent: mapping?.editComponent || 'SPTextField',
        editProps: mapping?.editProps,
        viewRenderer: typeof mapping?.viewRenderer === 'function' ? mapping.viewRenderer(camelCaseName) : mapping?.viewRenderer || `<div>{data?.${camelCaseName}}</div>`,
        defaultValue: typeof mapping?.defaultValue === 'function' ? mapping.defaultValue(field) : mapping?.defaultValue,
        generateEnum: mapping?.generateEnum || false,
        enumName: mapping?.generateEnum ? NameConverter.toEnumName(pascalCaseName) : undefined
      };
    });

    // Reorder: ID first, then custom fields, then other system fields at the end
    const idField = configuredFields.find(f => f.InternalName === 'ID');
    const customFields = configuredFields.filter(f =>
      f.InternalName !== 'ID' &&
      !['Created', 'Modified', 'Author', 'Editor', 'Attachments'].includes(f.InternalName)
    );
    const systemFields = configuredFields.filter(f =>
      ['Created', 'Modified', 'Author', 'Editor', 'Attachments'].includes(f.InternalName)
    );

    const reorderedFields = [
      ...(idField ? [idField] : []),
      ...customFields,
      ...systemFields
    ];

    // Update order property
    reorderedFields.forEach((field, idx) => {
      field.order = idx;
    });

    setFields(reorderedFields);
  }, []);

  /**
   * Generate all code
   */
  const generationResult = useMemo((): IGenerationResult | null => {
    if (fields.length === 0 || !listTitle) {
      return null;
    }

    try {
      // Generate interface name from list title
      const interfaceName = listTitle.replace(/[^a-zA-Z0-9]/g, '');

      // Generate interface and enums
      const { interface: interfaceCode, enums, imports } = SPInterfaceGenerator.generate(
        interfaceName,
        fields
      );

      // Generate Zod schema
      const zodSchema = SPZodSchemaGenerator.generate(interfaceName, fields);

      // Generate CRUD operations
      const crud = SPCRUDGenerator.generate(listTitle, interfaceName, fields);

      // Generate Zustand store
      const store = SPStoreGenerator.generate(listTitle, interfaceName, fields);

      // Generate form component
      const formComponent = SPFormComponentGenerator.generate(interfaceName, fields);

      // Generate view component (placeholder for now)
      const viewComponent = '// View component generation coming soon';

      // Generate complete package
      const complete = generateCompletePackage({
        interfaceCode,
        enums,
        zodSchema,
        formComponent,
        crud,
        store,
        viewComponent
      });

      return {
        interface: interfaceCode,
        enums,
        zodSchema,
        formComponent,
        crud,
        store,
        viewComponent,
        complete,
        imports,
        spfxTypeImports: new Set(fields.filter(f => f.spfxType).map(f => f.spfxType!))
      };
    } catch (error) {
      console.error('Error generating code:', error);
      return null;
    }
  }, [fields, listTitle, generateCompletePackage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#faf9f8' }}>
      {/* Header */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #edebe9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
        }}
      >
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}>
          SPForm Builder
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#605e5c' }}>
          Generate TypeScript interfaces, Zod schemas, forms, and CRUD operations from SharePoint lists
        </p>
      </div>

      {/* Main content - 2 rows layout with page-level scroll only */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Top row: SharePoint Source and Field Configuration (2 columns) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
            borderBottom: '1px solid #edebe9',
            minHeight: 'fit-content'
          }}
        >
          {/* Left: SharePoint Source */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRight: '1px solid #edebe9',
              padding: '16px'
            }}
          >
            <SharePointSourcePanel onFieldsLoaded={handleFieldsLoaded} />
          </div>

          {/* Right: Field Configuration */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '16px'
            }}
          >
            <FieldConfigurationPanel fields={fields} onFieldsChange={setFields} />
          </div>
        </div>

        {/* Bottom row: Code Output (full width) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            minHeight: 'fit-content'
          }}
        >
          <CodeOutputPanel generationResult={generationResult} listTitle={listTitle} fields={fields} />
        </div>
      </div>
    </div>
  );
};

export default SPFormBuilder;
