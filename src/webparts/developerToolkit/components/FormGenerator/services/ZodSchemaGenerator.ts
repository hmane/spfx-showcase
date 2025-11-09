import { FieldConfiguration, FormConfiguration } from '../types/FormGeneratorTypes';

/**
 * Generates Zod schema code from field configurations
 */
export class ZodSchemaGenerator {
  /**
   * Generate complete Zod schema code
   */
  public static generate(
    interfaceName: string,
    fields: FieldConfiguration[],
    formConfig: FormConfiguration
  ): string {
    const schemaName = `${interfaceName}Schema`;
    const typeName = interfaceName;

    const imports = this.generateImports();
    const schemas = this.generateFieldSchemas(fields);
    const mainSchema = this.generateMainSchema(schemaName, fields);
    const typeExport = `export type ${typeName} = z.infer<typeof ${schemaName}>;`;

    return `${imports}\n\n${schemas}${mainSchema}\n\n${typeExport}`;
  }

  /**
   * Generate import statements
   */
  private static generateImports(): string {
    return `import { z } from 'zod';`;
  }

  /**
   * Generate field-specific schemas (for complex types)
   */
  private static generateFieldSchemas(fields: FieldConfiguration[]): string {
    const schemas: string[] = [];

    // Check if we need special schemas
    const hasUser = fields.some(f => f.componentType === 'SPUserField');
    const hasLookup = fields.some(f => f.componentType === 'SPLookupField');
    const hasTaxonomy = fields.some(f => f.componentType === 'SPTaxonomyField');
    const hasUrl = fields.some(f => f.componentType === 'SPUrlField');

    if (hasUser) {
      schemas.push(`// User field schema
const userSchema = z.object({
  Id: z.number(),
  Title: z.string().optional(),
  EMail: z.string().optional(),
}).passthrough();`);
    }

    if (hasLookup) {
      schemas.push(`// Lookup field schema
const lookupSchema = z.object({
  Id: z.number(),
  Title: z.string().optional(),
});`);
    }

    if (hasTaxonomy) {
      schemas.push(`// Taxonomy field schema
const taxonomySchema = z.object({
  TermGuid: z.string(),
  Label: z.string(),
  WssId: z.number().optional(),
});`);
    }

    if (hasUrl) {
      schemas.push(`// URL field schema
const urlSchema = z.object({
  Url: z.string().url('Invalid URL'),
  Description: z.string().optional(),
});`);
    }

    return schemas.length > 0 ? schemas.join('\n\n') + '\n\n' : '';
  }

  /**
   * Generate main schema
   */
  private static generateMainSchema(schemaName: string, fields: FieldConfiguration[]): string {
    const fieldSchemas = fields.map(field => this.generateFieldSchema(field));

    return `export const ${schemaName} = z.object({
${fieldSchemas.map(fs => `  ${fs}`).join(',\n')}
});`;
  }

  /**
   * Generate schema for a single field
   */
  private static generateFieldSchema(field: FieldConfiguration): string {
    let schema = `${field.name}: `;

    // Base schema by component type
    schema += this.generateBaseSchema(field);

    // Add validations
    schema += this.generateValidations(field);

    // Add custom refinement if configured
    if (field.hasCustomRefinement) {
      schema += this.generateCustomRefinement(field);
    }

    // Handle optional
    if (field.isOptional) {
      schema += '.optional()';
    }

    return schema;
  }

  /**
   * Generate base schema based on field type
   */
  private static generateBaseSchema(field: FieldConfiguration): string {
    switch (field.componentType) {
      case 'SPTextField':
        return 'z.string()';

      case 'SPNumberField':
        return 'z.preprocess((arg) => arg === null || arg === undefined || arg === "" ? null : Number(arg), z.number().nullable())';

      case 'SPBooleanField':
        return 'z.boolean()';

      case 'SPDateField':
        // Add preprocessing to handle both Date objects and strings
        return `z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ).nullable()`;

      case 'SPUserField':
        return field.allowMultiple ? 'z.array(userSchema)' : 'userSchema';

      case 'SPLookupField':
        return field.allowMultiple ? 'z.array(lookupSchema)' : 'lookupSchema';

      case 'SPTaxonomyField':
        return field.allowMultiple ? 'z.array(taxonomySchema)' : 'taxonomySchema';

      case 'SPUrlField':
        return 'urlSchema';

      case 'SPChoiceField':
        if (field.choices && field.choices.length > 0) {
          if (field.allowMultiple) {
            return `z.array(z.enum([${field.choices.map(c => `'${c}'`).join(', ')}]))`;
          } else {
            return `z.enum([${field.choices.map(c => `'${c}'`).join(', ')}])`;
          }
        }
        return 'z.string()';

      default:
        return 'z.string()';
    }
  }

