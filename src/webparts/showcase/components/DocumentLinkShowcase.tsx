import {
  ChoiceGroup,
  Dropdown,
  IChoiceGroupOption,
  IDropdownOption,
  IStackTokens,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Stack,
  TextField,
  Toggle,
  useTheme,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useState, useMemo } from 'react';
import { DocumentLink, IDocumentInfo, DocumentLinkLayout, SizePosition, ClickAction, PreviewMode, PreviewTarget, IDocumentLinkProps } from 'spfx-toolkit/lib/components/DocumentLink';
import SPContext from 'spfx-toolkit/lib/utilities/context';
import { ShowcaseCodeSample } from './ShowcaseCodeSample';
import { ShowcaseHero } from './ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from './ShowcaseKeyFeatures';

const DOCUMENT_LINK_SAMPLE = `import * as React from 'react';
import { DocumentLink } from 'spfx-toolkit/lib/components/DocumentLink';

export const DocumentLinkExample: React.FC = () => (
  <DocumentLink
    layout="linkWithIconAndSize"
    documentUrl="https://contoso.sharepoint.com/sites/Docs/QuarterlyReport.xlsx"
    previewMode="view"
    previewTarget="modal"
    enableHoverCard={true}
    onAfterPreview={doc => console.log('preview', doc.name)}
    onAfterDownload={doc => console.log('download', doc.name)}
    onError={error => console.error(error.message)}
  />
);`;

const DOCUMENT_LINK_FEATURES: ShowcaseFeature[] = [
  {
    icon: '🔗',
    title: 'Flexible Identification',
    description: 'Resolve documents by URL, ID + library, or UniqueId for tenant-safe linking.',
    color: '#1d9bf0',
  },
  {
    icon: '👁️',
    title: 'Rich Hover Card',
    description: 'Display preview metadata, version history shortcuts, and download links.',
    color: '#ff922b',
  },
  {
    icon: '🪟',
    title: 'Preview Destinations',
    description: 'Open previews inline, in modals, or new tabs with configurable modes.',
    color: '#845ef7',
  },
  {
    icon: '📈',
    title: 'Telemetry Hooks',
    description: 'After-preview, download, and error callbacks for analytics and diagnostics.',
    color: '#2f9e44',
  },
];

const DOCUMENT_LINK_BADGES = ['Preview ready', 'Live hover cards', 'Telemetry hooks'];

// Wrapper component for styled examples
const ExampleWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const theme = useTheme();
  return (
    <div
      style={{
        padding: '12px',
        border: `1px solid ${theme.palette.neutralLight}`,
        borderRadius: '4px',
      }}
    >
      <h4
        style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: theme.palette.neutralPrimary,
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
};

