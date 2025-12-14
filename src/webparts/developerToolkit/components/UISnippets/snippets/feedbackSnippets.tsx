// Feedback Snippets - Success, Warning, Error, Info, Loading, Permission, etc.

import * as React from 'react';
import { Icon, Spinner, SpinnerSize, Link, PrimaryButton, DefaultButton } from '@fluentui/react';
import { ISnippet } from '../types';

export const feedbackSnippets: ISnippet[] = [
  {
    id: 'success-message',
    title: 'Success Message',
    description: 'Green success message with checkmark icon',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#dff6dd',
    border: '1px solid #107c10',
    borderRadius: '4px',
    color: '#107c10',
  }}
>
  <Icon iconName="CheckMark" style={{ fontSize: '16px' }} />
  <span>Operation completed successfully!</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: '#dff6dd',
          border: '1px solid #107c10',
          borderRadius: '4px',
          color: '#107c10',
        }}
      >
        <Icon iconName="CheckMark" style={{ fontSize: '16px' }} />
        <span>Operation completed successfully!</span>
      </div>
    ),
  },
  {
    id: 'success-with-actions',
    title: 'Success with Actions',
    description: 'Success message with title, description, and action buttons',
    category: 'feedback',
    code: `<div
  style={{
    padding: '16px',
    background: '#dff6dd',
    border: '1px solid #107c10',
    borderRadius: '4px',
  }}
>
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
    <Icon iconName="CompletedSolid" style={{ fontSize: '24px', color: '#107c10' }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, color: '#0b6a0b', marginBottom: '4px' }}>
        Item Created Successfully
      </div>
      <div style={{ fontSize: '13px', color: '#107c10', marginBottom: '12px' }}>
        Your new item has been created and is now available in the list.
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <PrimaryButton text="View Item" styles={{ root: { height: '28px' } }} />
        <DefaultButton text="Create Another" styles={{ root: { height: '28px' } }} />
      </div>
    </div>
  </div>
</div>`,
    preview: (
      <div
        style={{
          padding: '14px',
          background: '#dff6dd',
          border: '1px solid #107c10',
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Icon iconName="CompletedSolid" style={{ fontSize: '20px', color: '#107c10' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#0b6a0b', marginBottom: '4px', fontSize: '13px' }}>
              Item Created Successfully
            </div>
            <div style={{ fontSize: '11px', color: '#107c10', marginBottom: '10px' }}>
              Your new item has been created and is now available in the list.
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <PrimaryButton text="View Item" styles={{ root: { height: '24px', minWidth: 0, padding: '0 10px' }, label: { fontSize: '11px' } }} />
              <DefaultButton text="Create Another" styles={{ root: { height: '24px', minWidth: 0, padding: '0 10px' }, label: { fontSize: '11px' } }} />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'warning-message',
    title: 'Warning Message',
    description: 'Amber warning message with warning icon',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#fff4ce',
    border: '1px solid #ffaa44',
    borderRadius: '4px',
    color: '#8a6d3b',
  }}
>
  <Icon iconName="Warning" style={{ fontSize: '16px', color: '#ffaa44' }} />
  <span>Please review before proceeding.</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: '#fff4ce',
          border: '1px solid #ffaa44',
          borderRadius: '4px',
          color: '#8a6d3b',
        }}
      >
        <Icon iconName="Warning" style={{ fontSize: '16px', color: '#ffaa44' }} />
        <span>Please review before proceeding.</span>
      </div>
    ),
  },
  {
    id: 'error-message',
    title: 'Error Message',
    description: 'Red error message with error icon',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#fde7e9',
    border: '1px solid #a80000',
    borderRadius: '4px',
    color: '#a80000',
  }}
