import { DefaultButton, MessageBar, MessageBarType, PrimaryButton, Toggle } from '@fluentui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { IPeoplePickerContext } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import * as React from 'react';
import { CSSProperties, useCallback, useMemo, useState } from 'react';
import {
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form';
import { create } from 'zustand';
import { Card, Content, Header } from 'spfx-toolkit/components/Card';
import {
  DevExtremeCheckBox,
  DevExtremeDateBox,
  DevExtremeNumberBox,
  DevExtremeSelectBox,
  DevExtremeSwitch,
  DevExtremeTagBox,
  DevExtremeTextArea,
  DevExtremeTextBox,
  FormContainer,
  FormDescription,
  FormError,
  FormErrorSummary,
  FormItem,
  FormLabel,
  FormProvider,
  FormValue,
  PnPPeoplePicker,
  useScrollToError,
  useZustandFormSync,
} from 'spfx-toolkit/components/spForm';
import { SPContext } from 'spfx-toolkit/utilities/context';
import { z } from 'zod';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import type { ShowcaseFeature } from '../shared/ShowcaseKeyFeatures';
import { ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';

const employmentTypes = [
  { key: 'hybrid', text: 'Hybrid (2-3 days onsite)' },
  { key: 'remote', text: 'Remote friendly' },
  { key: 'onsite', text: 'Onsite only' },
];

const departments = [
  { key: 'modern-work', text: 'Modern Work' },
  { key: 'security', text: 'Security' },
  { key: 'infrastructure', text: 'Infrastructure' },
  { key: 'apps', text: 'Business Apps' },
  { key: 'adoption', text: 'Adoption & Change' },
];

const skills = [
  { id: 'spfx', label: 'SPFx' },
  { id: 'pnp', label: 'PnP / CLI' },
  { id: 'react', label: 'React' },
  { id: 'devextreme', label: 'DevExtreme' },
  { id: 'governance', label: 'Governance' },
  { id: 'automation', label: 'Automation' },
];

const personSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    text: z.string().optional(),
    secondaryText: z.string().optional(),
  })
  .passthrough();

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Provide a valid work email'),
  username: z
    .string()
    .min(3, 'Username must contain at least 3 characters')
    .regex(/^[a-z0-9.]+$/i, 'Use letters, numbers, or periods'),
  department: z.string().min(1, 'Choose a department'),
  employmentType: z.string().min(1, 'Select how this role works'),
  startDate: z
    .date()
    .optional()
    .refine(date => date !== undefined, 'Select a start date'),
  salary: z
    .number()
    .optional()
    .refine(val => val !== undefined, 'Provide an annual salary')
    .refine(val => val !== undefined && val >= 0, 'Salary must be zero or higher')
    .refine(val => val !== undefined && val <= 500000, 'Salary should be under 500,000'),
  skills: z
    .array(z.string())
    .min(1, 'Tag at least one capability')
    .max(5, 'Keep the list focused (5 skills max)'),
  approvers: z
    .array(personSchema)
    .min(1, 'Pick at least one approver')
    .max(3, 'Keep the approval chain lean'),
  notifications: z.boolean(),
  darkMode: z.boolean(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Accept the compliance statement',
  }),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters'),
});

type FormData = z.infer<typeof formSchema>;