export const DocumentLinkShowcase: React.FC = () => {
  const theme = useTheme();

  // Get current site URL dynamically
  const currentSiteUrl = useMemo(() => {
    try {
      return SPContext.pageContext.web.absoluteUrl;
    } catch {
      return '';
    }
  }, []);

  // --- STATE MANAGEMENT ---
  // Document Identification
  const [identifierType, setIdentifierType] = useState('url');
  const [documentUrl, setDocumentUrl] = useState(
    currentSiteUrl ? `${currentSiteUrl}/RequestDocuments/oct.png` : ''
  );
  const [documentId, setDocumentId] = useState(1);
  const [libraryName, setLibraryName] = useState('RequestDocuments');
  const [documentUniqueId, setDocumentUniqueId] = useState('a1b2c3d4-e5f6-7890-abcd-ef1234567890');

  // Layout
  const [layout, setLayout] = useState<DocumentLinkLayout>('linkWithIconAndSize');
  const [sizePosition, setSizePosition] = useState<SizePosition>('inline');

  // Behavior
  const [onClickBehavior, setOnClickBehavior] = useState<ClickAction>('preview');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget>('modal');

  // Hover Card
  const [enableHoverCard, setEnableHoverCard] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(true);
  const [showDownloadInCard, setShowDownloadInCard] = useState(true);

  // Performance
  const [enableCache, setEnableCache] = useState(true);

  // Logging
  const [logs, setLogs] = useState<string[]>([]);

  // --- CALLBACKS ---
  const logMessage = (message: string): void => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  const onAfterDownload = useCallback((doc: IDocumentInfo) => {
    logMessage(`onAfterDownload: Download initiated for "${doc.name}".`);
  }, []);

  const onAfterPreview = useCallback((doc: IDocumentInfo) => {
    logMessage(`onAfterPreview: Preview opened for "${doc.name}".`);
  }, []);

  const onError = useCallback((error: Error) => {
    logMessage(`onError: ${error.message}`);
  }, []);

  // --- DEMO UTILITIES ---
  const resetDemo = (): void => {
    setIdentifierType('url');
    setDocumentUrl(currentSiteUrl ? `${currentSiteUrl}/Shared%20Documents/Sample.docx` : '');
    setDocumentId(1);
    setLibraryName('Shared Documents');
    setDocumentUniqueId('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    setLayout('linkWithIconAndSize');
    setSizePosition('inline');
    setOnClickBehavior('preview');
    setPreviewMode('view');
    setPreviewTarget('modal');
    setEnableHoverCard(true);
    setShowVersionHistory(true);
    setShowDownloadInCard(true);
    setEnableCache(true);
    setLogs([]);
  };

  const getDocumentProps = (): Partial<IDocumentLinkProps> => {
    const props: Partial<IDocumentLinkProps> = {
      layout,
      sizePosition,
      onClick: onClickBehavior,
      previewMode,
      previewTarget,
      enableHoverCard,
      showVersionHistory,
      showDownloadInCard,
      enableCache,
      onAfterDownload,
      onAfterPreview,
      onError,
    };

    switch (identifierType) {
      case 'url':
        props.documentUrl = documentUrl;
        break;
      case 'id':
        props.documentId = documentId;
        props.libraryName = libraryName;
        break;
      case 'uniqueId':
        props.documentUniqueId = documentUniqueId;
        break;
      case 'invalid':
        // Use an intentionally incorrect identifier to trigger the onError callback
        props.documentUniqueId = '00000000-0000-0000-0000-000000000000';
        break;
    }
    return props;
  };

  const dynamicProps = getDocumentProps();

  // --- STYLING & OPTIONS ---
  const mainStackTokens: IStackTokens = { childrenGap: 24 };
  const controlStackTokens: IStackTokens = { childrenGap: 16 };
  const sectionHeaderStyle: React.CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: theme.palette.neutralPrimary,
  };
  const sectionContainerStyle: React.CSSProperties = {
    background: theme.palette.white,
    padding: '20px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.neutralLight}`,
  };

  const identifierOptions: IDropdownOption[] = [
    { key: 'url', text: 'By URL' },
    { key: 'id', text: 'By ID & Library Name' },
    { key: 'uniqueId', text: 'By UniqueId (GUID)' },
    { key: 'invalid', text: 'Invalid Identifier (for error test)' },
  ];

  const layoutOptions: IChoiceGroupOption[] = [
    { key: 'linkOnly', text: 'Link Only', iconProps: { iconName: 'Link' } },
    { key: 'linkWithIcon', text: 'Link with Icon', iconProps: { iconName: 'Page' } },
    {
      key: 'linkWithIconAndSize',
      text: 'Link, Icon & Size',
      iconProps: { iconName: 'PageHeader' },
    },
  ];

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        backgroundColor: theme.palette.neutralLighterAlt,
      }}
    >
      <ShowcaseHero
        title='DocumentLink Showcase'
        subtitle='Preview, download, and inspect documents with LivePersona hover cards and flexible linking options.'
        gradient='linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
        badges={DOCUMENT_LINK_BADGES}
        icon='📄'
      />

      <MessageBar
        messageBarType={MessageBarType.info}
        isMultiline={true}
        style={{ marginBottom: '20px' }}
      >
        <strong>Note:</strong> For the interactive demo to work, please replace the placeholder
        values with a valid Document URL, ID, or UniqueId from your own SharePoint environment. The
        component needs a live SharePoint context to fetch metadata.
      </MessageBar>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* === LEFT COLUMN: PREVIEWS & EXAMPLES === */}
        <Stack tokens={mainStackTokens}>
          {/* Live Preview */}
          <div style={sectionContainerStyle}>
            <h2 style={sectionHeaderStyle}>Live Interactive Preview</h2>
            <div
              style={{
                minHeight: '80px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.neutralLighterAlt,
                borderRadius: '4px',
                border: `1px dashed ${theme.palette.neutralTertiary}`,
              }}
            >
              <DocumentLink {...dynamicProps} />
            </div>
          </div>

          {/* Event Log */}
          <div style={sectionContainerStyle}>
            <h2 style={sectionHeaderStyle}>Event Log</h2>
            {logs.length > 0 ? (
              <div
                style={{
                  backgroundColor: theme.palette.neutralLighter,
                  padding: '12px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}
              >
                {logs.map((log, index) => (
                  <div key={index} style={{ marginBottom: '4px', opacity: 1 - index * 0.1 }}>
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: theme.palette.neutralSecondary }}>
                Callback events like `onAfterDownload`, `onAfterPreview`, and `onError` will appear
                here.
              </p>
            )}
          </div>

          {/* Pre-configured Examples */}
          <div style={sectionContainerStyle}>
            <h2 style={sectionHeaderStyle}>Layout & Feature Examples</h2>
            <Stack tokens={{ childrenGap: 16 }}>
              <ExampleWrapper title='Layout: linkOnly'>
                <DocumentLink documentUrl={documentUrl} layout='linkOnly' />
              </ExampleWrapper>
              <ExampleWrapper title='Layout: linkWithIcon'>
                <DocumentLink documentUrl={documentUrl} layout='linkWithIcon' />
              </ExampleWrapper>
              <ExampleWrapper title='Layout: linkWithIconAndSize (inline)'>
                <DocumentLink
                  documentUrl={documentUrl}
                  layout='linkWithIconAndSize'
                  sizePosition='inline'
                />
              </ExampleWrapper>
              <ExampleWrapper title='Layout: linkWithIconAndSize (below)'>
                <DocumentLink
                  documentUrl={documentUrl}
                  layout='linkWithIconAndSize'
                  sizePosition='below'
                />
              </ExampleWrapper>
              <ExampleWrapper title='Action: Download on Click'>
                <DocumentLink
                  documentUrl={documentUrl}
                  onClick='download'
                  onAfterDownload={onAfterDownload}
                />
              </ExampleWrapper>
              <ExampleWrapper title='Error State (Invalid GUID)'>
                <DocumentLink documentUniqueId='invalid-guid' onError={onError} />
              </ExampleWrapper>
            </Stack>
          </div>
        </Stack>

        {/* === RIGHT COLUMN: CONTROL PANEL === */}
        <div style={sectionContainerStyle}>
          <h2 style={sectionHeaderStyle}>Component Controls</h2>
          <Stack tokens={controlStackTokens}>
            {/* Document Identifier */}
            <Dropdown
              label='Identifier Type'
              selectedKey={identifierType}
              options={identifierOptions}
              onChange={(_, opt) => opt && setIdentifierType(opt.key as string)}
            />
            {identifierType === 'url' && (
              <TextField
                label='Document URL'
                value={documentUrl}
                onChange={(_, val) => setDocumentUrl(val || '')}
              />
            )}
            {identifierType === 'id' && (
              <>
                <TextField
                  label='Document ID'
                  type='number'
                  value={String(documentId)}
                  onChange={(_, val) => setDocumentId(Number(val) || 0)}
                />
                <TextField
                  label='Library Name'
                  value={libraryName}
                  onChange={(_, val) => setLibraryName(val || '')}
                />
              </>
            )}
            {identifierType === 'uniqueId' && (
              <TextField
                label='Document UniqueId'
                value={documentUniqueId}
                onChange={(_, val) => setDocumentUniqueId(val || '')}
              />
            )}

            {/* Layout */}
            <ChoiceGroup
              label='Layout'
              selectedKey={layout}
              options={layoutOptions}
              onChange={(_, opt) => opt && setLayout(opt.key as DocumentLinkLayout)}
            />
            {layout === 'linkWithIconAndSize' && (
              <ChoiceGroup
                label='Size Position'
                selectedKey={sizePosition}
                options={[
                  { key: 'inline', text: 'Inline' },
                  { key: 'below', text: 'Below' },
                ]}
                onChange={(_, opt) => opt && setSizePosition(opt.key as SizePosition)}
              />
            )}

            {/* Behavior */}
            <ChoiceGroup
              label='Click Action'
              selectedKey={onClickBehavior}
              options={[
                { key: 'preview', text: 'Preview' },
                { key: 'download', text: 'Download' },
              ]}
              onChange={(_, opt) => opt && setOnClickBehavior(opt.key as ClickAction)}
            />
            {onClickBehavior === 'preview' && (
              <>
                <ChoiceGroup
                  label='Preview Mode'
                  selectedKey={previewMode}
                  options={[
                    { key: 'view', text: 'View Mode' },
                    { key: 'edit', text: 'Edit Mode' },
                  ]}
                  onChange={(_, opt) => opt && setPreviewMode(opt.key as PreviewMode)}
                />
                <ChoiceGroup
                  label='Preview Target'
                  selectedKey={previewTarget}
                  options={[
                    { key: 'modal', text: 'Modal' },
                    { key: 'newTab', text: 'New Tab' },
                  ]}
                  onChange={(_, opt) => opt && setPreviewTarget(opt.key as PreviewTarget)}
                />
              </>
            )}

            {/* Hover Card */}
            <Toggle
              label='Enable Hover Card'
              checked={enableHoverCard}
              onChange={(_, checked) => setEnableHoverCard(!!checked)}
            />
            {enableHoverCard && (
              <Stack tokens={{ childrenGap: 8 }} style={{ paddingLeft: '20px' }}>
                <Toggle
                  label='Show Version History'
                  checked={showVersionHistory}
                  onChange={(_, checked) => setShowVersionHistory(!!checked)}
                />
                <Toggle
                  label='Show Download in Card'
                  checked={showDownloadInCard}
                  onChange={(_, checked) => setShowDownloadInCard(!!checked)}
                />
              </Stack>
            )}

            {/* Performance */}
            <Toggle
              label='Enable Caching'
              checked={enableCache}
              onChange={(_, checked) => setEnableCache(!!checked)}
              onText='On'
              offText='Off'
            />
            <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: '16px' }}>
              <PrimaryButton
                text='Reset Demo'
                onClick={resetDemo}
                iconProps={{ iconName: 'Refresh' }}
              />
            </Stack>
          </Stack>
        </div>
      </div>

      <ShowcaseKeyFeatures features={DOCUMENT_LINK_FEATURES} />

      <ShowcaseCodeSample
        id='document-link-sample'
        title='DocumentLink Integration'
        description='Render a SharePoint document link with preview callbacks, hover cards, and download tracking.'
        code={DOCUMENT_LINK_SAMPLE}
        language='tsx'
      />
    </div>
  );
};
