// Schema Explorer SharePoint Service

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFx, SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';
import '@pnp/sp/content-types';
import '@pnp/sp/site-groups';
import '@pnp/sp/security';
import '@pnp/sp/navigation';
import '@pnp/sp/regional-settings';
import '@pnp/sp/features';
import '@pnp/sp/views';
import '@pnp/sp/taxonomy';

import {
  ISiteColumnSchema,
  IContentTypeSchema,
  IListSchema,
  IGroupSchema,
  IPermissionLevelSchema,
  INavigationSchema,
  INavigationNode,
  ISiteSettingsSchema,
  IBrandingSchema,
  ITaxonomySchema,
  ITerm,
  IFieldLink,
  IListFieldSchema,
  IViewSchema,
  IRoleAssignmentSchema,
} from '../types/SchemaTypes';

export class SchemaService {
  private sp: SPFI;

  constructor(context: WebPartContext, siteUrl?: string) {
    const baseSp = spfi().using(SPFx(context));
    // If a different site URL is provided, use it
    if (siteUrl && siteUrl.trim()) {
      this.sp = spfi(siteUrl).using(SPFx(context));
    } else {
      this.sp = baseSp;
    }
  }

  /**
   * Get all site columns
   */
  async getSiteColumns(): Promise<ISiteColumnSchema[]> {
    try {
      const fields = await this.sp.web.fields
        .filter("ReadOnlyField eq false and Hidden eq false")
        .select(
          'Id', 'InternalName', 'Title', 'Description', 'TypeAsString', 'Group',
          'Required', 'Hidden', 'Indexed', 'SchemaXml', 'Choices', 'LookupList',
          'LookupField', 'Formula', 'TermSetId'
        )();

      return fields.map(field => ({
        id: field.Id,
        title: field.Title,
        internalName: field.InternalName,
        description: field.Description || '',
        category: 'siteColumns' as const,
        selected: false,
        fieldType: field.TypeAsString,
        group: field.Group || 'Custom Columns',
        required: field.Required || false,
        hidden: field.Hidden || false,
        indexed: field.Indexed || false,
        schemaXml: field.SchemaXml,
        choices: (field as any).Choices,
        lookupList: (field as any).LookupList,
        lookupField: (field as any).LookupField,
        formula: (field as any).Formula,
        termSetId: (field as any).TermSetId,
      }));
    } catch (error) {
      console.error('Error fetching site columns:', error);
      throw error;
    }
  }

  /**
   * Get all content types
   */
  async getContentTypes(): Promise<IContentTypeSchema[]> {
    try {
      const contentTypes = await this.sp.web.contentTypes
        .select(
          'Id', 'Name', 'Description', 'Group', 'Hidden', 'Sealed', 'ReadOnly'
        )
        .expand('FieldLinks')();

      return contentTypes.map(ct => ({
        id: ct.Id.StringValue,
        title: ct.Name,
        internalName: ct.Name,
        description: ct.Description || '',
        category: 'contentTypes' as const,
        selected: false,
        contentTypeId: ct.Id.StringValue,
        group: ct.Group || 'Custom Content Types',
        parentId: ct.Id.StringValue.substring(0, ct.Id.StringValue.length - 34), // Approximate parent
        hidden: ct.Hidden || false,
        sealed: ct.Sealed || false,
        readOnly: ct.ReadOnly || false,
        fieldLinks: ((ct as any).FieldLinks || []).map((fl: any) => ({
          id: fl.Id,
          name: fl.Name,
          required: fl.Required || false,
          hidden: fl.Hidden || false,
        })) as IFieldLink[],
      }));
    } catch (error) {
      console.error('Error fetching content types:', error);
      throw error;
    }
  }