>
  <Icon iconName="ErrorBadge" style={{ fontSize: '16px' }} />
  <span>An error occurred. Please try again.</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: '#fde7e9',
          border: '1px solid #a80000',
          borderRadius: '4px',
          color: '#a80000',
        }}
      >
        <Icon iconName="ErrorBadge" style={{ fontSize: '16px' }} />
        <span>An error occurred. Please try again.</span>
      </div>
    ),
  },
  {
    id: 'error-with-retry',
    title: 'Error with Retry',
    description: 'Error message with title, description, and retry button',
    category: 'feedback',
    code: `<div
  style={{
    padding: '16px',
    background: '#fde7e9',
    border: '1px solid #a80000',
    borderRadius: '4px',
  }}
>
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
    <Icon iconName="ErrorBadge" style={{ fontSize: '24px', color: '#a80000' }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, color: '#a80000', marginBottom: '4px' }}>
        Failed to Load Data
      </div>
      <div style={{ fontSize: '13px', color: '#6e0000', marginBottom: '12px' }}>
        Unable to connect to the server. Please check your connection and try again.
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <DefaultButton text="Retry" iconProps={{ iconName: 'Refresh' }} />
      </div>
    </div>
  </div>
</div>`,
    preview: (
      <div
        style={{
          padding: '14px',
          background: '#fde7e9',
          border: '1px solid #a80000',
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Icon iconName="ErrorBadge" style={{ fontSize: '20px', color: '#a80000' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#a80000', marginBottom: '4px', fontSize: '13px' }}>
              Failed to Load Data
            </div>
            <div style={{ fontSize: '11px', color: '#6e0000', marginBottom: '10px' }}>
              Unable to connect to the server. Please check your connection.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <DefaultButton text="Retry" iconProps={{ iconName: 'Refresh' }} styles={{ root: { height: '24px', minWidth: 0, padding: '0 10px' }, label: { fontSize: '11px' } }} />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'permission-denied',
    title: 'Permission Denied',
    description: 'Access denied message with contact link',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
  }}
>
  <Icon iconName="BlockedSite" style={{ fontSize: '48px', color: '#a80000', marginBottom: '16px' }} />
  <div style={{ fontSize: '18px', fontWeight: 600, color: '#323130', marginBottom: '8px' }}>
    Access Denied
  </div>
  <div style={{ fontSize: '14px', color: '#605e5c', marginBottom: '16px', maxWidth: '400px' }}>
    You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
  </div>
  <div style={{ display: 'flex', gap: '8px' }}>
    <PrimaryButton text="Request Access" iconProps={{ iconName: 'AddFriend' }} />
    <DefaultButton text="Go Back" iconProps={{ iconName: 'Back' }} />
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <Icon iconName="BlockedSite" style={{ fontSize: '32px', color: '#a80000', marginBottom: '10px' }} />
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#323130', marginBottom: '4px' }}>
          Access Denied
        </div>
        <div style={{ fontSize: '11px', color: '#605e5c', marginBottom: '12px' }}>
          You don't have permission to access this resource.
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <PrimaryButton text="Request Access" styles={{ root: { height: '26px', minWidth: 0, padding: '0 10px' }, label: { fontSize: '11px' } }} />
          <DefaultButton text="Go Back" styles={{ root: { height: '26px', minWidth: 0, padding: '0 10px' }, label: { fontSize: '11px' } }} />
        </div>
      </div>
    ),
  },
  {
    id: 'not-found',
    title: 'Not Found (404)',
    description: 'Resource not found message',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
  }}
>
  <Icon iconName="SearchIssue" style={{ fontSize: '48px', color: '#605e5c', marginBottom: '16px', opacity: 0.6 }} />
  <div style={{ fontSize: '18px', fontWeight: 600, color: '#323130', marginBottom: '8px' }}>
    Page Not Found
  </div>
  <div style={{ fontSize: '14px', color: '#605e5c', marginBottom: '16px' }}>
    The page you're looking for doesn't exist or has been moved.
  </div>
  <Link href="/" style={{ fontSize: '14px' }}>
    Return to Home
  </Link>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <Icon iconName="SearchIssue" style={{ fontSize: '32px', color: '#605e5c', marginBottom: '10px', opacity: 0.6 }} />
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#323130', marginBottom: '4px' }}>
          Page Not Found
        </div>
        <div style={{ fontSize: '11px', color: '#605e5c', marginBottom: '10px' }}>
          The page you're looking for doesn't exist.
        </div>
        <Link style={{ fontSize: '11px' }}>Return to Home</Link>
      </div>
    ),
  },
  {
    id: 'info-message',
    title: 'Info Message',
    description: 'Blue informational message with info icon',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#deecf9',
    border: '1px solid #0078d4',
    borderRadius: '4px',
    color: '#0078d4',
  }}
