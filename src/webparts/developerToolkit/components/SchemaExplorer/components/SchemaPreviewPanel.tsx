// Schema Preview Panel Component

import * as React from 'react';
import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  PrimaryButton,
  DefaultButton,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  Icon,
  Pivot,
  PivotItem,
} from '@fluentui/react';
import { CodeEditor } from '../../../../../components/CodeEditor';
import { ExportFormat } from '../types/SchemaTypes';

// Export format configurations
const EXPORT_FORMATS: { key: ExportFormat; text: string; description: string; icon: string }[] = [
  {
    key: 'pnp-json',
    text: 'PnP Template (JSON)',
    description: 'Modern PnP provisioning template in JSON format',
    icon: 'FileCode',
  },
  {
    key: 'pnp-xml',
    text: 'PnP Template (XML)',
    description: 'Legacy PnP provisioning template in XML format',
    icon: 'FileHTML',
  },
  {
    key: 'site-script',
    text: 'Site Script',
    description: 'JSON site script for site designs',
    icon: 'Script',
  },
  {
    key: 'pnp-powershell',
    text: 'PnP PowerShell',
    description: 'PowerShell commands using PnP.PowerShell module',
    icon: 'CommandPrompt',
  },
  {
    key: 'cli-m365',
    text: 'CLI for M365',
    description: 'Commands for CLI for Microsoft 365',
    icon: 'Terminal',
  },
  {
    key: 'typescript',
    text: 'TypeScript Interfaces',
    description: 'TypeScript type definitions for SPFx development',
    icon: 'TypeScriptLanguage',
  },
  {
    key: 'csharp-csom',
    text: 'C# CSOM',
    description: 'C# client-side object model provisioning code',
    icon: 'CSharp',
  },
];

export interface ISchemaPreviewPanelProps {
  generatedSchema: string;
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  selectedCategoriesCount: number;
  selectedItemsCount: number;
  onExport: () => void;
  onCopy: () => void;
  isGenerating: boolean;
}

