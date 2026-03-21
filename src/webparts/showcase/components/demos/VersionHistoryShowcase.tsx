import { DefaultButton, PrimaryButton } from '@fluentui/react';
import * as React from 'react';
import { IVersionInfo, VersionHistory } from 'spfx-toolkit/components/VersionHistory';
import { SPContext } from 'spfx-toolkit/utilities/context';
import { ListPicker } from '@pnp/spfx-controls-react/lib/ListPicker';
import { ListItemPicker } from '@pnp/spfx-controls-react/lib/ListItemPicker';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';

const VERSION_HISTORY_SAMPLE = `import * as React from 'react';
import { useState } from 'react';
import { PrimaryButton } from '@fluentui/react';
import { VersionHistory } from 'spfx-toolkit/components/VersionHistory';
import { ListPicker } from '@pnp/spfx-controls-react/lib/ListPicker';
import { ListItemPicker } from '@pnp/spfx-controls-react/lib/ListItemPicker';
import { SPContext } from 'spfx-toolkit/utilities/context';

export const VersionHistoryTrigger: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<number>();

  return (
    <>
      <ListPicker
        context={SPContext.context as any}
        placeHolder="Select a list or library"
        baseTemplate={100}
        onSelectionChanged={(lists) => {
          setSelectedListId(lists?.[0] || '');
          setSelectedItemId(undefined);
        }}
      />

      {selectedListId && (
        <ListItemPicker
          listId={selectedListId}
          columnInternalName="Title"
          itemLimit={1}
          context={SPContext.context as any}
          onSelectedItem={(items) => {
            setSelectedItemId(items?.[0]?.id);
          }}
        />
      )}

      {selectedListId && selectedItemId && (
        <PrimaryButton onClick={() => setShowHistory(true)}>
          View version history
        </PrimaryButton>
      )}

      {showHistory && selectedListId && selectedItemId && (
        <VersionHistory
          listId={selectedListId}
          itemId={selectedItemId}
          onClose={() => setShowHistory(false)}
          onExport={versionCount => console.log('exported', versionCount)}
          onDownload={version => console.log('download', version.versionLabel)}
        />
      )}
    </>
  );
};`;

const VERSION_HISTORY_FEATURES: ShowcaseFeature[] = [
  {
    icon: '🗂️',
    title: 'Document & List Support',
    description: 'Switch between document library items and list entries with a single config.',
    color: '#1e90ff',
  },
  {
    icon: '🧾',
    title: 'Inline Change Grid',
    description: 'Three-column comparison shows previous vs new values without extra dialogs.',
    color: '#20c997',
  },
  {
    icon: '⬇️',
    title: 'Export & Download',
    description: 'Built-in CSV export and per-version download callbacks for custom handling.',
    color: '#f59f00',
  },
  {
    icon: '🧭',
    title: 'Modern UX',
    description: 'DevExtreme popup with ScrollView, search, filters, and responsive layout.',
    color: '#845ef7',
  },
];

const VERSION_HISTORY_BADGES = ['DevExtreme popup', 'Inline change grid', 'Export ready'];

/**
 * Complete showcase demonstrating VersionHistory component features
 */
export const VersionHistoryShowcase: React.FC = () => {
  const [showHistory, setShowHistory] = React.useState(false);
  const [selectedListId, setSelectedListId] = React.useState<string>('');
  const [selectedItemId, setSelectedItemId] = React.useState<number | undefined>(undefined);
  const [activityLog, setActivityLog] = React.useState<string[]>([]);

  const addLog = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  }, []);

  const handleOpenHistory = React.useCallback(() => {
    if (!selectedListId || !selectedItemId) {
      addLog('ERROR: Please select both a list and an item first');
      return;
    }
    setShowHistory(true);
    addLog(`Opening version history for List ID: ${selectedListId}, Item ID: ${selectedItemId}`);
  }, [selectedListId, selectedItemId, addLog]);

  const handleClose = React.useCallback(() => {
    setShowHistory(false);
    addLog('Version history closed');
  }, [addLog]);

  const handleExport = React.useCallback(
    (versionCount: number) => {
      addLog(`Exported ${versionCount} versions to CSV`);
    },
    [addLog]
  );

  const handleDownload = React.useCallback(
    (version: IVersionInfo) => {
      addLog(`Downloaded version ${version.versionLabel} (${version.modifiedByName})`);
    },
    [addLog]
  );

  const clearLog = React.useCallback(() => {
    setActivityLog([]);
  }, []);

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
        title='VersionHistory Component'
        subtitle='Redesigned viewer with DevExtreme, inline change tracking, and export-ready actions.'
        gradient='linear-gradient(135deg, #0a4ba5 0%, #2a9d8f 100%)'
        badges={VERSION_HISTORY_BADGES}
        icon='🕑'
      />

      {/* Demo Selector */}
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
          Interactive Demo
        </h2>

        {/* List and Item Selection */}
        <div style={{ marginBottom: '20px' }}>
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
              Choose a List or Document Library:
            </label>
            <ListPicker
              context={SPContext.context.context}
              label=''
              placeHolder='Select a list or library'
              includeHidden={false}
              multiSelect={false}
              onSelectionChanged={lists => {
                const listId = typeof lists === 'string' ? lists : (Array.isArray(lists) && lists.length > 0 ? lists[0] : '');
                setSelectedListId(listId);
                setSelectedItemId(undefined); // Reset item when list changes
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
                marginBottom: '16px',
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <PrimaryButton
            text='Open Version History'
            iconProps={{ iconName: 'History' }}
            onClick={handleOpenHistory}
            disabled={!selectedListId || !selectedItemId}
          />
          <DefaultButton
            text='Clear Activity Log'
            iconProps={{ iconName: 'Clear' }}
            onClick={clearLog}
          />
        </div>
      </div>
      {/* Activity Log */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: '#323130' }}>Activity Log</h2>
        <div
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '16px',
            borderRadius: '6px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '12px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {activityLog.length === 0 ? (
            <div style={{ color: '#858585', fontStyle: 'italic' }}>
              No activity yet. Open version history to see logs...
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

      <ShowcaseKeyFeatures features={VERSION_HISTORY_FEATURES} />

      <ShowcaseCodeSample
        id='version-history-sample'
        title='Version History Trigger'
        description='Load the DevExtreme-powered history viewer on demand and wire up export / download callbacks.'
        code={VERSION_HISTORY_SAMPLE}
        language='tsx'
      />

      {/* Version History Component */}
      {showHistory && selectedListId && selectedItemId && (
        <VersionHistory
          listId={selectedListId}
          itemId={selectedItemId}
          onClose={handleClose}
          onExport={handleExport}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};
