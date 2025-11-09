/**
 * Type definitions for SPForm Builder
 */

/**
 * SharePoint field metadata
 */
export interface ISPField {
  InternalName: string;
  Title: string;
  TypeAsString: string;
  Required: boolean;
  ReadOnlyField?: boolean;
  Hidden?: boolean;
  MaxLength?: number | null;
  Choices?: string[];
  LookupList?: string | null;
  LookupField?: string | null;
  TermSetId?: string | null;
  Description?: string | null;
  DefaultValue?: string | null;
  Min?: number | null;
  Max?: number | null;
}

/**
 * Validation overrides for field configuration
 */
export interface IFieldValidationOverrides {
  overrideRequired?: boolean;
  isRequiredOverride?: boolean;
  overrideMinLength?: boolean;
  minLengthOverride?: number;
  overrideMaxLength?: boolean;
  maxLengthOverride?: number;
  overrideMin?: boolean;
  minOverride?: number;
  overrideMax?: boolean;
  maxOverride?: number;
  overrideMinDate?: boolean;
  minDateOverride?: Date;
  overrideMaxDate?: boolean;
  maxDateOverride?: Date;
}

/**
 * Configured field for form generation
 */
export interface IConfiguredField extends ISPField {
  // Display configuration
  isIncluded: boolean;
  order: number;
  label: string;

  // Generated names
  camelCaseName: string;
  pascalCaseName: string;

  // Type information
  tsType: string;
  spfxType?: string;
  zodSchema: string;
  extractorMethod: string;

  // Component information
  editComponent: string;
  editProps?: any;
  viewRenderer: string;

  // Default value
  defaultValue: any;

  // Enum generation
  generateEnum?: boolean;
  enumName?: string;

  // Validation overrides
  validationOverrides?: IFieldValidationOverrides;
}

/**
 * SharePoint list metadata
 */
export interface ISPList {
  Id: string;
  Title: string;
  ItemCount: number;
  BaseTemplate: number;
  BaseType: number;
}

/**
 * Output tab types
 */
export type OutputTab =
  | 'preview'
  | 'interface'
  | 'schema'
  | 'form'
  | 'crud'
  | 'store'
  | 'complete';

/**
 * Form mode
 */
export type FormMode = 'view' | 'new' | 'edit';

/**
 * Code generation options
 */
export interface ICodeGenerationOptions {
  includeInterface: boolean;
  includeEnums: boolean;
  includeZodSchema: boolean;
  includeFormComponent: boolean;
  includeCRUD: boolean;
  includeStore: boolean;
  includeViewComponent: boolean;

  // Form options
  formModes: FormMode[];
  useFormErrorSummary: boolean;
  useScrollToError: boolean;

  // Store options
  useZustand: boolean;
  storeIncludesMode: boolean;

  // CRUD options
  useSPContext: boolean;
  useRenderListDataAsStream: boolean;
  includeChangeDetection: boolean;

  // Code style
  useSingleQuotes: boolean;
  indentSize: number;
}

/**
 * Generation result
 */
export interface IGenerationResult {
  interface: string;
  enums: string;
  zodSchema: string;
  formComponent: string;
  crud: string;
  store: string;
  viewComponent: string;
  complete: string;

  // Metadata
  imports: Set<string>;
  spfxTypeImports: Set<string>;
}

/**
 * Field drag state
 */
export interface IFieldDragState {
  isDragging: boolean;
  draggedIndex: number | null;
  dragOverIndex: number | null;
}
