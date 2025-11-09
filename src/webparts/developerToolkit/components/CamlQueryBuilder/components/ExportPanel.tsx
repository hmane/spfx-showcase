// src/webparts/showcase/components/CamlQueryBuilder/components/ExportPanel.tsx

import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
  ChoiceGroup,
  IChoiceGroupOption,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
} from '@fluentui/react';
import { ExportFormat } from '../types/CamlTypes';
import {
  generateExportCode,
  getExportFormatLabel,
  getExportFormatDescription,
  getExportFileExtension,
} from '../utils/exportTemplates';

export interface IExportPanelProps {
  camlXML: string;
  listTitle: string;
  siteUrl: string;
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onCopy: (message: string) => void;
}

export const ExportPanel: React.FC<IExportPanelProps> = ({
  camlXML,
  listTitle,
  siteUrl,
  exportFormat,
  onFormatChange,
  onCopy,
}) => {
  // Generate code based on selected format
  const generatedCode = useMemo(() => {
    if (!camlXML || !listTitle) return '';
    return generateExportCode(camlXML, exportFormat, listTitle, siteUrl);
  }, [camlXML, exportFormat, listTitle, siteUrl]);

  // Format options
  const formatOptions: IChoiceGroupOption[] = useMemo(
    () => [
      {
        key: 'caml',
        text: getExportFormatLabel('caml'),
        iconProps: { iconName: 'FileCode' },
      },
      {
        key: 'pnpjs',
        text: getExportFormatLabel('pnpjs'),
        iconProps: { iconName: 'TypeScriptLanguage' },
      },
      {
        key: 'pnppowershell',
        text: getExportFormatLabel('pnppowershell'),
        iconProps: { iconName: 'PowerShell' },
      },
      {
        key: 'rest',
        text: getExportFormatLabel('rest'),
        iconProps: { iconName: 'JavaScriptLanguage' },
      },
    ],
    []
  );

  // Handle format change
  const handleFormatChange = useCallback(
    (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption): void => {
      if (option) {
        onFormatChange(option.key as ExportFormat);
      }
    },
    [onFormatChange]
  );

  // Copy code to clipboard
  const handleCopy = useCallback((): void => {
    void navigator.clipboard.writeText(generatedCode).then(() => {
      onCopy(`${getExportFormatLabel(exportFormat)} code copied to clipboard`);
    }).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  }, [generatedCode, exportFormat, onCopy]);

  // Download code as file
  const handleDownload = useCallback((): void => {
    const extension = getExportFileExtension(exportFormat);
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `caml-query-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onCopy(`Code downloaded as .${extension} file`);
  }, [generatedCode, exportFormat, onCopy]);

  const isEmpty = !generatedCode || generatedCode.trim() === '';
  const isReady = !isEmpty && listTitle;

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
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
        Export Options
      </h3>

      {/* Format Selection */}
      <div style={{ marginBottom: '16px' }}>
        <ChoiceGroup
          selectedKey={exportFormat}
          options={formatOptions}
          onChange={handleFormatChange}
          label="Export Format"
        />
      </div>

      {/* Format Description */}
      <div
        style={{
          marginBottom: '12px',
          padding: '8px',
          background: '#f3f2f1',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#323130',
        }}
      >
        {getExportFormatDescription(exportFormat)}
      </div>

      {/* Warning if list not selected */}
      {!listTitle && (
        <MessageBar messageBarType={MessageBarType.warning}>
          Please select a list above to enable export functionality.
        </MessageBar>
      )}

      {/* Action Buttons */}
      {isReady && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <PrimaryButton
            text="Copy Code"
            iconProps={{ iconName: 'Copy' }}
            onClick={handleCopy}
            disabled={isEmpty}
            styles={{ root: { padding: '8px 16px' } }}
          />
          <DefaultButton
            text="Download"
            iconProps={{ iconName: 'Download' }}
            onClick={handleDownload}
            disabled={isEmpty}
            styles={{ root: { padding: '8px 16px' } }}
          />
        </div>
      )}

      {/* Code Preview */}
      {isReady && (
        <div
          style={{
            background: '#1e1e1e',
            border: '1px solid #3c3c3c',
            borderRadius: '4px',
            padding: '12px',
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: '12px',
            lineHeight: '1.5',
            overflow: 'auto',
            maxHeight: '300px',
            color: '#d4d4d4',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          <code>{generatedCode}</code>
        </div>
      )}

      {/* Usage Instructions */}
      {isReady && exportFormat === 'pnpjs' && (
        <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '12px' } }}>
          <strong>Usage:</strong> Copy this code into your SPFx component. Make sure you have @pnp/sp
          installed and imported.
        </MessageBar>
      )}

      {isReady && exportFormat === 'pnppowershell' && (
        <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '12px' } }}>
          <strong>Usage:</strong> Run this script in PowerShell. Requires PnP.PowerShell module
          installed.
        </MessageBar>
      )}
    </div>
  );
};