export const SchemaPreviewPanel: React.FC<ISchemaPreviewPanelProps> = ({
  generatedSchema,
  exportFormat,
  onFormatChange,
  selectedCategoriesCount,
  selectedItemsCount,
  onExport,
  onCopy,
  isGenerating,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [editorKey, setEditorKey] = useState(0);

  // Force editor re-render when schema or format changes
  useEffect(() => {
    setEditorKey(prev => prev + 1);
  }, [generatedSchema, exportFormat]);

  // Format options for dropdown
  const formatOptions: IDropdownOption[] = useMemo(() => {
    return EXPORT_FORMATS.map(f => ({
      key: f.key,
      text: f.text,
      data: f,
    }));
  }, []);

  // Get current format info
  const currentFormat = useMemo(() => {
    return EXPORT_FORMATS.find(f => f.key === exportFormat);
  }, [exportFormat]);

  // Get language for code editor
  const editorLanguage = useMemo(() => {
    switch (exportFormat) {
      case 'pnp-json':
      case 'site-script':
        return 'json';
      case 'pnp-xml':
        return 'xml';
      case 'pnp-powershell':
        return 'powershell';
      case 'cli-m365':
        return 'shell';
      case 'typescript':
        return 'typescript';
      case 'csharp-csom':
        return 'csharp';
      default:
        return 'json';
    }
  }, [exportFormat]);

  // Handle copy
  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(generatedSchema).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      onCopy();
    });
  }, [generatedSchema, onCopy]);

  // Handle download
  const handleDownload = useCallback(() => {
    let extension = 'json';
    let mimeType = 'application/json';

    switch (exportFormat) {
      case 'pnp-xml':
        extension = 'xml';
        mimeType = 'application/xml';
        break;
      case 'pnp-powershell':
        extension = 'ps1';
        mimeType = 'text/plain';
        break;
      case 'cli-m365':
        extension = 'sh';
        mimeType = 'text/plain';
        break;
      case 'typescript':
        extension = 'ts';
        mimeType = 'text/typescript';
        break;
      case 'csharp-csom':
        extension = 'cs';
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([generatedSchema], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schema-export-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedSchema, exportFormat]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!generatedSchema) return { lines: 0, characters: 0, size: '0 B' };

    const lines = generatedSchema.split('\n').length;
    const characters = generatedSchema.length;
    const bytes = new Blob([generatedSchema]).size;

    let size = '';
    if (bytes < 1024) {
      size = `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      size = `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      size = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return { lines, characters, size };
  }, [generatedSchema]);

  const isEmpty = !generatedSchema || generatedSchema.trim() === '';

  return (
    <div
      style={{
        width: '450px',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #edebe9',
          background: '#faf9f8',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
          Schema Output
        </h3>

        {/* Format selector */}
        <Dropdown
          label="Export Format"
          selectedKey={exportFormat}
          options={formatOptions}
          onChange={(_, option) => option && onFormatChange(option.key as ExportFormat)}
          onRenderOption={(option) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon iconName={option?.data?.icon} />
              <span>{option?.text}</span>
            </div>
          )}
          styles={{ root: { marginBottom: '8px' } }}
        />

        {/* Format description */}
        {currentFormat && (
          <div
            style={{
              fontSize: '11px',
              color: '#605e5c',
              padding: '8px',
              background: '#f3f2f1',
              borderRadius: '4px',
            }}
          >
            <Icon iconName="Info" style={{ marginRight: '6px' }} />
            {currentFormat.description}
          </div>
        )}

        {/* Selection summary */}
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: selectedItemsCount > 0 ? '#dff6dd' : '#f3f2f1',
            borderRadius: '4px',
            fontSize: '12px',
            color: selectedItemsCount > 0 ? '#107c10' : '#605e5c',
          }}
        >
          <strong>{selectedItemsCount}</strong> items selected from{' '}
          <strong>{selectedCategoriesCount}</strong> categories
        </div>
      </div>

      {/* Tabs */}
      <Pivot
        selectedKey={activeTab}
        onLinkClick={(item) => item && setActiveTab(item.props.itemKey || 'preview')}
        styles={{ root: { borderBottom: '1px solid #edebe9' } }}
      >
        <PivotItem headerText="Preview" itemKey="preview" itemIcon="View" />
        <PivotItem headerText="Usage" itemKey="usage" itemIcon="Documentation" />
      </Pivot>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'preview' ? (
          <>
            {/* Schema preview */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {isEmpty ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#605e5c',
                  }}
                >
                  <Icon iconName="DocumentSet" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>No schema generated yet</div>
                  <div style={{ fontSize: '12px' }}>
                    Select categories and items from the left panel to generate schema
                  </div>
                </div>
              ) : (
                <CodeEditor
                  key={`schema-editor-${editorKey}`}
                  value={generatedSchema}
                  language={editorLanguage}
                  readOnly={true}
                  showLineNumbers={true}
                  showMiniMap={false}
                  theme="vs-dark"
                  showCopyButton={false}
                  showDownloadButton={false}
                  autoHeight={false}
                  minHeight={300}
                />
              )}
            </div>

            {/* Stats and actions */}
            {!isEmpty && (
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #edebe9',
                  background: '#faf9f8',
                }}
              >
                {/* Stats */}
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '12px',
                    fontSize: '11px',
                    color: '#605e5c',
                  }}
                >
                  <span>{stats.lines} lines</span>
                  <span>{stats.characters} chars</span>
                  <span>{stats.size}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <PrimaryButton
                    text={copySuccess ? 'Copied!' : 'Copy'}
                    iconProps={{ iconName: copySuccess ? 'CheckMark' : 'Copy' }}
                    onClick={handleCopy}
                    disabled={isEmpty}
                  />
                  <DefaultButton
                    text="Download"
                    iconProps={{ iconName: 'Download' }}
                    onClick={handleDownload}
                    disabled={isEmpty}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Usage tab */
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            {renderUsageInstructions(exportFormat)}
          </div>
        )}
      </div>
    </div>
  );
};

