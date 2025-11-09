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
} from '@fluentui/react';
import { ICondition, IFieldInfo, CAMLOperator } from '../types/CamlTypes';
import { getOperatorsForFieldType, getValueTypeForFieldType, OPERATOR_INFO, getSpecialValuesForFieldType } from '../data/operators';

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
  // Field options
  const fieldOptions: IDropdownOption[] = useMemo(() => {
    return fields.map(field => ({
      key: field.internalName,
      text: `${field.title} (${field.typeAsString})`,
      data: field,
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

    // DateTime field
    if (fieldType === 'DateTime') {
      return (
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <TextField
                value={condition.value}
                onChange={handleValueChange}
                placeholder="YYYY-MM-DD or use special value"
              />
            </div>
            <Checkbox
              label="Include time"
              checked={condition.includeTimeValue}
              onChange={handleIncludeTimeToggle}
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

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
      <div style={{ flex: '0 0 200px' }}>
        <Dropdown
          placeholder="Select field"
          options={fieldOptions}
          selectedKey={condition.fieldInternalName}
          onChange={handleFieldChange}
        />
      </div>

      <div style={{ flex: '0 0 150px' }}>
        <Dropdown
          placeholder="Operator"
          options={operatorOptions}
          selectedKey={condition.operator}
          onChange={handleOperatorChange}
          disabled={!selectedField}
        />
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>{renderValueInput()}</div>

      <IconButton
        iconProps={{ iconName: 'Delete' }}
        title="Remove condition"
        ariaLabel="Remove condition"
        onClick={onRemove}
        disabled={!canRemove}
        styles={{ root: { marginTop: '4px' } }}
      />
    </div>
  );
};
