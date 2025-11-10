import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { IGitCommand, ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Azure DevOps tab - Git workflow and commands
 */
export const AzureDevOps: React.FC<ITabComponentProps> = () => {
  const gitConfigSetup = `# Configure your Git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"

# Configure line endings (recommended)
git config --global core.autocrlf input  # Mac/Linux
git config --global core.autocrlf true   # Windows

# Configure default editor
git config --global core.editor "code --wait"

# Configure pull strategy
git config --global pull.rebase false`;

  const cloneSetup = `# Clone repository from Azure DevOps
git clone https://dev.azure.com/your-org/your-project/_git/your-repo

# Navigate to project
cd your-repo

# Install dependencies
npm install

# Verify setup
npm run serve`;

  const gitWorkflow = `# 1. Start new feature from main
git checkout main
git pull origin main
git checkout -b feature/my-new-feature

# 2. Make changes and commit regularly
git add .
git commit -m "feat: add new component"

# 3. Push feature branch to remote
git push -u origin feature/my-new-feature

# 4. Create Pull Request in Azure DevOps
# (Use Azure DevOps web interface)

# 5. After PR approval, sync main
git checkout main
git pull origin main

# 6. Delete local feature branch
git branch -d feature/my-new-feature`;

  const branchNamingConvention = `# Feature branches
feature/user-profile-card
feature/dashboard-redesign
feature/export-to-excel

# Bug fix branches
bugfix/date-picker-timezone
bugfix/permission-check

# Hotfix branches (production issues)
hotfix/critical-security-fix
hotfix/data-loss-prevention

# Release branches
release/v1.2.0
release/v2.0.0-beta

# Personal/experimental branches
personal/john/spike-new-api
personal/jane/performance-test`;

  const commitMessageFormat = `# Format: <type>(<scope>): <subject>

# Types:
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, etc.)
refactor: Code refactoring
perf:     Performance improvements
test:     Adding or updating tests
chore:    Build process or auxiliary tool changes
ci:       CI/CD changes

# Examples:
feat(user-card): add profile photo display
fix(date-picker): resolve timezone offset issue
docs(readme): update installation instructions
refactor(api-service): simplify error handling
perf(list-view): implement virtual scrolling
test(form-builder): add validation tests
chore(deps): update spfx-toolkit to v2.1.0
ci(azure): add code coverage reporting

# Good commit messages:
✅ feat(dashboard): add export to Excel functionality
✅ fix(form): prevent duplicate submissions
✅ perf(grid): lazy load images for better performance

# Bad commit messages:
❌ update stuff
❌ fixed bug
❌ changes`;

  const dailyCommands: IGitCommand[] = [
    {
      command: 'git status',
      description: 'Check current branch and modified files',
      category: 'Basic',
    },
    {
      command: 'git pull',
      description: 'Update current branch with remote changes',
      category: 'Basic',
    },
    {
      command: 'git add .',
      description: 'Stage all changes for commit',
      category: 'Basic',
    },
    {
      command: 'git commit -m "message"',
      description: 'Commit staged changes with message',
      category: 'Basic',
    },
    {
      command: 'git push',
      description: 'Push commits to remote branch',
      category: 'Basic',
    },
  ];

  const branchCommands: IGitCommand[] = [
    {
      command: 'git branch',
      description: 'List all local branches',
      category: 'Branching',
    },
    {
      command: 'git branch -a',
      description: 'List all branches (local + remote)',
      category: 'Branching',
    },
    {
      command: 'git checkout -b feature/my-feature',
      description: 'Create and switch to new branch',
      category: 'Branching',
    },
    {
      command: 'git checkout main',
      description: 'Switch to main branch',
      category: 'Branching',
    },
    {
      command: 'git branch -d feature/old-feature',
      description: 'Delete local branch (safe)',
      category: 'Branching',
    },
    {
      command: 'git branch -D feature/old-feature',
      description: 'Force delete local branch',
      category: 'Branching',
      dangerous: true,
    },
  ];

  const syncCommands: IGitCommand[] = [
    {
      command: 'git fetch origin',
      description: 'Download remote changes without merging',
      category: 'Syncing',
    },
    {
      command: 'git pull origin main',
      description: 'Pull latest changes from main branch',
      category: 'Syncing',
    },
    {
      command: 'git merge origin/main',
      description: 'Merge remote main into current branch',
      category: 'Syncing',
    },
    {
      command: 'git rebase origin/main',
      description: 'Rebase current branch onto main',
      category: 'Syncing',
    },
  ];

  const undoCommands: IGitCommand[] = [
    {
      command: 'git restore <file>',
      description: 'Discard changes in working directory',
      category: 'Undo',
    },
    {
      command: 'git restore --staged <file>',
      description: 'Unstage file (keep changes)',
      category: 'Undo',
    },
    {
      command: 'git reset HEAD~1',
      description: 'Undo last commit (keep changes)',
      category: 'Undo',
    },
    {
      command: 'git reset --hard HEAD~1',
      description: 'Undo last commit (discard changes)',
      category: 'Undo',
      dangerous: true,
    },
    {
      command: 'git revert <commit>',
      description: 'Create new commit that undoes a commit',
      category: 'Undo',
    },
  ];

  const inspectCommands: IGitCommand[] = [
    {
      command: 'git log --oneline',
      description: 'View commit history (compact)',
      category: 'Inspect',
    },
    {
      command: 'git log --oneline --graph --all',
      description: 'View branch graph',
      category: 'Inspect',
    },
    {
      command: 'git diff',
      description: 'Show unstaged changes',
      category: 'Inspect',
    },
    {
      command: 'git diff --staged',
      description: 'Show staged changes',
      category: 'Inspect',
    },
    {
      command: 'git show <commit>',
      description: 'Show commit details',
      category: 'Inspect',
    },
  ];

  const stashCommands: IGitCommand[] = [
    {
      command: 'git stash',
      description: 'Save changes temporarily',
      category: 'Stash',
    },
    {
      command: 'git stash list',
      description: 'List all stashes',
      category: 'Stash',
    },
    {
      command: 'git stash pop',
      description: 'Apply and remove latest stash',
      category: 'Stash',
    },
    {
      command: 'git stash apply',
      description: 'Apply latest stash (keep it)',
      category: 'Stash',
    },
    {
      command: 'git stash drop',
      description: 'Delete latest stash',
      category: 'Stash',
    },
  ];

  const prTemplate = `## Description
Brief description of the changes and their purpose.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tested locally
- [ ] Tested in workbench
- [ ] Tested in SharePoint site
- [ ] Added/updated unit tests
- [ ] Verified no console errors

## Screenshots (if applicable)
Add screenshots to help reviewers understand the changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings introduced
- [ ] Works in all supported browsers

## Related Work Items
- Work Item #123
- Work Item #456`;

  const renderCommandTable = (commands: IGitCommand[], title: string) => (
    <div style={{ marginBottom: '24px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>{title}</h4>
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
                  width: '45%',
                }}
              >
                Command
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #edebe9',
                  fontWeight: 600,
                  width: '55%',
                }}
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {commands.map((cmd, index) => (
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
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                    fontSize: '13px',
                    color: cmd.dangerous ? '#d13438' : '#0078d4',
                  }}
                >
                  {cmd.command}
                  {cmd.dangerous && (
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '11px',
                        color: '#d13438',
                        fontWeight: 600,
                      }}
                    >
                      ⚠️ DANGEROUS
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #edebe9',
                    color: '#323130',
                  }}
                >
                  {cmd.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.info}>
        Our team uses <strong>Azure DevOps</strong> for source control, work tracking, and CI/CD
        pipelines. Follow these Git workflows and conventions for smooth collaboration.
      </MessageBar>

      {/* Initial Setup */}
      <Section title="Initial Setup" icon="Settings" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Configure Git
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Set up your Git configuration before starting:
          </p>
          <CodeBlock
            code={gitConfigSetup}
            language="bash"
            filename="Git Configuration"
            showLineNumbers={true}
            maxHeight={250}
          />

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Clone Repository
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Clone the project from Azure DevOps:
          </p>
          <CodeBlock
            code={cloneSetup}
            language="bash"
            filename="Clone and Setup"
            showLineNumbers={true}
            maxHeight={250}
          />
        </div>
      </Section>

      {/* Git Workflow */}
      <Section title="Standard Git Workflow" icon="BranchMerge" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Follow this workflow for all development:
          </p>
          <CodeBlock
            code={gitWorkflow}
            language="bash"
            filename="Feature Development Workflow"
            showLineNumbers={true}
            maxHeight={500}
          />

          <MessageBar
            messageBarType={MessageBarType.warning}
            styles={{ root: { marginTop: '16px' } }}
          >
            <strong>Important:</strong> Always create a new branch from an up-to-date main branch.
            Never commit directly to main.
          </MessageBar>
        </div>
      </Section>

      {/* Branch Naming */}
      <Section title="Branch Naming Convention" icon="BranchFork2" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Use descriptive branch names with these prefixes:
          </p>
          <CodeBlock
            code={branchNamingConvention}
            language="bash"
            filename="Branch Naming Examples"
            showLineNumbers={true}
            maxHeight={500}
          />
        </div>
      </Section>

      {/* Commit Messages */}
      <Section title="Commit Message Format" icon="Comment" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Write clear, consistent commit messages using Conventional Commits:
          </p>
          <CodeBlock
            code={commitMessageFormat}
            language="bash"
            filename="Commit Message Guidelines"
            showLineNumbers={true}
            maxHeight={500}
          />
        </div>
      </Section>

      {/* Git Commands Cheat Sheet */}
      <Section title="Git Commands Cheat Sheet" icon="CommandPrompt" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Quick reference for common Git operations:
          </p>

          {renderCommandTable(dailyCommands, '📅 Daily Commands')}
          {renderCommandTable(branchCommands, '🌿 Branch Management')}
          {renderCommandTable(syncCommands, '🔄 Syncing')}
          {renderCommandTable(undoCommands, '↩️ Undo Changes')}
          {renderCommandTable(inspectCommands, '🔍 Inspect History')}
          {renderCommandTable(stashCommands, '📦 Stash (Temporary Save)')}

          <MessageBar messageBarType={MessageBarType.severeWarning}>
            <strong>Warning:</strong> Commands marked as <strong>DANGEROUS</strong> can cause data
            loss. Use with extreme caution!
          </MessageBar>
        </div>
      </Section>

      {/* Pull Request Process */}
      <Section title="Pull Request Process" icon="PullRequest" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Creating a Pull Request
          </h4>
          <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Push your feature branch to Azure DevOps
            </li>
            <li style={{ marginBottom: '8px' }}>
              Navigate to Azure DevOps → Repos → Pull Requests
            </li>
            <li style={{ marginBottom: '8px' }}>
              Click "New Pull Request"
            </li>
            <li style={{ marginBottom: '8px' }}>
              Select your feature branch as source, main as target
            </li>
            <li style={{ marginBottom: '8px' }}>
              Fill in PR description using template below
            </li>
            <li style={{ marginBottom: '8px' }}>
              Add reviewers (minimum 1 required)
            </li>
            <li style={{ marginBottom: '8px' }}>
              Link related work items
            </li>
            <li style={{ marginBottom: '8px' }}>
              Submit and address review feedback
            </li>
          </ol>

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            PR Description Template
          </h4>
          <CodeBlock
            code={prTemplate}
            language="markdown"
            filename="Pull Request Template"
            showLineNumbers={true}
            maxHeight={500}
          />
        </div>
      </Section>

      {/* Branch Policies */}
      <Section title="Branch Policies" icon="Shield" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            The main branch is protected with these policies:
          </p>

          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Minimum 1 reviewer required</strong> - At least one team member must approve
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Build validation</strong> - All PR builds must succeed
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>No force push allowed</strong> - Protects commit history
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Work item linking</strong> - PRs should reference work items
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Comment resolution</strong> - All comments must be addressed
            </li>
          </ul>

          <MessageBar messageBarType={MessageBarType.success}>
            These policies ensure code quality and prevent accidental changes to main branch.
          </MessageBar>
        </div>
      </Section>

      {/* Common Scenarios */}
      <Section title="Common Scenarios" icon="Lightbulb" defaultExpanded={false}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Scenario: Forgot to create branch, made changes on main
          </h4>
          <CodeBlock
            code={`# Stash your changes
git stash

# Switch to main and update
git checkout main
git pull

# Create feature branch
git checkout -b feature/my-feature

# Apply your changes
git stash pop

# Continue working`}
            language="bash"
            maxHeight={250}
          />

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Scenario: Need to update feature branch with latest main
          </h4>
          <CodeBlock
            code={`# From your feature branch
git fetch origin
git merge origin/main

# Or use rebase for cleaner history
git fetch origin
git rebase origin/main`}
            language="bash"
            maxHeight={250}
          />

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Scenario: Merge conflicts
          </h4>
          <CodeBlock
            code={`# After git merge/pull shows conflicts:

# 1. Open conflicted files in VS Code
# 2. Choose "Accept Current Change", "Accept Incoming Change", or "Accept Both"
# 3. Save files
# 4. Stage resolved files
git add .

# 5. Complete merge
git commit -m "chore: resolve merge conflicts"

# 6. Push
git push`}
            language="bash"
            maxHeight={500}
          />
        </div>
      </Section>

      {/* Best Practices */}
      <Section title="Best Practices" icon="CheckMark" defaultExpanded={false}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ DO
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Commit frequently with clear messages</li>
            <li style={{ marginBottom: '8px' }}>Pull main before starting new work</li>
            <li style={{ marginBottom: '8px' }}>Keep PRs focused and reasonably sized</li>
            <li style={{ marginBottom: '8px' }}>Respond to PR feedback promptly</li>
            <li style={{ marginBottom: '8px' }}>Delete branches after merging</li>
            <li style={{ marginBottom: '8px' }}>Link commits to work items when applicable</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ❌ DON'T
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Don't commit directly to main</li>
            <li style={{ marginBottom: '8px' }}>Don't force push to shared branches</li>
            <li style={{ marginBottom: '8px' }}>Don't commit large binary files</li>
            <li style={{ marginBottom: '8px' }}>Don't commit secrets or credentials</li>
            <li style={{ marginBottom: '8px' }}>Don't create PRs with unrelated changes</li>
            <li style={{ marginBottom: '8px' }}>Don't merge your own PRs without review</li>
          </ul>
        </div>
      </Section>
    </Stack>
  );
};