>
  <Icon iconName="Info" style={{ fontSize: '16px' }} />
  <span>This is some helpful information.</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: '#deecf9',
          border: '1px solid #0078d4',
          borderRadius: '4px',
          color: '#0078d4',
        }}
      >
        <Icon iconName="Info" style={{ fontSize: '16px' }} />
        <span>This is some helpful information.</span>
      </div>
    ),
  },
  {
    id: 'info-with-link',
    title: 'Info with Link',
    description: 'Info message with learn more link',
    category: 'feedback',
    code: `<div
  style={{
    padding: '16px',
    background: '#deecf9',
    border: '1px solid #0078d4',
    borderRadius: '4px',
  }}
>
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
    <Icon iconName="Info" style={{ fontSize: '20px', color: '#0078d4' }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, color: '#004578', marginBottom: '4px' }}>
        New Feature Available
      </div>
      <div style={{ fontSize: '13px', color: '#0078d4', marginBottom: '8px' }}>
        We've added new functionality to improve your workflow.
      </div>
      <Link href="#" style={{ fontSize: '13px' }}>Learn more</Link>
    </div>
  </div>
</div>`,
    preview: (
      <div
        style={{
          padding: '12px',
          background: '#deecf9',
          border: '1px solid #0078d4',
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Icon iconName="Info" style={{ fontSize: '16px', color: '#0078d4' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#004578', marginBottom: '2px', fontSize: '12px' }}>
              New Feature Available
            </div>
            <div style={{ fontSize: '11px', color: '#0078d4', marginBottom: '6px' }}>
              We've added new functionality to improve your workflow.
            </div>
            <Link style={{ fontSize: '11px' }}>Learn more</Link>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'loading-state',
    title: 'Loading State',
    description: 'Spinner with loading text',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
    color: '#605e5c',
  }}
>
  <Spinner size={SpinnerSize.medium} />
  <span>Loading data...</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '20px',
          color: '#605e5c',
        }}
      >
        <Spinner size={SpinnerSize.medium} />
        <span>Loading data...</span>
      </div>
    ),
  },
  {
    id: 'loading-overlay',
    title: 'Loading Overlay',
    description: 'Full container loading overlay',
    category: 'feedback',
    code: `<div style={{ position: 'relative', minHeight: '200px' }}>
  {/* Your content here */}
  <div style={{ padding: '20px' }}>Content behind overlay</div>

  {/* Loading overlay */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    }}
  >
    <Spinner size={SpinnerSize.large} />
    <span style={{ color: '#605e5c' }}>Saving changes...</span>
  </div>
</div>`,
    preview: (
      <div style={{ position: 'relative', minHeight: '100px' }}>
        <div style={{ padding: '12px', fontSize: '12px' }}>Content behind overlay</div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Spinner size={SpinnerSize.medium} />
          <span style={{ color: '#605e5c', fontSize: '11px' }}>Saving changes...</span>
        </div>
      </div>
    ),
  },
  {
    id: 'progress-ring',
    title: 'Progress Ring',
    description: 'Circular progress indicator with percentage',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
  }}
