import { Checkbox, Dropdown, IconButton, SpinButton, TextField, Toggle } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import { FieldConfiguration } from '../types/FormGeneratorTypes';

export interface IFieldConfigItemProps {
  field: FieldConfiguration;
  onChange: (updated: FieldConfiguration) => void;
}

export const FieldConfigItem: React.FC<IFieldConfigItemProps> = ({ field, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateField = (updates: Partial<FieldConfiguration>) => {
    onChange({ ...field, ...updates });
  };

  return (
    <div
      style={{
        border: '1px solid #edebe9',
        borderRadius: '4px',
        marginBottom: '8px',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          cursor: 'pointer',
          backgroundColor: isExpanded ? '#f3f2f1' : '#ffffff',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <IconButton
            iconProps={{ iconName: isExpanded ? 'ChevronDown' : 'ChevronRight' }}
            styles={{ root: { height: '24px', width: '24px' } }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {field.name}{' '}
              <span style={{ color: '#605e5c', fontWeight: 400 }}>
                ({field.type})
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#605e5c' }}>
              {field.componentType} • {field.isOptional ? 'Optional' : 'Required'}
            </div>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={!field.isOptional}
            onChange={(_, checked) => updateField({ isOptional: !checked })}
            label="Required"
          />
        </div>
      </div>

      {/* Configuration panel */}
      {isExpanded && (
        <div style={{ padding: '16px', borderTop: '1px solid #edebe9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Label */}
            <TextField
              label="Label"
              value={field.label}
              onChange={(_, value) => updateField({ label: value || '' })}
            />

            {/* Placeholder */}
            <TextField
              label="Placeholder"
              value={field.placeholder}
              onChange={(_, value) => updateField({ placeholder: value || '' })}
            />

            {/* String field options */}
            {field.componentType === 'SPTextField' && (
              <>
                <SpinButton
                  label="Min Length"
                  value={field.minLength?.toString() || ''}
                  min={0}
                  max={field.maxLength || 1000}
                  step={1}
                  onChange={(_, value) => updateField({ minLength: parseInt(value || '0') })}
                />
                <SpinButton
                  label="Max Length"
                  value={field.maxLength?.toString() || ''}
                  min={field.minLength || 0}
                  max={10000}
                  step={10}
                  onChange={(_, value) => updateField({ maxLength: parseInt(value || '0') })}
                />
                <Checkbox
                  label="Email validation"
                  checked={field.isEmail}
                  onChange={(_, checked) => updateField({ isEmail: checked })}
                />
                <Checkbox
                  label="URL validation"
                  checked={field.isUrl}
                  onChange={(_, checked) => updateField({ isUrl: checked })}
                />
                <Checkbox
                  label="Multiline"
                  checked={field.isMultiline}
                  onChange={(_, checked) => updateField({ isMultiline: checked })}
                />
                {field.isMultiline && (
                  <SpinButton
                    label="Rows"
                    value={field.rows?.toString() || '4'}
                    min={2}
                    max={20}
                    step={1}
                    onChange={(_, value) => updateField({ rows: parseInt(value || '4') })}
                  />
                )}
              </>
            )}

            {/* Number field options */}
            {field.componentType === 'SPNumberField' && (
              <>
                <SpinButton
                  label="Min Value"
                  value={field.min?.toString() || ''}
                  step={1}
                  onChange={(_, value) => updateField({ min: parseFloat(value || '0') })}
                />
                <SpinButton
                  label="Max Value"
                  value={field.max?.toString() || ''}
                  step={1}
                  onChange={(_, value) => updateField({ max: parseFloat(value || '0') })}
                />
                <Checkbox
                  label="Integer only"
                  checked={field.isInteger}
                  onChange={(_, checked) => updateField({ isInteger: checked })}
                />
                <SpinButton
                  label="Decimal Places"
                  value={field.decimals?.toString() || '0'}
                  min={0}
                  max={4}
                  step={1}
                  onChange={(_, value) => updateField({ decimals: parseInt(value || '0') })}
                />
              </>
            )}

            {/* Boolean field options */}
            {field.componentType === 'SPBooleanField' && (
              <>
                <Dropdown
                  label="Display Type"
                  selectedKey={field.displayType || 'checkbox'}
                  options={[
                    { key: 'checkbox', text: 'Checkbox' },
                    { key: 'toggle', text: 'Toggle' },
                  ]}
                  onChange={(_, option) => updateField({ displayType: option?.key as any })}
                />
              </>
            )}

            {/* Date field options */}
            {field.componentType === 'SPDateField' && (
              <>
                <Checkbox
                  label="Include time picker"
                  checked={field.includeTime}
                  onChange={(_, checked) => updateField({ includeTime: checked })}
                />
                <TextField
                  label="Min Date (YYYY-MM-DD)"
                  value={field.minDate || ''}
                  onChange={(_, value) => updateField({ minDate: value || undefined })}
                  placeholder="e.g., 2024-01-01"
                  description="Earliest allowed date"
                />
                <TextField
                  label="Max Date (YYYY-MM-DD)"
                  value={field.maxDate || ''}
                  onChange={(_, value) => updateField({ maxDate: value || undefined })}
                  placeholder="e.g., 2025-12-31"
                  description="Latest allowed date"
                />
              </>
            )}
          </div>

          {/* Custom refinement */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #edebe9' }}>
            <Toggle
              label="Add Custom Refinement"
              checked={field.hasCustomRefinement}
              onChange={(_, checked) => updateField({ hasCustomRefinement: checked })}
              inlineLabel
            />

            {field.hasCustomRefinement && (
              <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Dropdown
                  label="Refinement Type"
                  selectedKey={field.refinementType || 'refine'}
                  options={[
                    { key: 'refine', text: 'Refine (validation)' },
                    { key: 'transform', text: 'Transform (modify value)' },
                    { key: 'preprocess', text: 'Preprocess (normalize input)' },
                  ]}
                  onChange={(_, option) => updateField({ refinementType: option?.key as any })}
                />
                <TextField
                  label="Error Message"
                  value={field.refinementMessage || ''}
                  onChange={(_, value) => updateField({ refinementMessage: value || '' })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
