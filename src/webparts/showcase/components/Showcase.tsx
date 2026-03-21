import { Icon } from '@fluentui/react';
import * as React from 'react';
import { CSSProperties, useMemo, useState } from 'react';
import { CardShowcase } from './demos/CardShowcase';
import { DocumentLinkShowcase } from './demos/DocumentLinkShowcase';
import ErrorBoundaryShowcase from './demos/ErrorBoundaryShowcase';
import { FormShowcaseComplete } from './demos/FormShowcase';
import { GroupUserPickerShowcase } from './demos/GroupUserPickerShowcase';
import { PermissionShowcase } from './demos/ManageAccessShowcase';
import { SPFieldsShowcase } from './demos/SPFieldsShowcase';
import { SPDynamicFormShowcase } from './demos/SPDynamicFormShowcase';
import { VersionHistoryShowcase } from './demos/VersionHistoryShowcase';
import { WorkflowStepperShowcase } from './demos/WorkflowStepperShowcase';
import { ConflictDetectorShowcase } from './demos/ConflictDetectorShowcase';
import { SPListItemAttachmentsShowcase } from './demos/SPListItemAttachmentsShowcase';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { GroupViewerShowcase } from './demos/GroupViewerShowcase';
import { HooksShowcase } from './demos/HooksShowcase';
import { UserPersonaShowcase } from './demos/UserPersonaShowcase';
import { DialogServiceShowcase } from './demos/DialogServiceShowcase';
import { CommentsShowcase } from './demos/CommentsShowcase';

// Define the structure for a showcase item
interface ShowcaseItem {
  id: string;
  name: string;
  component: React.FC<any>;
  description?: string;
  status?: 'Stable' | 'Beta' | 'New';
  category?: string;
  requiresContext?: boolean;
}


// Enhanced showcase configuration with metadata organized by category
const showcases: ShowcaseItem[] = [
  // UI Components Category
  {
    id: 'card',
    name: 'Card System',
    component: CardShowcase,
    description: 'Flexible card components with maximize, loading states, and lazy loading',
    status: 'Stable',
    category: 'UI Components',
  },
  {
    id: 'form',
    name: 'Form Components',
    component: FormShowcaseComplete,
    description: 'DevExtreme inputs with React Hook Form and Zod validation',
    status: 'Stable',
    category: 'UI Components',
  },
  {
    id: 'sp-fields',
    name: 'SharePoint Fields',
    component: SPFieldsShowcase,
    description: 'Comprehensive suite of 10 SharePoint field components with React Hook Form integration',
    status: 'Stable',
    category: 'UI Components',
  },
  {
    id: 'sp-dynamic-form',
    name: 'SP Dynamic Form',
    component: SPDynamicFormShowcase,
    description: 'Auto-generate complete forms from SharePoint lists with sections, validation, and attachments',
    status: 'New',
    category: 'SharePoint Integration',
    requiresContext: true,
  },
  {
    id: 'group-user-picker',
    name: 'Group User Picker',
    component: GroupUserPickerShowcase,
    description: 'User selection from SharePoint groups with single/multi-select',
    status: 'Stable',
    category: 'UI Components',
  },
  {
    id: 'group-viewer',
    name: 'Group Viewer',
    component: GroupViewerShowcase,
    description: 'Display SharePoint group members with search, multiple views, and lazy loading',
    status: 'Stable',
    category: 'UI Components',
  },
  {
    id: 'user-persona',
    name: 'User Persona',
    component: UserPersonaShowcase,
    description: 'User profile display with multiple sizes, presence indicators, and hover cards',
    status: 'Stable',
    category: 'UI Components',
  },
  {
    id: 'workflow-stepper',
    name: 'Workflow Stepper',
    component: WorkflowStepperShowcase,
    description: 'Step-by-step workflow navigation with interactive content',
    status: 'Stable',
    category: 'UI Components',
  },
  {
    id: 'conflict-detector',
    name: 'Conflict Detector',
    component: ConflictDetectorShowcase,
    description: 'Real-time concurrent editing conflict detection and resolution',
    status: 'Stable',
    category: 'SharePoint Integration',
    requiresContext: true,
  },
  {
    id: 'attachments',
    name: 'List Item Attachments',
    component: SPListItemAttachmentsShowcase,
    description: 'Drag-and-drop file attachments with previews and validation',
    status: 'New',
    category: 'SharePoint Integration',
    requiresContext: true,
  },
  {
    id: 'comments',
    name: 'Comments',
    component: CommentsShowcase,
    description: 'SharePoint list item comments with mentions, file links, search, and timeline layouts',
    status: 'New',
    category: 'SharePoint Integration',
    requiresContext: true,
  },

  // SharePoint Integration Category
  {
    id: 'manage-access',
    name: 'Manage Access',
    component: PermissionShowcase,
    description: 'Permission and access control management components',
    status: 'Stable',
    category: 'SharePoint Integration',
  },
  {
    id: 'document-link',
    name: 'Document Link',
    component: DocumentLinkShowcase,
    description: 'Document linking with preview, hover cards, and multiple layout options',
    status: 'Stable',
    category: 'SharePoint Integration',
  },
  {
    id: 'version-history',
    name: 'Version History',
    component: VersionHistoryShowcase,
    description: 'View and manage document version history with field change tracking',
    status: 'Stable',
    category: 'SharePoint Integration',
  },

  // Error Handling & Utilities Category
  {
    id: 'error-boundary',
    name: 'Error Boundary',
    component: ErrorBoundaryShowcase,
    description: 'Smart error handling with classification and recovery options',
    status: 'Stable',
    category: 'Error Handling',
  },

  // Hooks Category
  {
    id: 'hooks',
    name: 'React Hooks',
    component: HooksShowcase,
    description: 'useLocalStorage and useViewport hooks for state persistence and responsive design',
    status: 'Stable',
    category: 'Hooks',
  },

  // Utilities Category
  {
    id: 'dialog-service',
    name: 'Dialog Service',
    component: DialogServiceShowcase,
    description: 'Loading overlays, alerts, and confirmation dialogs with JSX support and promise-based API',
    status: 'New',
    category: 'Utilities',
  },
];

