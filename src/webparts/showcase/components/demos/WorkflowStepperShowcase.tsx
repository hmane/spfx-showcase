import {
  DefaultButton,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Slider,
  Toggle,
  useTheme,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { StepData, WorkflowStepper } from 'spfx-toolkit/lib/components/WorkflowStepper';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';

const WORKFLOW_STEPPER_SAMPLE = `import * as React from 'react';
import { StepData, WorkflowStepper } from 'spfx-toolkit/lib/components/WorkflowStepper';

const steps: StepData[] = [
  {
    id: 'submit',
    title: 'Submit Request',
    description1: 'Submitted by Megan',
    status: 'completed',
    content: (
      <div style={{ padding: '16px' }}>
        <h3>Submitted</h3>
        <p>Your request has been captured and routed to the approver.</p>
      </div>
    ),
  },
  {
    id: 'manager',
    title: 'Manager Review',
    description1: 'Pending approval',
    status: 'current',
    content: (
      <div style={{ padding: '16px' }}>
        <h3>Manager Review</h3>
        <p>The manager can approve, reject, or request changes.</p>
      </div>
    ),
  },
  {
    id: 'complete',
    title: 'Complete',
    description1: 'Final confirmation',
    status: 'pending',
    content: (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <span role="img" aria-label="party">🎉</span>
        <p>All steps complete.</p>
      </div>
    ),
  },
];

export const ApprovalWorkflowStepper: React.FC = () => {
  const [selectedStepId, setSelectedStepId] = React.useState<string>('submit');

  return (
    <WorkflowStepper
      steps={steps}
      mode="fullSteps"
      selectedStepId={selectedStepId}
      onStepClick={step => setSelectedStepId(step.id)}
      minStepWidth={160}
      showScrollHint={true}
    />
  );
};`;

const WORKFLOW_FEATURES: ShowcaseFeature[] = [
  {
    icon: '🪜',
    title: 'Multiple Modes',
    description: 'Toggle between full steps, progress-only, and compact modes with a single prop.',
    color: '#176B87',
  },
  {
    icon: '🧭',
    title: 'Interactive Steps',
    description: 'Each step renders custom React content, forms, and command buttons.',
    color: '#0ea5e9',
  },
  {
    icon: '🌀',
    title: 'Scroll Guidance',
    description: 'Horizontal scrolling hints guide users through longer workflows.',
    color: '#845ef7',
  },
  {
    icon: '🛠️',
    title: 'Controller Hooks',
    description: 'Capture step selection and control widths for adaptive layouts.',
    color: '#2f9e44',
  },
];

const WORKFLOW_BADGES = ['Full + compact modes', 'Custom React content', 'Status indicators'];

// Sample React component for interactive step content
const InteractiveStepContent: React.FC<{ stepId: string; userName: string }> = ({
  stepId,
  userName,
}) => {
  const theme = useTheme();
  const [approved, setApproved] = useState(false);
  const [priority, setPriority] = useState('medium');

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: theme.palette.white,
        borderRadius: '8px',
        border: `1px solid ${theme.palette.neutralLight}`,
      }}
    >
      <h3 style={{ color: theme.palette.themePrimary, marginBottom: '16px', fontSize: '18px' }}>
        Manager Approval Required
      </h3>
      <p style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
        This step requires manager approval to proceed. Please review the request details below and
        take appropriate action.
      </p>

      <div
        style={{
          marginBottom: '20px',
          padding: '16px',
          background: theme.palette.neutralLighterAlt,
          borderRadius: '6px',
        }}
      >
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <strong>Request ID:</strong> REQ-{stepId.toUpperCase()}
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <strong>Assigned to:</strong> {userName}
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <strong>Submitted:</strong> {new Date().toLocaleDateString()}
        </div>
        <div style={{ fontSize: '14px' }}>
          <strong>Priority:</strong>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{ marginLeft: '8px', padding: '4px' }}
          >
            <option value='low'>Low</option>
            <option value='medium'>Medium</option>
            <option value='high'>High</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Toggle
          label='Approve this request'
          checked={approved}
          onChange={(_, checked) => setApproved(!!checked)}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <PrimaryButton
          text='Approve & Continue'
          disabled={!approved}
          onClick={() => alert(`Step ${stepId} approved by ${userName} with ${priority} priority`)}
          iconProps={{ iconName: 'CheckMark' }}
        />
        <DefaultButton
          text='Request Changes'
          onClick={() => alert(`Changes requested for ${stepId} by ${userName}`)}
          iconProps={{ iconName: 'Edit' }}
        />
        <DefaultButton
          text='Reject'
          onClick={() => alert(`Step ${stepId} rejected by ${userName}`)}
          iconProps={{ iconName: 'Cancel' }}
        />
      </div>
    </div>
  );
};

