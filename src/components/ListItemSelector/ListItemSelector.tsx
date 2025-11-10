import * as React from 'react';
import { Stack, Label } from '@fluentui/react';
import { ListPicker, ListItemPicker } from '@pnp/spfx-controls-react';
import { SPACING } from '../../utils/constants';
import { useListItemSelector } from '../../utils/hooks';
import { logger } from '../../utils/logger';
import styles from './ListItemSelector.module.scss';

/**
 * Props for ListItemSelector component
 */
export interface IListItemSelectorProps {
  /** SPFx context */
  context: any;
  /** Label for list picker */
  listLabel?: string;
  /** Label for item picker */
  itemLabel?: string;
  /** Callback when list is selected */
  onListSelected?: (listId: string | undefined) => void;
  /** Callback when item is selected */
  onItemSelected?: (itemId: number | undefined) => void;
  /** Whether item picker is enabled */
  enableItemPicker?: boolean;
  /** Initial list ID */
  initialListId?: string;
  /** Initial item ID */
  initialItemId?: number;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Filter for lists (optional) */
  listFilter?: string;
  /** Number of items to display in item picker */
  itemLimit?: number;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Reusable list and item selector component
 * Combines ListPicker and ListItemPicker with consistent state management
 *
 * Features:
 * - Integrated list and item selection
 * - Automatic state management with useListItemSelector hook
 * - Callbacks for parent components
 * - Consistent styling and layout
 * - Error handling and logging
 *
 * @example
 * ```tsx
 * <ListItemSelector
 *   context={context}
 *   listLabel="Select a Library"
 *   itemLabel="Select a Document"
 *   enableItemPicker={true}
 *   onListSelected={(listId) => console.log('List:', listId)}
 *   onItemSelected={(itemId) => console.log('Item:', itemId)}
 * />
 * ```
 */
export const ListItemSelector: React.FC<IListItemSelectorProps> = ({
  context,
  listLabel = 'Select a List',
  itemLabel = 'Select an Item',
  onListSelected,
  onItemSelected,
  enableItemPicker = true,
  initialListId,
  initialItemId,
  showLabels = true,
  listFilter,
  itemLimit = 100,
  className = '',
}) => {
  const {
    selectedListId,
    handleListChange,
    handleItemChange,
  } = useListItemSelector(initialListId, initialItemId);

  /**
   * Handle list selection
   */
  const onListChange = React.useCallback((lists: any[]) => {
    handleListChange(lists);

    const listId = lists && lists.length > 0 ? (lists[0].id || lists[0].Id || lists[0].ID) : undefined;

    if (onListSelected) {
      onListSelected(listId);
    }

    logger.verbose('List selected in ListItemSelector', 'ListItemSelector', { listId });
  }, [handleListChange, onListSelected]);

  /**
   * Handle item selection
   */
  const onItemChange = React.useCallback((items: any[]) => {
    handleItemChange(items);

    const itemId = items && items.length > 0 ? (items[0].id || items[0].Id || items[0].ID) : undefined;

    if (onItemSelected) {
      onItemSelected(itemId);
    }

    logger.verbose('Item selected in ListItemSelector', 'ListItemSelector', { itemId });
  }, [handleItemChange, onItemSelected]);

  return (
    <div className={`${styles.listItemSelector} ${className}`}>
      <Stack tokens={{ childrenGap: SPACING.lg }}>
        {/* List Picker */}
        <div className={styles.pickerContainer}>
          {showLabels && <Label required>{listLabel}</Label>}
          <ListPicker
            context={context.context || context}
            placeholder={listLabel}
            onSelectionChanged={onListChange}
            filter={listFilter}
            disabled={false}
          />
        </div>

        {/* Item Picker */}
        {enableItemPicker && selectedListId && (
          <div className={styles.pickerContainer}>
            {showLabels && <Label required>{itemLabel}</Label>}
            <ListItemPicker
              listId={selectedListId}
              columnInternalName="Title"
              context={context.context || context}
              placeholder={itemLabel}
              onSelectedItem={onItemChange}
              itemLimit={itemLimit}
              disabled={false}
            />
          </div>
        )}
      </Stack>
    </div>
  );
};

/**
 * Compact version with horizontal layout
 */
export const ListItemSelectorCompact: React.FC<IListItemSelectorProps> = (props) => {
  return (
    <div className={styles.compactSelector}>
      <Stack horizontal tokens={{ childrenGap: SPACING.lg }} wrap>
        <Stack.Item grow>
          <ListItemSelector {...props} />
        </Stack.Item>
      </Stack>
    </div>
  );
};

export default ListItemSelector;