// Enhanced styles for better presentation
interface ComponentStyles {
  container: CSSProperties;
  header: CSSProperties;
  headerNav: CSSProperties;
  pageLink: (isActive: boolean) => CSSProperties;
  title: CSSProperties;
  subtitle: CSSProperties;
  filters: CSSProperties;
  searchWrapper: CSSProperties;
  searchIcon: CSSProperties;
  searchInput: CSSProperties;
  statusFilters: CSSProperties;
  filterButton: (isActive: boolean) => CSSProperties;
  tabContainer: CSSProperties;
  tab: (isSelected: boolean) => CSSProperties;
  content: CSSProperties;
  componentHeader: CSSProperties;
  componentTitle: CSSProperties;
  componentMeta: CSSProperties;
  badge: CSSProperties;
  showcase: CSSProperties;
  viewportControls: CSSProperties;
  widthSlider: CSSProperties;
  viewportButton: (isActive: boolean, viewMode: string) => CSSProperties;
  fullscreenButton: (isActive: boolean) => CSSProperties;
  emptyState: CSSProperties;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile' | 'custom';

export interface IShowcaseProps {
  context?: WebPartContext;
}

/**
 * Enhanced showcase container for your existing component demos
 */
export const Showcase: React.FC<IShowcaseProps> = ({ context }) => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>(showcases[0]?.id || '');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [customWidth, setCustomWidth] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categoryOptions = useMemo<string[]>(() => {
    const uniqueCategories = new Set<string>();
    showcases.forEach(showcase => {
      if (showcase.category) {
        uniqueCategories.add(showcase.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, []);

  const injectDevExtremeCSS = (theme: string = 'dx.material.blue.light'): void => {
    const existingLink = document.querySelector('link[href*="devextreme"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://cdn3.devexpress.com/jslib/22.2.3/css/dx.light.css`;
      link.onload = (): void => { console.log('DevExtreme CSS loaded successfully'); };
      link.onerror = (): void => { console.warn('Failed to load DevExtreme CSS'); };
      document.head.appendChild(link);
    }
  };

  // Inject DevExtreme CSS on component mount
  React.useEffect(() => {
    injectDevExtremeCSS();
  }, []);

  const filteredShowcases = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return showcases.filter(showcase => {
      const matchesCategory =
        categoryFilter === 'all' || (showcase.category && showcase.category === categoryFilter);
      const matchesSearch =
        !normalizedSearch ||
        showcase.name.toLowerCase().includes(normalizedSearch) ||
        (showcase.description || '').toLowerCase().includes(normalizedSearch) ||
        (showcase.category || '').toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, categoryFilter]);

  React.useEffect(() => {
    if (!filteredShowcases.length) {
      return;
    }

    const isSelectedVisible = filteredShowcases.some(showcase => showcase.id === selectedComponentId);
    if (!isSelectedVisible) {
      setSelectedComponentId(filteredShowcases[0].id);
    }
  }, [filteredShowcases, selectedComponentId]);

  const selectedShowcase = useMemo(() => {
    return filteredShowcases.find(showcase => showcase.id === selectedComponentId);
  }, [filteredShowcases, selectedComponentId]);

  const SelectedComponent = selectedShowcase?.component;

  const getViewportWidth = (): number => {
    switch (viewMode) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      case 'desktop':
        return 1200;
      case 'custom':
        return (customWidth / 100) * (isFullscreen ? window.innerWidth : 1200);
      default:
        return 1200;
    }
  };

  const getViewportWidthForMode = (mode: ViewMode): number => {
    switch (mode) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      case 'desktop':
        return 1200;
      default:
        return 1200;
    }
  };

  const handleViewModeChange = (mode: ViewMode): void => {
    setViewMode(mode);
    if (mode !== 'custom') {
      // Sync slider with preset widths
      const maxWidth = isFullscreen ? window.innerWidth : 1200;
      const newWidth = (getViewportWidthForMode(mode) / maxWidth) * 100;
      setCustomWidth(Math.min(100, Math.max(20, newWidth)));
    }
  };

  const handleSliderChange = (value: number): void => {
    setCustomWidth(value);
    setViewMode('custom');
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      Stable: '#4caf50',
      Beta: '#ff9800',
      New: '#2196f3',
    };
    return colors[status] || '#757575';
  };

  const styles: ComponentStyles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#212529',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      right: isFullscreen ? 0 : 'auto',
      bottom: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto',
    },
    header: {
      backgroundColor: '#ffffff',
      padding: '16px 24px 0 24px',
      borderBottom: '1px solid #dee2e6',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    },
    headerNav: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #e9ecef',
    },
    pageLink: (isActive: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '0.9rem',
      fontWeight: 500,
      color: isActive ? '#005a9e' : '#495057',
      backgroundColor: isActive ? '#e7f3ff' : 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
    }),
    title: {
      fontSize: '2rem',
      fontWeight: 700,
      margin: '0 0 8px 0',
      color: '#1a1a1a',
    },
    subtitle: {
      fontSize: '1rem',
      color: '#6c757d',
      margin: '0 0 16px 0',
      fontWeight: 400,
    },
    filters: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '16px',
      alignItems: 'center',
    },
    searchWrapper: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f1f3f5',
      borderRadius: '6px',
      padding: '6px 10px',
      border: '1px solid #dee2e6',
      flex: '1 1 240px',
      maxWidth: '320px',
    },
    searchIcon: {
      fontSize: '16px',
      color: '#6c757d',
      marginRight: '8px',
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: '0.95rem',
      flex: 1,
      color: '#212529',
    },
    statusFilters: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    filterButton: (isActive: boolean) => ({
      backgroundColor: isActive ? '#005a9e' : 'transparent',
      color: isActive ? '#ffffff' : '#005a9e',
      border: '1px solid #005a9e',
      borderRadius: '16px',
      padding: '6px 14px',
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    tabContainer: {
      display: 'flex',
      gap: '4px',
      overflowX: 'auto',
      paddingBottom: '1px',
      scrollbarWidth: 'thin',
    },
    tab: (isSelected: boolean) => ({
      padding: '14px 20px',
      cursor: 'pointer',
      border: '1px solid transparent',
      borderBottom: '3px solid',
      borderBottomColor: isSelected ? '#005a9e' : 'transparent',
      marginBottom: '-1px',
      fontWeight: isSelected ? 600 : 500,
      color: isSelected ? '#005a9e' : '#495057',
      transition: 'all 0.2s ease',
      borderRadius: '8px 8px 0 0',
      backgroundColor: isSelected ? '#ffffff' : 'transparent',
      whiteSpace: 'nowrap',
      fontSize: '0.95rem',
      position: 'relative',
    }),
    content: {
      backgroundColor: '#ffffff',
      minHeight: isFullscreen ? 'calc(100vh - 200px)' : 'calc(100vh - 250px)',
      position: 'relative',
    },
    componentHeader: {
      padding: '24px 24px 20px 24px',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#ffffff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '16px',
    },
    componentTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      margin: '0',
      color: '#1a1a1a',
    },
    componentMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    badge: {
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '0.8rem',
      fontWeight: 500,
      border: '1px solid transparent',
      backgroundColor: selectedShowcase?.status
        ? getStatusColor(selectedShowcase.status)
        : '#757575',
      color: 'white',
    },
    showcase: {
      backgroundColor: '#ffffff',
      overflow: 'auto',
      height: isFullscreen ? 'calc(100vh - 200px)' : 'auto',
      minHeight: '400px',
      position: 'relative',
      padding: '0',
    },
    viewportControls: {
      padding: '16px 24px',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    widthSlider: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.85rem',
      color: '#6c757d',
    },
    viewportButton: (isActive: boolean, mode: string) => ({
      backgroundColor: isActive ? '#005a9e' : '#ffffff',
      color: isActive ? '#ffffff' : '#6c757d',
      border: `1px solid ${isActive ? '#005a9e' : '#dee2e6'}`,
      padding: mode === 'custom' ? '8px 12px' : '6px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: mode === 'custom' ? '0.85rem' : '14px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      justifyContent: 'center',
      width: mode === 'custom' ? 'auto' : '28px',
      height: mode === 'custom' ? 'auto' : '28px',
    }),
    fullscreenButton: (isActive: boolean) => ({
      backgroundColor: isActive ? '#28a745' : 'transparent',
      color: isActive ? '#ffffff' : '#28a745',
      border: '1px solid #28a745',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
    }),
    emptyState: {
      padding: '60px 40px',
      textAlign: 'center',
      color: '#6c757d',
      fontSize: '1.1rem',
    },
  };

  return (
    <div style={styles.container}>
      {/* Enhanced Header */}
      <header style={styles.header}>
        {/* Page Navigation */}
        <nav style={styles.headerNav}>
          <button
            type="button"
            style={styles.pageLink(true)}
            disabled
          >
            <Icon iconName="Page" />
            <span>Components Showcase</span>
          </button>
          <a
            href="DevToolkit.aspx"
            style={styles.pageLink(false)}
            onMouseEnter={(e) => {
              if (!e.currentTarget.style.backgroundColor || e.currentTarget.style.backgroundColor === 'transparent') {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (e.currentTarget.style.backgroundColor === 'rgb(248, 249, 250)') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <Icon iconName="DeveloperTools" />
            <span>Developer Toolkit</span>
          </a>
        </nav>

        <h1 style={styles.title}>Component Library Showcase</h1>
        <p style={styles.subtitle}>Interactive demos of your component library</p>

        <div style={styles.filters}>
          <label style={styles.searchWrapper}>
            <Icon iconName='Search' style={styles.searchIcon} />
            <input
              type='search'
              placeholder='Search components...'
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              style={styles.searchInput}
              aria-label='Search components'
            />
          </label>

          <div style={styles.statusFilters} aria-label='Filter by category'>
            <button
              type='button'
              style={styles.filterButton(categoryFilter === 'all')}
              onClick={() => setCategoryFilter('all')}
            >
              All Categories
            </button>
            {categoryOptions.map(category => (
              <button
                key={category}
                type='button'
                style={styles.filterButton(categoryFilter === category)}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <nav style={styles.tabContainer} role='tablist' aria-label='Component showcase tabs'>
          {filteredShowcases.map(showcase => (
            <button
              key={showcase.id}
              style={styles.tab(selectedComponentId === showcase.id)}
              type='button'
              onClick={() => setSelectedComponentId(showcase.id)}
              role='tab'
              aria-selected={selectedComponentId === showcase.id}
              aria-controls={`showcase-panel-${showcase.id}`}
              id={`showcase-tab-${showcase.id}`}
            >
              {showcase.name}
            </button>
          ))}
        </nav>
      </header>

      {/* Content Area */}
      <main
        style={styles.content}
        role='tabpanel'
        aria-labelledby={selectedShowcase ? `showcase-tab-${selectedShowcase.id}` : undefined}
        id={selectedShowcase ? `showcase-panel-${selectedShowcase.id}` : undefined}
      >
        {filteredShowcases.length === 0 ? (
          <div style={styles.emptyState}>
            No components match your current filters. Try clearing the search or status filter.
          </div>
        ) : selectedShowcase && SelectedComponent ? (
          <>
            {/* Component Header */}
            <div style={styles.componentHeader}>
              <div style={{ flex: 1 }}>
                <h2 style={styles.componentTitle}>{selectedShowcase.name}</h2>
                {selectedShowcase.description && (
                  <p style={{ margin: '8px 0 0 0', color: '#6c757d', fontSize: '1rem' }}>
                    {selectedShowcase.description}
                  </p>
                )}
              </div>

              {/* Compact Viewport Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginLeft: '16px',
                  flexShrink: 0,
                }}
              >
                {/* Width Slider */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: '#6c757d',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Width:</span>
                    <input
                      type='range'
                      min='20'
                      max='100'
                      value={customWidth}
                      onChange={e => handleSliderChange(Number(e.target.value))}
                      style={{ width: '200px' }}
                    />
                    <span style={{ minWidth: '35px', fontSize: '0.75rem' }}>
                      {Math.round(customWidth)}%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>
                    {Math.round(getViewportWidth())}px
                  </span>
                </div>

                {/* Viewport Icons */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    style={styles.viewportButton(viewMode === 'mobile', 'mobile')}
                    onClick={() => handleViewModeChange('mobile')}
                    title='Mobile (375px)'
                    type='button'
                    aria-pressed={viewMode === 'mobile'}
                  >
                    <Icon iconName='CellPhone' />
                  </button>
                  <button
                    style={styles.viewportButton(viewMode === 'tablet', 'tablet')}
                    onClick={() => handleViewModeChange('tablet')}
                    title='Tablet (768px)'
                    type='button'
                    aria-pressed={viewMode === 'tablet'}
                  >
                    <Icon iconName='Tablet' />
                  </button>
                  <button
                    style={styles.viewportButton(viewMode === 'desktop', 'desktop')}
                    onClick={() => handleViewModeChange('desktop')}
                    title='Desktop (1200px)'
                    type='button'
                    aria-pressed={viewMode === 'desktop'}
                  >
                    <Icon iconName='TVMonitor' />
                  </button>
                  <button
                    style={styles.fullscreenButton(isFullscreen)}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    onMouseEnter={e => {
                      if (!isFullscreen) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isFullscreen) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    type='button'
                    aria-pressed={isFullscreen}
                  >
                    {isFullscreen ? (
                      <Icon iconName='ChromeMinimize' />
                    ) : (
                      <Icon iconName='ChromeRestore' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Component Showcase */}
            <div style={styles.showcase}>
              <div
                style={{
                  width: `${getViewportWidth()}px`,
                  maxWidth: '100%',
                  margin: '0 auto',
                  backgroundColor: '#ffffff',
                  minHeight: '100%',
                  border: viewMode !== 'desktop' ? '1px solid #dee2e6' : 'none',
                  borderRadius: viewMode !== 'desktop' ? '8px' : '0',
                  boxShadow: viewMode !== 'desktop' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {selectedShowcase?.requiresContext && context ? (
                  <SelectedComponent context={context} />
                ) : (
                  <SelectedComponent />
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            Select a component to view its demonstration
          </div>
        )}
      </main>
    </div>
  );
};

export default Showcase;
