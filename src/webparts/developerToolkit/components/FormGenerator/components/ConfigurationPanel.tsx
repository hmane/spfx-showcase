import * as React from 'react';
import { FieldConfiguration } from '../types/FormGeneratorTypes';
import { FieldConfigItem } from './FieldConfigItem';

export interface IConfigurationPanelProps {
  fields: FieldConfiguration[];
  onFieldChange: (index: number, updated: FieldConfiguration) => void;
}

export const ConfigurationPanel: React.FC<IConfigurationPanelProps> = ({
  fields,
  onFieldChange,
}) => {
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
          color: '#605e5c',
        }}
      >
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            No Fields Detected
          </div>
          <div style={{ fontSize: '14px' }}>
            Parse a TypeScript type to configure fields
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
          Field Configuration
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#605e5c' }}>
          Configure validation rules and options
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '12px',
          padding: '10px',
          backgroundColor: '#f3f2f1',
          borderRadius: '4px',
          fontSize: '12px',
        }}
      >
        <div>
          <span style={{ fontWeight: 600 }}>{fields.length}</span> fields
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>{fields.filter(f => !f.isOptional).length}</span> required
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>{fields.filter(f => f.hasCustomRefinement).length}</span> refinements
        </div>
      </div>

      {/* Field list */}
      <div>
        {fields.map((field, index) => (
          <FieldConfigItem
            key={`${field.name}-${index}`}
            field={field}
            onChange={(updated) => onFieldChange(index, updated)}
          />
        ))}
      </div>
    </div>
  );
};
