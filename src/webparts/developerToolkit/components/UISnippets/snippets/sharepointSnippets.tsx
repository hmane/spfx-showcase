// SharePoint-Specific Snippets - Web Part Chrome, Property Pane, Persona, File Card, List Item Card

import * as React from 'react';
import { Icon, Persona, PersonaSize, PersonaPresence, IconButton } from '@fluentui/react';
import { ISnippet } from '../types';

export const sharepointSnippets: ISnippet[] = [
  {
    id: 'webpart-chrome',
    title: 'Web Part Chrome',
    description: 'Standard web part header/wrapper with title and actions',
    category: 'sharepoint',
    code: `<div
  style={{
    background: '#fff',
    borderRadius: '2px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.04)',
  }}
>
  {/* Web part header */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px 8px 20px',
    }}
  >
    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Web Part Title</h2>
    <div style={{ display: 'flex', gap: '4px' }}>
      <IconButton iconProps={{ iconName: 'Refresh' }} title="Refresh" />
      <IconButton iconProps={{ iconName: 'More' }} title="More options" />
    </div>
  </div>

  {/* Description (optional) */}
  <div style={{ padding: '0 20px 8px 20px', fontSize: '13px', color: '#605e5c' }}>
    A brief description of what this web part shows.
  </div>

  {/* Web part content */}
  <div style={{ padding: '0 20px 20px 20px' }}>
    {/* Your content here */}
  </div>

  {/* See all link (optional) */}
  <div style={{ padding: '12px 20px', borderTop: '1px solid #edebe9' }}>
    <a href="#" style={{ color: '#0078d4', textDecoration: 'none', fontSize: '14px' }}>
      See all →
    </a>
  </div>
</div>`,
    preview: (
      <div
        style={{
          background: '#fff',
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px 4px 12px' }}>
          <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Web Part Title</h2>
          <IconButton iconProps={{ iconName: 'More' }} title="More" styles={{ root: { width: 24, height: 24 }, icon: { fontSize: 12 } }} />
        </div>
        <div style={{ padding: '0 12px 8px 12px', fontSize: '10px', color: '#605e5c' }}>
          Description text here.
        </div>
        <div style={{ padding: '0 12px 12px 12px', fontSize: '10px' }}>
          Content area...
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid #edebe9' }}>
          <a href="#" style={{ color: '#0078d4', textDecoration: 'none', fontSize: '10px' }}>See all →</a>
        </div>
      </div>
    ),
  },
  {
    id: 'property-pane-group',
    title: 'Property Pane Group',
    description: 'Property pane styling for web part configuration',
    category: 'sharepoint',
    code: `{/* This is for reference - actual property pane uses SPFx APIs */}
<div style={{ padding: '16px', background: '#fff' }}>
  {/* Group header */}
  <div style={{ borderBottom: '1px solid #c8c6c4', paddingBottom: '8px', marginBottom: '12px' }}>
    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#323130' }}>
      General Settings
    </h3>
  </div>

  {/* Property field */}
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
      Title
    </label>
    <TextField placeholder="Enter title" />
    <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '4px' }}>
      The title shown in the web part header.
    </div>
  </div>

  {/* Toggle property */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 500 }}>Show Description</div>
      <div style={{ fontSize: '12px', color: '#605e5c' }}>Display description below title</div>
    </div>
    <Toggle checked={true} />
  </div>

  {/* Dropdown property */}
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
      Layout
    </label>
    <Dropdown
      options={[
        { key: 'list', text: 'List' },
        { key: 'grid', text: 'Grid' },
        { key: 'compact', text: 'Compact' },
      ]}
      selectedKey="list"
    />
  </div>
</div>`,
    preview: (
      <div style={{ padding: '10px', background: '#fff' }}>
        <div style={{ borderBottom: '1px solid #c8c6c4', paddingBottom: '6px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#323130' }}>General Settings</h3>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, marginBottom: '2px' }}>Title</label>
          <input style={{ width: '100%', padding: '4px 6px', border: '1px solid #8a8886', borderRadius: '2px', fontSize: '10px', boxSizing: 'border-box' }} placeholder="Enter title" />
          <div style={{ fontSize: '9px', color: '#605e5c', marginTop: '2px' }}>Title in header.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 500 }}>Show Desc</div>
            <div style={{ fontSize: '9px', color: '#605e5c' }}>Display below title</div>
          </div>
          <div style={{ width: '28px', height: '14px', background: '#0078d4', borderRadius: '7px', position: 'relative' }}>
            <div style={{ position: 'absolute', right: '2px', top: '2px', width: '10px', height: '10px', background: '#fff', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'persona-card',
    title: 'Persona Card',
    description: 'User profile display with presence indicator',
    category: 'sharepoint',
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
    text="Jane Smith"
    secondaryText="Product Manager"
    size={PersonaSize.size48}
    presence={PersonaPresence.online}
    imageUrl="https://example.com/avatar.jpg"
  />
  <div style={{ flex: 1 }}>
    <div style={{ fontWeight: 600, fontSize: '14px' }}>Jane Smith</div>
    <div style={{ fontSize: '12px', color: '#605e5c' }}>Product Manager</div>
    <div style={{ fontSize: '12px', color: '#0078d4', marginTop: '4px' }}>jane.smith@company.com</div>
  </div>
  <div style={{ display: 'flex', gap: '4px' }}>
    <IconButton iconProps={{ iconName: 'Mail' }} title="Send email" />
    <IconButton iconProps={{ iconName: 'Chat' }} title="Start chat" />
    <IconButton iconProps={{ iconName: 'Phone' }} title="Call" />
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px',
          background: '#fff',
          border: '1px solid #edebe9',
          borderRadius: '6px',
        }}
      >
        <Persona
          text="Jane Smith"
          size={PersonaSize.size32}
          presence={PersonaPresence.online}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '11px' }}>Jane Smith</div>
          <div style={{ fontSize: '9px', color: '#605e5c' }}>Product Manager</div>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <IconButton iconProps={{ iconName: 'Mail' }} title="Email" styles={{ root: { width: 24, height: 24 }, icon: { fontSize: 12 } }} />
          <IconButton iconProps={{ iconName: 'Chat' }} title="Chat" styles={{ root: { width: 24, height: 24 }, icon: { fontSize: 12 } }} />
        </div>
      </div>
    ),
  },
  {
    id: 'file-card',
    title: 'File Card',
    description: 'Document thumbnail card with metadata',
    category: 'sharepoint',
    code: `<div
  style={{
    width: '200px',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    overflow: 'hidden',
    background: '#fff',
  }}
>
  {/* Thumbnail */}
  <div
    style={{
      height: '120px',
      background: 'linear-gradient(135deg, #0078d4 0%, #004578 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    <Icon iconName="ExcelDocument" style={{ fontSize: '48px', color: '#fff', opacity: 0.8 }} />
    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
      <IconButton
        iconProps={{ iconName: 'MoreVertical' }}
        styles={{ root: { background: 'rgba(255,255,255,0.9)', width: 28, height: 28 } }}
      />
    </div>
  </div>

  {/* File info */}
  <div style={{ padding: '12px' }}>
    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      Q4 Sales Report.xlsx
    </div>
    <div style={{ fontSize: '12px', color: '#605e5c', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>Modified Jan 15</span>
      <span>•</span>
      <span>2.4 MB</span>
    </div>
    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Persona text="John Doe" size={PersonaSize.size24} />
      <span style={{ fontSize: '12px', color: '#605e5c' }}>John Doe</span>
    </div>
  </div>
</div>`,
    preview: (
      <div
        style={{
          width: '140px',
          border: '1px solid #edebe9',
          borderRadius: '4px',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        <div
          style={{
            height: '60px',
            background: 'linear-gradient(135deg, #107c10 0%, #004b1c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon iconName="ExcelDocument" style={{ fontSize: '24px', color: '#fff', opacity: 0.9 }} />
        </div>
        <div style={{ padding: '8px' }}>
          <div style={{ fontWeight: 600, fontSize: '10px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Q4 Report.xlsx
          </div>
          <div style={{ fontSize: '9px', color: '#605e5c' }}>
            Jan 15 • 2.4 MB
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'list-item-card',
    title: 'List Item Card',
    description: 'Compact list item display with status and actions',
    category: 'sharepoint',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    cursor: 'pointer',
  }}
  className="hover-highlight" // :hover { background: #f3f2f1 }
>
  {/* Icon based on content type */}
  <div
    style={{
      width: '40px',
      height: '40px',
      borderRadius: '4px',
      background: '#deecf9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Icon iconName="TaskLogo" style={{ fontSize: '20px', color: '#0078d4' }} />
  </div>

  {/* Item details */}
  <div style={{ flex: 1 }}>
    <div style={{ fontWeight: 600, fontSize: '14px' }}>Complete Q4 Review</div>
    <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '2px' }}>
      Due: Jan 20, 2025 • Assigned to: Jane Smith
    </div>
  </div>

  {/* Status badge */}
  <span
    style={{
      padding: '4px 10px',
      background: '#fff4ce',
      color: '#8a6d3b',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 500,
    }}
  >
    In Progress
  </span>

  {/* Actions */}
  <div style={{ display: 'flex', gap: '4px' }}>
    <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" />
    <IconButton iconProps={{ iconName: 'MoreVertical' }} title="More" />
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          background: '#fff',
          border: '1px solid #edebe9',
          borderRadius: '4px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            background: '#deecf9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon iconName="TaskLogo" style={{ fontSize: '14px', color: '#0078d4' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '10px' }}>Complete Q4 Review</div>
          <div style={{ fontSize: '9px', color: '#605e5c' }}>Due: Jan 20 • Jane</div>
        </div>
        <span style={{ padding: '2px 6px', background: '#fff4ce', color: '#8a6d3b', borderRadius: '8px', fontSize: '9px' }}>
          In Progress
        </span>
      </div>
    ),
  },
];
