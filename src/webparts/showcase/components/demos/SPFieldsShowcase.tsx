import {
  DefaultButton,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Toggle,
} from '@fluentui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldUserSelectionMode } from '@pnp/sp/fields';
import * as React from 'react';
import { CSSProperties, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { create } from 'zustand';
import {
  SPBooleanField,
  SPChoiceField,
  SPDateField,
  SPLookupField,
  SPNumberField,
  SPTaxonomyField,
  SPTextField,
  SPUrlField,
  SPUserField,
} from 'spfx-toolkit/lib/components/spFields';
import { SPBooleanDisplayType } from 'spfx-toolkit/lib/components/spFields/SPBooleanField';
import { SPLookupDisplayMode } from 'spfx-toolkit/lib/components/spFields/SPLookupField';
import { SPTextFieldMode } from 'spfx-toolkit/lib/components/spFields/SPTextField';
import {
  FormContainer,
  FormDescription,
  FormError,
  FormErrorSummary,
  FormItem,
  FormLabel,
  FormProvider,
  FormValue,
  useScrollToError,
  useZustandFormSync,
} from 'spfx-toolkit/lib/components/spForm';
import SPContext from 'spfx-toolkit/lib/utilities/context';
import { z } from 'zod';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import type { ShowcaseFeature } from '../shared/ShowcaseKeyFeatures';
import { ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';

// Zod schemas for form validation
const urlSchema = z.object({
  Url: z.string().url('Invalid URL'),
  Description: z.string().optional(),
});

const userSchema = z
  .object({
    Id: z.number(),
    Title: z.string().optional(),
    EMail: z.string().optional(),
  })
  .passthrough();

const lookupSchema = z.object({
  Id: z.number(),
  Title: z.string().optional(),
});

const taxonomySchema = z.object({
  TermGuid: z.string(),
  Label: z.string(),
  WssId: z.number().optional(),
});

const formSchema = z.object({
  // Text fields
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  richNotes: z.string().optional(),
  multiLineNotes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),

  // Choice fields
  status: z
    .union([z.object({ value: z.string() }), z.object({ values: z.array(z.string()) })])
    .refine(data => {
      if ('value' in data) return data.value !== '';
      if ('values' in data) return data.values.length > 0;
      return false;
    }, 'Status is required'),

  priority: z
    .union([z.object({ value: z.string() }), z.object({ values: z.array(z.string()) })])
    .optional(),

  // User field
  assignedTo: z.array(userSchema).min(1, 'Assign at least one user'),

  // Date fields
  dueDate: z
    .date()
    .nullable()
    .refine(val => val !== null, 'Due date is required'),

  startDate: z.date().nullable().optional(),

  // Number fields
  estimatedHours: z
    .number()
    .min(0, 'Hours must be positive')
    .max(1000, 'Hours must be less than 1000')
    .nullish(),

  budget: z
    .number()
    .min(0, 'Budget must be positive')
    .max(10000000, 'Budget must be less than 10 million')
    .nullish(),

  // Boolean field
  isActive: z.boolean(),
  isHighPriority: z.boolean().optional(),

  // URL field
  referenceLink: urlSchema.optional(),

  // Lookup fields
  category: z.union([lookupSchema, z.array(lookupSchema)]).optional(),
  relatedProject: lookupSchema.optional(),

  // Taxonomy field
  tags: z.union([taxonomySchema, z.array(taxonomySchema)]).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Zustand store for form draft auto-save
interface SPFieldsDraftStore {
  draft: Partial<FormData>;
  saveDraft: (data: Partial<FormData>) => void;
  clearDraft: () => void;
  lastSaved: Date | null;
}

const useSPFieldsDraftStore = create<SPFieldsDraftStore>(set => ({
  draft: {},
  lastSaved: null,
  saveDraft: data => set({ draft: data, lastSaved: new Date() }),
  clearDraft: () => set({ draft: {}, lastSaved: null }),
}));

// Key features of spFields
const features: ShowcaseFeature[] = [
  {
    icon: '📝',
    title: '10 Field Components',
    description:
      'Complete suite: Text (Single/Multi-line/Rich), Choice, User, Date, Number, Boolean, URL, Lookup, Taxonomy, and universal SPField',
  },
  {
    icon: '🔌',
    title: 'Smart SharePoint Integration',
    description:
      'Auto-load field configurations from lists and site columns. Supports dependent lookups, cascading filters, and real-time data fetching',
  },
  {
    icon: '✅',
    title: 'React Hook Form + Zod',
    description:
      'Full integration with React Hook Form for validation, error handling, auto-scroll to errors, and Zod schema validation',
  },
  {
    icon: '📜',
    title: 'Append-Only with History',
    description:
      'SPTextField supports append-only mode with full version history, copy previous entries, customizable rendering, and load-more functionality',
  },
  {
    icon: '🎨',
    title: 'Rich Text & Formatting',
    description:
      'Built-in rich text editor with HTML formatting, character counters, and configurable text modes (single/multi-line/rich)',
  },
  {
    icon: '🔍',
    title: 'Advanced Lookup & Search',
    description:
      'Auto-switching between dropdown and searchable modes based on item count. Supports filtering, custom display templates, and dependent lookups',
  },
  {
    icon: '🏷️',
    title: 'Taxonomy & Metadata',
    description:
      'Full term store integration with SPTaxonomyField. Supports term path display, single/multiple selection, and custom term set filtering',
  },
  {
    icon: '💾',
    title: 'Auto-Save & Form Sync',
    description:
      'Built-in Zustand integration for draft auto-save with debouncing, form state persistence, and seamless restore',
  },
  {
    icon: '🎯',
    title: 'Error Summary & Scroll',
    description:
      'FormErrorSummary component with sticky positioning, click-to-scroll, field label display, and configurable error limits',
  },
  {
    icon: '💻',
    title: 'TypeScript & Performance',
    description:
      'Full TypeScript support with discriminated unions, lazy loading, caching strategies, and optimized re-renders',
  },
];

// Code samples
const BASIC_USAGE = `import { SPTextField, SPChoiceField, SPUserField } from 'spfx-toolkit/lib/components/spFields';
import { FormProvider, useForm } from 'react-hook-form';

export const MyForm: React.FC = () => {
  const form = useForm();

  return (
    <FormProvider {...form}>
      <SPTextField
        name="title"
        label="Title"
        required
      />

      <SPChoiceField
        name="status"
        label="Status"
        dataSource={{
          type: 'list',
          listNameOrId: 'Tasks',
          fieldInternalName: 'Status'
        }}
      />

      <SPUserField
        name="assignedTo"
        label="Assigned To"
        allowMultiple={true}
      />
    </FormProvider>
  );
};`;

const TEXT_FIELD_SAMPLE = `import { SPTextField, SPTextFieldMode } from 'spfx-toolkit/lib/components/spFields';

// Single-line text field
<SPTextField
  name="title"
  label="Title"
  required
  placeholder="Enter task title"
  mode={SPTextFieldMode.SingleLine}
  maxLength={100}
/>

// Multi-line text field with character count
<SPTextField
  name="description"
  label="Description"
  mode={SPTextFieldMode.MultiLine}
  rows={4}
  maxLength={500}
  showCharacterCount
/>

// Rich text editor with HTML formatting
<SPTextField
  name="richNotes"
  label="Rich Text Notes"
  mode={SPTextFieldMode.RichText}
  placeholder="Enter formatted notes"
/>`;

const CHOICE_FIELD_SAMPLE = `// Load from SharePoint list
<SPChoiceField
  name="status"
  label="Status"
  dataSource={{
    type: 'list',
    listNameOrId: 'Tasks',
    fieldInternalName: 'Status'
  }}
/>

// Static choices
<SPChoiceField
  name="priority"
  label="Priority"
  dataSource={{
    type: 'static',
    choices: ['High', 'Medium', 'Low']
  }}
/>`;

const USER_FIELD_SAMPLE = `<SPUserField
  name="assignedTo"
  label="Assigned To"
  allowMultiple={true}
  placeholder="Select users"
  required
/>`;

const DATE_FIELD_SAMPLE = `<SPDateField
  name="dueDate"
  label="Due Date"
  showTimePicker={true}
  required
  placeholder="Select due date and time"
/>

// Date only (no time)
<SPDateField
  name="startDate"
  label="Start Date"
  showTimePicker={false}
  placeholder="Select date"
/>`;

const NUMBER_FIELD_SAMPLE = `<SPNumberField
  name="estimatedHours"
  label="Estimated Hours"
  min={0}
  max={1000}
  format={{ decimals: 2 }}
  placeholder="Enter hours"
/>

<SPNumberField
  name="budget"
  label="Budget"
  format={{
    decimals: 2,
    currencyLocale: 'en-US',
    currencyCode: 'USD'
  }}
/>`;

const BOOLEAN_FIELD_SAMPLE = `import { SPBooleanDisplayType } from 'spfx-toolkit/lib/components/spFields';

<SPBooleanField
  name="isActive"
  label="Is Active"
  displayType={SPBooleanDisplayType.Toggle}
  checkedText="Active"
  uncheckedText="Inactive"
/>`;

const URL_FIELD_SAMPLE = `<SPUrlField
  name="referenceLink"
  label="Reference Link"
  placeholder="https://example.com"
/>`;

const LOOKUP_FIELD_SAMPLE = `import { SPLookupField, SPLookupDisplayMode } from 'spfx-toolkit/lib/components/spFields';

// Auto-switching lookup (dropdown/searchable based on item count)
<SPLookupField
  name="category"
  label="Category"
  dataSource={{
    listNameOrId: 'Categories',
    displayField: 'Title',
    orderBy: 'Title',
    filter: "IsActive eq true"
  }}
  displayMode={SPLookupDisplayMode.Auto}
  searchableThreshold={10}
  placeholder="Select category"
/>

// Searchable lookup with custom search fields
<SPLookupField
  name="assignedProject"
  label="Assigned Project"
  dataSource={{
    listNameOrId: 'Projects',
    displayField: 'Title',
    searchFields: ['Title', 'ProjectCode', 'Description'],
    additionalFields: ['ProjectCode', 'Status']
  }}
  displayMode={SPLookupDisplayMode.Searchable}
  minSearchLength={2}
  searchDelay={300}
/>

// Multi-select lookup
<SPLookupField
  name="relatedItems"
  label="Related Items"
  dataSource={{
    listNameOrId: 'Items',
    displayField: 'Title',
    itemLimit: 100
  }}
  allowMultiple={true}
  maxDisplayedTags={5}
/>

// Dependent/Cascading lookup
<SPLookupField
  name="city"
  label="City"
  dataSource={{
    listNameOrId: 'Cities',
    displayField: 'Title'
  }}
  dependsOn={{
    fieldName: 'state',
    lookupField: 'StateId'
  }}
/>`;

const TAXONOMY_FIELD_SAMPLE = `import { SPTaxonomyField } from 'spfx-toolkit/lib/components/spFields';

// Single-select taxonomy field
<SPTaxonomyField
  name="department"
  label="Department"
  dataSource={{
    termSetId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    termStoreName: 'Taxonomy_xxx'
  }}
  placeholder="Select department"
  showPath={true}
  pathSeparator=" > "
/>

// Multi-select taxonomy with search
<SPTaxonomyField
  name="tags"
  label="Tags"
  dataSource={{
    termSetId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    anchorId: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
  }}
  allowMultiple={true}
  showSearchBox={true}
  minSearchLength={2}
  searchDelay={300}
  maxDisplayedTags={10}
  showClearButton={true}
  useCache={true}
/>`;

const SPFIELD_UNIVERSAL_SAMPLE = `import { SPField } from 'spfx-toolkit/lib/components/spFields';

// Smart config - auto-load field configuration from SharePoint
<SPField
  name="taskTitle"
  config={{
    listNameOrId: 'Tasks',
    fieldInternalName: 'Title',
    webUrl: '/sites/mysite',
    useCache: true
  }}
/>

// Manual config - specify field type and configuration
<SPField
  name="customField"
  config={{
    fieldType: 'Text',
    displayName: 'Custom Field',
    description: 'Enter custom text',
    required: true,
    fieldConfig: {
      maxLength: 255
    }
  }}
  placeholder="Enter value"
/>

// Works with any SharePoint field type
<SPField
  name="dynamicField"
  config={{
    listNameOrId: 'DynamicList',
    fieldInternalName: 'DynamicColumn',
    useCache: true
  }}
  label="Dynamic Field"
/>`;

const APPEND_ONLY_SAMPLE = `// Append-only mode with note history
<SPTextField
  name="notes"
  label="Project Notes"
  mode={SPTextFieldMode.MultiLine}
  appendOnly={true}
  itemId={123}
  listNameOrId="Projects"
  fieldInternalName="Notes"
  historyConfig={{
    initialDisplayCount: 5,
    loadMoreCount: 5,
    showLoadMore: true,
    enableCopyPrevious: true,
    timeFormat: 'relative',
    sortOrder: 'desc',
    showVersionLabel: true,
    showUserPhoto: true,
    position: 'below',
    historyTitle: 'Previous Notes',
    emptyHistoryMessage: 'No previous notes found'
  }}
  onHistoryLoad={(entries, totalCount) => {
    console.log(\`Loaded \${entries.length} of \${totalCount} history entries\`);
  }}
  onCopyPrevious={(entry) => {
    console.log('Copied previous entry:', entry);
  }}
/>

// Rich text append-only mode
<SPTextField
  name="richNotes"
  label="Rich Notes"
  mode={SPTextFieldMode.RichText}
  appendOnly={true}
  itemId={123}
  listNameOrId="Projects"
  fieldInternalName="RichNotes"
  historyConfig={{
    position: 'above',
    timeFormat: 'both'
  }}
/>

// Read-only history view (disabled with appendOnly shows only history)
<SPTextField
  name="auditLog"
  label="Audit Log"
  mode={SPTextFieldMode.MultiLine}
  disabled={true}
  appendOnly={true}
  itemId={123}
  listNameOrId="Tasks"
  fieldInternalName="AuditLog"
  historyConfig={{
    showVersionLabel: true,
    enableCopyPrevious: false
  }}
/>`;

const LIST_CREATION_SAMPLE = `// Comprehensive list creation utility using PnPjs
import SPContext from 'spfx-toolkit/lib/utilities/context';
import { FieldUserSelectionMode } from '@pnp/sp/fields';

const ensureTestLists = async (): Promise<void> => {
  const sp = SPContext.sp;
  const listTitle = 'SPFieldsTest';
  const categoryListTitle = 'SPFieldsCategories';

  // Step 1: Create Categories list first (for lookup fields)
  let categoryListId: string;
  try {
    const catList = await sp.web.lists.getByTitle(categoryListTitle)();
    categoryListId = catList.Id;
  } catch {
    const catListResult = await sp.web.lists.add(
      categoryListTitle,
      'Categories for SPFields demo',
      100
    );
    categoryListId = catListResult.data.Id;

    // Add sample categories
    const catList = sp.web.lists.getByTitle(categoryListTitle);
    const categories = ['Development', 'Testing', 'Documentation', 'Design', 'Planning', 'Review'];

    for (const cat of categories) {
      await catList.items.add({ Title: cat });
    }
  }

  // Step 2: Create main test list
  try {
    await sp.web.lists.getByTitle(listTitle)();
  } catch {
    await sp.web.lists.add(listTitle, 'Comprehensive test list for spFields showcase', 100);

    // Step 3: Add all field types
    const fields = sp.web.lists.getByTitle(listTitle).fields;

    // Text fields
    await fields.addText('Description', { MaxLength: 500, Group: 'SPFields Demo' });
    await fields.addMultilineText('MultiLineNotes', {
      NumberOfLines: 6,
      RichText: false,
      Group: 'SPFields Demo'
    });
    await fields.addMultilineText('RichNotes', {
      NumberOfLines: 6,
      RichText: true,
      Group: 'SPFields Demo'
    });

    // Choice fields
    await fields.addChoice('Status', {
      Choices: ['New', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      Group: 'SPFields Demo',
      Required: true
    });
    await fields.addMultiChoice('Priority', {
      Choices: ['High', 'Medium', 'Low', 'Critical', 'Nice to Have'],
      Group: 'SPFields Demo'
    });

    // User field
    await fields.addUser('AssignedTo', {
      SelectionMode: FieldUserSelectionMode.PeopleAndGroups,
      Group: 'SPFields Demo',
      Required: true
    });

    // Date fields
    await fields.addDateTime('DueDate', {
      DateTimeCalendarType: 1,
      DisplayFormat: 1, // DateTime
      Group: 'SPFields Demo',
      Required: true
    });
    await fields.addDateTime('StartDate', {
      DateTimeCalendarType: 1,
      DisplayFormat: 0, // Date only
      Group: 'SPFields Demo'
    });

    // Number fields
    await fields.addNumber('EstimatedHours', {
      MinimumValue: 0,
      MaximumValue: 1000,
      Group: 'SPFields Demo'
    });
    await fields.addCurrency('Budget', {
      CurrencyLocaleId: 1033, // US English
      Group: 'SPFields Demo'
    });

    // Boolean fields
    await fields.addBoolean('IsActive', { Group: 'SPFields Demo', DefaultValue: '1' });
    await fields.addBoolean('IsHighPriority', { Group: 'SPFields Demo' });

    // URL field
    await fields.addUrl('ReferenceLink', { DisplayFormat: 0, Group: 'SPFields Demo' });

    // Lookup fields
    await fields.addLookup('Category', {
      LookupListId: categoryListId,
      LookupFieldName: 'Title',
      Group: 'SPFields Demo'
    });
    await fields.addLookup('RelatedProject', {
      LookupListId: categoryListId,
      LookupFieldName: 'Title',
      Group: 'SPFields Demo',
      AllowMultipleValues: false
    });

    console.log('Test lists created successfully with 18 fields!');
  }
};`;

/**
 * SPFieldsShowcase - Comprehensive demonstration of all spFields components
 */
export const SPFieldsShowcase: React.FC = () => {
  const [message, setMessage] = useState<{ type: MessageBarType; text: string } | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [listExists, setListExists] = useState<boolean | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [enableAutoSave, setEnableAutoSave] = useState(true);
  const [enableAutoScroll, setEnableAutoScroll] = useState(true);

  const { lastSaved } = useSPFieldsDraftStore();

  // Form setup with validation
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit', // Validate only on submit (first time)
    reValidateMode: 'onBlur', // After first submit, validate on blur
    defaultValues: {
      title: '',
      description: '',
      richNotes: '',
      multiLineNotes: '',
      status: { value: '' },
      priority: undefined,
      assignedTo: [],
      dueDate: null,
      startDate: null,
      estimatedHours: undefined,
      budget: undefined,
      isActive: true,
      isHighPriority: false,
      referenceLink: undefined,
      category: undefined,
      relatedProject: undefined,
      tags: undefined,
    },
  });

  // Auto-scroll to first error on validation
  if (enableAutoScroll) {
    useScrollToError(form.formState as any, {
      behavior: 'smooth',
      block: 'center',
      focusAfterScroll: true,
    });
  }

  // Auto-save form data to Zustand store
  if (enableAutoSave) {
    useZustandFormSync(form.control as any, useSPFieldsDraftStore, {
      debounceMs: 500,
    });
  }

  // Ensure test list creation
  const ensureTestList = useCallback(async () => {
    setIsCreatingList(true);
    setMessage(null);

    try {
      const sp = SPContext.sp;
      const listTitle = 'SPFieldsTest';
      const categoryListTitle = 'SPFieldsCategories';

      // Check if list exists
      try {
        await sp.web.lists.getByTitle(listTitle)();
        setMessage({
          type: MessageBarType.info,
          text: `List '${listTitle}' already exists with required fields.`,
        });
        setListExists(true);
      } catch {
        // Step 1: Create Categories list first (for lookup)
        let categoryListId: string;
        try {
          const catList = await sp.web.lists.getByTitle(categoryListTitle)();
          categoryListId = catList.Id;
        } catch {
          const catListResult = await sp.web.lists.add(
            categoryListTitle,
            'Categories for SPFields demo',
            100
          );
          categoryListId = catListResult.data.Id;

          // Add sample categories
          const catList = sp.web.lists.getByTitle(categoryListTitle);
          const categories = [
            'Development',
            'Testing',
            'Documentation',
            'Design',
            'Planning',
            'Review',
          ];

          for (const cat of categories) {
            try {
              await catList.items.add({ Title: cat });
            } catch (e) {
              console.log('Category add skipped:', e);
            }
          }
        }

        // Step 2: Create main test list
        await sp.web.lists.add(listTitle, 'Comprehensive test list for spFields showcase', 100);

        // Step 3: Add fields
        const fields = sp.web.lists.getByTitle(listTitle).fields;

        const fieldOperations = [
          // Text fields
          async () =>
            await fields.addText('Description', {
              MaxLength: 500,
              Group: 'SPFields Demo',
              Required: false,
            }),
          async () =>
            await fields.addMultilineText('MultiLineNotes', {
              NumberOfLines: 6,
              RichText: false,
              Group: 'SPFields Demo',
              AppendOnly: false,
            }),
          async () =>
            await fields.addMultilineText('RichNotes', {
              NumberOfLines: 6,
              RichText: true,
              Group: 'SPFields Demo',
            }),

          // Choice fields
          async () =>
            await fields.addChoice('Status', {
              Choices: ['New', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
              Group: 'SPFields Demo',
              Required: true,
            }),
          async () =>
            await fields.addMultiChoice('Priority', {
              Choices: ['High', 'Medium', 'Low', 'Critical', 'Nice to Have'],
              Group: 'SPFields Demo',
              FillInChoice: false,
            }),

          // User field
          async () =>
            await fields.addUser('AssignedTo', {
              SelectionMode: FieldUserSelectionMode.PeopleAndGroups,
              Group: 'SPFields Demo',
              Required: true,
            }),

          // Date fields
          async () =>
            await fields.addDateTime('DueDate', {
              DateTimeCalendarType: 1,
              DisplayFormat: 1, // DateTime
              Group: 'SPFields Demo',
              Required: true,
            }),
          async () =>
            await fields.addDateTime('StartDate', {
              DateTimeCalendarType: 1,
              DisplayFormat: 0, // Date only
              Group: 'SPFields Demo',
            }),

          // Number fields
          async () =>
            await fields.addNumber('EstimatedHours', {
              MinimumValue: 0,
              MaximumValue: 1000,
              Group: 'SPFields Demo',
            }),
          async () =>
            await fields.addCurrency('Budget', {
              CurrencyLocaleId: 1033, // US English
              Group: 'SPFields Demo',
            }),

          // Boolean fields
          async () => await fields.addBoolean('IsActive', { Group: 'SPFields Demo' }),
          async () => await fields.addBoolean('IsHighPriority', { Group: 'SPFields Demo' }),

          // URL field
          async () =>
            await fields.addUrl('ReferenceLink', { DisplayFormat: 0, Group: 'SPFields Demo' }),

          // Lookup fields
          async () =>
            await fields.addLookup('Category', {
              LookupListId: categoryListId,
              LookupFieldName: 'Title',
            }),
          async () =>
            await fields.addLookup('RelatedProject', {
              LookupListId: categoryListId,
              LookupFieldName: 'Title',
            }),
        ];

        for (const operation of fieldOperations) {
          try {
            await operation();
          } catch (e) {
            // Field may already exist, continue
            console.log('Field operation skipped (may already exist):', e);
          }
        }

        setMessage({
          type: MessageBarType.success,
          text: `Test lists created successfully! '${listTitle}' with 18 fields and '${categoryListTitle}' with sample data.`,
        });
        setListExists(true);
      }
    } catch (error) {
      console.error('Error creating test list:', error);
      setMessage({
        type: MessageBarType.error,
        text: `Failed to ensure test list: ${(error as Error).message || 'Unknown error'}`,
      });
      setListExists(false);
    } finally {
      setIsCreatingList(false);
    }
  }, []);

  React.useEffect(() => {
    // Check list exists on mount
    (async () => {
      try {
        const sp = SPContext.sp;
        await sp.web.lists.getByTitle('SPFieldsTest')();
        setListExists(true);
      } catch {
        setListExists(false);
      }
    })().catch(() => undefined);
  }, []);

  // Form submit handlers
  const onSubmit = useCallback((data: FormData) => {
    console.log('Form submitted successfully:', data);
    setMessage({
      type: MessageBarType.success,
      text: 'Form submitted successfully! Check console for data.',
    });
  }, []);

  const onError = useCallback((errors: Record<string, unknown>) => {
    console.error('Form validation errors:', errors);
    setMessage({
      type: MessageBarType.error,
      text: 'Form has validation errors. Please check all fields.',
    });
    setShowErrorSummary(true);
  }, []);

  const styles: Record<string, CSSProperties> = {
    container: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      backgroundColor: '#fafafa',
      minHeight: '100vh',
    },
    section: {
      padding: '32px 40px',
      border: '1px solid #edebe9',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      margin: '0 0 24px 0',
    },
    lastSection: {
      padding: '32px 40px',
      border: '1px solid #edebe9',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      margin: '0 0 24px 0',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '16px',
      color: '#323130',
    },
    fieldGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginTop: '16px',
    },
    cardSpacing: {
      marginBottom: '20px',
    },
    formSection: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    formSectionTitle: {
      fontSize: '1.1rem',
      fontWeight: 600,
      marginBottom: '16px',
      color: '#323130',
      paddingBottom: '8px',
      borderBottom: '2px solid #0078d4',
    },
    buttonBar: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '1px solid #edebe9',
    },
    listStatusBanner: {
      padding: '16px 40px',
      backgroundColor: '#f3f2f1',
      border: '1px solid #edebe9',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      margin: '0 0 24px 0',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <ShowcaseHero
        title='SharePoint Fields (spFields)'
        subtitle='Complete suite of 10 SharePoint field components with React Hook Form, Zod validation, auto-save, error summary, append-only history, and smart lookup/taxonomy integration'
        gradient='linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)'
        badges={[
          'Stable',
          '10 Components',
          'React Hook Form',
          'Zod Validation',
          'Auto-Save',
          'Error Scroll',
          'Append-Only',
        ]}
        icon='📝'
      />

      {/* List Creation Banner */}
      <div style={styles.listStatusBanner}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>
              Test List: SPFieldsTest
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#605e5c' }}>
              {listExists === null
                ? 'Checking list status...'
                : listExists
                ? 'Test list exists and is ready for demo'
                : 'Test list not found. Click button to create it.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Toggle
              inlineLabel
              label='Auto-save'
              checked={enableAutoSave}
              onChange={(_, checked) => setEnableAutoSave(!!checked)}
            />
            <Toggle
              inlineLabel
              label='Auto-scroll'
              checked={enableAutoScroll}
              onChange={(_, checked) => setEnableAutoScroll(!!checked)}
            />
            {lastSaved && (
              <MessageBar
                messageBarType={MessageBarType.success}
                isMultiline={false}
                styles={{ root: { minWidth: 'auto' } }}
              >
                Last saved: {lastSaved.toLocaleTimeString()}
              </MessageBar>
            )}
            <PrimaryButton
              text={isCreatingList ? 'Creating...' : 'Ensure Test List'}
              onClick={ensureTestList}
              disabled={isCreatingList}
              iconProps={{ iconName: isCreatingList ? undefined : 'Add' }}
            >
              {isCreatingList && (
                <Spinner size={SpinnerSize.small} style={{ marginRight: '8px' }} />
              )}
            </PrimaryButton>
          </div>
        </div>
        {message && (
          <MessageBar
            messageBarType={message.type}
            onDismiss={() => setMessage(null)}
            dismissButtonAriaLabel='Close'
            style={{ marginTop: '12px' }}
          >
            {message.text}
          </MessageBar>
        )}
      </div>

      {/* Interactive Form Demo */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Interactive Form Demo - All 10 Field Types</h2>
        <p style={{ marginBottom: '24px', color: '#605e5c' }}>
          This comprehensive form demonstrates all spFields components with React Hook Form
          integration and Zod validation. Features include: auto-save with Zustand, auto-scroll to
          first error, FormErrorSummary with sticky positioning, and smart field behaviors (lookup
          auto-switching, taxonomy term store integration, append-only history). Try submitting
          with invalid data to see error handling in action.
        </p>

        <FormProvider control={form.control as any}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <FormContainer labelWidth='180px'>
              {/* Text Fields Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>📝 Text Fields (4 Modes)</h3>
                <div style={styles.fieldGrid}>
                  <FormItem fieldName='title' section='text-fields'>
                    <FormLabel isRequired htmlFor='title'>
                      Title (Single Line)
                    </FormLabel>
                    <FormValue>
                      <SPTextField
                        name='title'
                        placeholder='Enter task title'
                        mode={SPTextFieldMode.SingleLine}
                        maxLength={255}
                        required
                      />
                      <FormDescription>Single-line text with 255 character limit</FormDescription>
                      <FormError error={form.formState.errors.title?.message} showIcon />
                    </FormValue>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Description (Single Line)</FormLabel>
                    <FormValue>
                      <SPTextField
                        name='description'
                        placeholder='Enter brief description'
                        mode={SPTextFieldMode.SingleLine}
                        maxLength={500}
                        showCharacterCount
                      />
                      <FormDescription>
                        Single-line with character count (500 max)
                      </FormDescription>
                      <FormError error={form.formState.errors.description?.message} showIcon />
                    </FormValue>
                  </FormItem>
                </div>

                <FormItem style={{ marginTop: '16px' }}>
                  <FormLabel>Multi-Line Notes</FormLabel>
                  <FormValue>
                    <SPTextField
                      name='multiLineNotes'
                      placeholder='Enter detailed notes'
                      mode={SPTextFieldMode.MultiLine}
                      rows={4}
                      maxLength={1000}
                      showCharacterCount
                    />
                    <FormDescription>Multi-line textarea with character counter</FormDescription>
                    <FormError error={form.formState.errors.multiLineNotes?.message} showIcon />
                  </FormValue>
                </FormItem>

                <FormItem style={{ marginTop: '16px' }}>
                  <FormLabel>Rich Text Notes</FormLabel>
                  <FormValue>
                    <SPTextField
                      name='richNotes'
                      placeholder='Enter rich text notes with formatting'
                      mode={SPTextFieldMode.RichText}
                    />
                    <FormDescription>
                      Rich text editor with HTML formatting (bold, italic, lists, etc.)
                    </FormDescription>
                    <FormError error={form.formState.errors.richNotes?.message} showIcon />
                  </FormValue>
                </FormItem>
              </div>

              {/* Choice Fields Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>🎯 Choice Fields (Single & Multi)</h3>
                <div style={styles.fieldGrid}>
                  <FormItem>
                    <FormLabel isRequired>Status (Single Choice)</FormLabel>
                    <FormValue>
                      <SPChoiceField
                        name='status'
                        dataSource={{
                          type: 'static',
                          choices: ['New', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
                        }}
                        required
                      />
                      <FormDescription>Single selection dropdown</FormDescription>
                      <FormError error={form.formState.errors.status?.message} showIcon />
                    </FormValue>
                  </FormItem>

                  <FormItem>
                  <FormLabel>Priority (Multi-Choice)</FormLabel>
                    <FormValue>
                      <SPChoiceField
                        name='priority'
                        dataSource={{
                          type: 'static',
                          choices: ['High', 'Medium', 'Low', 'Critical', 'Nice to Have'],
                        }}
                        allowMultiple={true}
                      />
                      <FormDescription>Multiple selection allowed</FormDescription>
                      <FormError error={form.formState.errors.priority?.message} showIcon />
                    </FormValue>
                  </FormItem>
                </div>
              </div>

              {/* User Field Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>👥 User/People Field</h3>
                <FormItem>
                  <FormLabel isRequired>Assigned To</FormLabel>
                  <FormValue>
                    <SPUserField
                      name='assignedTo'
                      allowMultiple={true}
                      placeholder='Select users or groups'
                      required
                    />
                    <FormDescription>
                      Select one or more users/groups (supports people picker search)
                    </FormDescription>
                    <FormError error={form.formState.errors.assignedTo?.message} showIcon />
                  </FormValue>
                </FormItem>
              </div>

              {/* Date Fields Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>📅 Date Fields (Date & DateTime)</h3>
                <div style={styles.fieldGrid}>
                  <FormItem>
                    <FormLabel isRequired>Due Date (with Time)</FormLabel>
                    <FormValue>
                      <SPDateField
                        name='dueDate'
                        showTimePicker={true}
                        placeholder='Select due date and time'
                        required
                      />
                      <FormDescription>Date and time picker</FormDescription>
                      <FormError error={form.formState.errors.dueDate?.message} showIcon />
                    </FormValue>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Start Date (Date Only)</FormLabel>
                    <FormValue>
                      <SPDateField
                        name='startDate'
                        showTimePicker={false}
                        placeholder='Select start date'
                      />
                      <FormDescription>Date only (no time component)</FormDescription>
                      <FormError error={form.formState.errors.startDate?.message} showIcon />
                    </FormValue>
                  </FormItem>
                </div>
              </div>

              {/* Number Fields Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>🔢 Number Fields (Number & Currency)</h3>
                <div style={styles.fieldGrid}>
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormValue>
                      <SPNumberField
                        name='estimatedHours'
                        min={0}
                        max={1000}
                        format={{ decimals: 2 }}
                        placeholder='Enter hours'
                      />
                      <FormDescription>
                        Number field (0-1000) with 2 decimal places
                      </FormDescription>
                      <FormError error={form.formState.errors.estimatedHours?.message} showIcon />
                    </FormValue>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Budget (Currency)</FormLabel>
                    <FormValue>
                      <SPNumberField
                        name='budget'
                        min={0}
                        max={10000000}
                        format={{
                          decimals: 2,
                          currencyLocale: 'en-US',
                          currencyCode: 'USD',
                        }}
                        placeholder='Enter budget'
                      />
                      <FormDescription>Currency field with USD formatting</FormDescription>
                      <FormError error={form.formState.errors.budget?.message} showIcon />
                    </FormValue>
                  </FormItem>
                </div>
              </div>

              {/* Boolean Fields Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>✓ Boolean Fields (Yes/No)</h3>
                <div style={styles.fieldGrid}>
                  <FormItem>
                    <FormLabel>Is Active</FormLabel>
                    <FormValue>
                      <SPBooleanField
                        name='isActive'
                        displayType={SPBooleanDisplayType.Toggle}
                        checkedText='Active'
                        uncheckedText='Inactive'
                      />
                      <FormDescription>Toggle switch with custom labels</FormDescription>
                    </FormValue>
                  </FormItem>

                  <FormItem>
                    <FormLabel>High Priority Flag</FormLabel>
                    <FormValue>
                      <SPBooleanField
                        name='isHighPriority'
                        displayType={SPBooleanDisplayType.Toggle}
                        checkedText='Yes'
                        uncheckedText='No'
                      />
                      <FormDescription>Simple boolean toggle</FormDescription>
                    </FormValue>
                  </FormItem>
                </div>
              </div>

              {/* URL Field Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>🔗 URL/Hyperlink Field</h3>
                <FormItem>
                  <FormLabel>Reference Link</FormLabel>
                  <FormValue>
                    <SPUrlField name='referenceLink' placeholder='https://example.com' />
                    <FormDescription>
                      Optional URL field with description (validates URL format)
                    </FormDescription>
                    <FormError error={form.formState.errors.referenceLink?.message} showIcon />
                  </FormValue>
                </FormItem>
              </div>

              {/* Lookup Fields Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>🔍 Lookup Fields (Auto-switching)</h3>
                <p
                  style={{
                    marginBottom: '16px',
                    fontSize: '0.875rem',
                    color: '#605e5c',
                    fontStyle: 'italic',
                  }}
                >
                  Note: Create the test list first to enable lookup functionality. Lookup fields
                  automatically switch between dropdown and searchable modes based on item count.
                </p>
                <div style={styles.fieldGrid}>
                  <FormItem>
                    <FormLabel>Category (Lookup)</FormLabel>
                    <FormValue>
                      <SPLookupField
                        name='category'
                        dataSource={{
                          listNameOrId: 'SPFieldsCategories',
                          displayField: 'Title',
                          orderBy: 'Title',
                        }}
                        displayMode={SPLookupDisplayMode.Auto}
                        searchableThreshold={10}
                        placeholder='Select category'
                      />
                      <FormDescription>
                        Auto-switches to searchable when items &gt; 10
                      </FormDescription>
                      <FormError error={form.formState.errors.category?.message} showIcon />
                    </FormValue>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Related Project</FormLabel>
                    <FormValue>
                      <SPLookupField
                        name='relatedProject'
                        dataSource={{
                          listNameOrId: 'SPFieldsCategories',
                          displayField: 'Title',
                        }}
                        displayMode={SPLookupDisplayMode.Dropdown}
                        placeholder='Select related project'
                      />
                      <FormDescription>Single selection lookup (dropdown mode)</FormDescription>
                      <FormError error={form.formState.errors.relatedProject?.message} showIcon />
                    </FormValue>
                  </FormItem>
                </div>
              </div>

              {/* Taxonomy Field Section */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>🏷️ Taxonomy/Managed Metadata Field</h3>
                <p
                  style={{
                    marginBottom: '16px',
                    fontSize: '0.875rem',
                    color: '#605e5c',
                    fontStyle: 'italic',
                  }}
                >
                  Note: Requires a term set to be configured in the term store. Replace termSetId
                  with your actual term set GUID.
                </p>
                <FormItem>
                  <FormLabel>Tags (Taxonomy)</FormLabel>
                  <FormValue>
                    <SPTaxonomyField
                      name='tags'
                      dataSource={{
                        termSetId: '00000000-0000-0000-0000-000000000000',
                      }}
                      allowMultiple={true}
                      placeholder='Select tags from term store'
                      showPath={true}
                    />
                    <FormDescription>
                      Multi-select managed metadata with term path display
                    </FormDescription>
                    <FormError error={form.formState.errors.tags?.message} showIcon />
                  </FormValue>
                </FormItem>
              </div>
              {showErrorSummary && (
                <FormErrorSummary position='sticky' clickToScroll showFieldLabels maxErrors={10} />
              )}
              <div style={styles.buttonBar}>
                <PrimaryButton
                  type='submit'
                  text='Submit Form'
                  iconProps={{ iconName: 'CheckMark' }}
                />
                <DefaultButton
                  text='Reset Form'
                  iconProps={{ iconName: 'Refresh' }}
                  onClick={() => {
                    form.reset();
                    setMessage(null);
                  }}
                />
              </div>
            </FormContainer>
          </form>
        </FormProvider>
      </div>

      {/* Key Features */}
      <div style={styles.section}>
        <ShowcaseKeyFeatures features={features} />
      </div>

      {/* Basic Usage */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Basic Usage</h2>
        <ShowcaseCodeSample
          id='basic-usage'
          title='Basic Form Example'
          code={BASIC_USAGE}
          language='typescript'
        />
      </div>

      {/* Component Examples */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Component Examples</h2>

        <ShowcaseCodeSample
          id='text-field-code'
          title='Text Field Examples'
          code={TEXT_FIELD_SAMPLE}
          language='typescript'
        />

        <ShowcaseCodeSample
          id='choice-field-code'
          title='Choice Field Examples'
          code={CHOICE_FIELD_SAMPLE}
          language='typescript'
        />

        <ShowcaseCodeSample
          id='user-field-code'
          title='User Field Example'
          code={USER_FIELD_SAMPLE}
          language='typescript'
        />
        <ShowcaseCodeSample
          id='date-field-code'
          title='Date Field Example'
          code={DATE_FIELD_SAMPLE}
          language='typescript'
        />
        <ShowcaseCodeSample
          id='number-field-code'
          title='Number Field Examples'
          code={NUMBER_FIELD_SAMPLE}
          language='typescript'
        />
        <ShowcaseCodeSample
          id='boolean-field-code'
          title='Boolean Field Example'
          code={BOOLEAN_FIELD_SAMPLE}
          language='typescript'
        />
        <ShowcaseCodeSample
          id='url-field-code'
          title='URL Field Example'
          code={URL_FIELD_SAMPLE}
          language='typescript'
        />
        <ShowcaseCodeSample
          id='lookup-field-code'
          title='Lookup Field Examples (Auto-switching, Searchable, Dependent)'
          code={LOOKUP_FIELD_SAMPLE}
          language='typescript'
        />
        <ShowcaseCodeSample
          id='taxonomy-field-code'
          title='Taxonomy/Managed Metadata Field Examples'
          code={TAXONOMY_FIELD_SAMPLE}
          language='typescript'
        />
        <ShowcaseCodeSample
          id='spfield-universal-code'
          title='SPField - Universal Field Component'
          code={SPFIELD_UNIVERSAL_SAMPLE}
          language='typescript'
        />
        <ShowcaseCodeSample
          id='append-only-code'
          title='Append-Only Mode with Note History'
          code={APPEND_ONLY_SAMPLE}
          language='typescript'
        />
      </div>

      {/* List Creation Utility */}
      <div style={styles.lastSection}>
        <h2 style={styles.sectionTitle}>Test List Creation</h2>
        <p style={{ marginBottom: '16px', color: '#605e5c' }}>
          Use this utility code to programmatically create the test list with all required fields:
        </p>
        <ShowcaseCodeSample
          id='list-creation-code'
          title='List Creation Utility'
          code={LIST_CREATION_SAMPLE}
          language='typescript'
        />
      </div>
    </div>
  );
};

export default SPFieldsShowcase;
