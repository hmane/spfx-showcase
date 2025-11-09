import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { IFolderNode, ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { FolderTree } from '../shared/FolderTree';
import { Section } from '../shared/Section';

/**
 * Folder Structure tab - Project organization and file conventions
 */
export const FolderStructure: React.FC<ITabComponentProps> = () => {
  const projectStructure: IFolderNode = {
    name: 'spfx-project',
    type: 'folder',
    children: [
      {
        name: 'config',
        type: 'folder',
        description: 'Build configuration files',
        children: [
          { name: 'config.json', type: 'file', description: 'SPFx configuration' },
          { name: 'deploy-azure-storage.json', type: 'file', description: 'Azure CDN deployment' },
          { name: 'package-solution.json', type: 'file', description: 'Solution packaging' },
          { name: 'serve.json', type: 'file', description: 'Dev server settings' },
          { name: 'write-manifests.json', type: 'file', description: 'Manifest generation' },
        ],
      },
      {
        name: 'fast-serve',
        type: 'folder',
        description: 'Fast-serve webpack configuration',
        children: [{ name: 'webpack-extend.js', type: 'file', description: 'Webpack customization' }],
      },
      {
        name: 'src',
        type: 'folder',
        description: 'Source code',
        children: [
          {
            name: 'webparts',
            type: 'folder',
            description: 'Web part components',
            children: [
              {
                name: 'myWebPart',
                type: 'folder',
                children: [
                  {
                    name: 'components',
                    type: 'folder',
                    description: 'React components',
                    children: [
                      { name: 'MyComponent.tsx', type: 'file' },
                      { name: 'MyComponent.module.scss', type: 'file' },
                    ],
                  },
                  {
                    name: 'services',
                    type: 'folder',
                    description: 'Business logic & API calls',
                    children: [
                      { name: 'DataService.ts', type: 'file' },
                      { name: 'SPService.ts', type: 'file' },
                    ],
                  },
                  {
                    name: 'store',
                    type: 'folder',
                    description: 'Zustand stores',
                    children: [{ name: 'useMyStore.ts', type: 'file' }],
                  },
                  {
                    name: 'types',
                    type: 'folder',
                    description: 'TypeScript interfaces',
                    children: [
                      { name: 'IMyData.ts', type: 'file' },
                      { name: 'IMyProps.ts', type: 'file' },
                    ],
                  },
                  {
                    name: 'utils',
                    type: 'folder',
                    description: 'Helper functions',
                    children: [{ name: 'helpers.ts', type: 'file' }],
                  },
                  { name: 'MyWebPart.ts', type: 'file', description: 'Web part entry point' },
                  { name: 'MyWebPart.manifest.json', type: 'file' },
                  { name: 'loc', type: 'folder', description: 'Localization (if used)' },
                ],
              },
            ],
          },
          {
            name: 'shared',
            type: 'folder',
            description: 'Shared across web parts',
            children: [
              {
                name: 'components',
                type: 'folder',
                description: 'Reusable components',
                children: [
                  { name: 'LoadingSpinner.tsx', type: 'file' },
                  { name: 'ErrorBoundary.tsx', type: 'file' },
                ],
              },
              {
                name: 'hooks',
                type: 'folder',
                description: 'Custom React hooks',
                children: [
                  { name: 'useSPContext.ts', type: 'file' },
                  { name: 'useListData.ts', type: 'file' },
                ],
              },
              { name: 'constants.ts', type: 'file', description: 'App-wide constants' },
              { name: 'types.ts', type: 'file', description: 'Shared type definitions' },
            ],
          },
        ],
      },
      {
        name: 'dist',
        type: 'folder',
        description: 'Build output (git ignored)',
      },
      {
        name: 'lib',
        type: 'folder',
        description: 'Compiled TypeScript (git ignored)',
      },
      {
        name: 'node_modules',
        type: 'folder',
        description: 'Dependencies (git ignored)',
      },
      {
        name: 'sharepoint',
        type: 'folder',
        description: 'SharePoint assets',
        children: [
          { name: 'assets', type: 'folder', description: 'Images, icons' },
          { name: 'solution', type: 'folder', description: 'Generated .sppkg files' },
        ],
      },
      {
        name: 'temp',
        type: 'folder',
        description: 'Build temp files (git ignored)',
      },
      {
        name: 'teams',
        type: 'folder',
        description: 'Teams app manifest (if applicable)',
      },
      { name: '.gitignore', type: 'file', description: 'Git ignore rules' },
      { name: '.npmrc', type: 'file', description: 'npm configuration' },
      { name: 'copilot-instructions.md', type: 'file', description: 'GitHub Copilot instructions' },
      { name: 'gulpfile.js', type: 'file', description: 'Gulp build tasks' },
      { name: 'package.json', type: 'file', description: 'Dependencies & scripts' },
      { name: 'README.md', type: 'file', description: 'Project documentation' },
      { name: 'tsconfig.json', type: 'file', description: 'TypeScript configuration' },
    ],
  };

  const namingConventions = [
    {
      type: 'Components',
      pattern: 'PascalCase.tsx',
      example: 'MyComponent.tsx',
      description: 'React components in PascalCase',
    },
    {
      type: 'Styles',
      pattern: 'ComponentName.module.scss',
      example: 'MyComponent.module.scss',
      description: 'SCSS modules matching component name',
    },
    {
      type: 'Interfaces',
      pattern: 'IName.ts or types.ts',
      example: 'IMyData.ts, IMyProps.ts',
      description: 'Interfaces with I prefix in dedicated files or types.ts',
    },
    {
      type: 'Services',
      pattern: 'NameService.ts',
      example: 'SPService.ts, DataService.ts',
      description: 'Service classes with Service suffix',
    },
    {
      type: 'Stores',
      pattern: 'useStoreName.ts',
      example: 'useMyStore.ts',
      description: 'Zustand stores with use prefix',
    },
    {
      type: 'Hooks',
      pattern: 'useHookName.ts',
      example: 'useSPContext.ts',
      description: 'Custom React hooks with use prefix',
    },
    {
      type: 'Utils',
      pattern: 'camelCase.ts',
      example: 'helpers.ts, formatters.ts',
      description: 'Utility files in camelCase',
    },
    {
      type: 'Constants',
      pattern: 'UPPER_SNAKE_CASE',
      example: 'const MAX_ITEMS = 100',
      description: 'Constants in UPPER_SNAKE_CASE',
    },
  ];

  const folderGuidelines = [
    {
      folder: 'components/',
      usage: 'React components only',
      guidelines: [
        'One component per file',
        'Co-locate component with its .module.scss',
        'Keep components focused and single-purpose',
        'Extract reusable parts to shared/components',
      ],
    },
    {
      folder: 'services/',
      usage: 'Business logic & API interactions',
      guidelines: [
        'Separate SharePoint API calls from UI',
        'Use async/await for all API calls',
        'Handle errors appropriately',
        'Return strongly-typed data',
      ],
    },
    {
      folder: 'store/',
      usage: 'Zustand state management',
      guidelines: [
        'One store per feature/domain',
        'Keep stores flat and simple',
        'Use selectors for derived state',
        'Include actions alongside state',
      ],
    },
    {
      folder: 'types/',
      usage: 'TypeScript type definitions',
      guidelines: [
        'Export all types/interfaces',
        'Use I prefix for interfaces',
        'Document complex types',
        'Avoid circular dependencies',
      ],
    },
    {
      folder: 'utils/',
      usage: 'Pure helper functions',
      guidelines: [
        'Keep functions pure (no side effects)',
        'Add unit tests for complex logic',
        'Document function parameters',
        'Extract common logic here',
      ],
    },
  ];

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.info}>
        Understanding the project structure helps you quickly locate files and maintain consistency
        across the codebase.
      </MessageBar>

      {/* Project structure tree */}
      <Section title="Project Structure" icon="FabricFolderSearch" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Standard SPFx project structure with our organizational conventions:
          </p>
          <FolderTree tree={projectStructure} expandAll={false} />
        </div>
      </Section>

      {/* Naming conventions */}
      <Section title="Naming Conventions" icon="Tag" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Follow these naming patterns for consistency:
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f3f2f1' }}>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                      width: '15%',
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                      width: '25%',
                    }}
                  >
                    Pattern
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                      width: '25%',
                    }}
                  >
                    Example
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                      width: '35%',
                    }}
                  >
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {namingConventions.map((conv, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf9f8',
                    }}
                  >
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        fontWeight: 600,
                      }}
                    >
                      {conv.type}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                        fontSize: '13px',
                        color: '#0078d4',
                      }}
                    >
                      {conv.pattern}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                        fontSize: '13px',
                        color: '#605e5c',
                      }}
                    >
                      {conv.example}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        color: '#323130',
                      }}
                    >
                      {conv.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Folder guidelines */}
      <Section title="Folder Organization Guidelines" icon="FabricFolder" defaultExpanded={true}>
        <Stack tokens={{ childrenGap: 16 }}>
          {folderGuidelines.map((guide, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                border: '1px solid #edebe9',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
                <code
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0078d4',
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                    marginRight: '12px',
                  }}
                >
                  {guide.folder}
                </code>
                <span style={{ fontSize: '13px', color: '#605e5c' }}>{guide.usage}</span>
              </div>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#323130' }}>
                {guide.guidelines.map((guideline, gIndex) => (
                  <li key={gIndex} style={{ marginBottom: '4px' }}>
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Stack>
      </Section>

      {/* File organization best practices */}
      <Section title="Best Practices" icon="CheckMark" defaultExpanded={true}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            📁 File Organization
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Keep files small:</strong> Aim for 200-300 lines max per file
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Group by feature:</strong> Keep related files together in feature folders
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Use barrel exports:</strong> Create index.ts files to simplify imports
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Avoid deep nesting:</strong> Maximum 4-5 levels deep is ideal
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            🔄 Import Patterns
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Use relative imports</strong> for files within the same web part
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Import from shared:</strong> Use{' '}
              <code>import {`{ Component }`} from '../../shared/components'</code>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Import spfx-toolkit:</strong>{' '}
              <code>import {`{ Card }`} from 'spfx-toolkit/lib/components'</code>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Group imports:</strong> Third-party, SPFx, local (in that order)
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            🚫 What NOT to Include in src/
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Test files (place in <code>__tests__</code> folders or <code>.test.ts</code> files)
            </li>
            <li style={{ marginBottom: '8px' }}>
              Build artifacts (automatically generated in dist/ and lib/)
            </li>
            <li style={{ marginBottom: '8px' }}>
              Configuration files (belong in config/ or project root)
            </li>
            <li style={{ marginBottom: '8px' }}>
              Documentation (use README.md files or docs/ folder)
            </li>
          </ul>
        </div>
      </Section>

      {/* Creating new web parts */}
      <Section title="Creating New Web Parts" icon="Add" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            When creating a new web part, follow this structure from the start:
          </p>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#f3f2f1',
              borderRadius: '4px',
              marginBottom: '16px',
            }}
          >
            <pre
              style={{
                margin: 0,
                fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                fontSize: '13px',
                color: '#323130',
              }}
            >
              {`src/webparts/myNewWebPart/
├── components/           # React components
├── services/            # API calls & business logic
├── store/              # Zustand stores
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
└── MyNewWebPart.ts     # Entry point`}
            </pre>
          </div>

          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            This structure keeps your code organized from day one and makes it easier for team
            members to navigate.
          </p>
        </div>
      </Section>
    </Stack>
  );
};
