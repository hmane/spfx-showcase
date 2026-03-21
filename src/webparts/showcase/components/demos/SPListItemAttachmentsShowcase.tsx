import { DefaultButton, Dropdown, IDropdownOption, Toggle } from '@fluentui/react';
import * as React from 'react';
import { SPListItemAttachments, AttachmentDisplayMode } from 'spfx-toolkit/components/SPListItemAttachments';
import { SPContext } from 'spfx-toolkit/utilities/context';
import { ListPicker } from '@pnp/spfx-controls-react/lib/ListPicker';
import { ListItemPicker } from '@pnp/spfx-controls-react/lib/ListItemPicker';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';

const ATTACHMENTS_BASIC_SAMPLE = `import * as React from 'react';
import { SPListItemAttachments, AttachmentDisplayMode } from 'spfx-toolkit/components/SPListItemAttachments';

export const AttachmentsDemo: React.FC = () => {
  return (
    <SPListItemAttachments
      listId="MyList"
      itemId={123}
      mode="edit"
      displayMode={AttachmentDisplayMode.List}
      maxFileSize={25}
      allowedExtensions={['.pdf', '.docx', '.xlsx', '.jpg', '.png']}
      enableDragDrop={true}
      showPreviews={true}
      onFilesAdded={(files) => console.log('Files added:', files)}
      onUploadComplete={(fileName, success) =>
        console.log(\`Upload \${success ? 'succeeded' : 'failed'}: \${fileName}\`)
      }
      onDeleteComplete={(fileName, success) =>
        console.log(\`Delete \${success ? 'succeeded' : 'failed'}: \${fileName}\`)
      }
    />
  );
};`;

const ATTACHMENTS_NEW_ITEM_SAMPLE = `import * as React from 'react';
import { SPListItemAttachments } from 'spfx-toolkit/components/SPListItemAttachments';

export const NewItemAttachments: React.FC = () => {
  const [stagedFiles, setStagedFiles] = React.useState<File[]>([]);

  return (
    <SPListItemAttachments
      listId="MyList"
      mode="new"
      maxFileSize={10}
      maxAttachments={5}
      enableDragDrop={true}
      label="Upload Attachments"
      description="Drag files here or click to browse. Max 5 files, 10MB each."
      onFilesAdded={(files) => {
        setStagedFiles(prev => [...prev, ...files]);
        console.log('Staged files:', files);
      }}
      onFilesRemoved={(fileNames) => {
        setStagedFiles(prev => prev.filter(f => !fileNames.includes(f.name)));
        console.log('Removed files:', fileNames);
      }}
    />
  );
};`;

const ATTACHMENTS_VIEW_MODE_SAMPLE = `import * as React from 'react';
import { SPListItemAttachments, AttachmentDisplayMode } from 'spfx-toolkit/components/SPListItemAttachments';

export const ViewOnlyAttachments: React.FC<{ listId: string; itemId: number }> = ({ listId, itemId }) => {
  return (
    <SPListItemAttachments
      listId={listId}
      itemId={itemId}
      mode="view"
      displayMode={AttachmentDisplayMode.Grid}
      showPreviews={true}
      label="Attachments"
    />
  );
};`;

const ATTACHMENTS_FEATURES: ShowcaseFeature[] = [
  {
    icon: '📎',
    title: 'Drag & Drop Upload',
    description: 'Intuitive drag-and-drop zone with visual feedback and click-to-browse fallback.',
    color: '#1e90ff',
  },
  {
    icon: '🖼️',
    title: 'File Previews',
    description: 'Image thumbnails and file type icons for easy identification of attachments.',
    color: '#20c997',
  },
  {
    icon: '🛡️',
    title: 'Validation & Security',
    description: 'File size limits, extension filtering, and blocked dangerous file types.',
    color: '#f59f00',
  },
  {
    icon: '📊',
    title: 'Multiple Display Modes',
    description: 'Choose between List, Grid, or Compact views for different use cases.',
    color: '#845ef7',
  },
  {
    icon: '🔄',
    title: 'Lifecycle Callbacks',
    description: 'Comprehensive callbacks for upload start, complete, delete, and error handling.',
    color: '#e64980',
  },
  {
    icon: '🆕',
    title: 'New Item Support',
    description: 'Stage files before item creation, then upload once item ID is available.',
    color: '#15aabf',
  },
];

