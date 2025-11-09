import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * VS Code Setup tab - Editor configuration and extensions
 */
export const VSCodeSetup: React.FC<ITabComponentProps> = () => {
  const userSettingsJson = `{
  // Editor
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.rulers": [100, 120],
  "editor.minimap.enabled": true,
  "editor.suggestSelection": "first",
  "editor.linkedEditing": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "editor.inlineSuggest.enabled": true,

  // Files
  "files.autoSave": "onFocusChange",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/temp": true,
    "**/*.sppkg": true,
    "**/.vscode": false
  },

  // TypeScript
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.tsdk": "node_modules/typescript/lib",

  // JavaScript
  "javascript.updateImportsOnFileMove.enabled": "always",

  // ESLint
  "eslint.enable": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],

  // Prettier
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "prettier.printWidth": 100,
  "prettier.tabWidth": 2,
  "prettier.semi": true,

  // Git
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableSmartCommit": true,

  // Search
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/temp": true,
    "**/.vscode": true,
    "**/coverage": true
  },

  // GitHub Copilot
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false
  }
}`;

  const workspaceSettingsJson = `{
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "dist": true,
    "lib": true,
    "temp": true,
    "*.log": true,
    "**/*.sppkg": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "dist": true,
    "lib": true,
    "temp": true,
    "**/*.sppkg": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.workingDirectories": [
    {
      "mode": "auto"
    }
  ]
}`;

  const recommendedExtensions = [
    {
      id: 'dbaeumer.vscode-eslint',
      name: 'ESLint',
      description: 'Integrates ESLint into VS Code for JavaScript/TypeScript linting',
    },
    {
      id: 'esbenp.prettier-vscode',
      name: 'Prettier - Code formatter',
      description: 'Code formatter for consistent code style',
    },
    {
      id: 'GitHub.copilot',
      name: 'GitHub Copilot',
      description: 'AI pair programmer for code suggestions',
    },
    {
      id: 'GitHub.copilot-chat',
      name: 'GitHub Copilot Chat',
      description: 'Chat with Copilot for coding assistance',
    },
    {
      id: 'wix.vscode-import-cost',
      name: 'Import Cost',
      description: 'Display import/require package size',
    },
    {
      id: 'ms-edgedevtools.vscode-edge-devtools',
      name: 'Microsoft Edge Tools',
      description: 'Debug web applications in Microsoft Edge',
    },
  ];

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Info message */}
      <MessageBar messageBarType={MessageBarType.info}>
        Configure VS Code with these optimized settings for SharePoint Framework development. These
        settings enable auto-formatting, linting, and integrate with our development workflow.
      </MessageBar>

      {/* Installation */}
      <Section title="Installing VS Code" icon="Download" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            <strong>Install from Software Center (Required)</strong>
          </p>
          <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Open <strong>Software Center</strong> on your Windows machine
            </li>
            <li style={{ marginBottom: '8px' }}>
              Search for <strong>"Visual Studio Code"</strong>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Click Install and wait for completion
            </li>
            <li style={{ marginBottom: '8px' }}>
              Launch VS Code from Start Menu
            </li>
          </ol>

          <MessageBar messageBarType={MessageBarType.warning}>
            <strong>Important:</strong> Do not download VS Code directly from the website. Use
            Software Center for proper licensing and to comply with company policies.
          </MessageBar>
        </div>
      </Section>

      {/* User settings */}
      <Section title="User Settings (settings.json)" icon="Settings" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            These are global settings that apply to all your VS Code projects. To configure:
          </p>
          <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Open VS Code Command Palette: <kbd>Cmd/Ctrl + Shift + P</kbd>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Type: <strong>Preferences: Open User Settings (JSON)</strong>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Add or update the settings below
            </li>
          </ol>
          <CodeBlock
            code={userSettingsJson}
            language="json"
            filename="settings.json (User Settings)"
            showLineNumbers={true}
            maxHeight={500}
          />
        </div>
      </Section>

      {/* Workspace settings */}
      <Section
        title="Workspace Settings (.vscode/settings.json)"
        icon="FabricFolder"
        defaultExpanded={true}
      >
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            These settings are specific to your SPFx project. Create this file in your project:
          </p>
          <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Navigate to your project root
            </li>
            <li style={{ marginBottom: '8px' }}>
              Create folder: <code>.vscode</code> (if it doesn't exist)
            </li>
            <li style={{ marginBottom: '8px' }}>
              Create file: <code>.vscode/settings.json</code>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Add the settings below
            </li>
          </ol>
          <CodeBlock
            code={workspaceSettingsJson}
            language="json"
            filename=".vscode/settings.json (Workspace Settings)"
            showLineNumbers={true}
          />
        </div>
      </Section>

      {/* Recommended extensions */}
      <Section title="Recommended Extensions" icon="Extensions" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Install these extensions to enhance your development experience:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '12px',
            }}
          >
            {recommendedExtensions.map((ext, index) => (
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
                    marginBottom: '4px',
                  }}
                >
                  {ext.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                    fontSize: '12px',
                    color: '#0078d4',
                    marginBottom: '8px',
                  }}
                >
                  {ext.id}
                </div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>{ext.description}</div>
              </div>
            ))}
          </div>

          <MessageBar
            messageBarType={MessageBarType.success}
            styles={{ root: { marginTop: '16px' } }}
          >
            <strong>Quick Install:</strong> Press <kbd>Cmd/Ctrl + Shift + X</kbd> to open
            Extensions, then search for and install each extension by its ID.
          </MessageBar>
        </div>
      </Section>

      {/* Keyboard shortcuts */}
      <Section title="Essential Keyboard Shortcuts" icon="Keyboard" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Master these shortcuts to boost your productivity:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '8px',
            }}
          >
            {[
              { keys: 'Cmd/Ctrl + P', action: 'Quick open file' },
              { keys: 'Cmd/Ctrl + Shift + P', action: 'Command palette' },
              { keys: 'Cmd/Ctrl + B', action: 'Toggle sidebar' },
              { keys: 'Cmd/Ctrl + `', action: 'Toggle terminal' },
              { keys: 'Cmd/Ctrl + Shift + F', action: 'Search in files' },
              { keys: 'Cmd/Ctrl + D', action: 'Select next occurrence' },
              { keys: 'Alt + Click', action: 'Multiple cursors' },
              { keys: 'Cmd/Ctrl + /', action: 'Toggle comment' },
              { keys: 'Shift + Alt + F', action: 'Format document' },
              { keys: 'F12', action: 'Go to definition' },
              { keys: 'Shift + F12', action: 'Find all references' },
              { keys: 'F2', action: 'Rename symbol' },
            ].map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  border: '1px solid #edebe9',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: '#323130' }}>{shortcut.action}</span>
                <kbd
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#f3f2f1',
                    border: '1px solid #edebe9',
                    borderRadius: '3px',
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                    fontSize: '12px',
                    color: '#605e5c',
                  }}
                >
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="Troubleshooting" icon="Help" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#323130' }}>
            ESLint not working?
          </p>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Restart VS Code after installing ESLint extension
            </li>
            <li style={{ marginBottom: '8px' }}>
              Check Output panel (View → Output) and select "ESLint" from dropdown
            </li>
            <li style={{ marginBottom: '8px' }}>
              Run <code>npm install</code> to ensure ESLint dependencies are installed
            </li>
          </ul>

          <p style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#323130' }}>
            Prettier not formatting?
          </p>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Verify Prettier is set as default formatter in settings
            </li>
            <li style={{ marginBottom: '8px' }}>
              Check "Format On Save" is enabled
            </li>
            <li style={{ marginBottom: '8px' }}>
              Right-click in editor → Format Document With... → Configure Default Formatter →
              Prettier
            </li>
          </ul>

          <p style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#323130' }}>
            TypeScript errors in node_modules?
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Ensure <code>"typescript.tsdk": "node_modules/typescript/lib"</code> is in your
              workspace settings
            </li>
            <li style={{ marginBottom: '8px' }}>
              Reload VS Code window: Cmd/Ctrl + Shift + P → "Reload Window"
            </li>
          </ul>
        </div>
      </Section>
    </Stack>
  );
};
