import { DefaultButton, PrimaryButton } from '@fluentui/react';
import * as React from 'react';
import { IVersionInfo, VersionHistory } from 'spfx-toolkit/lib/components/VersionHistory';
import { ShowcaseCodeSample } from './ShowcaseCodeSample';
import { ShowcaseHero } from './ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from './ShowcaseKeyFeatures';

const VERSION_HISTORY_SAMPLE = `import * as React from 'react';
import { PrimaryButton } from '@fluentui/react';
import { VersionHistory } from 'spfx-toolkit/lib/components/VersionHistory';

export const VersionHistoryTrigger: React.FC = () => {
  const [showHistory, setShowHistory] = React.useState(false);

  return (
    <>
      <PrimaryButton onClick={() => setShowHistory(true)}>View version history</PrimaryButton>

      {showHistory && (
        <VersionHistory
          listId="00000000-0000-0000-0000-000000000000"
          itemId={42}
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
  const [selectedDemo, setSelectedDemo] = React.useState<'document' | 'list' | 'custom'>(
    'document'
  );
  const [customListId, setCustomListId] = React.useState('b52d80b2-d67c-4bd3-945b-671d3f2445f7');
  const [customItemId, setCustomItemId] = React.useState('2');
  const [activityLog, setActivityLog] = React.useState<string[]>([]);

  // Demo data - Replace with your actual list/item IDs for testing
  const demoData = {
    document: {
      listId: '07950eb9-7523-4e7e-9c78-19d719e06c7d',
      itemId: 2,
      title: 'Sample Document.docx',
      description: 'Document library with file versions',
    },
    list: {
      listId: 'b52d80b2-d67c-4bd3-945b-671d3f2445f7',
      itemId: 1,
      title: 'Task #1',
      description: 'List item with metadata changes',
    },
  };

  const addLog = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  }, []);

  const handleOpenHistory = React.useCallback(() => {
    setShowHistory(true);
    addLog(`Opening version history for ${selectedDemo}`);
  }, [selectedDemo, addLog]);

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

  const handleOpenCustom = React.useCallback(() => {
    if (!customListId || !customItemId) {
      alert('Please enter both List ID and Item ID');
      return;
    }
    setShowHistory(true);
    addLog(`Opening custom item: List ${customListId}, Item ${customItemId}`);
  }, [customListId, customItemId, addLog]);

  const clearLog = React.useCallback(() => {
    setActivityLog([]);
  }, []);

  const getCurrentConfig = (): { listId: string; itemId: number } => {
    if (selectedDemo === 'custom') {
      return {
        listId: customListId,
        itemId: parseInt(customItemId, 10) || 0,
      };
    }
    return demoData[selectedDemo];
  };

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

        {/* Demo Type Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#323130',
            }}
          >
            Select Demo Type:
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedDemo('document')}
              style={{
                padding: '10px 20px',
                border: selectedDemo === 'document' ? '2px solid #0078d4' : '1px solid #d2d0ce',
                background: selectedDemo === 'document' ? '#eff6fc' : 'white',
                color: selectedDemo === 'document' ? '#0078d4' : '#323130',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedDemo === 'document' ? '600' : '400',
              }}
            >
              Document Library
            </button>
            <button
              onClick={() => setSelectedDemo('list')}
              style={{
                padding: '10px 20px',
                border: selectedDemo === 'list' ? '2px solid #0078d4' : '1px solid #d2d0ce',
                background: selectedDemo === 'list' ? '#eff6fc' : 'white',
                color: selectedDemo === 'list' ? '#0078d4' : '#323130',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedDemo === 'list' ? '600' : '400',
              }}
            >
              List Item
            </button>
            <button
              onClick={() => setSelectedDemo('custom')}
              style={{
                padding: '10px 20px',
                border: selectedDemo === 'custom' ? '2px solid #0078d4' : '1px solid #d2d0ce',
                background: selectedDemo === 'custom' ? '#eff6fc' : 'white',
                color: selectedDemo === 'custom' ? '#0078d4' : '#323130',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedDemo === 'custom' ? '600' : '400',
              }}
            >
              Custom Configuration
            </button>
          </div>
        </div>

        {/* Demo Description */}
        {selectedDemo !== 'custom' && (
          <div
            style={{
              background: '#eff6fc',
              padding: '16px',
              borderRadius: '6px',
              border: '1px solid #deecf9',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#323130' }}>
              {demoData[selectedDemo].title}
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#605e5c' }}>
              {demoData[selectedDemo].description}
            </p>
            <div style={{ fontSize: '12px', color: '#605e5c', fontFamily: 'monospace' }}>
              <div>List ID: {demoData[selectedDemo].listId}</div>
              <div>Item ID: {demoData[selectedDemo].itemId}</div>
            </div>
          </div>
        )}

        {/* Custom Configuration */}
        {selectedDemo === 'custom' && (
          <div
            style={{
              background: '#fff4ce',
              padding: '16px',
              borderRadius: '6px',
              border: '1px solid #ffe69c',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#323130' }}>
              Custom Configuration
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#323130',
                  }}
                >
                  List ID (GUID):
                </label>
                <input
                  type='text'
                  value={customListId}
                  onChange={e => setCustomListId(e.target.value)}
                  placeholder='e.g., abc123-def456-ghi789'
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d2d0ce',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#323130',
                  }}
                >
                  Item ID:
                </label>
                <input
                  type='number'
                  value={customItemId}
                  onChange={e => setCustomItemId(e.target.value)}
                  placeholder='e.g., 42'
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d2d0ce',
                    borderRadius: '4px',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {selectedDemo === 'custom' ? (
            <PrimaryButton
              text='Open Custom Item'
              iconProps={{ iconName: 'History' }}
              onClick={handleOpenCustom}
              disabled={!customListId || !customItemId}
            />
          ) : (
            <PrimaryButton
              text='Open Version History'
              iconProps={{ iconName: 'History' }}
              onClick={handleOpenHistory}
            />
          )}
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
      {showHistory && (
        <VersionHistory
          {...getCurrentConfig()}
          onClose={handleClose}
          onExport={handleExport}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};