// Form component for data entry
const DataEntryForm: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    reason: '',
  });

  return (
    <div style={{ padding: '24px', maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '16px', color: theme.palette.themePrimary }}>
        Request Information
      </h3>
      <p style={{ marginBottom: '20px', fontSize: '14px' }}>
        Please fill out the form below to submit your request.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label
            style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '14px' }}
          >
            Full Name *
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme.palette.neutralTertiary}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder='Enter your full name'
          />
        </div>

        <div>
          <label
            style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '14px' }}
          >
            Email Address *
          </label>
          <input
            type='email'
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme.palette.neutralTertiary}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder='Enter your email'
          />
        </div>

        <div>
          <label
            style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '14px' }}
          >
            Department
          </label>
          <select
            value={formData.department}
            onChange={e => setFormData({ ...formData, department: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme.palette.neutralTertiary}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value=''>Select department</option>
            <option value='engineering'>Engineering</option>
            <option value='design'>Design</option>
            <option value='marketing'>Marketing</option>
            <option value='sales'>Sales</option>
          </select>
        </div>

        <div>
          <label
            style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '14px' }}
          >
            Reason for Request
          </label>
          <textarea
            value={formData.reason}
            onChange={e => setFormData({ ...formData, reason: e.target.value })}
            rows={4}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme.palette.neutralTertiary}`,
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
            }}
            placeholder='Describe your request...'
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <PrimaryButton
            text='Save & Continue'
            onClick={() => alert('Form saved successfully!')}
            iconProps={{ iconName: 'Save' }}
          />
          <DefaultButton
            text='Save as Draft'
            onClick={() => alert('Saved as draft')}
            iconProps={{ iconName: 'PageEdit' }}
          />
        </div>
      </div>
    </div>
  );
};

const createBasicWorkflow = (): StepData[] => [
  {
    id: 'basic-1',
    title: 'Request Submission',
    description1: 'Form completed',
    description2: 'Jan 15, 2025',
    status: 'completed',
    content: <DataEntryForm />,
  },
  {
    id: 'basic-2',
    title: 'Manager Review',
    description1: 'In progress',
    description2: 'Due: Jan 30',
    status: 'completed',
    content: <InteractiveStepContent stepId='basic-2' userName='John Smith' />,
  },
  {
    id: 'basic-3',
    title: 'Final Approval',
    description1: 'Pending',
    description2: 'Awaiting review',
    status: 'completed',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <h3>Awaiting Final Approval</h3>
        <p>This step will begin once the manager review is complete.</p>
      </div>
    ),
  },
  {
    id: 'basic-4',
    title: 'Processing Complete',
    description1: 'Not started',
    description2: 'Final step',
    status: 'completed',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h3>Request Processing Complete</h3>
        <p>Your request will be finalized and you&apos;ll receive confirmation.</p>
      </div>
    ),
  },
];

const createComplexWorkflow = (): StepData[] => [
  {
    id: 'complex-1',
    title: 'Document Review',
    description1: 'Completed by Alice Johnson',
    description2: 'Reviewed 2 hours ago',
    status: 'completed',
    content: (
      <div style={{ padding: '24px' }}>
        <h3 style={{ color: '#107c10', marginBottom: '16px' }}>✅ Document Review Complete</h3>
        <div
          style={{
            background: '#f3f8f3',
            padding: '16px',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          <p>
            <strong>Reviewer:</strong> Alice Johnson
          </p>
          <p>
            <strong>Review Date:</strong> {new Date().toLocaleDateString()}
          </p>
          <p>
            <strong>Status:</strong> Approved
          </p>
          <p>
            <strong>Comments:</strong> All documentation meets requirements. Ready to proceed.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'complex-2',
    title: 'Manager Approval',
    description1: 'Currently with Bob Smith',
    description2: 'Assigned 1 hour ago',
    status: 'current',
    content: <InteractiveStepContent stepId='complex-2' userName='Bob Smith' />,
  },
  {
    id: 'complex-3',
    title: 'Budget Verification',
    description1: 'Requires attention',
    description2: 'Budget code needs update',
    status: 'warning',
    content: (
      <div style={{ padding: '24px' }}>
        <h3 style={{ color: '#ffb900', marginBottom: '16px' }}>⚠️ Budget Verification Required</h3>
        <div
          style={{
            background: '#fff4ce',
            padding: '16px',
            border: '1px solid #ffb900',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          <p>
            <strong>Action Required:</strong> Budget code needs updating
          </p>
          <p>
            <strong>Current Code:</strong> PROJ-2024-001
          </p>
          <p>
            <strong>Required Code:</strong> PROJ-2025-001
          </p>
        </div>
        <DefaultButton text='Update Budget Code' iconProps={{ iconName: 'Edit' }} />
      </div>
    ),
  },
  {
    id: 'complex-4',
    title: 'Security Scan',
    description1: 'Failed - Critical issues',
    description2: 'Scan completed with errors',
    status: 'error',
    content: (
      <div style={{ padding: '24px' }}>
        <h3 style={{ color: '#d13438', marginBottom: '16px' }}>❌ Security Scan Failed</h3>
        <div
          style={{
            background: '#fde7e9',
            padding: '16px',
            border: '1px solid #d13438',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          <p>
            <strong>Critical Issues Found:</strong>
          </p>
          <ul style={{ marginLeft: '20px' }}>
            <li>Unauthorized access detected</li>
            <li>Missing security certificates</li>
            <li>Outdated encryption protocols</li>
          </ul>
        </div>
        <PrimaryButton text='View Security Report' iconProps={{ iconName: 'Shield' }} />
      </div>
    ),
  },
  {
    id: 'complex-5',
    title: 'Legal Review',
    description1: 'On hold',
    description2: 'Waiting for security clearance',
    status: 'blocked',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
        <h3 style={{ color: '#ff8c00' }}>Legal Review Blocked</h3>
        <p>Cannot proceed until security scan issues are resolved.</p>
        <div
          style={{ background: '#fff0e6', padding: '16px', borderRadius: '6px', marginTop: '16px' }}
        >
          <strong>Blocking Issue:</strong> Security vulnerabilities must be addressed before legal
          review can begin.
        </div>
      </div>
    ),
  },
];

const createManyStepsWorkflow = (count: number): StepData[] => {
  const statuses = ['completed', 'current', 'pending', 'warning', 'error', 'blocked'] as const;
  const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Legal', 'Finance'];
  const users = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Wilson', 'Carol Brown'];

  return Array.from({ length: count }, (_, index) => ({
    id: `many-${index + 1}`,
    title: `${departments[index % departments.length]} Review`,
    description1: `${users[index % users.length]}`,
    description2: `Step ${index + 1} of ${count}`,
    status: statuses[index % statuses.length],
    content: (
      <div style={{ padding: '24px' }}>
        <h3>{departments[index % departments.length]} Review</h3>
        <p>
          This is step {index + 1} of {count} in the workflow process.
        </p>
        <div
          style={{ background: '#f5f5f5', padding: '16px', borderRadius: '6px', marginTop: '16px' }}
        >
          <p>
            <strong>Department:</strong> {departments[index % departments.length]}
          </p>
          <p>
            <strong>Assigned to:</strong> {users[index % users.length]}
          </p>
          <p>
            <strong>Status:</strong> {statuses[index % statuses.length]}
          </p>
        </div>
      </div>
    ),
  }));
};

const createStatusWorkflow = (): StepData[] => [
  {
    id: 'status-completed',
    title: 'Completed',
    description1: 'Success state',
    status: 'completed',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h3 style={{ color: '#107c10' }}>Completed Step</h3>
        <p>This step has been successfully completed with all requirements met.</p>
      </div>
    ),
  },
  {
    id: 'status-current',
    title: 'Current',
    description1: 'In progress',
    status: 'current',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
        <h3 style={{ color: '#0078d4' }}>Current Step</h3>
        <p>This step is currently active and in progress.</p>
      </div>
    ),
  },
  {
    id: 'status-pending',
    title: 'Pending',
    description1: 'Not started',
    status: 'pending',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏸️</div>
        <h3 style={{ color: '#666' }}>Pending Step</h3>
        <p>This step is waiting to be started.</p>
      </div>
    ),
  },
  {
    id: 'status-warning',
    title: 'Warning',
    description1: 'Needs attention',
    status: 'warning',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#ffb900' }}>Warning Step</h3>
        <p>This step requires attention before proceeding.</p>
      </div>
    ),
  },
  {
    id: 'status-error',
    title: 'Error',
    description1: 'Has issues',
    status: 'error',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h3 style={{ color: '#d13438' }}>Error Step</h3>
        <p>This step has encountered errors that need to be resolved.</p>
      </div>
    ),
  },
  {
    id: 'status-blocked',
    title: 'Blocked',
    description1: 'Cannot proceed',
    status: 'blocked',
    content: (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
        <h3 style={{ color: '#ff8c00' }}>Blocked Step</h3>
        <p>This step is blocked and cannot proceed.</p>
      </div>
    ),
  },
];

export const WorkflowStepperShowcase: React.FC = () => {
  const theme = useTheme();
  const [selectedDemo, setSelectedDemo] = useState<string>('basic');
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [customMinWidth, setCustomMinWidth] = useState<number>(150);
  const [showScrollHints, setShowScrollHints] = useState<boolean>(true);
  const [selectedMode, setSelectedMode] = useState<'fullSteps' | 'progress' | 'compact'>(
    'fullSteps'
  );

  const demoOptions: IDropdownOption[] = [
    { key: 'basic', text: 'Basic Workflow (4 steps)' },
    { key: 'complex', text: 'Complex Workflow (5 steps with all statuses)' },
    { key: 'many', text: 'Many Steps (12 steps for scrolling)' },
    { key: 'statuses', text: 'All Status Types' },
  ];

  const modeOptions: IDropdownOption[] = [
    { key: 'fullSteps', text: 'Full Steps (with content)' },
    { key: 'progress', text: 'Progress Only' },
    { key: 'compact', text: 'Compact Mode' },
  ];

  const getCurrentSteps = (): StepData[] => {
    switch (selectedDemo) {
      case 'basic':
        return createBasicWorkflow();
      case 'complex':
        return createComplexWorkflow();
      case 'many':
        return createManyStepsWorkflow(12);
      case 'statuses':
        return createStatusWorkflow();
      default:
        return createBasicWorkflow();
    }
  };

  const currentSteps = getCurrentSteps();

  const handleStepClick = useCallback((step: StepData) => {
    setSelectedStepId(step.id);
    console.log('Step clicked:', step);
  }, []);

  const resetDemo = (): void => {
    setSelectedStepId('');
    setCustomMinWidth(150);
    setShowScrollHints(true);
    setSelectedMode('fullSteps');
  };

  const fillSampleSelection = (): void => {
    setSelectedDemo('complex');
    setSelectedStepId('complex-2');
    setCustomMinWidth(180);
    setSelectedMode('fullSteps');
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        backgroundColor: theme.palette.neutralLighterAlt,
        overflow: 'auto',
        minHeight: '100vh',
      }}
    >
      <ShowcaseHero
        title='Workflow Stepper'
        subtitle='Clean workflow visualization with mode switching, custom content, and horizontal scroll guidance.'
        gradient='linear-gradient(135deg, #053B50 0%, #00A896 50%, #02C39A 100%)'
        badges={WORKFLOW_BADGES}
        icon='🧭'
      />

      {/* Control Panel */}
      <div
        style={{
          background: theme.palette.white,
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `1px solid ${theme.palette.neutralLight}`,
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '1rem',
            fontWeight: '600',
            color: theme.palette.neutralPrimary,
          }}
        >
          Demo Controls
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <Dropdown
            label='Demo Scenario'
            selectedKey={selectedDemo}
            options={demoOptions}
            onChange={(_, option) => option && setSelectedDemo(option.key as string)}
            styles={{ root: { fontSize: '13px' } }}
          />

          <Dropdown
            label='Display Mode'
            selectedKey={selectedMode}
            options={modeOptions}
            onChange={(_, option) => option && setSelectedMode(option.key as 'fullSteps' | 'progress' | 'compact')}
            styles={{ root: { fontSize: '13px' } }}
          />

          <div>
            <label
              style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}
            >
              Min Step Width: {customMinWidth}px
            </label>
            <Slider
              min={80}
              max={220}
              step={10}
              value={customMinWidth}
              onChange={setCustomMinWidth}
              showValue={false}
            />
          </div>

          <Toggle
            label='Show Scroll Hints'
            checked={showScrollHints}
            onChange={(_, checked) => setShowScrollHints(!!checked)}
            onText='On'
            offText='Off'
            styles={{ text: { fontSize: '13px' } }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <PrimaryButton
            text='Fill Sample Data'
            onClick={fillSampleSelection}
            iconProps={{ iconName: 'AutoFillTemplate' }}
            styles={{ root: { fontSize: '13px', padding: '8px 12px' } }}
          />
          <DefaultButton
            text='Reset Demo'
            onClick={resetDemo}
            iconProps={{ iconName: 'Refresh' }}
            styles={{ root: { fontSize: '13px', padding: '8px 12px' } }}
          />
          <DefaultButton
            text='Log Data'
            onClick={() => console.log('Current steps:', currentSteps)}
            iconProps={{ iconName: 'Info' }}
            styles={{ root: { fontSize: '13px', padding: '8px 12px' } }}
          />
        </div>

        {selectedStepId && (
          <MessageBar messageBarType={MessageBarType.info} style={{ marginTop: '12px' }}>
            <strong>Selected Step:</strong> {selectedStepId} - Click another step to see content
            changes.
          </MessageBar>
        )}
      </div>

      {/* Main Demo */}
      <div
        style={{
          background: theme.palette.white,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${theme.palette.neutralLight}`,
          marginBottom: '20px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2
            style={{
              margin: '0 0 4px 0',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: theme.palette.neutralPrimary,
            }}
          >
            {demoOptions.find(opt => opt.key === selectedDemo)?.text}
          </h2>
          <p style={{ margin: '0', fontSize: '13px', color: theme.palette.neutralSecondary }}>
            Mode: {modeOptions.find(opt => opt.key === selectedMode)?.text} | Content: Custom React
            components for each step
          </p>
        </div>

        <WorkflowStepper
          steps={currentSteps}
          mode={selectedMode}
          selectedStepId={selectedStepId}
          onStepClick={handleStepClick}
          minStepWidth={customMinWidth}
          showScrollHint={showScrollHints}
        />
      </div>

      {/* Mode Comparison */}
      <div
        style={{
          background: theme.palette.white,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${theme.palette.neutralLight}`,
          marginBottom: '20px',
        }}
      >
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: theme.palette.neutralPrimary,
          }}
        >
          Display Mode Comparison
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <h4
            style={{ marginBottom: '8px', color: theme.palette.neutralPrimary, fontSize: '14px' }}
          >
            Progress Mode (No Content Area)
          </h4>
          <WorkflowStepper
            steps={createBasicWorkflow()}
            mode='progress'
            minStepWidth={customMinWidth}
            showScrollHint={false}
          />
        </div>

        <div>
          <h4
            style={{ marginBottom: '8px', color: theme.palette.neutralPrimary, fontSize: '14px' }}
          >
            Compact Mode (Minimal Spacing)
          </h4>
          <WorkflowStepper
            steps={createBasicWorkflow()}
            mode='compact'
            minStepWidth={Math.max(80, customMinWidth - 20)}
            showScrollHint={false}
          />
        </div>
      </div>

      <ShowcaseKeyFeatures features={WORKFLOW_FEATURES} />

      <ShowcaseCodeSample
      id='workflow-stepper-sample'
      title='Workflow Stepper Integration'
      description='Minimal setup for wiring the WorkflowStepper with interactive React content and step selection state.'
      code={WORKFLOW_STEPPER_SAMPLE}
      language='tsx'
    />
  </div>
);
};
