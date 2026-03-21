import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Copilot Instructions tab - GitHub Copilot configuration
 */
export const CopilotInstructions: React.FC<ITabComponentProps> = () => {
  const copilotInstructionsMd = `# Copilot Instructions for \`spfx-showcase\`

This repository is an SPFx solution that demonstrates how to use \`spfx-toolkit\` in real SharePoint pages. Suggestions should favor clear, testable demos over clever abstractions.

## Project Context
- SPFx **1.21.1**
- **React 17**, **TypeScript**, **Fluent UI 8**
- \`spfx-toolkit\` is linked locally with \`file:../spfx-toolkit\`
- Main areas:
  - \`src/webparts/showcase\` for toolkit demos
  - \`src/webparts/developerToolkit\` for generators, utilities, and developer guidance

## Toolkit Usage Rules
- Prefer public package entrypoints such as:
  - \`spfx-toolkit/components/Card\`
  - \`spfx-toolkit/components/UserPersona\`
  - \`spfx-toolkit/components/spForm\`
  - \`spfx-toolkit/components/spFields\`
  - \`spfx-toolkit/hooks\`
  - \`spfx-toolkit/utilities/context\`
  - \`spfx-toolkit/utilities/listItemHelper\`
  - \`spfx-toolkit/utilities/batchBuilder\`
- Use \`spfx-toolkit/lib/...\` only when the package does not expose a public subpath for that type or implementation detail.
- Never import UI components from the package root.
- Load PnP bundles once through \`src/webparts/pnpImports.ts\`.
- Initialize \`SPContext\` once per web part in \`onInit()\` using \`SPContext.development(...)\`, \`SPContext.production(...)\`, or \`SPContext.smart(...)\`.

## Demo Solution Expectations
- Keep showcase examples easy to verify in a SharePoint site.
- Prefer guided flows, seeded sample data, and obvious success or error messages.
- When a demo depends on SharePoint artifacts, provide setup helpers or fallback instructions in the UI.
- Avoid overly complex sample code when a simpler scenario demonstrates the same capability.
- Code samples shown in the UI must match the current package import guidance.

## Developer Utilities Expectations
- Utilities should be deterministic, copy-friendly, and safe for browser-only execution.
- Prefer small pure helpers for parsing, formatting, and generation logic.
- Preserve user input on validation errors whenever possible.
- When clipboard APIs fail, provide graceful fallback behavior.
- Do not add dependencies for simple formatting or conversion tasks.

## Editing Rules
- Follow existing repo structure and naming.
- Use functional React components and explicit types.
- Reuse shared showcase building blocks before adding new layout patterns.
- Do not edit generated SharePoint package output or release bundles by hand.

## Validation Workflow
- Run \`npx tsc --noEmit\` for quick validation after TypeScript changes.
- Run \`npm run test:utilities\` when changing parsing, formatting, or generator helpers.
- Run \`npm run build\` before considering the task complete.
- If behavior changes, update related guidance in \`README.md\`, \`SPFX-Toolkit-Usage-Guide.md\`, and the developer guide tabs.

## Avoid
- No hard-coded tenant-specific URLs.
- No \`any\` unless unavoidable and justified.
- No stale \`spfx-toolkit/lib/...\` examples when a public subpath exists.
- No extra demo complexity without a testing or learning benefit.
`;

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.success}>
        <strong>GitHub Copilot</strong> can dramatically accelerate your development when properly
        configured. Keep these instructions in <code>.github/copilot-instructions.md</code> so
        Copilot has repository-specific context for this SPFx demo solution.
      </MessageBar>

      {/* Instructions */}
      <Section title="Setup Instructions" icon="Robot" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            How to Configure GitHub Copilot
          </h4>
          <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Keep <code>.github/copilot-instructions.md</code> as the canonical Copilot guidance file
            </li>
            <li style={{ marginBottom: '8px' }}>
              Update the template below whenever toolkit imports, testing workflow, or repo structure changes
            </li>
            <li style={{ marginBottom: '8px' }}>
              Keep the content aligned with <code>SPFX-Toolkit-Usage-Guide.md</code> and the actual codebase
            </li>
            <li style={{ marginBottom: '8px' }}>
              Keep the root <code>copilot-instructions.md</code> as a lightweight pointer only if
              you still need backwards compatibility
            </li>
            <li style={{ marginBottom: '8px' }}>
              GitHub Copilot will automatically use these instructions for context
            </li>
          </ol>

          <MessageBar messageBarType={MessageBarType.info}>
            <strong>Note:</strong> This repository already includes the file under <code>.github/</code>.
            Treat the template below as the source of truth for future edits.
          </MessageBar>
        </div>
      </Section>

      {/* Template */}
      <Section
        title=".github/copilot-instructions.md Template"
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
            filename=".github/copilot-instructions.md"
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
            <strong>Keep it updated:</strong> Review and update <code>.github/copilot-instructions.md</code>
            as toolkit entrypoints, testing scripts, and demo patterns evolve.
          </MessageBar>
        </div>
      </Section>
    </Stack>
  );
};
