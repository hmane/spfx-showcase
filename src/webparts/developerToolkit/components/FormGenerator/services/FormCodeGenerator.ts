import { FieldConfiguration, FormConfiguration } from '../types/FormGeneratorTypes';

/**
 * Generates React component code with SPForm fields and React Hook Form integration
 */
export class FormCodeGenerator {
  /**
   * Generate complete form component code
   */
  public static generateComplete(
    interfaceName: string,
    fields: FieldConfiguration[],
    formConfig: FormConfiguration
  ): string {
    const componentName = `${interfaceName}Form`;
    const schemaName = `${interfaceName}Schema`;

    const imports = this.generateImports(fields, formConfig);
    const schemas = this.generateSchemas(fields);
    const component = this.generateComponent(componentName, interfaceName, schemaName, fields, formConfig);

    return `${imports}\n\n${schemas}${component}`;
  }

  /**
   * Generate form component code only (without complete setup)
   */
  public static generateFormOnly(
    interfaceName: string,
    fields: FieldConfiguration[],
    formConfig: FormConfiguration
  ): string {
    const componentName = `${interfaceName}Form`;
    const schemaName = `${interfaceName}Schema`;

    return this.generateComponent(componentName, interfaceName, schemaName, fields, formConfig);
  }

  /**
   * Generate import statements
   */
  private static generateImports(fields: FieldConfiguration[], formConfig: FormConfiguration): string {
    const imports: string[] = [];

    // React imports
    imports.push(`import * as React from 'react';`);

    // React Hook Form imports
    imports.push(`import { useForm } from 'react-hook-form';`);
    imports.push(`import { zodResolver } from '@hookform/resolvers/zod';`);
    imports.push(`import { z } from 'zod';`);

    // SPForm component imports
    const spFieldComponents = this.getUniqueComponents(fields);
    if (spFieldComponents.length > 0) {
      imports.push(`import {
  ${spFieldComponents.join(',\n  ')}
} from 'spfx-toolkit/lib/components/spFields';`);
    }

    // SPForm field enums/types
    const enumImports = this.getEnumImports(fields);
    if (enumImports.length > 0) {
      imports.push(...enumImports);
    }

    // SPForm layout imports
    const layoutComponents = [
      'FormProvider',
      'FormContainer',
      'FormItem',
      'FormLabel',
      'FormValue',
      'FormError',
    ];

    if (formConfig.showErrorSummary) {
      layoutComponents.push('FormErrorSummary');
    }

    if (formConfig.includeScrollToError) {
      layoutComponents.push('useScrollToError');
    }

    imports.push(`import {
  ${layoutComponents.join(',\n  ')}
} from 'spfx-toolkit/lib/components/spForm';`);

    // Fluent UI imports
    imports.push(`import { PrimaryButton, Stack } from '@fluentui/react';`);

    return imports.join('\n');
  }

  /**
   * Get unique SPForm components used
   */
  private static getUniqueComponents(fields: FieldConfiguration[]): string[] {
    const components = new Set<string>();
    fields.forEach(field => {
      components.add(field.componentType);
    });
    return Array.from(components).sort();
  }

  /**
   * Get enum imports needed
   */
  private static getEnumImports(fields: FieldConfiguration[]): string[] {
    const imports: string[] = [];
    const hasTextField = fields.some(f => f.componentType === 'SPTextField' && f.isMultiline);
    const hasBoolean = fields.some(f => f.componentType === 'SPBooleanField');

    if (hasTextField) {
      imports.push(`import { SPTextFieldMode } from 'spfx-toolkit/lib/components/spFields/SPTextField';`);
    }

    if (hasBoolean) {
      imports.push(`import { SPBooleanDisplayType } from 'spfx-toolkit/lib/components/spFields/SPBooleanField';`);
    }

    return imports;
  }

