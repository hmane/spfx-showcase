import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Toolkit Integration tab - spfx-toolkit usage guide
 */
export const ToolkitIntegration: React.FC<ITabComponentProps> = () => {
  const spContextInitDev = `import { SPContext } from 'spfx-toolkit';

// In your web part class (MyWebPart.ts)
protected async onInit(): Promise<void> {
  await super.onInit();

  // Development mode - Initialize with web part context
  SPContext.Init(this.context);
}`;

  const spContextInitProd = `import { SPContext } from 'spfx-toolkit';

// In your web part class (MyWebPart.ts)
protected async onInit(): Promise<void> {
  await super.onInit();

  // Production mode - Initialize with context and site URL
  SPContext.Init(this.context, this.context.pageContext.web.absoluteUrl);
}`;

  const spContextInitSmart = `import { SPContext } from 'spfx-toolkit';

// In your web part class (MyWebPart.ts)
protected async onInit(): Promise<void> {
  await super.onInit();

  // Smart mode - Auto-detect environment
  const siteUrl = this.context.pageContext.web.absoluteUrl;
  const isDevelopment = siteUrl.includes('localhost') || siteUrl.includes('workbench');

  if (isDevelopment) {
    // Development: Use context only
    SPContext.Init(this.context);
  } else {
    // Production: Use context + site URL for better performance
    SPContext.Init(this.context, siteUrl);
  }
}`;

  const formExample = `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormProvider,
  FormContainer,
  FormItem,
  FormLabel,
  FormValue,
  FormError,
  FormErrorSummary
} from 'spfx-toolkit/lib/components/spForm';
import {
  SPTextField,
  SPUserField,
  SPDateField,
  SPNumberField,
  SPChoiceField
} from 'spfx-toolkit/lib/components/spFields';

// Define validation schema
const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  assignedTo: z.object({
    id: z.string(),
    title: z.string().optional()
  }).nullable().refine(val => val !== null, 'Assigned To is required'),
  dueDate: z.date().nullable(),
  priority: z.enum(['Low', 'Medium', 'High']),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const MyForm: React.FC = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      assignedTo: null,
      dueDate: null,
      priority: 'Medium',
      description: '',
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    console.log('Form data:', data);
    // Submit to SharePoint here
  };

  return (
    <FormProvider control={form.control}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormContainer labelWidth="150px">
          <FormItem fieldName="title">
            <FormLabel isRequired>Title</FormLabel>
            <FormValue>
              <SPTextField
                name="title"
                placeholder="Enter title"
                maxLength={255}
                showCharacterCount
              />
              <FormError />
            </FormValue>
          </FormItem>

          <FormItem fieldName="assignedTo">
            <FormLabel isRequired>Assigned To</FormLabel>
            <FormValue>
              <SPUserField
                name="assignedTo"
                allowMultiple={false}
              />
              <FormError />
            </FormValue>
          </FormItem>

          <FormItem fieldName="dueDate">
            <FormLabel>Due Date</FormLabel>
            <FormValue>
              <SPDateField
                name="dueDate"
                placeholder="Select due date"
              />
              <FormError />
            </FormValue>
          </FormItem>

          <FormItem fieldName="priority">
            <FormLabel>Priority</FormLabel>
            <FormValue>
              <SPChoiceField
                name="priority"
                dataSource={{
                  type: 'static',
                  choices: ['Low', 'Medium', 'High']
                }}
                displayType="dropdown"
              />
              <FormError />
            </FormValue>
          </FormItem>
        </FormContainer>

        <FormErrorSummary position="top" showFieldLabels />

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};`;

  const cardExample = `import { Card, CardHeader, CardContent, CardFooter } from 'spfx-toolkit/lib/components';
import { PrimaryButton, DefaultButton } from '@fluentui/react';

export const MyCard: React.FC = () => {
  return (
    <Card elevated>
      <CardHeader
        title="Project Status"
        subtitle="Last updated: Today"
        iconName="ProjectCollection"
      />
      <CardContent>
        <div>
          <p>Project is on track and progressing well.</p>
          <ul>
            <li>Tasks completed: 15/20</li>
            <li>Next milestone: End of month</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <PrimaryButton text="View Details" />
        <DefaultButton text="Edit" />
      </CardFooter>
    </Card>
  );
};`;

  const crudExample = `import { createSPExtractor, createSPUpdater } from 'spfx-toolkit';
import { SPContext } from 'spfx-toolkit';

interface IProject {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: Date;
  owner: { id: string; title: string };
}

// Create extractor for reading data
const extractProject = createSPExtractor<IProject>({
  id: 'number',
  title: 'string',
  description: 'string',
  status: 'string',
  startDate: 'date',
  owner: 'user',
});

// Create updater for writing data
const updateProject = createSPUpdater<IProject>({
  title: 'string',
  description: 'string',
  status: 'string',
  startDate: 'date',
  owner: 'user',
});

// Get items
export const getProjects = async (): Promise<IProject[]> => {
  const items = await SPContext.GetItems({
    listTitle: 'Projects',
    fields: ['Id', 'Title', 'Description', 'Status', 'StartDate', 'Owner'],
    filter: "Status eq 'Active'",
    orderBy: 'StartDate desc',
    top: 50,
  });

  return items.map(item => extractProject(item));
};

// Create item
export const createProject = async (project: Omit<IProject, 'id'>): Promise<number> => {
  const payload = updateProject(project);

  const result = await SPContext.CreateItem({
    listTitle: 'Projects',
    data: payload,
  });

  return result.Id;
};

// Update item
export const updateProjectItem = async (id: number, updates: Partial<IProject>): Promise<void> => {
  const payload = updateProject(updates);

  await SPContext.UpdateItem({
    listTitle: 'Projects',
    itemId: id,
    data: payload,
  });
};

// Delete item
export const deleteProject = async (id: number): Promise<void> => {
  await SPContext.DeleteItem({
    listTitle: 'Projects',
    itemId: id,
  });
};`;

  const batchExample = `import { createBatchBuilder, SPContext } from 'spfx-toolkit';

// Batch update multiple items efficiently
export const batchUpdateProjects = async (updates: Array<{ id: number; status: string }>): Promise<void> => {
  const batch = createBatchBuilder();

  updates.forEach(update => {
    batch.addUpdate({
      listTitle: 'Projects',
      itemId: update.id,
      data: { Status: update.status },
    });
  });

  await SPContext.ExecuteBatch(batch);
};`;

  const userPersonaExample = `import { UserPersona } from 'spfx-toolkit/lib/components';

export const MyComponent: React.FC = () => {
  return (
    <div>
      <UserPersona
        userId="john.doe@contoso.com"
        size="small"
        showSecondaryText
        presence="online"
      />

      <UserPersona
        userId="jane.smith@contoso.com"
        size="large"
        showSecondaryText
        hidePersonaDetails={false}
      />
    </div>
  );
};`;

  const importPatterns = [
    {
      category: 'Forms',
      import: "import { FormProvider, FormContainer, FormItem } from 'spfx-toolkit/lib/components/spForm';",
      description: 'Form layout and structure components',
    },
    {
      category: 'Fields',
      import: "import { SPTextField, SPUserField, SPDateField } from 'spfx-toolkit/lib/components/spFields';",
      description: 'SharePoint field input components',
    },
    {
      category: 'Cards',
      import: "import { Card, CardHeader, CardContent } from 'spfx-toolkit/lib/components';",
      description: 'Card layout components',
    },
    {
      category: 'Services',
      import: "import { SPContext } from 'spfx-toolkit';",
      description: 'SharePoint context and API service',
    },
    {
      category: 'Utilities',
      import: "import { createSPExtractor, createSPUpdater, createBatchBuilder } from 'spfx-toolkit';",
      description: 'Data transformation utilities',
    },
    {
      category: 'Components',
      import: "import { UserPersona } from 'spfx-toolkit/lib/components';",
      description: 'Reusable UI components',
    },
  ];

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.info}>
        <strong>spfx-toolkit</strong> is our internal library providing reusable components, form
        controls, and SharePoint utilities. It simplifies common tasks and ensures consistency
        across projects.
      </MessageBar>

      {/* SPContext Initialization */}
      <Section title="SPContext Initialization" icon="Plug" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Initialize SPContext in your web part's <code>onInit()</code> method. Choose the
            appropriate mode based on your needs:
          </p>

          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            Development Mode (Recommended for local development)
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#605e5c' }}>
            Uses only the context. Best for workbench testing.
          </p>
          <CodeBlock
            code={spContextInitDev}
            language="typescript"
            filename="Development Mode"
            showLineNumbers={true}
          />

          <h4 style={{ margin: '24px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            Production Mode (Recommended for production)
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#605e5c' }}>
            Includes site URL for better performance and reliability in production.
          </p>
          <CodeBlock
            code={spContextInitProd}
            language="typescript"
            filename="Production Mode"
            showLineNumbers={true}
          />

          <h4 style={{ margin: '24px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            Smart Mode (Best practice - Auto-detect)
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#605e5c' }}>
            Automatically chooses the right mode based on environment.
          </p>
          <CodeBlock
            code={spContextInitSmart}
            language="typescript"
            filename="Smart Mode (Recommended)"
            showLineNumbers={true}
            highlightLines={[7, 8, 9, 10, 11, 12, 13]}
          />

          <MessageBar
            messageBarType={MessageBarType.success}
            styles={{ root: { marginTop: '16px' } }}
          >
            <strong>Best Practice:</strong> Use Smart Mode for flexibility across environments.
          </MessageBar>
        </div>
      </Section>

      {/* Import Patterns */}
      <Section title="Import Patterns" icon="OpenSource" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Common import patterns for spfx-toolkit:
          </p>

          <Stack tokens={{ childrenGap: 12 }}>
            {importPatterns.map((pattern, index) => (
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
                    marginBottom: '8px',
                  }}
                >
                  {pattern.category}
                </div>
                <code
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    backgroundColor: '#f3f2f1',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#0078d4',
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                    marginBottom: '8px',
                    wordBreak: 'break-all',
                  }}
                >
                  {pattern.import}
                </code>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>{pattern.description}</div>
              </div>
            ))}
          </Stack>
        </div>
      </Section>

      {/* Form Components */}
      <Section title="Form Components" icon="Edit" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Build SharePoint-aware forms with validation using spfx-toolkit form components:
          </p>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>FormProvider</strong> - Wraps form with react-hook-form context
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>FormContainer</strong> - Layout container with consistent spacing
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>FormItem</strong> - Wrapper for each form field
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>FormLabel</strong> - Label with required indicator
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>FormValue</strong> - Container for input and description
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>FormError</strong> - Displays field-level validation errors
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>FormErrorSummary</strong> - Shows all form errors at top
            </li>
          </ul>

          <CodeBlock
            code={formExample}
            language="typescript"
            filename="Complete Form Example"
            showLineNumbers={true}
            maxHeight={600}
          />
        </div>
      </Section>

      {/* Card Components */}
      <Section title="Card Components" icon="CreditCardPerson" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Create consistent card layouts with Card, CardHeader, CardContent, and CardFooter:
          </p>
          <CodeBlock
            code={cardExample}
            language="typescript"
            filename="Card Example"
            showLineNumbers={true}
          />
        </div>
      </Section>

      {/* CRUD Operations */}
      <Section title="CRUD Operations" icon="Database" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Use <code>createSPExtractor</code> and <code>createSPUpdater</code> for type-safe
            SharePoint operations:
          </p>
          <CodeBlock
            code={crudExample}
            language="typescript"
            filename="CRUD Service Example"
            showLineNumbers={true}
            maxHeight={600}
          />
        </div>
      </Section>

      {/* Batch Operations */}
      <Section title="Batch Operations" icon="BulkUpload" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Batch multiple operations for better performance:
          </p>
          <CodeBlock
            code={batchExample}
            language="typescript"
            filename="Batch Update Example"
            showLineNumbers={true}
          />
          <MessageBar
            messageBarType={MessageBarType.success}
            styles={{ root: { marginTop: '16px' } }}
          >
            <strong>Performance Tip:</strong> Use batch operations when updating 5+ items. Reduces
            API calls from N to 1.
          </MessageBar>
        </div>
      </Section>

      {/* UserPersona Component */}
      <Section title="UserPersona Component" icon="Contact" defaultExpanded={false}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Display user information with photos and presence:
          </p>
          <CodeBlock
            code={userPersonaExample}
            language="typescript"
            filename="UserPersona Example"
            showLineNumbers={true}
          />
        </div>
      </Section>

      {/* Available Fields */}
      <Section title="Available SP Field Components" icon="TextField" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            spfx-toolkit provides field components for all SharePoint column types:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { name: 'SPTextField', description: 'Single line or multi-line text' },
              { name: 'SPNumberField', description: 'Numeric input with formatting' },
              { name: 'SPBooleanField', description: 'Checkbox or toggle' },
              { name: 'SPDateField', description: 'Date picker with time support' },
              { name: 'SPUserField', description: 'People picker (single/multi)' },
              { name: 'SPChoiceField', description: 'Dropdown, radio, or checkboxes' },
              { name: 'SPUrlField', description: 'URL with description' },
              { name: 'SPLookupField', description: 'Lookup to another list' },
              { name: 'SPTaxonomyField', description: 'Managed metadata picker' },
            ].map((field, index) => (
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
                    color: '#0078d4',
                    marginBottom: '4px',
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  }}
                >
                  {field.name}
                </div>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>{field.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Best Practices */}
      <Section title="Best Practices" icon="Lightbulb" defaultExpanded={false}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ✅ DO
          </h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Always initialize SPContext in onInit() before using any SP operations
            </li>
            <li style={{ marginBottom: '8px' }}>
              Use createSPExtractor/createSPUpdater for type safety
            </li>
            <li style={{ marginBottom: '8px' }}>
              Leverage batch operations for multiple updates
            </li>
            <li style={{ marginBottom: '8px' }}>
              Use FormErrorSummary to show all validation errors at once
            </li>
            <li style={{ marginBottom: '8px' }}>
              Implement proper error handling around SP operations
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            ❌ DON'T
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Don't use SPContext without initialization
            </li>
            <li style={{ marginBottom: '8px' }}>
              Don't make individual API calls when batch operations are possible
            </li>
            <li style={{ marginBottom: '8px' }}>
              Don't bypass form validation - always use Zod schemas
            </li>
            <li style={{ marginBottom: '8px' }}>
              Don't hardcode field internal names - use constants
            </li>
          </ul>
        </div>
      </Section>
    </Stack>
  );
};
