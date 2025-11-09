import { MessageBar, MessageBarType, Dropdown, IDropdownOption, TextField } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Content, Header } from 'spfx-toolkit/lib/components/Card';
import type { IFormSubmitResult } from 'spfx-toolkit/lib/components/SPDynamicForm';
import { SPDynamicForm } from 'spfx-toolkit/lib/components/SPDynamicForm';
import { ShowcaseCodeSample } from './ShowcaseCodeSample';
import { ShowcaseHero } from './ShowcaseHero';
import type { ShowcaseFeature } from './ShowcaseKeyFeatures';
import { ShowcaseKeyFeatures } from './ShowcaseKeyFeatures';
import SPService from '@pnp/spfx-controls-react/lib/services/SPService';
import { LibsOrderBy } from '@pnp/spfx-controls-react/lib/services/ISPService';
import { ISPList } from '@pnp/spfx-controls-react/lib/common/SPEntities';

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

// These are examples used in code samples below - not used in the actual form
const exampleCustomSections = `const customSections: ISectionConfig[] = [
  {
    name: 'basic-info',
    title: 'Basic Information',
    description: 'Core details about the item',
    fields: ['Title', 'Description'],
    defaultExpanded: true,
    collapsible: true,
  },
  {
    name: 'details',
    title: 'Additional Details',
    description: 'Extended information and metadata',
    fields: ['Status', 'Priority', 'Category'],
    defaultExpanded: false,
    collapsible: true,
  },
];`;

const exampleFieldOverrides = `const fieldOverrides: IFieldOverride[] = [
  {
    fieldName: 'Title',
    label: 'Item Title',
    description: 'Enter a descriptive title for this item',
    required: true,
  },
  {
    fieldName: 'Description',
    label: 'Detailed Description',
    description: 'Provide comprehensive details about this item',
  },
  {
    fieldName: 'Priority',
    label: 'Priority Level',
    defaultValue: 'Medium',
  },
];`;

export interface ISPDynamicFormShowcaseProps {
  context?: WebPartContext;
}

// Memoized wrapper to prevent unnecessary re-renders of SPDynamicForm
interface IDynamicFormWrapperProps {
  listId: string;
  mode: 'new' | 'edit' | 'view';
  itemId?: number;
  onSubmit: (result: IFormSubmitResult) => Promise<void>;
  onCancel: () => void;
  onError: (error: Error, context: string) => void;
}

