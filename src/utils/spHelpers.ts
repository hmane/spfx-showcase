// Import centralized PnP type augmentations
import { SPFI } from '@pnp/sp';
import { IFieldInfo } from '@pnp/sp/fields';
import { logger } from './logger';
/**
 * SharePoint helper utilities
 * Centralized common SharePoint operations to reduce code duplication
 */

const LOG_SOURCE = 'SPHelpers';

/**
 * List information interface
 */
export interface IListInfo {
  id: string;
  title: string;
  itemCount: number;
  baseTemplate: number;
  hidden: boolean;
}

/**
 * Item data interface
 */
export interface IItemData {
  Id: number;
  Title?: string;
  [key: string]: any;
}

/**
 * Get all non-hidden lists from the current site
 *
 * @param sp - SPFI instance
 * @returns Promise with array of list information
 *
 * @example
 * ```typescript
 * const lists = await getSiteLists(sp);
 * console.log(lists.map(l => l.title));
 * ```
 */
export async function getSiteLists(sp: SPFI): Promise<IListInfo[]> {
  try {
    logger.verbose('Fetching site lists', LOG_SOURCE);

    const lists = await sp.web.lists
      .select('Id', 'Title', 'ItemCount', 'BaseTemplate', 'Hidden')
      .filter('Hidden eq false')();

    const listInfo: IListInfo[] = lists.map((list: any) => ({
      id: list.Id,
      title: list.Title,
      itemCount: list.ItemCount,
      baseTemplate: list.BaseTemplate,
      hidden: list.Hidden,
    }));

    logger.info(`Fetched ${listInfo.length} lists`, LOG_SOURCE);
    return listInfo;
  } catch (error) {
    logger.error('Failed to fetch site lists', LOG_SOURCE, error);
    throw error;
  }
}

/**
 * Get list by ID
 *
 * @param sp - SPFI instance
 * @param listId - List GUID
 * @returns Promise with list object
 *
 * @example
 * ```typescript
 * const list = await getListById(sp, 'abc123...');
 * console.log(list.Title);
 * ```
 */
export async function getListById(sp: SPFI, listId: string): Promise<any> {
  try {
    logger.verbose(`Fetching list: ${listId}`, LOG_SOURCE);

    const list = await sp.web.lists
      .getById(listId)
      .select('Id', 'Title', 'ItemCount', 'BaseTemplate', 'Hidden')();

    logger.info(`Fetched list: ${list.Title}`, LOG_SOURCE);
    return list;
  } catch (error) {
    logger.error(`Failed to fetch list: ${listId}`, LOG_SOURCE, error);
    throw error;
  }
}

/**
 * Get list items with optional select and filter
 *
 * @param sp - SPFI instance
 * @param listId - List GUID
 * @param select - Fields to select (optional)
 * @param filter - OData filter (optional)
 * @param top - Number of items to return (optional, default: 100)
 * @returns Promise with array of items
 *
 * @example
 * ```typescript
 * const items = await getListItems(sp, 'abc123...', ['Title', 'Created'], 'Status eq "Active"');
 * ```
 */
export async function getListItems(
  sp: SPFI,
  listId: string,
  select?: string[],
  filter?: string,
  top: number = 100
): Promise<IItemData[]> {
  try {
    logger.verbose(`Fetching items from list: ${listId}`, LOG_SOURCE, { select, filter, top });

    let query = sp.web.lists.getById(listId).items.top(top);

    if (select && select.length > 0) {
      query = query.select(...select);
    }

    if (filter) {
      query = query.filter(filter);
    }

    const items = await query();

    logger.info(`Fetched ${items.length} items from list`, LOG_SOURCE);
    return items as IItemData[];
  } catch (error) {
    logger.error(`Failed to fetch items from list: ${listId}`, LOG_SOURCE, error);
    throw error;
  }
}

/**
 * Get a single list item by ID
 *
 * @param sp - SPFI instance
 * @param listId - List GUID
 * @param itemId - Item ID
 * @param select - Fields to select (optional)
 * @returns Promise with item data
 *
 * @example
 * ```typescript
 * const item = await getListItemById(sp, 'abc123...', 1, ['Title', 'Author']);
 * ```
 */
export async function getListItemById(
  sp: SPFI,
  listId: string,
  itemId: number,
  select?: string[]
): Promise<IItemData> {
  try {
    logger.verbose(`Fetching item ${itemId} from list: ${listId}`, LOG_SOURCE);

    let query = sp.web.lists.getById(listId).items.getById(itemId);

    if (select && select.length > 0) {
      query = query.select(...select);
    }

    const item = await query();

    logger.info(`Fetched item ${itemId}`, LOG_SOURCE);
    return item as IItemData;
  } catch (error) {
    logger.error(`Failed to fetch item ${itemId} from list: ${listId}`, LOG_SOURCE, error);
    throw error;
  }
}

/**
 * Get list fields/columns
 *
 * @param sp - SPFI instance
 * @param listId - List GUID
 * @param includeHidden - Include hidden fields (default: false)
 * @returns Promise with array of field information
 *
 * @example
 * ```typescript
 * const fields = await getListFields(sp, 'abc123...');
 * console.log(fields.map(f => f.Title));
 * ```
 */
