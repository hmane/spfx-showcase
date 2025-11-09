import { DefaultButton, MessageBar, MessageBarType, PrimaryButton, Toggle, Dropdown, IDropdownOption, Spinner, SpinnerSize } from '@fluentui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { CSSProperties, useCallback, useMemo, useState, useEffect } from 'react';
import {
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form';
import { Card, Content, Header } from 'spfx-toolkit/lib/components/Card';
import {
  FormContainer,
  FormDescription,
  FormError,
  FormItem,
  FormLabel,
  FormValue,
  DevExtremeTextBox,
  DevExtremeTextArea,
} from 'spfx-toolkit/lib/components/spForm';
import { GroupUsersPicker } from 'spfx-toolkit/lib/components/GroupUsersPicker';
import type { IGroupUser } from 'spfx-toolkit/lib/components/GroupUsersPicker/GroupUsersPicker.types';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';
import { z } from 'zod';
import { ShowcaseCodeSample } from './ShowcaseCodeSample';
import { ShowcaseHero } from './ShowcaseHero';
import type { ShowcaseFeature } from './ShowcaseKeyFeatures';
import { ShowcaseKeyFeatures } from './ShowcaseKeyFeatures';

const groupUserSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    text: z.string(),
    secondaryText: z.string().optional(),
    imageUrl: z.string().optional(),
    loginName: z.string().optional(),
    imageInitials: z.string().optional(),
    initialsColor: z.number().optional(),
  })
  .passthrough();

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  projectLead: z
    .array(groupUserSchema)
    .min(1, 'Select a project lead')
    .max(1, 'Only one project lead allowed'),
  teamMembers: z
    .array(groupUserSchema)
    .min(1, 'Select at least one team member')
    .max(5, 'Maximum 5 team members allowed'),
  stakeholders: z
    .array(groupUserSchema)
    .min(1, 'Select at least one stakeholder'),
  description: z.string().max(500, 'Description cannot exceed 500 characters'),
});

type FormData = z.infer<typeof formSchema>;

const GROUP_USER_PICKER_USAGE_SAMPLE = `import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import {
  FormContainer, FormItem, FormLabel, FormValue, FormError,
} from 'spfx-toolkit/lib/components/spForm';
import { GroupUsersPicker } from 'spfx-toolkit/lib/components/GroupUsersPicker';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';

const groupUserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  text: z.string(),
  secondaryText: z.string().optional(),
}).passthrough();

const schema = z.object({
  projectLead: z.array(groupUserSchema).min(1, 'Select a project lead'),
  teamMembers: z.array(groupUserSchema).min(1, 'Select team members'),
});

type ProjectForm = z.infer<typeof schema>;

export const ProjectAssignmentForm: React.FC = () => {
  const form = useForm<ProjectForm>({
    resolver: zodResolver(schema),
    defaultValues: { projectLead: [], teamMembers: [] },
  });

  const [projectLead, setProjectLead] = React.useState<any[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
  const [siteGroups, setSiteGroups] = React.useState<IDropdownOption[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState<string>('');

  // Load site groups on mount
  React.useEffect(() => {
    const fetchGroups = async () => {
      const groups = await SPContext.sp.web.siteGroups.select('Title')();
      setSiteGroups(groups.map(g => ({ key: g.Title, text: g.Title })));
      if (groups.length > 0) setSelectedGroup(groups[0].Title);
    };
    fetchGroups();
  }, []);

  const onSubmit = (data: ProjectForm) => {
    console.log('Form submitted:', data);
  };

  return (
    <FormProvider {...form}>
      <FormContainer labelWidth="160px">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel isRequired>Project Lead</FormLabel>
            <FormValue>
              <Dropdown
                label="Select Group"
                options={siteGroups}
                selectedKey={selectedGroup}
                onChange={(_, option) => setSelectedGroup(option?.key as string)}
              />
              {selectedGroup && (
                <GroupUsersPicker
                  groupName={selectedGroup}
                  maxUserCount={1}
                  selectedUsers={projectLead}
                  onChange={setProjectLead}
                  placeholder="Select project lead"
                  ensureUser={true}
                  useCache={false}
                />
              )}
              <FormError error={form.formState.errors.projectLead?.message} showIcon />
            </FormValue>
          </FormItem>

          <div style={{ marginTop: '24px' }}>
            <PrimaryButton
              type="submit"
              text={form.formState.isSubmitting ? 'Submitting...' : 'Create Project'}
              disabled={form.formState.isSubmitting}
            />
          </div>
        </form>
      </FormContainer>
    </FormProvider>
  );
};`;

