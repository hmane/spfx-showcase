// src/webparts/showcase/components/CamlQueryBuilder/components/ConditionRow.tsx

import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
  Dropdown,
  IDropdownOption,
  TextField,
  IconButton,
  Checkbox,
  ChoiceGroup,
  IChoiceGroupOption,
  DatePicker,
  DayOfWeek,
  TooltipHost,
  Icon,
} from '@fluentui/react';
import { ICondition, IFieldInfo, CAMLOperator, FieldType } from '../types/CamlTypes';
import { getOperatorsForFieldType, getValueTypeForFieldType, OPERATOR_INFO, getSpecialValuesForFieldType } from '../data/operators';

// Field type icons for better visual identification
const FIELD_TYPE_ICONS: Record<FieldType, { icon: string; color: string }> = {
  Text: { icon: 'TextField', color: '#0078d4' },
  Note: { icon: 'AlignLeft', color: '#0078d4' },
  Number: { icon: 'NumberSymbol', color: '#107c10' },
  Currency: { icon: 'Money', color: '#107c10' },
  Integer: { icon: 'NumberField', color: '#107c10' },
  Counter: { icon: 'NumberSequence', color: '#107c10' },
  DateTime: { icon: 'Calendar', color: '#8764b8' },
  Boolean: { icon: 'ToggleRight', color: '#c239b3' },
  User: { icon: 'Contact', color: '#008272' },
  Lookup: { icon: 'Link', color: '#ff8c00' },
  Choice: { icon: 'BulletedList', color: '#e74856' },
  MultiChoice: { icon: 'CheckList', color: '#e74856' },
  URL: { icon: 'Globe', color: '#0078d4' },
  Guid: { icon: 'Fingerprint', color: '#605e5c' },
  TaxonomyFieldType: { icon: 'Tag', color: '#00bcf2' },
  TaxonomyFieldTypeMulti: { icon: 'Tag', color: '#00bcf2' },
};

