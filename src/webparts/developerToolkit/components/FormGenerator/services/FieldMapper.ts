import {
  ParsedField,
  FieldConfiguration,
  SPFormComponentType,
  FieldType,
} from '../types/FormGeneratorTypes';

/**
 * Maps TypeScript types to SPForm components and provides default configurations
 */
export class FieldMapper {
  /**
   * Convert ParsedField to FieldConfiguration with intelligent defaults
   */
  public static mapFieldToConfiguration(field: ParsedField): FieldConfiguration {
    const baseConfig: FieldConfiguration = {
      ...field,
      label: this.generateLabel(field.name),
      placeholder: this.generatePlaceholder(field.name, field.type),
      description: '',
      componentType: this.determineComponentType(field),
    };

    // Add type-specific defaults
    return this.addTypeSpecificDefaults(baseConfig);
  }

  /**
   * Determine the appropriate SPForm component type
   */
  private static determineComponentType(field: ParsedField): SPFormComponentType {
    const { type, name } = field;

    // Check field name patterns for smart detection
    const lowerName = name.toLowerCase();

    // Email detection
    if (lowerName.includes('email')) {
      return 'SPTextField';
    }

    // URL detection
    if (lowerName.includes('url') || lowerName.includes('link') || lowerName.includes('website')) {
      return 'SPUrlField';
    }

    // Description detection (multiline)
    if (lowerName.includes('description') || lowerName.includes('notes') || lowerName.includes('comment')) {
      return 'SPTextField';
    }

    // Map based on FieldType
    const componentMap: Record<FieldType, SPFormComponentType> = {
      'string': 'SPTextField',
      'number': 'SPNumberField',
      'boolean': 'SPBooleanField',
      'Date': 'SPDateField',
      'string[]': 'SPTextField',
      'number[]': 'SPNumberField',
      'User': 'SPUserField',
      'User[]': 'SPUserField',
      'Lookup': 'SPLookupField',
      'Lookup[]': 'SPLookupField',
      'Taxonomy': 'SPTaxonomyField',
      'Taxonomy[]': 'SPTaxonomyField',
      'Url': 'SPUrlField',
      'Choice': 'SPChoiceField',
      'MultiChoice': 'SPChoiceField',
      'object': 'SPTextField',
      'unknown': 'SPTextField',
    };

    return componentMap[type] || 'SPTextField';
  }

  /**
   * Add type-specific default configurations
   */
  private static addTypeSpecificDefaults(config: FieldConfiguration): FieldConfiguration {
    const { type, name, componentType } = config;
    const lowerName = name.toLowerCase();

    // String field defaults
    if (componentType === 'SPTextField') {
      config.maxLength = 255;

      // Email detection
      if (lowerName.includes('email')) {
        config.isEmail = true;
        config.maxLength = 100;
      }

      // URL detection
      if (lowerName.includes('url') || lowerName.includes('link')) {
        config.isUrl = true;
      }

      // Multiline detection
      if (
        lowerName.includes('description') ||
        lowerName.includes('notes') ||
        lowerName.includes('comment') ||
        lowerName.includes('message') ||
        lowerName.includes('bio')
      ) {
        config.isMultiline = true;
        config.rows = 4;
        config.maxLength = 500;
        config.showCharacterCount = true;
      }

      // Name/title fields
      if (lowerName.includes('name') || lowerName.includes('title')) {
        config.minLength = 2;
        config.maxLength = 100;
      }
    }

    // Number field defaults
    if (componentType === 'SPNumberField') {
      config.step = 1;

      // Age detection
      if (lowerName.includes('age')) {
        config.min = 0;
        config.max = 120;
        config.isInteger = true;
      }

      // Price/cost detection
      if (lowerName.includes('price') || lowerName.includes('cost') || lowerName.includes('amount')) {
        config.min = 0;
        config.decimals = 2;
      }

      // Quantity detection
      if (lowerName.includes('quantity') || lowerName.includes('count')) {
        config.min = 0;
        config.isInteger = true;
      }

      // Percentage detection
      if (lowerName.includes('percent') || lowerName.includes('rate')) {
        config.min = 0;
        config.max = 100;
        config.decimals = 2;
      }
    }

    // Boolean field defaults
    if (componentType === 'SPBooleanField') {
      // Active/enabled detection
      if (lowerName.includes('active') || lowerName.includes('enabled')) {
        config.displayType = 'toggle';
        config.checkedText = 'Active';
        config.uncheckedText = 'Inactive';
      } else {
        config.displayType = 'checkbox';
      }
    }

    // Date field defaults
    if (componentType === 'SPDateField') {
      // Time detection
      if (
        lowerName.includes('time') ||
        lowerName.includes('datetime') ||
        lowerName.includes('schedule')
      ) {
        config.includeTime = true;
      }

      // Due date/deadline detection
      if (lowerName.includes('due') || lowerName.includes('deadline') || lowerName.includes('end')) {
        config.minDate = new Date().toISOString();
      }
    }

    // User field defaults
    if (componentType === 'SPUserField') {
      config.allowMultiple = type === 'User[]';
    }

    // Lookup field defaults
    if (componentType === 'SPLookupField') {
      config.allowMultiple = type === 'Lookup[]';
    }

    // Taxonomy field defaults
    if (componentType === 'SPTaxonomyField') {
      config.allowMultiple = type === 'Taxonomy[]';
    }

    // Choice field defaults
    if (componentType === 'SPChoiceField') {
      config.choices = config.enumValues || [];
      config.allowMultiple = type === 'MultiChoice';
      config.displayMode = config.allowMultiple ? 'checkboxes' : 'dropdown';
    }

    return config;
  }

