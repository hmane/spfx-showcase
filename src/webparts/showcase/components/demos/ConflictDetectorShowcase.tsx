import { DefaultButton, Dropdown, IDropdownOption, PrimaryButton, Toggle } from '@fluentui/react';
import * as React from 'react';
import {
  useConflictDetection,
  ConflictNotificationBar,
  ConflictResolutionDialog,
  ConflictInfo,
  ConflictResolutionAction,
} from 'spfx-toolkit/lib/components/ConflictDetector';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';
import { ListPicker } from '@pnp/spfx-controls-react/lib/ListPicker';
import { ListItemPicker } from '@pnp/spfx-controls-react/lib/ListItemPicker';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';

const CONFLICT_HOOK_SAMPLE = `import * as React from 'react';
import { useConflictDetection, ConflictNotificationBar } from 'spfx-toolkit/lib/components/ConflictDetector';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';

export const EditForm: React.FC<{ listId: string; itemId: number }> = ({ listId, itemId }) => {
  const {
    hasConflict,
    conflictInfo,
    isChecking,
    error,
    initialize,
    checkForConflicts,
    updateSnapshot,
  } = useConflictDetection({
    sp: SPContext.sp,
    listId,
    itemId,
    enabled: true,
    options: {
      checkInterval: 30000, // Check every 30 seconds
      checkOnSave: true,
      showNotification: true,
    },
  });

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSave = async () => {
    const hasConflicts = await checkForConflicts();
    if (hasConflicts) {
      // Show conflict resolution dialog
      return;
    }
    // Proceed with save
  };

  return (
    <>
      <ConflictNotificationBar
        conflictInfo={conflictInfo}
        isChecking={isChecking}
        error={error}
        position="inline"
        showActions={true}
        onRefresh={updateSnapshot}
      />
      {/* Your form fields */}
      <button onClick={handleSave}>Save</button>
    </>
  );
};`;

const CONFLICT_DIALOG_SAMPLE = `import * as React from 'react';
import { ConflictResolutionDialog, ConflictInfo, ConflictResolutionAction } from 'spfx-toolkit/lib/components/ConflictDetector';

export const ConflictDialogDemo: React.FC<{
  conflictInfo: ConflictInfo;
  onResolve: (action: ConflictResolutionAction) => void;
}> = ({ conflictInfo, onResolve }) => {
  const [showDialog, setShowDialog] = React.useState(true);

  return (
    <ConflictResolutionDialog
      isOpen={showDialog}
      conflictInfo={conflictInfo}
      showOverwriteOption={true}
      showRefreshOption={true}
      showCancelOption={true}
      customTitle="Changes Detected"
      customMessage="Another user has modified this record. How would you like to proceed?"
      onResolve={async (action) => {
        await onResolve(action);
        setShowDialog(false);
      }}
      onDismiss={() => setShowDialog(false)}
    />
  );
};`;

const CONFLICT_NOTIFICATION_SAMPLE = `import * as React from 'react';
import { ConflictNotificationBar, ConflictInfo } from 'spfx-toolkit/lib/components/ConflictDetector';

export const NotificationDemo: React.FC<{ conflictInfo: ConflictInfo }> = ({ conflictInfo }) => {
  return (
    <ConflictNotificationBar
      conflictInfo={conflictInfo}
      isChecking={false}
      error={undefined}
      position="fixed-top" // or "fixed-bottom", "inline"
      showDismiss={true}
      showActions={true}
      onRefresh={() => {
        console.log('User chose to refresh');
        // Reload data
      }}
      onOverwrite={() => {
        console.log('User chose to overwrite');
        // Proceed with save
      }}
      onDismiss={() => {
        console.log('User dismissed notification');
      }}
    />
  );
};`;

const CONFLICT_FEATURES: ShowcaseFeature[] = [
  {
    icon: '🔍',
    title: 'Real-time Detection',
    description: 'Automatically polls for changes using SharePoint ETags and Modified timestamps.',
    color: '#1e90ff',
  },
  {
    icon: '🪝',
    title: 'React Hook Integration',
    description: 'useConflictDetection hook for easy integration with React components and forms.',
    color: '#20c997',
  },
  {
    icon: '📢',
    title: 'Notification Components',
    description: 'Pre-built notification bar and dialog for conflict resolution UI.',
    color: '#f59f00',
  },
  {
    icon: '🔄',
    title: 'Resolution Actions',
    description: 'Refresh, overwrite, or cancel - let users choose how to handle conflicts.',
    color: '#845ef7',
  },
  {
    icon: '⚡',
    title: 'Pre-Save Checks',
    description: 'Built-in pre-save validation to prevent data loss before submission.',
    color: '#e64980',
  },
  {
    icon: '🛡️',
    title: 'Memory Safe',
    description: 'Automatic cleanup of polling intervals and proper disposal on unmount.',
    color: '#15aabf',
  },
];

