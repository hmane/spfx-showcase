import { MessageBar, MessageBarType, PrimaryButton, DefaultButton, TextField, Checkbox, Spinner, SpinnerSize, Panel, PanelType, Stack, Dropdown, Label } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Content, Header } from 'spfx-toolkit/components/Card';
import type { IFormSubmitResult, ISectionConfig, IFieldOverride } from 'spfx-toolkit/components/SPDynamicForm';
import { SPDynamicForm } from 'spfx-toolkit/components/SPDynamicForm';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import type { ShowcaseFeature } from '../shared/ShowcaseKeyFeatures';
import { ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';
import SPContext from 'spfx-toolkit/utilities/context';
import { FieldUserSelectionMode } from '@pnp/sp/fields';

const features: ShowcaseFeature[] = [
  {
    title: 'Auto-Generated Forms',
    description: 'Automatically generates complete forms from SharePoint list schema',
    icon: 'FormLibrary',
  },
  {
    title: 'Custom Sections',
    description: 'Organize fields into collapsible sections with custom headers',
    icon: 'GridViewMedium',
  },
  {
    title: 'Field Overrides',
    description: 'Customize labels, validation, and rendering of specific fields',
    icon: 'Settings',
  },
  {
    title: 'Multiple Modes',
    description: 'Supports new, edit, and view modes out of the box',
    icon: 'View',
  },
  {
    title: 'Smart Validation',
    description: 'Automatic validation based on SharePoint field types and custom rules',
    icon: 'CheckMark',
  },
  {
    title: 'Attachment Support',
    description: 'Built-in support for file attachments with size and type restrictions',
    icon: 'Attach',
  },
];

export interface ISPDynamicFormShowcaseProps {
  context?: WebPartContext;
}

// Memoized wrapper to prevent unnecessary re-renders of SPDynamicForm
interface IDynamicFormWrapperProps {
  listId: string;
  mode: 'new' | 'edit' | 'view';
  itemId?: number;
  sections?: ISectionConfig[];
  fieldOrder?: string[];
  excludeFields?: string[];
  fieldOverrides?: IFieldOverride[];
  useContentTypeOrder?: boolean;
  onSubmit: (result: IFormSubmitResult) => Promise<void>;
  onCancel: () => void;
  onError: (error: Error, context: string) => void;
}

const DynamicFormWrapper: React.FC<IDynamicFormWrapperProps> = React.memo(({
  listId,
  mode,
  itemId,
  sections,
  fieldOrder,
  excludeFields,
  fieldOverrides,
  useContentTypeOrder,
  onSubmit,
  onCancel,
  onError
}) => {
  return (
    <SPDynamicForm
      listId={listId}
      mode={mode}
      itemId={itemId}
      sections={sections}
      fieldOrder={fieldOrder}
      excludeFields={excludeFields}
      fieldOverrides={fieldOverrides}
      useContentTypeOrder={useContentTypeOrder}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onError={onError}
    />
  );
});

DynamicFormWrapper.displayName = 'DynamicFormWrapper';

export const SPDynamicFormShowcase: React.FC<ISPDynamicFormShowcaseProps> = ({ context }) => {
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>('new');
  const [itemId, setItemId] = useState<string>('');
  const [sampleItemId, setSampleItemId] = useState<number | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isPreparingSampleItem, setIsPreparingSampleItem] = useState(false);
  const [listExists, setListExists] = useState<boolean | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Configuration state
  const [useSections, setUseSections] = useState(false);
  const [useFieldOrder, setUseFieldOrder] = useState(false);
  const [useExcludeFields, setUseExcludeFields] = useState(false);
  const [useFieldOverrides, setUseFieldOverrides] = useState(false);
  const [useContentTypeOrder, setUseContentTypeOrder] = useState(false);
  const [fieldOrderInput, setFieldOrderInput] = useState('');
  const [excludeFieldsInput, setExcludeFieldsInput] = useState('');

  const LIST_TITLE = 'SPDynamicFormTest';

  const ensureSampleItem = useCallback(async (): Promise<number> => {
    const sp = SPContext.sp;
    const list = sp.web.lists.getByTitle(LIST_TITLE);
    const existingItems = await list.items.select('Id').orderBy('Id', false).top(1)();

    if (existingItems.length > 0) {
      const existingId = existingItems[0].Id;
      setSampleItemId(existingId);
      return existingId;
    }

    const currentUser = await sp.web.currentUser.select('Id', 'Title')();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const createdItem = await list.items.add({
      Title: 'Sample onboarding task',
      Description: 'Seed item created by the showcase so edit and view modes are testable immediately.',
      Status: 'In Progress',
      Priority: ['High', 'Medium'],
      AssignedToId: currentUser.Id,
      DueDate: dueDate.toISOString(),
      StartDate: new Date().toISOString(),
      EstimatedHours: 12,
      Budget: 2500,
      IsActive: true,
    });

    const createdId = createdItem.data.Id as number;
    setSampleItemId(createdId);
    return createdId;
  }, [LIST_TITLE]);

  const hydrateExistingListState = useCallback(async (): Promise<void> => {
    const sp = SPContext.sp;

    await sp.web.lists.getByTitle(LIST_TITLE)();
    setListExists(true);

    try {
      const existingId = await ensureSampleItem();
      setItemId(current => current || String(existingId));
    } catch (error) {
      console.warn('Failed to prepare a sample SPDynamicForm item:', error);
      setSampleItemId(null);
    }
  }, [LIST_TITLE, ensureSampleItem]);

  // Ensure test list creation
  const ensureTestList = useCallback(async () => {
    if (!context) return;

    setIsCreatingList(true);
    setSubmitResult(null);

    try {
      const sp = SPContext.sp;

      // Check if SPContext is initialized
      if (!sp || !sp.web) {
        throw new Error('SPContext is not initialized. Please refresh the page and try again.');
      }

      const categoryListTitle = 'SPFieldsCategories';

      // Check if list exists
      try {
        const existingSampleItemId = await ensureSampleItem();
        setListExists(true);
        setItemId(current => current || String(existingSampleItemId));
        setSubmitResult(
          `List '${LIST_TITLE}' already exists and sample item ${existingSampleItemId} is ready for edit/view testing.`
        );
        return;
      } catch {
        // List doesn't exist, create it
      }

      // Step 1: Create Categories list first (for lookup)
      let categoryListId: string;
      try {
        const catList = await sp.web.lists.getByTitle(categoryListTitle)();
        categoryListId = catList.Id;
      } catch {
        const catListResult = await sp.web.lists.add(
          categoryListTitle,
          'Categories for SPDynamicForm demo',
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
      await sp.web.lists.add(LIST_TITLE, 'Comprehensive test list for SPDynamicForm showcase', 100);

      // Step 3: Add fields
      const fields = sp.web.lists.getByTitle(LIST_TITLE).fields;

      const fieldOperations = [
        // Text fields
        async () =>
          await fields.addText('Description', {
            MaxLength: 500,
            Group: 'Basic Info',
            Required: false,
          }),
        async () =>
          await fields.addMultilineText('Notes', {
            NumberOfLines: 6,
            RichText: false,
            Group: 'Basic Info',
            AppendOnly: false,
          }),
        async () =>
          await fields.addMultilineText('RichNotes', {
            NumberOfLines: 6,
            RichText: true,
            Group: 'Advanced',
          }),

        // Choice fields
        async () =>
          await fields.addChoice('Status', {
            Choices: ['New', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
            Group: 'Basic Info',
            Required: true,
          }),
        async () =>
          await fields.addMultiChoice('Priority', {
            Choices: ['High', 'Medium', 'Low', 'Critical', 'Nice to Have'],
            Group: 'Basic Info',
            FillInChoice: false,
          }),

        // User field
        async () =>
          await fields.addUser('AssignedTo', {
            SelectionMode: FieldUserSelectionMode.PeopleAndGroups,
            Group: 'Assignment',
            Required: true,
          }),

        // Date fields
        async () =>
          await fields.addDateTime('DueDate', {
            DateTimeCalendarType: 1,
            DisplayFormat: 1, // DateTime
            Group: 'Dates',
            Required: true,
          }),
        async () =>
          await fields.addDateTime('StartDate', {
            DateTimeCalendarType: 1,
            DisplayFormat: 0, // Date only
            Group: 'Dates',
          }),

        // Number fields
        async () =>
          await fields.addNumber('EstimatedHours', {
            MinimumValue: 0,
            MaximumValue: 1000,
            Group: 'Metrics',
          }),
        async () =>
          await fields.addCurrency('Budget', {
            CurrencyLocaleId: 1033, // US English
            Group: 'Metrics',
          }),

        // Boolean fields
        async () => await fields.addBoolean('IsActive', { Group: 'Status Flags' }),
        async () => await fields.addBoolean('IsHighPriority', { Group: 'Status Flags' }),

        // URL field
        async () =>
          await fields.addUrl('ReferenceLink', { DisplayFormat: 0, Group: 'Advanced' }),

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
          console.log('Field operation skipped (may already exist):', e);
        }
      }

      const createdSampleItemId = await ensureSampleItem();
      setItemId(String(createdSampleItemId));

      setSubmitResult(
        `Test list created successfully. '${LIST_TITLE}' is ready, and sample item ${createdSampleItemId} can be used for edit/view mode.`
      );
      setListExists(true);
    } catch (error) {
      console.error('Error creating test list:', error);
      setSubmitResult(`Failed to ensure test list: ${(error as Error).message || 'Unknown error'}`);
      setListExists(false);
    } finally {
      setIsCreatingList(false);
    }
  }, [context]);

  // Check if list exists on mount
  useEffect(() => {
    if (!context) return;

    (async () => {
      try {
        if (!SPContext.sp || !SPContext.sp.web) {
          console.warn('SPContext not yet initialized, will retry...');
          setListExists(null);
          return;
        }

        await hydrateExistingListState();
      } catch {
        setSampleItemId(null);
        setListExists(false);
      }
    })().catch(() => undefined);
  }, [context, hydrateExistingListState]);

  const useSampleItem = useCallback(async (): Promise<void> => {
    setIsPreparingSampleItem(true);
    try {
      const ensuredItemId = await ensureSampleItem();
      setFormMode(currentMode => (currentMode === 'new' ? 'edit' : currentMode));
      setItemId(String(ensuredItemId));
      setSubmitResult(`Sample item ${ensuredItemId} loaded. You can now test edit or view mode.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setSubmitResult(`Failed to prepare a sample item: ${message}`);
    } finally {
      setIsPreparingSampleItem(false);
    }
  }, [ensureSampleItem]);

  const handleSubmit = useCallback(async (result: IFormSubmitResult): Promise<void> => {
    try {
      if (result.hasChanges) {
        const updates = result.updater.getUpdates();
        const fieldCount = Object.keys(updates).length;
        const attachmentCount = result.attachments.filesToAdd.length + result.attachments.filesToDelete.length;

        setSubmitResult(
          `Successfully prepared form data! ${fieldCount} field${fieldCount !== 1 ? 's' : ''} changed` +
          (attachmentCount > 0 ? `, ${attachmentCount} attachment${attachmentCount !== 1 ? 's' : ''} modified` : '')
        );
      } else {
        setSubmitResult('No changes detected');
      }
    } catch (error: any) {
      setSubmitResult(`Error: ${error.message}`);
    }
  }, []);

  const handleCancel = useCallback(() => {
    setSubmitResult('Form cancelled by user');
  }, []);

  const handleError = useCallback((error: Error, errorContext: string) => {
    setSubmitResult(`Error in ${errorContext}: ${error.message}`);
  }, []);

  // Build configuration objects based on settings
  const sections = useMemo((): ISectionConfig[] | undefined => {
    if (!useSections) return undefined;

    return [
      {
        name: 'basic-info',
        title: 'Basic Information',
        description: 'Core details about the task',
        fields: ['Title', 'Description', 'Status', 'Priority'],
        defaultExpanded: true,
        collapsible: true,
        compact: true
      },
      {
        name: 'assignment',
        title: 'Assignment & Dates',
        description: 'Who and when',
        fields: ['AssignedTo', 'StartDate', 'DueDate'],
        defaultExpanded: true,
        collapsible: true,
      },
      {
        name: 'metrics',
        title: 'Metrics & Budget',
        description: 'Estimation and financials',
        fields: ['EstimatedHours', 'Budget'],
        defaultExpanded: false,
        collapsible: true,
      },
      {
        name: 'classification',
        title: 'Classification',
        description: 'Categories and project links',
        fields: ['Category', 'RelatedProject'],
        defaultExpanded: false,
        collapsible: true,
      },
      {
        name: 'advanced',
        title: 'Advanced Fields',
        description: 'Additional details and notes',
        fields: ['Notes', 'RichNotes', 'ReferenceLink', 'IsActive', 'IsHighPriority'],
        defaultExpanded: false,
        collapsible: true,
      },
    ];
  }, [useSections]);

  const fieldOrder = useMemo((): string[] | undefined => {
    if (!useFieldOrder || !fieldOrderInput.trim()) return undefined;
    return fieldOrderInput.split(',').map(f => f.trim()).filter(f => f);
  }, [useFieldOrder, fieldOrderInput]);

  const excludeFields = useMemo((): string[] | undefined => {
    if (!useExcludeFields || !excludeFieldsInput.trim()) return undefined;
    return excludeFieldsInput.split(',').map(f => f.trim()).filter(f => f);
  }, [useExcludeFields, excludeFieldsInput]);

  const fieldOverrides = useMemo((): IFieldOverride[] | undefined => {
    if (!useFieldOverrides) return undefined;

    return [
      {
        fieldName: 'Title',
        label: 'Task Title',
        description: 'Enter a descriptive title for this task',
        required: true,
      },
      {
        fieldName: 'Description',
        label: 'Task Description',
        description: 'Provide a detailed description',
      },
      {
        fieldName: 'Priority',
        label: 'Priority Level',
        defaultValue: 'Medium',
      },
    ];
  }, [useFieldOverrides]);

  // Dynamic code sample
  const currentConfigCode = useMemo(() => {
    const configLines: string[] = ['<SPDynamicForm', `  listId="${LIST_TITLE}"`, `  mode="${formMode}"`];

    if (formMode !== 'new' && itemId) {
      configLines.push(`  itemId={${itemId}}`);
    }

    if (sections) {
      configLines.push(`  sections={customSections}`);
    }

    if (fieldOrder) {
      configLines.push(`  fieldOrder={${JSON.stringify(fieldOrder)}}`);
    }

    if (excludeFields) {
      configLines.push(`  excludeFields={${JSON.stringify(excludeFields)}}`);
    }

    if (fieldOverrides) {
      configLines.push(`  fieldOverrides={customFieldOverrides}`);
    }

    if (useContentTypeOrder) {
      configLines.push(`  useContentTypeOrder={true}`);
    }

    configLines.push(`  onSubmit={handleSubmit}`);
    configLines.push(`  onCancel={handleCancel}`);
    configLines.push(`  onError={handleError}`);
    configLines.push('/>');

    return configLines.join('\n');
  }, [formMode, itemId, sections, fieldOrder, excludeFields, fieldOverrides, useContentTypeOrder]);

  return (
    <>
      <ShowcaseHero
        title="SPDynamicForm"
        subtitle="Auto-generate complete SharePoint forms from list schema - with sections, validation, attachments, and custom field rendering"
        gradient="linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)"
        icon="📝"
        badges={['Auto-Generated', 'Sections', 'Validation', 'Attachments', 'SharePoint Integration']}
      />

      {/* List Creation Banner */}
      <Card id="test-list-setup" elevation={3} defaultExpanded={true} style={{ marginTop: '24px' }}>
        <Header variant="warning">Test List Setup</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>
                Test List: {LIST_TITLE}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#605e5c' }}>
                {listExists === null
                  ? 'Checking list status...'
                  : listExists
                  ? 'Test list exists with 18 fields across 6 field groups - ready for interactive demo'
                  : 'Test list not found. Click "Ensure Test List" to create it with all field types.'}
              </p>
            </div>
            <PrimaryButton
              text={isCreatingList ? 'Creating...' : 'Ensure Test List'}
              onClick={ensureTestList}
              disabled={isCreatingList || !context}
              iconProps={{ iconName: isCreatingList ? undefined : 'Add' }}
            >
              {isCreatingList && <Spinner size={SpinnerSize.small} style={{ marginRight: '8px' }} />}
            </PrimaryButton>
          </div>

          {submitResult && (
            <MessageBar
              messageBarType={submitResult.includes('Error') || submitResult.includes('Failed') ? MessageBarType.error : MessageBarType.success}
              onDismiss={() => setSubmitResult(null)}
              styles={{ root: { marginTop: '12px' } }}
            >
              {submitResult}
            </MessageBar>
          )}
        </Content>
      </Card>

      {/* Interactive Demo */}
      <Card id="interactive-demo" elevation={3} defaultExpanded={true} style={{ marginTop: '24px' }}>
        <Header variant="info">Interactive Demo with Configuration</Header>
        <Content padding="comfortable">
          <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#495057' }}>
            Configure the form options below and see how SPDynamicForm adapts. Use the configuration panel to experiment with sections, field ordering, field overrides, and more.
          </p>

          {!context ? (
            <MessageBar messageBarType={MessageBarType.warning}>
              <strong>Context Required:</strong> SharePoint context is needed to display forms. Please ensure the web part is loaded in SharePoint.
            </MessageBar>
          ) : !listExists ? (
            <MessageBar messageBarType={MessageBarType.info}>
              <strong>Setup Required:</strong> Please create the test list using the "Ensure Test List" button above.
            </MessageBar>
          ) : (
            <>
              {/* Demo Controls */}
              <Stack horizontal tokens={{ childrenGap: 16 }} wrap style={{ marginBottom: '24px' }}>
                <Dropdown
                  label="Form Mode"
                  selectedKey={formMode}
                  onChange={(_, option) => setFormMode(option?.key as 'new' | 'edit' | 'view')}
                  options={[
                    { key: 'new', text: 'New (Create)' },
                    { key: 'edit', text: 'Edit (Update)' },
                    { key: 'view', text: 'View (Read-only)' },
                  ]}
                  styles={{ root: { width: 200 } }}
                />

                {(formMode === 'edit' || formMode === 'view') && (
                  <TextField
                    label="Item ID"
                    placeholder="Enter item ID"
                    value={itemId}
                    onChange={(_, newValue) => setItemId(newValue || '')}
                    type="number"
                    min={1}
                    styles={{ root: { width: 150 } }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <DefaultButton
                    text={isPreparingSampleItem ? 'Preparing sample item...' : 'Use Sample Item'}
                    iconProps={{ iconName: 'TestBeaker' }}
                    onClick={() => {
                      useSampleItem().catch(() => undefined);
                    }}
                    disabled={isPreparingSampleItem}
                    style={{ marginRight: '8px' }}
                  />
                  <DefaultButton
                    text="Configuration Panel"
                    iconProps={{ iconName: 'Settings' }}
                    onClick={() => setShowConfigPanel(true)}
                  />
                </div>
              </Stack>

              {/* Demo Form */}
              {sampleItemId && (
                <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginBottom: '16px' } }}>
                  Sample item <strong>{sampleItemId}</strong> is available for edit/view testing.
                </MessageBar>
              )}
              <div style={{
                padding: '24px',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                maxHeight: '700px',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}>
                {(formMode === 'edit' || formMode === 'view') && !itemId ? (
                  <MessageBar messageBarType={MessageBarType.info}>
                    <strong>Item ID Required:</strong> Please enter an item ID to {formMode} the form.
                  </MessageBar>
                ) : (
                  <DynamicFormWrapper
                    listId={LIST_TITLE}
                    mode={formMode}
                    itemId={(formMode === 'edit' || formMode === 'view') && itemId ? parseInt(itemId, 10) : undefined}
                    sections={sections}
                    fieldOrder={fieldOrder}
                    excludeFields={excludeFields}
                    fieldOverrides={fieldOverrides}
                    useContentTypeOrder={useContentTypeOrder}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    onError={handleError}
                  />
                )}
              </div>

              {/* Current Configuration Code */}
              <div style={{ marginTop: '24px' }}>
                <Label>Current Configuration</Label>
                <pre style={{
                  padding: '16px',
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '13px',
                  fontFamily: 'Consolas, Monaco, monospace',
                }}>
                  {currentConfigCode}
                </pre>
              </div>
            </>
          )}
        </Content>
      </Card>

      {/* Configuration Panel */}
      <Panel
        isOpen={showConfigPanel}
        onDismiss={() => setShowConfigPanel(false)}
        type={PanelType.medium}
        headerText="SPDynamicForm Configuration"
        closeButtonAriaLabel="Close"
      >
        <div style={{ padding: '16px 0' }}>
          <Stack tokens={{ childrenGap: 20 }}>
            <Checkbox
              label="Use Custom Sections"
              checked={useSections}
              onChange={(_, checked) => setUseSections(!!checked)}
              styles={{ root: { fontWeight: 600 } }}
            />
            {useSections && (
              <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>
                Fields are organized into 5 collapsible sections: Basic Info, Assignment & Dates, Metrics, Classification, and Advanced.
              </MessageBar>
            )}

            <Checkbox
              label="Use Custom Field Order"
              checked={useFieldOrder}
              onChange={(_, checked) => setUseFieldOrder(!!checked)}
              styles={{ root: { fontWeight: 600 } }}
            />
            {useFieldOrder && (
              <TextField
                label="Field Order (comma-separated)"
                placeholder="Title,Status,AssignedTo,DueDate"
                value={fieldOrderInput}
                onChange={(_, newValue) => setFieldOrderInput(newValue || '')}
                multiline
                rows={3}
                description="Specify field internal names in desired order"
              />
            )}

            <Checkbox
              label="Exclude Fields"
              checked={useExcludeFields}
              onChange={(_, checked) => setUseExcludeFields(!!checked)}
              styles={{ root: { fontWeight: 600 } }}
            />
            {useExcludeFields && (
              <TextField
                label="Excluded Fields (comma-separated)"
                placeholder="RichNotes,ReferenceLink,IsHighPriority"
                value={excludeFieldsInput}
                onChange={(_, newValue) => setExcludeFieldsInput(newValue || '')}
                multiline
                rows={3}
                description="Fields to hide from the form"
              />
            )}

            <Checkbox
              label="Use Field Overrides"
              checked={useFieldOverrides}
              onChange={(_, checked) => setUseFieldOverrides(!!checked)}
              styles={{ root: { fontWeight: 600 } }}
            />
            {useFieldOverrides && (
              <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>
                Overrides applied: Custom labels for Title, Description, and default value for Priority.
              </MessageBar>
            )}

            <div>
              <Checkbox
                label="Use Content Type Field Order"
                checked={useContentTypeOrder}
                onChange={(_, checked) => setUseContentTypeOrder(!!checked)}
                styles={{ root: { fontWeight: 600 } }}
              />
              <div style={{ marginLeft: '28px', marginTop: '4px', fontSize: '12px', color: '#605e5c' }}>
                Use field order from content type instead of default alphabetical
              </div>
            </div>

            <MessageBar messageBarType={MessageBarType.success}>
              <strong>Pro Tip:</strong> Try combining sections with field overrides for a highly customized form experience!
            </MessageBar>
          </Stack>
        </div>
      </Panel>

      <ShowcaseKeyFeatures features={features} />

      {/* Code Samples */}
      <ShowcaseCodeSample
        id="basic-usage"
        title="Basic Usage"
        description="Simplest way to create a form - just provide a list ID and mode"
        code={`import { SPDynamicForm } from 'spfx-toolkit/components/SPDynamicForm';

<SPDynamicForm
  listId="${LIST_TITLE}"
  mode="new"
  onSubmit={async (result) => {
    const savedItem = await result.updater.save();
    console.log('Saved:', savedItem);
  }}
/>`}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="custom-sections"
        title="Custom Sections & Headers"
        description="Organize fields into collapsible sections with custom titles and descriptions"
        code={`const customSections: ISectionConfig[] = [
  {
    name: 'basic-info',
    title: 'Basic Information',
    description: 'Core details about the task',
    fields: ['Title', 'Description', 'Status', 'Priority'],
    defaultExpanded: true,
    collapsible: true,
  },
  {
    name: 'assignment',
    title: 'Assignment & Dates',
    description: 'Who and when',
    fields: ['AssignedTo', 'StartDate', 'DueDate'],
    defaultExpanded: true,
    collapsible: true,
  },
];

<SPDynamicForm
  listId="${LIST_TITLE}"
  mode="new"
  sections={customSections}
  onSubmit={handleSubmit}
/>`}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="field-configuration"
        title="Field Order & Exclusions"
        description="Control which fields appear and in what order"
        code={`<SPDynamicForm
  listId="${LIST_TITLE}"
  mode="new"
  fieldOrder={['Title', 'Status', 'AssignedTo', 'DueDate', 'Priority']}
  excludeFields={['RichNotes', 'ReferenceLink']}
  onSubmit={handleSubmit}
/>`}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="field-overrides"
        title="Field Overrides"
        description="Customize labels, descriptions, default values, and behavior of specific fields"
        code={`const fieldOverrides: IFieldOverride[] = [
  {
    fieldName: 'Title',
    label: 'Task Title',
    description: 'Enter a descriptive title for this task',
    required: true,
  },
  {
    fieldName: 'Priority',
    label: 'Priority Level',
    defaultValue: 'Medium',
  },
];

<SPDynamicForm
  listId="${LIST_TITLE}"
  mode="edit"
  itemId={123}
  fieldOverrides={fieldOverrides}
  onSubmit={handleSubmit}
/>`}
        language="tsx"
      />

      {/* Advanced Features */}
      <Card id="advanced-features" elevation={3} defaultExpanded={false} style={{ marginTop: '24px' }}>
        <Header variant="info">Advanced Features</Header>
        <Content padding="comfortable">
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Additional Capabilities</h4>

          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.95rem', color: '#495057', lineHeight: 1.8 }}>
            <li>
              <strong>Content Type Support:</strong> Automatically loads fields based on content type
            </li>
            <li>
              <strong>Field Ordering:</strong> Custom field order or use SharePoint's content type order
            </li>
            <li>
              <strong>Field Visibility Rules:</strong> Show/hide fields based on form values
            </li>
            <li>
              <strong>Custom Field Rendering:</strong> Replace default field components with custom renderers
            </li>
            <li>
              <strong>Lookup Configuration:</strong> Customize lookup field behavior (dropdown vs autocomplete)
            </li>
            <li>
              <strong>Lifecycle Hooks:</strong> onBeforeLoad, onAfterLoad, onBeforeSubmit callbacks
            </li>
            <li>
              <strong>Dirty Check:</strong> Warn users about unsaved changes when leaving the form
            </li>
            <li>
              <strong>Field Caching:</strong> Cache field metadata for improved performance
            </li>
            <li>
              <strong>Custom Buttons:</strong> Replace default Save/Cancel buttons with custom UI
            </li>
            <li>
              <strong>Error Handling:</strong> Comprehensive error callbacks for load, validation, and submit
            </li>
          </ul>

          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '16px' } }}>
            <strong>Pro Tip:</strong> Combine sections, field overrides, and custom validation for powerful,
            user-friendly forms that match your business requirements exactly.
          </MessageBar>
        </Content>
      </Card>
    </>
  );
};

export default SPDynamicFormShowcase;
