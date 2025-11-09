import { IConfiguredField } from '../types/SPFormBuilderTypes';
import { NameConverter } from '../utils/nameConverter';

/**
 * Generates TypeScript interfaces and enums from SharePoint field configurations
 */
export class SPInterfaceGenerator {
  /**
   * Generate complete TypeScript interface code with enums
   */
  public static generate(
    interfaceName: string,
    fields: IConfiguredField[]
  ): { interface: string; enums: string; imports: Set<string> } {
    const imports = new Set<string>();
    const enums = this.generateEnums(fields, imports);
    const interfaceCode = this.generateInterface(interfaceName, fields, imports);

    return {
      interface: interfaceCode,
      enums,
      imports
    };
  }

  /**
   * Generate imports based on field types
   */
  private static generateImports(imports: Set<string>): string {
    if (imports.size === 0) return '';

    const importLines: string[] = [];

    // Group imports by source
    const spfxTypes = Array.from(imports).filter(i =>
      ['IPrincipal', 'SPLookup', 'SPTaxonomy', 'SPUrl', 'SPLocation', 'SPImage'].includes(i)
    );

    if (spfxTypes.length > 0) {
      importLines.push(
        `import { ${spfxTypes.join(', ')} } from 'spfx-toolkit/lib/types';`
      );
    }

    return importLines.join('\n');
  }

  /**
   * Generate enum types for Choice fields
   */
  private static generateEnums(fields: IConfiguredField[], imports: Set<string>): string {
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
   * Generate TypeScript interface
   */
  private static generateInterface(
    interfaceName: string,
    fields: IConfiguredField[],
    imports: Set<string>
  ): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const properties: string[] = [];

    includedFields.forEach(field => {
      const property = this.generateProperty(field, imports);
      properties.push(property);
    });

    const importsCode = this.generateImports(imports);
    const interfaceCode = `export interface ${interfaceName} {\n${properties.join('\n')}\n}`;

    return importsCode ? `${importsCode}\n\n${interfaceCode}` : interfaceCode;
  }

  /**
   * Generate single property definition
   */
  private static generateProperty(field: IConfiguredField, imports: Set<string>): string {
    const { camelCaseName } = field;
    let tsType = field.tsType;

    // Add spfx-toolkit type to imports if needed
    if (field.spfxType) {
      imports.add(field.spfxType);
    }

    // Handle enum types
    if (field.generateEnum) {
      tsType = NameConverter.toEnumName(field.pascalCaseName);
      if (field.TypeAsString === 'MultiChoice') {
        tsType += '[]';
      }
    }

    // Check if field is required (with override support)
    const isRequired = field.validationOverrides?.overrideRequired
      ? field.validationOverrides.isRequiredOverride
      : field.Required;

    // Add optional marker if not required
    const optional = !isRequired ? '?' : '';

    // Add JSDoc comment with field metadata
    const comment = this.generatePropertyComment(field);

    return `${comment}\n  ${camelCaseName}${optional}: ${tsType};`;
  }

  /**
   * Generate JSDoc comment for property
   */
  private static generatePropertyComment(field: IConfiguredField): string {
    const lines: string[] = [];
    const overrides = field.validationOverrides;

    lines.push('  /**');
    lines.push(`   * ${field.Title}`);

    if (field.Description) {
      lines.push(`   * ${field.Description}`);
    }

    const metadata: string[] = [];
    metadata.push(`SharePoint field: ${field.InternalName}`);
    metadata.push(`Type: ${field.TypeAsString}`);

    // Check if field is required (with override support)
    const isRequired = overrides?.overrideRequired
      ? overrides.isRequiredOverride
      : field.Required;

    if (isRequired) {
      metadata.push(overrides?.overrideRequired ? 'Required (overridden)' : 'Required');
    }

    // Max length (with override support)
    const maxLength = overrides?.overrideMaxLength
      ? overrides.maxLengthOverride
      : field.MaxLength;

    if (maxLength) {
      metadata.push(overrides?.overrideMaxLength ? `Max length: ${maxLength} (overridden)` : `Max length: ${maxLength}`);
    }

    // Min length (with override support)
    if (overrides?.overrideMinLength && overrides.minLengthOverride) {
      metadata.push(`Min length: ${overrides.minLengthOverride} (overridden)`);
    }

    // Min/Max values (with override support)
    const minValue = overrides?.overrideMin ? overrides.minOverride : field.Min;
    const maxValue = overrides?.overrideMax ? overrides.maxOverride : field.Max;

    if (minValue !== undefined || maxValue !== undefined) {
      const range = [];
      if (minValue !== undefined) {
        range.push(`Min: ${minValue}${overrides?.overrideMin ? ' (overridden)' : ''}`);
      }
      if (maxValue !== undefined) {
        range.push(`Max: ${maxValue}${overrides?.overrideMax ? ' (overridden)' : ''}`);
      }
      metadata.push(range.join(', '));
    }

    lines.push(`   * @metadata ${metadata.join(' | ')}`);
    lines.push('   */');

    return lines.join('\n');
  }

  /**
   * Generate field mapping object (for use in code generation)
   */
  public static generateFieldMapping(fields: IConfiguredField[]): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const mappings: string[] = [];

    includedFields.forEach(field => {
      mappings.push(`  ${field.camelCaseName}: '${field.InternalName}'`);
    });

    return `const fieldMapping = {\n${mappings.join(',\n')}\n};`;
  }

  /**
   * Generate ViewXml for RenderListDataAsStream
   */
  public static generateViewXml(fields: IConfiguredField[]): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const fieldRefs = includedFields.map(f => `      <FieldRef Name='${f.InternalName}'/>`).join('\n');

    return `\`<View>
    <Query>
      <Where><Eq><FieldRef Name='ID'/><Value Type='Counter'>\${id}</Value></Eq></Where>
    </Query>
    <ViewFields>
${fieldRefs}
    </ViewFields>
    <RowLimit>1</RowLimit>
  </View>\``;
  }

  /**
   * Generate ViewXml for getting all items
   */
  public static generateViewXmlForAll(fields: IConfiguredField[]): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const fieldRefs = includedFields.map(f => `      <FieldRef Name='${f.InternalName}'/>`).join('\n');

    return `\`<View>
    <ViewFields>
${fieldRefs}
    </ViewFields>
    <RowLimit>100</RowLimit>
  </View>\``;
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
