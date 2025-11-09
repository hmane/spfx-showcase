import { IConfiguredField } from '../types/SPFormBuilderTypes';

/**
 * Generates Zod validation schemas from SharePoint field configurations
 */
export class SPZodSchemaGenerator {
  /**
   * Generate complete Zod schema code
   */
  public static generate(
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const schemaName = `${interfaceName.toLowerCase()}Schema`;
    const imports = this.generateImports();
    const schema = this.generateSchema(schemaName, interfaceName, fields);

    return `${imports}\n\n${schema}`;
  }

  /**
   * Generate import statements
   */
  private static generateImports(): string {
    return `import { z } from 'zod';`;
  }

  /**
   * Generate main schema object
   */
  private static generateSchema(
    schemaName: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const fieldSchemas = includedFields.map(field => this.generateFieldSchema(field));

    return `export const ${schemaName} = z.object({
${fieldSchemas.map(fs => `  ${fs}`).join(',\n')}
});

export type ${interfaceName} = z.infer<typeof ${schemaName}>;`;
  }

  /**
   * Generate schema for a single field
   */
  private static generateFieldSchema(field: IConfiguredField): string {
    let schema = `${field.camelCaseName}: ${field.zodSchema}`;

    // Add validations based on SharePoint field settings or overrides
    schema += this.generateValidations(field);

    // Check if field is required (with override support)
    const isRequired = field.validationOverrides?.overrideRequired
      ? field.validationOverrides.isRequiredOverride
      : field.Required;

    // Add optional() if not required
    if (!isRequired) {
      schema += '.optional()';
    }

    return schema;
  }

  /**
   * Generate validation chains based on field properties with override support
   */
  private static generateValidations(field: IConfiguredField): string {
    const validations: string[] = [];
    const overrides = field.validationOverrides;

    // Check if field is required (with override support)
    const isRequired = overrides?.overrideRequired
      ? overrides.isRequiredOverride
      : field.Required;

    // Text field validations
    if (field.TypeAsString === 'Text' || field.TypeAsString === 'Note') {
      // Min length validation
      const minLength = overrides?.overrideMinLength
        ? overrides.minLengthOverride
        : undefined;

      if (minLength && minLength > 0) {
        validations.push(`.min(${minLength}, "${field.Title} must be at least ${minLength} characters")`);
      } else if (isRequired) {
        validations.push(`.min(1, "${field.Title} is required")`);
      }

      // Max length validation
      const maxLength = overrides?.overrideMaxLength
        ? overrides.maxLengthOverride
        : field.MaxLength;

      if (maxLength) {
        validations.push(`.max(${maxLength}, "${field.Title} must be at most ${maxLength} characters")`);
      }
    }

    // Number field validations
    if (field.TypeAsString === 'Number' || field.TypeAsString === 'Currency') {
      if (isRequired) {
        validations.push(`.refine(val => val !== null, "${field.Title} is required")`);
      }

      // Min value validation
      const minValue = overrides?.overrideMin
        ? overrides.minOverride
        : field.Min;

      if (minValue !== undefined && minValue !== null) {
        validations.push(`.refine(val => val === null || val >= ${minValue}, "${field.Title} must be at least ${minValue}")`);
      }

      // Max value validation
      const maxValue = overrides?.overrideMax
        ? overrides.maxOverride
        : field.Max;

      if (maxValue !== undefined && maxValue !== null) {
        validations.push(`.refine(val => val === null || val <= ${maxValue}, "${field.Title} must be at most ${maxValue}")`);
      }
    }

    // Date field validations
    if (field.TypeAsString === 'DateTime') {
      if (isRequired) {
        validations.push(`.refine(val => val !== null, "${field.Title} is required")`);
      }

      // Min date validation
      if (overrides?.overrideMinDate && overrides.minDateOverride) {
        const minDate = overrides.minDateOverride.toISOString().split('T')[0];
        validations.push(`.refine(val => val === null || val >= new Date('${minDate}'), "${field.Title} must be on or after ${minDate}")`);
      }

      // Max date validation
      if (overrides?.overrideMaxDate && overrides.maxDateOverride) {
        const maxDate = overrides.maxDateOverride.toISOString().split('T')[0];
        validations.push(`.refine(val => val === null || val <= new Date('${maxDate}'), "${field.Title} must be on or before ${maxDate}")`);
      }
    }

    // User field validations
    if (field.TypeAsString === 'User' || field.TypeAsString === 'UserMulti') {
      if (isRequired) {
        if (field.TypeAsString === 'UserMulti') {
          validations.push(`.min(1, "${field.Title} is required")`);
        } else {
          validations.push(`.refine(val => val !== null, "${field.Title} is required")`);
        }
      }
    }

    return validations.join('');
  }

  /**
   * Format generated code
   */
  public static formatCode(code: string): string {
    // Normalize line endings
    let formatted = code.replace(/\r\n/g, '\n');

    // Remove excessive blank lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim() + '\n';
  }
}
