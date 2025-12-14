// Data Display Snippets - Table, Property List, Timeline, Stats, Tree View

import * as React from 'react';
import { useState } from 'react';
import { Icon } from '@fluentui/react';
import { ISnippet } from '../types';

// Interactive Tree View preview
const TreeViewPreview: React.FC = () => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['folder-1']));
  const toggle = (id: string): void => {
    const newSet = new Set(expanded);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpanded(newSet);
  };

  return (
    <div style={{ fontSize: '11px' }}>
      <div
        onClick={() => toggle('folder-1')}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px', cursor: 'pointer' }}
      >
        <Icon iconName={expanded.has('folder-1') ? 'ChevronDown' : 'ChevronRight'} style={{ fontSize: '10px' }} />
        <Icon iconName="FolderHorizontal" style={{ fontSize: '12px', color: '#ffb900' }} />
        <span>Documents</span>
      </div>
      {expanded.has('folder-1') && (
        <div style={{ marginLeft: '16px' }}>
          <div
            onClick={() => toggle('folder-2')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px', cursor: 'pointer' }}
          >
            <Icon iconName={expanded.has('folder-2') ? 'ChevronDown' : 'ChevronRight'} style={{ fontSize: '10px' }} />
            <Icon iconName="FolderHorizontal" style={{ fontSize: '12px', color: '#ffb900' }} />
            <span>Reports</span>
          </div>
          {expanded.has('folder-2') && (
            <div style={{ marginLeft: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px' }}>
                <span style={{ width: '10px' }} />
                <Icon iconName="ExcelDocument" style={{ fontSize: '12px', color: '#107c10' }} />
                <span>Q4 Report.xlsx</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px' }}>
            <span style={{ width: '10px' }} />
            <Icon iconName="WordDocument" style={{ fontSize: '12px', color: '#0078d4' }} />
            <span>Summary.docx</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Sortable table preview
const SortableTablePreview: React.FC = () => {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const data = [
    { name: 'Report A', modified: 'Jan 15', size: '2.4 MB' },
    { name: 'Document B', modified: 'Jan 10', size: '1.1 MB' },
    { name: 'Spreadsheet C', modified: 'Jan 20', size: '3.2 MB' },
  ];

  const handleSort = (col: string): void => {
    if (sortColumn === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDir('asc');
    }
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
      <thead>
        <tr style={{ background: '#faf9f8' }}>
          <th onClick={() => handleSort('name')} style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #edebe9', cursor: 'pointer' }}>
            Name {sortColumn === 'name' && <Icon iconName={sortDir === 'asc' ? 'SortUp' : 'SortDown'} style={{ fontSize: '8px' }} />}
          </th>
          <th onClick={() => handleSort('modified')} style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #edebe9', cursor: 'pointer' }}>
            Modified {sortColumn === 'modified' && <Icon iconName={sortDir === 'asc' ? 'SortUp' : 'SortDown'} style={{ fontSize: '8px' }} />}
          </th>
          <th onClick={() => handleSort('size')} style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #edebe9', cursor: 'pointer' }}>
            Size {sortColumn === 'size' && <Icon iconName={sortDir === 'asc' ? 'SortUp' : 'SortDown'} style={{ fontSize: '8px' }} />}
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 1 ? '#faf9f8' : '#fff' }}>
            <td style={{ padding: '6px 8px', borderBottom: '1px solid #edebe9' }}>{row.name}</td>
            <td style={{ padding: '6px 8px', borderBottom: '1px solid #edebe9' }}>{row.modified}</td>
            <td style={{ padding: '6px 8px', borderBottom: '1px solid #edebe9' }}>{row.size}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const dataSnippets: ISnippet[] = [
  {
    id: 'data-table',
    title: 'Data Table',
    description: 'Sortable table with header clicks (click headers to sort!)',
    category: 'data',
    code: `const [sortColumn, setSortColumn] = useState('name');
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

const handleSort = (col: string) => {
  if (sortColumn === col) {
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(col);
    setSortDir('asc');
  }
};

<table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr style={{ background: '#faf9f8' }}>
      <th
        onClick={() => handleSort('name')}
        style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #edebe9', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Name
          {sortColumn === 'name' && <Icon iconName={sortDir === 'asc' ? 'SortUp' : 'SortDown'} />}
        </div>
      </th>
      <th onClick={() => handleSort('modified')} style={{ ... }}>Modified</th>
      <th onClick={() => handleSort('size')} style={{ ... }}>Size</th>
    </tr>
  </thead>
  <tbody>
    {data.map((row, i) => (
      <tr key={i} style={{ background: i % 2 === 1 ? '#faf9f8' : '#fff' }}>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #edebe9' }}>{row.name}</td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #edebe9' }}>{row.modified}</td>
        <td style={{ padding: '12px 16px', borderBottom: '1px solid #edebe9' }}>{row.size}</td>
      </tr>
    ))}
  </tbody>
</table>`,
    preview: <SortableTablePreview />,
  },
  {
    id: 'property-list',
    title: 'Property List',
    description: 'Key-value pairs display for item details',
    category: 'data',
    code: `<div
  style={{
    border: '1px solid #edebe9',
    borderRadius: '4px',
    overflow: 'hidden',
  }}
>
  {[
    { label: 'Status', value: 'Published', icon: 'CheckMark', color: '#107c10' },
    { label: 'Created By', value: 'John Doe' },
    { label: 'Created', value: 'Jan 15, 2025 at 2:30 PM' },
    { label: 'Modified', value: 'Jan 18, 2025 at 10:15 AM' },
    { label: 'Version', value: '2.1' },
  ].map((item, i) => (
    <div
      key={i}
      style={{
        display: 'flex',
        padding: '12px 16px',
        background: i % 2 === 0 ? '#fff' : '#faf9f8',
        borderBottom: i < 4 ? '1px solid #edebe9' : 'none',
      }}
    >
      <div style={{ width: '120px', color: '#605e5c', fontWeight: 500 }}>{item.label}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {item.icon && <Icon iconName={item.icon} style={{ color: item.color }} />}
        <span>{item.value}</span>
      </div>
    </div>
  ))}
</div>`,
    preview: (
      <div style={{ border: '1px solid #edebe9', borderRadius: '4px', overflow: 'hidden' }}>
        {[
          { label: 'Status', value: 'Published', icon: 'CheckMark', color: '#107c10' },
          { label: 'Created By', value: 'John Doe' },
          { label: 'Modified', value: 'Jan 18, 2025' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              padding: '6px 10px',
              background: i % 2 === 0 ? '#fff' : '#faf9f8',
              borderBottom: i < 2 ? '1px solid #edebe9' : 'none',
              fontSize: '10px',
            }}
          >
            <div style={{ width: '70px', color: '#605e5c', fontWeight: 500 }}>{item.label}</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {item.icon && <Icon iconName={item.icon} style={{ color: item.color, fontSize: '10px' }} />}
              <span>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'timeline',
    title: 'Timeline',
    description: 'Vertical timeline for activity history',
    category: 'data',
    code: `<div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
  {[
    { time: '2:30 PM', title: 'Document approved', user: 'Jane Smith', type: 'success' },
    { time: '11:15 AM', title: 'Submitted for review', user: 'John Doe', type: 'info' },
    { time: '9:00 AM', title: 'Document created', user: 'John Doe', type: 'default' },
  ].map((item, i) => (
    <div key={i} style={{ display: 'flex', gap: '16px' }}>
      {/* Timeline line and dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: item.type === 'success' ? '#107c10' : item.type === 'info' ? '#0078d4' : '#605e5c',
          }}
        />
        {i < 2 && <div style={{ flex: 1, width: '2px', background: '#edebe9' }} />}
      </div>
      {/* Content */}
      <div style={{ flex: 1, paddingBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#605e5c' }}>{item.time}</div>
        <div style={{ fontWeight: 600 }}>{item.title}</div>
        <div style={{ fontSize: '13px', color: '#605e5c' }}>by {item.user}</div>
      </div>
    </div>
  ))}
</div>`,
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[
          { time: '2:30 PM', title: 'Approved', user: 'Jane', type: 'success' },
          { time: '11:15 AM', title: 'Submitted', user: 'John', type: 'info' },
          { time: '9:00 AM', title: 'Created', user: 'John', type: 'default' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.type === 'success' ? '#107c10' : item.type === 'info' ? '#0078d4' : '#605e5c',
                }}
              />
              {i < 2 && <div style={{ flex: 1, width: '1px', background: '#edebe9' }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: '10px' }}>
              <div style={{ fontSize: '9px', color: '#605e5c' }}>{item.time}</div>
              <div style={{ fontWeight: 600, fontSize: '10px' }}>{item.title}</div>
              <div style={{ fontSize: '9px', color: '#605e5c' }}>by {item.user}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'stats-dashboard',
    title: 'Stats Dashboard',
    description: 'KPI cards with trend indicators',
    category: 'data',
    code: `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
  {[
    { label: 'Total Users', value: '1,234', trend: '+12%', up: true },
    { label: 'Active Items', value: '856', trend: '+5%', up: true },
    { label: 'Pending Tasks', value: '23', trend: '-8%', up: false },
    { label: 'Storage Used', value: '45 GB', trend: '+2%', up: true },
  ].map((stat, i) => (
    <div
      key={i}
      style={{
        padding: '20px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ fontSize: '13px', color: '#605e5c', marginBottom: '8px' }}>{stat.label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#323130' }}>{stat.value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
        <Icon
          iconName={stat.up ? 'TriangleSolidUp12' : 'TriangleSolidDown12'}
          style={{ color: stat.up ? '#107c10' : '#a80000', fontSize: '10px' }}
        />
        <span style={{ fontSize: '12px', color: stat.up ? '#107c10' : '#a80000' }}>{stat.trend}</span>
      </div>
    </div>
  ))}
</div>`,
    preview: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {[
          { label: 'Users', value: '1,234', trend: '+12%', up: true },
          { label: 'Items', value: '856', trend: '-8%', up: false },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '10px',
              background: '#fff',
              borderRadius: '6px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ fontSize: '9px', color: '#605e5c', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#323130' }}>{stat.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
              <Icon
                iconName={stat.up ? 'TriangleSolidUp12' : 'TriangleSolidDown12'}
                style={{ color: stat.up ? '#107c10' : '#a80000', fontSize: '8px' }}
              />
              <span style={{ fontSize: '9px', color: stat.up ? '#107c10' : '#a80000' }}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'tree-view',
    title: 'Tree View',
    description: 'Hierarchical folder/file structure (click to expand!)',
    category: 'data',
    code: `const [expanded, setExpanded] = useState<Set<string>>(new Set(['folder-1']));

const toggle = (id: string) => {
  const newSet = new Set(expanded);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  setExpanded(newSet);
};

const TreeNode = ({ node, level = 0 }) => (
  <div style={{ marginLeft: level * 20 }}>
    <div
      onClick={() => node.children && toggle(node.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px',
        cursor: node.children ? 'pointer' : 'default',
      }}
    >
      {node.children && (
        <Icon iconName={expanded.has(node.id) ? 'ChevronDown' : 'ChevronRight'} />
      )}
      <Icon iconName={node.icon} style={{ color: node.color }} />
      <span>{node.name}</span>
    </div>
    {node.children && expanded.has(node.id) && (
      node.children.map(child => <TreeNode key={child.id} node={child} level={level + 1} />)
    )}
  </div>
);`,
    preview: <TreeViewPreview />,
  },
];
