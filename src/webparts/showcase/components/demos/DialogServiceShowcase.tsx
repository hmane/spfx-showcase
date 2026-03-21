import * as React from 'react';
import { useState } from 'react';
import { Card, Content, Header } from 'spfx-toolkit/components/Card';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseKeyFeatures, ShowcaseFeature } from '../shared/ShowcaseKeyFeatures';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import {
  showLoading,
  hideLoading,
  alert,
  confirm,
} from 'spfx-toolkit/utilities/dialogService';
import {
  DefaultButton,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Icon,
  TextField,
  Toggle,
} from '@fluentui/react';

const FEATURES: ShowcaseFeature[] = [
  {
    icon: '⏳',
    title: 'Global Loading',
    description: 'Block entire UI with customizable loading messages and JSX content during async operations',
    color: '#0078d4',
  },
  {
    icon: '🎯',
    title: 'Component-Level Loading',
    description: 'Scoped loading overlays for specific containers - load sections independently without blocking the entire page',
    color: '#00bcf2',
  },
  {
    icon: '🎨',
    title: 'Custom Icons/Spinners',
    description: 'Replace default spinner with custom icons, brand animations, or static indicators for consistent branding',
    color: '#8764b8',
  },
  {
    icon: '💬',
    title: 'Alert Dialog',
    description: 'Show informational messages with Fluent UI styling, supporting both text and rich JSX content',
    color: '#107c10',
  },
  {
    icon: '❓',
    title: 'Confirm Dialog',
    description: 'Configurable confirmation dialogs with custom buttons, values, and styling',
    color: '#ff8c00',
  },
  {
    icon: '🔄',
    title: 'Promise-based API',
    description: 'Async/await support for clean, readable code with proper error handling',
    color: '#d13438',
  },
];

const LOADING_BASIC_EXAMPLE = `import { showLoading, hideLoading } from 'spfx-toolkit/utilities/dialogService';

async function loadData() {
  try {
    showLoading('Loading data...');
    const data = await fetchData();
    return data;
  } finally {
    hideLoading(); // Always hide in finally block
  }
}`;

const LOADING_JSX_EXAMPLE = `import { showLoading, hideLoading } from 'spfx-toolkit/utilities/dialogService';
import * as React from 'react';

async function uploadFiles() {
  const filesUploaded = 7;
  const totalFiles = 10;

  showLoading(
    <div>
      <strong>Uploading files...</strong>
      <div style={{ marginTop: '12px' }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#edebe9',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: \`\${(filesUploaded / totalFiles) * 100}%\`,
            height: '100%',
            backgroundColor: '#0078d4',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          {filesUploaded} of {totalFiles} files uploaded
        </div>
      </div>
    </div>
  );

  await processUpload();
  hideLoading();
}`;

const COMPONENT_LOADING_EXAMPLE = `import { showLoading, hideLoading } from 'spfx-toolkit/utilities/dialogService';

// Component-level loading (scoped to a specific container)
function MyComponent() {
  const loadChartData = async () => {
    // Show loading overlay only on the chart container
    showLoading('Loading chart data...', { containerId: 'chart-container' });

    try {
      await fetchChartData();
    } finally {
      // Hide loading for this specific container
      hideLoading('chart-container');
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Chart container with relative positioning */}
      <div
        id="chart-container"
        style={{ position: 'relative', height: '400px' }}
      >
        {/* Chart content */}
      </div>
    </div>
  );
}`;

const MULTIPLE_LOADERS_EXAMPLE = `import { showLoading, hideLoading } from 'spfx-toolkit/utilities/dialogService';

// Multiple component-level loaders simultaneously
async function loadDashboard() {
  // Load three sections in parallel, each with its own loader
  await Promise.all([
    (async () => {
      showLoading('Loading sales data...', { containerId: 'sales-chart' });
      await loadSalesData();
      hideLoading('sales-chart');
    })(),

    (async () => {
      showLoading('Loading inventory...', { containerId: 'inventory-chart' });
      await loadInventoryData();
      hideLoading('inventory-chart');
    })(),

    (async () => {
      showLoading('Loading metrics...', { containerId: 'metrics-card' });
      await loadMetrics();
      hideLoading('metrics-card');
    })()
  ]);
}`;

