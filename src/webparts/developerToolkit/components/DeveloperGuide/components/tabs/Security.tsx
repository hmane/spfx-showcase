import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Security tab - Security best practices for SPFx development
 */
export const Security: React.FC<ITabComponentProps> = () => {
  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.warning}>
        Security is critical in enterprise applications. Follow these best practices to protect user
        data and prevent vulnerabilities.
      </MessageBar>

      {/* No Hardcoded Secrets */}
      <Section title="Never Hardcode Secrets" icon="Lock" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Never commit sensitive information to source control:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#d13438' }}>
            ❌ Bad - Hardcoded Secrets
          </h4>
          <CodeBlock
            code={`// ❌ NEVER DO THIS
const apiKey = 'abc123-secret-key';
const connectionString = 'Server=myserver;Database=mydb;User=admin;Password=pass123';
const clientSecret = 'super-secret-value';

// ❌ NEVER commit .env files with real secrets
AZURE_CLIENT_SECRET=real-secret-here
API_KEY=prod-api-key`}
            language="typescript"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#107c10' }}>
            ✅ Good - Use Azure Key Vault or Environment Variables
          </h4>
          <CodeBlock
            code={`// ✅ Use environment variables (populated by pipelines)
const apiEndpoint = process.env.API_ENDPOINT || '';

// ✅ Use Azure Key Vault for production secrets
import { SecretClient } from '@azure/keyvault-secrets';

export const getSecret = async (secretName: string): Promise<string> => {
  const vaultUrl = process.env.KEYVAULT_URL;
  const client = new SecretClient(vaultUrl, credential);
  const secret = await client.getSecret(secretName);
  return secret.value;
};

// ✅ .env.example template (no real values)
API_ENDPOINT=https://api.example.com
KEYVAULT_URL=https://your-vault.vault.azure.net/`}
            language="typescript"
            showLineNumbers={false}
          />

          <MessageBar messageBarType={MessageBarType.severeWarning} styles={{ root: { marginTop: '16px', marginBottom: '16px' } }}>
            <strong>Critical:</strong> Add .env, *.local, credentials.json, and .npmrc to .gitignore. Never
            commit actual secrets to Azure DevOps.
          </MessageBar>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#d13438' }}>
            ❌ Files That Must NEVER Be Committed
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>.npmrc</strong> - Contains Azure Artifacts authentication token
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>.env, .env.local, .env.*.local</strong> - Environment variables with secrets
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>credentials.json, *.key, *.pem</strong> - Certificates and private keys
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>config/*.local.json</strong> - Local configuration with sensitive data
            </li>
          </ul>
        </div>
      </Section>

      {/* Input Validation */}
      <Section title="Input Validation with Zod" icon="Shield" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Always validate user input to prevent injection attacks and data corruption:
          </p>

          <CodeBlock
            code={`import { z } from 'zod';

// Define strict validation schema
export const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  email: z.string().email('Invalid email format'),
  budget: z.number().positive('Budget must be positive').max(1000000),
  startDate: z.date(),
  category: z.enum(['IT', 'HR', 'Finance', 'Operations']),
  url: z.string().url('Invalid URL').optional(),
});

export type IProject = z.infer<typeof ProjectSchema>;

// Validate before processing
export const createProject = async (data: unknown): Promise<void> => {
  try {
    // Validate and sanitize input
    const validatedData = ProjectSchema.parse(data);

    // Safe to use validated data
    await SPContext.CreateItem({
      listTitle: 'Projects',
      data: validatedData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      console.error('Validation failed:', error.errors);
      throw new Error('Invalid project data');
    }
    throw error;
  }
};`}
            language="typescript"
            showLineNumbers={false}
          />

          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '16px' } }}>
            <strong>Tip:</strong> Use Zod schemas with react-hook-form for automatic client-side
            validation before data reaches the server.
          </MessageBar>
        </div>
      </Section>

      {/* XSS Prevention */}
      <Section title="Prevent Cross-Site Scripting (XSS)" icon="BlockContact" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Sanitize HTML to prevent malicious scripts from executing:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#d13438' }}>
            ❌ Dangerous - Unsanitized HTML
          </h4>
          <CodeBlock
            code={`// ❌ NEVER render user input as HTML directly
const Comments: React.FC = ({ comment }) => {
  return <div dangerouslySetInnerHTML={{ __html: comment }} />;
};

// ❌ User could inject: <img src=x onerror="alert('XSS')">`}
            language="typescript"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#107c10' }}>
            ✅ Safe - Sanitized HTML
          </h4>
          <CodeBlock
            code={`import DOMPurify from 'dompurify';

// ✅ Sanitize HTML before rendering
const Comments: React.FC = ({ comment }) => {
  const sanitizedComment = DOMPurify.sanitize(comment, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitizedComment }} />;
};

// ✅ Or better - use React's built-in escaping
const SafeComments: React.FC = ({ comment }) => {
  return <div>{comment}</div>; // React auto-escapes
};`}
            language="typescript"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            SharePoint Rich Text Fields
          </h4>
          <CodeBlock
            code={`// ✅ Sanitize SharePoint rich text content
import DOMPurify from 'dompurify';

const displayRichText = (htmlContent: string): string => {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
  });
};`}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      </Section>

      {/* SharePoint Permissions */}
      <Section title="Check SharePoint Permissions" icon="Permissions" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Always verify user permissions before allowing sensitive operations:
          </p>

          <CodeBlock
            code={`import { SPContext } from 'spfx-toolkit/utilities/context';

// Check if user has edit permissions
export const canUserEdit = async (listTitle: string): Promise<boolean> => {
  try {
    const permissions = await SPContext.GetCurrentUserPermissions(listTitle);
    return permissions.hasEditPermission;
  } catch (error) {
    console.error('Failed to check permissions:', error);
    return false;
  }
};

// Check before allowing delete
export const deleteItemSafely = async (listTitle: string, itemId: number): Promise<void> => {
  const canEdit = await canUserEdit(listTitle);

  if (!canEdit) {
    throw new Error('You do not have permission to delete items');
  }

  await SPContext.DeleteItem({
    listTitle,
    itemId,
  });
};

// Component example
const ProjectActions: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async (): Promise<void> => {
    const hasPermission = await canUserEdit('Projects');
    setCanEdit(hasPermission);
  };

  return (
    <Stack horizontal tokens={{ childrenGap: 8 }}>
      <PrimaryButton text="Edit" disabled={!canEdit} />
      <DefaultButton text="Delete" disabled={!canEdit} />
    </Stack>
  );
};`}
            language="typescript"
            showLineNumbers={false}
          />

          <MessageBar messageBarType={MessageBarType.warning} styles={{ root: { marginTop: '16px' } }}>
            <strong>Important:</strong> Always check permissions on the server side as well. Client-side
            checks are for UX only, not security enforcement.
          </MessageBar>
        </div>
      </Section>

      {/* Secure API Calls */}
      <Section title="Secure API Calls" icon="CloudAdd" defaultExpanded={true}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Use HTTPS Only
          </h4>
          <CodeBlock
            code={`// ✅ Always use HTTPS for external APIs
const API_ENDPOINT = 'https://api.example.com'; // Not http://

// ✅ Validate SSL certificates in production
const response = await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`,
  },
  body: JSON.stringify(data),
});`}
            language="typescript"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Implement Request Timeouts
          </h4>
          <CodeBlock
            code={`// ✅ Set timeouts to prevent hanging requests
