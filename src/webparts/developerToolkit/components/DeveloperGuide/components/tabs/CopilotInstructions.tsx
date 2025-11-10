import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Copilot Instructions tab - GitHub Copilot configuration
 */
export const CopilotInstructions: React.FC<ITabComponentProps> = () => {
  const copilotInstructionsMd = `# Copilot Instructions for \`spfx-toolkit\`

This repository contains a **library**, not an SPFx solution. Every suggestion from Copilot must respect the rules below so consuming SPFx projects stay lean and stable.

## 1. Project Context
- SharePoint Framework ≥ **1.21.1** compatibility.
- **React 17**, **TypeScript strict**, **Fluent UI 8**.
- Tree-shakable exports under \`lib/components\`, \`lib/hooks\`, \`lib/utilities\`.
- **Zero runtime dependencies**. Only peer dependencies listed in \`package.json\` may be referenced.
- All code lives under \`src/\` and uses **relative imports** (no path aliases).

## 2. Pre-Drafting Checklist
1. Confirm the feature belongs in the toolkit (reusable across SPFx projects).
2. Open/scan an adjacent file (Copilot relies on nearby context).
3. Add interfaces/types first; mention tree-shakable import expectations in comments.
4. Keep bundle size in mind: prefer native utilities over pulling in dependencies.
5. Run \`npm run lint\` or \`npm run build\` to ensure the project is clean before requesting large completions.

## 3. Coding Standards
- **Functional React components only**. No class components.
- Type every prop, state, and handler explicitly.
- Follow file structure: component + \`.module.scss\` (if styles are needed) + \`.types.ts\`.
- Use existing abstractions (\`SPContext\`, \`createSPExtractor\`, form primitives) instead of re‑implementing logic.
- Prefer composition over inheritance; keep components focused.
- Every new helper/util exports from the relevant \`index.ts\` barrel.

### Relative Imports (Mandatory)
\`\`\`ts
// ✅ Allowed
import { Header } from '../Header';
import { formatFieldValue } from '../../utilities/listItemHelper';

// ❌ Forbidden (Copilot must NOT propose these)
import { Header } from '@components/Header';
import '@/utilities/listItemHelper';
\`\`\`

### Tree-Shakable Exports
\`\`\`ts
// ✅ Re-export in index files
export * from './Card';

// ✅ Consumers will import like:
// import { Card } from 'spfx-toolkit/lib/components/Card';
\`\`\`

## 4. PnP & SP Context Rules
- Toolkit modules may import PnP packages, but only through the existing bundles under \`src/utilities/context/pnpImports/*\`.
- Keep \`src/types/pnp-augmentations.d.ts\` in sync when adding new PnP capabilities.
- \`SPContext\` (under \`utilities/context\`) is responsible for initializing PnP—never add per-component PnP setup.

## 5. Build & Validation Workflow
| Command | Purpose |
| ------- | ------- |
| \`npm run build\` | Clean + compile + validate output |
| \`npm run watch\` | Watch mode for local development |
| \`npm run validate\` | Ensures required lib files exist |

Before opening a PR:
1. \`npm run build\`
2. \`npm run lint\` (if needed)
3. Verify \`lib/\` output or run \`npm run build:full\` when publishing

## 6. Documentation & Samples
- Document every component/hook in \`SPFX-Toolkit-Usage-Guide.md\`.
- Update \`README.md\` feature tables when adding new modules.
- Provide sample usage (preferably in markdown) showcasing props and expected patterns.

## 7. Testing & QA
- Add unit tests or story-like examples when practical.
- Ensure accessible markup (ARIA roles, labels, keyboard navigation).
- Run bundle-size sanity checks if a component pulls in large sub-dependencies (DevExtreme, etc.).

## 8. Versioning & Releases
- This repo follows semver but releases are manual. When changing public APIs, update the changelog section in \`SPFX-Toolkit-Usage-Guide.md\`.
- Do **not** bump versions automatically; maintainers handle publishing.

## 9. PR / Commit Guidance
- Use Conventional Commits (\`feat(card): add footer actions\`).
- Include bullet summaries describing behavior, bundle impact, and testing.
- Point reviewers to docs updates and usage samples.

## 10. Absolute “No-Go” Rules
- ❌ No new npm dependencies (runtime or dev) without explicit maintainer approval.
- ❌ No direct DOM manipulation; always go through React.
- ❌ No copying code from consumer solutions into the toolkit.
- ❌ No hard-coded tenant/site URLs.
- ❌ No \`any\` – use \`unknown\` + type guards when unavoidable.
- ❌ No \`console.log\` — use the toolkit logger utilities or remove before commit.

Keep the toolkit lean, tree-shakable, and consumer-friendly. EOF
`;

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.success}>
        <strong>GitHub Copilot</strong> can dramatically accelerate your development when properly
        configured. Add this file to your project root to give Copilot context about our standards
        and practices.
      </MessageBar>

      {/* Instructions */}
      <Section title="Setup Instructions" icon="Robot" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            How to Configure GitHub Copilot
          </h4>
          <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Create a file named <code>copilot-instructions.md</code> in your project root
            </li>
            <li style={{ marginBottom: '8px' }}>
              Copy the template below into this file
            </li>
            <li style={{ marginBottom: '8px' }}>
              Customize it for your specific project needs
            </li>
            <li style={{ marginBottom: '8px' }}>
              Commit the file to your repository
            </li>
            <li style={{ marginBottom: '8px' }}>
              GitHub Copilot will automatically use these instructions for context
            </li>
          </ol>

          <MessageBar messageBarType={MessageBarType.info}>
            <strong>Note:</strong> Copilot reads this file automatically. No additional
            configuration needed in VS Code!
          </MessageBar>
        </div>
      </Section>

      {/* Template */}
      <Section
        title="copilot-instructions.md Template"
        icon="PageCode"
        defaultExpanded={true}
      >
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Complete template with SPFx best practices, spfx-toolkit usage, and team standards:
          </p>
          <CodeBlock
            code={copilotInstructionsMd}
            language="markdown"
            filename="copilot-instructions.md"
            showLineNumbers={true}
            maxHeight={500}
          />
        </div>
      </Section>

      {/* Benefits */}
      <Section title="Benefits of Copilot Instructions" icon="Lightbulb" defaultExpanded={true}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            With properly configured instructions, GitHub Copilot will:
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
                icon: '🎯',
                title: 'Use spfx-toolkit',
                description:
                  'Suggest spfx-toolkit components instead of writing custom implementations',
              },
              {
                icon: '✅',
                title: 'Follow Standards',
                description: 'Generate code that matches your naming conventions and patterns',
              },
              {
                icon: '🔒',
                title: 'Type Safety',
                description: 'Create properly typed interfaces and avoid using any',
              },
              {
                icon: '📝',
                title: 'Validation',
                description: 'Include Zod schemas for form validation automatically',
              },
              {
                icon: '⚡',
                title: 'Best Practices',
                description: 'Apply SharePoint and React best practices in suggestions',
              },
              {
                icon: '🧪',
                title: 'Error Handling',
                description: 'Include proper try/catch blocks and error states',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  border: '1px solid #edebe9',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{benefit.icon}</div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#323130',
                    marginBottom: '4px',
                  }}
                >
                  {benefit.title}
                </div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>{benefit.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Tips */}
      <Section title="Tips for Using Copilot Effectively" icon="Tips" defaultExpanded={true}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            💡 Pro Tips
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Write clear comments:</strong> Describe what you want before writing code
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Use descriptive names:</strong> Start typing meaningful variable/function
              names
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Accept then refine:</strong> Accept Copilot suggestions and adjust as needed
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Copilot Chat:</strong> Ask questions about your code or SharePoint APIs
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Learn patterns:</strong> Study suggestions to learn better patterns
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Review carefully:</strong> Always review generated code for correctness
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ⚡ Keyboard Shortcuts
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {[
              { keys: 'Tab', action: 'Accept suggestion' },
              { keys: 'Esc', action: 'Dismiss suggestion' },
              { keys: 'Opt/Alt + ]', action: 'Next suggestion' },
              { keys: 'Opt/Alt + [', action: 'Previous suggestion' },
              { keys: 'Cmd/Ctrl + I', action: 'Open Copilot Chat' },
              { keys: 'Cmd/Ctrl + Shift + I', action: 'Inline Copilot Chat' },
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

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            🎯 Example Prompts for Copilot Chat
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              "Create a Zod schema for a SharePoint task with title, dueDate, and assignedTo"
            </li>
            <li style={{ marginBottom: '8px' }}>
              "Generate a form using spfx-toolkit FormContainer with SPTextField and SPUserField"
            </li>
            <li style={{ marginBottom: '8px' }}>
              "Write a Zustand store for managing project items with CRUD operations"
            </li>
            <li style={{ marginBottom: '8px' }}>
              "Create a service to fetch SharePoint list items using SPContext with error handling"
            </li>
            <li style={{ marginBottom: '8px' }}>
              "Explain how createSPExtractor works in this code"
            </li>
          </ul>
        </div>
      </Section>

      {/* Customization */}
      <Section title="Customizing for Your Project" icon="Edit" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            The template above is comprehensive, but you should customize it for your specific
            project:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            What to Add
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Project-specific domain models and interfaces</li>
            <li style={{ marginBottom: '8px' }}>
              Custom utility functions or patterns you use frequently
            </li>
            <li style={{ marginBottom: '8px' }}>
              SharePoint lists and their schemas if they're central to your project
            </li>
            <li style={{ marginBottom: '8px' }}>
              Team-specific preferences (e.g., logging patterns, API wrappers)
            </li>
            <li style={{ marginBottom: '8px' }}>
              Links to internal documentation or wikis
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            What to Remove/Modify
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Remove sections about libraries you don't use
            </li>
            <li style={{ marginBottom: '8px' }}>
              Update version numbers to match your project
            </li>
            <li style={{ marginBottom: '8px' }}>
              Adjust coding standards if your team has different conventions
            </li>
            <li style={{ marginBottom: '8px' }}>
              Add or remove SP field components based on what you actually use
            </li>
          </ul>

          <MessageBar messageBarType={MessageBarType.warning}>
            <strong>Keep it updated:</strong> Review and update copilot-instructions.md as your
            project evolves and standards change.
          </MessageBar>
        </div>
      </Section>
    </Stack>
  );
};
