// src/webparts/showcase/components/CamlQueryBuilder/types/CamlTypes.ts

export type CAMLOperator =
  | 'Eq'
  | 'Neq'
  | 'Gt'
  | 'Lt'
  | 'Geq'
  | 'Leq'
  | 'Contains'
  | 'BeginsWith'
  | 'IsNull'
  | 'IsNotNull'
  | 'In'
  | 'Includes'
  | 'NotIncludes'
  | 'Membership';

export type LogicalOperator = 'AND' | 'OR';

export type FieldType =
  | 'Text'
  | 'Note'
  | 'Number'
  | 'Currency'
  | 'DateTime'
  | 'Boolean'
  | 'User'
  | 'Lookup'
  | 'Choice'
  | 'MultiChoice'
  | 'URL'
  | 'Guid'
  | 'Integer'
  | 'Counter'
  | 'TaxonomyFieldType'
  | 'TaxonomyFieldTypeMulti';

export type CAMLValueType =
  | 'Text'
  | 'Number'
  | 'Integer'
  | 'Currency'
  | 'DateTime'
  | 'Boolean'
  | 'User'
  | 'Lookup'
  | 'Choice'
  | 'Guid';

export type ExportFormat = 'caml' | 'pnpjs' | 'pnppowershell' | 'rest';

export interface IFieldInfo {
  internalName: string;
  title: string;
  typeAsString: FieldType;
  required: boolean;
  choices?: string[];
  lookupList?: string;
  lookupField?: string;
}

export interface IListInfo {
  id: string;
  title: string;
  itemCount: number;
  baseTemplate: number;
}

export interface IViewInfo {
  id: string;
  title: string;
  viewQuery: string;
  viewFields: string[];
}

export interface ICondition {
  id: string;
  fieldInternalName: string;
  fieldType: FieldType;
  operator: CAMLOperator;
  value: any;
  valueType: CAMLValueType;
  // Optional attributes
  useLookupId?: boolean;
  includeTimeValue?: boolean;
  useUserID?: boolean;
  offsetDays?: number;
}

export interface IConditionGroup {
  id: string;
  operator: LogicalOperator;
  conditions: ICondition[];
  nestedGroups: IConditionGroup[];
}

export interface IOrderByField {
  fieldInternalName: string;
  ascending: boolean;
}

export interface ICAMLQuery {
  where?: IConditionGroup;
  orderBy: IOrderByField[];
  viewFields: string[];
  rowLimit: number | null;
}

export interface ICAMLBuilderState {
  // Connection
  siteUrl: string;
  selectedListId: string;
  selectedListTitle: string;
  lists: IListInfo[];
  fields: IFieldInfo[];
  views: IViewInfo[];

  // Query building
  rootGroup: IConditionGroup;
  orderBy: IOrderByField[];
  viewFields: string[];
  rowLimit: number;

  // Generated output
  generatedCAML: string;
  generatedCode: string;
  exportFormat: ExportFormat;

  // UI state
  isLoadingLists: boolean;
  isLoadingFields: boolean;
  isLoadingViews: boolean;
  validationErrors: string[];
  showAdvancedOptions: boolean;
  showTemplates: boolean;
}

export interface IQueryTemplate {
  id: string;
  name: string;
  description: string;
  category: 'DateTime' | 'User' | 'Status' | 'Complex' | 'Other';
  query: IConditionGroup;
  orderBy?: IOrderByField[];
  rowLimit?: number;
}

export interface IOperatorInfo {
  value: CAMLOperator;
  label: string;
  description: string;
  requiresValue: boolean;
}

export interface ISpecialValue {
  label: string;
  value: string;
  description: string;
  type: 'token' | 'function';
}
