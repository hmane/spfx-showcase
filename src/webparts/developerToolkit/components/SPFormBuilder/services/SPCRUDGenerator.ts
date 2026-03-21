import { IConfiguredField } from '../types/SPFormBuilderTypes';
import { SPInterfaceGenerator } from './SPInterfaceGenerator';

/**
 * Generates CRUD operations using SPContext and spfx-toolkit utilities
 */
export class SPCRUDGenerator {
  /**
   * Generate all CRUD operations
   */
  public static generate(
    listTitle: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const imports = this.generateImports(fields);
    const fieldMapping = SPInterfaceGenerator.generateFieldMapping(fields);
    const getById = this.generateGetById(listTitle, interfaceName, fields);
    const getAll = this.generateGetAll(listTitle, interfaceName, fields);
    const add = this.generateAdd(listTitle, interfaceName, fields);
    const update = this.generateUpdate(listTitle, interfaceName, fields);
    const deleteFunc = this.generateDelete(listTitle, interfaceName);

    return `${imports}

${fieldMapping}

${getById}

${getAll}

${add}

${update}

${deleteFunc}`;
  }

  /**
   * Generate import statements
   */
  private static generateImports(fields: IConfiguredField[]): string {
    const imports: string[] = [
      "import { SPContext } from 'spfx-toolkit/utilities/context';",
      "import { createSPExtractor, createSPUpdater } from 'spfx-toolkit/utilities/listItemHelper';"
    ];

    // Add spfx-toolkit type imports
    const spfxTypes = new Set<string>();
    fields.filter(f => f.isIncluded && f.spfxType).forEach(f => {
      spfxTypes.add(f.spfxType!);
    });

    if (spfxTypes.size > 0) {
      imports.push(`import { ${Array.from(spfxTypes).join(', ')} } from 'spfx-toolkit/types';`);
    }

    return imports.join('\n');
  }

  /**
   * Generate getById function
   */
  private static generateGetById(
    listTitle: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const viewXml = SPInterfaceGenerator.generateViewXml(fields);
    const extractorCalls = this.generateExtractorCalls(fields);

    return `/**
 * Get ${interfaceName} by ID
 * Uses RenderListDataAsStream to auto-expand lookups and user fields
 */
export async function get${interfaceName}ById(id: number): Promise<${interfaceName} | null> {
  try {
    const response = await SPContext.sp.web.lists
      .getByTitle('${listTitle}')
      .renderListDataAsStream({
        ViewXml: ${viewXml}
      });

    if (!response.Row || response.Row.length === 0) {
      return null;
    }

    const item = response.Row[0];
    const extractor = createSPExtractor(item);

    return {
${extractorCalls}
    };
  } catch (error) {
    console.error('Error fetching ${interfaceName}:', error);
    throw error;
  }
}`;
  }

  /**
   * Generate getAll function
   */
  private static generateGetAll(
    listTitle: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const viewXml = SPInterfaceGenerator.generateViewXmlForAll(fields);
    const extractorCalls = this.generateExtractorCalls(fields);

    return `/**
 * Get all ${interfaceName}s
 * Uses RenderListDataAsStream to auto-expand lookups and user fields
 */
export async function getAll${interfaceName}s(): Promise<${interfaceName}[]> {
  try {
    const response = await SPContext.sp.web.lists
      .getByTitle('${listTitle}')
      .renderListDataAsStream({
        ViewXml: ${viewXml}
      });

    if (!response.Row || response.Row.length === 0) {
      return [];
    }

    return response.Row.map((item: any) => {
      const extractor = createSPExtractor(item);
      return {
${extractorCalls}
      };
    });
  } catch (error) {
    console.error('Error fetching ${interfaceName}s:', error);
    throw error;
  }
}`;
  }

  /**
   * Generate add function
   */
  private static generateAdd(
    listTitle: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const updaterCalls = this.generateUpdaterCalls(fields, false);

    return `/**
 * Add new ${interfaceName}
 */
export async function add${interfaceName}(data: Partial<${interfaceName}>): Promise<number> {
  try {
    const updater = createSPUpdater();

${updaterCalls}

    const payload = updater.getUpdates();
    const result = await SPContext.sp.web.lists
      .getByTitle('${listTitle}')
      .items.add(payload);

    return result.data.Id;
  } catch (error) {
    console.error('Error adding ${interfaceName}:', error);
    throw error;
  }
}`;
  }

