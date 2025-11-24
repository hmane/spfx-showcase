// Common UI Patterns - Forms, Headers, Progress, Breadcrumbs, etc.

import * as React from 'react';
import { Icon, ProgressIndicator, TextField, PrimaryButton, Persona, PersonaSize } from '@fluentui/react';
import { ISnippet } from '../types';

export const commonSnippets: ISnippet[] = [
  {
    id: 'page-header',
    title: 'Page Header',
    description: 'Page title with description and actions',
    category: 'patterns',
    code: `<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    borderBottom: '1px solid #edebe9',
    background: '#faf9f8',
  }}
>
  <div>
    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Page Title</h1>
    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#605e5c' }}>
      A brief description of this page or section.
    </p>
  </div>
  <div style={{ display: 'flex', gap: '8px' }}>
    <PrimaryButton text="New Item" iconProps={{ iconName: 'Add' }} />
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '14px',
          borderBottom: '1px solid #edebe9',
          background: '#faf9f8',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Page Title</h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#605e5c' }}>
            A brief description of this page.
          </p>
        </div>
        <PrimaryButton text="New" iconProps={{ iconName: 'Add' }} styles={{ root: { height: '26px', minWidth: 0, padding: '0 10px' }, label: { fontSize: '11px' } }} />
      </div>
    ),
  },
  {
    id: 'breadcrumb',
    title: 'Breadcrumb Navigation',
    description: 'Navigation path for hierarchical pages',
    category: 'patterns',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    fontSize: '13px',
  }}
>
  <a href="#" style={{ color: '#0078d4', textDecoration: 'none' }}>Home</a>
  <Icon iconName="ChevronRight" style={{ fontSize: '10px', color: '#605e5c' }} />
  <a href="#" style={{ color: '#0078d4', textDecoration: 'none' }}>Documents</a>
  <Icon iconName="ChevronRight" style={{ fontSize: '10px', color: '#605e5c' }} />
  <span style={{ color: '#323130' }}>Current Page</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          fontSize: '11px',
        }}
      >
        <a href="#" style={{ color: '#0078d4', textDecoration: 'none' }}>Home</a>
        <Icon iconName="ChevronRight" style={{ fontSize: '8px', color: '#605e5c' }} />
        <a href="#" style={{ color: '#0078d4', textDecoration: 'none' }}>Documents</a>
        <Icon iconName="ChevronRight" style={{ fontSize: '8px', color: '#605e5c' }} />
        <span style={{ color: '#323130' }}>Current Page</span>
      </div>
    ),
  },
  {
    id: 'progress-steps',
    title: 'Progress Steps',
    description: 'Multi-step progress indicator',
    category: 'patterns',
    code: `<div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
  {['Details', 'Review', 'Submit'].map((step, index) => (
    <React.Fragment key={step}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: index === 0 ? '#0078d4' : index === 1 ? '#0078d4' : '#edebe9',
            color: index <= 1 ? '#fff' : '#605e5c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {index < 1 ? <Icon iconName="CheckMark" style={{ fontSize: '12px' }} /> : index + 1}
        </div>
        <span style={{ color: index <= 1 ? '#323130' : '#a19f9d', fontWeight: index === 1 ? 600 : 400 }}>
          {step}
        </span>
      </div>
      {index < 2 && (
        <div style={{ flex: 1, height: '2px', background: index < 1 ? '#0078d4' : '#edebe9', margin: '0 12px' }} />
      )}
    </React.Fragment>
  ))}
</div>`,
    preview: (
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
        {['Details', 'Review', 'Submit'].map((step, index) => (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: index === 0 ? '#0078d4' : index === 1 ? '#0078d4' : '#edebe9',
                  color: index <= 1 ? '#fff' : '#605e5c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                {index < 1 ? <Icon iconName="CheckMark" style={{ fontSize: '8px' }} /> : index + 1}
              </div>
              <span style={{ color: index <= 1 ? '#323130' : '#a19f9d', fontWeight: index === 1 ? 600 : 400, fontSize: '10px' }}>
                {step}
              </span>
            </div>
            {index < 2 && (
              <div style={{ flex: 1, height: '2px', background: index < 1 ? '#0078d4' : '#edebe9', margin: '0 6px' }} />
            )}
          </React.Fragment>
        ))}
      </div>
    ),
  },
  {
    id: 'progress-bar',
    title: 'Progress Bar',
    description: 'Linear progress indicator with label',
    category: 'patterns',
    code: `<div style={{ padding: '16px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
    <span style={{ fontSize: '14px', fontWeight: 500 }}>Uploading files...</span>
    <span style={{ fontSize: '14px', color: '#605e5c' }}>65%</span>
  </div>
  <ProgressIndicator percentComplete={0.65} barHeight={4} />
</div>`,
    preview: (
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 500 }}>Uploading files...</span>
          <span style={{ fontSize: '11px', color: '#605e5c' }}>65%</span>
        </div>
        <ProgressIndicator percentComplete={0.65} barHeight={4} styles={{ root: { padding: 0 } }} />
      </div>
    ),
  },
  {
    id: 'form-field',
    title: 'Form Field with Label',
    description: 'Text input with label and helper text',
    category: 'patterns',
    code: `<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
  <label style={{ fontSize: '14px', fontWeight: 600, color: '#323130' }}>
    Email Address <span style={{ color: '#a80000' }}>*</span>
  </label>
  <TextField placeholder="Enter your email" />
  <span style={{ fontSize: '12px', color: '#605e5c' }}>
    We'll never share your email with anyone else.
  </span>
</div>`,
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#323130' }}>
          Email Address <span style={{ color: '#a80000' }}>*</span>
        </label>
        <TextField placeholder="Enter your email" styles={{ root: { width: '100%' }, field: { fontSize: '12px' } }} />
        <span style={{ fontSize: '10px', color: '#605e5c' }}>
          We'll never share your email.
        </span>
      </div>
    ),
  },
  {
    id: 'form-inline',
    title: 'Inline Form Field',
    description: 'Label and input side by side',
    category: 'patterns',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  }}
>
  <label style={{ fontSize: '14px', fontWeight: 500, minWidth: '100px' }}>
    Username
  </label>
  <TextField placeholder="Enter username" styles={{ root: { flex: 1 } }} />
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <label style={{ fontSize: '11px', fontWeight: 500, minWidth: '60px' }}>
          Username
        </label>
        <TextField placeholder="Enter username" styles={{ root: { flex: 1 }, field: { fontSize: '11px' } }} />
      </div>
    ),
  },
  {
    id: 'user-card',
    title: 'User Card',
    description: 'User info card with avatar',
    category: 'patterns',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#fff',
    border: '1px solid #edebe9',
    borderRadius: '8px',
  }}
>
  <Persona
    text="John Doe"
    size={PersonaSize.size48}
    imageUrl=""
  />
  <div>
    <div style={{ fontWeight: 600, fontSize: '14px' }}>John Doe</div>
    <div style={{ fontSize: '12px', color: '#605e5c' }}>Software Engineer</div>
    <div style={{ fontSize: '12px', color: '#0078d4' }}>john.doe@company.com</div>
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          background: '#fff',
          border: '1px solid #edebe9',
          borderRadius: '6px',
        }}
      >
        <Persona
          text="John Doe"
          size={PersonaSize.size32}
        />
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px' }}>John Doe</div>
          <div style={{ fontSize: '10px', color: '#605e5c' }}>Software Engineer</div>
        </div>
      </div>
    ),
  },
  {
    id: 'divider',
    title: 'Horizontal Divider',
    description: 'Divider line with optional text',
    category: 'patterns',
    code: `{/* Simple divider */}
<div style={{ height: '1px', background: '#edebe9', margin: '16px 0' }} />

{/* Divider with text */}
<div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
  <div style={{ flex: 1, height: '1px', background: '#edebe9' }} />
  <span style={{ fontSize: '12px', color: '#605e5c' }}>OR</span>
  <div style={{ flex: 1, height: '1px', background: '#edebe9' }} />
</div>`,
    preview: (
      <div>
        <div style={{ fontSize: '11px', color: '#605e5c', marginBottom: '8px' }}>Content above</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: '#edebe9' }} />
          <span style={{ fontSize: '10px', color: '#605e5c' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#edebe9' }} />
        </div>
        <div style={{ fontSize: '11px', color: '#605e5c', marginTop: '8px' }}>Content below</div>
      </div>
    ),
  },
  {
    id: 'search-box',
    title: 'Search Box with Filter',
    description: 'Search input with filter button',
    category: 'patterns',
    code: `<div
  style={{
    display: 'flex',
    gap: '8px',
    padding: '12px',
    background: '#faf9f8',
    borderRadius: '4px',
  }}
>
  <div style={{ flex: 1, position: 'relative' }}>
    <Icon iconName="Search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#605e5c' }} />
    <input
      type="text"
      placeholder="Search items..."
      style={{
        width: '100%',
        padding: '8px 8px 8px 32px',
        border: '1px solid #8a8886',
        borderRadius: '4px',
        fontSize: '14px',
      }}
    />
  </div>
  <IconButton iconProps={{ iconName: 'Filter' }} title="Filter" />
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '10px',
          background: '#faf9f8',
          borderRadius: '4px',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Icon iconName="Search" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#605e5c', fontSize: '12px' }} />
          <input
            type="text"
            placeholder="Search items..."
            style={{
              width: '100%',
              padding: '6px 6px 6px 26px',
              border: '1px solid #8a8886',
              borderRadius: '4px',
              fontSize: '11px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    ),
  },
  {
    id: 'confirmation-dialog',
    title: 'Confirmation Dialog',
    description: 'Modal dialog for confirmations',
    category: 'patterns',
    code: `<div
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }}
>
  <div
    style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '400px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <Icon iconName="Warning" style={{ fontSize: '24px', color: '#ffaa44' }} />
      <h3 style={{ margin: 0, fontSize: '18px' }}>Delete Item?</h3>
    </div>
    <p style={{ margin: '0 0 20px 0', color: '#605e5c' }}>
      Are you sure you want to delete this item? This action cannot be undone.
    </p>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
      <DefaultButton text="Cancel" />
      <PrimaryButton text="Delete" styles={{ root: { background: '#a80000' } }} />
    </div>
  </div>
</div>`,
    preview: (
      <div
        style={{
          background: '#fff',
          borderRadius: '6px',
          padding: '14px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Icon iconName="Warning" style={{ fontSize: '16px', color: '#ffaa44' }} />
          <h3 style={{ margin: 0, fontSize: '13px' }}>Delete Item?</h3>
        </div>
        <p style={{ margin: '0 0 12px 0', color: '#605e5c', fontSize: '11px' }}>
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button style={{ padding: '4px 10px', background: '#fff', border: '1px solid #8a8886', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
          <button style={{ padding: '4px 10px', background: '#a80000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    ),
  },
];
