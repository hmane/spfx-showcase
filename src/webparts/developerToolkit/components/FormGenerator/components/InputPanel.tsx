import { DefaultButton, Dropdown, IDropdownOption, MessageBar, MessageBarType, PrimaryButton, TextField } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import { getCategories, SAMPLE_TEMPLATES } from '../utils/templates';

export interface IInputPanelProps {
  code: string;
  onChange: (code: string) => void;
  onParse: () => void;
  validationError?: string;
  isParsing?: boolean;
}

export const InputPanel: React.FC<IInputPanelProps> = ({
  code,
  onChange,
  onParse,
  validationError,
  isParsing,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();

  const categories = getCategories();
  const templateOptions: IDropdownOption[] = [
    { key: 'none', text: '-- Select a template --' },
    ...categories.flatMap(category => [
      { key: `header-${category}`, text: category, itemType: 1 }, // Header
      ...SAMPLE_TEMPLATES
        .filter(t => t.category === category)
        .map(t => ({
          key: t.id,
          text: t.name,
          data: t,
        })),
    ]),
  ];

  const handleTemplateChange = (_: any, option?: IDropdownOption) => {
    if (option && option.key !== 'none' && option.data) {
      setSelectedTemplate(option.key as string);
      onChange(option.data.code);
    }
  };

  const handleClear = () => {
    onChange('');
    setSelectedTemplate(undefined);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
          Input TypeScript Type
        </h3>
        <p style={{ margin: '0', fontSize: '12px', color: '#605e5c' }}>
          Paste interface/type or load template
        </p>
      </div>

      {/* Template selector */}
      <Dropdown
        placeholder="Load a sample template"
        options={templateOptions}
        selectedKey={selectedTemplate}
        onChange={handleTemplateChange}
        styles={{ root: { width: '100%' } }}
      />

      {/* Code input */}
      <TextField
        multiline
        rows={12}
        resizable={false}
        value={code}
        onChange={(_, newValue) => onChange(newValue || '')}
        placeholder={`interface MyForm {
  name: string;
  email: string;
  age: number;
}`}
        styles={{
          field: {
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            fontSize: '12px',
          },
        }}
      />

      {/* Validation error */}
      {validationError && (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
          {validationError}
        </MessageBar>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <PrimaryButton
          text={isParsing ? 'Parsing...' : 'Parse & Generate'}
          onClick={onParse}
          disabled={!code.trim() || isParsing}
          iconProps={{ iconName: 'Lightning' }}
        />
        <DefaultButton
          text="Clear"
          onClick={handleClear}
          disabled={!code.trim()}
          iconProps={{ iconName: 'Clear' }}
        />
      </div>
    </div>
  );
};
