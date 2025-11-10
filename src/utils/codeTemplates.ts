/**
 * Reusable code templates for documentation and examples
 * Centralized location for all code samples used across demos
 */

/**
 * Installation instructions for spfx-toolkit
 */
export const INSTALLATION_TEMPLATE = `npm install spfx-toolkit --save`;

/**
 * Basic import template
 */
export const BASIC_IMPORT_TEMPLATE = (componentName: string, path: string = 'spfx-toolkit') => `
import { ${componentName} } from '${path}';
`.trim();

/**
 * SPContext setup template
 */
export const SP_CONTEXT_TEMPLATE = `
import { SPFI, spfi, SPFx } from "@pnp/sp";
import { WebPartContext } from "@microsoft/sp-webpart-base";

// Initialize SP context in your web part
protected onInit(): Promise<void> {
  return super.onInit().then(() => {
    this.sp = spfi().using(SPFx(this.context));
  });
}
`.trim();

/**
 * React Hook Form setup template
 */
export const REACT_HOOK_FORM_TEMPLATE = `
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define validation schema
const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email address'),
});

// Use in component
const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
`.trim();

/**
 * Card usage template
 */
export const CARD_USAGE_TEMPLATE = `
import { Card, Header, Content, Footer } from 'spfx-toolkit/lib/components/Card';

<Card id="example-card" elevation={2}>
  <Header variant="primary">Card Title</Header>
  <Content padding="comfortable">
    Card content goes here
  </Content>
  <Footer padding="compact">
    Footer content
  </Footer>
</Card>
`.trim();

/**
 * Form field template
 */
export const FORM_FIELD_TEMPLATE = `
import { FormProvider, FormItem, FormLabel, FormValue, FormError } from 'spfx-toolkit/lib/components/Form';
import { useForm } from 'react-hook-form';

const { control } = useForm();

<FormProvider control={control}>
  <FormItem name="fieldName">
    <FormLabel required>Field Label</FormLabel>
    <FormValue>
      {/* Your input component */}
    </FormValue>
    <FormError />
  </FormItem>
</FormProvider>
`.trim();

/**
 * SPField usage template
 */
export const SP_FIELD_TEMPLATE = (fieldType: string) => `
import { ${fieldType} } from 'spfx-toolkit/lib/components/SPFields';

<${fieldType}
  context={context}
  listId={listId}
  itemId={itemId}
  fieldInternalName="FieldName"
  label="Field Label"
  required={false}
  disabled={false}
  onChange={(value) => console.log(value)}
/>
`.trim();

/**
 * SPDynamicForm usage template
 */
export const SP_DYNAMIC_FORM_TEMPLATE = `
import { SPDynamicForm } from 'spfx-toolkit/lib/components/SPDynamicForm';

<SPDynamicForm
  context={context}
  listId={listId}
  itemId={itemId}
  mode="edit"
  onSave={async (data) => {
    console.log('Saved:', data);
  }}
  onCancel={() => console.log('Cancelled')}
/>
`.trim();

/**
 * ErrorBoundary usage template
 */
export const ERROR_BOUNDARY_TEMPLATE = `
import { ErrorBoundary } from 'spfx-toolkit/lib/components/ErrorBoundary';

<ErrorBoundary
  fallback={(error, errorInfo, retry) => (
    <div>
      <h3>Something went wrong</h3>
      <button onClick={retry}>Try Again</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
`.trim();

/**
 * Custom hook usage template
 */
export const CUSTOM_HOOK_TEMPLATE = (hookName: string, example: string) => `
import { ${hookName} } from 'spfx-toolkit/lib/hooks';

${example}
`.trim();

/**
 * useLocalStorage hook template
 */
export const USE_LOCAL_STORAGE_TEMPLATE = `
import { useLocalStorage } from 'spfx-toolkit/lib/hooks';

const [value, setValue] = useLocalStorage('key', 'defaultValue');

// Read value
console.log(value);

// Update value
setValue('newValue');
`.trim();

/**
 * useViewport hook template
 */
export const USE_VIEWPORT_TEMPLATE = `
import { useViewport } from 'spfx-toolkit/lib/hooks';

const { width, height, isMobile, isTablet, isDesktop } = useViewport();

console.log('Viewport:', { width, height });
console.log('Is Mobile:', isMobile);
`.trim();

