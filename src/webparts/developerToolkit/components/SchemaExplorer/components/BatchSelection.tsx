// Batch Selection Component - Select items by pattern or criteria

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  DefaultButton,
  PrimaryButton,
  Dropdown,
  IDropdownOption,
  TextField,
  Checkbox,
  MessageBar,
  MessageBarType,
  Icon,
} from '@fluentui/react';
import {
  SchemaCategory,
  ISiteColumnSchema,
  IContentTypeSchema,
  IListSchema,
} from '../types/SchemaTypes';

export interface IBatchSelectionProps {
  activeCategory: SchemaCategory;
  items: (ISiteColumnSchema | IContentTypeSchema | IListSchema)[];
  selectedItems: Set<string>;
  onSelectionChange: (selectedIds: string[]) => void;
  onClose: () => void;
}

type SelectionCriteria =
  | 'fieldType'
  | 'group'
  | 'required'
  | 'indexed'
  | 'customFormat'
  | 'pattern'
  | 'baseTemplate';

interface ICriteriaOption {
  key: SelectionCriteria;
  text: string;
  description: string;
  categories: SchemaCategory[];
}

const CRITERIA_OPTIONS: ICriteriaOption[] = [
  {
    key: 'fieldType',
    text: 'Field Type',
    description: 'Select by field type (Text, Number, Choice, etc.)',
    categories: ['siteColumns'],
  },
  {
    key: 'group',
    text: 'Group',
    description: 'Select by group name',
    categories: ['siteColumns', 'contentTypes'],
  },
  {
    key: 'required',
    text: 'Required Fields',
    description: 'Select all required fields',
    categories: ['siteColumns'],
  },
  {
    key: 'indexed',
    text: 'Indexed Fields',
    description: 'Select all indexed fields',
    categories: ['siteColumns'],
  },
  {
    key: 'customFormat',
    text: 'Custom Formatting',
    description: 'Select fields with column formatting',
    categories: ['lists'],
  },
  {
    key: 'pattern',
    text: 'Name Pattern',
    description: 'Select by name pattern (regex)',
    categories: ['siteColumns', 'contentTypes', 'lists'],
  },
  {
    key: 'baseTemplate',
    text: 'List/Library Type',
    description: 'Select by base template',
    categories: ['lists'],
  },
];