const ATTACHMENTS_BADGES = ['Drag & Drop', 'File Previews', 'Validation', 'Multiple Modes'];

const displayModeOptions: IDropdownOption[] = [
  { key: AttachmentDisplayMode.List, text: 'List View' },
  { key: AttachmentDisplayMode.Grid, text: 'Grid View' },
  { key: AttachmentDisplayMode.Compact, text: 'Compact View' },
];

const modeOptions: IDropdownOption[] = [
  { key: 'edit', text: 'Edit Mode' },
  { key: 'view', text: 'View Only' },
  { key: 'new', text: 'New Item Mode' },
];

/**
 * Complete showcase demonstrating SPListItemAttachments component features
 */
export const SPListItemAttachmentsShowcase: React.FC = () => {
  const [selectedListId, setSelectedListId] = React.useState<string>('');
  const [selectedItemId, setSelectedItemId] = React.useState<number | undefined>(undefined);
  const [displayMode, setDisplayMode] = React.useState<AttachmentDisplayMode>(AttachmentDisplayMode.List);
  const [mode, setMode] = React.useState<'new' | 'edit' | 'view'>('edit');
  const [enableDragDrop, setEnableDragDrop] = React.useState<boolean>(true);
  const [showPreviews, setShowPreviews] = React.useState<boolean>(true);
  const [maxFileSize, setMaxFileSize] = React.useState<number>(10);
  const [activityLog, setActivityLog] = React.useState<string[]>([]);

  const addLog = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  }, []);

  const clearLog = React.useCallback(() => {
    setActivityLog([]);
  }, []);

  const handleFilesAdded = React.useCallback(
    (files: File[]) => {
      files.forEach(file => {
        addLog(`File added: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      });
    },
    [addLog]
  );

  const handleFilesRemoved = React.useCallback(
    (fileNames: string[]) => {
      fileNames.forEach(name => {
        addLog(`File removed: ${name}`);
      });
    },
    [addLog]
  );

  const handleUploadStart = React.useCallback(
    (fileName: string) => {
      addLog(`Upload started: ${fileName}`);
    },
    [addLog]
  );

  const handleUploadComplete = React.useCallback(
    (fileName: string, success: boolean) => {
      addLog(`Upload ${success ? 'completed' : 'failed'}: ${fileName}`);
    },
    [addLog]
  );

  const handleDeleteComplete = React.useCallback(
    (fileName: string, success: boolean) => {
      addLog(`Delete ${success ? 'completed' : 'failed'}: ${fileName}`);
    },
    [addLog]
  );

  const handleError = React.useCallback(
    (error: Error) => {
      addLog(`ERROR: ${error.message}`);
    },
    [addLog]
  );

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        backgroundColor: '#fafafa',
        overflow: 'auto',
        minHeight: '100vh',
      }}
    >
      <ShowcaseHero
        title='SPListItemAttachments Component'
        subtitle='Feature-rich attachment manager with drag-and-drop, file previews, and comprehensive validation.'
        gradient='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        badges={ATTACHMENTS_BADGES}
        icon='📎'
      />

      {/* Configuration Panel */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: '#323130' }}>
          Configuration
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <Dropdown
            label="Display Mode"
            selectedKey={displayMode}
            options={displayModeOptions}
            onChange={(_, option) => option && setDisplayMode(option.key as AttachmentDisplayMode)}
          />
          <Dropdown
            label="Component Mode"
            selectedKey={mode}
            options={modeOptions}
            onChange={(_, option) => option && setMode(option.key as 'new' | 'edit' | 'view')}
          />
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={maxFileSize}
              onChange={(e) => setMaxFileSize(Math.max(1, parseInt(e.target.value) || 10))}
              min={1}
              max={100}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #8a8886',
                borderRadius: '2px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <Toggle
            label="Enable Drag & Drop"
            checked={enableDragDrop}
            onChange={(_, checked) => setEnableDragDrop(checked ?? true)}
          />
          <Toggle
            label="Show Previews"
            checked={showPreviews}
            onChange={(_, checked) => setShowPreviews(checked ?? true)}
          />
        </div>
      </div>

      {/* List and Item Selection */}
      {mode !== 'new' && (
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: '#323130' }}>
            Select List Item
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#323130',
              }}
            >
              Choose a List:
            </label>
            <ListPicker
              context={SPContext.context.context}
              label=''
              placeHolder='Select a list'
              includeHidden={false}
              multiSelect={false}
              onSelectionChanged={lists => {
                const listId = typeof lists === 'string' ? lists : (Array.isArray(lists) && lists.length > 0 ? lists[0] : '');
                setSelectedListId(listId);
                setSelectedItemId(undefined);
                addLog(`List selected: ${listId}`);
              }}
            />
          </div>

          {selectedListId && (
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#323130',
                }}
              >
                Choose an Item:
              </label>
              <ListItemPicker
                key={selectedListId}
                listId={selectedListId}
                columnInternalName='Title'
                keyColumnInternalName='ID'
                itemLimit={1}
                context={SPContext.context.context}
                placeholder='Select an item'
                onSelectedItem={items => {
                  if (items && items.length > 0) {
                    const itemId = parseInt(items[0].key, 10);
                    setSelectedItemId(itemId);
                    addLog(`Item selected: ${items[0].name} (ID: ${itemId})`);
                  } else {
                    setSelectedItemId(undefined);
                  }
                }}
              />
            </div>
          )}

          {selectedListId && selectedItemId && (
            <div
              style={{
                background: '#eff6fc',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #deecf9',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#323130' }}>
                Selected Item
              </h3>
              <div style={{ fontSize: '12px', color: '#605e5c', fontFamily: 'monospace' }}>
                <div>List ID: {selectedListId}</div>
                <div>Item ID: {selectedItemId}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Demo */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: '#323130' }}>
          Live Demo
        </h2>

        {mode === 'new' || (selectedListId && selectedItemId) ? (
          <SPListItemAttachments
            listId={selectedListId || 'DemoList'}
            itemId={mode !== 'new' ? selectedItemId : undefined}
            mode={mode}
            displayMode={displayMode}
            maxFileSize={maxFileSize}
            allowedExtensions={['.pdf', '.docx', '.xlsx', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.csv']}
            enableDragDrop={enableDragDrop}
            showPreviews={showPreviews}
            allowMultiple={true}
            maxAttachments={10}
            label="Attachments"
            description={`Drag files here or click to browse. Max ${maxFileSize}MB per file.`}
            onFilesAdded={handleFilesAdded}
            onFilesRemoved={handleFilesRemoved}
            onUploadStart={handleUploadStart}
            onUploadComplete={handleUploadComplete}
            onDeleteComplete={handleDeleteComplete}
            onError={handleError}
          />
        ) : (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              color: '#605e5c',
              backgroundColor: '#f3f2f1',
              borderRadius: '8px',
            }}
          >
            <p style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
              Please select a list and item above to see the attachment component in action.
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#a19f9d' }}>
              Or switch to "New Item Mode" to see the staging functionality.
            </p>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#323130' }}>Activity Log</h2>
          <DefaultButton
            text='Clear Log'
            iconProps={{ iconName: 'Clear' }}
            onClick={clearLog}
          />
        </div>
        <div
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '16px',
            borderRadius: '6px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '12px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {activityLog.length === 0 ? (
            <div style={{ color: '#858585', fontStyle: 'italic' }}>
              No activity yet. Add or remove files to see callbacks in action...
            </div>
          ) : (
            activityLog.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 0',
                  borderBottom: index < activityLog.length - 1 ? '1px solid #333' : 'none',
                }}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <ShowcaseKeyFeatures features={ATTACHMENTS_FEATURES} />

      <ShowcaseCodeSample
        id='attachments-basic-sample'
        title='Basic Usage - Edit Mode'
        description='Full-featured attachment management with upload, delete, and validation.'
        code={ATTACHMENTS_BASIC_SAMPLE}
        language='tsx'
      />

      <ShowcaseCodeSample
        id='attachments-new-item-sample'
        title='New Item Mode - Staging Files'
        description='Stage files before item creation, then upload once item ID is available.'
        code={ATTACHMENTS_NEW_ITEM_SAMPLE}
        language='tsx'
      />

      <ShowcaseCodeSample
        id='attachments-view-mode-sample'
        title='View Only Mode'
        description='Read-only display of existing attachments with grid layout.'
        code={ATTACHMENTS_VIEW_MODE_SAMPLE}
        language='tsx'
      />
    </div>
  );
};

export default SPListItemAttachmentsShowcase;