const CONFLICT_BADGES = ['ETag-based', 'Polling Support', 'Fluent UI', 'TypeScript'];

const positionOptions: IDropdownOption[] = [
  { key: 'inline', text: 'Inline' },
  { key: 'fixed-top', text: 'Fixed Top' },
  { key: 'fixed-bottom', text: 'Fixed Bottom' },
];

/**
 * Complete showcase demonstrating ConflictDetector component features
 */
export const ConflictDetectorShowcase: React.FC = () => {
  const [selectedListId, setSelectedListId] = React.useState<string>('');
  const [selectedItemId, setSelectedItemId] = React.useState<number | undefined>(undefined);
  const [notificationPosition, setNotificationPosition] = React.useState<'inline' | 'fixed-top' | 'fixed-bottom'>('inline');
  const [showActions, setShowActions] = React.useState<boolean>(true);
  const [showDismiss, setShowDismiss] = React.useState<boolean>(true);
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [activityLog, setActivityLog] = React.useState<string[]>([]);

  // Use the conflict detection hook
  const {
    hasConflict,
    conflictInfo,
    isChecking,
    error,
    lastChecked,
    initialize,
    checkForConflicts,
    updateSnapshot,
    dispose,
  } = useConflictDetection({
    sp: SPContext.sp,
    listId: selectedListId,
    itemId: selectedItemId || 0,
    enabled: Boolean(selectedListId && selectedItemId),
    options: {
      checkInterval: 0, // Manual checking for demo
      logConflicts: true,
      checkOnSave: true,
      showNotification: true,
      blockSave: false,
      notificationPosition: 'inline',
    },
  });

  const addLog = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  }, []);

  const clearLog = React.useCallback(() => {
    setActivityLog([]);
  }, []);

  // Initialize when list and item are selected
  React.useEffect(() => {
    if (selectedListId && selectedItemId) {
      addLog(`Initializing conflict detection for List: ${selectedListId}, Item: ${selectedItemId}`);
      void initialize().then(success => {
        if (success) {
          addLog('Conflict detection initialized successfully');
        } else {
          addLog('Failed to initialize conflict detection');
        }
      });
    }

    return () => {
      dispose();
    };
  }, [selectedListId, selectedItemId]);

  const handleCheckConflicts = React.useCallback(async () => {
    addLog('Checking for conflicts...');
    const hasConflicts = await checkForConflicts();
    if (hasConflicts) {
      addLog('CONFLICT DETECTED! Another user has modified this item.');
      setShowDialog(true);
    } else {
      addLog('No conflicts detected - item is unchanged.');
    }
  }, [checkForConflicts, addLog]);

  const handleRefresh = React.useCallback(async () => {
    addLog('Refreshing snapshot...');
    await updateSnapshot();
    addLog('Snapshot refreshed successfully');
    setShowDialog(false);
  }, [updateSnapshot, addLog]);

  const handleOverwrite = React.useCallback(() => {
    addLog('User chose to overwrite - proceeding with save');
    setShowDialog(false);
  }, [addLog]);

  const handleResolve = React.useCallback(
    async (action: ConflictResolutionAction) => {
      addLog(`Resolution action: ${action.type} - ${action.message}`);
      switch (action.type) {
        case 'refresh':
          await handleRefresh();
          break;
        case 'overwrite':
          handleOverwrite();
          break;
        case 'cancel':
          addLog('User cancelled the operation');
          setShowDialog(false);
          break;
      }
    },
    [handleRefresh, handleOverwrite, addLog]
  );

  // Create a mock conflict for demo purposes
  const mockConflictInfo: ConflictInfo = React.useMemo(() => ({
    hasConflict: true,
    originalVersion: '1.0',
    currentVersion: '2.0',
    lastModifiedBy: 'John Doe',
    lastModifiedByEmail: 'john.doe@company.com',
    lastModified: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    originalModified: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    itemId: selectedItemId || 1,
    listId: selectedListId || 'DemoList',
  }), [selectedListId, selectedItemId]);

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
        title='ConflictDetector Component'
        subtitle='Real-time conflict detection and resolution for concurrent editing scenarios.'
        gradient='linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)'
        badges={CONFLICT_BADGES}
        icon='⚠️'
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
            label="Notification Position"
            selectedKey={notificationPosition}
            options={positionOptions}
            onChange={(_, option) => option && setNotificationPosition(option.key as 'inline' | 'fixed-top' | 'fixed-bottom')}
          />
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Toggle
            label="Show Actions"
            checked={showActions}
            onChange={(_, checked) => setShowActions(checked ?? true)}
          />
          <Toggle
            label="Show Dismiss"
            checked={showDismiss}
            onChange={(_, checked) => setShowDismiss(checked ?? true)}
          />
        </div>
      </div>

      {/* List and Item Selection */}
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
          Live Demo - Select a List Item
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
          <>
            <div
              style={{
                background: '#eff6fc',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #deecf9',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#323130' }}>
                Detection Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '13px' }}>
                <div>
                  <strong>Has Conflict:</strong>{' '}
                  <span style={{ color: hasConflict ? '#d13438' : '#107c10' }}>
                    {hasConflict ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <strong>Is Checking:</strong> {isChecking ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Last Checked:</strong>{' '}
                  {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
                </div>
                {conflictInfo && (
                  <>
                    <div>
                      <strong>Current Version:</strong> {conflictInfo.currentVersion || 'N/A'}
                    </div>
                    <div>
                      <strong>Modified By:</strong> {conflictInfo.lastModifiedBy || 'Unknown'}
                    </div>
                  </>
                )}
                {error && (
                  <div style={{ gridColumn: '1 / -1', color: '#d13438' }}>
                    <strong>Error:</strong> {error}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <PrimaryButton
                text='Check for Conflicts'
                iconProps={{ iconName: 'Sync' }}
                onClick={handleCheckConflicts}
                disabled={isChecking}
              />
              <DefaultButton
                text='Update Snapshot'
                iconProps={{ iconName: 'Refresh' }}
                onClick={handleRefresh}
                disabled={isChecking}
              />
              <DefaultButton
                text='Simulate Conflict'
                iconProps={{ iconName: 'Warning' }}
                onClick={() => {
                  addLog('Simulating conflict scenario...');
                  setShowDialog(true);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Notification Bar Demo */}
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
          Notification Bar Preview
        </h2>
        <p style={{ margin: '0 0 16px 0', color: '#605e5c' }}>
          This shows how the notification bar looks when a conflict is detected:
        </p>

        <ConflictNotificationBar
          conflictInfo={mockConflictInfo}
          isChecking={false}
          error={undefined}
          position={notificationPosition === 'inline' ? 'inline' : notificationPosition}
          showDismiss={showDismiss}
          showActions={showActions}
          onRefresh={() => addLog('Notification: Refresh clicked')}
          onOverwrite={() => addLog('Notification: Overwrite clicked')}
          onDismiss={() => addLog('Notification: Dismissed')}
        />
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
              No activity yet. Select a list item and check for conflicts...
            </div>
          ) : (
            activityLog.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 0',
                  borderBottom: index < activityLog.length - 1 ? '1px solid #333' : 'none',
                  color: log.includes('CONFLICT') ? '#ff6b6b' : log.includes('Error') ? '#ff6b6b' : '#d4d4d4',
                }}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <ShowcaseKeyFeatures features={CONFLICT_FEATURES} />

      <ShowcaseCodeSample
        id='conflict-hook-sample'
        title='Using the useConflictDetection Hook'
        description='Integrate conflict detection with your React forms using the provided hook.'
        code={CONFLICT_HOOK_SAMPLE}
        language='tsx'
      />

      <ShowcaseCodeSample
        id='conflict-dialog-sample'
        title='Conflict Resolution Dialog'
        description='Show a dialog when conflicts are detected to let users choose how to proceed.'
        code={CONFLICT_DIALOG_SAMPLE}
        language='tsx'
      />

      <ShowcaseCodeSample
        id='conflict-notification-sample'
        title='Notification Bar'
        description='Display an inline or fixed notification bar for conflict alerts.'
        code={CONFLICT_NOTIFICATION_SAMPLE}
        language='tsx'
      />

      {/* Conflict Resolution Dialog */}
      {showDialog && (
        <ConflictResolutionDialog
          isOpen={showDialog}
          conflictInfo={mockConflictInfo}
          showOverwriteOption={true}
          showRefreshOption={true}
          showCancelOption={true}
          customTitle="Conflict Detected"
          customMessage="Another user has modified this record while you were editing. How would you like to proceed?"
          onResolve={handleResolve}
          onDismiss={() => {
            addLog('Dialog dismissed');
            setShowDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default ConflictDetectorShowcase;
