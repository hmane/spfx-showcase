import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Toolkit Integration tab - spfx-toolkit usage guide
 */
export const ToolkitIntegration: React.FC<ITabComponentProps> = () => {
  const pnpImportsGuide = `// src/webparts/pnpImports.ts
// Imported once per web part entry point (e.g., ShowcaseWebPart.ts)
import 'spfx-toolkit/utilities/context/pnpImports/core';
import 'spfx-toolkit/utilities/context/pnpImports/lists';
import 'spfx-toolkit/utilities/context/pnpImports/content';

// Optional bundles – add only what you need
// import 'spfx-toolkit/utilities/context/pnpImports/files';
// import 'spfx-toolkit/utilities/context/pnpImports/search';
// import 'spfx-toolkit/utilities/context/pnpImports/taxonomy';
// import 'spfx-toolkit/utilities/context/pnpImports/security';
`;

  const pnpAugmentationsGuide = `/**
 * src/types/pnp-augmentations.d.ts
 * TypeScript-only imports that teach SPFI about .web, .lists, etc.
 * This file is bundled via tsconfig include and has zero runtime cost.
 */
import '@pnp/sp/webs';
import '@pnp/sp/site-users';
import '@pnp/sp/profiles';
import '@pnp/sp/site-groups/web';

import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
import '@pnp/sp/views';

import '@pnp/sp/fields';
import '@pnp/sp/fields/list';
import '@pnp/sp/column-defaults';
import '@pnp/sp/content-types';

import '@pnp/sp/files';
import '@pnp/sp/folders';
import '@pnp/sp/attachments';

import '@pnp/sp/appcatalog';
import '@pnp/sp/features';
import '@pnp/sp/navigation';
import '@pnp/sp/regional-settings';
import '@pnp/sp/user-custom-actions';

import '@pnp/sp/clientside-pages';
import '@pnp/sp/comments';
import '@pnp/sp/publishing-sitepageservice';

import '@pnp/sp/search';
import '@pnp/sp/favorites';
import '@pnp/sp/subscriptions';

import '@pnp/sp/taxonomy';
import '@pnp/sp/hubsites';

import '@pnp/sp/security';
import '@pnp/sp/sharing';
`;

  const spContextInitDev = `import { SPContext } from 'spfx-toolkit/utilities/context';

// In your web part class (MyWebPart.ts)
protected async onInit(): Promise<void> {
  await super.onInit();

  // Development preset - verbose logging, friendly for workbench
  await SPContext.development(this.context, 'MyWebPart');
}`;

  const spContextInitProd = `import { SPContext } from 'spfx-toolkit/utilities/context';

// In your web part class (MyWebPart.ts)
protected async onInit(): Promise<void> {
  await super.onInit();

  // Production preset - optimized logging and caching behavior
  await SPContext.production(this.context, 'MyWebPart');
}`;

  const spContextInitSmart = `import { SPContext } from 'spfx-toolkit/utilities/context';

// In your web part class (MyWebPart.ts)
protected async onInit(): Promise<void> {
  await super.onInit();

  // Smart preset - recommended default
  await SPContext.smart(this.context, 'MyWebPart');
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
} from 'spfx-toolkit/components/spForm';
import {
  SPTextField,
  SPUserField,
  SPDateField,
  SPNumberField,
  SPChoiceField
} from 'spfx-toolkit/components/spFields';

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

  const cardExample = `import { Card, Header, Content, Footer } from 'spfx-toolkit/components/Card';
import { PrimaryButton, DefaultButton } from '@fluentui/react';

export const MyCard: React.FC = () => {
  return (
    <Card title="Project Status" allowExpand>
      <Header>Project Status</Header>
      <Content>
        <div>
          <p>Project is on track and progressing well.</p>
          <ul>
            <li>Tasks completed: 15/20</li>
            <li>Next milestone: End of month</li>
          </ul>
        </div>
      </Content>
      <Footer>
        <PrimaryButton text="View Details" />
        <DefaultButton text="Edit" />
      </Footer>
    </Card>
  );
};`;

  const crudExample = `import { SPContext } from 'spfx-toolkit/utilities/context';
import { createSPExtractor, createSPUpdater } from 'spfx-toolkit/utilities/listItemHelper';

interface IProject {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: Date;
  owner: { id: string; title: string };
}

export const getProjects = async (): Promise<IProject[]> => {
  const items = await SPContext.sp.web.lists
    .getByTitle('Projects')
    .items.select('Id', 'Title', 'Description', 'Status', 'StartDate', 'Owner/Id', 'Owner/Title')
    .expand('Owner')();

  return items.map(item => {
    const extractor = createSPExtractor(item);

    return {
      id: extractor.number('Id'),
      title: extractor.text('Title'),
      description: extractor.text('Description'),
      status: extractor.text('Status', 'Active') as IProject['status'],
      startDate: extractor.date('StartDate'),
      owner: extractor.user('Owner'),
    };
  });
};

// Create item
export const createProject = async (project: Omit<IProject, 'id'>): Promise<number> => {
  const updater = createSPUpdater();
  updater.set('Title', project.title);
  updater.set('Description', project.description);
  updater.set('Status', project.status);
  updater.set('StartDate', project.startDate);
  updater.set('OwnerId', project.owner?.id);

  const result = await SPContext.sp.web.lists
    .getByTitle('Projects')
    .items.add(updater.getUpdates());

  return result.data.Id;
};

// Update item
export const updateProjectItem = async (
  id: number,
  updates: Partial<IProject>,
  original?: IProject
): Promise<void> => {
  const updater = createSPUpdater();
  updater.set('Title', updates.title, original?.title);
  updater.set('Description', updates.description, original?.description);
  updater.set('Status', updates.status, original?.status);
  updater.set('StartDate', updates.startDate, original?.startDate);
  updater.set('OwnerId', updates.owner?.id, original?.owner?.id);

  if (!updater.hasChanges()) {
    return;
  }

  await SPContext.sp.web.lists
    .getByTitle('Projects')
    .items.getById(id)
    .update(updater.getUpdates());
};

// Delete item
export const deleteProject = async (id: number): Promise<void> => {
  await SPContext.sp.web.lists.getByTitle('Projects').items.getById(id).delete();
};`;

  const batchExample = `import { SPContext } from 'spfx-toolkit/utilities/context';
import { createBatchBuilder } from 'spfx-toolkit/utilities/batchBuilder';

// Batch update multiple items efficiently
export const batchUpdateProjects = async (updates: Array<{ id: number; status: string }>): Promise<void> => {
  const batch = createBatchBuilder(SPContext.sp).list('Projects');

  updates.forEach(update => {
    batch.update(update.id, { Status: update.status });
  });

  await batch.execute();
};`;

  const userPersonaExample = `import { UserPersona } from 'spfx-toolkit/components/UserPersona';

export const MyComponent: React.FC = () => {
  return (
    <div>
      <UserPersona
        userIdentifier="john.doe@contoso.com"
        size={32}
        displayMode="avatarAndName"
        showSecondaryText
      />

      <UserPersona
        userIdentifier="jane.smith@contoso.com"
        size={48}
        displayMode="avatarAndName"
        showSecondaryText
      />
    </div>
  );
};`;

  const importPatterns = [
    {
      category: 'Forms',
      import: "import { FormProvider, FormContainer, FormItem } from 'spfx-toolkit/components/spForm';",
      description: 'Form layout and structure components',
    },
    {
      category: 'Fields',
      import: "import { SPTextField, SPUserField, SPDateField } from 'spfx-toolkit/components/spFields';",
      description: 'SharePoint field input components',
    },
    {
      category: 'Cards',
      import: "import { Card, Header, Content, Footer } from 'spfx-toolkit/components/Card';",
      description: 'Card layout components',
    },
    {
      category: 'Services',
      import: "import { SPContext } from 'spfx-toolkit/utilities/context';",
      description: 'SharePoint context and API service',
    },
    {
      category: 'Utilities',
      import: "import { createSPExtractor, createSPUpdater } from 'spfx-toolkit/utilities/listItemHelper';",
      description: 'Data transformation utilities',
    },
    {
      category: 'Components',
      import: "import { UserPersona } from 'spfx-toolkit/components/UserPersona';",
      description: 'Reusable UI components',
    },
    {
      category: 'Batching',
      import: "import { createBatchBuilder } from 'spfx-toolkit/utilities/batchBuilder';",
      description: 'Fluent batch operations over SPContext.sp',
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

      {/* Centralized PnP imports */}
      <Section
        title="Centralized PnP Imports"
        icon="CubeShape"
        description="Runtime side effects and TypeScript augmentations live in shared files."
        defaultExpanded={true}
      >
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#605e5c' }}>
          Keep all PnPjs imports in two shared locations so bundlers, TypeScript, and runtime stay in sync.
          Web parts simply import <code>../pnpImports</code>; components and services never import <code>@pnp/sp</code> directly.
        </p>

        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          1. Runtime loader (<code>src/webparts/pnpImports.ts</code>)
        </h4>
        <CodeBlock
          code={pnpImportsGuide}
          language="typescript"
          filename="pnpImports.ts"
          showLineNumbers={true}
        />

        <h4 style={{ margin: '24px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          2. Type augmentation shim (<code>src/types/pnp-augmentations.d.ts</code>)
        </h4>
        <CodeBlock
          code={pnpAugmentationsGuide}
          language="typescript"
          filename="pnp-augmentations.d.ts"
          showLineNumbers={true}
        />

        <MessageBar
          messageBarType={MessageBarType.severeWarning}
          styles={{ root: { marginTop: '16px' } }}
        >
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Import <code>../pnpImports</code> once per web part entry (e.g., <code>ShowcaseWebPart.ts</code>).</li>
            <li><code>src/types/pnp-augmentations.d.ts</code> is compile-time only—no bundle size impact.</li>
            <li>When you need new PnP features, update both this shim and <code>spfx-toolkit</code>&rsquo;s augmentation file, then rebuild the toolkit.</li>
          </ul>
        </MessageBar>
      </Section>

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
            Best for local workbench and verbose diagnostics.
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
            Uses the production preset for cleaner logging and production-oriented defaults.
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
            Recommended default. Lets the toolkit choose the best preset for the current environment.
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
            Create consistent card layouts with the public Card subpath:
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
            Use <code>createSPExtractor</code> and <code>createSPUpdater</code> from{' '}
            <code>spfx-toolkit/utilities/listItemHelper</code> for cleaner SharePoint item mapping:
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
              Always await <code>SPContext.smart()</code>, <code>development()</code>, or <code>production()</code> in onInit() before using SP APIs
            </li>
            <li style={{ marginBottom: '8px' }}>
              Prefer public toolkit subpaths over legacy <code>lib</code> imports
            </li>
            <li style={{ marginBottom: '8px' }}>
              Use createSPExtractor/createSPUpdater for safer list item mapping
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
              Don&apos;t use SPContext without initialization
            </li>
            <li style={{ marginBottom: '8px' }}>
              Don&apos;t keep stale <code>spfx-toolkit/lib/...</code> examples when a public subpath exists
            </li>
            <li style={{ marginBottom: '8px' }}>
              Don&apos;t make individual API calls when batch operations are possible
            </li>
            <li style={{ marginBottom: '8px' }}>
              Don&apos;t bypass form validation - always use Zod schemas
            </li>
            <li style={{ marginBottom: '8px' }}>
              Don&apos;t hardcode field internal names - use constants
            </li>
          </ul>
        </div>
      </Section>
    </Stack>
  );
};
