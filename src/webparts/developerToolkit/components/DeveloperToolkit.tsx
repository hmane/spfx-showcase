import { Icon } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import { CSSProperties, useMemo, useState } from 'react';

// Tool imports
import { DeveloperUtilities } from './DeveloperUtilities/DeveloperUtilities';
import { CamlQueryBuilder } from './CamlQueryBuilder/CamlQueryBuilder';
import { DeveloperGuide } from './DeveloperGuide/DeveloperGuide';
import { FormGenerator } from './FormGenerator/FormGenerator';
import { SPFormBuilder } from './SPFormBuilder/SPFormBuilder';

// Define the structure for a toolkit item
interface ToolkitItem {
  id: string;
  name: string;
  component: React.FC<any>;
  description?: string;
  icon?: string;
  requiresContext?: boolean;
  showViewportControls?: boolean;
}

// Toolkit configuration
const toolkitSections: ToolkitItem[] = [
  {
    id: 'developer-utilities',
    name: 'Developer Utilities',
    component: DeveloperUtilities,
    description: 'Collection of 17 developer utilities for text, JSON, XML, and more',
    icon: 'DeveloperTools',
    requiresContext: false,
    showViewportControls: false,
  },
  {
    id: 'developer-guide',
    name: 'Developer Guide',
    component: DeveloperGuide,
    description: 'Comprehensive onboarding and reference documentation for SPFx development',
    icon: 'ReadingMode',
    requiresContext: false,
    showViewportControls: false,
  },
  {
    id: 'caml-builder',
    name: 'CAML Query Builder',
    component: CamlQueryBuilder,
    description: 'Visual CAML query builder for SharePoint with templates and validation',
    icon: 'QueryList',
    requiresContext: true,
    showViewportControls: false,
  },
  {
    id: 'form-generator',
    name: 'Form Generator',
    component: FormGenerator,
    description: 'Generate complete forms with Zod schemas from TypeScript types',
    icon: 'FormLibrary',
    requiresContext: false,
    showViewportControls: false,
  },
  {
    id: 'spform-builder',
    name: 'SPForm Builder',
    component: SPFormBuilder,
    description: 'Auto-generate TypeScript interfaces, forms, CRUD operations from SharePoint lists',
    icon: 'Generate',
    requiresContext: true,
    showViewportControls: false,
  },
];

// Enhanced styles
interface ComponentStyles {
  container: CSSProperties;
  header: CSSProperties;
  headerNav: CSSProperties;
  pageLink: (isActive: boolean) => CSSProperties;
  title: CSSProperties;
  subtitle: CSSProperties;
  tabContainer: CSSProperties;
  tab: (isSelected: boolean) => CSSProperties;
  content: CSSProperties;
  showcase: CSSProperties;
}

export interface IDeveloperToolkitProps {
  context?: WebPartContext;
}

/**
 * Developer Toolkit container with tools for SPFx development
 */
export const DeveloperToolkit: React.FC<IDeveloperToolkitProps> = ({ context }) => {
  const [selectedToolId, setSelectedToolId] = useState<string>(toolkitSections[0]?.id || '');

  const selectedTool = useMemo(() => {
    return toolkitSections.find(tool => tool.id === selectedToolId);
  }, [selectedToolId]);

  const SelectedComponent = selectedTool?.component;

  const injectDevExtremeCSS = (): void => {
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

  const styles: ComponentStyles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#212529',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
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
      margin: '0 0 20px 0',
      fontWeight: 400,
    },
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
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }),
    content: {
      backgroundColor: '#ffffff',
      minHeight: 'calc(100vh - 250px)',
      position: 'relative',
    },
    showcase: {
      backgroundColor: '#ffffff',
      overflow: 'auto',
      minHeight: '400px',
      position: 'relative',
      padding: '0',
    },
  };

  return (
    <div style={styles.container}>
      {/* Enhanced Header */}
      <header style={styles.header}>
        {/* Page Navigation */}
        <nav style={styles.headerNav}>
          <a
            href="Showcase.aspx"
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
            <Icon iconName="Page" />
            <span>Components Showcase</span>
          </a>
          <button
            type="button"
            style={styles.pageLink(true)}
            disabled
          >
            <Icon iconName="DeveloperTools" />
            <span>Developer Toolkit</span>
          </button>
        </nav>

        <h1 style={styles.title}>Developer Toolkit</h1>
        <p style={styles.subtitle}>Comprehensive tools for SPFx development</p>

        <nav style={styles.tabContainer} role='tablist' aria-label='Developer toolkit tabs'>
          {toolkitSections.map(tool => (
            <button
              key={tool.id}
              style={styles.tab(selectedToolId === tool.id)}
              type='button'
              onClick={() => setSelectedToolId(tool.id)}
              role='tab'
              aria-selected={selectedToolId === tool.id}
              aria-controls={`toolkit-panel-${tool.id}`}
              id={`toolkit-tab-${tool.id}`}
            >
              {tool.icon && <Icon iconName={tool.icon} />}
              {tool.name}
            </button>
          ))}
        </nav>
      </header>

      {/* Content Area */}
      <main
        style={styles.content}
        role='tabpanel'
        aria-labelledby={selectedTool ? `toolkit-tab-${selectedTool.id}` : undefined}
        id={selectedTool ? `toolkit-panel-${selectedTool.id}` : undefined}
      >
        {selectedTool && SelectedComponent ? (
          <div style={styles.showcase}>
            {selectedTool?.requiresContext && context ? (
              <SelectedComponent context={context} />
            ) : (
              <SelectedComponent />
            )}
          </div>
        ) : (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: '#6c757d', fontSize: '1.1rem' }}>
            Select a tool to get started
          </div>
        )}
      </main>
    </div>
  );
};

export default DeveloperToolkit;