/**
 * WorkflowStepper usage template
 */
export const WORKFLOW_STEPPER_TEMPLATE = `
import { WorkflowStepper, StepData } from 'spfx-toolkit/lib/components/WorkflowStepper';

const steps: StepData[] = [
  { id: 'step1', title: 'Step 1', status: 'completed' },
  { id: 'step2', title: 'Step 2', status: 'current' },
  { id: 'step3', title: 'Step 3', status: 'pending' },
];

<WorkflowStepper
  steps={steps}
  orientation="horizontal"
  onStepClick={(step) => console.log('Clicked:', step.title)}
/>
`.trim();

/**
 * GroupUserPicker usage template
 */
export const GROUP_USER_PICKER_TEMPLATE = `
import { GroupUserPicker } from 'spfx-toolkit/lib/components/GroupUserPicker';

<GroupUserPicker
  context={context}
  groupId={groupId}
  multiSelect={true}
  onChange={(users) => console.log('Selected users:', users)}
/>
`.trim();

/**
 * DocumentLink usage template
 */
export const DOCUMENT_LINK_TEMPLATE = `
import { DocumentLink } from 'spfx-toolkit/lib/components/DocumentLink';

<DocumentLink
  context={context}
  documentUrl={documentUrl}
  layout="card"
  size="medium"
  showPreview={true}
/>
`.trim();

/**
 * ManageAccess usage template
 */
export const MANAGE_ACCESS_TEMPLATE = `
import { ManageAccessComponent } from 'spfx-toolkit/lib/components/ManageAccess';

<ManageAccessComponent
  context={context}
  listId={listId}
  itemId={itemId}
  onPermissionsChanged={() => console.log('Permissions updated')}
/>
`.trim();

/**
 * VersionHistory usage template
 */
export const VERSION_HISTORY_TEMPLATE = `
import { VersionHistory } from 'spfx-toolkit/lib/components/VersionHistory';

<VersionHistory
  context={context}
  listId={listId}
  itemId={itemId}
  maxVersions={10}
/>
`.trim();

/**
 * Get template by component name
 */
export function getTemplateByName(name: string): string {
  const templates: { [key: string]: string } = {
    installation: INSTALLATION_TEMPLATE,
    spContext: SP_CONTEXT_TEMPLATE,
    reactHookForm: REACT_HOOK_FORM_TEMPLATE,
    card: CARD_USAGE_TEMPLATE,
    formField: FORM_FIELD_TEMPLATE,
    spDynamicForm: SP_DYNAMIC_FORM_TEMPLATE,
    errorBoundary: ERROR_BOUNDARY_TEMPLATE,
    useLocalStorage: USE_LOCAL_STORAGE_TEMPLATE,
    useViewport: USE_VIEWPORT_TEMPLATE,
    workflowStepper: WORKFLOW_STEPPER_TEMPLATE,
    groupUserPicker: GROUP_USER_PICKER_TEMPLATE,
    documentLink: DOCUMENT_LINK_TEMPLATE,
    manageAccess: MANAGE_ACCESS_TEMPLATE,
    versionHistory: VERSION_HISTORY_TEMPLATE,
  };

  return templates[name] || '';
}

export default {
  INSTALLATION_TEMPLATE,
  BASIC_IMPORT_TEMPLATE,
  SP_CONTEXT_TEMPLATE,
  REACT_HOOK_FORM_TEMPLATE,
  CARD_USAGE_TEMPLATE,
  FORM_FIELD_TEMPLATE,
  SP_FIELD_TEMPLATE,
  SP_DYNAMIC_FORM_TEMPLATE,
  ERROR_BOUNDARY_TEMPLATE,
  CUSTOM_HOOK_TEMPLATE,
  USE_LOCAL_STORAGE_TEMPLATE,
  USE_VIEWPORT_TEMPLATE,
  WORKFLOW_STEPPER_TEMPLATE,
  GROUP_USER_PICKER_TEMPLATE,
  DOCUMENT_LINK_TEMPLATE,
  MANAGE_ACCESS_TEMPLATE,
  VERSION_HISTORY_TEMPLATE,
  getTemplateByName,
};
