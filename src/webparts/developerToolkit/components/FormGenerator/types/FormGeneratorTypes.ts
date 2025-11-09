// Type definitions for Form Generator

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'Date'
  | 'string[]'
  | 'number[]'
  | 'User'
  | 'User[]'
  | 'Lookup'
  | 'Lookup[]'
  | 'Taxonomy'
  | 'Taxonomy[]'
  | 'Url'
  | 'Choice'
  | 'MultiChoice'
  | 'object'
  | 'unknown';

export type SPFormComponentType =
  | 'SPTextField'
  | 'SPNumberField'
  | 'SPBooleanField'
  | 'SPDateField'
  | 'SPUserField'
  | 'SPLookupField'
  | 'SPTaxonomyField'
  | 'SPUrlField'
  | 'SPChoiceField';

export type RefinementType = 'refine' | 'transform' | 'preprocess' | 'superRefine';

export interface ParsedField {
  name: string;
  type: FieldType;
  isOptional: boolean;
  isArray: boolean;
  enumValues?: string[]; // For union types like 'Sales' | 'Support'
  description?: string;
}

export interface FieldConfiguration extends ParsedField {
  // Display
  label: string;
  placeholder: string;
  description: string;

  // SPForm component
  componentType: SPFormComponentType;

  // Validation - String
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  isEmail?: boolean;
  isUrl?: boolean;
  isMultiline?: boolean;
  rows?: number;
  showCharacterCount?: boolean;

  // Validation - Number
  min?: number;
  max?: number;
  step?: number;
  isInteger?: boolean;
  isPositive?: boolean;
  decimals?: number;

  // Validation - Date
  includeTime?: boolean;
  minDate?: string;
  maxDate?: string;

  // Validation - Array
  minItems?: number;
  maxItems?: number;

  // Validation - Boolean
  displayType?: 'checkbox' | 'toggle';
  checkedText?: string;
  uncheckedText?: string;

  // Validation - Choice
  choices?: string[];
  allowMultiple?: boolean;
  displayMode?: 'dropdown' | 'radio' | 'checkboxes';

  // SharePoint-specific
  listId?: string;
  termSetId?: string;

  // Custom refinement
  hasCustomRefinement?: boolean;
  refinementType?: RefinementType;
  refinementMessage?: string;
  refinementCode?: string;
}

export interface FormConfiguration {
  name: string;
  description: string;
  showErrorSummary: boolean;
  errorSummaryPosition: 'top' | 'bottom' | 'sticky';
  generateDefaultValues: boolean;
  submitHandlerType: 'console' | 'api' | 'custom';
  validationMode: 'onSubmit' | 'onChange' | 'onBlur';
  includeLoadingStates: boolean;
  includeScrollToError: boolean;
  includeAutoSave: boolean;
  layout: 'stack' | 'grid';
}

export interface ParsedInterface {
  name: string;
  fields: ParsedField[];
  rawCode: string;
}

export interface GeneratedCode {
  zodSchema: string;
  formComponent: string;
  completeExample: string;
}

export type OutputTab = 'schema' | 'form' | 'complete' | 'preview';

export interface SampleTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
  category: string;
}