const FORM_USAGE_SAMPLE = `import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormContainer, FormItem, FormLabel, FormValue, FormError,
  DevExtremeTextBox, DevExtremeSelectBox, PrimaryButton,
} from 'spfx-toolkit/components/spForm';

const schema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  owner: z.string().min(1, 'Select a project owner'),
  priority: z.string().min(1, 'Select priority level'),
  description: z.string().optional(),
});

type ProjectForm = z.infer<typeof schema>;

export const SimpleProjectForm: React.FC = () => {
  const form = useForm<ProjectForm>({
    resolver: zodResolver(schema),
    defaultValues: { projectName: '', owner: '', priority: '', description: '' },
  });

  const onSubmit = (data: ProjectForm) => {
    console.log('Form submitted:', data);
  };

  return (
    <FormProvider {...form}>
      <FormContainer labelWidth="160px">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel isRequired>Project name</FormLabel>
            <FormValue>
              <DevExtremeTextBox
                name="projectName"
                control={form.control}
                placeholder="Enter project name"
              />
              <FormError error={form.formState.errors.projectName?.message} showIcon />
            </FormValue>
          </FormItem>

          <FormItem>
            <FormLabel isRequired>Owner</FormLabel>
            <FormValue>
              <DevExtremeSelectBox
                name="owner"
                control={form.control}
                items={['Amanda Torres', 'Lee Chen', 'Megan Bowen']}
                placeholder="Select project owner"
              />
              <FormError error={form.formState.errors.owner?.message} showIcon />
            </FormValue>
          </FormItem>

          <FormItem>
            <FormLabel isRequired>Priority</FormLabel>
            <FormValue>
              <DevExtremeSelectBox
                name="priority"
                control={form.control}
                items={['Low', 'Medium', 'High', 'Critical']}
                placeholder="Select priority"
              />
              <FormError error={form.formState.errors.priority?.message} showIcon />
            </FormValue>
          </FormItem>

          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormValue>
              <DevExtremeTextBox
                name="description"
                control={form.control}
                placeholder="Optional project description"
              />
              <FormError error={form.formState.errors.description?.message} showIcon />
            </FormValue>
          </FormItem>

          <div style={{ marginTop: '24px' }}>
            <PrimaryButton
              type="submit"
              text={form.formState.isSubmitting ? 'Creating...' : 'Create Project'}
              disabled={form.formState.isSubmitting}
            />
          </div>
        </form>
      </FormContainer>
    </FormProvider>
  );
};`;

const FORM_ERROR_SUMMARY_SAMPLE = `import { FormProvider, FormErrorSummary, FormError, useScrollToError } from 'spfx-toolkit/components/spForm';

export const FormWithErrorHandling: React.FC = () => {
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
  });

  // Auto-scroll to first error on validation
  useScrollToError(formState, {
    behavior: 'smooth',
    block: 'center',
    focusAfterScroll: true,
  });

  return (
    <FormProvider control={control}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Centralized error summary with click-to-navigate */}
        <FormErrorSummary
          position="sticky"
          clickToScroll
          showFieldLabels
          maxErrors={10}
        />

        {/* Form fields with manual error display */}
        <FormItem fieldName="email" section="contact">
          <FormLabel isRequired htmlFor="email">Email</FormLabel>
          <FormValue>
            <DevExtremeTextBox name="email" control={control} />
            {/* Manual inline error - use either this OR autoShowErrors on FormProvider */}
            <FormError error={formState.errors.email?.message} showIcon />
          </FormValue>
        </FormItem>

        {/* Alternative: Use autoShowErrors prop on FormProvider to automatically
             show errors without manual FormError components
        <FormProvider control={control} autoShowErrors>
          <FormItem fieldName="email" section="contact">
            <FormLabel isRequired htmlFor="email">Email</FormLabel>
            <FormValue>
              <DevExtremeTextBox name="email" control={control} />
              {/* No FormError needed - autoShowErrors handles it */}
            </FormValue>
          </FormItem>
        </FormProvider>
        */}
      </form>
    </FormProvider>
  );
};`;

const AUTO_SAVE_SAMPLE = `import { create } from 'zustand';
import { useZustandFormSync } from 'spfx-toolkit/components/spForm';

// Create Zustand store for draft saving
const useFormDraftStore = create((set) => ({
  draft: {},
  lastSaved: null,
  saveDraft: (data) => set({ draft: data, lastSaved: new Date() }),
  clearDraft: () => set({ draft: {}, lastSaved: null }),
}));

export const FormWithAutoSave: React.FC = () => {
  const { control, handleSubmit } = useForm();
  const { lastSaved } = useFormDraftStore();

  // Auto-save form data with debouncing
  useZustandFormSync(control, useFormDraftStore, {
    debounceMs: 500,
    enabled: true,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {lastSaved && (
        <MessageBar>
          Last saved: {lastSaved.toLocaleTimeString()}
        </MessageBar>
      )}
      {/* Form fields */}
    </form>
  );
};`;

// Zustand store for form draft auto-save
interface FormDraftStore {
  draft: Partial<FormData>;
  saveDraft: (data: Partial<FormData>) => void;
  clearDraft: () => void;
  lastSaved: Date | null;
}

const useFormDraftStore = create<FormDraftStore>((set) => ({
  draft: {},
  lastSaved: null,
  saveDraft: (data) => set({ draft: data, lastSaved: new Date() }),
  clearDraft: () => set({ draft: {}, lastSaved: null }),
}));

