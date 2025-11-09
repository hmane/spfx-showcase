import { IConfiguredField } from '../types/SPFormBuilderTypes';

/**
 * Generates Zustand store with mode management and CRUD operations
 */
export class SPStoreGenerator {
  /**
   * Generate complete Zustand store
   */
  public static generate(
    listTitle: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const imports = this.generateImports(interfaceName);
    const storeInterface = this.generateStoreInterface(interfaceName);
    const storeImplementation = this.generateStoreImplementation(listTitle, interfaceName, fields);

    return `${imports}

${storeInterface}

${storeImplementation}`;
  }

  /**
   * Generate import statements
   */
  private static generateImports(interfaceName: string): string {
    return `import { create } from 'zustand';
import {
  get${interfaceName}ById,
  add${interfaceName},
  update${interfaceName},
  delete${interfaceName}
} from './${interfaceName.toLowerCase()}Operations';
import { ${interfaceName} } from './${interfaceName.toLowerCase()}Types';`;
  }

  /**
   * Generate store interface
   */
  private static generateStoreInterface(interfaceName: string): string {
    return `type FormMode = 'view' | 'new' | 'edit';

interface ${interfaceName}Store {
  // State
  mode: FormMode;
  itemId?: number;
  data: ${interfaceName} | null;
  originalData: ${interfaceName} | null;
  loading: boolean;
  error: string | null;

  // Actions
  setMode: (mode: FormMode, itemId?: number) => void;
  loadItem: (id: number) => Promise<void>;
  saveItem: (data: ${interfaceName}) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  reset: () => void;
}`;
  }

  /**
   * Generate store implementation
   */
  private static generateStoreImplementation(
    listTitle: string,
    interfaceName: string,
    fields: IConfiguredField[]
  ): string {
    const defaultValues = this.generateDefaultValues(fields);

    return `export const use${interfaceName}Store = create<${interfaceName}Store>((set, get) => ({
  // Initial state
  mode: 'view',
  itemId: undefined,
  data: null,
  originalData: null,
  loading: false,
  error: null,

  // Set mode (view/new/edit)
  setMode: (mode, itemId) => {
    set({ mode, itemId, error: null });

    if (mode === 'edit' && itemId) {
      get().loadItem(itemId);
    } else if (mode === 'new') {
      set({
        data: ${defaultValues},
        originalData: null
      });
    }
  },

  // Load item by ID
  loadItem: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await get${interfaceName}ById(id);
      if (data) {
        set({
          data,
          originalData: data,
          itemId: id,
          loading: false
        });
      } else {
        set({
          error: '${interfaceName} not found',
          loading: false
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load ${interfaceName.toLowerCase()}',
        loading: false
      });
    }
  },

  // Save item (add or update)
  saveItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const currentItemId = get().itemId;
      const originalData = get().originalData;

      if (currentItemId) {
        // Update existing item
        await update${interfaceName}(currentItemId, data, originalData || undefined);
      } else {
        // Add new item
        const newId = await add${interfaceName}(data);
        set({ itemId: newId });
      }

      // Reload item to get latest data
      await get().loadItem(get().itemId!);

      // Switch to view mode
      set({ mode: 'view', loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to save ${interfaceName.toLowerCase()}',
        loading: false
      });
    }
  },

  // Delete item
  deleteItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await delete${interfaceName}(id);
      set({
        data: null,
        originalData: null,
        itemId: undefined,
        mode: 'view',
        loading: false
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete ${interfaceName.toLowerCase()}',
        loading: false
      });
    }
  },

  // Reset store to initial state
  reset: () => set({
    mode: 'view',
    itemId: undefined,
    data: null,
    originalData: null,
    loading: false,
    error: null
  })
}));`;
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