const GROUP_USER_PICKER_FEATURES: ShowcaseFeature[] = [
  {
    icon: '👥',
    title: 'SharePoint Group Integration',
    description:
      'Loads users directly from SharePoint groups with automatic caching and error handling.',
    color: '#0078d4',
  },
  {
    icon: '🔄',
    title: 'Single & Multi-Select',
    description:
      'Automatically switches between SelectBox (single) and TagBox (multi) based on maxUserCount.',
    color: '#00b294',
  },
  {
    icon: '📸',
    title: 'User Photos & Initials',
    description:
      'Displays user photos with automatic fallback to colored initials, matching SharePoint UX.',
    color: '#5c2d91',
  },
  {
    icon: '✅',
    title: 'EnsureUser Support',
    description:
      'Optional async ensureUser call to verify selected users exist in the SharePoint site.',
    color: '#d83b01',
  },
];

const GROUP_USER_PICKER_BADGES = ['SharePoint Groups', 'DevExtreme', 'React Hook Form'];

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

/**
 * Complete demo for the GroupUsersPicker component showcasing single/multi-select from SharePoint groups
 */
export const GroupUserPickerShowcase: React.FC = () => {
  const [labelPosition, setLabelPosition] = useState<'left' | 'top'>('left');
  const [compactMode, setCompactMode] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  // Site groups state
  const [siteGroups, setSiteGroups] = useState<IDropdownOption[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedLeadGroup, setSelectedLeadGroup] = useState<string>('');
  const [selectedTeamGroup, setSelectedTeamGroup] = useState<string>('');
  const [selectedStakeholderGroup, setSelectedStakeholderGroup] = useState<string>('');

  // Standalone demo state
  const [projectLead, setProjectLead] = useState<IGroupUser[]>([]);
  const [teamMembers, setTeamMembers] = useState<IGroupUser[]>([]);
  const [stakeholders, setStakeholders] = useState<IGroupUser[]>([]);
  const [lastAction, setLastAction] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      projectName: '',
      projectLead: [],
      teamMembers: [],
      stakeholders: [],
      description: '',
    },
  });

  const { control, handleSubmit, reset, formState, setValue } = form;
  const { errors, isSubmitting, isSubmitSuccessful, submitCount, dirtyFields } = formState;

  const watchedValues = useWatch({ control });

  // Fetch site groups on component mount
  useEffect(() => {
    const fetchSiteGroups = async () => {
      try {
        setLoadingGroups(true);
        const groups = await SPContext.sp.web.siteGroups.select('Id', 'Title', 'Description')();

        const groupOptions: IDropdownOption[] = groups.map(group => ({
          key: group.Title,
          text: group.Title,
          data: { id: group.Id, description: group.Description }
        }));

        setSiteGroups(groupOptions);

        // Set default selections if groups exist
        if (groupOptions.length > 0) {
          setSelectedLeadGroup(groupOptions[0].key as string);
          setSelectedTeamGroup(groupOptions.length > 1 ? groupOptions[1].key as string : groupOptions[0].key as string);
          setSelectedStakeholderGroup(groupOptions.length > 2 ? groupOptions[2].key as string : groupOptions[0].key as string);
        }
      } catch (error) {
        console.error('Error fetching site groups:', error);
        setLastAction('Error loading site groups. Using default groups.');
        // Fallback to empty array
        setSiteGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    void fetchSiteGroups();
  }, []);

  // Sync standalone state with form state
  React.useEffect(() => {
    setValue('projectLead', projectLead as FormData['projectLead']);
  }, [projectLead, setValue]);

  React.useEffect(() => {
    setValue('teamMembers', teamMembers as FormData['teamMembers']);
  }, [teamMembers, setValue]);

  React.useEffect(() => {
    setValue('stakeholders', stakeholders as FormData['stakeholders']);
  }, [stakeholders, setValue]);

  const onSubmit = useCallback<SubmitHandler<FormData>>((data: FormData) => {
    setSubmittedData(data);
    setShowSummary(true);
    setLastAction(`Form submitted with ${data.teamMembers.length} team members`);
  }, []);

  const onInvalid = useCallback<SubmitErrorHandler<FormData>>(() => {
    setSubmittedData(null);
    setShowSummary(true);
    setLastAction('Form validation failed');
  }, []);

  const handleReset = useCallback(() => {
    reset();
    setSubmittedData(null);
    setShowSummary(false);
    setProjectLead([]);
    setTeamMembers([]);
    setStakeholders([]);
    setLastAction('Form reset');
  }, [reset]);

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
        title='GroupUsersPicker Component'
        subtitle='DevExtreme-based user picker that loads users from SharePoint groups with automatic single/multi-select modes.'
        gradient='linear-gradient(135deg, #0078d4 0%, #00b294 35%, #5c2d91 100%)'
        badges={GROUP_USER_PICKER_BADGES}
        icon='👥'
      />
      {/* Standalone Interactive Demo */}
      <Card id='standalone-demo' elevation={2} defaultExpanded style={{ marginBottom: '24px' }}>
        <Header variant='info'>Interactive Demo (No Form Validation)</Header>
        <Content padding='comfortable'>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#6c757d', fontSize: '0.95rem', margin: '0 0 16px 0' }}>
              Try the picker components independently with dynamically loaded SharePoint site groups.
              Select different groups from the dropdowns to see how the pickers work.
            </p>
          </div>

          {loadingGroups ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spinner size={SpinnerSize.large} label="Loading site groups..." />
            </div>
          ) : siteGroups.length === 0 ? (
            <MessageBar messageBarType={MessageBarType.warning}>
              No site groups found. Please ensure you have access to site groups.
            </MessageBar>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#1d1d1f',
                  }}
                >
                  Project Lead (Single Select)
                </label>
                <Dropdown
                  label="Select Group"
                  options={siteGroups}
                  selectedKey={selectedLeadGroup}
                  onChange={(_, option) => {
                    setSelectedLeadGroup(option?.key as string);
                    setProjectLead([]);
                    setLastAction(`Changed project lead group to: ${option?.text}`);
                  }}
                  styles={{ root: { marginBottom: '8px' } }}
                />
                <GroupUsersPicker
                  groupName={selectedLeadGroup}
                  maxUserCount={1}
                  selectedUsers={projectLead}
                  onChange={users => {
                    setProjectLead(users);
                    setLastAction(
                      `Project lead changed: ${users.length > 0 ? users[0].text : 'None'}`
                    );
                  }}
                  placeholder='Select a project lead'
                  ensureUser={true}
                  showClearButton={true}
                  useCache={false}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#1d1d1f',
                  }}
                >
                  Team Members (Multi-Select, Max 5)
                </label>
                <Dropdown
                  label="Select Group"
                  options={siteGroups}
                  selectedKey={selectedTeamGroup}
                  onChange={(_, option) => {
                    setSelectedTeamGroup(option?.key as string);
                    setTeamMembers([]);
                    setLastAction(`Changed team members group to: ${option?.text}`);
                  }}
                  styles={{ root: { marginBottom: '8px' } }}
                />
                <GroupUsersPicker
                  groupName={selectedTeamGroup}
                  maxUserCount={5}
                  selectedUsers={teamMembers}
                  onChange={users => {
                    setTeamMembers(users);
                    setLastAction(`Team members changed: ${users.length} selected`);
                  }}
                  placeholder='Select team members (max 5)'
                  ensureUser={true}
                  showClearButton={true}
                  useCache={false}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#1d1d1f',
                  }}
                >
                  Stakeholders (Multi-Select, Unlimited)
                </label>
                <Dropdown
                  label="Select Group"
                  options={siteGroups}
                  selectedKey={selectedStakeholderGroup}
                  onChange={(_, option) => {
                    setSelectedStakeholderGroup(option?.key as string);
                    setStakeholders([]);
                    setLastAction(`Changed stakeholders group to: ${option?.text}`);
                  }}
                  styles={{ root: { marginBottom: '8px' } }}
                />
                <GroupUsersPicker
                  groupName={selectedStakeholderGroup}
                  maxUserCount={999}
                  selectedUsers={stakeholders}
                  onChange={users => {
                    setStakeholders(users);
                    setLastAction(`Stakeholders changed: ${users.length} selected`);
                  }}
                  placeholder='Select stakeholders'
                  ensureUser={false}
                  showClearButton={true}
                  useCache={true}
                />
              </div>
            </div>
          )}

          {lastAction && (
            <div
              style={{
                marginTop: '20px',
                padding: '12px 16px',
                backgroundColor: '#e7f3ff',
                borderLeft: '4px solid #0078d4',
                borderRadius: '4px',
                fontSize: '0.9rem',
                color: '#004578',
              }}
            >
              <strong>Last Action:</strong> {lastAction}
            </div>
          )}

          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1d1d1f' }}>
              Selected Values:
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#333' }}>
              {JSON.stringify(
                {
                  projectLead: projectLead.map(u => ({ id: u.id, text: u.text })),
                  teamMembers: teamMembers.map(u => ({ id: u.id, text: u.text })),
                  stakeholders: stakeholders.map(u => ({ id: u.id, text: u.text })),
                },
                null,
                2
              )}
            </pre>
          </div>
        </Content>
      </Card>

      {/* Form Validation Demo */}
      <Card id='form-controls' elevation={2} defaultExpanded style={{ marginBottom: '24px' }}>
        <Header variant='info'>Form Playground Controls</Header>
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
          </div>
        </Content>
      </Card>

      <Card id='form-showcase' elevation={3} defaultExpanded>
        <Header variant='success'>Project Assignment Form (With Validation)</Header>
        <Content padding='comfortable'>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
              {showSummary && Object.keys(errors).length > 0 && (
                <MessageBar
                  messageBarType={MessageBarType.error}
                  isMultiline={false}
                  onDismiss={() => setShowSummary(false)}
                  style={{ marginBottom: '16px' }}
                >
                  Please fix {Object.keys(errors).length} validation error
                  {Object.keys(errors).length > 1 ? 's' : ''} below.
                </MessageBar>
              )}

              <FormContainer
                labelWidth={
                  labelPosition === 'left' ? (compactMode ? '130px' : '160px') : undefined
                }
                style={containerStyle}
                className={labelPosition === 'top' ? 'form-showcase-top-labels' : undefined}
              >
                <FormItem labelPosition={labelPosition}>
                  <FormLabel isRequired>Project Name</FormLabel>
                  <FormValue>
                    <DevExtremeTextBox
                      name='projectName'
                      control={control}
                      placeholder='Enterprise Portal Redesign'
                    />
                    <FormError error={errors.projectName?.message} showIcon />
                  </FormValue>
                </FormItem>

                <FormItem labelPosition={labelPosition}>
                  <FormLabel isRequired infoText={`Select one person from the ${selectedLeadGroup || 'selected'} group`}>
                    Project Lead
                  </FormLabel>
                  <FormValue>
                    {selectedLeadGroup && (
                      <GroupUsersPicker
                        groupName={selectedLeadGroup}
                        maxUserCount={1}
                        selectedUsers={projectLead}
                        onChange={setProjectLead}
                        placeholder='Select project lead'
                        ensureUser={true}
                        showClearButton={true}
                        useCache={false}
                      />
                    )}
                    <FormDescription>
                      Automatically switches to SelectBox for single-user selection
                    </FormDescription>
                    <FormError error={errors.projectLead?.message} showIcon />
                  </FormValue>
                </FormItem>

                <FormItem labelPosition={labelPosition}>
                  <FormLabel isRequired infoText={`Select 1-5 people from the ${selectedTeamGroup || 'selected'} group`}>
                    Team Members
                  </FormLabel>
                  <FormValue>
                    {selectedTeamGroup && (
                      <GroupUsersPicker
                        groupName={selectedTeamGroup}
                        maxUserCount={5}
                        selectedUsers={teamMembers}
                        onChange={setTeamMembers}
                        placeholder='Select team members (max 5)'
                        ensureUser={true}
                        showClearButton={true}
                        useCache={false}
                      />
                    )}
                    <FormDescription>
                      Automatically switches to TagBox for multi-user selection
                    </FormDescription>
                    <FormError error={errors.teamMembers?.message} showIcon />
                  </FormValue>
                </FormItem>

                <FormItem labelPosition={labelPosition}>
                  <FormLabel isRequired infoText='Select stakeholders to notify on updates'>
                    Stakeholders
                  </FormLabel>
                  <FormValue>
                    {selectedStakeholderGroup && (
                      <GroupUsersPicker
                        groupName={selectedStakeholderGroup}
                        maxUserCount={999}
                        selectedUsers={stakeholders}
                        onChange={setStakeholders}
                        placeholder='Select stakeholders'
                        ensureUser={false}
                        showClearButton={true}
                        useCache={true}
                      />
                    )}
                    <FormDescription>
                      Using cache mode (useCache=true) for better performance
                    </FormDescription>
                    <FormError error={errors.stakeholders?.message} showIcon />
                  </FormValue>
                </FormItem>

                <FormItem labelPosition={labelPosition} labelWidth='140px'>
                  <FormLabel>Project Description</FormLabel>
                  <FormValue>
                    <DevExtremeTextArea
                      name='description'
                      control={control}
                      placeholder='Briefly describe the project objectives and scope...'
                      height={120}
                    />
                    <FormError error={errors.description?.message} showIcon />
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
                  text={isSubmitting ? 'Submitting…' : 'Create Project'}
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
                  .map(([key, value]) => {
                    if (Array.isArray(value) && value.length > 0 && value[0]?.text) {
                      return `\n  ${key}: [${value.map(u => `"${u.text}"`).join(', ')}]`;
                    }
                    return `\n  ${key}: ${JSON.stringify(value)}`;
                  })
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
                      projectLead: submittedData.projectLead.map(u => ({
                        id: u.id,
                        text: u.text,
                      })),
                      teamMembers: submittedData.teamMembers.map(u => ({
                        id: u.id,
                        text: u.text,
                      })),
                      stakeholders: submittedData.stakeholders.map(u => ({
                        id: u.id,
                        text: u.text,
                      })),
                    },
                    null,
                    2
                  )}
                </pre>
              ) : (
                <p style={{ margin: 0 }}>
                  Submit the form to inspect the validated payload with selected users.
                </p>
              )}
            </div>
          </div>
        </Content>
      </Card>

      <ShowcaseKeyFeatures features={GROUP_USER_PICKER_FEATURES} />

      <ShowcaseCodeSample
        id='group-user-picker-code-sample'
        title='GroupUsersPicker with Dynamic Group Selection'
        description='This pattern demonstrates how to integrate GroupUsersPicker into forms with Zod validation and dynamic SharePoint group loading. The component automatically fetches site groups using SPContext and switches between single-select (SelectBox) and multi-select (TagBox) modes based on maxUserCount.'
        code={GROUP_USER_PICKER_USAGE_SAMPLE}
        language='tsx'
      />
    </div>
  );
};

export default GroupUserPickerShowcase;
