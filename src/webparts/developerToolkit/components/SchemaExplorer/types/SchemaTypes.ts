// Schema Explorer Types

/**
 * Schema categories available for export
 */
export type SchemaCategory =
  | 'siteSettings'
  | 'siteColumns'
  | 'contentTypes'
  | 'lists'
  | 'security'
  | 'navigation'
  | 'branding'
  | 'taxonomy';

/**
 * Export format options
 */
export type ExportFormat =
  | 'pnp-json'
  | 'pnp-xml'
  | 'site-script'
  | 'pnp-powershell'
  | 'cli-m365'
  | 'typescript';

/**
 * Category metadata
 */
export interface ICategoryInfo {
  id: SchemaCategory;
  title: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Base schema item interface
 */
export interface ISchemaItem {
  id: string;
  title: string;
  internalName?: string;
  description?: string;
  category: SchemaCategory;
  selected: boolean;
  dependencies?: string[];
  usedBy?: string[];
}

/**
 * Site Column schema
 */
export interface ISiteColumnSchema extends ISchemaItem {
  category: 'siteColumns';
  fieldType: string;
  group: string;
  required: boolean;
  hidden: boolean;
  indexed: boolean;
  schemaXml?: string;
  // Choice field specific
  choices?: string[];
  // Lookup field specific
  lookupList?: string;
  lookupField?: string;
  // Calculated field
  formula?: string;
  // Taxonomy field
  termSetId?: string;
}

/**
 * Content Type schema
 */
export interface IContentTypeSchema extends ISchemaItem {
  category: 'contentTypes';
  contentTypeId: string;
  group: string;
  parentId?: string;
  parentName?: string;
  hidden: boolean;
  sealed: boolean;
  readOnly: boolean;
  fieldLinks: IFieldLink[];
}

export interface IFieldLink {
  id: string;
  name: string;
  required: boolean;
  hidden: boolean;
}

/**
 * List/Library schema
 */
export interface IListSchema extends ISchemaItem {
  category: 'lists';
  listId: string;
  baseTemplate: number;
  baseType: number;
  templateFeatureId?: string;
  itemCount: number;
  hidden: boolean;
  enableVersioning: boolean;
  enableMinorVersions: boolean;
  enableModeration: boolean;
  forceCheckout: boolean;
  enableAttachments: boolean;
  enableFolderCreation: boolean;
  contentTypesEnabled: boolean;
  fields: IListFieldSchema[];
  views: IViewSchema[];
  contentTypes: string[];
  // Validation
  validationFormula?: string;
  validationMessage?: string;
}

export interface IListFieldSchema {
  id: string;
  internalName: string;
  title: string;
  fieldType: string;
  required: boolean;
  hidden: boolean;
  readOnly: boolean;
  indexed: boolean;
  schemaXml?: string;
  // Client-side rendering
  clientSideComponentId?: string;
  clientSideComponentProperties?: string;
  customFormatter?: string;
}

export interface IViewSchema {
  id: string;
  title: string;
  personalView: boolean;
  defaultView: boolean;
  viewQuery?: string;
  viewFields: string[];
  rowLimit: number;
  // View type and formatting
  viewType?: string;
  paged?: boolean;
  scope?: number;
  // JSLink for classic rendering
  jsLink?: string;
  // Modern column/view formatting
  customFormatter?: string;
  viewData?: string;
  // Aggregations
  aggregations?: string;
  aggregationsStatus?: string;
}

/**
 * Security schema - SharePoint Group
 */
export interface IGroupSchema extends ISchemaItem {
  category: 'security';
  groupId: number;
  groupType: 'owners' | 'members' | 'visitors' | 'custom';
  ownerTitle?: string;
  allowMembersEditMembership: boolean;
  allowRequestToJoinLeave: boolean;
  autoAcceptRequestToJoinLeave: boolean;
  onlyAllowMembersViewMembership: boolean;
  memberCount: number;
}

/**
 * Permission Level schema
 */
export interface IPermissionLevelSchema extends ISchemaItem {
  category: 'security';
  permissionType: 'permissionLevel';
  roleId: number;
  basePermissions: string[];
  hidden: boolean;
  isCustom: boolean;
}

/**
 * Role Assignment schema
 */
export interface IRoleAssignmentSchema {
  principalId: number;
  principalType: 'user' | 'group';
  principalName: string;
  roleDefinitionIds: number[];
  roleDefinitionNames: string[];
}

/**
 * Navigation schema
 */
export interface INavigationSchema extends ISchemaItem {
  category: 'navigation';
  navigationType: 'topNav' | 'quickLaunch' | 'footer';
  nodes: INavigationNode[];
}

export interface INavigationNode {
  id: number;
  title: string;
  url: string;
  isExternal: boolean;
  isVisible: boolean;
  children: INavigationNode[];
}

/**
 * Branding/Theme schema
 */
export interface IBrandingSchema extends ISchemaItem {
  category: 'branding';
  brandingType: 'theme' | 'logo' | 'header' | 'footer';
  themeName?: string;
  themeJson?: Record<string, unknown>;
  logoUrl?: string;
  headerLayout?: string;
  footerEnabled?: boolean;
}

/**
 * Site Settings schema
 */
export interface ISiteSettingsSchema extends ISchemaItem {
  category: 'siteSettings';
  settingsType: 'general' | 'regional' | 'features';
  // General
  siteTitle?: string;
  siteDescription?: string;
  siteLogoUrl?: string;
  // Regional
  locale?: number;
  timeZone?: number;
  // Features
  features?: ISiteFeature[];
}

export interface ISiteFeature {
  id: string;
  title: string;
  scope: 'Web' | 'Site';
  activated: boolean;
}

/**
 * Taxonomy schema
 */
export interface ITaxonomySchema extends ISchemaItem {
  category: 'taxonomy';
  termSetId: string;
  termSetName: string;
  termGroupId: string;
  termGroupName: string;
  isOpenForTermCreation: boolean;
  terms?: ITerm[];
}

export interface ITerm {
  id: string;
  name: string;
  description?: string;
  children?: ITerm[];
  customProperties?: Record<string, string>;
}

/**
 * Union type for all schema items
 */
export type SchemaItem =
  | ISiteColumnSchema
  | IContentTypeSchema
  | IListSchema
  | IGroupSchema
  | IPermissionLevelSchema
  | INavigationSchema
  | IBrandingSchema
  | ISiteSettingsSchema
  | ITaxonomySchema;

/**
 * Schema Explorer state
 */
export interface ISchemaExplorerState {
  // Loading states
  isLoading: boolean;
  loadingCategory: SchemaCategory | null;
  error: string | null;

