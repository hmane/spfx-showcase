import { Pivot, PivotItem } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import { FieldConfiguration, OutputTab } from '../types/FormGeneratorTypes';
import { CodeViewer } from './CodeViewer';
import { FormPreview } from './FormPreview';

export interface IOutputPanelProps {
  zodSchema: string;
  formComponent: string;
  completeExample: string;
  fields: FieldConfiguration[];
  interfaceName: string;
}

export const OutputPanel: React.FC<IOutputPanelProps> = ({
  zodSchema,
  formComponent,
  completeExample,
  fields,
  interfaceName,
}) => {
  const [selectedTab, setSelectedTab] = useState<OutputTab>('preview');

  const hasContent = zodSchema || formComponent || completeExample;

  if (!hasContent) {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            No Code Generated
          </div>
          <div style={{ fontSize: '14px' }}>
            Parse your TypeScript type to generate form code
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <Pivot
        selectedKey={selectedTab}
        onLinkClick={(item) => setSelectedTab(item?.props.itemKey as OutputTab)}
        styles={{
          root: {
            borderBottom: '1px solid #edebe9',
            padding: '0 16px',
          },
        }}
      >
        <PivotItem headerText="Form Preview" itemKey="preview" itemIcon="View" />
        <PivotItem headerText="Complete Example" itemKey="complete" itemIcon="CodeEdit" />
        <PivotItem headerText="Form Component" itemKey="form" itemIcon="Form" />
        <PivotItem headerText="Zod Schema" itemKey="schema" itemIcon="CheckMark" />
      </Pivot>

      {/* Content */}
      <div>
        {selectedTab === 'preview' && (
          <FormPreview fields={fields} interfaceName={interfaceName} />
        )}

        {selectedTab === 'schema' && (
          <CodeViewer
            code={zodSchema}
            language="typescript"
            fileName="schema.ts"
          />
        )}

        {selectedTab === 'form' && (
          <CodeViewer
            code={formComponent}
            language="typescript"
            fileName="FormComponent.tsx"
          />
        )}

        {selectedTab === 'complete' && (
          <CodeViewer
            code={completeExample}
            language="typescript"
            fileName="CompleteForm.tsx"
          />
        )}
      </div>
    </div>
  );
};
