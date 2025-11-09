import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';
import { ISPField, ISPList } from '../types/SPFormBuilderTypes';

/**
 * SharePoint service for SPFormBuilder
 * Instance-based service that supports changing site URLs
 */
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
   * Get current site URL
   */
  public getCurrentSiteUrl(): string {
    return this.context.pageContext.web.absoluteUrl;
  }

  /**
   * Change site URL and reinitialize SP instance
   */
  public changeSiteUrl(siteUrl: string): void {
    if (siteUrl !== this.context.pageContext.web.absoluteUrl) {
      this.sp = spfi(siteUrl).using(SPFx(this.context));
    } else {
      this.sp = SPContext.sp;
    }
  }

  /**
   * Get all non-hidden lists from the site
   */
  public async getLists(): Promise<ISPList[]> {
    try {
      const lists = await this.sp.web.lists
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
      throw new Error(`Failed to load lists: ${error.message}`);
    }
  }

  /**
   * Get fields from a specific list
   */
  public async getListFields(listId: string): Promise<ISPField[]> {
    try {
      const fields = await this.sp.web.lists
        .getById(listId)
        .fields.filter('Hidden eq false and ReadOnlyField eq false and FromBaseType eq false')
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
      const systemFields = await this.sp.web.lists
        .getById(listId)
        .fields.filter(
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
