import * as React from 'react';
import { useCallback, useState } from 'react';
import { Card, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { GroupViewer } from 'spfx-toolkit/lib/components/GroupViewer/GroupViewer';
import { ManageAccessComponent } from 'spfx-toolkit/lib/components/ManageAccess/ManageAccessComponent';
import { IPermissionPrincipal } from 'spfx-toolkit/lib/components/ManageAccess/types';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';
import { ShowcaseCodeSample } from './ShowcaseCodeSample';
import { ShowcaseHero } from './ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from './ShowcaseKeyFeatures';
import { ListPicker } from '@pnp/spfx-controls-react/lib/ListPicker';
import { ListItemPicker } from '@pnp/spfx-controls-react/lib/ListItemPicker';

const MANAGE_ACCESS_SAMPLE = `import * as React from 'react';
import { useState } from 'react';
import { ManageAccessComponent } from 'spfx-toolkit/lib/components/ManageAccess/ManageAccessComponent';
import { IPermissionPrincipal } from 'spfx-toolkit/lib/components/ManageAccess/types';
import { ListPicker } from '@pnp/spfx-controls-react/lib/ListPicker';
import { ListItemPicker } from '@pnp/spfx-controls-react/lib/ListItemPicker';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';

export const DocumentPermissions: React.FC = () => {
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<number>();

  const handlePermissionChanged = async (
    operation: 'add' | 'remove',
    principals: IPermissionPrincipal[],
  ): Promise<boolean> => {
    console.log(operation, principals);
    return true;
  };

  return (
    <div>
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
        <ManageAccessComponent
          listId={selectedListId}
          itemId={selectedItemId}
          permissionTypes="both"
          maxAvatars={4}
          enabled={true}
          onPermissionChanged={handlePermissionChanged}
          onError={error => console.error(error)}
        />
      )}
    </div>
  );
};`;

const MANAGE_ACCESS_FEATURES: ShowcaseFeature[] = [
  {
    icon: '🪪',
    title: 'LivePersona Cards',
    description: 'Hover avatars for presence-ready Microsoft 365 personas out of the box.',
    color: '#5b8def',
  },
  {
    icon: '🛠️',
    title: 'Bi-directional Actions',
    description: 'Add or remove users and groups with async callbacks to persist changes.',
    color: '#2f9e44',
  },
  {
    icon: '🔒',
    title: 'Read-Only Mode',
    description: 'Toggle editing to switch between interactive management and audit views.',
    color: '#f08c00',
  },
  {
    icon: '📜',
    title: 'Activity Logging',
    description: 'Built-in debug console surfaces operations, errors, and selected groups.',
    color: '#7048e8',
  },
];

const MANAGE_ACCESS_BADGES = ['LivePersona ready', 'Permission aware', 'Async callbacks'];

export const PermissionShowcase: React.FC = () => {
  const [lastAction, setLastAction] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isEditEnabled, setIsEditEnabled] = useState(true);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
  }, []);

  const handlePermissionChange = useCallback(
    async (operation: 'add' | 'remove', principals: IPermissionPrincipal[]): Promise<boolean> => {
      const action = `${operation.toUpperCase()}: ${principals
        .map(p => `${p.displayName} (${p.permissionLevel})`)
        .join(', ')}`;

      setLastAction(action);
      addLog(action);

      await new Promise(resolve => setTimeout(resolve, 1000));

      SPContext.logger.info('PermissionShowcase permission changed', {
        operation,
        count: principals.length,
      });

      return true;
    },
    [addLog]
  );

  const handleError = useCallback(
    (error: string) => {
      setLastAction(`ERROR: ${error}`);
      addLog(`ERROR: ${error}`);
      SPContext.logger.error('PermissionShowcase error', new Error(error));
    },
    [addLog]
  );

  const handleGroupClick = useCallback(
    (name: string, id?: number) => {
      const action = `Group clicked: ${name} (ID: ${id})`;
      setLastAction(action);
      addLog(action);
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
        minHeight: '100vh',
      }}
    >
      <ShowcaseHero
        title='SharePoint Permission Components'
        subtitle='Enterprise-ready manage-access tooling with LivePersona integration and precision permission detection.'
        gradient='linear-gradient(135deg, #4834d4 0%, #22a6b3 100%)'
        badges={MANAGE_ACCESS_BADGES}
        icon='🔐'
      />

      {/* Quick Toggles */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowDebug(!showDebug)}
          style={{
            padding: '10px 20px',
            background: showDebug ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {showDebug ? 'Hide' : 'Show'} Debug Console
        </button>
        <button
          onClick={() => setIsEditEnabled(!isEditEnabled)}
          style={{
            padding: '10px 20px',
            background: isEditEnabled ? '#0078d4' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {isEditEnabled ? 'Disable' : 'Enable'} Editing
        </button>
      </div>

      {/* Debug Console */}
      {showDebug && (
        <Card id='debug-console' elevation={2} style={{ marginBottom: '24px' }}>
          <Header variant='warning'>Debug Console</Header>
          <Content>
            <div
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '16px',
                borderRadius: '8px',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '13px',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {debugLogs.length === 0 ? (
                <div style={{ color: '#808080' }}>Waiting for activity...</div>
              ) : (
                debugLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>
                    {log}
                  </div>
                ))
              )}
              {lastAction && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: lastAction.startsWith('ERROR') ? '#722f37' : '#155724',
                    borderRadius: '4px',
                    color: lastAction.startsWith('ERROR') ? '#f8d7da' : '#d4edda',
                  }}
                >
                  Last Action: {lastAction}
                </div>
              )}
            </div>
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => {
                  setDebugLogs([]);
                  setLastAction('');
                }}
                style={{
                  padding: '8px 16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Clear Logs
              </button>
            </div>
          </Content>
        </Card>
      )}

      {/* Main Demo */}
      <Card id='document-permission-demo' defaultExpanded={true} elevation={3} style={{ marginBottom: '24px' }}>
        <Header variant='success'>Interactive Demo: Document Permission Management</Header>
        <Content padding='comfortable'>
          <div
            style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
            }}
          >
            {/* List and Item Selection */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#212529' }}>
                Select List and Item
              </h4>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                  Choose a List or Document Library:
                </label>
                <ListPicker
                  context={SPContext.context.context}
                  label=''
                  placeHolder='Select a list or library'
                  includeHidden={false}
                  multiSelect={false}
                  onSelectionChanged={(lists) => {
                    const listId = typeof lists === 'string' ? lists : (Array.isArray(lists) && lists.length > 0 ? lists[0] : '');
                    setSelectedListId(listId);
                    setSelectedItemId(undefined); // Reset item when list changes
                    addLog(`List selected: ${listId}`);
                  }}
                />
              </div>

              {selectedListId && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                    Choose an Item:
                  </label>
                  <ListItemPicker
                    key={selectedListId}
                    listId={selectedListId}
                    columnInternalName='Title'
                    itemLimit={1}
                    context={SPContext.context.context}
                    placeholder='Select an item'
                    onSelectedItem={(items) => {
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
            </div>

            {/* Show ManageAccess only when item is selected */}
            {selectedListId && selectedItemId && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  paddingTop: '24px',
                  borderTop: '2px solid #e9ecef',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                  }}
                >
                  📊
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: '#212529' }}>
                    Selected Item (ID: {selectedItemId})
                  </h3>
                  <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                    Manage permissions • {isEditEnabled ? 'Editable' : 'Read-only'}
                  </p>
                </div>
                <div>
                  <ManageAccessComponent
                    itemId={selectedItemId}
                    listId={selectedListId}
                    permissionTypes='both'
                    maxAvatars={5}
                    enabled={isEditEnabled}
                    onPermissionChanged={handlePermissionChange}
                    onError={handleError}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                background: isEditEnabled ? '#e7f3ff' : '#fff3cd',
                border: `1px solid ${isEditEnabled ? '#84c5ff' : '#ffeaa7'}`,
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h4
                style={{
                  margin: '0 0 12px 0',
                  color: isEditEnabled ? '#0056b3' : '#856404',
                  fontSize: '16px',
                }}
              >
                {isEditEnabled ? 'Try These Features:' : 'Read-Only Mode Active'}
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '24px',
                  color: isEditEnabled ? '#004085' : '#856404',
                  lineHeight: '1.8',
                }}
              >
                {isEditEnabled ? (
                  <>
                    <li>
                      <strong>Select a list or library</strong> from your SharePoint site
                    </li>
                    <li>
                      <strong>Choose an item</strong> from the selected list
                    </li>
                    <li>
                      <strong>Hover over avatars</strong> to see LivePersona cards
                    </li>
                    <li>
                      <strong>Click &quot;Manage access&quot;</strong> to open the permission panel
                    </li>
                    <li>
                      <strong>Add or remove users</strong> and watch the debug console
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>View-only mode:</strong> You can see permissions but cannot modify
                      them
                    </li>
                    <li>
                      <strong>Click &quot;Enable Editing&quot;</strong> above to allow permission changes
                    </li>
                    <li>
                      <strong>Useful for:</strong> Read-only dashboards, archived documents, or
                      restricted scenarios
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </Content>
      </Card>

      {/* GroupViewer Demo - unchanged */}
      <Card id='group-viewer-demo' defaultExpanded={true} style={{ marginBottom: '24px' }}>
        <Header variant='info'>GroupViewer: Display SharePoint Groups</Header>
        <Content padding='comfortable'>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              { name: 'Site Owners', id: 3, icon: '👑', color: '#dc3545' },
              { name: 'Site Members', id: 4, icon: '👥', color: '#0078d4' },
              { name: 'Site Visitors', id: 5, icon: '👁️', color: '#28a745' },
            ].map(group => (
              <div
                key={group.id}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = group.color;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${group.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e9ecef';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      fontSize: '32px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${group.color}15`,
                      borderRadius: '10px',
                    }}
                  >
                    {group.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                      {group.name}
                    </div>
                    <GroupViewer
                      groupId={group.id}
                      groupName={group.name}
                      displayMode='iconAndName'
                      size={28}
                      onClick={handleGroupClick}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f0f0f0',
                    fontSize: '13px',
                    color: '#6c757d',
                  }}
                >
                  Hover to see members • Click to interact
                </div>
              </div>
            ))}
          </div>
        </Content>
      </Card>

      <ShowcaseKeyFeatures features={MANAGE_ACCESS_FEATURES} />

      <ShowcaseCodeSample
        id='manage-access-sample'
        title='Manage Access Component Usage'
        description='Embed SharePoint permission management with LivePersona support using a few props and async handlers.'
        code={MANAGE_ACCESS_SAMPLE}
        language='tsx'
      />
    </div>
  );
};