  /**
   * Generate validation chains
   */
  private static generateValidations(field: FieldConfiguration): string {
    const validations: string[] = [];

    // String validations
    if (field.componentType === 'SPTextField') {
      if (field.minLength) {
        validations.push(`.min(${field.minLength}, "${field.label} must be at least ${field.minLength} characters")`);
      }
      if (field.maxLength) {
        validations.push(`.max(${field.maxLength}, "${field.label} must be at most ${field.maxLength} characters")`);
      }
      if (field.isEmail) {
        validations.push(`.email("Invalid email address")`);
      }
      if (field.isUrl) {
        validations.push(`.url("Invalid URL")`);
      }
      if (field.pattern) {
        const escapedPattern = field.pattern.replace(/\\/g, '\\\\');
        const message = field.patternMessage || 'Invalid format';
        validations.push(`.regex(/${escapedPattern}/, "${message}")`);
      }
    }

    // Number validations
    if (field.componentType === 'SPNumberField') {
      if (!field.isOptional) {
        validations.push(`.refine(val => val !== null, "${field.label} is required")`);
      }
      if (field.isInteger) {
        validations.push(`.refine(val => val === null || Number.isInteger(val), "Must be an integer")`);
      }
      if (field.min !== undefined) {
        validations.push(`.refine(val => val === null || val >= ${field.min}, "${field.label} must be at least ${field.min}")`);
      }
      if (field.max !== undefined) {
        validations.push(`.refine(val => val === null || val <= ${field.max}, "${field.label} must be at most ${field.max}")`);
      }
      if (field.isPositive) {
        validations.push(`.refine(val => val === null || val > 0, "${field.label} must be positive")`);
      }
    }

    // Date validations
    if (field.componentType === 'SPDateField') {
      if (!field.isOptional) {
        validations.push(`.refine(val => val !== null, "${field.label} is required")`);
      }
      // Min date validation
      if (field.minDate) {
        validations.push(`.refine(
      val => !val || new Date(val) >= new Date('${field.minDate}'),
      "${field.label} cannot be before ${new Date(field.minDate).toLocaleDateString()}"
    )`);
      }
      // Max date validation
      if (field.maxDate) {
        validations.push(`.refine(
      val => !val || new Date(val) <= new Date('${field.maxDate}'),
      "${field.label} cannot be after ${new Date(field.maxDate).toLocaleDateString()}"
    )`);
      }
    }

    // Array validations
    if (field.allowMultiple && (field.componentType === 'SPUserField' || field.componentType === 'SPLookupField' || field.componentType === 'SPTaxonomyField')) {
      if (field.minItems) {
        validations.push(`.min(${field.minItems}, "Select at least ${field.minItems} ${field.minItems === 1 ? 'item' : 'items'}")`);
      }
      if (field.maxItems) {
        validations.push(`.max(${field.maxItems}, "Select at most ${field.maxItems} ${field.maxItems === 1 ? 'item' : 'items'}")`);
      }
    }

    return validations.join('');
  }

  /**
   * Generate custom refinement code
   */
  private static generateCustomRefinement(field: FieldConfiguration): string {
    const message = field.refinementMessage || 'Custom validation failed';

    switch (field.refinementType) {
      case 'refine':
        return `
    .refine((${field.name}) => {
      // TODO: Add your custom validation logic here
      // Example: Check business rules, validate against external data, etc.
      return true;
    }, {
      message: "${message}"
    })`;

      case 'transform':
        return `
    .transform((${field.name}) => {
      // TODO: Add your transformation logic here
      // Example: Normalize, format, or modify the value
      return ${field.name};
    })`;

      case 'preprocess':
        return `
    .preprocess((${field.name}) => {
      // TODO: Add your preprocessing logic here
      // Example: Normalize input before validation
      return ${field.name};
    })`;

      default:
        return '';
    }
  }

  /**
   * Format generated code with proper indentation
   */
  public static formatCode(code: string): string {
    // Basic code formatting
    let formatted = code;

    // Normalize line endings
    formatted = formatted.replace(/\r\n/g, '\n');

    // Remove excessive blank lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim() + '\n';
  }
}
