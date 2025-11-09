import { Pivot, PivotItem } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import {
  AzureDevOps,
  CodeQuality,
  Collaboration,
  CopilotInstructions,
  Debugging,
  FastServeGuide,
  FolderStructure,
  Performance,
  ProjectSetup,
  QuickStart,
  Security,
  Testing,
  ToolkitIntegration,
  UsefulLinks,
  VSCodeSetup,
} from './components/tabs';
import { DeveloperGuideTab, IDeveloperGuideProps, IDeveloperGuideTabConfig } from './types/DeveloperGuideTypes';

/**
 * Developer Guide - Comprehensive onboarding and reference documentation
 */
export const DeveloperGuide: React.FC<IDeveloperGuideProps> = ({ initialTab = 'quick-start' }) => {
  const [selectedTab, setSelectedTab] = useState<DeveloperGuideTab>(initialTab);

  /**
   * Tab configurations
   */
  const tabs: IDeveloperGuideTabConfig[] = [
    {
      key: 'quick-start',
      title: 'Quick Start',
      icon: 'Rocket',
      description: 'Get started quickly with essential setup steps',
    },
    {
      key: 'vscode-setup',
      title: 'VS Code Setup',
      icon: 'Code',
      description: 'Configure VS Code for optimal SPFx development',
    },
    {
      key: 'fast-serve',
      title: 'Fast-Serve',
      icon: 'LightningBolt',
      description: 'Enable 80% faster rebuild times',
    },
    {
      key: 'folder-structure',
      title: 'Folder Structure',
      icon: 'FabricFolderSearch',
      description: 'Project organization and file structure',
    },
    {
      key: 'toolkit-integration',
      title: 'Toolkit Integration',
      icon: 'Package',
      description: 'Using spfx-toolkit components and utilities',
    },
    {
      key: 'azure-devops',
      title: 'Azure DevOps',
      icon: 'BranchMerge',
      description: 'Git commands and Azure DevOps workflow',
    },
    {
      key: 'copilot-instructions',
      title: 'Copilot Instructions',
      icon: 'Robot',
      description: 'GitHub Copilot configuration for SPFx',
    },
    {
      key: 'project-setup',
      title: 'Project Setup',
      icon: 'Settings',
      description: 'Gulpfile, tsconfig, and npm scripts configuration',
    },
    {
      key: 'useful-links',
      title: 'Useful Links',
      icon: 'Link',
      description: 'Azure, SharePoint admin, and developer resources',
    },
    {
      key: 'code-quality',
      title: 'Code Quality',
      icon: 'CheckMark',
      description: 'ESLint, TypeScript, and code standards',
    },
    {
      key: 'debugging',
      title: 'Debugging',
      icon: 'Bug',
      description: 'Debugging setup and troubleshooting',
    },
    {
      key: 'performance',
      title: 'Performance',
      icon: 'SpeedHigh',
      description: 'Optimization techniques and best practices',
    },
    {
      key: 'testing',
      title: 'Testing',
      icon: 'TestBeaker',
      description: 'Unit testing and component testing',
    },
    {
      key: 'security',
      title: 'Security',
      icon: 'Shield',
      description: 'Security best practices and guidelines',
    },
    {
      key: 'collaboration',
      title: 'Collaboration',
      icon: 'Group',
      description: 'Team workflow and code review standards',
    },
  ];

  const handleTabChange = (item?: PivotItem): void => {
    if (item?.props.itemKey) {
      setSelectedTab(item.props.itemKey as DeveloperGuideTab);
    }
  };

  const handleNavigate = (tab: DeveloperGuideTab): void => {
    setSelectedTab(tab);
  };

  const renderTabContent = (): React.ReactElement => {
    switch (selectedTab) {
      case 'quick-start':
        return <QuickStart onNavigate={handleNavigate} />;
      case 'vscode-setup':
        return <VSCodeSetup onNavigate={handleNavigate} />;
      case 'fast-serve':
        return <FastServeGuide onNavigate={handleNavigate} />;
      case 'folder-structure':
        return <FolderStructure onNavigate={handleNavigate} />;
      case 'toolkit-integration':
        return <ToolkitIntegration onNavigate={handleNavigate} />;
      case 'azure-devops':
        return <AzureDevOps onNavigate={handleNavigate} />;
      case 'copilot-instructions':
        return <CopilotInstructions onNavigate={handleNavigate} />;
      case 'project-setup':
        return <ProjectSetup onNavigate={handleNavigate} />;
      case 'useful-links':
        return <UsefulLinks onNavigate={handleNavigate} />;
      case 'code-quality':
        return <CodeQuality onNavigate={handleNavigate} />;
      case 'debugging':
        return <Debugging onNavigate={handleNavigate} />;
      case 'performance':
        return <Performance onNavigate={handleNavigate} />;
      case 'testing':
        return <Testing onNavigate={handleNavigate} />;
      case 'security':
        return <Security onNavigate={handleNavigate} />;
      case 'collaboration':
        return <Collaboration onNavigate={handleNavigate} />;
      default:
        // Placeholder for tabs not yet implemented
        return (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: '#605e5c',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              {tabs.find(t => t.key === selectedTab)?.title}
            </div>
            <div style={{ fontSize: '14px' }}>
              Content coming soon...
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#faf9f8',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #edebe9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}>
            Developer Guide
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#605e5c' }}>
            Comprehensive onboarding and reference documentation for SPFx development
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #edebe9',
          overflowX: 'auto',
        }}
      >
        <Pivot
          selectedKey={selectedTab}
          onLinkClick={handleTabChange}
          linkSize="normal"
          linkFormat="tabs"
          styles={{
            root: {
              padding: '0 24px',
            },
            itemContainer: {
              padding: '0',
            },
          }}
        >
          {tabs.map(tab => (
            <PivotItem
              key={tab.key}
              itemKey={tab.key}
              headerText={tab.title}
              itemIcon={tab.icon}
            />
          ))}
        </Pivot>
      </div>

      {/* Tab content */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#faf9f8',
          padding: '24px',
          overflowY: 'auto',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DeveloperGuide;