export const BatchSelection: React.FC<IBatchSelectionProps> = ({
  activeCategory,
  items,
  selectedItems,
  onSelectionChange,
  onClose,
}) => {
  const [criteria, setCriteria] = useState<SelectionCriteria | ''>('');
  const [criteriaValue, setCriteriaValue] = useState<string>('');
  const [previewIds, setPreviewIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<'add' | 'remove' | 'replace'>('add');

  // Get available criteria for current category
  const availableCriteria = useMemo(() => {
    return CRITERIA_OPTIONS.filter(opt =>
      opt.categories.includes(activeCategory)
    );
  }, [activeCategory]);

  // Get values for dropdown-based criteria
  const criteriaValues = useMemo((): IDropdownOption[] => {
    if (!criteria) return [];

    switch (criteria) {
      case 'fieldType': {
        const types = new Set<string>();
        items.forEach(item => {
          if ('fieldType' in item) {
            types.add((item as ISiteColumnSchema).fieldType);
          }
        });
        return Array.from(types).sort().map(t => ({ key: t, text: t }));
      }
      case 'group': {
        const groups = new Set<string>();
        items.forEach(item => {
          if ('group' in item && (item as any).group) {
            groups.add((item as any).group);
          }
        });
        return Array.from(groups).sort().map(g => ({ key: g, text: g }));
      }
      case 'baseTemplate': {
        const templates: Record<number, string> = {
          100: 'Generic List',
          101: 'Document Library',
          102: 'Survey',
          103: 'Links',
          104: 'Announcements',
          105: 'Contacts',
          106: 'Events (Calendar)',
          107: 'Tasks',
          108: 'Discussion Board',
          109: 'Picture Library',
          119: 'Wiki Page Library',
          120: 'Custom List in Datasheet View',
          140: 'Workflow History',
          150: 'Project Tasks',
          170: 'Promoted Links',
          175: 'Asset Library',
          851: 'Site Pages',
        };
        const usedTemplates = new Set<number>();
        items.forEach(item => {
          if ('baseTemplate' in item) {
            usedTemplates.add((item as IListSchema).baseTemplate);
          }
        });
        return Array.from(usedTemplates)
          .sort((a, b) => a - b)
          .map(t => ({
            key: t.toString(),
            text: templates[t] || `Template ${t}`,
          }));
      }
      default:
        return [];
    }
  }, [criteria, items]);

  // Preview selection based on criteria
  const handlePreview = useCallback(() => {
    let matchingIds: string[] = [];

    switch (criteria) {
      case 'fieldType':
        matchingIds = items
          .filter(item => 'fieldType' in item && (item as ISiteColumnSchema).fieldType === criteriaValue)
          .map(item => item.id);
        break;

      case 'group':
        matchingIds = items
          .filter(item => 'group' in item && (item as any).group === criteriaValue)
          .map(item => item.id);
        break;

      case 'required':
        matchingIds = items
          .filter(item => 'required' in item && (item as ISiteColumnSchema).required)
          .map(item => item.id);
        break;

      case 'indexed':
        matchingIds = items
          .filter(item => 'indexed' in item && (item as ISiteColumnSchema).indexed)
          .map(item => item.id);
        break;

      case 'customFormat':
        matchingIds = items
          .filter(item => {
            if ('fields' in item) {
              const list = item as IListSchema;
              return list.fields.some(f => f.customFormatter);
            }
            return false;
          })
          .map(item => item.id);
        break;

      case 'pattern':
        if (criteriaValue) {
          try {
            const regex = new RegExp(criteriaValue, 'i');
            matchingIds = items
              .filter(item =>
                regex.test(item.title) ||
                (item.internalName && regex.test(item.internalName))
              )
              .map(item => item.id);
          } catch {
            // Invalid regex
            matchingIds = [];
          }
        }
        break;

      case 'baseTemplate':
        matchingIds = items
          .filter(item =>
            'baseTemplate' in item &&
            (item as IListSchema).baseTemplate.toString() === criteriaValue
          )
          .map(item => item.id);
        break;
    }

    setPreviewIds(matchingIds);
  }, [criteria, criteriaValue, items]);

  // Apply selection
  const handleApply = useCallback(() => {
    let newSelection: string[];

    switch (selectionMode) {
      case 'add':
        newSelection = Array.from(new Set([...Array.from(selectedItems), ...previewIds]));
        break;
      case 'remove':
        newSelection = Array.from(selectedItems).filter(id => !previewIds.includes(id));
        break;
      case 'replace':
        newSelection = previewIds;
        break;
      default:
        newSelection = Array.from(selectedItems);
    }

    onSelectionChange(newSelection);
    onClose();
  }, [selectionMode, selectedItems, previewIds, onSelectionChange, onClose]);

  // Criteria dropdown options
  const criteriaOptions: IDropdownOption[] = availableCriteria.map(c => ({
    key: c.key,
    text: c.text,
  }));

  // Get selected criteria description
  const selectedCriteriaInfo = availableCriteria.find(c => c.key === criteria);

  // Check if criteria needs a value selector
  const needsValueSelector = ['fieldType', 'group', 'baseTemplate'].includes(criteria);
  const needsTextInput = criteria === 'pattern';
  const isToggleCriteria = ['required', 'indexed', 'customFormat'].includes(criteria);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '95%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              <Icon iconName="MultiSelect" style={{ marginRight: '8px' }} />
              Batch Selection
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              Select multiple items by criteria or pattern
            </p>
          </div>
          <DefaultButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClose}
            styles={{ root: { minWidth: 'auto' } }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* Criteria selector */}
          <div style={{ marginBottom: '16px' }}>
            <Dropdown
              label="Selection Criteria"
              placeholder="Select criteria..."
              selectedKey={criteria}
              options={criteriaOptions}
              onChange={(_, opt) => {
                setCriteria((opt?.key as SelectionCriteria) || '');
                setCriteriaValue('');
                setPreviewIds([]);
              }}
            />
            {selectedCriteriaInfo && (
              <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '4px' }}>
                {selectedCriteriaInfo.description}
              </div>
            )}
          </div>

          {/* Value selector */}
          {needsValueSelector && (
            <div style={{ marginBottom: '16px' }}>
              <Dropdown
                label="Value"
                placeholder="Select value..."
                selectedKey={criteriaValue}
                options={criteriaValues}
                onChange={(_, opt) => setCriteriaValue(opt?.key as string || '')}
              />
            </div>
          )}

          {/* Pattern input */}
          {needsTextInput && (
            <div style={{ marginBottom: '16px' }}>
              <TextField
                label="Pattern (Regex)"
                placeholder="e.g., ^My.* or .*Date$"
                value={criteriaValue}
                onChange={(_, v) => setCriteriaValue(v || '')}
                description="Case-insensitive regular expression"
              />
            </div>
          )}

          {/* Preview button */}
          {(criteria && (isToggleCriteria || criteriaValue)) && (
            <div style={{ marginBottom: '16px' }}>
              <PrimaryButton
                text="Preview Matches"
                iconProps={{ iconName: 'Search' }}
                onClick={handlePreview}
              />
            </div>
          )}

          {/* Preview results */}
          {previewIds.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <MessageBar messageBarType={MessageBarType.success}>
                Found {previewIds.length} matching item(s)
              </MessageBar>
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#f3f2f1',
                  borderRadius: '4px',
                  maxHeight: '150px',
                  overflow: 'auto',
                }}
              >
                {previewIds.map(id => {
                  const item = items.find(i => i.id === id);
                  return item ? (
                    <div
                      key={id}
                      style={{
                        padding: '4px 8px',
                        marginBottom: '4px',
                        background: '#fff',
                        borderRadius: '3px',
                        fontSize: '12px',
                      }}
                    >
                      {item.title}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Selection mode */}
          {previewIds.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 500, marginBottom: '8px' }}>Selection Mode</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Checkbox
                  label={`Add to selection (${selectedItems.size} currently selected)`}
                  checked={selectionMode === 'add'}
                  onChange={() => setSelectionMode('add')}
                />
                <Checkbox
                  label="Remove from selection"
                  checked={selectionMode === 'remove'}
                  onChange={() => setSelectionMode('remove')}
                />
                <Checkbox
                  label="Replace selection"
                  checked={selectionMode === 'replace'}
                  onChange={() => setSelectionMode('replace')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <DefaultButton text="Cancel" onClick={onClose} />
          <PrimaryButton
            text="Apply Selection"
            onClick={handleApply}
            disabled={previewIds.length === 0}
          />
        </div>
      </div>
    </div>
  );
};
