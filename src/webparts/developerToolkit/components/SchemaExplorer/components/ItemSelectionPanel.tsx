// Item Selection Panel Component

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  SearchBox,
  Checkbox,
  Icon,
  Spinner,
  SpinnerSize,
  Dropdown,
  IDropdownOption,
  DefaultButton,
  TooltipHost,
  MessageBar,
  MessageBarType,
} from '@fluentui/react';
import {
  SchemaCategory,
  SchemaItem,
  ISiteColumnSchema,
  IContentTypeSchema,
  IListSchema,
  IGroupSchema,
  IPermissionLevelSchema,
} from '../types/SchemaTypes';
import { CATEGORIES } from './CategoryNav';

export interface IItemSelectionPanelProps {
  activeCategory: SchemaCategory | null;
  items: SchemaItem[];
  selectedItems: Set<string>;
  onItemToggle: (itemId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSelectDependencies: (itemId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const ItemSelectionPanel: React.FC<IItemSelectionPanelProps> = ({
  activeCategory,
  items,
  selectedItems,
  onItemToggle,
  onSelectAll,
  onClearAll,
  onSelectDependencies,
  isLoading,
  error,
}) => {
  const [searchText, setSearchText] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Get category info
  const categoryInfo = useMemo(() => {
    return CATEGORIES.find(c => c.id === activeCategory);
  }, [activeCategory]);

  // Get unique groups for filtering (site columns, content types)
  const groups = useMemo(() => {
    const groupSet = new Set<string>();
    items.forEach(item => {
      if ('group' in item && (item as any).group) {
        groupSet.add((item as any).group);
      }
    });
    return Array.from(groupSet).sort();
  }, [items]);

  // Get unique types for filtering (site columns)
  const fieldTypes = useMemo(() => {
    const typeSet = new Set<string>();
    items.forEach(item => {
      if ('fieldType' in item && (item as any).fieldType) {
        typeSet.add((item as any).fieldType);
      }
    });
    return Array.from(typeSet).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(search);
        const matchesName = item.internalName?.toLowerCase().includes(search);
        const matchesDescription = item.description?.toLowerCase().includes(search);
        if (!matchesTitle && !matchesName && !matchesDescription) {
          return false;
        }
      }

      // Group filter
      if (groupFilter && 'group' in item) {
        if ((item as any).group !== groupFilter) {
          return false;
        }
      }

      // Type filter
      if (typeFilter && 'fieldType' in item) {
        if ((item as any).fieldType !== typeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchText, groupFilter, typeFilter]);

  // Group options for dropdown
  const groupOptions: IDropdownOption[] = useMemo(() => {
    return [
      { key: '', text: 'All Groups' },
      ...groups.map(g => ({ key: g, text: g })),
    ];
  }, [groups]);

  // Type options for dropdown
  const typeOptions: IDropdownOption[] = useMemo(() => {
    return [
      { key: '', text: 'All Types' },
      ...fieldTypes.map(t => ({ key: t, text: t })),
    ];
  }, [fieldTypes]);

  // Render category-specific details - defined before renderItem to avoid ESLint error
  const renderItemDetails = (item: SchemaItem): JSX.Element | null => {
    switch (item.category) {
      case 'siteColumns': {
        const col = item as ISiteColumnSchema;
        return (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e1dfdd', borderRadius: '3px', color: '#323130' }}>
              {col.fieldType}
            </span>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#f3f2f1', borderRadius: '3px', color: '#605e5c' }}>
              {col.group}
            </span>
            {col.required && (
              <span style={{ fontSize: '10px', padding: '2px 6px', background: '#fde7e9', borderRadius: '3px', color: '#a80000' }}>
                Required
              </span>
            )}
            {col.indexed && (
              <span style={{ fontSize: '10px', padding: '2px 6px', background: '#dff6dd', borderRadius: '3px', color: '#107c10' }}>
                Indexed
              </span>
            )}
          </div>
        );
      }
      case 'contentTypes': {
        const ct = item as IContentTypeSchema;
        return (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#f3f2f1', borderRadius: '3px', color: '#605e5c' }}>
              {ct.group}
            </span>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e1dfdd', borderRadius: '3px', color: '#323130' }}>
              {ct.fieldLinks.length} fields
            </span>
            {ct.sealed && (
              <span style={{ fontSize: '10px', padding: '2px 6px', background: '#fff4ce', borderRadius: '3px', color: '#797673' }}>
                Sealed
              </span>
            )}
          </div>
        );
      }
      case 'lists': {
        const list = item as IListSchema;
        return (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e1dfdd', borderRadius: '3px', color: '#323130' }}>
              {list.baseTemplate === 101 ? 'Library' : 'List'}
            </span>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#f3f2f1', borderRadius: '3px', color: '#605e5c' }}>
              {list.fields.length} fields
            </span>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#f3f2f1', borderRadius: '3px', color: '#605e5c' }}>
              {list.views.length} views
            </span>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#dff6dd', borderRadius: '3px', color: '#107c10' }}>
              {list.itemCount} items
            </span>
          </div>
        );
      }
      case 'security': {
        if ('groupType' in item) {
          const group = item as IGroupSchema;
          return (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', padding: '2px 6px', background: group.groupType === 'custom' ? '#e1dfdd' : '#dff6dd', borderRadius: '3px', color: group.groupType === 'custom' ? '#323130' : '#107c10' }}>
                {group.groupType.charAt(0).toUpperCase() + group.groupType.slice(1)}
              </span>
            </div>
          );
        } else if ('permissionType' in item) {
          const perm = item as IPermissionLevelSchema;
          return (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', padding: '2px 6px', background: perm.isCustom ? '#fff4ce' : '#e1dfdd', borderRadius: '3px', color: '#323130' }}>
                {perm.isCustom ? 'Custom' : 'Built-in'}
              </span>
            </div>
          );
        }
        return null;
      }
      default:
        return null;
    }
  };

  // Render item based on category
  const renderItem = useCallback((item: SchemaItem) => {
    const isSelected = selectedItems.has(item.id);

    return (
      <div
        key={item.id}
        onClick={() => onItemToggle(item.id)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '10px 12px',
          background: isSelected ? '#f0f6ff' : '#fff',
          border: isSelected ? '1px solid #0078d4' : '1px solid #edebe9',
          borderRadius: '4px',
          marginBottom: '6px',
          cursor: 'pointer',
          transition: 'all 0.1s ease',
        }}
      >
        <Checkbox
          checked={isSelected}
          onChange={() => onItemToggle(item.id)}
          styles={{ root: { marginTop: '2px' } }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#323130' }}>
              {item.title}
            </span>
            {item.internalName && item.internalName !== item.title && (
              <span style={{ fontSize: '11px', color: '#605e5c', fontFamily: 'monospace' }}>
                [{item.internalName}]
              </span>
            )}
          </div>

          {/* Category-specific info */}
          {renderItemDetails(item)}

          {item.description && (
            <div
              style={{
                fontSize: '11px',
                color: '#605e5c',
                marginTop: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.description}
            </div>
          )}
        </div>

        {/* Dependencies button for content types */}
        {item.category === 'contentTypes' && (
          <TooltipHost content="Select all required site columns">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectDependencies(item.id);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                border: '1px solid #edebe9',
                borderRadius: '4px',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              + Deps
            </button>
          </TooltipHost>
        )}
      </div>
    );
  }, [selectedItems, onItemToggle, onSelectDependencies, renderItemDetails]);

  // Empty state
  if (!activeCategory) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf9f8',
          color: '#605e5c',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Icon iconName="ViewList" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
          <div style={{ fontSize: '14px' }}>Select a category to view items</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRight: '1px solid #edebe9',
        minWidth: '350px',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #edebe9',
          background: '#faf9f8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {categoryInfo && (
            <div
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${categoryInfo.color}15`,
                borderRadius: '6px',
              }}
            >
              <Icon
                iconName={categoryInfo.icon}
                styles={{ root: { fontSize: '16px', color: categoryInfo.color } }}
              />
            </div>
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
              {categoryInfo?.title}
            </h3>
            <div style={{ fontSize: '11px', color: '#605e5c' }}>
              {filteredItems.length} of {items.length} items
              {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <SearchBox
          placeholder="Search..."
          value={searchText}
          onChange={(_, value) => setSearchText(value || '')}
          styles={{ root: { marginBottom: '8px' } }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {groups.length > 1 && (
            <Dropdown
              placeholder="Filter by group"
              options={groupOptions}
              selectedKey={groupFilter}
              onChange={(_, option) => setGroupFilter(option?.key as string || '')}
              styles={{ root: { width: '150px' } }}
            />
          )}
          {fieldTypes.length > 1 && (
            <Dropdown
              placeholder="Filter by type"
              options={typeOptions}
              selectedKey={typeFilter}
              onChange={(_, option) => setTypeFilter(option?.key as string || '')}
              styles={{ root: { width: '120px' } }}
            />
          )}
          <DefaultButton
            text="Select All"
            onClick={onSelectAll}
            styles={{ root: { padding: '0 12px' } }}
          />
          <DefaultButton
            text="Clear"
            onClick={onClearAll}
            disabled={selectedItems.size === 0}
            styles={{ root: { padding: '0 12px' } }}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>
          {error}
        </MessageBar>
      )}

      {/* Items list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner size={SpinnerSize.large} label="Loading items..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#605e5c' }}>
            {items.length === 0 ? 'No items found in this category' : 'No items match your filters'}
          </div>
        ) : (
          filteredItems.map(item => renderItem(item))
        )}
      </div>
    </div>
  );
};
