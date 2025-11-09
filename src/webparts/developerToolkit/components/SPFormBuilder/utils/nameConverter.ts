/**
 * Utility for converting between naming conventions
 * Handles SharePoint PascalCase ↔ TypeScript camelCase
 */
export class NameConverter {
  /**
   * Convert PascalCase to camelCase
   * FirstName → firstName
   * Department → department
   * ID → id
   */
  public static toCamelCase(pascalCase: string): string {
    if (!pascalCase) return '';

    // Handle special cases
    if (pascalCase === 'ID') return 'id';
    if (pascalCase === 'GUID') return 'guid';
    if (pascalCase === 'Title') return 'title';

    // Convert first letter to lowercase
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  /**
   * Convert camelCase to PascalCase
   * firstName → FirstName
   * department → Department
   * id → ID
   */
  public static toPascalCase(camelCase: string): string {
    if (!camelCase) return '';

    // Handle special cases
    if (camelCase === 'id') return 'ID';
    if (camelCase === 'guid') return 'GUID';

    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  /**
   * Generate display label from internal name
   * FirstName → First Name
   * DueDate → Due Date
   * ID → ID
   */
  public static toDisplayLabel(internalName: string): string {
    if (internalName === 'ID') return 'ID';
    if (internalName === 'GUID') return 'GUID';

    return internalName
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, str => str.toUpperCase());
  }

  /**
   * Generate enum name from field name
   * Status → StatusEnum
   * Department → DepartmentEnum
   */
  public static toEnumName(fieldName: string): string {
    return `${fieldName}Enum`;
  }

  /**
   * Sanitize enum value for TypeScript
   * "In Progress" → "InProgress"
   * "N/A" → "NA"
   */
  public static toEnumValue(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^([0-9])/, '_$1'); // Prefix numbers with _
  }
}
