import { Checkbox, DefaultButton, Icon, IconButton, TextField, DatePicker } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import { IConfiguredField } from '../types/SPFormBuilderTypes';

export interface IFieldConfigurationPanelProps {
  fields: IConfiguredField[];
  onFieldsChange: (fields: IConfiguredField[]) => void;
}

export const FieldConfigurationPanel: React.FC<IFieldConfigurationPanelProps> = ({
  fields,
  onFieldsChange
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  if (fields.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '32px',
          textAlign: 'center',
          color: '#605e5c'
        }}
      >
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            No Fields Loaded
          </div>
          <div style={{ fontSize: '14px' }}>
            Load a SharePoint list to see fields
          </div>
        </div>
      </div>
    );
  }

  // Toggle field inclusion
  const handleToggleField = (index: number) => {
    const updated = [...fields];
    updated[index] = {
      ...updated[index],
      isIncluded: !updated[index].isIncluded
    };
    onFieldsChange(updated);
  };

  // Toggle field expansion
  const toggleFieldExpansion = (fieldInternalName: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldInternalName)) {
      newExpanded.delete(fieldInternalName);
    } else {
      newExpanded.add(fieldInternalName);
    }
    setExpandedFields(newExpanded);
  };

  // Update validation override
  const handleValidationOverride = (index: number, overrideKey: string, value: any) => {
    const updated = [...fields];
    updated[index] = {
      ...updated[index],
      validationOverrides: {
        ...updated[index].validationOverrides,
        [overrideKey]: value
      }
    };
    onFieldsChange(updated);
  };


  // Get available override options for field type
  const getOverrideOptions = (field: IConfiguredField) => {
    const options = {
      canOverrideRequired: true,
      canOverrideMinLength: ['Text', 'Note'].includes(field.TypeAsString),
      canOverrideMaxLength: ['Text', 'Note'].includes(field.TypeAsString),
      canOverrideMin: ['Number', 'Currency'].includes(field.TypeAsString),
      canOverrideMax: ['Number', 'Currency'].includes(field.TypeAsString),
      canOverrideMinDate: field.TypeAsString === 'DateTime',
      canOverrideMaxDate: field.TypeAsString === 'DateTime'
    };
    return options;
  };

  // Select all fields
  const handleSelectAll = () => {
    const updated = fields.map(f => ({ ...f, isIncluded: true }));
    onFieldsChange(updated);
  };

  // Deselect all fields
  const handleDeselectAll = () => {
    const updated = fields.map(f => ({ ...f, isIncluded: false }));
    onFieldsChange(updated);
  };

  // Drag handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const updated = [...fields];
      const draggedItem = updated[draggedIndex];

      // Remove from old position
      updated.splice(draggedIndex, 1);

      // Insert at new position
      updated.splice(dragOverIndex, 0, draggedItem);

      // Update order property
      updated.forEach((field, idx) => {
        field.order = idx;
      });

      onFieldsChange(updated);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Stats
  const selectedCount = fields.filter(f => f.isIncluded).length;
  const requiredCount = fields.filter(f => f.isIncluded && f.Required).length;
  const enumCount = fields.filter(f => f.isIncluded && f.generateEnum).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
          Field Configuration
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#605e5c' }}>
          Select and reorder fields
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '10px',
          backgroundColor: '#f3f2f1',
          borderRadius: '4px',
          fontSize: '12px'
        }}
      >
        <div>
          <span style={{ fontWeight: 600 }}>{selectedCount}</span> / {fields.length} selected
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>{requiredCount}</span> required
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>{enumCount}</span> enums
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <DefaultButton
          text="Select All"
          onClick={handleSelectAll}
          iconProps={{ iconName: 'CheckboxComposite' }}
          styles={{ root: { flex: 1 } }}
        />
        <DefaultButton
          text="Deselect All"
          onClick={handleDeselectAll}
          iconProps={{ iconName: 'Checkbox' }}
          styles={{ root: { flex: 1 } }}
        />
      </div>

      {/* Field list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          maxHeight: '500px',
          overflowY: 'auto'
        }}
      >
        {fields.map((field, index) => {
          const isExpanded = expandedFields.has(field.InternalName);
          const overrideOptions = getOverrideOptions(field);
          const hasAnyOverrideOption = overrideOptions.canOverrideRequired ||
            overrideOptions.canOverrideMinLength || overrideOptions.canOverrideMaxLength ||
            overrideOptions.canOverrideMin || overrideOptions.canOverrideMax ||
            overrideOptions.canOverrideMinDate || overrideOptions.canOverrideMaxDate;

          return (
            <div
              key={field.InternalName}
              style={{
                backgroundColor: dragOverIndex === index ? '#deecf9' : field.isIncluded ? '#ffffff' : '#f3f2f1',
                border: draggedIndex === index ? '2px dashed #0078d4' : '1px solid #edebe9',
                borderRadius: '4px',
                opacity: field.isIncluded ? 1 : 0.6,
                transition: 'all 0.2s'
              }}
            >
              {/* Main field row */}
              <div
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  cursor: 'move'
                }}
              >
                {/* Drag handle */}
                <Icon
                  iconName="GripperDotsVertical"
                  styles={{
                    root: {
                      fontSize: '14px',
                      color: '#605e5c',
                      cursor: 'grab'
                    }
                  }}
                />

                {/* Expand/Collapse button */}
                {hasAnyOverrideOption && (
                  <IconButton
                    iconProps={{ iconName: isExpanded ? 'ChevronDown' : 'ChevronRight' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFieldExpansion(field.InternalName);
                    }}
                    styles={{
                      root: { width: 24, height: 24 },
                      icon: { fontSize: 12 }
                    }}
                  />
                )}

                {/* Checkbox */}
                <Checkbox
                  checked={field.isIncluded}
                  onChange={() => handleToggleField(index)}
                />

                {/* Field info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>
                      {field.Title}
                    </span>
                    {(field.validationOverrides?.overrideRequired ? field.validationOverrides.isRequiredOverride : field.Required) && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: '#d13438',
                          color: '#ffffff',
                          borderRadius: '2px',
                          fontWeight: 600
                        }}
                      >
                        REQUIRED{field.validationOverrides?.overrideRequired ? '*' : ''}
                      </span>
                    )}
                    {field.generateEnum && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: '#0078d4',
                          color: '#ffffff',
                          borderRadius: '2px',
                          fontWeight: 600
                        }}
                      >
                        ENUM
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#605e5c', marginTop: '2px' }}>
                    {field.InternalName} → {field.camelCaseName} | {field.TypeAsString}
                  </div>
                </div>

                {/* Type icon */}
                <Icon
                  iconName={getFieldTypeIcon(field.TypeAsString)}
                  styles={{
                    root: {
                      fontSize: '16px',
                      color: '#0078d4'
                    }
                  }}
                />
              </div>

              {/* Expanded validation overrides */}
              {isExpanded && (
                <div
                  style={{
                    padding: '12px',
                    borderTop: '1px solid #edebe9',
                    backgroundColor: '#faf9f8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#323130' }}>
                    Validation Overrides
                  </div>

                  {/* Required override */}
                  {overrideOptions.canOverrideRequired && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        label="Override Required"
                        checked={field.validationOverrides?.overrideRequired || false}
                        onChange={(_, checked) => handleValidationOverride(index, 'overrideRequired', checked)}
                      />
                      {field.validationOverrides?.overrideRequired && (
                        <Checkbox
                          label="Is Required"
                          checked={field.validationOverrides?.isRequiredOverride || false}
                          onChange={(_, checked) => handleValidationOverride(index, 'isRequiredOverride', checked)}
                        />
                      )}
                    </div>
                  )}

                  {/* Min/Max Length for Text fields */}
                  {overrideOptions.canOverrideMinLength && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        label="Override Min Length"
                        checked={field.validationOverrides?.overrideMinLength || false}
                        onChange={(_, checked) => handleValidationOverride(index, 'overrideMinLength', checked)}
                      />
                      {field.validationOverrides?.overrideMinLength && (
                        <TextField
                          type="number"
                          value={field.validationOverrides?.minLengthOverride?.toString() || ''}
                          onChange={(_, value) => handleValidationOverride(index, 'minLengthOverride', value ? parseInt(value) : undefined)}
                          styles={{ root: { width: 100 } }}
                        />
                      )}
                    </div>
                  )}

                  {overrideOptions.canOverrideMaxLength && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        label="Override Max Length"
                        checked={field.validationOverrides?.overrideMaxLength || false}
                        onChange={(_, checked) => handleValidationOverride(index, 'overrideMaxLength', checked)}
                      />
                      {field.validationOverrides?.overrideMaxLength && (
                        <TextField
                          type="number"
                          value={field.validationOverrides?.maxLengthOverride?.toString() || ''}
                          onChange={(_, value) => handleValidationOverride(index, 'maxLengthOverride', value ? parseInt(value) : undefined)}
                          styles={{ root: { width: 100 } }}
                        />
                      )}
                    </div>
                  )}

                  {/* Min/Max for Number fields */}
                  {overrideOptions.canOverrideMin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        label="Override Min Value"
                        checked={field.validationOverrides?.overrideMin || false}
                        onChange={(_, checked) => handleValidationOverride(index, 'overrideMin', checked)}
                      />
                      {field.validationOverrides?.overrideMin && (
                        <TextField
                          type="number"
                          value={field.validationOverrides?.minOverride?.toString() || ''}
                          onChange={(_, value) => handleValidationOverride(index, 'minOverride', value ? parseFloat(value) : undefined)}
                          styles={{ root: { width: 100 } }}
                        />
                      )}
                    </div>
                  )}

                  {overrideOptions.canOverrideMax && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        label="Override Max Value"
                        checked={field.validationOverrides?.overrideMax || false}
                        onChange={(_, checked) => handleValidationOverride(index, 'overrideMax', checked)}
                      />
                      {field.validationOverrides?.overrideMax && (
                        <TextField
                          type="number"
                          value={field.validationOverrides?.maxOverride?.toString() || ''}
                          onChange={(_, value) => handleValidationOverride(index, 'maxOverride', value ? parseFloat(value) : undefined)}
                          styles={{ root: { width: 100 } }}
                        />
                      )}
                    </div>
                  )}

                  {/* Min/Max Date for DateTime fields */}
                  {overrideOptions.canOverrideMinDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        label="Override Min Date"
                        checked={field.validationOverrides?.overrideMinDate || false}
                        onChange={(_, checked) => handleValidationOverride(index, 'overrideMinDate', checked)}
                      />
                      {field.validationOverrides?.overrideMinDate && (
                        <DatePicker
                          value={field.validationOverrides?.minDateOverride}
                          onSelectDate={(date) => handleValidationOverride(index, 'minDateOverride', date || undefined)}
                          styles={{ root: { width: 150 } }}
                        />
                      )}
                    </div>
                  )}

                  {overrideOptions.canOverrideMaxDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox
                        label="Override Max Date"
                        checked={field.validationOverrides?.overrideMaxDate || false}
                        onChange={(_, checked) => handleValidationOverride(index, 'overrideMaxDate', checked)}
                      />
                      {field.validationOverrides?.overrideMaxDate && (
                        <DatePicker
                          value={field.validationOverrides?.maxDateOverride}
                          onSelectDate={(date) => handleValidationOverride(index, 'maxDateOverride', date || undefined)}
                          styles={{ root: { width: 150 } }}
                        />
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '10px', color: '#605e5c', fontStyle: 'italic' }}>
                    * Overrides will be applied to generated Zod schema and form validation
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <div
        style={{
          fontSize: '11px',
          color: '#605e5c',
          fontStyle: 'italic',
          padding: '8px',
          backgroundColor: '#f3f2f1',
          borderRadius: '4px'
        }}
      >
        💡 Drag to reorder • Check/uncheck to include/exclude • Expand to override validation
      </div>
    </div>
  );
};

/**
 * Get icon for field type
 */
function getFieldTypeIcon(fieldType: string): string {
  const iconMap: Record<string, string> = {
    'Text': 'TextField',
    'Note': 'AlignLeft',
    'Number': 'NumberField',
    'Currency': 'Money',
    'DateTime': 'Calendar',
    'Boolean': 'ToggleLeft',
    'User': 'People',
    'UserMulti': 'People',
    'Lookup': 'Link',
    'LookupMulti': 'Link',
    'Choice': 'List',
    'MultiChoice': 'BulletedList',
    'TaxonomyFieldType': 'Tag',
    'TaxonomyFieldTypeMulti': 'Tag',
    'URL': 'Link'
  };

  return iconMap[fieldType] || 'TextField';
}