const DynamicFormWrapper: React.FC<IDynamicFormWrapperProps> = React.memo(({
  listId,
  mode,
  itemId,
  onSubmit,
  onCancel,
  onError
}) => {
  console.log('DynamicFormWrapper rendering for list:', listId, 'mode:', mode, 'itemId:', itemId);

  return (
    <SPDynamicForm
      listId={listId}
      mode={mode}
      itemId={itemId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onError={onError}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific props change
  return (
    prevProps.listId === nextProps.listId &&
    prevProps.mode === nextProps.mode &&
    prevProps.itemId === nextProps.itemId
  );
});

DynamicFormWrapper.displayName = 'DynamicFormWrapper';

export const SPDynamicFormShowcase: React.FC<ISPDynamicFormShowcaseProps> = ({ context }) => {
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>('new');
  const [lists, setLists] = useState<ISPList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lists from current site using SPService
  useEffect(() => {
    if (!context) {
      return;
    }

    const fetchLists = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const spService = new SPService(context);
        const result = await spService.getLibs({
          orderBy: LibsOrderBy.Title,
          includeHidden: false,
        });

        setLists(result.value);
      } catch (err: any) {
        console.error('Error fetching lists:', err);
        setError(err.message || 'Failed to fetch lists');
      } finally {
        setLoading(false);
      }
    };

    fetchLists().catch(console.error);
  }, [context]);

  // List dropdown options
  const listOptions: IDropdownOption[] = useMemo(() => {
    return lists.map(list => ({
      key: list.Id,
      text: list.Title,
    }));
  }, [lists]);

  const handleSubmit = useCallback(async (result: IFormSubmitResult): Promise<void> => {
    console.log('Form submitted:', result);

    try {
      if (result.hasChanges) {
        const updates = result.updater.getUpdates();
        console.log('Updates to apply:', updates);

        // Handle attachments if any
        if (result.attachments.filesToAdd.length > 0) {
          console.log('Files to add:', result.attachments.filesToAdd);
        }
        if (result.attachments.filesToDelete.length > 0) {
          console.log('Files to delete:', result.attachments.filesToDelete);
        }

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
      console.error('Error saving form:', error);
      setSubmitResult(`Error: ${error.message}`);
    }
  }, []);

  const handleCancel = useCallback(() => {
    console.log('Form cancelled');
    setSubmitResult('Form cancelled by user');
  }, []);

  const handleError = useCallback((error: Error, errorContext: string) => {
    console.error(`SPDynamicForm Error in ${errorContext}:`, error);
    setSubmitResult(`Error in ${errorContext}: ${error.message}`);
  }, []);

  const basicUsageCode = `import { SPDynamicForm } from 'spfx-toolkit/lib/components/SPDynamicForm';

// Basic usage - automatically generates form from list schema
<SPDynamicForm
  listId="your-list-id"
  mode="new"
  onSubmit={async (result) => {
    const savedItem = await result.updater.save();
    console.log('Saved:', savedItem);
  }}
/>`;

  const sectionsCode = `${exampleCustomSections}

<SPDynamicForm
  listId="your-list-id"
  mode="new"
  sections={customSections}
  onSubmit={handleSubmit}
/>`;

  const fieldOverridesCode = `${exampleFieldOverrides}

<SPDynamicForm
  listId="your-list-id"
  mode="edit"
  itemId={123}
  fieldOverrides={fieldOverrides}
  onSubmit={handleSubmit}
/>`;

  const validationCode = `// Custom validation
<SPDynamicForm
  listId="your-list-id"
  mode="new"
  customValidation={(data) => {
    const errors: Record<string, string> = {};

    if (data.StartDate && data.DueDate) {
      if (data.StartDate > data.DueDate) {
        errors.DueDate = 'Due date must be after start date';
      }
    }

    return errors;
  }}
  validationMode="onChange"
  scrollToError={true}
  onSubmit={handleSubmit}
/>`;

  const attachmentsCode = `// Enable attachments
<SPDynamicForm
  listId="your-list-id"
  mode="new"
  showAttachments={true}
  attachmentPosition="bottom"
  maxAttachmentSize={10485760} // 10MB
  allowedFileTypes={['.pdf', '.docx', '.xlsx', '.png', '.jpg']}
  onSubmit={async (result) => {
    // Attachments are automatically included in result
    const { filesToAdd, filesToDelete } = result.attachments;
    console.log('Attachments:', { filesToAdd, filesToDelete });

    await result.updater.save();
  }}
/>`;

  return (
    <>
      <ShowcaseHero
        title="SPDynamicForm"
        subtitle="Auto-generate complete SharePoint forms from list schema - with sections, validation, attachments, and custom field rendering"
        gradient="linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)"
        icon="📝"
        badges={['Auto-Generated', 'Sections', 'Validation', 'Attachments', 'SharePoint Integration']}
      />

      <ShowcaseKeyFeatures features={features} />

      {/* Interactive Demo */}
      <Card id="interactive-demo" elevation={3} defaultExpanded={true} style={{ marginTop: '24px' }}>
        <Header variant="info">Interactive Demo</Header>
        <Content padding="comfortable">
          <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#495057' }}>
            Configure the form options and see how SPDynamicForm adapts:
          </p>

          {/* Demo Controls */}
          <div style={{ marginBottom: '24px', maxWidth: '300px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Form Mode
            </label>
            <select
              value={formMode}
              onChange={(e) => setFormMode(e.target.value as 'new' | 'edit' | 'view')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                fontSize: '0.9rem',
              }}
            >
              <option value="new">New (Create)</option>
              <option value="edit">Edit (Update)</option>
              <option value="view">View (Read-only)</option>
            </select>
          </div>

          {/* List Selection */}
          {context && (
            <div style={{ marginBottom: '24px' }}>
              <Dropdown
                label="Select SharePoint List"
                placeholder="Choose a list to generate form"
                options={listOptions}
                selectedKey={selectedListId}
                onChange={(_, option) => {
                  setSelectedListId(option?.key as string);
                  setSubmitResult(null);
                }}
                disabled={loading}
                styles={{ root: { maxWidth: '400px' } }}
              />
              {error && (
                <MessageBar
                  messageBarType={MessageBarType.error}
                  styles={{ root: { marginTop: '12px' } }}
                >
                  {error}
                </MessageBar>
              )}
            </div>
          )}

          {/* Item ID for Edit/View mode */}
          {(formMode === 'edit' || formMode === 'view') && selectedListId && (
            <div style={{ marginBottom: '24px' }}>
              <TextField
                label="Item ID"
                placeholder="Enter item ID (e.g., 1, 2, 3)"
                value={itemId}
                onChange={(_, newValue) => setItemId(newValue || '')}
                type="number"
                min={1}
                styles={{ root: { maxWidth: '200px' } }}
              />
            </div>
          )}

          {submitResult && (
            <MessageBar
              messageBarType={submitResult.includes('Error') ? MessageBarType.error : MessageBarType.success}
              onDismiss={() => setSubmitResult(null)}
              styles={{ root: { marginBottom: '16px' } }}
            >
              {submitResult}
            </MessageBar>
          )}

          {/* Demo Form */}
          <div style={{
            padding: '24px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            {!context ? (
              <MessageBar messageBarType={MessageBarType.warning}>
                <strong>Context Required:</strong> SharePoint context is needed to display forms. Please ensure the web part is loaded in SharePoint.
              </MessageBar>
            ) : !selectedListId ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                  Select a List
                </div>
                <div style={{ fontSize: '14px' }}>
                  Choose a SharePoint list from the dropdown above to generate and view the form
                </div>
              </div>
            ) : (formMode === 'edit' || formMode === 'view') && !itemId ? (
              <MessageBar messageBarType={MessageBarType.info}>
                <strong>Item ID Required:</strong> Please enter an item ID to {formMode} the form.
              </MessageBar>
            ) : (
              <DynamicFormWrapper
                listId={selectedListId}
                mode={formMode}
                itemId={(formMode === 'edit' || formMode === 'view') && itemId ? parseInt(itemId, 10) : undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onError={handleError}
              />
            )}
          </div>
        </Content>
      </Card>

      {/* Basic Usage */}
      <ShowcaseCodeSample
        id="basic-usage"
        title="Basic Usage"
        description="Simplest way to create a form - just provide a list ID and mode"
        code={basicUsageCode}
        language="tsx"
      />

      {/* Custom Sections */}
      <ShowcaseCodeSample
        id="custom-sections"
        title="Custom Sections & Headers"
        description="Organize fields into collapsible sections with custom titles and descriptions"
        code={sectionsCode}
        language="tsx"
      />

      {/* Field Overrides */}
      <ShowcaseCodeSample
        id="field-overrides"
        title="Field Overrides"
        description="Customize labels, descriptions, default values, and behavior of specific fields"
        code={fieldOverridesCode}
        language="tsx"
      />

      {/* Custom Validation */}
      <ShowcaseCodeSample
        id="custom-validation"
        title="Custom Validation"
        description="Add custom validation rules beyond SharePoint's built-in field validation"
        code={validationCode}
        language="tsx"
      />

      {/* Attachments */}
      <ShowcaseCodeSample
        id="attachments"
        title="Attachment Support"
        description="Enable file attachments with size limits and file type restrictions"
        code={attachmentsCode}
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
