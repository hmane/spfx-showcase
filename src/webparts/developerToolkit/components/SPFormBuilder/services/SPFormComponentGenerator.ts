import { IConfiguredField } from '../types/SPFormBuilderTypes';
import { getFieldTypeMapping } from '../utils/fieldTypeMapping';

/**
 * Generates React form component with view/new/edit modes
 */
export class SPFormComponentGenerator {
  /**
   * Generate complete form component
   */
  public static generate(
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const imports = this.generateImports(fields);
    const component = this.generateComponent(interfaceName, fields);

    return `${imports}

${component}`;
  }

  /**
   * Generate import statements
   */
  private static generateImports(fields: IConfiguredField[]): string {
    const imports: string[] = [
      "import React, { useEffect } from 'react';",
      "import { useForm } from 'react-hook-form';",
      "import { zodResolver } from '@hookform/resolvers/zod';",
      "import { PrimaryButton, DefaultButton, Icon, Spinner, MessageBar, MessageBarType } from '@fluentui/react';"
    ];

    // Collect unique SP field components
    const components = new Set<string>();
    const includedFields = fields.filter(f => f.isIncluded);

    includedFields.forEach(field => {
      components.add(field.editComponent);
    });

    // Check if UserPersona is needed (for view mode)
    if (includedFields.some(f => f.TypeAsString === 'User' || f.TypeAsString === 'UserMulti')) {
      imports.push("import { UserPersona } from 'spfx-toolkit/components/UserPersona';");
    }

    // Add SP field imports
    if (components.size > 0) {
      imports.push(`import {
  ${Array.from(components).join(',\n  ')}
} from 'spfx-toolkit/components/spFields';`);
    }

    // Add form imports
    imports.push(`import {
  FormProvider,
  FormContainer,
  FormItem,
  FormLabel,
  FormValue,
  FormError,
  FormErrorSummary
} from 'spfx-toolkit/components/spForm';`);

    // Add store and types imports
    imports.push("import { use${interfaceName}Store } from './${interfaceName.toLowerCase()}Store';");
    imports.push("import { ${interfaceName}, ${interfaceName.toLowerCase()}Schema } from './${interfaceName.toLowerCase()}Types';");

    return imports.join('\n');
  }

  /**
   * Generate main component
   */
  private static generateComponent(interfaceName: string, fields: IConfiguredField[]): string {
    const viewMode = this.generateViewMode(interfaceName, fields);
    const editMode = this.generateEditMode(interfaceName, fields);

    return `export const ${interfaceName}Form: React.FC = () => {
  const { mode, data, loading, error, saveItem, setMode } = use${interfaceName}Store();

  const form = useForm<${interfaceName}>({
    resolver: zodResolver(${interfaceName.toLowerCase()}Schema),
    defaultValues: data || ${this.generateDefaultValues(fields)}
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  if (loading) {
    return <Spinner label="Loading..." />;
  }

  if (error) {
    return (
      <MessageBar messageBarType={MessageBarType.error} isMultiline>
        {error}
      </MessageBar>
    );
  }

  // VIEW MODE
  if (mode === 'view') {
    return (
${viewMode}
    );
  }

  // EDIT/NEW MODE
  return (
${editMode}
  );
};`;
  }

  /**
   * Generate view mode JSX
   */
  private static generateViewMode(interfaceName: string, fields: IConfiguredField[]): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const fieldViews = includedFields.map(field => {
      const mapping = getFieldTypeMapping(field);
      const viewRenderer = typeof mapping?.viewRenderer === 'function'
        ? mapping.viewRenderer(field.camelCaseName)
        : mapping?.viewRenderer || `<div>{data?.${field.camelCaseName} || '-'}</div>`;

      return `          <div>
            <strong>${field.Title}:</strong> ${viewRenderer}
          </div>`;
    }).join('\n');

