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
      id: 'toolkit-source',
      label: 'Verify how this repo resolves spfx-toolkit',
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

      {/* Toolkit dependency setup */}
      <Section title="spfx-toolkit Dependency Source" icon="Package" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            This solution currently consumes <strong>spfx-toolkit</strong> from a local file
            dependency (<code>file:../spfx-toolkit</code>). Before running <code>npm install</code>,
            make sure the sibling toolkit repo exists and is built.
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Step 1: Verify the linked toolkit repo
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Confirm the local dependency target exists next to this repo:
          </p>
          <CodeBlock
            code={`../spfx-toolkit/
  package.json
  lib/
  dist/`}
            language="bash"
            filename="Expected sibling repo"
            showLineNumbers={false}
            maxHeight={250}
          />

          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '12px', marginBottom: '16px' } }}>
            <strong>Note:</strong> If toolkit entrypoints or exports changed recently, rebuild the
            sibling <code>spfx-toolkit</code> repo before reinstalling this solution.
          </MessageBar>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Step 2: Build the toolkit and install dependencies
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Use the local toolkit build, then install dependencies for this repo:
          </p>
          <CodeBlock
            code={`cd ../spfx-toolkit
npm install
npm run build

cd ../spfx-showcase
npm install`}
            language="bash"
            showLineNumbers={false}
            maxHeight={250}
          />

          <p style={{ margin: '16px 0 12px 0', fontSize: '14px', color: '#323130' }}>
            This ensures:
          </p>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Public entrypoints like <code>spfx-toolkit/components/...</code> resolve correctly
            </li>
            <li style={{ marginBottom: '8px' }}>
              The linked package includes current <code>lib/</code> output and compatibility proxies
            </li>
            <li style={{ marginBottom: '8px' }}>
              This solution installs against the same toolkit version you are actively changing
            </li>
          </ul>

          <MessageBar messageBarType={MessageBarType.severeWarning} styles={{ root: { marginTop: '12px' } }}>
            <strong>Important:</strong> If <code>npm install</code> fails with missing exports or
            stale paths, rebuild <code>../spfx-toolkit</code> first and reinstall in this repo.
            <br />
            The app assumes the linked toolkit repo is already present locally.
          </MessageBar>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Optional: Azure Artifacts fallback
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            If you are consuming a published internal package instead of the linked repo, use your
            team’s Azure Artifacts feed and authentication process before <code>npm install</code>.
          </p>
          <CodeBlock
            code={`# Example only - replace with your team's real feed values
registry=https://registry.npmjs.org/
@your-org:registry=https://pkgs.dev.azure.com/your-org/_packaging/your-feed/npm/registry/
always-auth=true`}
            language="bash"
            filename=".npmrc"
            showLineNumbers={false}
            maxHeight={250}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Troubleshooting
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Module not found:</strong> Rebuild <code>../spfx-toolkit</code> and rerun <code>npm install</code>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Stale imports:</strong> Check that examples use public paths like <code>spfx-toolkit/components/Card</code>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>401 Unauthorized:</strong> If you are using the package-feed fallback, refresh your Azure Artifacts auth token
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
