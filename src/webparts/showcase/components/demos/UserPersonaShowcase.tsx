import * as React from 'react';
import { Card, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseKeyFeatures, ShowcaseFeature } from '../shared/ShowcaseKeyFeatures';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { UserPersona, UserPersonaSize, UserPersonaDisplayMode } from 'spfx-toolkit/lib/components/UserPersona';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';
import { Dropdown, IDropdownOption, Toggle } from '@fluentui/react';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';

const FEATURES: ShowcaseFeature[] = [
  {
    icon: '👤',
    title: 'User Information',
    description: 'Display user profile with photo, name, and contact information from SharePoint',
    color: '#0078d4'
  },
  {
    icon: '📏',
    title: 'Multiple Sizes',
    description: 'Size variants from 24px to 100px for different UI contexts',
    color: '#107c10'
  },
  {
    icon: '🎨',
    title: 'Display Modes',
    description: 'Choose between avatar only, name only, or avatar with name display modes',
    color: '#ff8c00'
  },
  {
    icon: '⚡',
    title: 'Live Persona',
    description: 'Optional Fluent UI live persona card with rich user information on hover',
    color: '#5c2d91'
  },
  {
    icon: '🖱️',
    title: 'Interactive',
    description: 'Built-in click handlers for custom actions when user clicks the persona',
    color: '#d13438'
  },
  {
    icon: '💾',
    title: 'Profile Caching',
    description: 'Automatic profile data caching for improved performance',
    color: '#008272'
  }
];

const BASIC_EXAMPLE = `import { UserPersona } from 'spfx-toolkit/lib/components/UserPersona';

function MyComponent() {
  return (
    <UserPersona
      userIdentifier="john.doe@contoso.com"
      size={48}
      displayMode="avatarAndName"
      showLivePersona={true}
      showSecondaryText={true}
    />
  );
}`;

const ADVANCED_EXAMPLE = `import { UserPersona, UserPersonaSize } from 'spfx-toolkit/lib/components/UserPersona';

function AdvancedPersona() {
  return (
    <UserPersona
      userIdentifier="jane.smith@contoso.com"
      size={72}
      displayMode="avatarAndName"
      showLivePersona={true}
      showSecondaryText={true}
      customInitials="JS"
      onClick={(id, name) => console.log(\`Clicked: \${name}\`)}
    />
  );
}`;

const SIZES_EXAMPLE = `import { UserPersona, UserPersonaSize } from 'spfx-toolkit/lib/components/UserPersona';

// Available sizes: 24, 28, 32, 40, 48, 56, 72, 100
const sizes: UserPersonaSize[] = [24, 28, 32, 40, 48, 56, 72, 100];

function SizeDemo() {
  return (
    <div>
      {sizes.map(size => (
        <UserPersona
          key={size}
          userIdentifier="user@contoso.com"
          size={size}
          displayMode="avatarAndName"
        />
      ))}
    </div>
  );
}`;

const DISPLAY_MODES_EXAMPLE = `import { UserPersona, UserPersonaDisplayMode } from 'spfx-toolkit/lib/components/UserPersona';

function DisplayModeDemo() {
  const modes: UserPersonaDisplayMode[] = ['avatar', 'nameOnly', 'avatarAndName'];

  return (
    <>
      {modes.map(mode => (
        <UserPersona
          key={mode}
          userIdentifier="user@contoso.com"
          size={48}
          displayMode={mode}
          showLivePersona={true}
        />
      ))}
    </>
  );
}`;

