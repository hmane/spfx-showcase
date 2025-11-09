import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Collaboration tab - Team workflows, code reviews, and communication
 */
export const Collaboration: React.FC<ITabComponentProps> = () => {
  const prTemplate = `## Summary
Brief description of what this PR does and why.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement
- [ ] Refactoring
- [ ] Documentation
- [ ] Performance improvement

## Changes Made
- List specific changes
- Include component/file names
- Mention any breaking changes

## Testing Done
- [ ] Tested locally with \`npm run serve\`
- [ ] All TypeScript errors resolved
- [ ] ESLint shows no warnings/errors
- [ ] Tested in SharePoint workbench
- [ ] Cross-browser testing (Edge, Chrome)
- [ ] Mobile responsive testing

## Screenshots (if applicable)
Add screenshots or GIFs showing the changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] No hardcoded secrets or API keys
- [ ] All functions have return types
- [ ] No use of \`any\` type
- [ ] Comments explain "why" not "what"
- [ ] Updated documentation if needed
- [ ] Tested with real SharePoint data
- [ ] Performance impact considered

## Related Work Items
Closes #[work-item-number]

## Additional Notes
Any additional context, caveats, or things reviewers should know.`;

  const commitMessageGuide = `# Conventional Commits Format
<type>(<scope>): <subject>

<body>

<footer>

# Types:
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style/formatting (no logic change)
refactor: Code restructuring (no feature/fix)
perf:     Performance improvement
test:     Adding/updating tests
chore:    Build/tooling changes

# Examples:
feat(fields): add SPCurrencyField component

fix(form-builder): resolve validation error on submit

docs(readme): update installation instructions

refactor(hooks): extract useFieldValidation hook

perf(grid): implement virtual scrolling for large lists

# Scope: Optional, indicates area of change
# Subject: Imperative, present tense ("add" not "added")
# Body: Optional, explain what and why
# Footer: Optional, reference work items or breaking changes`;

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.info}>
        Effective team collaboration ensures code quality, knowledge sharing, and consistent
        development practices across the team.
      </MessageBar>

      {/* Code Review Standards */}
      <Section title="Code Review Checklist" icon="ReviewSolid" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Every pull request must pass this comprehensive review checklist:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Functionality
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Code does what it's supposed to do</li>
            <li style={{ marginBottom: '8px' }}>No regressions or breaking changes</li>
            <li style={{ marginBottom: '8px' }}>Edge cases handled appropriately</li>
            <li style={{ marginBottom: '8px' }}>Error handling is robust</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Code Quality
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Follows TypeScript strict mode (no any types)</li>
            <li style={{ marginBottom: '8px' }}>ESLint and Prettier passing</li>
            <li style={{ marginBottom: '8px' }}>Functions have explicit return types</li>
            <li style={{ marginBottom: '8px' }}>Interfaces use I prefix convention</li>
            <li style={{ marginBottom: '8px' }}>Meaningful variable and function names</li>
            <li style={{ marginBottom: '8px' }}>DRY principle followed (no duplication)</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ React Best Practices
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Functional components with hooks (no class components)</li>
            <li style={{ marginBottom: '8px' }}>useEffect dependencies are correct and minimal</li>
            <li style={{ marginBottom: '8px' }}>Expensive calculations memoized</li>
            <li style={{ marginBottom: '8px' }}>Props properly typed with interfaces</li>
            <li style={{ marginBottom: '8px' }}>No unnecessary re-renders</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Security
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>No hardcoded secrets, API keys, or credentials</li>
            <li style={{ marginBottom: '8px' }}>User input validated with Zod schemas</li>
            <li style={{ marginBottom: '8px' }}>HTML sanitized to prevent XSS</li>
            <li style={{ marginBottom: '8px' }}>SharePoint permissions checked before operations</li>
            <li style={{ marginBottom: '8px' }}>No sensitive data logged to console</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Testing & Documentation
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Code tested in local workbench</li>
            <li style={{ marginBottom: '8px' }}>Complex logic has unit tests</li>
            <li style={{ marginBottom: '8px' }}>Comments explain "why" not "what"</li>
            <li style={{ marginBottom: '8px' }}>README updated if new features added</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Performance
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>No unnecessary API calls</li>
            <li style={{ marginBottom: '8px' }}>Large lists use pagination or virtualization</li>
            <li style={{ marginBottom: '8px' }}>Images optimized and lazy-loaded</li>
            <li style={{ marginBottom: '8px' }}>Bundle size impact considered</li>
          </ul>
        </div>
      </Section>

      {/* Pull Request Template */}
      <Section title="Pull Request Template" icon="GitGraph" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Use this template when creating pull requests in Azure DevOps:
          </p>
          <CodeBlock
            code={prTemplate}
            language="markdown"
            filename="PR_TEMPLATE.md"
            showLineNumbers={false}
            maxHeight={400}
          />

          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '16px' } }}>
            <strong>Tip:</strong> Save this as .azuredevops/pull_request_template.md in your repo
            root to auto-populate PR descriptions.
          </MessageBar>
        </div>
      </Section>

      {/* Commit Message Standards */}
      <Section title="Commit Message Standards" icon="FileCode" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Follow Conventional Commits format for clear, searchable history:
          </p>
          <CodeBlock
            code={commitMessageGuide}
            language="bash"
            filename="COMMIT_CONVENTIONS.txt"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Real-World Examples
          </h4>
          <CodeBlock
            code={`# ✅ Good commit messages
git commit -m "feat(fields): add SPCurrencyField with locale support"

git commit -m "fix(form-builder): resolve validation error on submit

- Fixed issue where validation triggered before user input
- Added debounce to validation logic
- Updated error message display timing

Closes #1234"

git commit -m "refactor(hooks): extract useFieldValidation hook"

git commit -m "perf(grid): implement virtual scrolling for 10k+ items"

git commit -m "docs(readme): add SPContext initialization examples"

# ❌ Bad commit messages
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "WIP"
git commit -m "changes from review"`}
            language="bash"
            showLineNumbers={false}
          />
        </div>
      </Section>

      {/* Definition of Done */}
      <Section title="Definition of Done" icon="CheckMark" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            A work item is only "Done" when ALL of these criteria are met:
          </p>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#f3f2f1',
              borderLeft: '4px solid #0078d4',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              Development Complete
            </h4>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
              <li style={{ marginBottom: '8px' }}>Code implemented and working</li>
              <li style={{ marginBottom: '8px' }}>No TypeScript errors or ESLint warnings</li>
              <li style={{ marginBottom: '8px' }}>Code follows style guidelines</li>
              <li style={{ marginBottom: '8px' }}>No hardcoded values or secrets</li>
            </ul>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#f3f2f1',
              borderLeft: '4px solid #107c10',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              Testing Complete
            </h4>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
              <li style={{ marginBottom: '8px' }}>Tested locally with npm run serve</li>
              <li style={{ marginBottom: '8px' }}>Tested in SharePoint workbench</li>
              <li style={{ marginBottom: '8px' }}>Cross-browser tested (Edge, Chrome)</li>
              <li style={{ marginBottom: '8px' }}>Mobile responsive verified</li>
              <li style={{ marginBottom: '8px' }}>Edge cases and error scenarios tested</li>
            </ul>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#f3f2f1',
              borderLeft: '4px solid #8764b8',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              Review Complete
            </h4>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
              <li style={{ marginBottom: '8px' }}>Pull request created with template</li>
              <li style={{ marginBottom: '8px' }}>Code reviewed by at least one peer</li>
              <li style={{ marginBottom: '8px' }}>All review comments addressed</li>
              <li style={{ marginBottom: '8px' }}>Approved by reviewer(s)</li>
            </ul>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#f3f2f1',
              borderLeft: '4px solid #d13438',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              Deployment Ready
            </h4>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
              <li style={{ marginBottom: '8px' }}>Merged to main/develop branch</li>
              <li style={{ marginBottom: '8px' }}>Build pipeline passes</li>
              <li style={{ marginBottom: '8px' }}>Documentation updated if needed</li>
              <li style={{ marginBottom: '8px' }}>Work item linked to commits</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Communication Guidelines */}
      <Section title="Communication Best Practices" icon="Communications" defaultExpanded={true}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            When to Use Which Channel
          </h4>

          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                {
                  channel: 'Azure DevOps Work Items',
                  when: 'Track features, bugs, tasks',
                  icon: 'WorkItem',
                  color: '#0078d4',
                },
                {
                  channel: 'Pull Request Comments',
                  when: 'Code-specific discussions and reviews',
                  icon: 'Comment',
                  color: '#107c10',
                },
                {
                  channel: 'Teams Chat',
                  when: 'Quick questions, daily standups',
                  icon: 'TeamsLogo',
                  color: '#464775',
                },
                {
                  channel: 'Email',
                  when: 'Formal communication, external stakeholders',
                  icon: 'Mail',
                  color: '#d13438',
                },
                {
                  channel: 'Documentation',
                  when: 'Permanent reference, onboarding',
                  icon: 'Documentation',
                  color: '#8764b8',
                },
                {
                  channel: 'Meetings',
                  when: 'Complex discussions, planning sessions',
                  icon: 'Calendar',
                  color: '#008272',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    border: '1px solid #edebe9',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    borderTop: `3px solid ${item.color}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#323130',
                      marginBottom: '8px',
                    }}
                  >
                    {item.channel}
                  </div>
                  <div style={{ fontSize: '13px', color: '#605e5c' }}>{item.when}</div>
                </div>
              ))}
            </div>
          </div>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Effective Code Review Comments
          </h4>
          <CodeBlock
            code={`# ✅ Good review comments - Specific, actionable, respectful

"Consider extracting this logic into a separate hook for reusability.
Example: useProjectValidation()"

"This could cause a memory leak. The useEffect cleanup function should
cancel the subscription. See: [link to docs]"

"Great use of memoization here! This should improve performance
significantly for large datasets."

"I noticed this field name doesn't match the SharePoint column.
Should it be 'ProjectStatus' instead of 'Status'?"

# ❌ Poor review comments - Vague, not helpful

"This is wrong"
"Why did you do it this way?"
"Bad code"
"Change this"`}
            language="markdown"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Response Time Expectations
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Pull Request Reviews:</strong> Within 1 business day
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Teams Messages:</strong> Within 2-4 hours during work hours
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Work Item Updates:</strong> Within 1 business day
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Production Bugs:</strong> Immediate acknowledgment, fix ASAP
            </li>
          </ul>
        </div>
      </Section>

      {/* Branching Strategy */}
      <Section title="Branching Strategy" icon="BranchMerge" defaultExpanded={true}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Follow this branching model for consistent workflows:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Branch Types
          </h4>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
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
                    Branch
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Purpose
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Naming Convention
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    branch: 'main',
                    purpose: 'Production-ready code',
                    naming: 'main',
                  },
                  {
                    branch: 'develop',
                    purpose: 'Integration branch for features',
                    naming: 'develop',
                  },
                  {
                    branch: 'Feature',
                    purpose: 'New features',
                    naming: 'feature/work-item-123-description',
                  },
                  {
                    branch: 'Bugfix',
                    purpose: 'Bug fixes',
                    naming: 'bugfix/work-item-456-issue-name',
                  },
                  {
                    branch: 'Hotfix',
                    purpose: 'Urgent production fixes',
                    naming: 'hotfix/critical-issue-name',
                  },
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
                        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                      }}
                    >
                      {row.branch}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        color: '#323130',
                      }}
                    >
                      {row.purpose}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        color: '#0078d4',
                        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                      }}
                    >
                      {row.naming}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Workflow Example
          </h4>
          <CodeBlock
            code={`# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/1234-add-currency-field

# 2. Make changes and commit regularly
git add .
git commit -m "feat(fields): add SPCurrencyField component"

# 3. Push to remote
git push -u origin feature/1234-add-currency-field

# 4. Create Pull Request in Azure DevOps
# - Target: develop (not main)
# - Fill out PR template
# - Request reviewers

# 5. After approval, merge to develop
# - Use "Squash and merge" for clean history
# - Delete feature branch after merge

# 6. Periodically, develop is merged to main for releases`}
            language="bash"
            showLineNumbers={false}
          />
        </div>
      </Section>

      {/* Knowledge Sharing */}
      <Section title="Knowledge Sharing" icon="BookAnswers" defaultExpanded={false}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Document As You Go
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Update README when adding new features or changing setup
            </li>
            <li style={{ marginBottom: '8px' }}>
              Add JSDoc comments to complex functions
            </li>
            <li style={{ marginBottom: '8px' }}>
              Document "gotchas" and non-obvious decisions
            </li>
            <li style={{ marginBottom: '8px' }}>
              Keep this Developer Guide updated with new patterns
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Pair Programming & Mentoring
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Schedule pairing sessions for complex features
            </li>
            <li style={{ marginBottom: '8px' }}>
              Junior devs shadow senior devs on challenging tasks
            </li>
            <li style={{ marginBottom: '8px' }}>
              Share learnings in team meetings or Slack/Teams
            </li>
            <li style={{ marginBottom: '8px' }}>
              Record short demo videos for new features
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Code Examples Repository
          </h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#323130' }}>
            This SPFx Showcase serves as a living reference. When you build something reusable or
            solve a tricky problem, add it here so the whole team benefits. Keep examples
            well-documented and production-quality.
          </p>
        </div>
      </Section>
    </Stack>
  );
};