  /**
   * Get all lists and libraries
   */
  async getLists(): Promise<IListSchema[]> {
    try {
      const lists = await this.sp.web.lists
        .filter("Hidden eq false")
        .select(
          'Id', 'Title', 'Description', 'BaseTemplate', 'BaseType',
          'ItemCount', 'Hidden', 'EnableVersioning', 'EnableMinorVersions',
          'EnableModeration', 'ForceCheckout', 'EnableAttachments',
          'EnableFolderCreation', 'ContentTypesEnabled', 'ValidationFormula',
          'ValidationMessage', 'HasUniqueRoleAssignments'
        )() as Array<{
          Id: string;
          Title: string;
          Description?: string;
          BaseTemplate: number;
          BaseType: number;
          ItemCount: number;
          Hidden?: boolean;
          EnableVersioning?: boolean;
          EnableMinorVersions?: boolean;
          EnableModeration?: boolean;
          ForceCheckout?: boolean;
          EnableAttachments?: boolean;
          EnableFolderCreation?: boolean;
          ContentTypesEnabled?: boolean;
          ValidationFormula?: string;
          ValidationMessage?: string;
          HasUniqueRoleAssignments?: boolean;
        }>;

      const listsWithDetails: IListSchema[] = [];

      for (const list of lists) {
        // Get fields for this list (include client-side rendering properties)
        const fields = await this.sp.web.lists.getById(list.Id)
          .fields
          .filter("ReadOnlyField eq false and Hidden eq false")
          .select(
            'Id', 'InternalName', 'Title', 'TypeAsString', 'Required', 'Hidden', 'ReadOnlyField', 'Indexed', 'SchemaXml',
            'ClientSideComponentId', 'ClientSideComponentProperties', 'CustomFormatter'
          )();

        // Get views for this list (include all view properties)
        const views = await this.sp.web.lists.getById(list.Id)
          .views
          .filter("Hidden eq false")
          .select(
            'Id', 'Title', 'PersonalView', 'DefaultView', 'ViewQuery', 'RowLimit',
            'ViewType', 'Paged', 'Scope', 'JSLink', 'CustomFormatter', 'ViewData',
            'Aggregations', 'AggregationsStatus'
          )
          .expand('ViewFields')();

        // Get content types for this list
        const contentTypes = await this.sp.web.lists.getById(list.Id)
          .contentTypes
          .select('Id', 'Name')();

        const roleAssignments = list.HasUniqueRoleAssignments
          ? await this.getListRoleAssignments(list.Id)
          : [];

        listsWithDetails.push({
          id: list.Id,
          title: list.Title,
          internalName: list.Title,
          description: list.Description || '',
          category: 'lists' as const,
          selected: false,
          listId: list.Id,
          baseTemplate: list.BaseTemplate,
          baseType: list.BaseType,
          itemCount: list.ItemCount,
          hidden: list.Hidden || false,
          enableVersioning: list.EnableVersioning || false,
          enableMinorVersions: list.EnableMinorVersions || false,
          enableModeration: list.EnableModeration || false,
          forceCheckout: list.ForceCheckout || false,
          enableAttachments: list.EnableAttachments || false,
          enableFolderCreation: list.EnableFolderCreation || false,
          contentTypesEnabled: list.ContentTypesEnabled || false,
          hasUniqueRoleAssignments: list.HasUniqueRoleAssignments || false,
          roleAssignments,
          validationFormula: list.ValidationFormula,
          validationMessage: list.ValidationMessage,
          fields: fields.map(f => ({
            id: f.Id,
            internalName: f.InternalName,
            title: f.Title,
            fieldType: f.TypeAsString,
            required: f.Required || false,
            hidden: f.Hidden || false,
            readOnly: f.ReadOnlyField || false,
            indexed: f.Indexed || false,
            schemaXml: f.SchemaXml,
            // Only include ClientSideComponentId if it's not the default empty GUID
            clientSideComponentId: (f as any).ClientSideComponentId &&
              (f as any).ClientSideComponentId !== '00000000-0000-0000-0000-000000000000'
              ? (f as any).ClientSideComponentId : undefined,
            clientSideComponentProperties: (f as any).ClientSideComponentId &&
              (f as any).ClientSideComponentId !== '00000000-0000-0000-0000-000000000000' &&
              (f as any).ClientSideComponentProperties
              ? (f as any).ClientSideComponentProperties : undefined,
            customFormatter: (f as any).CustomFormatter || undefined,
          })) as IListFieldSchema[],
          views: views.map(v => ({
            id: v.Id,
            title: v.Title,
            personalView: v.PersonalView || false,
            defaultView: v.DefaultView || false,
            viewQuery: v.ViewQuery,
            viewFields: (v as any).ViewFields?.Items || [],
            rowLimit: v.RowLimit || 30,
            viewType: (v as any).ViewType || undefined,
            paged: (v as any).Paged || false,
            scope: (v as any).Scope || undefined,
            jsLink: (v as any).JSLink || undefined,
            customFormatter: (v as any).CustomFormatter || undefined,
            viewData: (v as any).ViewData || undefined,
            aggregations: (v as any).Aggregations || undefined,
            aggregationsStatus: (v as any).AggregationsStatus || undefined,
          })) as IViewSchema[],
          contentTypes: contentTypes.map(ct => ct.Name),
        });
      }

      return listsWithDetails;
    } catch (error) {
      console.error('Error fetching lists:', error);
      throw error;
    }
  }

