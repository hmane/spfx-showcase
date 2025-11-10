import * as React from 'react';
import { Card, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseKeyFeatures, ShowcaseFeature } from '../shared/ShowcaseKeyFeatures';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { GroupViewer } from 'spfx-toolkit/lib/components/GroupViewer';
import SPContext from 'spfx-toolkit/lib/utilities/context';
import { Dropdown, IDropdownOption, TextField, MessageBar, MessageBarType, Spinner } from '@fluentui/react';

const FEATURES: ShowcaseFeature[] = [
  {
    icon: '👥',
    title: 'Group Display',
    description: 'Display SharePoint group information with icon, name, or both',
    color: '#0078d4'
  },
  {
    icon: '🔗',
    title: 'Nested Groups',
    description: 'Support for displaying nested SharePoint groups up to configurable depth',
    color: '#107c10'
  },
  {
    icon: '🎨',
    title: 'Display Modes',
    description: 'Choose between icon only, name only, or icon and name display modes',
    color: '#ff8c00'
  },
  {
    icon: '💾',
    title: 'Caching',
    description: 'Built-in caching mechanism for improved performance',
    color: '#5c2d91'
  },
  {
    icon: '🖱️',
    title: 'Interactive',
    description: 'Optional click handlers for custom actions when group is clicked',
    color: '#d13438'
  },
  {
    icon: '⚙️',
    title: 'Customizable',
    description: 'Custom icons, sizes, and styling options for flexibility',
    color: '#008272'
  }
];

const BASIC_EXAMPLE = `import { GroupViewer } from 'spfx-toolkit/lib/components/GroupViewer';

function MyComponent() {
  return (
    <GroupViewer
      groupId={5}
      groupName="Team Members"
      displayMode="iconAndName"
      size={24}
    />
  );
}`;

const ADVANCED_EXAMPLE = `import { GroupViewer } from 'spfx-toolkit/lib/components/GroupViewer';

function AdvancedGroupViewer() {
  return (
    <GroupViewer
      groupId={5}
      groupName="Team Members"
      displayMode="iconAndName"
      size={32}
      iconName="Group"
      onClick={(groupName, groupId) => {
        console.log(\`Clicked: \${groupName} (ID: \${groupId})\`);
      }}
      onError={(error) => {
        console.error('Group viewer error:', error);
      }}
      maxNestLevel={2}
      bustCache={false}
    />
  );
}`;

const DISPLAY_MODES_EXAMPLE = `import { GroupViewer } from 'spfx-toolkit/lib/components/GroupViewer';

function DisplayModes() {
  return (
    <>
      {/* Icon Only */}
      <GroupViewer
        groupName="Site Members"
        groupId={3}
        displayMode="icon"
        size={24}
      />

      {/* Name Only */}
      <GroupViewer
        groupName="Site Members"
        groupId={3}
        displayMode="name"
      />

      {/* Icon and Name */}
      <GroupViewer
        groupName="Site Members"
        groupId={3}
        displayMode="iconAndName"
        size={24}
      />
    </>
  );
}`;

const NESTED_EXAMPLE = `import { GroupViewer } from 'spfx-toolkit/lib/components/GroupViewer';

function NestedGroups() {
  return (
    <GroupViewer
      groupName="Parent Group"
      groupId={10}
      displayMode="iconAndName"
      maxNestLevel={3}
      nestLevel={0}
    />
  );
}`;

