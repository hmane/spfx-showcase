// Pattern Snippets - Empty state, Footer, Key-value, Badges, Icon+text

import * as React from 'react';
import { Icon, PrimaryButton, DefaultButton } from '@fluentui/react';
import { ISnippet } from '../types';

export const patternSnippets: ISnippet[] = [
  {
    id: 'empty-state',
    title: 'Empty State',
    description: 'No data placeholder with icon and action',
    category: 'patterns',
    code: `<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
    color: '#605e5c',
  }}
>
  <Icon iconName="DocumentSet" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No items found</div>
  <div style={{ fontSize: '14px', marginBottom: '16px' }}>
    Get started by creating your first item.
  </div>
  <PrimaryButton text="Create Item" iconProps={{ iconName: 'Add' }} />
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
          color: '#605e5c',
        }}
      >
        <Icon iconName="DocumentSet" style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }} />
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>No items found</div>
        <div style={{ fontSize: '11px', marginBottom: '12px' }}>
          Get started by creating your first item.
        </div>
        <PrimaryButton text="Create Item" iconProps={{ iconName: 'Add' }} styles={{ root: { height: '28px' }, label: { fontSize: '12px' } }} />
      </div>
    ),
  },
  {
    id: 'footer-actions',
    title: 'Footer Actions',
    description: 'Cancel and Save buttons aligned right',
    category: 'patterns',
    code: `<div
  style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px',
    borderTop: '1px solid #edebe9',
    background: '#faf9f8',
  }}
>
  <DefaultButton text="Cancel" />
  <PrimaryButton text="Save" />
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '12px',
          borderTop: '1px solid #edebe9',
          background: '#faf9f8',
        }}
      >
        <DefaultButton text="Cancel" styles={{ root: { height: '28px' }, label: { fontSize: '12px' } }} />
        <PrimaryButton text="Save" styles={{ root: { height: '28px' }, label: { fontSize: '12px' } }} />
      </div>
    ),
  },
  {
    id: 'key-value-list',
    title: 'Key-Value List',
    description: 'Label and value pairs in a list',
    category: 'patterns',
    code: `<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ color: '#605e5c', fontWeight: 500 }}>Status</span>
    <span>Active</span>
  </div>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ color: '#605e5c', fontWeight: 500 }}>Created</span>
    <span>Jan 15, 2025</span>
  </div>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ color: '#605e5c', fontWeight: 500 }}>Modified By</span>
    <span>John Doe</span>
  </div>
</div>`,
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#605e5c', fontWeight: 500 }}>Status</span>
          <span>Active</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#605e5c', fontWeight: 500 }}>Created</span>
          <span>Jan 15, 2025</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#605e5c', fontWeight: 500 }}>Modified By</span>
          <span>John Doe</span>
        </div>
      </div>
    ),
  },
  {
    id: 'badge-group',
    title: 'Badge/Tag Group',
    description: 'Colored status badges',
    category: 'patterns',
    code: `<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
  <span style={{ padding: '4px 10px', background: '#dff6dd', color: '#107c10', borderRadius: '12px', fontSize: '12px' }}>
    Approved
  </span>
  <span style={{ padding: '4px 10px', background: '#fff4ce', color: '#8a6d3b', borderRadius: '12px', fontSize: '12px' }}>
    Pending
  </span>
  <span style={{ padding: '4px 10px', background: '#fde7e9', color: '#a80000', borderRadius: '12px', fontSize: '12px' }}>
    Rejected
  </span>
  <span style={{ padding: '4px 10px', background: '#deecf9', color: '#0078d4', borderRadius: '12px', fontSize: '12px' }}>
    In Review
  </span>
</div>`,
    preview: (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 8px', background: '#dff6dd', color: '#107c10', borderRadius: '10px', fontSize: '11px' }}>
          Approved
        </span>
        <span style={{ padding: '3px 8px', background: '#fff4ce', color: '#8a6d3b', borderRadius: '10px', fontSize: '11px' }}>
          Pending
        </span>
        <span style={{ padding: '3px 8px', background: '#fde7e9', color: '#a80000', borderRadius: '10px', fontSize: '11px' }}>
          Rejected
        </span>
        <span style={{ padding: '3px 8px', background: '#deecf9', color: '#0078d4', borderRadius: '10px', fontSize: '11px' }}>
          In Review
        </span>
      </div>
    ),
  },
  {
    id: 'icon-text-row',
    title: 'Icon + Text Row',
    description: 'Icon with label (status indicator)',
    category: 'patterns',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  }}
>
  <Icon iconName="CheckMark" style={{ color: '#107c10' }} />
  <span>Connected to: https://tenant.sharepoint.com</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
        }}
      >
        <Icon iconName="CheckMark" style={{ color: '#107c10' }} />
        <span>Connected to: https://tenant.sharepoint.com</span>
      </div>
    ),
  },
  {
    id: 'stat-card',
    title: 'Stat Card',
    description: 'Metric display with number and label',
    category: 'patterns',
    code: `<div
  style={{
    padding: '20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  }}
>
  <div style={{ fontSize: '32px', fontWeight: 700, color: '#0078d4' }}>1,234</div>
  <div style={{ fontSize: '14px', color: '#605e5c', marginTop: '4px' }}>Total Items</div>
</div>`,
    preview: (
      <div
        style={{
          padding: '12px',
          background: '#fff',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#0078d4' }}>1,234</div>
        <div style={{ fontSize: '11px', color: '#605e5c', marginTop: '2px' }}>Total Items</div>
      </div>
    ),
  },
];
