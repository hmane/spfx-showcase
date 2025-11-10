import * as React from 'react';
import { Card, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseKeyFeatures, ShowcaseFeature } from '../shared/ShowcaseKeyFeatures';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { useLocalStorage, useViewport } from 'spfx-toolkit/lib/hooks';
import { TextField, DefaultButton, Toggle, MessageBar, MessageBarType } from '@fluentui/react';

const FEATURES: ShowcaseFeature[] = [
  {
    icon: '💾',
    title: 'useLocalStorage',
    description: 'Persistent state management with browser localStorage, automatic serialization, and SSR support',
    color: '#0078d4'
  },
  {
    icon: '📱',
    title: 'useViewport',
    description: 'Responsive design hook with breakpoint detection, orientation tracking, and window size monitoring',
    color: '#107c10'
  },
  {
    icon: '🔄',
    title: 'Auto-sync',
    description: 'Automatically sync state across tabs and components with real-time updates',
    color: '#ff8c00'
  },
  {
    icon: '⚡',
    title: 'Performance Optimized',
    description: 'Debounced updates, memoized values, and efficient re-rendering for optimal performance',
    color: '#5c2d91'
  },
  {
    icon: '🎯',
    title: 'Type-safe',
    description: 'Full TypeScript support with generic types for strong typing and IntelliSense',
    color: '#d13438'
  },
  {
    icon: '🛠️',
    title: 'Developer Experience',
    description: 'Simple API matching React.useState with additional utilities for common use cases',
    color: '#008272'
  }
];

const LOCAL_STORAGE_EXAMPLE = `import { useLocalStorage } from 'spfx-toolkit/lib/hooks';

function MyComponent() {
  // Simple usage - works like useState but persists to localStorage
  const [name, setName] = useLocalStorage('user-name', 'John Doe');
  const [settings, setSettings] = useLocalStorage('app-settings', {
    theme: 'light',
    notifications: true
  });

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={() => setSettings({ ...settings, theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  );
}`;

const VIEWPORT_EXAMPLE = `import { useViewport } from 'spfx-toolkit/lib/hooks';

function ResponsiveComponent() {
  const {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    breakpoint
  } = useViewport();

  return (
    <div>
      <p>Screen: {width}x{height}</p>
      <p>Device: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</p>
      <p>Orientation: {orientation}</p>
      <p>Breakpoint: {breakpoint}</p>

      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}`;

const ADVANCED_LOCALSTORAGE = `import { useLocalStorage } from 'spfx-toolkit/lib/hooks';

function AdvancedExample() {
  // Store complex objects
  const [user, setUser] = useLocalStorage('current-user', {
    id: 0,
    name: '',
    preferences: {
      language: 'en',
      timezone: 'UTC'
    }
  });

  // Store arrays
  const [recentItems, setRecentItems] = useLocalStorage('recent-items', []);

  // Update nested properties
  const updateLanguage = (lang: string) => {
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        language: lang
      }
    });
  };

  // Add to array
  const addRecentItem = (item: any) => {
    setRecentItems([item, ...recentItems.slice(0, 9)]); // Keep last 10
  };

  // Clear storage
  const clearData = () => {
    setUser(null);
    setRecentItems([]);
  };

  return (
    <div>
      <button onClick={() => updateLanguage('es')}>Switch to Spanish</button>
      <button onClick={() => addRecentItem({ id: Date.now() })}>Add Recent</button>
      <button onClick={clearData}>Clear All</button>
    </div>
  );
}`;

const RESPONSIVE_DESIGN = `import { useViewport } from 'spfx-toolkit/lib/hooks';

function ResponsiveGrid() {
  const { breakpoint, isMobile } = useViewport();

  // Adjust grid columns based on breakpoint
  const columns = React.useMemo(() => {
    switch (breakpoint) {
      case 'xs':
      case 'sm':
        return 1;
      case 'md':
        return 2;
      case 'lg':
        return 3;
      default:
        return 4;
    }
  }, [breakpoint]);

  // Adjust card size for mobile
  const cardSize = isMobile ? 'compact' : 'regular';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: \`repeat(\${columns}, 1fr)\`,
      gap: '16px'
    }}>
      {items.map(item => (
        <Card key={item.id} size={cardSize}>
          {item.content}
        </Card>
      ))}
    </div>
  );
}`;

interface UserPreferences {
  theme: string;
  language: string;
  notifications: boolean;
  autoSave: boolean;
}

