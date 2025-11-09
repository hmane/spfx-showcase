import { ParsedField, ParsedInterface, FieldType } from '../types/FormGeneratorTypes';

/**
 * Simple TypeScript parser for basic type/interface definitions
 * Handles common patterns without full AST parsing
 */
export class TypeScriptParser {
  /**
   * Parse TypeScript interface or type definition
   */
  public static parse(code: string): ParsedInterface | null {
    try {
      const cleaned = this.cleanCode(code);

      // Extract interface/type name
      const nameMatch = cleaned.match(/(?:interface|type)\s+(\w+)/);
      if (!nameMatch) {
        throw new Error('Could not find interface or type name');
      }

      const name = nameMatch[1];

      // Extract fields
      const fields = this.extractFields(cleaned);

      return {
        name,
        fields,
        rawCode: code,
      };
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  }

  /**
   * Clean and normalize code
   */
  private static cleanCode(code: string): string {
    // Remove comments
    let cleaned = code.replace(/\/\*[\s\S]*?\*\//g, ''); // Multi-line comments
    cleaned = cleaned.replace(/\/\/.*/g, ''); // Single-line comments

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * Extract fields from interface/type body
   */
  private static extractFields(code: string): ParsedField[] {
    const fields: ParsedField[] = [];

    // Find the body between { }
    const bodyMatch = code.match(/\{([^}]+)\}/);
    if (!bodyMatch) {
      return fields;
    }

    const body = bodyMatch[1];

    // Split by semicolon or comma
    const fieldStrings = body.split(/[;,]/).filter(f => f.trim());

    for (const fieldStr of fieldStrings) {
      const field = this.parseField(fieldStr.trim());
      if (field) {
        fields.push(field);
      }
    }

    return fields;
  }

  /**
   * Parse individual field
   * Examples:
   *   name: string
   *   email?: string
   *   age: number
   *   tags: string[]
   *   status: 'Active' | 'Inactive'
   */
  private static parseField(fieldStr: string): ParsedField | null {
    // Match: fieldName?: type
    const match = fieldStr.match(/^(\w+)(\?)?:\s*(.+)$/);
    if (!match) {
      return null;
    }

    const [, name, optional, typeStr] = match;
    const isOptional = optional === '?';

    // Determine field type
    const { type, isArray, enumValues } = this.parseType(typeStr);

    return {
      name,
      type,
      isOptional,
      isArray,
      enumValues,
    };
  }

  /**
   * Parse type string and determine FieldType
   */
  private static parseType(typeStr: string): {
    type: FieldType;
    isArray: boolean;
    enumValues?: string[]
  } {
    const trimmed = typeStr.trim();

    // Check for array type
    const isArray = trimmed.endsWith('[]');
    const baseType = isArray ? trimmed.slice(0, -2) : trimmed;

    // Check for union types (enum)
    if (baseType.includes('|')) {
      const enumValues = baseType
        .split('|')
        .map(v => v.trim().replace(/['"]/g, ''))
        .filter(v => v);

      return {
        type: isArray ? 'MultiChoice' : 'Choice',
        isArray,
        enumValues,
      };
    }

    // Map TypeScript types to FieldType
    const typeMap: Record<string, FieldType> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'Date': 'Date',
      'User': 'User',
      'Lookup': 'Lookup',
      'Taxonomy': 'Taxonomy',
      'Url': 'Url',
    };

    const mappedType = typeMap[baseType] || 'string';

    // Handle array versions
    if (isArray) {
      if (mappedType === 'User') return { type: 'User[]', isArray: true };
      if (mappedType === 'Lookup') return { type: 'Lookup[]', isArray: true };
      if (mappedType === 'Taxonomy') return { type: 'Taxonomy[]', isArray: true };
      if (mappedType === 'string') return { type: 'string[]', isArray: true };
      if (mappedType === 'number') return { type: 'number[]', isArray: true };
    }

    return { type: mappedType, isArray: false };
  }

  /**
   * Validate TypeScript code syntax (basic check)
   */
  public static validate(code: string): { valid: boolean; error?: string } {
    try {
      const trimmed = code.trim();

      if (!trimmed) {
        return { valid: false, error: 'Code cannot be empty' };
      }

      // Check for interface or type keyword
      if (!trimmed.match(/(?:interface|type)\s+\w+/)) {
        return { valid: false, error: 'Must start with "interface" or "type"' };
      }

      // Check for balanced braces
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;

      if (openBraces !== closeBraces) {
        return { valid: false, error: 'Unbalanced braces' };
      }

      // Try to parse
      const result = this.parse(trimmed);
      if (!result) {
        return { valid: false, error: 'Could not parse the code' };
      }

      if (result.fields.length === 0) {
        return { valid: false, error: 'No fields found' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message || 'Parse error' };
    }
  }
}