>
  <div style={{ position: 'relative', width: '60px', height: '60px' }}>
    {/* Background circle */}
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle
        cx="30"
        cy="30"
        r="26"
        fill="none"
        stroke="#edebe9"
        strokeWidth="8"
      />
      {/* Progress circle */}
      <circle
        cx="30"
        cy="30"
        r="26"
        fill="none"
        stroke="#0078d4"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="163.36"
        strokeDashoffset={163.36 * (1 - 0.75)}
        transform="rotate(-90 30 30)"
      />
    </svg>
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 600, fontSize: '14px' }}>
      75%
    </div>
  </div>
  <div>
    <div style={{ fontWeight: 600 }}>Uploading...</div>
    <div style={{ fontSize: '13px', color: '#605e5c' }}>75% complete</div>
  </div>
</div>`,
    preview: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
        <div style={{ position: 'relative', width: '40px', height: '40px' }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#edebe9" strokeWidth="6" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#0078d4" strokeWidth="6" strokeLinecap="round" strokeDasharray="100.53" strokeDashoffset={100.53 * 0.25} transform="rotate(-90 20 20)" />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 600, fontSize: '10px' }}>75%</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '11px' }}>Uploading...</div>
          <div style={{ fontSize: '10px', color: '#605e5c' }}>75% complete</div>
        </div>
      </div>
    ),
  },
  {
    id: 'inline-notification',
    title: 'Inline Notification',
    description: 'Toast-style notification with dismiss',
    category: 'feedback',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#dff6dd',
    border: '1px solid #107c10',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }}
>
  <Icon iconName="CheckMark" style={{ fontSize: '16px', color: '#107c10' }} />
  <span style={{ flex: 1, color: '#107c10' }}>Changes saved successfully!</span>
  <IconButton
    iconProps={{ iconName: 'Cancel' }}
    styles={{ root: { width: 24, height: 24 }, icon: { fontSize: 12 } }}
    onClick={() => setShowNotification(false)}
  />
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: '#dff6dd',
          border: '1px solid #107c10',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Icon iconName="CheckMark" style={{ fontSize: '12px', color: '#107c10' }} />
        <span style={{ flex: 1, color: '#107c10', fontSize: '11px' }}>Changes saved!</span>
        <Icon iconName="Cancel" style={{ fontSize: '10px', color: '#107c10', cursor: 'pointer' }} />
      </div>
    ),
  },
  {
    id: 'validation-message',
    title: 'Validation Message',
    description: 'Field-level error/success validation',
    category: 'feedback',
    code: `{/* Error state */}
<div style={{ marginBottom: '16px' }}>
  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Email</label>
  <input
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #a80000',
      borderRadius: '4px',
      outline: 'none',
    }}
    value="invalid-email"
  />
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#a80000', fontSize: '12px' }}>
    <Icon iconName="ErrorBadge" style={{ fontSize: '12px' }} />
    <span>Please enter a valid email address</span>
  </div>
</div>

{/* Success state */}
<div>
  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Username</label>
  <input
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #107c10',
      borderRadius: '4px',
      outline: 'none',
    }}
    value="john_doe"
  />
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#107c10', fontSize: '12px' }}>
    <Icon iconName="CheckMark" style={{ fontSize: '12px' }} />
    <span>Username is available</span>
  </div>
</div>`,
    preview: (
      <div style={{ padding: '8px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '2px', fontSize: '10px' }}>Email</label>
          <input style={{ width: '100%', padding: '4px 8px', border: '1px solid #a80000', borderRadius: '4px', fontSize: '10px', boxSizing: 'border-box' }} defaultValue="invalid" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px', color: '#a80000', fontSize: '9px' }}>
            <Icon iconName="ErrorBadge" style={{ fontSize: '9px' }} />
            <span>Invalid email</span>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '2px', fontSize: '10px' }}>Username</label>
          <input style={{ width: '100%', padding: '4px 8px', border: '1px solid #107c10', borderRadius: '4px', fontSize: '10px', boxSizing: 'border-box' }} defaultValue="john_doe" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px', color: '#107c10', fontSize: '9px' }}>
            <Icon iconName="CheckMark" style={{ fontSize: '9px' }} />
            <span>Available</span>
          </div>
        </div>
      </div>
    ),
  },
];
