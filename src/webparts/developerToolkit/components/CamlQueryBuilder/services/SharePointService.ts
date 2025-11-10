import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import SPContext from 'spfx-toolkit/lib/utilities/context';
import { FieldType, IFieldInfo, IListInfo, IViewInfo } from '../types/CamlTypes';

export class SharePointService {
  private sp: SPFI;
  private context: WebPartContext;

  constructor(context: WebPartContext, siteUrl?: string) {
    this.context = context;

    // Initialize with provided site URL or use current context
    if (siteUrl && siteUrl !== context.pageContext.web.absoluteUrl) {
      this.sp = spfi(siteUrl).using(SPFx(context));
    } else {
      this.sp = SPContext.sp;
    }
  }

  /**
   * Get all non-hidden lists from the site
   */
  public async getLists(): Promise<IListInfo[]> {
    try {
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
    } catch (error) {
      console.error('Error loading lists:', error);
      throw new Error(`Failed to load lists: ${error.message}`);
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
      const list = await this.sp.web.lists.getById(listId)();
      const views = await (list as any).views.filter('Hidden eq false')
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
    if (siteUrl !== this.context.pageContext.web.absoluteUrl) {
      this.sp = spfi(siteUrl).using(SPFx(this.context));
    } else {
      this.sp = SPContext.sp;
    }
  }

  /**
   * Get current site URL
   */
  public getCurrentSiteUrl(): string {
    return this.context.pageContext.web.absoluteUrl;
  }
}