// Usage instructions for each format
function renderUsageInstructions(format: ExportFormat): JSX.Element {
  switch (format) {
    case 'pnp-json':
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0' }}>Using PnP Template (JSON)</h4>
          <MessageBar messageBarType={MessageBarType.info}>
            Requires PnP.PowerShell module
          </MessageBar>
          <div style={{ marginTop: '12px' }}>
            <strong>Apply template:</strong>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
{`Connect-PnPOnline -Url "https://tenant.sharepoint.com/sites/yoursite" -Interactive
Invoke-PnPSiteTemplate -Path "./template.json"`}
            </pre>
          </div>
        </div>
      );

    case 'pnp-xml':
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0' }}>Using PnP Template (XML)</h4>
          <MessageBar messageBarType={MessageBarType.info}>
            Legacy format - use JSON for new projects
          </MessageBar>
          <div style={{ marginTop: '12px' }}>
            <strong>Apply template:</strong>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
{`Connect-PnPOnline -Url "https://tenant.sharepoint.com/sites/yoursite" -Interactive
Invoke-PnPSiteTemplate -Path "./template.xml"`}
            </pre>
          </div>
        </div>
      );

    case 'site-script':
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0' }}>Using Site Script</h4>
          <MessageBar messageBarType={MessageBarType.info}>
            Site scripts can be used with Site Designs
          </MessageBar>
          <div style={{ marginTop: '12px' }}>
            <strong>Register site script:</strong>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
{`$script = Get-Content "./sitescript.json" -Raw
Add-PnPSiteScript -Title "My Script" -Content $script`}
            </pre>
          </div>
        </div>
      );

    case 'pnp-powershell':
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0' }}>Using PnP PowerShell</h4>
          <MessageBar messageBarType={MessageBarType.info}>
            Requires PnP.PowerShell module installed
          </MessageBar>
          <div style={{ marginTop: '12px' }}>
            <strong>Run the script:</strong>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
{`# Install PnP.PowerShell if needed
Install-Module PnP.PowerShell -Scope CurrentUser

# Run your script
./provision.ps1`}
            </pre>
          </div>
        </div>
      );

    case 'cli-m365':
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0' }}>Using CLI for Microsoft 365</h4>
          <MessageBar messageBarType={MessageBarType.info}>
            Cross-platform CLI for Microsoft 365
          </MessageBar>
          <div style={{ marginTop: '12px' }}>
            <strong>Install and run:</strong>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
{`# Install CLI for M365
npm install -g @pnp/cli-microsoft365

# Login
m365 login

# Run commands
./provision.sh`}
            </pre>
          </div>
        </div>
      );

    case 'typescript':
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0' }}>Using TypeScript Interfaces</h4>
          <MessageBar messageBarType={MessageBarType.info}>
            Type definitions for SPFx development
          </MessageBar>
          <div style={{ marginTop: '12px' }}>
            <strong>Usage:</strong>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
{`// Import types in your SPFx component
import { IMyListItem } from './types';

// Use with PnPJS
const items = await sp.web.lists
  .getByTitle("MyList")
  .items<IMyListItem[]>();`}
            </pre>
          </div>
        </div>
      );

    case 'csharp-csom':
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0' }}>Using C# CSOM Code</h4>
          <MessageBar messageBarType={MessageBarType.info}>
            Requires Microsoft.SharePointOnline.CSOM NuGet package
          </MessageBar>
          <div style={{ marginTop: '12px' }}>
            <strong>Setup:</strong>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
{`// Install NuGet package
Install-Package Microsoft.SharePointOnline.CSOM

// Run provisioner
var provisioner = new SchemaProvisioner(siteUrl, username, password);
provisioner.ProvisionAll();
provisioner.Dispose();`}
            </pre>
          </div>
        </div>
      );

    default:
      return <div>Select an export format</div>;
  }
}
