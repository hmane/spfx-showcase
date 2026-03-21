import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI } from '@pnp/sp';
import SPContext from 'spfx-toolkit/utilities/context';
import { ISPField, ISPList } from '../types/SPFormBuilderTypes';

/**
 * SharePoint service for SPFormBuilder
 * Instance-based service that supports changing site URLs using SPContext.sites
 */
export class SharePointService {
  private sp: SPFI | null = null;
  private context: WebPartContext;
  private currentSiteUrl: string;

  constructor(context: WebPartContext, siteUrl?: string) {
    this.context = context;
    this.currentSiteUrl = siteUrl || context.pageContext.web.absoluteUrl;

    // For current site, initialize immediately
    if (!siteUrl || siteUrl === context.pageContext.web.absoluteUrl) {
      this.sp = SPContext.sp;
    }
    // For other sites, defer initialization until first use
  }

  /**
   * Ensure site is registered in SPContext.sites
   */
  private async ensureSiteRegistered(siteUrl: string): Promise<void> {
    // Check if site is already registered
    if (!SPContext.sites.has(siteUrl)) {
      // Add the site to SPContext with default config
      await SPContext.sites.add(siteUrl, {
        cache: { strategy: 'memory', ttl: 300000 }, // 5 minutes cache
        logger: { enabled: true, prefix: 'MultiSite' }
      });
    }
  }

  /**
   * Get SPFI instance for a specific site using SPContext.sites
   */
  private getSpForSite(siteUrl: string): SPFI {
    // Get the site context (assumes site is already registered)
    const siteContext = SPContext.sites.get(siteUrl);
    return siteContext.sp;
  }

  /**
   * Ensure SP instance is initialized for the current site
   */
  private async ensureSpInitialized(): Promise<SPFI> {
    if (this.sp) {
      return this.sp;
    }

    // Register and get SP for the current site
    if (this.currentSiteUrl !== this.context.pageContext.web.absoluteUrl) {
      await this.ensureSiteRegistered(this.currentSiteUrl);
      this.sp = this.getSpForSite(this.currentSiteUrl);
    } else {
      this.sp = SPContext.sp;
    }

    return this.sp;
  }

  /**
   * Get current site URL
   */
  public getCurrentSiteUrl(): string {
    return this.currentSiteUrl;
  }

  /**
   * Change site URL and reinitialize SP instance using SPContext.sites
   */
  public changeSiteUrl(siteUrl: string): void {
    this.currentSiteUrl = siteUrl;
    // Reset sp instance to force re-initialization on next use
    if (siteUrl !== this.context.pageContext.web.absoluteUrl) {
      this.sp = null; // Will be initialized on next use
    } else {
      this.sp = SPContext.sp;
    }
  }

  /**
   * Get all non-hidden lists from the site
   */
  public async getLists(): Promise<ISPList[]> {
    try {
      // Ensure SP instance is initialized
      const sp = await this.ensureSpInitialized();

      const lists = await sp.web.lists
        .filter('Hidden eq false and BaseTemplate ne 115')
        .select('Id', 'Title', 'ItemCount', 'BaseTemplate', 'BaseType')
        .orderBy('Title')();

      return lists.map(list => ({
        Id: list.Id,
        Title: list.Title,
        ItemCount: list.ItemCount || 0,
        BaseTemplate: list.BaseTemplate,
        BaseType: list.BaseType
      }));
    } catch (error: any) {
      console.error('Error loading lists:', error);

      // Provide more helpful error messages
      if (error.status === 403) {
        throw new Error('Access denied. You may not have permissions to access this site.');
      } else if (error.status === 404) {
        throw new Error('Site not found. Please check the URL and try again.');
      } else if (!error.response && error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check the site URL and your connection.');
      }

      throw new Error(`Failed to load lists: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get fields from a specific list
   */
  public async getListFields(listId: string): Promise<ISPField[]> {
    try {
      // Ensure SP instance is initialized
      const sp = await this.ensureSpInitialized();

      // Get the list queryable object (not data)
      const list = sp.web.lists.getById(listId);

      const fields = await list.fields
        .filter('Hidden eq false and ReadOnlyField eq false and FromBaseType eq false')
        .select(
          'InternalName',
          'Title',
          'TypeAsString',
          'Required',
          'ReadOnlyField',
          'Hidden',
          'MaxLength',
          'Choices',
          'LookupList',
          'LookupField',
          'TermSetId',
          'Description',
          'DefaultValue',
          'MinimumValue',
          'MaximumValue'
        )
        .orderBy('Title')();

      // Add common system fields that are useful
      const systemFields = await list.fields
        .filter(
          "(InternalName eq 'Created' or InternalName eq 'Modified' or InternalName eq 'Author' or InternalName eq 'Editor' or InternalName eq 'ID' or InternalName eq 'Title' or InternalName eq 'Attachments')"
        )
        .select(
          'InternalName',
          'Title',
          'TypeAsString',
          'Required',
          'ReadOnlyField',
          'Hidden',
          'Description'
        )();

      const allFields = [...systemFields, ...fields];

      // Remove duplicates based on InternalName
      const uniqueFields = allFields.filter(
        (field, index, self) => index === self.findIndex(f => f.InternalName === field.InternalName)
      );

      return uniqueFields.map((field: any) => ({
        InternalName: field.InternalName,
        Title: field.Title,
        TypeAsString: this.normalizeFieldType(field.TypeAsString),
        Required: field.Required,
        ReadOnlyField: field.ReadOnlyField || false,
        Hidden: field.Hidden || false,
        MaxLength: field.MaxLength || null,
        Choices: field.Choices,
        LookupList: field.LookupList || null,
        LookupField: field.LookupField || null,
        TermSetId: field.TermSetId || null,
        Description: field.Description || null,
        DefaultValue: field.DefaultValue || null,
        Min: field.MinimumValue || null,
        Max: field.MaximumValue || null
      }));
    } catch (error: any) {
      console.error('Error loading fields:', error);
      throw new Error(`Failed to load fields: ${error.message}`);
    }
  }

  /**
   * Normalize field type string
   */
  private normalizeFieldType(fieldType: string): string {
    // Map common variations
    const typeMap: Record<string, string> = {
      'Text': 'Text',
      'Note': 'Note',
      'Number': 'Number',
      'Currency': 'Currency',
      'DateTime': 'DateTime',
      'Boolean': 'Boolean',
      'User': 'User',
      'UserMulti': 'UserMulti',
      'Lookup': 'Lookup',
      'LookupMulti': 'LookupMulti',
      'URL': 'URL',
      'Choice': 'Choice',
      'MultiChoice': 'MultiChoice',
      'TaxonomyFieldType': 'TaxonomyFieldType',
      'TaxonomyFieldTypeMulti': 'TaxonomyFieldTypeMulti',
      'Computed': 'Text',
      'Calculated': 'Text',
      'Integer': 'Number',
      'Counter': 'Number',
      'Guid': 'Text'
    };

    return typeMap[fieldType] || fieldType;
  }
}