export async function getListFields(
  sp: SPFI,
  listId: string,
  includeHidden: boolean = false
): Promise<IFieldInfo[]> {
  try {
    logger.verbose(`Fetching fields from list: ${listId}`, LOG_SOURCE);

    let query = sp.web.lists.getById(listId).fields;

    if (!includeHidden) {
      query = query.filter('Hidden eq false and ReadOnlyField eq false');
    }

    const fields = await query();

    logger.info(`Fetched ${fields.length} fields from list`, LOG_SOURCE);
    return fields;
  } catch (error) {
    logger.error(`Failed to fetch fields from list: ${listId}`, LOG_SOURCE, error);
    throw error;
  }
}

/**
 * Create a new list item
 *
 * @param sp - SPFI instance
 * @param listId - List GUID
 * @param itemData - Item data to create
 * @returns Promise with created item data
 *
 * @example
 * ```typescript
 * const newItem = await createListItem(sp, 'abc123...', { Title: 'New Item' });
 * ```
 */
export async function createListItem(sp: SPFI, listId: string, itemData: any): Promise<IItemData> {
  try {
    logger.verbose(`Creating item in list: ${listId}`, LOG_SOURCE, itemData);

    const result = await sp.web.lists.getById(listId).items.add(itemData);

    logger.info(`Created item ${result.data.Id} in list`, LOG_SOURCE);
    return result.data as IItemData;
  } catch (error) {
    logger.error(`Failed to create item in list: ${listId}`, LOG_SOURCE, error);
    throw error;
  }
}

/**
 * Update a list item
 *
 * @param sp - SPFI instance
 * @param listId - List GUID
 * @param itemId - Item ID
 * @param itemData - Item data to update
 * @returns Promise with updated item data
 *
 * @example
 * ```typescript
 * await updateListItem(sp, 'abc123...', 1, { Title: 'Updated Title' });
 * ```
 */
export async function updateListItem(
  sp: SPFI,
  listId: string,
  itemId: number,
  itemData: any
): Promise<IItemData> {
  try {
    logger.verbose(`Updating item ${itemId} in list: ${listId}`, LOG_SOURCE, itemData);

    const result = await sp.web.lists.getById(listId).items.getById(itemId).update(itemData);

    logger.info(`Updated item ${itemId} in list`, LOG_SOURCE);
    return result.item as any as IItemData;
  } catch (error) {
    logger.error(`Failed to update item ${itemId} in list: ${listId}`, LOG_SOURCE, error);
    throw error;
  }
}

/**
 * Delete a list item
 *
 * @param sp - SPFI instance
 * @param listId - List GUID
 * @param itemId - Item ID
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await deleteListItem(sp, 'abc123...', 1);
 * ```
 */
export async function deleteListItem(sp: SPFI, listId: string, itemId: number): Promise<void> {
  try {
    logger.verbose(`Deleting item ${itemId} from list: ${listId}`, LOG_SOURCE);

    await sp.web.lists.getById(listId).items.getById(itemId).delete();

    logger.info(`Deleted item ${itemId} from list`, LOG_SOURCE);
  } catch (error) {
    logger.error(`Failed to delete item ${itemId} from list: ${listId}`, LOG_SOURCE, error);
    throw error;
  }
}

/**
 * Get current site URL
 *
 * @param pageContext - Page context from SPFx
 * @returns Site absolute URL
 *
 * @example
 * ```typescript
 * const siteUrl = getCurrentSiteUrl(this.context.pageContext);
 * ```
 */
export function getCurrentSiteUrl(pageContext: any): string {
  try {
    return pageContext.web.absoluteUrl;
  } catch (error) {
    logger.warning('Failed to get current site URL', LOG_SOURCE, error);
    return '';
  }
}

/**
 * Get current user information
 *
 * @param pageContext - Page context from SPFx
 * @returns User information object
 *
 * @example
 * ```typescript
 * const user = getCurrentUser(this.context.pageContext);
 * console.log(user.displayName, user.email);
 * ```
 */
export function getCurrentUser(pageContext: any): {
  displayName: string;
  email: string;
  loginName: string;
} {
  try {
    return {
      displayName: pageContext.user.displayName,
      email: pageContext.user.email,
      loginName: pageContext.user.loginName,
    };
  } catch (error) {
    logger.warning('Failed to get current user', LOG_SOURCE, error);
    return {
      displayName: '',
      email: '',
      loginName: '',
    };
  }
}

/**
 * Check if user has specific permission
 *
 * @param sp - SPFI instance
 * @param listId - List GUID (optional, checks site permissions if not provided)
 * @param permissionKind - Permission kind number
 * @returns Promise with boolean indicating if user has permission
 *
 * @example
 * ```typescript
 * const canEdit = await checkUserPermission(sp, 'abc123...', 2); // 2 = EditListItems
 * ```
 */
export async function checkUserPermission(
  sp: SPFI,
  listId: string | undefined,
  permissionKind: number
): Promise<boolean> {
  try {
    logger.verbose('Checking user permission', LOG_SOURCE, { listId, permissionKind });

    let permissions;
    if (listId) {
      permissions = await sp.web.lists.getById(listId).currentUserHasPermissions(permissionKind);
    } else {
      permissions = await sp.web.currentUserHasPermissions(permissionKind);
    }

    logger.info(`User permission check result: ${permissions}`, LOG_SOURCE);
    return permissions;
  } catch (error) {
    logger.error('Failed to check user permission', LOG_SOURCE, error);
    return false;
  }
}

export default {
  getSiteLists,
  getListById,
  getListItems,
  getListItemById,
  getListFields,
  createListItem,
  updateListItem,
  deleteListItem,
  getCurrentSiteUrl,
  getCurrentUser,
  checkUserPermission,
};
