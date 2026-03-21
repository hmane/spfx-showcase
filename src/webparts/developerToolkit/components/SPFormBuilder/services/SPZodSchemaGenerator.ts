import { IConfiguredField } from '../types/SPFormBuilderTypes';
import { NameConverter } from '../utils/nameConverter';

/**
 * Generates Zod validation schemas from SharePoint field configurations
 * Now includes enums and exports inferred types for tight coupling between schema and types
 */
export class SPZodSchemaGenerator {
  /**
   * Generate complete Zod schema code with enums and type exports
   */
  public static generate(
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const schemaName = `${interfaceName.toLowerCase()}Schema`;
    const imports = this.generateImports(fields);
    const enums = this.generateEnums(fields);
    const reusableSchemas = this.generateReusableSchemas(fields);
    const schema = this.generateSchema(schemaName, interfaceName, fields);

    const parts: string[] = [imports];

    if (enums) {
      parts.push('\n// ============================================');
      parts.push('// Enums - Generated from SharePoint Choice fields');
      parts.push('// ============================================');
      parts.push(enums);
    }

    if (reusableSchemas) {
      parts.push('\n// ============================================');
      parts.push('// Reusable Schemas - For complex field types');
      parts.push('// ============================================');
      parts.push(reusableSchemas);
    }

    parts.push('\n// ============================================');
    parts.push('// Main Schema - Zod validation schema');
    parts.push('// ============================================');
    parts.push(schema);

    return parts.join('\n');
  }

  /**
   * Generate import statements
   */
  private static generateImports(fields: IConfiguredField[]): string {
    const imports: string[] = ['import { z } from \'zod\';'];

    // Check if we need spfx-toolkit types
    const needsSpfxTypes = fields.some(f =>
      f.isIncluded && f.spfxType &&
      ['IPrincipal', 'SPLookup', 'SPTaxonomy', 'SPUrl'].includes(f.spfxType)
    );

    if (needsSpfxTypes) {
      const spfxTypes = new Set<string>();
      fields.filter(f => f.isIncluded && f.spfxType).forEach(f => {
        if (f.spfxType) spfxTypes.add(f.spfxType);
      });
      imports.push(`import type { ${Array.from(spfxTypes).join(', ')} } from 'spfx-toolkit/types';`);
    }

    return imports.join('\n');
  }

  /**
   * Generate enum types for Choice fields
   */
  private static generateEnums(fields: IConfiguredField[]): string {
    const enums: string[] = [];

    fields
      .filter(f => f.isIncluded && f.generateEnum && f.Choices)
      .forEach(field => {
        const enumName = NameConverter.toEnumName(field.pascalCaseName);
        const enumValues = field.Choices!.map(choice => {
          const key = NameConverter.toEnumValue(choice);
          return `  ${key} = '${choice}'`;
        }).join(',\n');

        enums.push(`export enum ${enumName} {\n${enumValues}\n}`);
      });

    return enums.length > 0 ? enums.join('\n\n') : '';
  }

  /**
   * Generate reusable schemas for complex types (User, Lookup, Taxonomy, URL)
   */
  private static generateReusableSchemas(fields: IConfiguredField[]): string {
    const schemas: string[] = [];
    const includedFields = fields.filter(f => f.isIncluded);

    // Check if we need user schema
    const hasUserField = includedFields.some(f =>
      f.TypeAsString === 'User' || f.TypeAsString === 'UserMulti'
    );
    if (hasUserField) {
      schemas.push(`// IPrincipal schema for User fields
export const principalSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email().optional(),
  title: z.string().optional(),
  loginName: z.string().optional(),
});`);
    }

    // Check if we need lookup schema
    const hasLookupField = includedFields.some(f =>
      f.TypeAsString === 'Lookup' || f.TypeAsString === 'LookupMulti'
    );
    if (hasLookupField) {
      schemas.push(`// Lookup schema for Lookup fields
export const lookupSchema = z.object({
  Id: z.number(),
  Title: z.string().optional(),
});`);
    }

    // Check if we need taxonomy schema
    const hasTaxonomyField = includedFields.some(f =>
      f.TypeAsString === 'TaxonomyFieldType' || f.TypeAsString === 'TaxonomyFieldTypeMulti'
    );
    if (hasTaxonomyField) {
      schemas.push(`// Taxonomy schema for Managed Metadata fields
export const taxonomySchema = z.object({
  TermGuid: z.string(),
  Label: z.string(),
  WssId: z.number().optional(),
});`);
    }

    // Check if we need URL schema
    const hasUrlField = includedFields.some(f => f.TypeAsString === 'URL');
    if (hasUrlField) {
      schemas.push(`// URL schema for Hyperlink fields
export const urlSchema = z.object({
  Url: z.string().url(),
  Description: z.string().optional(),
});`);
    }

    return schemas.length > 0 ? schemas.join('\n\n') : '';
  }

  /**
   * Generate main schema object with comprehensive type exports
   */
  private static generateSchema(
    schemaName: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const fieldSchemas = includedFields.map(field => this.generateFieldSchema(field));

    // Generate additional useful types
    const additionalTypes = this.generateAdditionalTypes(interfaceName, includedFields);

    return `export const ${schemaName} = z.object({
${fieldSchemas.map(fs => `  ${fs}`).join(',\n')}
});

// ============================================
// Inferred Types - Tightly coupled with schema
// ============================================

// Main type inferred from Zod schema
export type ${interfaceName} = z.infer<typeof ${schemaName}>;

// Partial type for updates (all fields optional)
export type ${interfaceName}Update = Partial<${interfaceName}>;

// Create type (excludes id for new items)
export type ${interfaceName}Create = Omit<${interfaceName}, 'id'>;

// Form input type (for react-hook-form)
export type ${interfaceName}FormInput = z.input<typeof ${schemaName}>;
${additionalTypes}`;
  }

  /**
   * Generate additional helper types based on field types
   */
  private static generateAdditionalTypes(interfaceName: string, fields: IConfiguredField[]): string {
    const types: string[] = [];

    // Check for required fields and generate a type with only required fields
    const requiredFields = fields.filter(f => f.Required);
    if (requiredFields.length > 0 && requiredFields.length < fields.length) {
      const requiredFieldNames = requiredFields.map(f => `'${f.camelCaseName}'`).join(' | ');
      types.push(`
// Required fields only
export type ${interfaceName}Required = Pick<${interfaceName}, ${requiredFieldNames}>;`);
    }

    return types.join('\n');
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