  /**
   * Generate schema definitions
   */
  private static generateSchemas(fields: FieldConfiguration[]): string {
    const schemas: string[] = [];

    // Helper schemas
    const hasUser = fields.some(f => f.componentType === 'SPUserField');
    const hasLookup = fields.some(f => f.componentType === 'SPLookupField');
    const hasTaxonomy = fields.some(f => f.componentType === 'SPTaxonomyField');
    const hasUrl = fields.some(f => f.componentType === 'SPUrlField');

    if (hasUser) {
      schemas.push(`const userSchema = z.object({
  Id: z.number(),
  Title: z.string().optional(),
  EMail: z.string().optional(),
}).passthrough();`);
    }

    if (hasLookup) {
      schemas.push(`const lookupSchema = z.object({
  Id: z.number(),
  Title: z.string().optional(),
});`);
    }

    if (hasTaxonomy) {
      schemas.push(`const taxonomySchema = z.object({
  TermGuid: z.string(),
  Label: z.string(),
  WssId: z.number().optional(),
});`);
    }

    if (hasUrl) {
      schemas.push(`const urlSchema = z.object({
  Url: z.string().url('Invalid URL'),
  Description: z.string().optional(),
});`);
    }

    return schemas.length > 0 ? schemas.join('\n\n') + '\n\n' : '';
  }

  /**
   * Generate component code
   */
  private static generateComponent(
    componentName: string,
    interfaceName: string,
    schemaName: string,
    fields: FieldConfiguration[],
    formConfig: FormConfiguration
  ): string {
    const defaultValues = this.generateDefaultValues(fields);
    const formFields = this.generateFormFields(fields);
    const submitHandler = this.generateSubmitHandler(formConfig);

    return `export const ${componentName}: React.FC = () => {
  const form = useForm<${interfaceName}>({
    resolver: zodResolver(${schemaName}),
    mode: '${formConfig.validationMode}',
    reValidateMode: 'onBlur',
    defaultValues: ${defaultValues},
  });
${formConfig.includeScrollToError ? `
  useScrollToError(form.formState as any, {
    behavior: 'smooth',
    block: 'center',
    focusAfterScroll: true,
  });
` : ''}
  const onSubmit = (data: ${interfaceName}) => {
${submitHandler}
  };

  const onError = (errors: any) => {
    console.error('Validation errors:', errors);
  };

  return (
    <FormProvider control={form.control as any}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
${formConfig.showErrorSummary ? `        <FormErrorSummary
          position="${formConfig.errorSummaryPosition}"
          clickToScroll
          showFieldLabels
          maxErrors={10}
        />
` : ''}
        <FormContainer labelWidth="180px">
          <Stack tokens={{ childrenGap: 16 }}>
${formFields}
            <div>
              <PrimaryButton
                type="submit"
                text="${formConfig.includeLoadingStates ? '${form.formState.isSubmitting ? "Submitting..." : "Submit"}' : 'Submit'}"
                disabled={${formConfig.includeLoadingStates ? 'form.formState.isSubmitting' : 'false'}}
              />
            </div>
          </Stack>
        </FormContainer>
      </form>
    </FormProvider>
  );
};`;
  }

  /**
   * Generate default values object
   */
  private static generateDefaultValues(fields: FieldConfiguration[]): string {
    const defaults: string[] = [];

    fields.forEach(field => {
      let value = 'undefined';

      if (field.componentType === 'SPTextField') {
        value = "''";
      } else if (field.componentType === 'SPNumberField') {
        value = 'undefined';
      } else if (field.componentType === 'SPBooleanField') {
        value = 'false';
      } else if (field.componentType === 'SPDateField') {
        value = 'null';
      } else if (field.componentType === 'SPUserField' || field.componentType === 'SPLookupField' || field.componentType === 'SPTaxonomyField') {
        value = field.allowMultiple ? '[]' : 'undefined';
      } else if (field.componentType === 'SPChoiceField') {
        value = field.allowMultiple ? '[]' : "''";
      } else if (field.componentType === 'SPUrlField') {
        value = 'undefined';
      }

      defaults.push(`      ${field.name}: ${value}`);
    });

    return `{\n${defaults.join(',\n')}\n    }`;
  }

  /**
   * Generate form fields JSX
   */
  private static generateFormFields(fields: FieldConfiguration[]): string {
    return fields.map(field => this.generateFieldJSX(field)).join('\n\n');
  }