export const HooksShowcase: React.FC = () => {
  // useLocalStorage demo - returns {value, setValue, removeValue, isLoading, error}
  const userNameStorage = useLocalStorage('demo-user-name', 'Guest User');
  const preferencesStorage = useLocalStorage<UserPreferences>('demo-preferences', {
    theme: 'light',
    language: 'en',
    notifications: true,
    autoSave: false
  });
  const counterStorage = useLocalStorage('demo-counter', 0);

  // useViewport demo
  const viewport = useViewport();

  const clearAllStorage = (): void => {
    userNameStorage.removeValue();
    preferencesStorage.removeValue();
    counterStorage.removeValue();
  };

  const getDeviceIcon = (): string => {
    if (viewport.isMobile) return '📱';
    if (viewport.isTablet) return '💻';
    return '🖥️';
  };

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
        title="React Hooks"
        subtitle="Powerful custom hooks for state persistence and responsive design in SharePoint Framework"
        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        badges={['useLocalStorage', 'useViewport', 'Type-safe']}
        icon="🎣"
      />
      <Card id="localstorage-demo" elevation={3} defaultExpanded>
        <Header variant="success">useLocalStorage Demo</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MessageBar messageBarType={MessageBarType.info}>
              Data is automatically saved to localStorage and persists across page refreshes.
              Open DevTools → Application → Local Storage to see the stored values.
            </MessageBar>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <TextField
                  label="User Name (String)"
                  value={userNameStorage.value}
                  onChange={(_, val) => userNameStorage.setValue(val || '')}
                  description="Changes persist across refreshes"
                />
              </div>

              <div>
                <div style={{ marginBottom: '8px', fontWeight: 600 }}>Counter (Number)</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <DefaultButton
                    text="-"
                    onClick={() => counterStorage.setValue(counterStorage.value - 1)}
                  />
                  <div style={{
                    padding: '8px 24px',
                    backgroundColor: '#f3f2f1',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '18px'
                  }}>
                    {counterStorage.value}
                  </div>
                  <DefaultButton
                    text="+"
                    onClick={() => counterStorage.setValue(counterStorage.value + 1)}
                  />
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: '12px' }}>Preferences (Object)</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <Toggle
                  label="Notifications"
                  checked={preferencesStorage.value.notifications}
                  onChange={(_, checked) =>
                    preferencesStorage.setValue({ ...preferencesStorage.value, notifications: checked || false })
                  }
                />
                <Toggle
                  label="Auto-save"
                  checked={preferencesStorage.value.autoSave}
                  onChange={(_, checked) =>
                    preferencesStorage.setValue({ ...preferencesStorage.value, autoSave: checked || false })
                  }
                />
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Current localStorage values:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({
                  'demo-user-name': userNameStorage.value,
                  'demo-counter': counterStorage.value,
                  'demo-preferences': preferencesStorage.value
                }, null, 2)}
              </pre>
            </div>

            <div>
              <DefaultButton
                text="Clear All Storage"
                onClick={clearAllStorage}
                iconProps={{ iconName: 'Delete' }}
              />
            </div>
          </div>
        </Content>
      </Card>

      <Card id="viewport-demo" elevation={3} defaultExpanded style={{ marginTop: '24px' }}>
        <Header variant="info">useViewport Demo</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MessageBar messageBarType={MessageBarType.info}>
              Resize your browser window to see the viewport values change in real-time.
            </MessageBar>

            <div style={{
              display: 'grid',
              gridTemplateColumns: viewport.isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{getDeviceIcon()}</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Device Type</div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>
                  {viewport.isMobile ? 'Mobile' : viewport.isTablet ? 'Tablet' : 'Desktop'}
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#fff3e0',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📐</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Dimensions</div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>
                  {viewport.width} × {viewport.height}
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#f3e5f5',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔄</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Orientation</div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>
                  {viewport.orientation}
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Breakpoint</div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>
                  {viewport.breakpoint}
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Full viewport object:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({
                  width: viewport.width,
                  height: viewport.height,
                  isMobile: viewport.isMobile,
                  isTablet: viewport.isTablet,
                  isDesktop: viewport.isDesktop,
                  orientation: viewport.orientation,
                  breakpoint: viewport.breakpoint
                }, null, 2)}
              </pre>
            </div>

            <div style={{
              padding: '16px',
              border: `2px solid ${viewport.isMobile ? '#ff8c00' : viewport.isTablet ? '#0078d4' : '#107c10'}`,
              borderRadius: '8px',
              backgroundColor: viewport.isMobile ? '#fff4e6' : viewport.isTablet ? '#e3f2fd' : '#e8f5e9'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Responsive Layout Example</div>
              <div style={{ fontSize: '13px', color: '#605e5c' }}>
                This card's border color and background change based on the device type:
                <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                  <li>Orange/Beige = Mobile</li>
                  <li>Blue/Light Blue = Tablet</li>
                  <li>Green/Light Green = Desktop</li>
                </ul>
              </div>
            </div>
          </div>
        </Content>
      </Card>

      <ShowcaseKeyFeatures features={FEATURES} />

      <ShowcaseCodeSample
        id="localstorage-basic"
        title="useLocalStorage - Basic Usage"
        description="Persist state to localStorage with a simple useState-like API"
        code={LOCAL_STORAGE_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="viewport-basic"
        title="useViewport - Basic Usage"
        description="Build responsive UIs with real-time viewport information"
        code={VIEWPORT_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="localstorage-advanced"
        title="useLocalStorage - Advanced Patterns"
        description="Store complex objects, arrays, and implement advanced update patterns"
        code={ADVANCED_LOCALSTORAGE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="viewport-responsive"
        title="useViewport - Responsive Design"
        description="Create adaptive layouts that respond to screen size changes"
        code={RESPONSIVE_DESIGN}
        language="tsx"
      />
    </div>
  );
};
