import { MessageBar, MessageBarType, PrimaryButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import { IChecklistItem, ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { Checklist } from '../shared/Checklist';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Quick Start tab - Essential setup steps for new developers
 */
export const QuickStart: React.FC<ITabComponentProps> = ({ onNavigate }) => {
  const [checklistItems, setChecklistItems] = useState<IChecklistItem[]>([
    {
      id: 'node-npm',
      label: 'Install Node.js (v18 LTS) and npm',
      completed: false,
      timeEstimate: '5 min',
    },
    {
      id: 'git',
      label: 'Install Git and configure Azure DevOps access',
      completed: false,
      timeEstimate: '10 min',
    },
    {
      id: 'vscode',
      label: 'Install Visual Studio Code and recommended extensions',
      completed: false,
      timeEstimate: '10 min',
    },
    {
      id: 'clone-repo',
      label: 'Clone the repository from Azure DevOps',
      completed: false,
      timeEstimate: '5 min',
    },
    {
      id: 'azure-artifacts',
      label: 'Configure Azure Artifacts authentication for spfx-toolkit',
      completed: false,
      timeEstimate: '5 min',
    },
    {
      id: 'npm-install',
      label: 'Run npm install to install dependencies',
      completed: false,
      timeEstimate: '5 min',
    },
    {
      id: 'fast-serve',
      label: 'Configure spfx-fast-serve for faster development',
      completed: false,
      timeEstimate: '2 min',
    },
    {
      id: 'test-serve',
      label: 'Run npm run serve and test in workbench',
      completed: false,
      timeEstimate: '5 min',
    },
    {
      id: 'copilot',
      label: 'Configure GitHub Copilot with project instructions',
      completed: false,
      timeEstimate: '5 min',
    },
  ]);

  const handleChecklistToggle = (itemId: string, completed: boolean): void => {
    setChecklistItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, completed } : item))
    );
  };

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Welcome message */}
      <MessageBar messageBarType={MessageBarType.info}>
        <strong>Welcome to the team!</strong> This guide will help you set up your development
        environment and get started with SharePoint Framework development. Estimated total time: ~50
        minutes.
      </MessageBar>

      {/* Prerequisites */}
      <Section title="Prerequisites" icon="CheckList" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Before you begin, ensure you have the following:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Node.js v18 LTS</strong> - Download from{' '}
              <a
                href="https://nodejs.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0078d4' }}
              >
                nodejs.org
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Git</strong> - Download from{' '}
              <a
                href="https://git-scm.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0078d4' }}
              >
                git-scm.com
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Visual Studio Code</strong> - Download from{' '}
              <a
                href="https://code.visualstudio.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0078d4' }}
              >
                code.visualstudio.com
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Azure DevOps Access</strong> - Request access from your team lead
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>SharePoint Online Access</strong> - For testing your web parts
            </li>
          </ul>
        </div>
      </Section>

      {/* Azure Artifacts Authentication */}
      <Section title="Azure Artifacts Authentication" icon="Package" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            The <strong>spfx-toolkit</strong> package is hosted in Azure Artifacts. You must authenticate
            before running npm install.
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Step 1: Create .npmrc file
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            In your project root directory, create a <code>.npmrc</code> file with the following content:
          </p>
          <CodeBlock
            code={`registry=https://registry.npmjs.org/
@your-org:registry=https://pkgs.dev.azure.com/your-org/_packaging/your-feed/npm/registry/
always-auth=true`}
            language="bash"
            filename=".npmrc"
            showLineNumbers={false}
            compact={true}
          />

          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '12px', marginBottom: '16px' } }}>
            <strong>Note:</strong> Replace <code>your-org</code> and <code>your-feed</code> with your actual
            Azure DevOps organization and feed name. Contact your team lead for the correct values.
          </MessageBar>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Step 2: Authenticate with Azure Artifacts
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Run the following command to generate an authentication token:
          </p>
          <CodeBlock
            code={`# Install vsts-npm-auth globally (one-time setup)
npm install -g vsts-npm-auth

# Authenticate and generate token
vsts-npm-auth -config .npmrc`}
            language="bash"
            showLineNumbers={false}
            compact={true}
          />

          <p style={{ margin: '16px 0 12px 0', fontSize: '14px', color: '#323130' }}>
            This command will:
          </p>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Open a browser window for Azure DevOps authentication</li>
            <li style={{ marginBottom: '8px' }}>Generate a Personal Access Token (PAT)</li>
            <li style={{ marginBottom: '8px' }}>
              Automatically add the token to your <code>.npmrc</code> file
            </li>
          </ul>

          <MessageBar messageBarType={MessageBarType.severeWarning} styles={{ root: { marginTop: '12px' } }}>
            <strong>CRITICAL: Do NOT commit .npmrc to Git!</strong>
            <br />
            The .npmrc file contains your authentication token and must NEVER be committed to source control.
            Verify that .npmrc is listed in .gitignore before making any commits.
          </MessageBar>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Step 3: Verify .gitignore
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Ensure your <code>.gitignore</code> file contains:
          </p>
          <CodeBlock
            code={`.npmrc
.env
.env.local
*.local`}
            language="bash"
            filename=".gitignore (excerpt)"
            showLineNumbers={false}
            compact={true}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Troubleshooting
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>401 Unauthorized:</strong> Token expired. Re-run <code>vsts-npm-auth -config .npmrc</code>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>404 Not Found:</strong> Check registry URL in .npmrc matches your Azure DevOps organization
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Access Denied:</strong> Request access to the Azure Artifacts feed from your team lead
            </li>
          </ul>
        </div>
      </Section>

      {/* Setup checklist */}
      <Section title="Setup Checklist" icon="TaskLogo" defaultExpanded={true}>
        <Checklist
          items={checklistItems}
          onItemToggle={handleChecklistToggle}
          showProgress={true}
        />
      </Section>

      {/* Quick commands */}
      <Section title="Essential Commands" icon="CommandPrompt" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Once setup is complete, you'll use these commands daily:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              {
                command: 'npm run serve',
                description: 'Start development server (fast-serve)',
                color: '#0078d4',
              },
              {
                command: 'npm run build',
                description: 'Build production bundle',
                color: '#107c10',
              },
              {
                command: 'gulp bundle --ship',
                description: 'Create production bundle',
                color: '#8661c5',
              },
              {
                command: 'gulp package-solution --ship',
                description: 'Package for deployment',
                color: '#d83b01',
              },
            ].map((cmd, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  border: '1px solid #edebe9',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                    fontSize: '13px',
                    color: cmd.color,
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  {cmd.command}
                </div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>{cmd.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Next steps */}
      <Section title="Next Steps" icon="Forward" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            After completing the setup checklist, explore these sections:
          </p>

          <Stack tokens={{ childrenGap: 8 }}>
            {[
              {
                title: 'VS Code Setup',
                description:
                  'Configure your editor with optimal settings and recommended extensions',
                tab: 'vscode-setup' as const,
              },
              {
                title: 'Fast-Serve Configuration',
                description: 'Learn how to use fast-serve for 80% faster rebuild times',
                tab: 'fast-serve' as const,
              },
              {
                title: 'Project Structure',
                description: 'Understand the folder structure and where to place your files',
                tab: 'folder-structure' as const,
              },
              {
                title: 'spfx-toolkit Integration',
                description: 'Learn to use our custom components and utilities',
                tab: 'toolkit-integration' as const,
              },
            ].map((step, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid #edebe9',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#323130',
                      marginBottom: '4px',
                    }}
                  >
                    {step.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#605e5c' }}>{step.description}</div>
                </div>
                <PrimaryButton
                  text="View"
                  onClick={() => onNavigate?.(step.tab)}
                  styles={{ root: { marginLeft: '16px' } }}
                />
              </div>
            ))}
          </Stack>
        </div>
      </Section>

      {/* Additional resources */}
      <Section title="Additional Resources" icon="Info" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Helpful external resources:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <a
                href="https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0078d4' }}
              >
                SharePoint Framework Overview
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a
                href="https://learn.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0078d4' }}
              >
                Set up your SharePoint Framework development environment
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a
                href="https://github.com/s-KaiNet/spfx-fast-serve"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0078d4' }}
              >
                spfx-fast-serve GitHub Repository
              </a>
            </li>
          </ul>
        </div>
      </Section>
    </Stack>
  );
};