    return `      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{data?.title || '${interfaceName}'}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <PrimaryButton text="Edit" onClick={() => setMode('edit', data?.id)} />
            <DefaultButton text="New" onClick={() => setMode('new')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
${fieldViews}
        </div>
      </div>`;
  }

  /**
   * Generate edit/new mode JSX
   */
  private static generateEditMode(interfaceName: string, fields: IConfiguredField[]): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const formFields = includedFields.map(field => this.generateFormField(field)).join('\n\n');

    return `    <div style={{ padding: '20px' }}>
      <h2>{mode === 'new' ? 'New ${interfaceName}' : 'Edit ${interfaceName}'}</h2>

      <FormProvider control={form.control}>
        <form onSubmit={form.handleSubmit(saveItem)}>
          <FormContainer labelWidth="150px">
${formFields}
          </FormContainer>

          <div style={{ marginTop: '24px' }}>
            <FormErrorSummary position="top" clickToScroll showFieldLabels maxErrors={10} />
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <PrimaryButton
              type="submit"
              text={form.formState.isSubmitting ? 'Saving...' : 'Save'}
              disabled={form.formState.isSubmitting}
            />
            <DefaultButton
              text="Cancel"
              onClick={() => setMode('view')}
              disabled={form.formState.isSubmitting}
            />
          </div>
        </form>
      </FormProvider>
    </div>`;
  }

  /**
   * Generate form field JSX
   */
  private static generateFormField(field: IConfiguredField): string {
    const props = this.generateFieldProps(field);

    return `            <FormItem fieldName="${field.camelCaseName}">
              <FormLabel ${field.Required ? 'isRequired ' : ''}htmlFor="${field.camelCaseName}">
                ${field.Title}
              </FormLabel>
              <FormValue>
                <${field.editComponent}
                  name="${field.camelCaseName}"
${props}                />
                <FormError showIcon />
              </FormValue>
            </FormItem>`;
  }

  /**
   * Generate field props
   */
  private static generateFieldProps(field: IConfiguredField): string {
    const props: string[] = [];

    if (field.Required) {
      props.push('                  required');
    }

    if (field.label) {
      props.push(`                  label="${field.label}"`);
    }

    // Add type-specific props
    if (field.editProps) {
      if (typeof field.editProps === 'function') {
        const generatedProps = field.editProps(field);
        Object.keys(generatedProps).forEach(key => {
          const value = generatedProps[key];
          if (typeof value === 'object') {
            props.push(`                  ${key}={${JSON.stringify(value)}}`);
          } else if (typeof value === 'string') {
            props.push(`                  ${key}="${value}"`);
          } else {
            props.push(`                  ${key}={${value}}`);
          }
        });
      } else {
        Object.keys(field.editProps).forEach(key => {
          const value = field.editProps[key];
          if (typeof value === 'object') {
            props.push(`                  ${key}={${JSON.stringify(value)}}`);
          } else if (typeof value === 'string') {
            props.push(`                  ${key}="${value}"`);
          } else {
            props.push(`                  ${key}={${value}}`);
          }
        });
      }
    }

    // Add field-specific props
    if (field.MaxLength) {
      props.push(`                  maxLength={${field.MaxLength}}`);
    }

    if (field.TypeAsString === 'Note') {
      props.push('                  mode="multiline"');
      props.push('                  rows={4}');
    }

    return props.join('\n');
  }

  /**
   * Generate default values object
   */
  private static generateDefaultValues(fields: IConfiguredField[]): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const values = includedFields.map(field => {
      const value = this.getDefaultValueString(field);
      return `      ${field.camelCaseName}: ${value}`;
    });

    return `{
${values.join(',\n')}
    }`;
  }

  /**
   * Get default value string for a field
   */
  private static getDefaultValueString(field: IConfiguredField): string {
    if (field.defaultValue === null) return 'null';
    if (field.defaultValue === undefined) return 'undefined';

    if (typeof field.defaultValue === 'string') {
      return `'${field.defaultValue}'`;
    }

    if (typeof field.defaultValue === 'number') {
      return `${field.defaultValue}`;
    }

    if (typeof field.defaultValue === 'boolean') {
      return `${field.defaultValue}`;
    }

    if (Array.isArray(field.defaultValue)) {
      return '[]';
    }

    return 'null';
  }

  /**
   * Format generated code
   */
  public static formatCode(code: string): string {
    let formatted = code.replace(/\r\n/g, '\n');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    return formatted.trim() + '\n';
  }
}