  /**
   * Get SharePoint groups
   */
  async getGroups(): Promise<IGroupSchema[]> {
    try {
      const web = await this.sp.web.select(
        'AssociatedOwnerGroup/Id', 'AssociatedOwnerGroup/Title',
        'AssociatedMemberGroup/Id', 'AssociatedMemberGroup/Title',
        'AssociatedVisitorGroup/Id', 'AssociatedVisitorGroup/Title'
      ).expand('AssociatedOwnerGroup', 'AssociatedMemberGroup', 'AssociatedVisitorGroup')();

      const groups = await this.sp.web.siteGroups
        .select(
          'Id', 'Title', 'Description', 'OwnerTitle',
          'AllowMembersEditMembership', 'AllowRequestToJoinLeave',
          'AutoAcceptRequestToJoinLeave', 'OnlyAllowMembersViewMembership'
        )();

      const ownersId = (web as any).AssociatedOwnerGroup?.Id;
      const membersId = (web as any).AssociatedMemberGroup?.Id;
      const visitorsId = (web as any).AssociatedVisitorGroup?.Id;

      return groups.map(group => {
        let groupType: 'owners' | 'members' | 'visitors' | 'custom' = 'custom';
        if (group.Id === ownersId) groupType = 'owners';
        else if (group.Id === membersId) groupType = 'members';
        else if (group.Id === visitorsId) groupType = 'visitors';

        return {
          id: group.Id.toString(),
          title: group.Title,
          description: group.Description || '',
          category: 'security' as const,
          selected: false,
          groupId: group.Id,
          groupType,
          ownerTitle: group.OwnerTitle,
          allowMembersEditMembership: group.AllowMembersEditMembership || false,
          allowRequestToJoinLeave: group.AllowRequestToJoinLeave || false,
          autoAcceptRequestToJoinLeave: group.AutoAcceptRequestToJoinLeave || false,
          onlyAllowMembersViewMembership: group.OnlyAllowMembersViewMembership || false,
          memberCount: 0, // Would need additional call to get this
        };
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  private async getListRoleAssignments(listId: string): Promise<IRoleAssignmentSchema[]> {
    try {
      const roleAssignments = await this.sp.web.lists.getById(listId).roleAssignments.expand(
        'Member',
        'RoleDefinitionBindings'
      )() as Array<{
        Member: {
          Id: number;
          Title: string;
          PrincipalType: number;
        };
        RoleDefinitionBindings: Array<{
          Id: number;
          Name: string;
        }>;
      }>;

      return roleAssignments
        .map(assignment => {
          const roleDefinitionBindings = (assignment.RoleDefinitionBindings || []).filter(
            role => role.Name !== 'Limited Access'
          );

          return {
            principalId: assignment.Member?.Id,
            principalType: assignment.Member?.PrincipalType === 8 ? 'group' : 'user',
            principalName: assignment.Member?.Title || 'Unknown Principal',
            roleDefinitionIds: roleDefinitionBindings.map(role => role.Id),
            roleDefinitionNames: roleDefinitionBindings.map(role => role.Name),
          } as IRoleAssignmentSchema;
        })
        .filter(assignment => assignment.roleDefinitionNames.length > 0);
    } catch (error) {
      console.warn(`Failed to load list role assignments for list ${listId}:`, error);
      return [];
    }
  }

  /**
   * Get permission levels (role definitions)
   */
  async getPermissionLevels(): Promise<IPermissionLevelSchema[]> {
    try {
      const roleDefinitions = await this.sp.web.roleDefinitions
        .select('Id', 'Name', 'Description', 'Hidden', 'BasePermissions', 'RoleTypeKind')();

      return roleDefinitions.map(rd => ({
        id: rd.Id.toString(),
        title: rd.Name,
        description: rd.Description || '',
        category: 'security' as const,
        selected: false,
        permissionType: 'permissionLevel' as const,
        roleId: rd.Id,
        basePermissions: [rd.BasePermissions?.High?.toString() || '', rd.BasePermissions?.Low?.toString() || ''],
        hidden: rd.Hidden || false,
        isCustom: rd.RoleTypeKind === 0, // RoleTypeKind 0 = None (custom)
      }));
    } catch (error) {
      console.error('Error fetching permission levels:', error);
      throw error;
    }
  }

  /**
   * Get navigation (top nav and quick launch)
   */
  async getNavigation(): Promise<INavigationSchema[]> {
    try {
      const result: INavigationSchema[] = [];

      // Get top navigation
      try {
        const topNav = await this.sp.web.navigation.topNavigationBar();
        result.push({
          id: 'topNav',
          title: 'Top Navigation',
          description: 'Global navigation bar',
          category: 'navigation' as const,
          selected: false,
          navigationType: 'topNav',
          nodes: this.mapNavigationNodes(topNav),
        });
      } catch {
        // Top nav might not be available
      }

      // Get quick launch
      try {
        const quickLaunch = await this.sp.web.navigation.quicklaunch();
        result.push({
          id: 'quickLaunch',
          title: 'Quick Launch',
          description: 'Left navigation',
          category: 'navigation' as const,
          selected: false,
          navigationType: 'quickLaunch',
          nodes: this.mapNavigationNodes(quickLaunch),
        });
      } catch {
        // Quick launch might not be available
      }

      return result;
    } catch (error) {
      console.error('Error fetching navigation:', error);
      throw error;
    }
  }

  private mapNavigationNodes(nodes: any[]): INavigationNode[] {
    return nodes.map(node => ({
      id: node.Id,
      title: node.Title,
      url: node.Url,
      isExternal: node.IsExternal || false,
      isVisible: node.IsVisible !== false,
      children: node.Children ? this.mapNavigationNodes(node.Children) : [],
    }));
  }

  /**
   * Get site settings (general, regional, features)
   */
  async getSiteSettings(): Promise<ISiteSettingsSchema[]> {
    try {
      const result: ISiteSettingsSchema[] = [];

      // Get general site info
      const web = await this.sp.web.select('Title', 'Description', 'SiteLogoUrl')();
      result.push({
        id: 'general',
        title: 'Site Properties',
        description: 'General site settings',
        category: 'siteSettings' as const,
        selected: false,
        settingsType: 'general',
        siteTitle: web.Title,
        siteDescription: web.Description,
        siteLogoUrl: web.SiteLogoUrl || undefined,
      });

      // Get regional settings
      const regional = await this.sp.web.regionalSettings();
      result.push({
        id: 'regional',
        title: 'Regional Settings',
        description: 'Locale and timezone settings',
        category: 'siteSettings' as const,
        selected: false,
        settingsType: 'regional',
        locale: regional.LocaleId,
        timeZone: (regional as any).TimeZone?.Id,
      });

      // Get site features
      const features = await this.sp.web.features();
      result.push({
        id: 'features',
        title: 'Site Features',
        description: 'Activated site features',
        category: 'siteSettings' as const,
        selected: false,
        settingsType: 'features',
        features: features.map(f => ({
          id: f.DefinitionId,
          title: (f as any).DisplayName || f.DefinitionId,
          scope: 'Web' as const,
          activated: true,
        })),
      });

      return result;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      throw error;
    }
  }

  /**
   * Get a single list by ID with full details
   */
  async getListById(listId: string): Promise<IListSchema | null> {
    try {
      const list = await this.sp.web.lists.getById(listId)
        .select(
          'Id', 'Title', 'Description', 'BaseTemplate', 'BaseType',
          'ItemCount', 'Hidden', 'EnableVersioning', 'EnableMinorVersions',
          'EnableModeration', 'ForceCheckout', 'EnableAttachments',
          'EnableFolderCreation', 'ContentTypesEnabled', 'ValidationFormula',
          'ValidationMessage', 'HasUniqueRoleAssignments'
        )() as {
          Id: string;
          Title: string;
          Description?: string;
          BaseTemplate: number;
          BaseType: number;
          ItemCount: number;
          Hidden?: boolean;
          EnableVersioning?: boolean;
          EnableMinorVersions?: boolean;
          EnableModeration?: boolean;
          ForceCheckout?: boolean;
          EnableAttachments?: boolean;
          EnableFolderCreation?: boolean;
          ContentTypesEnabled?: boolean;
          ValidationFormula?: string;
          ValidationMessage?: string;
          HasUniqueRoleAssignments?: boolean;
        };

      const fields = await this.sp.web.lists.getById(listId)
        .fields
        .filter("Hidden eq false")
        .select('Id', 'InternalName', 'Title', 'TypeAsString', 'Required', 'Hidden', 'ReadOnlyField', 'Indexed', 'SchemaXml')();

      const views = await this.sp.web.lists.getById(listId)
        .views
        .filter("Hidden eq false")
        .select('Id', 'Title', 'PersonalView', 'DefaultView', 'ViewQuery', 'RowLimit')
        .expand('ViewFields')();

      const contentTypes = await this.sp.web.lists.getById(listId)
        .contentTypes
        .select('Id', 'Name')();

      const roleAssignments = list.HasUniqueRoleAssignments
        ? await this.getListRoleAssignments(listId)
        : [];

      return {
        id: list.Id,
        title: list.Title,
        internalName: list.Title,
        description: list.Description || '',
        category: 'lists' as const,
        selected: false,
        listId: list.Id,
        baseTemplate: list.BaseTemplate,
        baseType: list.BaseType,
        itemCount: list.ItemCount,
        hidden: list.Hidden || false,
        enableVersioning: list.EnableVersioning || false,
        enableMinorVersions: list.EnableMinorVersions || false,
        enableModeration: list.EnableModeration || false,
        forceCheckout: list.ForceCheckout || false,
        enableAttachments: list.EnableAttachments || false,
        enableFolderCreation: list.EnableFolderCreation || false,
        contentTypesEnabled: list.ContentTypesEnabled || false,
        hasUniqueRoleAssignments: list.HasUniqueRoleAssignments || false,
        roleAssignments,
        validationFormula: list.ValidationFormula,
        validationMessage: list.ValidationMessage,
        fields: fields.map(f => ({
          id: f.Id,
          internalName: f.InternalName,
          title: f.Title,
          fieldType: f.TypeAsString,
          required: f.Required || false,
          hidden: f.Hidden || false,
          readOnly: f.ReadOnlyField || false,
          indexed: f.Indexed || false,
          schemaXml: f.SchemaXml,
        })),
        views: views.map(v => ({
          id: v.Id,
          title: v.Title,
          personalView: v.PersonalView || false,
          defaultView: v.DefaultView || false,
          viewQuery: v.ViewQuery,
          viewFields: (v as any).ViewFields?.Items || [],
          rowLimit: v.RowLimit || 30,
        })),
        contentTypes: contentTypes.map(ct => ct.Name),
      };
    } catch (error) {
      console.error('Error fetching list:', error);
      return null;
    }
  }

  /**
   * Get branding/theme information
   */
  async getBranding(): Promise<IBrandingSchema[]> {
    try {
      const result: IBrandingSchema[] = [];

      // Get current theme/composed look
      try {
        const web = await this.sp.web.select(
          'ThemedCssFolderUrl', 'SiteLogoUrl', 'MasterUrl', 'CustomMasterUrl',
          'HeaderLayout', 'FooterEnabled', 'HeaderEmphasis', 'MegaMenuEnabled'
        )();

        // Theme information
        result.push({
          id: 'theme',
          title: 'Site Theme',
          description: 'Current site theme and colors',
          category: 'branding' as const,
          selected: false,
          brandingType: 'theme',
          themeName: (web as any).ThemedCssFolderUrl ? 'Custom Theme' : 'Default',
        });

        // Logo
        if (web.SiteLogoUrl) {
          result.push({
            id: 'logo',
            title: 'Site Logo',
            description: 'Site logo configuration',
            category: 'branding' as const,
            selected: false,
            brandingType: 'logo',
            logoUrl: web.SiteLogoUrl,
          });
        }

        // Header configuration
        result.push({
          id: 'header',
          title: 'Header Configuration',
          description: 'Header layout and settings',
          category: 'branding' as const,
          selected: false,
          brandingType: 'header',
          headerLayout: (web as any).HeaderLayout?.toString() || 'Standard',
        });

        // Footer configuration
        result.push({
          id: 'footer',
          title: 'Footer Configuration',
          description: 'Footer settings',
          category: 'branding' as const,
          selected: false,
          brandingType: 'footer',
          footerEnabled: (web as any).FooterEnabled || false,
        });
      } catch (error) {
        console.warn('Could not fetch all branding info:', error);
      }

      return result;
    } catch (error) {
      console.error('Error fetching branding:', error);
      throw error;
    }
  }

  /**
   * Get taxonomy/term sets
   */
  async getTaxonomy(): Promise<ITaxonomySchema[]> {
    try {
      const result: ITaxonomySchema[] = [];

      // Get term store and term groups
      try {
        const store = await this.sp.termStore();
        if (store) {
          const groups = await this.sp.termStore.groups();

          for (const group of groups) {
            // Get term sets for each group
            const sets = await this.sp.termStore.groups.getById(group.id).sets();

            for (const set of sets) {
              // Get terms for each set (first level only to avoid too many calls)
              let terms: ITerm[] = [];
              try {
                const rawTerms = await this.sp.termStore.sets.getById(set.id).terms();
                terms = this.mapTerms(rawTerms);
              } catch {
                // Terms might not be accessible
              }

              result.push({
                id: set.id,
                title: set.localizedNames?.[0]?.name || set.id,
                internalName: set.id,
                description: set.description || '',
                category: 'taxonomy' as const,
                selected: false,
                termSetId: set.id,
                termSetName: set.localizedNames?.[0]?.name || set.id,
                termGroupId: group.id,
                termGroupName: group.name || group.id,
                isOpenForTermCreation: set.isOpen || false,
                terms,
              });
            }
          }
        }
      } catch (error) {
        console.warn('Could not fetch taxonomy data:', error);
        // Taxonomy service might not be available or accessible
      }

      return result;
    } catch (error) {
      console.error('Error fetching taxonomy:', error);
      throw error;
    }
  }

  private mapTerms(rawTerms: any[]): ITerm[] {
    return rawTerms.map(term => ({
      id: term.id,
      name: term.labels?.[0]?.name || term.id,
      description: term.descriptions?.[0]?.description || '',
      children: term.children ? this.mapTerms(term.children) : [],
      customProperties: term.properties || {},
    }));
  }
}