const FORM_FEATURES: ShowcaseFeature[] = [
  {
    icon: '✅',
    title: 'Zod + React Hook Form',
    description:
      'Type-safe validation with instant feedback, custom error summaries, and focus management.',
    color: '#2563eb',
  },
  {
    icon: '🧰',
    title: 'DevExtreme Controls',
    description:
      'Text, number, date, tag pickers, switches, and checkboxes render with native validation styles.',
    color: '#f59e0b',
  },
  {
    icon: '👥',
    title: 'PnP People Picker',
    description:
      'React-hook-form ready wrapper that honors SPFx context and ensures async updates.',
    color: '#10b981',
  },
  {
    icon: '📱',
    title: 'Responsive Layout',
    description:
      'Form items snap from side-by-side labels to stacked layout automatically with CSS variables.',
    color: '#9333ea',
  },
  {
    icon: '🚨',
    title: 'FormErrorSummary',
    description:
      'Centralized error panel with click-to-navigate functionality and accessibility support.',
    color: '#dc2626',
  },
  {
    icon: '🎯',
    title: 'Auto-scroll to Errors',
    description:
      'useScrollToError hook automatically scrolls to the first validation error with smooth animations.',
    color: '#8b5cf6',
  },
  {
    icon: '💾',
    title: 'Auto-save with Zustand',
    description:
      'useZustandFormSync enables automatic draft saving with debounced updates and field selection.',
    color: '#059669',
  },
  {
    icon: '♿',
    title: 'WCAG 2.1 AA Compliant',
    description:
      'Full accessibility with ARIA attributes, screen reader support, and keyboard navigation.',
    color: '#0891b2',
  },
];

const FORM_BADGES = ['React Hook Form', 'DevExtreme ready', 'PnP integration'];

const showcaseContainerStyle: CSSProperties = {
  padding: '24px',
  maxWidth: '1400px',
  margin: '0 auto',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
  backgroundColor: '#fafafa',
  minHeight: '100vh',
};

const statusBadge = (label: string, value: string, accent: string): JSX.Element => (
  <div
    key={label}
    style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 16px',
      borderRadius: '10px',
      background: `${accent}15`,
      border: `1px solid ${accent}40`,
      minWidth: '160px',
    }}
  >
    <span style={{ fontSize: '12px', textTransform: 'uppercase', color: accent, fontWeight: 600 }}>
      {label}
    </span>
    <span style={{ fontSize: '18px', fontWeight: 600, color: '#1d1d1f' }}>{value}</span>
  </div>
);

const getPeoplePickerContext = (): IPeoplePickerContext | undefined => {
  try {
    return SPContext.peoplepickerContext;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('PeoplePicker context is unavailable in this environment.', error);
    return undefined;
  }
};

/**
 * Complete demo for the spForm system showcasing Zod validation and dynamic layouts.
 */