const fetchWithTimeout = async (url: string, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};`}
            language="typescript"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Handle Errors Safely
          </h4>
          <CodeBlock
            code={`// ✅ Don't expose internal errors to users
try {
  const data = await fetchData();
  return data;
} catch (error) {
  // ❌ Don't do this - exposes internal details
  // setError(error.message);

  // ✅ Log internally, show generic message to user
  console.error('Failed to fetch data:', error);
  setError('Unable to load data. Please try again later.');
}`}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      </Section>

      {/* Security Checklist */}
      <Section title="Security Checklist" icon="CheckboxComposite" defaultExpanded={true}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Use this checklist before deploying to production:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Secrets & Credentials
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>No hardcoded API keys, passwords, or connection strings</li>
            <li style={{ marginBottom: '8px' }}>.env and credentials files are in .gitignore</li>
            <li style={{ marginBottom: '8px' }}>Secrets stored in Azure Key Vault</li>
            <li style={{ marginBottom: '8px' }}>No secrets in console.log statements</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Input Validation
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>All user input validated with Zod schemas</li>
            <li style={{ marginBottom: '8px' }}>Email, URL, and date formats validated</li>
            <li style={{ marginBottom: '8px' }}>String length limits enforced</li>
            <li style={{ marginBottom: '8px' }}>Number ranges validated</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ XSS Prevention
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>User-generated HTML sanitized with DOMPurify</li>
            <li style={{ marginBottom: '8px' }}>No dangerouslySetInnerHTML with unsanitized content</li>
            <li style={{ marginBottom: '8px' }}>Rich text fields sanitized before display</li>
            <li style={{ marginBottom: '8px' }}>URL parameters validated and escaped</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Permissions
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>SharePoint permissions checked before operations</li>
            <li style={{ marginBottom: '8px' }}>UI elements disabled based on permissions</li>
            <li style={{ marginBottom: '8px' }}>Server-side permission enforcement</li>
            <li style={{ marginBottom: '8px' }}>Sensitive operations require explicit permission checks</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ API Security
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>All external APIs use HTTPS</li>
            <li style={{ marginBottom: '8px' }}>Request timeouts implemented</li>
            <li style={{ marginBottom: '8px' }}>Error messages don't expose internal details</li>
            <li style={{ marginBottom: '8px' }}>Authentication tokens handled securely</li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ Dependencies
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>npm audit shows no high or critical vulnerabilities</li>
            <li style={{ marginBottom: '8px' }}>Dependencies updated to latest stable versions</li>
            <li style={{ marginBottom: '8px' }}>No deprecated packages in use</li>
            <li style={{ marginBottom: '8px' }}>Third-party libraries from trusted sources only</li>
          </ul>
        </div>
      </Section>

      {/* Common Vulnerabilities */}
      <Section title="OWASP Top 10 for SPFx" icon="Warning" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Common security vulnerabilities to avoid in SharePoint Framework applications:
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
                    Vulnerability
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Example
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Prevention
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    vuln: 'XSS (Cross-Site Scripting)',
                    example: 'Rendering user HTML without sanitization',
                    prevention: 'Use DOMPurify, avoid dangerouslySetInnerHTML',
                  },
                  {
                    vuln: 'Broken Authentication',
                    example: 'Not checking SharePoint permissions',
                    prevention: 'Always verify user permissions before operations',
                  },
                  {
                    vuln: 'Sensitive Data Exposure',
                    example: 'Hardcoded API keys in code',
                    prevention: 'Use Azure Key Vault, environment variables',
                  },
                  {
                    vuln: 'Broken Access Control',
                    example: 'Allowing operations without permission checks',
                    prevention: 'Check permissions on client and server',
                  },
                  {
                    vuln: 'Security Misconfiguration',
                    example: 'Using HTTP instead of HTTPS',
                    prevention: 'Enforce HTTPS, secure headers',
                  },
                  {
                    vuln: 'Insufficient Logging',
                    example: 'Not logging security events',
                    prevention: 'Log authentication, authorization failures',
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
                        color: '#d13438',
                      }}
                    >
                      {row.vuln}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        color: '#323130',
                      }}
                    >
                      {row.example}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        color: '#107c10',
                      }}
                    >
                      {row.prevention}
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