  /**
   * Generate JSX for a single field
   */
  private static generateFieldJSX(field: FieldConfiguration): string {
    const indent = '            ';
    const label = field.label;
    const isRequired = !field.isOptional;

    let jsx = `${indent}<FormItem fieldName="${field.name}">
${indent}  <FormLabel${isRequired ? ' isRequired' : ''} htmlFor="${field.name}">
${indent}    ${label}
${indent}  </FormLabel>
${indent}  <FormValue>
${indent}    ${this.generateFieldComponent(field)}
${indent}    <FormError error={form.formState.errors.${field.name}?.message} showIcon />
${indent}  </FormValue>
${indent}</FormItem>`;

    return jsx;
  }

  /**
   * Generate SPForm field component
   */
  private static generateFieldComponent(field: FieldConfiguration): string {
    const props: string[] = [`name="${field.name}"`];

    if (field.placeholder) {
      props.push(`placeholder="${field.placeholder}"`);
    }

    if (!field.isOptional) {
      props.push(`required`);
    }

    switch (field.componentType) {
      case 'SPTextField':
        if (field.isMultiline) {
          props.push(`mode={SPTextFieldMode.MultiLine}`);
          if (field.rows) {
            props.push(`rows={${field.rows}}`);
          }
        }
        if (field.maxLength) {
          props.push(`maxLength={${field.maxLength}}`);
        }
        if (field.showCharacterCount) {
          props.push(`showCharacterCount`);
        }
        break;

      case 'SPNumberField':
        if (field.min !== undefined) {
          props.push(`min={${field.min}}`);
        }
        if (field.max !== undefined) {
          props.push(`max={${field.max}}`);
        }
        if (field.step) {
          props.push(`step={${field.step}}`);
        }
        if (field.decimals !== undefined) {
          props.push(`format={{ decimals: ${field.decimals} }}`);
        }
        break;

      case 'SPBooleanField':
        if (field.displayType) {
          props.push(`displayType={SPBooleanDisplayType.${field.displayType === 'checkbox' ? 'Checkbox' : 'Toggle'}}`);
        }
        if (field.checkedText) {
          props.push(`checkedText="${field.checkedText}"`);
        }
        if (field.uncheckedText) {
          props.push(`uncheckedText="${field.uncheckedText}"`);
        }
        break;

      case 'SPDateField':
        if (field.includeTime) {
          props.push(`showTimePicker={true}`);
        }
        break;

      case 'SPUserField':
        if (field.allowMultiple) {
          props.push(`allowMultiple={true}`);
        }
        break;

      case 'SPLookupField':
        props.push(`dataSource={{
      listNameOrId: 'TODO: Specify list',
      displayField: 'Title'
    }}`);
        if (field.allowMultiple) {
          props.push(`allowMultiple={true}`);
        }
        break;

      case 'SPTaxonomyField':
        props.push(`dataSource={{
      termSetId: 'TODO: Specify term set GUID'
    }}`);
        if (field.allowMultiple) {
          props.push(`allowMultiple={true}`);
        }
        break;

      case 'SPChoiceField':
        if (field.choices && field.choices.length > 0) {
          const choicesStr = field.choices.map(c => `'${c}'`).join(', ');
          props.push(`dataSource={{
      type: 'static',
      choices: [${choicesStr}]
    }}`);
        }
        if (field.allowMultiple) {
          props.push(`allowMultiple={true}`);
        }
        break;
    }

    const propsStr = props.join('\n              ');
    return `<${field.componentType}
              ${propsStr}
            />`;
  }

  /**
   * Generate submit handler based on configuration
   */
  private static generateSubmitHandler(formConfig: FormConfiguration): string {
    switch (formConfig.submitHandlerType) {
      case 'console':
        return `    console.log('Form submitted:', data);
    // TODO: Add your submission logic here`;

      case 'api':
        return `    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }`;

      case 'custom':
        return `    // TODO: Add your custom submission logic here
    console.log('Form data:', data);`;

      default:
        return `    console.log('Form submitted:', data);`;
    }
  }
}
