// src/webparts/showcase/components/CamlQueryBuilder/components/CAMLPreview.tsx

import * as React from 'react';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import { CodeEditor } from '../../../../../components/CodeEditor';

export interface ICAMLPreviewProps {
  camlXML: string;
  validationErrors: string[];
  onCopy: () => void;
}

/**
 * CAML Query Preview component with XML syntax highlighting.
 */
export const CAMLPreview: React.FC<ICAMLPreviewProps> = ({
  camlXML,
  validationErrors,
  onCopy,
}) => {
  // Use state to track version for forcing CodeEditor re-render when camlXML changes
  const [editorVersion, setEditorVersion] = useState(0);

  // Increment version when camlXML changes to force CodeEditor to re-render
  useEffect(() => {
    setEditorVersion(v => v + 1);
  }, [camlXML]);

  // Line and character count
  const stats = useMemo(() => {
    if (!camlXML) return { lines: 0, characters: 0 };

    return {
      lines: camlXML.split('\n').length,
      characters: camlXML.length,
    };
  }, [camlXML]);

  // Copy to clipboard
  const handleCopy = useCallback((): void => {
    void navigator.clipboard.writeText(camlXML).then(() => {
      onCopy();
    }).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  }, [camlXML, onCopy]);

  const hasErrors = validationErrors.length > 0;
  const isEmpty = !camlXML || camlXML.trim() === '';

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #edebe9',
        borderRadius: '4px',
        background: '#ffffff',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Generated CAML Query</h3>

        <PrimaryButton
          text="Copy"
          iconProps={{ iconName: 'Copy' }}
          onClick={handleCopy}
          disabled={isEmpty}
          styles={{ root: { padding: '8px 16px' } }}
        />
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <MessageBar messageBarType={MessageBarType.error} isMultiline>
          <strong>Validation Errors:</strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </MessageBar>
      )}

      {/* CAML XML Display */}
      {isEmpty ? (
        <div
          style={{
            background: '#f5f5f5',
            border: '1px solid #d1d1d1',
            borderRadius: '4px',
            padding: '12px',
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: '12px',
            lineHeight: '1.5',
          }}
        >
          <span style={{ color: '#999', fontStyle: 'italic' }}>
            No query generated yet. Add conditions above to build your CAML query.
          </span>
        </div>
      ) : (
        <CodeEditor
          key={`caml-preview-${editorVersion}`}
          value={camlXML}
          language="xml"
          readOnly={true}
          showLineNumbers={true}
          showMiniMap={false}
          theme="vs"
          showCopyButton={false} // Using PrimaryButton above instead
          showDownloadButton={false}
          autoHeight={true}
          minHeight={150}
          maxHeight={400}
        />
      )}

      {/* Stats */}
      {!isEmpty && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#605e5c',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {stats.lines} line{stats.lines !== 1 ? 's' : ''}, {stats.characters} character
            {stats.characters !== 1 ? 's' : ''}
          </span>
          {!hasErrors && (
            <span style={{ color: '#107c10' }}>
              ✓ Valid CAML
            </span>
          )}
        </div>
      )}
    </div>
  );
};