export interface IConditionRowProps {
  condition: ICondition;
  fields: IFieldInfo[];
  onUpdate: (condition: ICondition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const ConditionRow: React.FC<IConditionRowProps> = ({
  condition,
  fields,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  // Field options with type info in tooltip
  const fieldOptions: IDropdownOption[] = useMemo(() => {
    return fields.map(field => ({
      key: field.internalName,
      text: field.title,
      data: field,
      title: `${field.title} (${field.typeAsString})`,
    }));
  }, [fields]);

  // Get selected field
  const selectedField = useMemo(() => {
    return fields.find(f => f.internalName === condition.fieldInternalName);
  }, [fields, condition.fieldInternalName]);

  // Operator options based on selected field type
  const operatorOptions: IDropdownOption[] = useMemo(() => {
    if (!selectedField) return [];

    const operators = getOperatorsForFieldType(selectedField.typeAsString);
    return operators.map(op => ({
      key: op,
      text: OPERATOR_INFO[op].label,
      title: OPERATOR_INFO[op].description,
    }));
  }, [selectedField]);

  // Handle field change
  const handleFieldChange = useCallback(
    (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
      if (option) {
        const field: IFieldInfo = option.data;
        const operators = getOperatorsForFieldType(field.typeAsString);
        const defaultOperator = operators[0];

        onUpdate({
          ...condition,
          fieldInternalName: field.internalName,
          fieldType: field.typeAsString,
          operator: defaultOperator,
          valueType: getValueTypeForFieldType(field.typeAsString) as any,
          value: '',
          useLookupId: false,
          includeTimeValue: false,
        });
      }
    },
    [condition, onUpdate]
  );

  // Handle operator change
  const handleOperatorChange = useCallback(
    (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
      if (option) {
        onUpdate({
          ...condition,
          operator: option.key as CAMLOperator,
          value: OPERATOR_INFO[option.key as CAMLOperator].requiresValue ? condition.value : '',
        });
      }
    },
    [condition, onUpdate]
  );

  // Handle value change
  const handleValueChange = useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      onUpdate({
        ...condition,
        value: newValue || '',
      });
    },
    [condition, onUpdate]
  );


  // Handle boolean value change
  const handleBooleanChange = useCallback(
    (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption): void => {
      if (option) {
        onUpdate({
          ...condition,
          value: option.key,
        });
      }
    },
    [condition, onUpdate]
  );

  // Handle lookup ID toggle
  const handleLookupIdToggle = useCallback(
    (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean): void => {
      onUpdate({
        ...condition,
        useLookupId: checked,
        valueType: checked ? 'Integer' : 'Lookup',
      });
    },
    [condition, onUpdate]
  );

  // Handle include time toggle
  const handleIncludeTimeToggle = useCallback(
    (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean): void => {
      onUpdate({
        ...condition,
        includeTimeValue: checked,
      });
    },
    [condition, onUpdate]
  );

  // Special values for field type
  const specialValues = useMemo(() => {
    if (!selectedField) return [];
    return getSpecialValuesForFieldType(selectedField.typeAsString);
  }, [selectedField]);

  // Insert special value
  const insertSpecialValue = useCallback(
    (value: string): void => {
      onUpdate({
        ...condition,
        value,
      });
    },
    [condition, onUpdate]
  );

  // Render value input based on field type and operator
  const renderValueInput = (): JSX.Element | null => {
    if (!selectedField) return null;

    const operatorInfo = OPERATOR_INFO[condition.operator];
    if (!operatorInfo.requiresValue) {
      return <div style={{ fontStyle: 'italic', color: '#605e5c' }}>No value required</div>;
    }

    const fieldType = selectedField.typeAsString;

    // Boolean field
    if (fieldType === 'Boolean') {
      const booleanOptions: IChoiceGroupOption[] = [
        { key: '1', text: 'Yes (True)' },
        { key: '0', text: 'No (False)' },
      ];
      return (
        <ChoiceGroup
          selectedKey={condition.value || '1'}
          options={booleanOptions}
          onChange={handleBooleanChange}
        />
      );
    }

    // DateTime field - use DatePicker for actual dates, or text for special tokens
    if (fieldType === 'DateTime') {
      const isSpecialToken = condition.value?.startsWith('<') && condition.value?.endsWith('/>');

      // Parse date value if it's a valid date string
      const dateValue = useMemo(() => {
        if (!condition.value || isSpecialToken) return undefined;
        const date = new Date(condition.value);
        return isNaN(date.getTime()) ? undefined : date;
      }, [condition.value, isSpecialToken]);

      const handleDateSelect = (date: Date | null | undefined): void => {
        if (date) {
          // Format as ISO date string (YYYY-MM-DD)
          const isoDate = date.toISOString().split('T')[0];
          onUpdate({ ...condition, value: isoDate });
        } else {
          onUpdate({ ...condition, value: '' });
        }
      };

      return (
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {isSpecialToken ? (
                <TextField
                  value={condition.value}
                  onChange={handleValueChange}
                  placeholder="Special token value"
                  styles={{
                    field: { fontFamily: 'monospace', backgroundColor: '#fff4ce' }
                  }}
                />
              ) : (
                <DatePicker
                  value={dateValue}
                  onSelectDate={handleDateSelect}
                  placeholder="Select a date..."
                  firstDayOfWeek={DayOfWeek.Sunday}
                  allowTextInput
                  showMonthPickerAsOverlay
                  styles={{
                    root: { width: '100%' },
                  }}
                />
              )}
            </div>
            <Checkbox
              label="Include time"
              checked={condition.includeTimeValue}
              onChange={handleIncludeTimeToggle}
              styles={{ root: { marginTop: '6px' } }}
            />
          </div>
          {/* Special date tokens */}
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: '#605e5c', marginRight: '8px' }}>Quick values:</span>
            <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
              {specialValues.map(sv => (
                <span
                  key={sv.value}
                  onClick={() => insertSpecialValue(sv.value)}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    background: condition.value === sv.value ? '#0078d4' : '#f3f2f1',
                    color: condition.value === sv.value ? '#fff' : '#323130',
                    border: '1px solid #edebe9',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title={sv.description}
                >
                  {sv.label}
                </span>
              ))}
              {isSpecialToken && (
                <span
                  onClick={() => onUpdate({ ...condition, value: '' })}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    background: '#fde7e9',
                    color: '#a80000',
                    border: '1px solid #f1707b',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                  title="Clear special token and use date picker"
                >
                  ✕ Clear
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Number/Currency/Integer field
    if (fieldType === 'Number' || fieldType === 'Currency' || fieldType === 'Integer') {
      return (
        <TextField
          type="number"
          value={condition.value}
          onChange={handleValueChange}
          placeholder="Enter number"
        />
      );
    }

    // User field
    if (fieldType === 'User') {
      return (
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <TextField
                value={condition.value}
                onChange={handleValueChange}
                placeholder="User display name or use <UserID/>"
              />
            </div>
            <Checkbox
              label="Use ID"
              checked={condition.useLookupId}
              onChange={handleLookupIdToggle}
            />
          </div>
          {specialValues.length > 0 && (
            <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {specialValues.map(sv => (
                <span
                  key={sv.value}
                  onClick={() => insertSpecialValue(sv.value)}
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    background: '#f3f2f1',
                    border: '1px solid #edebe9',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                  title={sv.description}
                >
                  {sv.label}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Lookup field
    if (fieldType === 'Lookup') {
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <TextField
              value={condition.value}
              onChange={handleValueChange}
              placeholder="Lookup value or ID"
            />
          </div>
          <Checkbox
            label="Use ID"
            checked={condition.useLookupId}
            onChange={handleLookupIdToggle}
          />
        </div>
      );
    }

    // Choice field with choices available
    if (fieldType === 'Choice' && selectedField.choices && selectedField.choices.length > 0) {
      // For In operator, use multiline text
      if (condition.operator === 'In') {
        return (
          <TextField
            multiline
            rows={3}
            value={condition.value}
            onChange={handleValueChange}
            placeholder="Enter values separated by semicolons (;)"
            description={`Available choices: ${selectedField.choices.join(', ')}`}
          />
        );
      }

      const choiceOptions: IDropdownOption[] = selectedField.choices.map(choice => ({
        key: choice,
        text: choice,
      }));

      return (
        <Dropdown
          placeholder="Select choice"
          options={choiceOptions}
          selectedKey={condition.value}
          onChange={(e, option) => option && handleValueChange(e as any, option.key as string)}
        />
      );
    }

    // In operator for multiple values
    if (condition.operator === 'In') {
      return (
        <TextField
          multiline
          rows={3}
          value={condition.value}
          onChange={handleValueChange}
          placeholder="Enter values separated by semicolons (;) - Max 500 values"
          description="Example: Value1;Value2;Value3"
        />
      );
    }

    // Default: text field
    return (
      <TextField
        value={condition.value}
        onChange={handleValueChange}
        placeholder="Enter value"
      />
    );
  };

  // Get field type icon info
  const fieldTypeIcon = selectedField
    ? FIELD_TYPE_ICONS[selectedField.typeAsString] || { icon: 'Unknown', color: '#605e5c' }
    : null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
        marginBottom: '12px',
        padding: '12px',
        background: selectedField ? '#ffffff' : '#faf9f8',
        border: '1px solid #edebe9',
        borderRadius: '6px',
        borderLeft: selectedField ? `3px solid ${fieldTypeIcon?.color || '#edebe9'}` : '1px solid #edebe9',
      }}
    >
      {/* Field Type Icon */}
      {selectedField && fieldTypeIcon && (
        <TooltipHost content={`${selectedField.typeAsString} field`}>
          <div
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${fieldTypeIcon.color}15`,
              borderRadius: '4px',
              flexShrink: 0,
            }}
          >
            <Icon
              iconName={fieldTypeIcon.icon}
              styles={{ root: { fontSize: '16px', color: fieldTypeIcon.color } }}
            />
          </div>
        </TooltipHost>
      )}

      {/* Field Selector */}
      <div style={{ flex: '0 0 200px' }}>
        <Dropdown
          placeholder="Select field..."
          options={fieldOptions}
          selectedKey={condition.fieldInternalName}
          onChange={handleFieldChange}
          styles={{
            dropdown: { borderRadius: '4px' },
            title: { borderRadius: '4px' },
          }}
        />
      </div>

      {/* Operator Selector */}
      <div style={{ flex: '0 0 160px' }}>
        <Dropdown
          placeholder="Operator..."
          options={operatorOptions}
          selectedKey={condition.operator}
          onChange={handleOperatorChange}
          disabled={!selectedField}
          styles={{
            dropdown: { borderRadius: '4px' },
            title: { borderRadius: '4px' },
          }}
        />
      </div>

      {/* Value Input */}
      <div style={{ flex: 1, minWidth: '200px' }}>{renderValueInput()}</div>

      {/* Delete Button */}
      <IconButton
        iconProps={{ iconName: 'Delete' }}
        title="Remove condition"
        ariaLabel="Remove condition"
        onClick={onRemove}
        disabled={!canRemove}
        styles={{
          root: {
            marginTop: '2px',
            color: canRemove ? '#a80000' : '#c8c6c4',
          },
          rootHovered: {
            background: '#fde7e9',
            color: '#a80000',
          },
        }}
      />
    </div>
  );
};