const CUSTOM_ICON_EXAMPLE = `import { showLoading, hideLoading } from 'spfx-toolkit/utilities/dialogService';
import { Icon } from '@fluentui/react';
import * as React from 'react';

// Custom animated icon
showLoading('Processing...', {
  customIcon: (
    <div style={{ animation: 'spin 1s linear infinite' }}>
      <Icon iconName="Sync" style={{ fontSize: '32px', color: '#0078d4' }} />
    </div>
  )
});

// Static icon (no animation)
showLoading('Please wait...', {
  customIcon: <Icon iconName="HourGlass" style={{ fontSize: '32px', color: '#ff8c00' }} />
});

// Brand-specific spinner
const BrandSpinner = () => (
  <div style={{
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0078d4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }} />
);

showLoading('Loading data...', {
  customIcon: <BrandSpinner />
});`;

const CUSTOM_ICON_PROGRESS_EXAMPLE = `import { showLoading, hideLoading } from 'spfx-toolkit/utilities/dialogService';
import { Icon } from '@fluentui/react';
import * as React from 'react';

// Use customIcon to prevent spinner restart on each update
const CustomSpinner = () => (
  <Icon
    iconName="ProgressRingDots"
    style={{ fontSize: '32px', color: '#0078d4' }}
  />
);

async function uploadFiles() {
  const totalFiles = 10;

  for (let i = 1; i <= totalFiles; i++) {
    // customIcon prevents the spinner from restarting on each iteration
    showLoading(
      \`Processing file \${i} of \${totalFiles}...\`,
      { customIcon: <CustomSpinner /> }
    );
    await processFile(i);
  }

  hideLoading();
}

// Without customIcon, the spinner would restart its animation
// on each showLoading() call, causing a visual glitch`;

const ALERT_BASIC_EXAMPLE = `import { alert } from 'spfx-toolkit/utilities/dialogService';

async function saveData() {
  await saveChanges();

  // Simple alert
  await alert('Changes saved successfully!');

  // With custom title and button
  await alert('The item has been saved.', {
    title: 'Success',
    buttonText: 'Close'
  });
}`;

const ALERT_JSX_EXAMPLE = `import { alert } from 'spfx-toolkit/utilities/dialogService';
import { MessageBar, MessageBarType } from '@fluentui/react';
import * as React from 'react';

await alert(
  <div>
    <MessageBar messageBarType={MessageBarType.success}>
      Your changes have been saved successfully!
    </MessageBar>
    <div style={{ marginTop: '16px' }}>
      <strong>Updated items:</strong>
      <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
        <li>Project Title → "New Project"</li>
        <li>Status → "Active"</li>
        <li>Assigned To → John Doe</li>
      </ul>
    </div>
  </div>,
  { title: 'Success', buttonText: 'Close' }
);`;

const CONFIRM_BASIC_EXAMPLE = `import { confirm } from 'spfx-toolkit/utilities/dialogService';

async function deleteItem() {
  const result = await confirm('Are you sure you want to delete this item?');

  if (result) {
    // User clicked OK
    await performDelete();
  } else {
    // User clicked Cancel or dismissed
    console.log('Cancelled');
  }
}`;

const CONFIRM_CUSTOM_EXAMPLE = `import { confirm } from 'spfx-toolkit/utilities/dialogService';

async function handleDocumentAction() {
  const choice = await confirm('Choose an option:', {
    title: 'Document Actions',
    buttons: [
      { text: 'Download', primary: true, value: 'download' },
      { text: 'Share', value: 'share' },
      { text: 'Delete', value: 'delete' },
      { text: 'Cancel', value: null }
    ]
  });

  switch (choice) {
    case 'download':
      await downloadDocument();
      break;
    case 'share':
      await shareDocument();
      break;
    case 'delete':
      const confirmDelete = await confirm('Are you sure?', {
        title: 'Confirm Delete'
      });
      if (confirmDelete) {
        await deleteDocument();
      }
      break;
  }
}`;

