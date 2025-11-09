// src/webparts/showcase/components/CamlQueryBuilder/components/AdvancedOptions.tsx

import * as React from 'react';
import { useCallback } from 'react';
import {
  TextField,
  Dropdown,
  IDropdownOption,
  IconButton,
  DefaultButton,
} from '@fluentui/react';
import { IOrderByField, IFieldInfo } from '../types/CamlTypes';

export interface IAdvancedOptionsProps {
  fields: IFieldInfo[];
  orderBy: IOrderByField[];
  viewFields: string[];
  rowLimit: number | null;
  onOrderByChange: (orderBy: IOrderByField[]) => void;
  onViewFieldsChange: (viewFields: string[]) => void;
  onRowLimitChange: (rowLimit: number | null) => void;
}

export const AdvancedOptions: React.FC<IAdvancedOptionsProps> = ({
  fields,
  orderBy,
  viewFields,
  rowLimit,
  onOrderByChange,
  onViewFieldsChange,
  onRowLimitChange,
}) => {
  // Handle adding OrderBy field
  const handleAddOrderBy = useCallback((): void => {
    onOrderByChange([...orderBy, { fieldInternalName: '', ascending: true }]);
  }, [orderBy, onOrderByChange]);

  // Handle OrderBy field change
  const handleOrderByFieldChange = useCallback(
    (index: number, fieldInternalName: string): void => {
      const newOrderBy = [...orderBy];
      newOrderBy[index] = { ...newOrderBy[index], fieldInternalName };
      onOrderByChange(newOrderBy);
    },
    [orderBy, onOrderByChange]
  );

  // Handle OrderBy direction change
  const handleOrderByDirectionChange = useCallback(
    (index: number, ascending: boolean): void => {
      const newOrderBy = [...orderBy];
      newOrderBy[index] = { ...newOrderBy[index], ascending };
      onOrderByChange(newOrderBy);
    },
    [orderBy, onOrderByChange]
  );

  // Handle removing OrderBy field
  const handleRemoveOrderBy = useCallback(
    (index: number): void => {
      const newOrderBy = orderBy.filter((_, i) => i !== index);
      onOrderByChange(newOrderBy);
    },
    [orderBy, onOrderByChange]
  );

  // Handle RowLimit change
  const handleRowLimitChange = useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      if (!newValue || newValue.trim() === '') {
        onRowLimitChange(null);
      } else {
        const value = parseInt(newValue, 10);
        if (!isNaN(value)) {
          onRowLimitChange(value);
        }
      }
    },
    [onRowLimitChange]
  );

  // Handle ViewFields selection change
  const handleViewFieldsChange = useCallback(
    (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
      if (option) {
        let newViewFields: string[];
        if (option.selected) {
          newViewFields = [...viewFields, option.key as string];
        } else {
          newViewFields = viewFields.filter(f => f !== option.key);
        }
        onViewFieldsChange(newViewFields);
      }
    },
    [viewFields, onViewFieldsChange]
  );

  // Select all fields
  const handleSelectAllFields = useCallback((): void => {
    onViewFieldsChange(fields.map(f => f.internalName));
  }, [fields, onViewFieldsChange]);

  // Clear all fields
  const handleClearAllFields = useCallback((): void => {
    onViewFieldsChange([]);
  }, [onViewFieldsChange]);

  // Field options for dropdowns
  const fieldOptions: IDropdownOption[] = fields.map(field => ({
    key: field.internalName,
    text: field.title,
  }));

  // ViewFields options with checkboxes
  const viewFieldOptions: IDropdownOption[] = fields.map(field => ({
    key: field.internalName,
    text: field.title,
    selected: viewFields.includes(field.internalName),
  }));

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #edebe9',
        borderRadius: '4px',
        background: '#f9f9f9',
        marginBottom: '16px',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
        Advanced Options
      </h3>

      {/* OrderBy Section */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <label style={{ fontWeight: 500, fontSize: '13px' }}>OrderBy (Sorting)</label>
          <DefaultButton
            text="Add Sort Field"
            iconProps={{ iconName: 'Add' }}
            onClick={handleAddOrderBy}
            styles={{ root: { padding: '4px 12px' } }}
          />
        </div>

        {orderBy.length === 0 && (
          <div style={{ fontStyle: 'italic', color: '#605e5c', fontSize: '12px' }}>
            No sorting applied. Results will be in default order.
          </div>
        )}

        {orderBy.map((field, index) => (
          <div
            key={index}
            style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}
          >
            <div style={{ flex: 1 }}>
              <Dropdown
                placeholder="Select field"
                options={fieldOptions}
                selectedKey={field.fieldInternalName}
                onChange={(e, option) =>
                  option && handleOrderByFieldChange(index, option.key as string)
                }
              />
            </div>

            <div style={{ flex: '0 0 150px' }}>
              <Dropdown
                options={[
                  { key: 'asc', text: 'Ascending' },
                  { key: 'desc', text: 'Descending' },
                ]}
                selectedKey={field.ascending ? 'asc' : 'desc'}
                onChange={(e, option) =>
                  handleOrderByDirectionChange(index, option?.key === 'asc')
                }
              />
            </div>

            <IconButton
              iconProps={{ iconName: 'Delete' }}
              title="Remove"
              ariaLabel="Remove sort field"
              onClick={() => handleRemoveOrderBy(index)}
            />
          </div>
        ))}
      </div>

      {/* ViewFields Section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontWeight: 500, fontSize: '13px', display: 'block', marginBottom: '4px' }}>
            ViewFields (Columns to Return)
          </label>
          <div style={{ fontSize: '11px', color: '#605e5c', marginBottom: '8px' }}>
            Select which columns to retrieve. Leave empty to return all columns (not recommended for performance).
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <DefaultButton
              text="Select All"
              onClick={handleSelectAllFields}
              styles={{ root: { padding: '4px 12px' } }}
            />
            <DefaultButton
              text="Clear All"
              onClick={handleClearAllFields}
              styles={{ root: { padding: '4px 12px' } }}
            />
          </div>
        </div>

        <Dropdown
          placeholder="Select fields to return"
          multiSelect
          options={viewFieldOptions}
          onChange={handleViewFieldsChange}
          styles={{ dropdown: { width: '100%' } }}
        />

        {viewFields.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#0078d4' }}>
            {viewFields.length} field{viewFields.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      {/* RowLimit Section */}
      <div>
        <TextField
          label="RowLimit (Max Results)"
          type="number"
          value={rowLimit !== null ? rowLimit.toString() : ''}
          onChange={handleRowLimitChange}
          min={0}
          max={5000}
          placeholder="Leave empty for no limit"
          description="Recommended: 100-1000. Max 5000 to avoid threshold. Leave empty to return all items."
        />
      </div>
    </div>
  );
};