  /**
   * Generate update function
   */
  private static generateUpdate(
    listTitle: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const updaterCalls = this.generateUpdaterCalls(fields, true);

    return `/**
 * Update existing ${interfaceName}
 * Only updates changed fields (uses change detection)
 */
export async function update${interfaceName}(
  id: number,
  data: Partial<${interfaceName}>,
  originalData?: ${interfaceName}
): Promise<void> {
  try {
    const updater = createSPUpdater();

${updaterCalls}

    if (!updater.hasChanges()) {
      console.log('No changes detected for ${interfaceName}');
      return;
    }

    const payload = updater.getUpdates();
    await SPContext.sp.web.lists
      .getByTitle('${listTitle}')
      .items.getById(id)
      .update(payload);

    console.log('Changed fields:', updater.getChangedFields());
  } catch (error) {
    console.error('Error updating ${interfaceName}:', error);
    throw error;
  }
}`;
  }

  /**
   * Generate delete function
   */
  private static generateDelete(listTitle: string, interfaceName: string): string {
    return `/**
 * Delete ${interfaceName}
 */
export async function delete${interfaceName}(id: number): Promise<void> {
  try {
    await SPContext.sp.web.lists
      .getByTitle('${listTitle}')
      .items.getById(id)
      .delete();
  } catch (error) {
    console.error('Error deleting ${interfaceName}:', error);
    throw error;
  }
}`;
  }

  /**
   * Generate extractor calls for building object from SP item
   */
  private static generateExtractorCalls(fields: IConfiguredField[]): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const calls = includedFields.map(field => {
      const method = field.extractorMethod;
      const defaultValue = this.getDefaultValueString(field);

      return `      ${field.camelCaseName}: extractor.${method}('${field.InternalName}'${defaultValue})`;
    });

    return calls.join(',\n');
  }

  /**
   * Generate updater calls for building update payload
   */
  private static generateUpdaterCalls(fields: IConfiguredField[], includeOriginal: boolean): string {
    const includedFields = fields.filter(f => f.isIncluded);
    const calls = includedFields.map(field => {
      const spFieldName = this.getUpdateFieldName(field);
      const value = this.getUpdateValue(field);
      const original = includeOriginal ? `, originalData?.${field.camelCaseName}` : '';

      return `    updater.set('${spFieldName}', ${value}${original});`;
    });

    return calls.join('\n');
  }

  /**
   * Get SharePoint field name for updates
   */
  private static getUpdateFieldName(field: IConfiguredField): string {
    // Lookup and User fields need Id suffix
    if (field.TypeAsString === 'Lookup' || field.TypeAsString === 'User') {
      return `${field.InternalName}Id`;
    }
    if (field.TypeAsString === 'LookupMulti' || field.TypeAsString === 'UserMulti') {
      return `${field.InternalName}Id`;
    }
    if (field.TypeAsString === 'TaxonomyFieldType' || field.TypeAsString === 'TaxonomyFieldTypeMulti') {
      return `${field.InternalName}Id`;
    }
    return field.InternalName;
  }

  /**
   * Get value expression for update
   */
  private static getUpdateValue(field: IConfiguredField): string {
    const camelName = field.camelCaseName;

    // Handle complex types
    if (field.TypeAsString === 'Lookup') {
      return `data.${camelName}?.id`;
    }
    if (field.TypeAsString === 'LookupMulti') {
      return `data.${camelName}?.map(l => l.id)`;
    }
    if (field.TypeAsString === 'User') {
      return `data.${camelName}?.id`;
    }
    if (field.TypeAsString === 'UserMulti') {
      return `data.${camelName}?.map(u => u.id)`;
    }
    if (field.TypeAsString === 'TaxonomyFieldType') {
      return `data.${camelName}?.wssId`;
    }
    if (field.TypeAsString === 'TaxonomyFieldTypeMulti') {
      return `data.${camelName}?.map(t => t.wssId)`;
    }
    if (field.TypeAsString === 'URL') {
      return `data.${camelName}`;
    }

    return `data.${camelName}`;
  }

  /**
   * Get default value string for extractor
   */
  private static getDefaultValueString(field: IConfiguredField): string {
    if (field.defaultValue === null || field.defaultValue === undefined) {
      return '';
    }

    if (typeof field.defaultValue === 'string') {
      return `, '${field.defaultValue}'`;
    }

    if (typeof field.defaultValue === 'number') {
      return `, ${field.defaultValue}`;
    }

    if (typeof field.defaultValue === 'boolean') {
      return `, ${field.defaultValue}`;
    }

    if (Array.isArray(field.defaultValue)) {
      return '';
    }

    return '';
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
