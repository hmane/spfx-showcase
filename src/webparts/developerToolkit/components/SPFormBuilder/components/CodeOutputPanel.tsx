import { IconButton, MessageBar, MessageBarType, Pivot, PivotItem } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import { IConfiguredField, IGenerationResult, OutputTab } from '../types/SPFormBuilderTypes';
import { FormPreview } from './FormPreview';

export interface ICodeOutputPanelProps {
  generationResult: IGenerationResult | null;
  listTitle: string;
  fields: IConfiguredField[];
}

export const CodeOutputPanel: React.FC<ICodeOutputPanelProps> = ({
  generationResult,
  listTitle,
  fields
}) => {
  const [selectedTab, setSelectedTab] = useState<OutputTab>('preview');
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  if (!generationResult) {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            No Code Generated
          </div>
          <div style={{ fontSize: '14px' }}>
            Load SharePoint list fields to generate code
          </div>
        </div>
      </div>
    );
  }

  // Handle copy to clipboard
  const handleCopy = async (code: string, label: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyMessage(`${label} copied to clipboard!`);
      setTimeout(() => setCopyMessage(null), 3000);
    } catch (error) {
      setCopyMessage('Failed to copy');
      setTimeout(() => setCopyMessage(null), 3000);
    }
  };

  // Handle download
  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  // Get current code based on selected tab
  const getCurrentCode = (): { code: string; filename: string; label: string } => {
    switch (selectedTab) {
      case 'preview':
        return {
          code: '',
          filename: '',
          label: 'Preview'
        };
      case 'interface':
        return {
          code: generationResult.enums
            ? `${generationResult.enums}\n\n${generationResult.interface}`
            : generationResult.interface,
          filename: `${listTitle}Types.ts`,
          label: 'Interface & Enums'
        };
      case 'schema':
        return {
          code: generationResult.zodSchema,
          filename: `${listTitle}Schema.ts`,
          label: 'Zod Schema'
        };
      case 'form':
        return {
          code: generationResult.formComponent,
          filename: `${listTitle}Form.tsx`,
          label: 'Form Component'
        };
      case 'crud':
        return {
          code: generationResult.crud,
          filename: `${listTitle}Operations.ts`,
          label: 'CRUD Operations'
        };
      case 'store':
        return {
          code: generationResult.store,
          filename: `${listTitle}Store.ts`,
          label: 'Zustand Store'
        };
      case 'complete':
        return {
          code: generationResult.complete,
          filename: `${listTitle}Complete.tsx`,
          label: 'Complete Package'
        };
      default:
        return {
          code: '',
          filename: 'code.ts',
          label: 'Code'
        };
    }
  };

  const currentCode = getCurrentCode();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <Pivot
        selectedKey={selectedTab}
        onLinkClick={(item) => setSelectedTab(item?.props.itemKey as OutputTab)}
        styles={{
          root: {
            borderBottom: '1px solid #edebe9',
            padding: '0 16px',
            backgroundColor: '#f3f2f1'
          }
        }}
      >
        <PivotItem headerText="Form Preview" itemKey="preview" itemIcon="View" />
        <PivotItem headerText="Complete Package" itemKey="complete" itemIcon="Package" />
        <PivotItem headerText="Form Component" itemKey="form" itemIcon="Form" />
        <PivotItem headerText="Interface + Enums" itemKey="interface" itemIcon="CodeEdit" />
        <PivotItem headerText="Zod Schema" itemKey="schema" itemIcon="CheckMark" />
        <PivotItem headerText="CRUD Operations" itemKey="crud" itemIcon="Database" />
        <PivotItem headerText="Zustand Store" itemKey="store" itemIcon="BulletedList2" />
      </Pivot>

      {/* Header with actions (only show for code tabs) */}
      {selectedTab !== 'preview' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: '#f3f2f1',
            borderBottom: '1px solid #edebe9'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#605e5c' }}>{currentCode.filename}</span>
            {currentCode.code && (
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
                {currentCode.code.split('\n').length} lines
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <IconButton
              iconProps={{ iconName: 'Copy' }}
              title="Copy to clipboard"
              ariaLabel="Copy to clipboard"
              onClick={() => handleCopy(currentCode.code, currentCode.label)}
            />
            <IconButton
              iconProps={{ iconName: 'Download' }}
              title="Download file"
              ariaLabel="Download file"
              onClick={() => handleDownload(currentCode.code, currentCode.filename)}
            />
          </div>
        </div>
      )}

      {/* Copy success message */}
      {copyMessage && (
        <MessageBar
          messageBarType={
            copyMessage.includes('Failed') ? MessageBarType.error : MessageBarType.success
          }
          isMultiline={false}
          onDismiss={() => setCopyMessage(null)}
          dismissButtonAriaLabel="Close"
          styles={{
            root: {
              margin: '8px 16px'
            }
          }}
        >
          {copyMessage}
        </MessageBar>
      )}

      {/* Content display */}
      {selectedTab === 'preview' ? (
        <FormPreview fields={fields} listTitle={listTitle} />
      ) : (
        <div
          style={{
            flex: 1,
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            padding: '20px',
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            fontSize: '13px',
            lineHeight: '1.6',
            overflowY: 'auto'
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <code>{currentCode.code || '// No code generated'}</code>
          </pre>
        </div>
      )}

      {/* Footer with tips */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: '#f3f2f1',
          borderTop: '1px solid #edebe9',
          fontSize: '11px',
          color: '#605e5c'
        }}
      >
        💡 Copy individual sections or download the complete package
      </div>
    </div>
  );
};