export const UserPersonaShowcase: React.FC = () => {
  const [selectedSize, setSelectedSize] = React.useState<UserPersonaSize>(48);
  const [selectedDisplayMode, setSelectedDisplayMode] = React.useState<UserPersonaDisplayMode>('avatarAndName');
  const [showLivePersona, setShowLivePersona] = React.useState(true);
  const [showSecondaryText, setShowSecondaryText] = React.useState(true);
  const [userIdentifier, setUserIdentifier] = React.useState('');
  const [currentUserEmail, setCurrentUserEmail] = React.useState('');

  React.useEffect(() => {
    const email = SPContext.pageContext.user.email;
    setCurrentUserEmail(email);
    setUserIdentifier(email);
  }, []);

  const allSizes: UserPersonaSize[] = [24, 28, 32, 40, 48, 56, 72, 100];
  const allDisplayModes: UserPersonaDisplayMode[] = ['avatar', 'nameOnly', 'avatarAndName'];

  const sizeOptions: IDropdownOption[] = [
    { key: 24, text: 'Size 24 (Extra Small)' },
    { key: 28, text: 'Size 28 (Small)' },
    { key: 32, text: 'Size 32 (Small-Medium)' },
    { key: 40, text: 'Size 40 (Medium)' },
    { key: 48, text: 'Size 48 (Medium-Large)' },
    { key: 56, text: 'Size 56 (Large)' },
    { key: 72, text: 'Size 72 (Extra Large)' },
    { key: 100, text: 'Size 100 (Huge)' }
  ];

  const displayModeOptions: IDropdownOption[] = [
    { key: 'avatar', text: 'Avatar Only' },
    { key: 'nameOnly', text: 'Name Only' },
    { key: 'avatarAndName', text: 'Avatar and Name' }
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
        title="User Persona"
        subtitle="Rich user profile display with multiple sizes, display modes, and SharePoint integration"
        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        badges={['Multiple Sizes', 'Display Modes', 'Live Persona']}
        icon="👤"
      />
      <Card id="interactive-demo" elevation={3} defaultExpanded>
        <Header variant="success">Interactive Demo</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#323130'
                }}>
                  Select User
                </label>
                <PeoplePicker
                  context={SPContext.peoplepickerContext}
                  personSelectionLimit={1}
                  groupName=""
                  showtooltip={true}
                  required={false}
                  disabled={false}
                  onChange={(items: any[]) => {
                    if (items && items.length > 0) {
                      setUserIdentifier(items[0].secondaryText || items[0].text);
                    } else {
                      setUserIdentifier('');
                    }
                  }}
                  principalTypes={[PrincipalType.User]}
                  resolveDelay={300}
                  ensureUser={true}
                />
              </div>

              <Dropdown
                label="Size"
                selectedKey={selectedSize}
                onChange={(_, option) => setSelectedSize((option?.key || 48) as UserPersonaSize)}
                options={sizeOptions}
              />

              <Dropdown
                label="Display Mode"
                selectedKey={selectedDisplayMode}
                onChange={(_, option) => setSelectedDisplayMode((option?.key || 'avatarAndName') as UserPersonaDisplayMode)}
                options={displayModeOptions}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <Toggle
                label="Show Live Persona Card"
                checked={showLivePersona}
                onChange={(_, checked) => setShowLivePersona(checked || false)}
              />
              <Toggle
                label="Show Secondary Text"
                checked={showSecondaryText}
                onChange={(_, checked) => setShowSecondaryText(checked || false)}
              />
            </div>

            <div style={{
              padding: '32px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '150px'
            }}>
              {userIdentifier ? (
                <UserPersona
                  userIdentifier={userIdentifier}
                  size={selectedSize}
                  displayMode={selectedDisplayMode}
                  showLivePersona={showLivePersona}
                  showSecondaryText={showSecondaryText}
                  onClick={(id, name) => alert(`Clicked on ${name || id}`)}
                />
              ) : (
                <div style={{ color: '#a19f9d', fontStyle: 'italic' }}>
                  Enter a user identifier to see the persona
                </div>
              )}
            </div>
          </div>
        </Content>
      </Card>

      <Card id="size-variants" elevation={3} defaultExpanded style={{ marginTop: '24px' }}>
        <Header variant="info">Size Variants</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {allSizes.map(size => (
              <div
                key={size}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  backgroundColor: '#fafafa',
                  borderRadius: '4px'
                }}
              >
                <div style={{ minWidth: '120px', fontWeight: 600, fontSize: '13px' }}>
                  Size {size}px
                </div>
                <UserPersona
                  userIdentifier={currentUserEmail}
                  size={size}
                  displayMode="avatarAndName"
                  showSecondaryText={size >= 40}
                />
              </div>
            ))}
          </div>
        </Content>
      </Card>

      <Card id="display-modes" elevation={3} defaultExpanded style={{ marginTop: '24px' }}>
        <Header variant="warning">Display Modes</Header>
        <Content padding="comfortable">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {allDisplayModes.map((mode) => (
              <div
                key={mode}
                style={{
                  padding: '16px',
                  backgroundColor: '#fafafa',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
              >
                <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' }}>
                  {mode.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <UserPersona
                  userIdentifier={currentUserEmail}
                  size={48}
                  displayMode={mode}
                  showLivePersona={true}
                />
              </div>
            ))}
          </div>
        </Content>
      </Card>

      <ShowcaseKeyFeatures features={FEATURES} />

      <ShowcaseCodeSample
        id="basic-usage"
        title="Basic Usage"
        description="Simple user persona with identifier and size"
        code={BASIC_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="advanced-usage"
        title="Advanced Configuration"
        description="Full-featured persona with all options"
        code={ADVANCED_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="size-example"
        title="Size Options"
        description="All available size variants (24-100px)"
        code={SIZES_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="display-modes-example"
        title="Display Modes"
        description="Different display mode options"
        code={DISPLAY_MODES_EXAMPLE}
        language="tsx"
      />
    </div>
  );
};
