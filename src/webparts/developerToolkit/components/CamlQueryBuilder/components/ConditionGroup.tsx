// src/webparts/showcase/components/CamlQueryBuilder/components/ConditionGroup.tsx

import * as React from 'react';
import { useCallback } from 'react';
import { DefaultButton, PrimaryButton, ChoiceGroup, IChoiceGroupOption } from '@fluentui/react';
import { IConditionGroup, IFieldInfo, LogicalOperator } from '../types/CamlTypes';
import { createEmptyCondition, createEmptyGroup } from '../utils/camlBuilder';
import { ConditionRow } from './ConditionRow';

export interface IConditionGroupProps {
  group: IConditionGroup;
  fields: IFieldInfo[];
  onUpdate: (group: IConditionGroup) => void;
  level?: number;
}

export const ConditionGroup: React.FC<IConditionGroupProps> = ({
  group,
  fields,
  onUpdate,
  level = 0,
}) => {
  // Handle operator change (AND/OR)
  const handleOperatorChange = useCallback(
    (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption): void => {
      if (option) {
        onUpdate({
          ...group,
          operator: option.key as LogicalOperator,
        });
      }
    },
    [group, onUpdate]
  );

  // Add new condition
  const handleAddCondition = useCallback((): void => {
    onUpdate({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()],
    });
  }, [group, onUpdate]);

  // Update condition
  const handleUpdateCondition = useCallback(
    (index: number, updatedCondition: any): void => {
      const newConditions = [...group.conditions];
      newConditions[index] = updatedCondition;
      onUpdate({
        ...group,
        conditions: newConditions,
      });
    },
    [group, onUpdate]
  );

  // Remove condition
  const handleRemoveCondition = useCallback(
    (index: number): void => {
      const newConditions = group.conditions.filter((_, i) => i !== index);
      onUpdate({
        ...group,
        conditions: newConditions,
      });
    },
    [group, onUpdate]
  );

  // Add nested group
  const handleAddNestedGroup = useCallback((): void => {
    onUpdate({
      ...group,
      nestedGroups: [...group.nestedGroups, createEmptyGroup()],
    });
  }, [group, onUpdate]);

  // Update nested group
  const handleUpdateNestedGroup = useCallback(
    (index: number, updatedGroup: IConditionGroup): void => {
      const newGroups = [...group.nestedGroups];
      newGroups[index] = updatedGroup;
      onUpdate({
        ...group,
        nestedGroups: newGroups,
      });
    },
    [group, onUpdate]
  );

  // Remove nested group
  const handleRemoveNestedGroup = useCallback(
    (index: number): void => {
      const newGroups = group.nestedGroups.filter((_, i) => i !== index);
      onUpdate({
        ...group,
        nestedGroups: newGroups,
      });
    },
    [group, onUpdate]
  );

  const operatorOptions: IChoiceGroupOption[] = [
    { key: 'AND', text: 'AND (all must match)' },
    { key: 'OR', text: 'OR (any can match)' },
  ];

  const totalConditions = group.conditions.length + group.nestedGroups.length;
  const canRemoveCondition = group.conditions.length > 1 || group.nestedGroups.length > 0;

  // Indentation for nested groups
  const indent = level * 20;

  return (
    <div
      style={{
        marginLeft: `${indent}px`,
        padding: '12px',
        border: `2px solid ${level === 0 ? '#0078d4' : '#edebe9'}`,
        borderRadius: '4px',
        background: level === 0 ? '#f9f9f9' : '#ffffff',
        marginBottom: '12px',
      }}
    >
      {/* Operator Selection */}
      {totalConditions > 1 && (
        <div style={{ marginBottom: '12px' }}>
          <ChoiceGroup
            selectedKey={group.operator}
            options={operatorOptions}
            onChange={handleOperatorChange}
            styles={{
              flexContainer: { display: 'flex', gap: '16px' },
            }}
          />
        </div>
      )}

      {/* Conditions */}
      {group.conditions.map((condition, index) => (
        <div key={condition.id}>
          <ConditionRow
            condition={condition}
            fields={fields}
            onUpdate={updatedCondition => handleUpdateCondition(index, updatedCondition)}
            onRemove={() => handleRemoveCondition(index)}
            canRemove={canRemoveCondition}
          />

          {/* Show logical operator between conditions */}
          {index < group.conditions.length - 1 && (
            <div
              style={{
                textAlign: 'center',
                padding: '4px 0',
                fontWeight: 600,
                color: '#0078d4',
                fontSize: '12px',
              }}
            >
              ─ {group.operator} ─
            </div>
          )}
        </div>
      ))}

      {/* Show operator before nested groups */}
      {group.conditions.length > 0 && group.nestedGroups.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4px 0',
            fontWeight: 600,
            color: '#0078d4',
            fontSize: '12px',
          }}
        >
          ─ {group.operator} ─
        </div>
      )}

      {/* Nested Groups */}
      {group.nestedGroups.map((nestedGroup, index) => (
        <div key={nestedGroup.id} style={{ position: 'relative' }}>
          <ConditionGroup
            group={nestedGroup}
            fields={fields}
            onUpdate={updatedGroup => handleUpdateNestedGroup(index, updatedGroup)}
            level={level + 1}
          />

          {/* Remove nested group button */}
          <DefaultButton
            text="Remove Group"
            iconProps={{ iconName: 'Delete' }}
            onClick={() => handleRemoveNestedGroup(index)}
            styles={{
              root: {
                position: 'absolute',
                top: '8px',
                right: '8px',
                minWidth: 'auto',
                padding: '4px 8px',
              },
            }}
          />

          {/* Show operator between nested groups */}
          {index < group.nestedGroups.length - 1 && (
            <div
              style={{
                textAlign: 'center',
                padding: '4px 0',
                fontWeight: 600,
                color: '#0078d4',
                fontSize: '12px',
              }}
            >
              ─ {group.operator} ─
            </div>
          )}
        </div>
      ))}

      {/* Action Buttons */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <PrimaryButton
          text="Add Condition"
          iconProps={{ iconName: 'Add' }}
          onClick={handleAddCondition}
          styles={{ root: { padding: '8px 16px' } }}
        />

        <DefaultButton
          text="Add Nested Group"
          iconProps={{ iconName: 'GroupedList' }}
          onClick={handleAddNestedGroup}
          styles={{ root: { padding: '8px 16px' } }}
        />
      </div>

      {/* Info about nesting */}
      {level === 0 && totalConditions > 2 && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#605e5c',
            fontStyle: 'italic',
          }}
        >
          Note: CAML And/Or operators only support 2 children. Multiple conditions are
          automatically nested.
        </div>
      )}
    </div>
  );
};