export const FormShowcaseComplete: React.FC = () => {
  const peoplePickerContext = useMemo(() => getPeoplePickerContext(), []);
  const [labelPosition, setLabelPosition] = useState<'left' | 'top'>('left');
  const [compactMode, setCompactMode] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [enableAutoSave, setEnableAutoSave] = useState(true);
  const [enableAutoScroll, setEnableAutoScroll] = useState(true);

  const { lastSaved, clearDraft } = useFormDraftStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit', // Validate only on submit (first time)
    reValidateMode: 'onBlur', // After first submit, validate on blur
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      department: '',
      employmentType: '',
      startDate: undefined,
      salary: undefined,
      skills: [],
      approvers: [],
      notifications: true,
      darkMode: false,
      acceptTerms: false,
      notes: '',
    },
  });

  const { control, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting, isSubmitSuccessful, submitCount, dirtyFields } = formState;

  const watchedValues = useWatch({ control });

  // Auto-scroll to first error on validation
  if (enableAutoScroll) {
    useScrollToError(formState as any, {
      behavior: 'smooth',
      block: 'center',
      focusAfterScroll: true,
    });
  }

  // Auto-save form data to Zustand store
  if (enableAutoSave) {
    useZustandFormSync(control as any, useFormDraftStore, {
      debounceMs: 500,
    });
  }

  const onSubmit = useCallback<SubmitHandler<FormData>>((data: FormData) => {
    setSubmittedData(data);
    setShowSummary(true);
  }, []);

  const onInvalid = useCallback<SubmitErrorHandler<FormData>>(() => {
    setSubmittedData(null);
    setShowSummary(true);
  }, []);

  const handleReset = useCallback(() => {
    reset();
    setSubmittedData(null);
    setShowSummary(false);
    clearDraft();
  }, [reset, clearDraft]);

  const containerStyle = useMemo(() => {
    const style: CSSProperties & Record<string, string> = { marginTop: '16px' };
    if (compactMode) {
      style['--label-gap'] = '10px';
    }
    return style;
  }, [compactMode]);

  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);
  const dirtyCount = useMemo(() => Object.keys(dirtyFields).length, [dirtyFields]);

  return (
    <div style={showcaseContainerStyle}>
      <ShowcaseHero
        title='Unified SPFx Form System'
        subtitle='Compose enterprise-ready forms with DevExtreme inputs, PnP controls, and Zod-powered validation in just a few lines.'
        gradient='linear-gradient(135deg, #0ea5e9 0%, #6366f1 35%, #9333ea 100%)'
        badges={FORM_BADGES}
        icon='🧾'
      />
      <Card id='form-controls' elevation={2} defaultExpanded style={{ marginBottom: '24px' }}>
        <Header variant='info'>Playground Controls</Header>
        <Content padding='comfortable'>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <Toggle
              inlineLabel
              label='Stack labels on top'
              checked={labelPosition === 'top'}
              onChange={(_, checked) => setLabelPosition(checked ? 'top' : 'left')}
            />
            <Toggle
              inlineLabel
              label='Compact spacing'
              checked={compactMode}
              onChange={(_, checked) => setCompactMode(!!checked)}
            />
            <Toggle
              inlineLabel
              label='Show error summary'
              checked={showSummary}
              onChange={(_, checked) => setShowSummary(!!checked)}
            />
            <Toggle
              inlineLabel
              label='Enable auto-save (Zustand)'
              checked={enableAutoSave}
              onChange={(_, checked) => setEnableAutoSave(!!checked)}
            />
            <Toggle
              inlineLabel
              label='Auto-scroll to errors'
              checked={enableAutoScroll}
              onChange={(_, checked) => setEnableAutoScroll(!!checked)}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            {statusBadge('Errors', errorCount.toString(), '#dc2626')}
            {statusBadge('Dirty fields', dirtyCount.toString(), '#2563eb')}
            {statusBadge('Submit attempts', submitCount.toString(), '#9333ea')}
            {statusBadge('Last submit', isSubmitSuccessful ? 'Success' : 'Pending', '#16a34a')}
            {lastSaved &&
              statusBadge(
                'Last auto-saved',
                lastSaved.toLocaleTimeString(),
                '#059669'
              )}
          </div>
        </Content>
      </Card>

      <Card id='form-showcase' elevation={3} defaultExpanded>
        <Header variant='success'>Employee Onboarding Request</Header>
        <Content padding='comfortable'>
          <FormProvider control={control as any}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
              {showSummary && (
                <FormErrorSummary
                  position='sticky'
                  clickToScroll
                  showFieldLabels
                  maxErrors={10}
                />
              )}

              <FormContainer
                labelWidth={
                  labelPosition === 'left' ? (compactMode ? '130px' : '160px') : undefined
                }
                style={containerStyle}
                className={labelPosition === 'top' ? 'form-showcase-top-labels' : undefined}
              >
                <div
                  className='form-row'
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <FormItem labelPosition={labelPosition} fieldName='firstName' section='personal'>
                    <FormLabel isRequired htmlFor='firstName' infoText='Used across welcome emails and badges'>
                      First name
                    </FormLabel>
                    <FormValue>
                      <DevExtremeTextBox name='firstName' control={control} placeholder='Megan' />
                      <FormError error={errors.firstName?.message} showIcon />
                    </FormValue>
                  </FormItem>
                  <FormItem labelPosition={labelPosition} fieldName='lastName' section='personal'>
                    <FormLabel isRequired htmlFor='lastName'>Last name</FormLabel>
                    <FormValue>
                      <DevExtremeTextBox name='lastName' control={control} placeholder='Bowen' />
                      <FormError error={errors.lastName?.message} showIcon />
                    </FormValue>
                  </FormItem>
                  <FormItem labelPosition={labelPosition} fieldName='email' section='personal'>
                    <FormLabel isRequired htmlFor='email'>Email</FormLabel>
                    <FormValue>
                      <DevExtremeTextBox
                        name='email'
                        control={control}
                        placeholder='megan.bowen@contoso.com'
                        mode='email'
                      />
                      <FormDescription>Automatically lowercased before submission</FormDescription>
                      <FormError error={errors.email?.message} showIcon />
                    </FormValue>
                  </FormItem>
                </div>

                <div
                  className='form-row'
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <FormItem labelPosition={labelPosition}>
                    <FormLabel isRequired infoText='Visible in SharePoint URLs'>
                      Profile alias
                    </FormLabel>
                    <FormValue>
                      <DevExtremeTextBox
                        name='username'
                        control={control}
                        placeholder='megan.bowen'
                      />
                      <FormError error={errors.username?.message} showIcon />
                    </FormValue>
                  </FormItem>

                  <FormItem labelPosition={labelPosition}>
                    <FormLabel isRequired>Department</FormLabel>
                    <FormValue>
                      <DevExtremeSelectBox
                        name='department'
                        control={control}
                        items={departments}
                        displayExpr='text'
                        valueExpr='key'
                        placeholder='Select a department'
                        searchEnabled
                      />
                      <FormError error={errors.department?.message} showIcon />
                    </FormValue>
                  </FormItem>

                  <FormItem labelPosition={labelPosition}>
                    <FormLabel isRequired>Work style</FormLabel>
                    <FormValue>
                      <DevExtremeSelectBox
                        name='employmentType'
                        control={control}
                        items={employmentTypes}
                        displayExpr='text'
                        valueExpr='key'
                        placeholder='Select an option'
                      />
                      <FormError error={errors.employmentType?.message} showIcon />
                    </FormValue>
                  </FormItem>
                </div>

                <div
                  className='form-row'
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <FormItem labelPosition={labelPosition}>
                    <FormLabel isRequired>Start date</FormLabel>
                    <FormValue>
                      <DevExtremeDateBox
                        name='startDate'
                        control={control}
                        displayFormat='MMMM dd, yyyy'
                        placeholder='Pick a start date'
                        min={new Date()}
                      />
                      <FormError error={errors.startDate?.message} showIcon />
                    </FormValue>
                  </FormItem>

                  <FormItem labelPosition={labelPosition}>
                    <FormLabel isRequired>Annual salary</FormLabel>
                    <FormValue>
                      <DevExtremeNumberBox
                        name='salary'
                        control={control}
                        showSpinButtons
                        step={1000}
                        format='$ #,##0'
                        min={0}
                        placeholder='65000'
                      />
                      <FormDescription>
                        Stored as a number so downstream flows can perform calculations.
                      </FormDescription>
                      <FormError error={errors.salary?.message} showIcon />
                    </FormValue>
                  </FormItem>
                </div>

                <FormItem labelPosition={labelPosition}>
                  <FormLabel isRequired infoText='Pick the skills that best match this role'>
                    Skills focus
                  </FormLabel>
                  <FormValue>
                    <DevExtremeTagBox
                      name='skills'
                      control={control}
                      items={skills}
                      displayExpr='label'
                      valueExpr='id'
                      placeholder='SharePoint, Automation, ...'
                      showSelectionControls
                      maxDisplayedTags={3}
                    />
                    <FormError error={errors.skills?.message} showIcon />
                  </FormValue>
                </FormItem>

                <FormItem labelPosition={labelPosition}>
                  <FormLabel isRequired infoText='Used to apply site permissions automatically'>
                    Approvers
                  </FormLabel>
                  <FormValue>
                    {peoplePickerContext ? (
                      <PnPPeoplePicker
                        name='approvers'
                        control={control}
                        context={peoplePickerContext}
                        titleText='Add approvers'
                        placeholder='Search for colleagues'
                        personSelectionLimit={3}
                        principalTypes={[1]}
                      />
                    ) : (
                      <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
                        People Picker context is not available in this workbench. Update the SPFx
                        context to enable this control.
                      </MessageBar>
                    )}
                    <FormError error={errors.approvers?.message} showIcon />
                  </FormValue>
                </FormItem>

                <div
                  className='form-row'
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <FormItem labelPosition={labelPosition}>
                    <FormLabel>Notifications</FormLabel>
                    <FormValue>
                      <DevExtremeSwitch name='notifications' control={control} />
                      <FormDescription>
                        Sync to Teams and Outlook to keep stakeholders informed.
                      </FormDescription>
                    </FormValue>
                  </FormItem>

                  <FormItem labelPosition={labelPosition}>
                    <FormLabel>Dark theme</FormLabel>
                    <FormValue>
                      <DevExtremeSwitch name='darkMode' control={control} />
                      <FormDescription>
                        Preview layouts in dark theme aware components.
                      </FormDescription>
                    </FormValue>
                  </FormItem>
                </div>

                <FormItem labelPosition={labelPosition}>
                  <FormLabel isRequired infoText='Required for security compliance tracking'>
                    Compliance confirmation
                  </FormLabel>
                  <FormValue>
                    <DevExtremeCheckBox
                      name='acceptTerms'
                      control={control}
                      text='I confirm that this request follows our tenant governance policy.'
                    />
                    <FormError error={errors.acceptTerms?.message} showIcon />
                  </FormValue>
                </FormItem>

                <FormItem labelPosition={labelPosition} labelWidth='140px'>
                  <FormLabel infoText='Optional context for the onboarding team'>Notes</FormLabel>
                  <FormValue>
                    <DevExtremeTextArea
                      name='notes'
                      control={control}
                      placeholder='Share additional context, links or onboarding tasks...'
                      height={120}
                    />
                    <FormError error={errors.notes?.message} showIcon />
                  </FormValue>
                </FormItem>
              </FormContainer>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <PrimaryButton
                  type='submit'
                  text={isSubmitting ? 'Submitting…' : 'Submit request'}
                  disabled={isSubmitting}
                />
                <DefaultButton text='Reset form' onClick={handleReset} disabled={isSubmitting} />
              </div>
            </form>
          </FormProvider>
        </Content>
      </Card>

      <Card id='form-output' elevation={2} defaultExpanded style={{ marginTop: '24px' }}>
        <Header variant='default'>Live form state</Header>
        <Content padding='comfortable'>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
              }}
            >
              <div style={{ marginBottom: '8px', opacity: 0.7 }}>Watched values</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {`{${Object.entries(watchedValues || {})
                  .map(([key, value]) => `\n  ${key}: ${JSON.stringify(value)}`)
                  .join('')}\n}`}
              </pre>
            </div>

            <div
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                borderRadius: '12px',
                padding: '16px',
                minHeight: '180px',
                border: '1px solid #34d399',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>
                Last submission
              </h3>
              {submittedData ? (
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(
                    {
                      ...submittedData,
                      startDate:
                        submittedData.startDate?.toISOString?.()?.split('T')[0] ||
                        submittedData.startDate,
                    },
                    null,
                    2
                  )}
                </pre>
              ) : (
                <p style={{ margin: 0 }}>
                  Submit the form to inspect the sanitized payload that flows to your APIs.
                </p>
              )}
            </div>
          </div>
        </Content>
      </Card>

      <ShowcaseKeyFeatures features={FORM_FEATURES} />

      <ShowcaseCodeSample
        id='form-code-sample'
        title='SPFx Form with Zod Validation'
        description='Drop this pattern into your SPFx solutions to create type-safe, validated forms with DevExtreme controls and responsive layouts. All form fields are automatically validated and errors are displayed inline.'
        code={FORM_USAGE_SAMPLE}
        language='tsx'
      />

      <ShowcaseCodeSample
        id='form-error-summary-sample'
        title='FormErrorSummary & Auto-Scroll'
        description='NEW: Use FormErrorSummary for centralized error display with click-to-navigate functionality, and useScrollToError for automatic scrolling to validation errors.'
        code={FORM_ERROR_SUMMARY_SAMPLE}
        language='tsx'
      />

      <ShowcaseCodeSample
        id='auto-save-sample'
        title='Auto-Save with Zustand'
        description='NEW: Implement auto-save functionality using useZustandFormSync hook with debounced updates and Zustand state management for draft persistence.'
        code={AUTO_SAVE_SAMPLE}
        language='tsx'
      />
    </div>
  );
};

export const FormShowcase = FormShowcaseComplete;

export default FormShowcaseComplete;
