// Category Navigation Component

import * as React from 'react';
import { useMemo } from 'react';
import { Icon, Checkbox, Spinner, SpinnerSize } from '@fluentui/react';
import { SchemaCategory, ICategoryInfo } from '../types/SchemaTypes';

// Category definitions with icons and colors
export const CATEGORIES: ICategoryInfo[] = [
  {
    id: 'siteSettings',
    title: 'Site Settings',
    description: 'General settings, regional settings, and features',
    icon: 'Settings',
    color: '#0078d4',
  },
  {
    id: 'siteColumns',
    title: 'Site Columns',
    description: 'Reusable field definitions',
    icon: 'ColumnOptions',
    color: '#107c10',
  },
  {
    id: 'contentTypes',
    title: 'Content Types',
    description: 'Content type definitions and field links',
    icon: 'PageData',
    color: '#8764b8',
  },
  {
    id: 'lists',
    title: 'Lists & Libraries',
    description: 'List definitions, fields, views, and settings',
    icon: 'BulletedList2',
    color: '#ff8c00',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Groups and permission levels',
    icon: 'Shield',
    color: '#e74856',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Top navigation and quick launch',
    icon: 'Nav2DMapView',
    color: '#00bcf2',
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Theme and look settings',
    icon: 'Color',
    color: '#c239b3',
  },
  {
    id: 'taxonomy',
    title: 'Taxonomy',
    description: 'Term sets and managed metadata',
    icon: 'Tag',
    color: '#008272',
  },
];

export interface ICategoryNavProps {
  selectedCategories: SchemaCategory[];
  onCategoryToggle: (category: SchemaCategory) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  loadingCategories: SchemaCategory[];
  itemCounts: Record<SchemaCategory, number>;
  selectedCounts: Record<SchemaCategory, number>;
}

export const CategoryNav: React.FC<ICategoryNavProps> = ({
  selectedCategories,
  onCategoryToggle,
  onSelectAll,
  onClearAll,
  loadingCategories,
  itemCounts,
  selectedCounts,
}) => {
  const allSelected = useMemo(() => {
    return CATEGORIES.every(cat => selectedCategories.includes(cat.id));
  }, [selectedCategories]);

  return (
    <div
      style={{
        width: '280px',
        borderRight: '1px solid #edebe9',
        background: '#faf9f8',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #edebe9',
          background: '#fff',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          Categories
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onSelectAll}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #edebe9',
              borderRadius: '4px',
              background: allSelected ? '#0078d4' : '#fff',
              color: allSelected ? '#fff' : '#323130',
              cursor: 'pointer',
            }}
          >
            Select All
          </button>
          <button
            onClick={onClearAll}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #edebe9',
              borderRadius: '4px',
              background: '#fff',
              color: '#323130',
              cursor: 'pointer',
            }}
            disabled={selectedCategories.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Category List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {CATEGORIES.map(category => {
          const isSelected = selectedCategories.includes(category.id);
          const isLoading = loadingCategories.includes(category.id);
          const count = itemCounts[category.id] || 0;
          const selectedCount = selectedCounts[category.id] || 0;

          return (
            <div
              key={category.id}
              onClick={() => onCategoryToggle(category.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                marginBottom: '4px',
                background: isSelected ? '#fff' : 'transparent',
                border: isSelected ? `1px solid ${category.color}40` : '1px solid transparent',
                borderLeft: isSelected ? `3px solid ${category.color}` : '3px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => onCategoryToggle(category.id)}
                styles={{
                  checkbox: {
                    borderColor: category.color,
                  },
                }}
              />

              <div
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${category.color}15`,
                  borderRadius: '6px',
                  flexShrink: 0,
                }}
              >
                {isLoading ? (
                  <Spinner size={SpinnerSize.small} />
                ) : (
                  <Icon
                    iconName={category.icon}
                    styles={{
                      root: {
                        fontSize: '18px',
                        color: category.color,
                      },
                    }}
                  />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#323130',
                    marginBottom: '2px',
                  }}
                >
                  {category.title}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#605e5c',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {category.description}
                </div>
              </div>

              {/* Count badge */}
              {count > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: '#605e5c' }}>{count}</span>
                  {selectedCount > 0 && (
                    <span style={{ color: category.color, fontWeight: 600 }}>
                      {selectedCount} sel
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #edebe9',
          background: '#fff',
          fontSize: '11px',
          color: '#605e5c',
        }}
      >
        <Icon iconName="Info" style={{ marginRight: '6px' }} />
        Select categories to include in export
      </div>
    </div>
  );
};