export const GroupViewerShowcase: React.FC = () => {
  const [groupId, setGroupId] = React.useState<number>(5);
  const [groupName, setGroupName] = React.useState<string>('Site Members');
  const [displayMode, setDisplayMode] = React.useState<'icon' | 'name' | 'iconAndName'>('iconAndName');
  const [size, setSize] = React.useState<number>(24);
  const [groups, setGroups] = React.useState<IDropdownOption[]>([]);
  const [loadingGroups, setLoadingGroups] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadGroups = React.useCallback(async (): Promise<void> => {
    try {
      setLoadingGroups(true);
      const sp = SPContext.sp;
      const siteGroups = await (sp.web as any).siteGroups();

      const groupOptions: IDropdownOption[] = siteGroups.map((group: any) => ({
        key: group.Id,
        text: group.Title
      }));

      setGroups(groupOptions);
      if (groupOptions.length > 0) {
        setGroupId(groupOptions[0].key as number);
        setGroupName(groupOptions[0].text);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load SharePoint groups. Using default values.');
      setGroups([
        { key: 3, text: 'Site Members' },
        { key: 4, text: 'Site Owners' },
        { key: 5, text: 'Site Visitors' }
      ]);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  React.useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const displayModeOptions: IDropdownOption[] = [
    { key: 'icon', text: 'Icon Only' },
    { key: 'name', text: 'Name Only' },
    { key: 'iconAndName', text: 'Icon and Name' }
  ];

  const sizeOptions: IDropdownOption[] = [
    { key: 16, text: '16px (Small)' },
    { key: 20, text: '20px' },
    { key: 24, text: '24px (Default)' },
    { key: 32, text: '32px (Large)' },
    { key: 40, text: '40px (X-Large)' }
  ];

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
        title="Group Viewer"
        subtitle="Display SharePoint group information with customizable display modes and nested group support"
        gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        badges={['Display Modes', 'Nested Groups', 'Cached']}
        icon="👥"
      />
      <Card id="interactive-demo" elevation={3} defaultExpanded>
        <Header variant="success">Interactive Demo</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <MessageBar messageBarType={MessageBarType.warning} onDismiss={() => setError(null)}>
                {error}
              </MessageBar>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {loadingGroups ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Spinner />
                  <span>Loading groups...</span>
                </div>
              ) : (
                <Dropdown
                  label="Select SharePoint Group"
                  selectedKey={groupId}
                  onChange={(_, option) => {
                    setGroupId((option?.key || 5) as number);
                    setGroupName(option?.text || 'Unknown Group');
                  }}
                  options={groups}
                />
              )}

              <Dropdown
                label="Display Mode"
                selectedKey={displayMode}
                onChange={(_, option) => setDisplayMode((option?.key || 'iconAndName') as 'icon' | 'name' | 'iconAndName')}
                options={displayModeOptions}
              />

              <Dropdown
                label="Icon Size"
                selectedKey={size}
                onChange={(_, option) => setSize((option?.key || 24) as number)}
                options={sizeOptions}
              />
            </div>

            <TextField
              label="Group Name"
              value={groupName}
              onChange={(_, val) => setGroupName(val || '')}
              description="You can manually edit the group name"
            />

            <div style={{
              padding: '32px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100px'
            }}>
              <GroupViewer
                groupId={groupId}
                groupName={groupName}
                displayMode={displayMode}
                size={size}
                onClick={(name, id) => {
                  alert(`Clicked on: ${name} (ID: ${id})`);
                }}
              />
            </div>

            <MessageBar messageBarType={MessageBarType.info}>
              <strong>Tip:</strong> Try different display modes and sizes to see how the group viewer adapts.
            </MessageBar>
          </div>
        </Content>
      </Card>

      <Card id="display-modes-demo" elevation={3} defaultExpanded style={{ marginTop: '24px' }}>
        <Header variant="info">Display Mode Comparison</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Icon Only</div>
              <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                <GroupViewer
                  groupId={groupId}
                  groupName={groupName}
                  displayMode="icon"
                  size={24}
                />
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Name Only</div>
              <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                <GroupViewer
                  groupId={groupId}
                  groupName={groupName}
                  displayMode="name"
                />
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Icon and Name</div>
              <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                <GroupViewer
                  groupId={groupId}
                  groupName={groupName}
                  displayMode="iconAndName"
                  size={24}
                />
              </div>
            </div>
          </div>
        </Content>
      </Card>

      <ShowcaseKeyFeatures features={FEATURES} />

      <ShowcaseCodeSample
        id="basic-usage"
        title="Basic Usage"
        description="Simple group viewer with group ID and name"
        code={BASIC_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="advanced-usage"
        title="Advanced Configuration"
        description="Full-featured group viewer with all options"
        code={ADVANCED_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="display-modes"
        title="Display Modes"
        description="Different display modes for various use cases"
        code={DISPLAY_MODES_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="nested-groups"
        title="Nested Groups"
        description="Support for nested SharePoint groups"
        code={NESTED_EXAMPLE}
        language="tsx"
      />
    </div>
  );
};
