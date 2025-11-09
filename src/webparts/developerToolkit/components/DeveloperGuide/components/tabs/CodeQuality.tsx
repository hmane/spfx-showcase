import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ICommand, ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { CommandPalette } from '../shared/CommandPalette';
import { Section } from '../shared/Section';

/**
 * Code Quality tab - ESLint, TypeScript, and coding standards
 */
export const CodeQuality: React.FC<ITabComponentProps> = () => {
  const eslintConfig = `{
  "extends": ["@microsoft/eslint-config-spfx/lib/profiles/react"],
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}`;

  const prettierConfig = `{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}`;

  const commands: ICommand[] = [
    {
      command: 'npm run type-check',
      description: 'Run TypeScript compiler without emitting files',
      category: 'Type Checking',
    },
    {
      command: 'npx eslint src/**/*.{ts,tsx}',
      description: 'Lint all TypeScript files',
      category: 'Linting',
    },
    {
      command: 'npx eslint src/**/*.{ts,tsx} --fix',
      description: 'Auto-fix ESLint issues',
      category: 'Linting',
    },
    {
      command: 'npx prettier --write "src/**/*.{ts,tsx,scss}"',
      description: 'Format all source files',
      category: 'Formatting',
    },
    {
      command: 'npx prettier --check "src/**/*.{ts,tsx,scss}"',
      description: 'Check if files are formatted',
      category: 'Formatting',
    },
  ];

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.info}>
        Maintain high code quality with ESLint, TypeScript strict mode, and Prettier formatting.
        These tools are already configured in your project.
      </MessageBar>

      {/* ESLint Configuration */}
      <Section title="ESLint Configuration" icon="CodeEdit" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Our ESLint configuration extends Microsoft's SPFx React profile with custom rules:
          </p>
          <CodeBlock
            code={eslintConfig}
            language="json"
            filename=".eslintrc.json"
            showLineNumbers={true}
          />

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Key Rules Explained
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>no-explicit-any:</strong> Warns when using <code>any</code> type - prefer specific types
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>no-unused-vars:</strong> Warns about unused variables (except those starting with _)
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>no-console:</strong> Warns on console.log - use console.warn/error instead
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>react-hooks rules:</strong> Enforces React hooks best practices
            </li>
          </ul>
        </div>
      </Section>

      {/* TypeScript Configuration */}
      <Section title="TypeScript Strict Mode" icon="FileCode" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            TypeScript strict mode helps catch errors at compile time:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {[
              {
                rule: 'Explicit Types',
                description: 'Always specify function return types and parameter types',
              },
              {
                rule: 'No Implicit Any',
                description: 'Avoid implicit any - TypeScript must infer or you must specify',
              },
              {
                rule: 'Strict Null Checks',
                description: 'null and undefined must be explicitly handled',
              },
              {
                rule: 'No Unused Locals',
                description: 'Remove unused variables and imports',
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
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
                  {item.rule}
                </div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>{item.description}</div>
              </div>
            ))}
          </div>

          <MessageBar messageBarType={MessageBarType.success}>
            <strong>Tip:</strong> Run <code>npm run type-check</code> before committing to catch TypeScript errors early.
          </MessageBar>
        </div>
      </Section>

      {/* Prettier Configuration */}
      <Section title="Prettier Formatting" icon="EditStyle" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Prettier ensures consistent code formatting across the team:
          </p>
          <CodeBlock
            code={prettierConfig}
            language="json"
            filename=".prettierrc"
            showLineNumbers={true}
          />

          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '16px' } }}>
            <strong>Auto-format on save:</strong> VS Code is configured to format files automatically
            when you save. No manual formatting needed!
          </MessageBar>
        </div>
      </Section>

      {/* Quality Commands */}
      <Section title="Quality Check Commands" icon="CommandPrompt" defaultExpanded={true}>
        <CommandPalette commands={commands} title="Quality Commands" grouped={true} />
      </Section>

      {/* Code Review Checklist */}
      <Section title="Code Review Checklist" icon="CheckboxComposite" defaultExpanded={true}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Use this checklist when reviewing code or before creating a pull request:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Type Safety
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>All functions have explicit return types</li>
            <li style={{ marginBottom: '8px' }}>No use of <code>any</code> type</li>
            <li style={{ marginBottom: '8px' }}>Interfaces properly defined with <code>I</code> prefix</li>
            <li style={{ marginBottom: '8px' }}>No TypeScript errors or warnings</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Code Style
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Code is formatted with Prettier</li>
            <li style={{ marginBottom: '8px' }}>No ESLint warnings or errors</li>
            <li style={{ marginBottom: '8px' }}>Meaningful variable and function names</li>
            <li style={{ marginBottom: '8px' }}>Comments explain "why" not "what"</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ React Best Practices
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Functional components with hooks (no class components)</li>
            <li style={{ marginBottom: '8px' }}>useEffect dependencies are correct</li>
            <li style={{ marginBottom: '8px' }}>No unnecessary re-renders</li>
            <li style={{ marginBottom: '8px' }}>Props are properly typed with interfaces</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Performance
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Large lists use pagination or virtualization</li>
            <li style={{ marginBottom: '8px' }}>Expensive calculations are memoized</li>
            <li style={{ marginBottom: '8px' }}>Images are optimized and lazy-loaded</li>
            <li style={{ marginBottom: '8px' }}>No unnecessary API calls in loops</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Security
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>No hardcoded secrets or API keys</li>
            <li style={{ marginBottom: '8px' }}>User input is validated with Zod</li>
            <li style={{ marginBottom: '8px' }}>HTML is sanitized to prevent XSS</li>
            <li style={{ marginBottom: '8px' }}>SharePoint permissions are checked</li>
          </ul>
        </div>
      </Section>

      {/* File Size Limits */}
      <Section title="File Size Guidelines" icon="FileTemplate" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Keep files focused and maintainable:
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
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
                    File Type
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Target
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Maximum
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Action if Exceeded
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Component', target: '< 200 lines', max: '300 lines', action: 'Extract sub-components' },
                  { type: 'Service', target: '< 150 lines', max: '250 lines', action: 'Split into multiple services' },
                  { type: 'Store', target: '< 100 lines', max: '150 lines', action: 'Create separate stores' },
                  { type: 'Utility', target: '< 100 lines', max: '150 lines', action: 'Split into focused files' },
                ].map((row, index) => (
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
                      {row.type}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderBottom: '1px solid #edebe9',
                        color: '#107c10',
                      }}
                    >
                      {row.target}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderBottom: '1px solid #edebe9',
                        color: '#d13438',
                      }}
                    >
                      {row.max}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        color: '#323130',
                      }}
                    >
                      {row.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </Stack>
  );
};
