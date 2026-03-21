import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Debugging tab - Debugging setup and troubleshooting
 */
export const Debugging: React.FC<ITabComponentProps> = () => {
  const launchJson = `{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug SPFx (Edge)",
      "type": "msedge",
      "request": "launch",
      "url": "https://localhost:4321/temp/workbench.html",
      "webRoot": "\${workspaceFolder}",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///.././src/*": "\${webspaceFolder}/src/*",
        "webpack:///../../../src/*": "\${webspaceFolder}/src/*",
        "webpack:///../../../../src/*": "\${webspaceFolder}/src/*",
        "webpack:///../../../../../src/*": "\${webspaceFolder}/src/*"
      },
      "runtimeArgs": [
        "--remote-debugging-port=9222"
      ],
      "preLaunchTask": "serve"
    },
    {
      "name": "Debug SPFx (Chrome)",
      "type": "chrome",
      "request": "launch",
      "url": "https://localhost:4321/temp/workbench.html",
      "webRoot": "\${workspaceFolder}",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///.././src/*": "\${webspaceFolder}/src/*",
        "webpack:///../../../src/*": "\${webspaceFolder}/src/*",
        "webpack:///../../../../src/*": "\${webspaceFolder}/src/*",
        "webpack:///../../../../../src/*": "\${webspaceFolder}/src/*"
      },
      "runtimeArgs": [
        "--remote-debugging-port=9222",
        "--disable-web-security"
      ]
    }
  ]
}`;

  const tasksJson = `{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "serve",
      "type": "shell",
      "command": "npm run serve",
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "."
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": ".",
          "endsPattern": "."
        }
      }
    }
  ]
}`;

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.info}>
        Set up VS Code debugging for SPFx to debug your code directly in the editor with breakpoints
        and step-through debugging.
      </MessageBar>

      {/* VS Code Debug Configuration */}
      <Section title="VS Code Debug Configuration" icon="Bug" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Configure VS Code to debug SPFx solutions in Microsoft Edge or Chrome:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Step 1: Create launch.json
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#605e5c' }}>
            Create <code>.vscode/launch.json</code> in your project root:
          </p>
          <CodeBlock
            code={launchJson}
            language="json"
            filename=".vscode/launch.json"
            showLineNumbers={true}
            maxHeight={500}
          />

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Step 2: Create tasks.json (Optional)
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#605e5c' }}>
            Create <code>.vscode/tasks.json</code> to auto-start the dev server:
          </p>
          <CodeBlock
            code={tasksJson}
            language="json"
            filename=".vscode/tasks.json"
            showLineNumbers={true}
          />

          <MessageBar messageBarType={MessageBarType.success} styles={{ root: { marginTop: '16px' } }}>
            <strong>Note:</strong> With tasks.json configured, pressing F5 will automatically start
            the dev server before launching the debugger.
          </MessageBar>
        </div>
      </Section>

      {/* How to Debug */}
      <Section title="How to Debug" icon="Play" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Debugging Workflow
          </h4>
          <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Start dev server: <code>npm run serve</code> (or let F5 start it automatically)
            </li>
            <li style={{ marginBottom: '8px' }}>
              Set breakpoints in your TypeScript files by clicking the left gutter
            </li>
            <li style={{ marginBottom: '8px' }}>
              Press <kbd>F5</kbd> or click the green play button in VS Code's Debug panel
            </li>
            <li style={{ marginBottom: '8px' }}>
              Select "Debug SPFx (Edge)" or "Debug SPFx (Chrome)" configuration
            </li>
            <li style={{ marginBottom: '8px' }}>
              Browser opens automatically and loads the workbench
            </li>
            <li style={{ marginBottom: '8px' }}>
              Interact with your web part to hit the breakpoints
            </li>
            <li style={{ marginBottom: '8px' }}>
              Use Debug toolbar to step through code (F10 = step over, F11 = step into)
            </li>
          </ol>

          <MessageBar messageBarType={MessageBarType.warning}>
            <strong>SSL Certificate:</strong> You may need to accept the self-signed certificate the
            first time you debug. This is normal for local HTTPS development.
          </MessageBar>
        </div>
      </Section>

      {/* Browser DevTools */}
      <Section title="Browser DevTools" icon="DeviceLaptop" defaultExpanded={true}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Browser DevTools are powerful for debugging in addition to VS Code:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              {
                title: 'Console',
                shortcut: 'F12 → Console',
                use: 'View console.log, errors, and warnings',
              },
              {
                title: 'Network Tab',
                shortcut: 'F12 → Network',
                use: 'Monitor API calls to SharePoint, check request/response',
              },
              {
                title: 'Sources Tab',
                shortcut: 'F12 → Sources',
                use: 'Set breakpoints directly in browser',
              },
              {
                title: 'React DevTools',
                shortcut: 'Extension',
                use: 'Inspect React component tree and props',
              },
            ].map((tool, index) => (
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
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#323130',
                    marginBottom: '6px',
                  }}
                >
                  {tool.title}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#0078d4',
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                    marginBottom: '8px',
                  }}
                >
                  {tool.shortcut}
                </div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>{tool.use}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Common Debugging Scenarios */}
      <Section title="Common Debugging Scenarios" icon="Repair" defaultExpanded={true}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Scenario: Component not rendering
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Check browser console for React errors</li>
            <li style={{ marginBottom: '8px' }}>Verify component is exported and imported correctly</li>
            <li style={{ marginBottom: '8px' }}>Check if condition is preventing render</li>
            <li style={{ marginBottom: '8px' }}>Use React DevTools to inspect component tree</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Scenario: SharePoint API call failing
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Check Network tab for HTTP status code</li>
            <li style={{ marginBottom: '8px' }}>Verify SPContext.smart() or SPContext.development() was awaited in onInit()</li>
            <li style={{ marginBottom: '8px' }}>Check if list/field names are correct</li>
            <li style={{ marginBottom: '8px' }}>Verify user has permissions to the resource</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Scenario: Infinite re-render loop
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Check useEffect dependencies - are they stable?</li>
            <li style={{ marginBottom: '8px' }}>Avoid creating objects/arrays in render without memoization</li>
            <li style={{ marginBottom: '8px' }}>Use React DevTools Profiler to identify the cause</li>
            <li style={{ marginBottom: '8px' }}>Review state updates - are you updating state in render?</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Scenario: Breakpoint not hitting
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Verify source maps are enabled (check devtool in gulpfile)</li>
            <li style={{ marginBottom: '8px' }}>Hard refresh browser (Ctrl+Shift+R) to clear cache</li>
            <li style={{ marginBottom: '8px' }}>Check sourceMapPathOverrides in launch.json</li>
            <li style={{ marginBottom: '8px' }}>Try setting breakpoint in browser DevTools instead</li>
          </ul>
        </div>
      </Section>

      {/* Logging Best Practices */}
      <Section title="Logging Best Practices" icon="TextDocument" defaultExpanded={false}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Use Appropriate Log Levels
          </h4>
          <div style={{ marginBottom: '16px' }}>
            <CodeBlock
              code={`// ❌ Don't use console.log in production
console.log('Debug info');

// ✅ Use console.warn for warnings
console.warn('User not found, using default');

// ✅ Use console.error for errors
console.error('Failed to load data:', error);

// ✅ Group related logs
console.group('Form Submission');
console.log('Validating...');
console.log('Submitting...');
console.groupEnd();`}
              language="typescript"
              showLineNumbers={false}
            />
          </div>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Conditional Logging
          </h4>
          <CodeBlock
            code={`// Log only in development
if (DEBUG || process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Create a logger utility
const logger = {
  debug: (...args: any[]) => {
    if (DEBUG) console.log('[DEBUG]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};

logger.debug('Component mounted');
logger.error('API call failed', error);`}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      </Section>

      {/* Quick Tips */}
      <Section title="Quick Tips" icon="Lightbulb" defaultExpanded={false}>
        <div>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Use debugger;</strong> statement to force a breakpoint in code
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>console.table()</strong> displays arrays/objects in a nice table format
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>$0 in console</strong> refers to currently selected element in DevTools
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Preserve log</strong> in Network tab to keep logs across page refreshes
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Disable cache</strong> in DevTools when debugging to avoid stale code
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Use Profiler</strong> in React DevTools to identify performance bottlenecks
            </li>
          </ul>
        </div>
      </Section>
    </Stack>
  );
};
