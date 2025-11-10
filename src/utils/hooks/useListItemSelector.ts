import * as React from 'react';
import { logger } from '../logger';

/**
 * Hook for managing list and item selection state
 * Centralized pattern used across multiple demos (DocumentLink, ManageAccess, VersionHistory, SPDynamicForm, SPFields)
 *
 * @param initialListId - Optional initial list ID
 * @param initialItemId - Optional initial item ID
 * @returns Object with list/item state and handlers
 *
 * @example
 * ```typescript
 * const {
 *   selectedListId,
 *   selectedItemId,
 *   handleListChange,
 *   handleItemChange,
 *   resetSelection
 * } = useListItemSelector();
 *
 * <ListPicker onSelectionChanged={handleListChange} />
 * <ListItemPicker listId={selectedListId} onSelectedItem={handleItemChange} />
 * ```
 */
export function useListItemSelector(
  initialListId?: string,
  initialItemId?: number
) {
  const [selectedListId, setSelectedListId] = React.useState<string | undefined>(initialListId);
  const [selectedItemId, setSelectedItemId] = React.useState<number | undefined>(initialItemId);

  /**
   * Handle list selection change
   * Automatically clears item selection when list changes
   */
  const handleListChange = React.useCallback((lists: any[]) => {
    try {
      if (lists && lists.length > 0) {
        const listId = lists[0].id || lists[0].Id || lists[0].ID;
        logger.verbose('List selected', 'useListItemSelector', { listId });
        setSelectedListId(listId);
        setSelectedItemId(undefined); // Reset item when list changes
      } else {
        setSelectedListId(undefined);
        setSelectedItemId(undefined);
      }
    } catch (error) {
      logger.error('Error handling list change', 'useListItemSelector', error);
    }
  }, []);

  /**
   * Handle item selection change
   */
  const handleItemChange = React.useCallback((items: any[]) => {
    try {
      if (items && items.length > 0) {
        const itemId = items[0].id || items[0].Id || items[0].ID;
        logger.verbose('Item selected', 'useListItemSelector', { itemId });
        setSelectedItemId(itemId);
      } else {
        setSelectedItemId(undefined);
      }
    } catch (error) {
      logger.error('Error handling item change', 'useListItemSelector', error);
    }
  }, []);

  /**
   * Reset both list and item selection
   */
  const resetSelection = React.useCallback(() => {
    logger.verbose('Resetting selection', 'useListItemSelector');
    setSelectedListId(undefined);
    setSelectedItemId(undefined);
  }, []);

  /**
   * Set list ID programmatically
   */
  const setListId = React.useCallback((listId: string | undefined) => {
    setSelectedListId(listId);
    setSelectedItemId(undefined); // Reset item when list changes
  }, []);

  /**
   * Set item ID programmatically
   */
  const setItemId = React.useCallback((itemId: number | undefined) => {
    setSelectedItemId(itemId);
  }, []);

  return {
    selectedListId,
    selectedItemId,
    handleListChange,
    handleItemChange,
    resetSelection,
    setListId,
    setItemId,
  };
}

export default useListItemSelector;