const CONFIRM_JSX_EXAMPLE = `import { confirm } from 'spfx-toolkit/utilities/dialogService';
import { Icon } from '@fluentui/react';
import * as React from 'react';

const result = await confirm(
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <Icon
        iconName="Warning"
        style={{ fontSize: '24px', color: '#d13438', flexShrink: 0 }}
      />
      <div>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>
          This action will permanently delete the following items:
        </div>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Project Document.docx</li>
          <li>Budget Spreadsheet.xlsx</li>
          <li>Meeting Notes.txt</li>
        </ul>
        <div style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#fef0f1',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <strong>Note:</strong> This action cannot be undone.
        </div>
      </div>
    </div>
  </div>,
  {
    title: <span style={{ color: '#d13438' }}>⚠️ Confirm Deletion</span>,
    buttons: [
      {
        text: 'Delete',
        primary: true,
        value: true,
        props: {
          styles: {
            root: { backgroundColor: '#a4262c', borderColor: '#a4262c' }
          }
        }
      },
      { text: 'Cancel', value: false }
    ]
  }
);`;

const ISDISMISSABLE_EXAMPLE = `import { alert, confirm } from 'spfx-toolkit/utilities/dialogService';

// Dismissable (default behavior)
await alert('This can be dismissed with ESC or backdrop click', {
  title: 'Info',
  isDismissable: true  // This is the default
});

// Non-dismissable - requires button click
await alert('You must click the button to continue', {
  title: 'Important',
  isDismissable: false  // Cannot dismiss with ESC or backdrop
});

// Confirm with non-dismissable
const choice = await confirm('You must make a choice', {
  title: 'Required Action',
  buttons: [
    { text: 'Accept', primary: true, value: 'accept' },
    { text: 'Decline', value: 'decline' }
  ],
  isDismissable: false  // User must click a button
});`;