  /**
   * Generate human-readable label from field name
   */
  private static generateLabel(fieldName: string): string {
    // Convert camelCase/PascalCase to Title Case
    const result = fieldName
      // Insert space before capital letters
      .replace(/([A-Z])/g, ' $1')
      // Capitalize first letter
      .replace(/^./, str => str.toUpperCase())
      // Trim extra spaces
      .trim();

    return result;
  }

  /**
   * Generate appropriate placeholder text
   */
  private static generatePlaceholder(fieldName: string, type: FieldType): string {
    const lowerName = fieldName.toLowerCase();

    // Email
    if (lowerName.includes('email')) {
      return 'you@example.com';
    }

    // URL
    if (lowerName.includes('url') || lowerName.includes('website')) {
      return 'https://example.com';
    }

    // Phone
    if (lowerName.includes('phone')) {
      return '(123) 456-7890';
    }

    // Name
    if (lowerName.includes('name')) {
      return `Enter ${this.generateLabel(fieldName).toLowerCase()}`;
    }

    // Generic by type
    const typeMap: Record<string, string> = {
      'string': `Enter ${fieldName}`,
      'number': `Enter ${fieldName}`,
      'Date': `Select ${fieldName}`,
      'Choice': `Select ${fieldName}`,
      'User': `Select ${fieldName}`,
      'Lookup': `Select ${fieldName}`,
      'Taxonomy': `Select ${fieldName}`,
    };

    return typeMap[type] || `Enter ${fieldName}`;
  }

  /**
   * Get validation summary for a field configuration
   */
  public static getValidationSummary(config: FieldConfiguration): string[] {
    const validations: string[] = [];

    if (!config.isOptional) {
      validations.push('Required');
    }

    if (config.minLength) {
      validations.push(`Min length: ${config.minLength}`);
    }

    if (config.maxLength) {
      validations.push(`Max length: ${config.maxLength}`);
    }

    if (config.min !== undefined) {
      validations.push(`Min: ${config.min}`);
    }

    if (config.max !== undefined) {
      validations.push(`Max: ${config.max}`);
    }

    if (config.isEmail) {
      validations.push('Email format');
    }

    if (config.isUrl) {
      validations.push('URL format');
    }

    if (config.isInteger) {
      validations.push('Integer only');
    }

    if (config.pattern) {
      validations.push('Custom pattern');
    }

    if (config.hasCustomRefinement) {
      validations.push('Custom refinement');
    }

    return validations;
  }
}