  // Data
  siteColumns: ISiteColumnSchema[];
  contentTypes: IContentTypeSchema[];
  lists: IListSchema[];
  groups: IGroupSchema[];
  permissionLevels: IPermissionLevelSchema[];
  navigation: INavigationSchema[];
  branding: IBrandingSchema[];
  siteSettings: ISiteSettingsSchema[];
  taxonomy: ITaxonomySchema[];

  // Selection
  selectedCategories: SchemaCategory[];
  selectedItems: Map<SchemaCategory, Set<string>>;

  // Export
  exportFormat: ExportFormat;
  generatedSchema: string;
}

/**
 * PnP Provisioning Template structure (simplified)
 */
export interface IPnPTemplate {
  $schema?: string;
  version?: string;
  siteFields?: unknown[];
  contentTypes?: unknown[];
  lists?: unknown[];
  security?: {
    siteGroups?: unknown[];
    permissions?: unknown[];
  };
  navigation?: {
    globalNavigation?: unknown;
    currentNavigation?: unknown;
  };
  composedLook?: unknown;
  regionalSettings?: unknown;
  supportedUILanguages?: unknown[];
  termGroups?: unknown[];
}

/**
 * Site Script structure
 */
export interface ISiteScript {
  $schema: string;
  actions: ISiteScriptAction[];
  bindata: Record<string, unknown>;
  version: number;
}

export interface ISiteScriptAction {
  verb: string;
  [key: string]: unknown;
}
