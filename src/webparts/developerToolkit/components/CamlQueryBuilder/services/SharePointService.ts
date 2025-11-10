import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI } from '@pnp/sp';
import SPContext from 'spfx-toolkit/lib/utilities/context';
import { FieldType, IFieldInfo, IListInfo, IViewInfo } from '../types/CamlTypes';

export class SharePointService {
  private sp: SPFI;
  private context: WebPartContext;
  private currentSiteUrl: string;

  constructor(context: WebPartContext, siteUrl?: string) {
    this.context = context;
    this.currentSiteUrl = siteUrl || context.pageContext.web.absoluteUrl;

    // Initialize with provided site URL or use current context
    if (siteUrl && siteUrl !== context.pageContext.web.absoluteUrl) {
      this.sp = this.getSpForSite(siteUrl);
    } else {
      this.sp = SPContext.sp;
    }
  }

  /**
   * Get SPFI instance for a specific site using SPContext.sites
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
   * Get all non-hidden lists from the site
   */
  public async getLists(): Promise<IListInfo[]> {
    try {
      // Ensure site is registered if using a different site
      if (this.currentSiteUrl !== this.context.pageContext.web.absoluteUrl) {
        await this.ensureSiteRegistered(this.currentSiteUrl);
        this.sp = this.getSpForSite(this.currentSiteUrl);
      }

      const lists = await this.sp.web.lists
        .filter('Hidden eq false and BaseTemplate ne 115')
        .select('Id', 'Title', 'ItemCount', 'BaseTemplate')
        .orderBy('Title')();

      return lists.map(list => ({
        id: list.Id,
        title: list.Title,
        itemCount: list.ItemCount,
        baseTemplate: list.BaseTemplate,
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
  public async getListFields(listId: string): Promise<IFieldInfo[]> {
    try {
      // Get the list queryable object (not data)
      const list = this.sp.web.lists.getById(listId);

      const fields = await list.fields
        .filter('Hidden eq false and ReadOnlyField eq false and FromBaseType eq false')
        .select('InternalName', 'Title', 'TypeAsString', 'Required', 'Choices')
        .orderBy('Title')();

      // Add common system fields that are useful
      const systemFields = await list.fields
        .filter(
          "(InternalName eq 'Created' or InternalName eq 'Modified' or InternalName eq 'Author' or InternalName eq 'Editor' or InternalName eq 'ID' or InternalName eq 'Title' or InternalName eq 'Attachments')"
        )
        .select('InternalName', 'Title', 'TypeAsString', 'Required', 'Choices')();

      const allFields = [...systemFields, ...fields];

      // Remove duplicates based on InternalName
      const uniqueFields = allFields.filter(
        (field, index, self) => index === self.findIndex(f => f.InternalName === field.InternalName)
      );

      return uniqueFields.map(field => ({
        internalName: field.InternalName,
        title: field.Title,
        typeAsString: this.normalizeFieldType(field.TypeAsString),
        required: field.Required,
        choices: field.Choices,
      }));
    } catch (error) {
      console.error('Error loading fields:', error);
      throw new Error(`Failed to load fields: ${error.message}`);
    }
  }

  /**
   * Get views from a specific list
   */
  public async getListViews(listId: string): Promise<IViewInfo[]> {
    try {
      // Get the list queryable object (not data)
      const list = this.sp.web.lists.getById(listId);
      const views = await list.views
        .filter('Hidden eq false')
        .select('Id', 'Title', 'ViewQuery')
        .orderBy('Title')();

      return views.map((view: any) => ({
        id: view.Id,
        title: view.Title,
        viewQuery: view.ViewQuery || '',
        viewFields: [],
      }));
    } catch (error: any) {
      console.error('Error loading views:', error);
      throw new Error(`Failed to load views: ${error.message}`);
    }
  }

  /**
   * Execute a CAML query and return results
   */
  public async executeQuery(
    listId: string,
    camlQuery: string
  ): Promise<{ count: number; items: Record<string, unknown>[] }> {
    try {
      const items = await this.sp.web.lists.getById(listId).getItemsByCAMLQuery({
        ViewXml: camlQuery,
      });

      return {
        count: items.length,
        items: items, // Return all items
      };
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error(`Failed to execute query: ${(error as Error).message}`);
    }
  }

  /**
   * Get current user info
   */
  public async getCurrentUser(): Promise<{ id: number; title: string; email: string }> {
    try {
      const user = await (this.sp.web as any).currentUser();
      return {
        id: user.Id,
        title: user.Title,
        email: user.Email,
      };
    } catch (error: any) {
      console.error('Error getting current user:', error);
      throw new Error(`Failed to get current user: ${error.message}`);
    }
  }

  /**
   * Normalize field type to match our FieldType enum
   */
  private normalizeFieldType(typeAsString: string): FieldType {
    // Map SharePoint field types to our enum
    const typeMap: Record<string, FieldType> = {
      Text: 'Text',
      Note: 'Note',
      Number: 'Number',
      Currency: 'Currency',
      DateTime: 'DateTime',
      Boolean: 'Boolean',
      User: 'User',
      UserMulti: 'User',
      Lookup: 'Lookup',
      LookupMulti: 'Lookup',
      Choice: 'Choice',
      MultiChoice: 'MultiChoice',
      URL: 'URL',
      Guid: 'Guid',
      Integer: 'Integer',
      Counter: 'Counter',
      TaxonomyFieldType: 'TaxonomyFieldType',
      TaxonomyFieldTypeMulti: 'TaxonomyFieldTypeMulti',
    };

    return (typeMap[typeAsString] as FieldType) || ('Text' as FieldType);
  }

  /**
   * Change site URL
   */
  public changeSiteUrl(siteUrl: string): void {
    this.currentSiteUrl = siteUrl;
    if (siteUrl !== this.context.pageContext.web.absoluteUrl) {
      this.sp = this.getSpForSite(siteUrl);
    } else {
      this.sp = SPContext.sp;
    }
  }

  /**
   * Get current site URL
   */
  public getCurrentSiteUrl(): string {
    return this.currentSiteUrl;
  }
}