export const DialogServiceShowcase: React.FC = () => {
  const [customMessage, setCustomMessage] = useState<string>('Loading your data...');
  const [customTitle, setCustomTitle] = useState<string>('Custom Alert');
  const [customAlertMessage, setCustomAlertMessage] = useState<string>(
    'This is a custom alert message!'
  );
  const [alertIsDismissable, setAlertIsDismissable] = useState<boolean>(true);
  const [confirmIsDismissable, setConfirmIsDismissable] = useState<boolean>(true);

  // Loading demos
  const handleBasicLoading = async (): Promise<void> => {
    try {
      showLoading('Loading data...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      hideLoading();
    }
  };

  const handleComponentLoading = async (containerId: string, message: string): Promise<void> => {
    try {
      showLoading(message, { containerId });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      hideLoading(containerId);
    }
  };

  const handleMultipleComponentLoading = async (): Promise<void> => {
    // Load three components in parallel
    await Promise.all([
      handleComponentLoading('demo-card-1', 'Loading Card 1...'),
      handleComponentLoading('demo-card-2', 'Loading Card 2...'),
      handleComponentLoading('demo-card-3', 'Loading Card 3...'),
    ]);
  };

  // Custom icon demos
  const handleCustomIconLoading = async (): Promise<void> => {
    try {
      showLoading('Processing with custom icon...', {
        customIcon: (
          <Icon iconName="Sync" style={{ fontSize: '48px', color: '#0078d4', animation: 'spin 1s linear infinite' }} />
        ),
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      hideLoading();
    }
  };

  const handleStaticIconLoading = async (): Promise<void> => {
    try {
      showLoading('Please wait...', {
        customIcon: <Icon iconName="HourGlass" style={{ fontSize: '48px', color: '#ff8c00' }} />,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      hideLoading();
    }
  };

  const handleCustomSpinnerLoading = async (): Promise<void> => {
    try {
      const CustomSpinner = () => (
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #0078d4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      );
      showLoading('Loading with custom CSS spinner...', {
        customIcon: <CustomSpinner />,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      hideLoading();
    }
  };

  const handleFrequentUpdatesWithCustomIcon = async (): Promise<void> => {
    try {
      const CustomIcon = () => (
        <Icon iconName="ProgressRingDots" style={{ fontSize: '48px', color: '#0078d4' }} />
      );

      for (let i = 1; i <= 10; i++) {
        showLoading(`Processing step ${i} of 10...`, {
          customIcon: <CustomIcon />,
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } finally {
      hideLoading();
    }
  };

  const handleCustomLoading = async (): Promise<void> => {
    try {
      showLoading(customMessage);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      hideLoading();
    }
  };

  const handleMultiStepLoading = async (): Promise<void> => {
    try {
      showLoading('Step 1: Validating...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showLoading('Step 2: Processing data...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showLoading('Step 3: Saving...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      hideLoading();
      await alert('Operation completed successfully!', { title: 'Success' });
    } catch (error) {
      hideLoading();
      await alert(`Error: ${error.message}`, { title: 'Error' });
    }
  };

  const handleJSXLoading = async (): Promise<void> => {
    try {
      const totalFiles = 10;
      for (let i = 1; i <= totalFiles; i++) {
        const progress = (i / totalFiles) * 100;
        showLoading(
          <div style={{ textAlign: 'center', minWidth: '300px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
              Uploading Files
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#edebe9',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#0078d4',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '13px', color: '#605e5c' }}>
              {i} of {totalFiles} files ({Math.round(progress)}% complete)
            </div>
          </div>
        );
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    } finally {
      hideLoading();
      await alert('All files uploaded successfully!', { title: 'Upload Complete' });
    }
  };

  // Alert demos
  const handleBasicAlert = async (): Promise<void> => {
    await alert('This is a simple alert message!');
  };

  const handleCustomAlert = async (): Promise<void> => {
    await alert(customAlertMessage, {
      title: customTitle,
      buttonText: 'Got it',
      isDismissable: alertIsDismissable,
    });
  };

  const handleNonDismissableAlert = async (): Promise<void> => {
    await alert(
      <div>
        <p style={{ marginBottom: '12px' }}>
          <strong>Important Notice:</strong> You must click the button to continue.
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#605e5c' }}>
          This dialog cannot be dismissed by clicking outside or pressing ESC. This is useful for
          critical messages that require acknowledgment.
        </p>
      </div>,
      {
        title: 'Non-Dismissable Alert',
        buttonText: 'I Understand',
        isDismissable: false,
      }
    );
  };

  const handleSuccessAlert = async (): Promise<void> => {
    await alert(
      <div>
        <MessageBar messageBarType={MessageBarType.success}>
          Your changes have been saved successfully!
        </MessageBar>
        <div style={{ marginTop: '16px' }}>
          <strong>Updated items:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Project Title updated</li>
            <li>Status changed to Active</li>
            <li>3 files uploaded</li>
          </ul>
        </div>
      </div>,
      { title: 'Success', buttonText: 'Close' }
    );
  };

  const handleErrorAlert = async (): Promise<void> => {
    await alert(
      <div>
        <div style={{ color: '#a4262c', fontWeight: 600, marginBottom: '12px' }}>
          The following errors occurred:
        </div>
        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
          <li>Title field is required</li>
          <li>Due date must be in the future</li>
          <li>Budget cannot exceed $100,000</li>
        </ul>
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#fef0f1',
            borderRadius: '4px',
          }}
        >
          <strong>Next steps:</strong> Please correct the errors above and try again.
        </div>
      </div>,
      { title: 'Validation Failed' }
    );
  };

  // Confirm demos
  const handleBasicConfirm = async (): Promise<void> => {
    const result = await confirm('Are you sure you want to proceed?', {
      isDismissable: confirmIsDismissable,
    });
    await alert(`You clicked: ${result ? 'OK' : 'Cancel'}`, { title: 'Result' });
  };

  const handleCustomConfirm = async (): Promise<void> => {
    const result = await confirm('This action cannot be undone.', {
      title: 'Delete Confirmation',
      buttons: [
        { text: 'Delete', primary: true, value: true },
        { text: 'Cancel', value: false },
      ],
      isDismissable: confirmIsDismissable,
    });
    await alert(`You clicked: ${result ? 'Delete' : 'Cancel'}`, { title: 'Result' });
  };

  const handleNonDismissableConfirm = async (): Promise<void> => {
    const result = await confirm(
      <div>
        <p style={{ marginBottom: '12px' }}>
          <strong>Critical Action:</strong> You must make a choice.
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#605e5c' }}>
          This dialog cannot be dismissed without selecting an option. Click outside or press ESC -
          nothing will happen!
        </p>
      </div>,
      {
        title: 'Required Decision',
        buttons: [
          { text: 'Accept', primary: true, value: 'accept' },
          { text: 'Decline', value: 'decline' },
        ],
        isDismissable: false,
      }
    );
    await alert(`You chose: ${result}`, { title: 'Result' });
  };

  const handleMultiChoiceConfirm = async (): Promise<void> => {
    const choice = await confirm('Choose an option:', {
      title: 'Document Actions',
      buttons: [
        { text: 'Download', primary: true, value: 'download' },
        { text: 'Share', value: 'share' },
        { text: 'Delete', value: 'delete' },
        { text: 'Cancel', value: null },
      ],
    });

    if (choice) {
      await alert(`You selected: ${choice}`, { title: 'Action Result' });
    } else {
      await alert('Action cancelled', { title: 'Cancelled' });
    }
  };

  const handleStyledConfirm = async (): Promise<void> => {
    const result = await confirm(
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Icon
            iconName="Warning"
            style={{ fontSize: '24px', color: '#d13438', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
              This action will permanently delete the following items:
            </div>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Project Document.docx</li>
              <li>Budget Spreadsheet.xlsx</li>
              <li>Meeting Notes.txt</li>
            </ul>
            <div
              style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#fef0f1',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              <strong>Note:</strong> This action cannot be undone.
            </div>
          </div>
        </div>
      </div>,
      {
        title: <span style={{ color: '#d13438' }}>Warning: Confirm Deletion</span>,
        buttons: [
          {
            text: 'Delete',
            primary: true,
            value: true,
            props: {
              styles: { root: { backgroundColor: '#a4262c', borderColor: '#a4262c' } },
            },
          },
          { text: 'Cancel', value: false },
        ],
      }
    );

    await alert(`You clicked: ${result ? 'Delete' : 'Cancel'}`, { title: 'Result' });
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <ShowcaseHero
        title="Dialog Service"
        subtitle="Comprehensive utility for loading overlays, alerts, and confirm dialogs in SPFx applications"
        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        badges={['Loading Overlay', 'Alert', 'Confirm', 'JSX Support']}
        icon="💬"
      />

      <MessageBar messageBarType={MessageBarType.info} style={{ marginBottom: '24px' }}>
        DialogService provides a promise-based API for showing loading overlays, alerts, and
        confirmation dialogs with support for both simple text and rich JSX content.
      </MessageBar>

      {/* Loading Overlay Demos */}
      <Card id="loading-demos" elevation={3} defaultExpanded style={{ marginBottom: '24px' }}>
        <Header variant="info">Loading Overlay Demos</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Basic Loading</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Show a simple loading overlay with a text message.
              </p>
              <PrimaryButton text="Show Basic Loading" onClick={handleBasicLoading} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Custom Message</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Customize the loading message dynamically.
              </p>
              <TextField
                value={customMessage}
                onChange={(_, val) => setCustomMessage(val || '')}
                placeholder="Enter custom message"
                style={{ marginBottom: '12px', maxWidth: '400px' }}
              />
              <PrimaryButton text="Show Custom Loading" onClick={handleCustomLoading} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Multi-Step Process</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Update the loading message during a multi-step operation.
              </p>
              <PrimaryButton text="Run Multi-Step Process" onClick={handleMultiStepLoading} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                JSX Content with Progress Bar
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Show rich JSX content including a progress bar during file upload simulation.
              </p>
              <PrimaryButton text="Simulate File Upload" onClick={handleJSXLoading} />
            </div>
          </div>
        </Content>
      </Card>

      {/* Custom Icon Demos */}
      <Card
        id="custom-icon-demos"
        elevation={3}
        defaultExpanded
        style={{ marginBottom: '24px' }}
      >
        <Header variant="warning">Custom Icon/Spinner</Header>
        <Content padding="comfortable">
          <MessageBar messageBarType={MessageBarType.info} style={{ marginBottom: '16px' }}>
            Replace the default Fluent UI Spinner with your own custom icons, brand spinners, or
            animated elements. This is especially useful when updating loading messages frequently to
            prevent spinner animation restarts.
          </MessageBar>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Custom Animated Icon</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Use a Fluent UI icon with custom animation instead of the default spinner.
              </p>
              <PrimaryButton text="Show Custom Animated Icon" onClick={handleCustomIconLoading} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Static Icon (No Animation)</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Display a static icon without any animation for a simpler loading indicator.
              </p>
              <DefaultButton text="Show Static Icon" onClick={handleStaticIconLoading} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Custom CSS Spinner</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Create a custom spinner using pure CSS animations - perfect for brand-specific
                designs.
              </p>
              <DefaultButton text="Show Custom CSS Spinner" onClick={handleCustomSpinnerLoading} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                Frequent Updates with Custom Icon
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                When updating loading messages frequently (like progress tracking), use customIcon to
                prevent the spinner from restarting its animation on each update.
              </p>
              <PrimaryButton
                text="Show Frequent Updates"
                onClick={handleFrequentUpdatesWithCustomIcon}
              />
            </div>

            <div
              style={{
                padding: '16px',
                backgroundColor: '#fff4ce',
                borderRadius: '6px',
                border: '1px solid #ffb900',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', color: '#323130', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon iconName="Info" style={{ color: '#ffb900' }} />
                Why Use Custom Icons?
              </h4>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '14px', color: '#605e5c' }}>
                <li>
                  <strong>Brand consistency:</strong> Use your brand's loading animations
                </li>
                <li>
                  <strong>Prevent animation restarts:</strong> When updating messages frequently, the
                  default spinner restarts its animation, causing visual glitches
                </li>
                <li>
                  <strong>Static alternatives:</strong> Use static icons when animation is not needed
                  or desired
                </li>
                <li>
                  <strong>Full control:</strong> Complete control over size, color, and animation
                  behavior
                </li>
              </ul>
            </div>

            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        </Content>
      </Card>

      {/* Component-Level Loading Demos */}
      <Card
        id="component-loading-demos"
        elevation={3}
        defaultExpanded
        style={{ marginBottom: '24px' }}
      >
        <Header variant="success">Component-Level Loading (Scoped)</Header>
        <Content padding="comfortable">
          <MessageBar messageBarType={MessageBarType.info} style={{ marginBottom: '16px' }}>
            Component-level loading allows you to show a loading overlay scoped to a specific
            container element instead of blocking the entire page. This is perfect for loading
            individual sections, cards, or charts independently.
          </MessageBar>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                Single Component Loading
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Click the button to show a loading overlay scoped to just the card below. The rest
                of the page remains interactive.
              </p>
              <PrimaryButton
                text="Load Component 1"
                onClick={() => handleComponentLoading('demo-card-1', 'Loading data...')}
                style={{ marginBottom: '16px' }}
              />

              <div
                id="demo-card-1"
                style={{
                  position: 'relative',
                  padding: '24px',
                  border: '2px solid #0078d4',
                  borderRadius: '8px',
                  backgroundColor: '#f3f2f1',
                  minHeight: '150px',
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', color: '#323130' }}>Demo Card 1</h4>
                <p style={{ margin: '0', color: '#605e5c' }}>
                  This card has a scoped loading overlay. When loading, only this card area will be
                  blocked with a semi-transparent overlay. The loading overlay is rendered inside
                  this container using React portals.
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                Multiple Components Loading Simultaneously
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Load multiple sections in parallel, each with its own scoped loading overlay. This
                demonstrates how different parts of your UI can load independently.
              </p>
              <PrimaryButton
                text="Load All Three Cards"
                onClick={handleMultipleComponentLoading}
                style={{ marginBottom: '16px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div
                  id="demo-card-2"
                  style={{
                    position: 'relative',
                    padding: '20px',
                    border: '2px solid #107c10',
                    borderRadius: '8px',
                    backgroundColor: '#f3f2f1',
                    minHeight: '120px',
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', color: '#323130' }}>Card 2</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#605e5c' }}>
                    Independent loading area with its own overlay.
                  </p>
                </div>

                <div
                  id="demo-card-3"
                  style={{
                    position: 'relative',
                    padding: '20px',
                    border: '2px solid #ff8c00',
                    borderRadius: '8px',
                    backgroundColor: '#f3f2f1',
                    minHeight: '120px',
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', color: '#323130' }}>Card 3</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#605e5c' }}>
                    Another independent loading area.
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                backgroundColor: '#fff4ce',
                borderRadius: '6px',
                border: '1px solid #ffb900',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', color: '#323130', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon iconName="Info" style={{ color: '#ffb900' }} />
                Important: Container Positioning
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#605e5c' }}>
                For component-level loading to work properly, the container element must have{' '}
                <code style={{ backgroundColor: '#edebe9', padding: '2px 6px', borderRadius: '3px' }}>
                  position: relative
                </code>{' '}
                or{' '}
                <code style={{ backgroundColor: '#edebe9', padding: '2px 6px', borderRadius: '3px' }}>
                  position: absolute
                </code>
                . The loading overlay uses absolute positioning to cover the entire container.
              </p>
            </div>
          </div>
        </Content>
      </Card>

      {/* Alert Dialog Demos */}
      <Card id="alert-demos" elevation={3} defaultExpanded style={{ marginBottom: '24px' }}>
        <Header variant="success">Alert Dialog Demos</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Basic Alert</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Show a simple alert with default title and button.
              </p>
              <PrimaryButton text="Show Basic Alert" onClick={handleBasicAlert} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Custom Alert</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Customize the title, message, button text, and dismissable behavior.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                <TextField
                  label="Title"
                  value={customTitle}
                  onChange={(_, val) => setCustomTitle(val || '')}
                  style={{ maxWidth: '400px' }}
                />
                <TextField
                  label="Message"
                  value={customAlertMessage}
                  onChange={(_, val) => setCustomAlertMessage(val || '')}
                  multiline
                  rows={3}
                  style={{ maxWidth: '400px' }}
                />
                <Toggle
                  label="Is Dismissable"
                  checked={alertIsDismissable}
                  onChange={(_, checked) => setAlertIsDismissable(checked || false)}
                  onText="Yes (can press ESC or click outside)"
                  offText="No (must click button)"
                  styles={{ root: { maxWidth: '400px' } }}
                />
              </div>
              <PrimaryButton text="Show Custom Alert" onClick={handleCustomAlert} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                Non-Dismissable Alert (isDismissable: false)
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Force users to acknowledge critical messages by clicking the button. Cannot be
                dismissed with ESC or clicking the backdrop.
              </p>
              <DefaultButton
                text="Show Non-Dismissable Alert"
                onClick={handleNonDismissableAlert}
                iconProps={{ iconName: 'Lock' }}
              />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Success Alert with JSX</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Show a success message with rich JSX content including MessageBar and list.
              </p>
              <PrimaryButton text="Show Success Alert" onClick={handleSuccessAlert} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Error Alert with JSX</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Show an error message with validation errors and instructions.
              </p>
              <DefaultButton text="Show Error Alert" onClick={handleErrorAlert} />
            </div>
          </div>
        </Content>
      </Card>

      {/* Confirm Dialog Demos */}
      <Card id="confirm-demos" elevation={3} defaultExpanded style={{ marginBottom: '24px' }}>
        <Header variant="warning">Confirm Dialog Demos</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Basic Confirmation</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Simple yes/no confirmation with default buttons. Toggle dismissable behavior below.
              </p>
              <div style={{ marginBottom: '12px' }}>
                <Toggle
                  label="Is Dismissable"
                  checked={confirmIsDismissable}
                  onChange={(_, checked) => setConfirmIsDismissable(checked || false)}
                  onText="Yes (can press ESC or click outside)"
                  offText="No (must choose an option)"
                  styles={{ root: { maxWidth: '400px' } }}
                />
              </div>
              <PrimaryButton text="Show Basic Confirm" onClick={handleBasicConfirm} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                Custom Title and Buttons
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Customize the title and button labels. Uses the toggle setting above.
              </p>
              <PrimaryButton text="Show Custom Confirm" onClick={handleCustomConfirm} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                Non-Dismissable Confirm (isDismissable: false)
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Force users to make a decision. Try clicking outside or pressing ESC - it won't
                close!
              </p>
              <DefaultButton
                text="Show Non-Dismissable Confirm"
                onClick={handleNonDismissableConfirm}
                iconProps={{ iconName: 'Lock' }}
              />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Multiple Choices</h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Present multiple action options to the user.
              </p>
              <PrimaryButton text="Show Multi-Choice Confirm" onClick={handleMultiChoiceConfirm} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
                Styled Confirm with JSX
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#605e5c' }}>
                Rich JSX content with icons, custom styling, and danger button.
              </p>
              <DefaultButton text="Show Styled Confirm" onClick={handleStyledConfirm} />
            </div>
          </div>
        </Content>
      </Card>

      {/* Best Practices */}
      <Card id="best-practices" elevation={3} style={{ marginBottom: '24px' }}>
        <Header variant="default">Best Practices</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#323130' }}>
                1. Always Hide Loading in Finally Block
              </h4>
              <p style={{ margin: '0', color: '#605e5c', fontSize: '14px' }}>
                Ensure loading overlay is hidden even if an error occurs by using a finally block.
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#323130' }}>2. Use Async/Await</h4>
              <p style={{ margin: '0', color: '#605e5c', fontSize: '14px' }}>
                Use async/await pattern instead of then/catch chains for cleaner code.
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#323130' }}>
                3. Provide Clear Messages
              </h4>
              <p style={{ margin: '0', color: '#605e5c', fontSize: '14px' }}>
                Use specific, actionable messages instead of vague ones like "Please wait..." or
                "Done".
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#323130' }}>
                4. Use Meaningful Button Values
              </h4>
              <p style={{ margin: '0', color: '#605e5c', fontSize: '14px' }}>
                Return meaningful values from confirm buttons (e.g., 'save', 'delete') instead of
                generic numbers or booleans.
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#323130' }}>
                5. Handle Dismissal Properly
              </h4>
              <p style={{ margin: '0', color: '#605e5c', fontSize: '14px' }}>
                Check for null/undefined return values when users dismiss multi-button confirm
                dialogs.
              </p>
            </div>
          </div>
        </Content>
      </Card>

      <ShowcaseKeyFeatures features={FEATURES} />

      <ShowcaseCodeSample
        id="loading-basic"
        title="Loading Overlay - Basic Usage"
        description="Show a loading overlay during async operations with automatic cleanup"
        code={LOADING_BASIC_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="loading-jsx"
        title="Loading Overlay - JSX with Progress Bar"
        description="Display rich content including progress bars and dynamic updates"
        code={LOADING_JSX_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="alert-basic"
        title="Alert Dialog - Basic Usage"
        description="Show simple informational messages to users"
        code={ALERT_BASIC_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="alert-jsx"
        title="Alert Dialog - Rich JSX Content"
        description="Display detailed information with MessageBar components and formatted lists"
        code={ALERT_JSX_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="confirm-basic"
        title="Confirm Dialog - Basic Usage"
        description="Simple yes/no confirmation dialogs with promise-based API"
        code={CONFIRM_BASIC_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="confirm-custom"
        title="Confirm Dialog - Multiple Choices"
        description="Present multiple action options and handle user choice"
        code={CONFIRM_CUSTOM_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="confirm-jsx"
        title="Confirm Dialog - Styled with JSX"
        description="Create rich confirmation dialogs with icons, warnings, and custom button styling"
        code={CONFIRM_JSX_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="isdismissable"
        title="isDismissable Property"
        description="Control whether dialogs can be dismissed with ESC or backdrop click. Set to false for critical actions that require user acknowledgment."
        code={ISDISMISSABLE_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="component-loading"
        title="Component-Level Loading (Scoped)"
        description="Show loading overlays scoped to specific container elements instead of blocking the entire page. Perfect for loading individual sections independently."
        code={COMPONENT_LOADING_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="multiple-loaders"
        title="Multiple Component Loaders in Parallel"
        description="Load multiple sections simultaneously, each with its own scoped loading overlay. Ideal for dashboards with multiple data sources."
        code={MULTIPLE_LOADERS_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="custom-icon"
        title="Custom Icon/Spinner"
        description="Replace the default Fluent UI Spinner with custom icons, brand spinners, or static indicators. Perfect for maintaining brand consistency."
        code={CUSTOM_ICON_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="custom-icon-progress"
        title="Custom Icon with Frequent Updates"
        description="Use customIcon when updating loading messages frequently to prevent spinner animation restarts and visual glitches."
        code={CUSTOM_ICON_PROGRESS_EXAMPLE}
        language="tsx"
      />
    </div>
  );
};
