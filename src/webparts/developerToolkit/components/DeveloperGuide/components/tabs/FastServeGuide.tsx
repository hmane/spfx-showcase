import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ICommand, ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { CommandPalette } from '../shared/CommandPalette';
import { Section } from '../shared/Section';

/**
 * Fast-Serve Guide tab - Configuration and usage of spfx-fast-serve
 */
export const FastServeGuide: React.FC<ITabComponentProps> = () => {
  const installCommands = `# Install spfx-fast-serve globally
npm install spfx-fast-serve -g

# Navigate to your SPFx project
cd your-spfx-project

# Run fast-serve setup wizard
spfx-fast-serve

# Install dependencies
npm install

# Start development server
npm run serve`;

  const serveJson = `{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/spfx-serve.schema.json",
  "port": 4321,
  "https": true,
  "initialPage": "https://enter-your-SharePoint-site/_layouts/workbench.aspx"
}`;

  const commands: ICommand[] = [
    {
      command: 'npm run serve',
      description: 'Start fast-serve development server (recommended)',
      category: 'Development',
    },
    {
      command: 'gulp serve',
      description: 'Start standard gulp server (slower)',
      category: 'Development',
    },
    {
      command: 'npm run serve -- --config',
      description: 'Show fast-serve configuration',
      category: 'Debugging',
    },
    {
      command: 'npm run serve -- --loggingLevel verbose',
      description: 'Run with verbose logging for troubleshooting',
      category: 'Debugging',
    },
  ];

  const performanceComparison = [
    {
      operation: 'Initial build',
      gulp: '~60 seconds',
      fastServe: '~25 seconds',
      improvement: '58% faster',
    },
    {
      operation: 'Incremental rebuild',
      gulp: '~15 seconds',
      fastServe: '~3 seconds',
      improvement: '80% faster',
    },
    {
      operation: 'TypeScript change',
      gulp: '~12 seconds',
      fastServe: '~2 seconds',
      improvement: '83% faster',
    },
    {
      operation: 'SCSS change',
      gulp: '~10 seconds',
      fastServe: '~1 second',
      improvement: '90% faster',
    },
  ];

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.success}>
        <strong>80% faster rebuilds!</strong> spfx-fast-serve is already configured in this
        project. Just run <code>npm run serve</code> to experience dramatically faster development
        cycles.
      </MessageBar>

      {/* What is Fast-Serve */}
      <Section title="What is spfx-fast-serve?" icon="LightningBolt" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            spfx-fast-serve is a webpack-based development server that dramatically improves SPFx
            development speed by:
          </p>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Using modern webpack with filesystem caching
            </li>
            <li style={{ marginBottom: '8px' }}>
              Enabling Hot Module Replacement (HMR) for instant updates
            </li>
            <li style={{ marginBottom: '8px' }}>
              Optimizing TypeScript compilation
            </li>
            <li style={{ marginBottom: '8px' }}>
              Skipping unnecessary build steps during development
            </li>
          </ul>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#fff4ce',
              border: '1px solid #ffb900',
              borderRadius: '4px',
              marginBottom: '16px',
            }}
          >
            <strong style={{ color: '#323130' }}>⚡ Performance Impact:</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#323130' }}>
              Average time savings: <strong>~3-4 hours per week per developer</strong> based on
              typical development workflows with 100+ rebuilds/day.
            </p>
          </div>
        </div>
      </Section>

      {/* Performance comparison */}
      <Section title="Performance Comparison" icon="SpeedHigh" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Real-world performance comparison between standard gulp serve and fast-serve:
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
                    }}
                  >
                    Operation
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    gulp serve
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    fast-serve
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                      color: '#107c10',
                    }}
                  >
                    Improvement
                  </th>
                </tr>
              </thead>
              <tbody>
                {performanceComparison.map((row, index) => (
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
                      }}
                    >
                      {row.operation}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderBottom: '1px solid #edebe9',
                        color: '#605e5c',
                      }}
                    >
                      {row.gulp}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderBottom: '1px solid #edebe9',
                        color: '#0078d4',
                        fontWeight: 600,
                      }}
                    >
                      {row.fastServe}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderBottom: '1px solid #edebe9',
                        color: '#107c10',
                        fontWeight: 600,
                      }}
                    >
                      {row.improvement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* PowerShell Setup */}
      <Section title="PowerShell Setup (One-Time)" icon="CommandPrompt" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Before using fast-serve for the first time, run this PowerShell command as Administrator to allow local certificate:
          </p>
          <CodeBlock
            code={`# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`}
            language="bash"
            filename="PowerShell (Run as Administrator)"
            showLineNumbers={false}
            compact={true}
          />
          <MessageBar messageBarType={MessageBarType.warning} styles={{ root: { marginTop: '12px' } }}>
            <strong>Required:</strong> This is a one-time setup to allow spfx-fast-serve to run HTTPS development server with self-signed certificates.
          </MessageBar>
        </div>
      </Section>

      {/* Installation */}
      <Section title="Installation & Setup" icon="Download" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            For new projects, follow these steps to install and configure spfx-fast-serve:
          </p>
          <CodeBlock
            code={installCommands}
            language="bash"
            filename="Installation Steps"
            showLineNumbers={false}
            compact={true}
          />
          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '16px' } }}>
            <strong>Note:</strong> The setup wizard will automatically configure your project. Just
            answer the prompts and it will create the necessary configuration files.
          </MessageBar>
        </div>
      </Section>

      {/* Configuration */}
      <Section title="Configuration Files" icon="Settings" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            After running the setup wizard, these files are created/modified:
          </p>

          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            config/serve.json
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#605e5c' }}>
            Configure the development server port and initial SharePoint page to load.
          </p>
          <CodeBlock
            code={serveJson}
            language="json"
            filename="config/serve.json"
            showLineNumbers={false}
            compact={true}
          />

          <MessageBar
            messageBarType={MessageBarType.warning}
            styles={{ root: { marginTop: '16px' } }}
          >
            <strong>Important:</strong> Update the <code>initialPage</code> in serve.json with your
            actual SharePoint site URL for automatic workbench opening.
          </MessageBar>
        </div>
      </Section>

      {/* Commands */}
      <Section title="Fast-Serve Commands" icon="CommandPrompt" defaultExpanded={true}>
        <CommandPalette commands={commands} title="Development Commands" grouped={true} />
      </Section>

      {/* Usage tips */}
      <Section title="Usage Tips & Best Practices" icon="Lightbulb" defaultExpanded={true}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            🎯 Best Practices
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Always use npm run serve</strong> for daily development instead of gulp serve
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Keep the browser DevTools open</strong> to see Hot Module Replacement in
              action
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Clear cache if issues occur:</strong> Delete node_modules/.cache folder and
              restart
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Use gulp serve only</strong> when you need to test the production-like build
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ⚡ Maximizing Speed
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Make small, incremental changes - HMR works best with focused edits
            </li>
            <li style={{ marginBottom: '8px' }}>
              Avoid full page refreshes when possible - let HMR update the module
            </li>
            <li style={{ marginBottom: '8px' }}>
              Keep dependencies updated - newer versions often include performance improvements
            </li>
            <li style={{ marginBottom: '8px' }}>
              Use TypeScript path mappings to reduce relative import complexity
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            🔄 Hot Module Replacement (HMR)
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Component changes update instantly without losing state
            </li>
            <li style={{ marginBottom: '8px' }}>
              SCSS/CSS changes apply immediately without page reload
            </li>
            <li style={{ marginBottom: '8px' }}>
              Full refresh only when changing interfaces or types
            </li>
          </ul>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="Troubleshooting" icon="Help" defaultExpanded={false}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Common Issues & Solutions
          </h4>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#323130' }}>
              ❌ "Module not found" errors after starting serve
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#605e5c' }}>
              Solution: Run <code>npm install</code> to ensure all dependencies are installed
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#323130' }}>
              ❌ Changes not reflecting in browser
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#605e5c' }}>
              Solutions:
            </p>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#605e5c' }}>
              <li>Hard refresh the browser (Cmd/Ctrl + Shift + R)</li>
              <li>Clear webpack cache: Delete node_modules/.cache and restart</li>
              <li>Check browser console for errors</li>
            </ul>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#323130' }}>
              ❌ Port 4321 already in use
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#605e5c' }}>
              Solutions:
            </p>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#605e5c' }}>
              <li>Kill existing process: Find and kill the process using port 4321</li>
              <li>Change port in config/serve.json to another port (e.g., 4322)</li>
            </ul>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#323130' }}>
              ❌ TypeScript errors not showing
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#605e5c' }}>
              Solution: Fast-serve prioritizes speed over type checking. Run{' '}
              <code>npm run build</code> occasionally to catch TypeScript errors
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#323130' }}>
              ❌ SSL certificate warnings
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#605e5c' }}>
              Solution: Accept the self-signed certificate in your browser. This is expected for
              local development with HTTPS
            </p>
          </div>

          <MessageBar messageBarType={MessageBarType.info}>
            If issues persist, check the{' '}
            <a
              href="https://github.com/s-KaiNet/spfx-fast-serve"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0078d4' }}
            >
              spfx-fast-serve GitHub repository
            </a>{' '}
            for additional troubleshooting steps and known issues.
          </MessageBar>
        </div>
      </Section>
    </Stack>
  );
};
