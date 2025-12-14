// Navigation Snippets - Breadcrumbs, Sidebar, Tabs, Command Bar, Mega Menu

import * as React from 'react';
import { useState } from 'react';
import { Icon, IconButton } from '@fluentui/react';
import { ISnippet } from '../types';

// Interactive sidebar preview
const SidebarPreview: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const items = [
    { id: 'home', icon: 'Home', label: 'Home' },
    { id: 'documents', icon: 'Document', label: 'Documents' },
    { id: 'tasks', icon: 'TaskLogo', label: 'Tasks' },
    { id: 'settings', icon: 'Settings', label: 'Settings' },
  ];
  return (
    <div style={{ display: 'flex', height: '140px', border: '1px solid #edebe9', borderRadius: '4px', overflow: 'hidden' }}>
      <div
        style={{
          width: isCollapsed ? '40px' : '120px',
          background: '#f3f2f1',
          borderRight: '1px solid #edebe9',
          transition: 'width 0.2s',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ padding: '8px', cursor: 'pointer', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end' }}
        >
          <Icon iconName={isCollapsed ? 'DoubleChevronRight' : 'DoubleChevronLeft'} style={{ fontSize: '10px', color: '#605e5c' }} />
        </div>
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              cursor: 'pointer',
              background: activeItem === item.id ? '#deecf9' : 'transparent',
              color: activeItem === item.id ? '#0078d4' : '#323130',
            }}
          >
            <Icon iconName={item.icon} style={{ fontSize: '12px' }} />
            {!isCollapsed && <span style={{ fontSize: '11px' }}>{item.label}</span>}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '10px', fontSize: '11px' }}>
        Content for {items.find(i => i.id === activeItem)?.label}
      </div>
    </div>
  );
};

// Mega menu preview
const MegaMenuPreview: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '12px', padding: '8px 12px', background: '#0078d4', borderRadius: '4px 4px 0 0' }}>
        <span
          onClick={() => setIsOpen(!isOpen)}
          style={{ color: '#fff', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Products <Icon iconName={isOpen ? 'ChevronUp' : 'ChevronDown'} style={{ fontSize: '10px' }} />
        </span>
        <span style={{ color: '#fff', fontSize: '11px' }}>Services</span>
        <span style={{ color: '#fff', fontSize: '11px' }}>Support</span>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #edebe9', borderRadius: '0 0 4px 4px', padding: '12px', display: 'flex', gap: '16px', zIndex: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '10px', marginBottom: '6px', color: '#323130' }}>Software</div>
            <div style={{ fontSize: '10px', color: '#605e5c', marginBottom: '3px' }}>Product A</div>
            <div style={{ fontSize: '10px', color: '#605e5c', marginBottom: '3px' }}>Product B</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '10px', marginBottom: '6px', color: '#323130' }}>Hardware</div>
            <div style={{ fontSize: '10px', color: '#605e5c', marginBottom: '3px' }}>Device X</div>
            <div style={{ fontSize: '10px', color: '#605e5c', marginBottom: '3px' }}>Device Y</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const navigationSnippets: ISnippet[] = [
  {
    id: 'breadcrumb-overflow',
    title: 'Breadcrumb with Overflow',
    description: 'Breadcrumb navigation with ellipsis for long paths',
    category: 'navigation',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    fontSize: '14px',
  }}
>
  <a href="#" style={{ color: '#0078d4', textDecoration: 'none' }}>Home</a>
  <Icon iconName="ChevronRight" style={{ fontSize: '10px', color: '#605e5c' }} />
  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
    <span style={{ color: '#605e5c' }}>...</span>
    {/* Dropdown menu with hidden items on click */}
  </div>
  <Icon iconName="ChevronRight" style={{ fontSize: '10px', color: '#605e5c' }} />
  <a href="#" style={{ color: '#0078d4', textDecoration: 'none' }}>Parent Folder</a>
  <Icon iconName="ChevronRight" style={{ fontSize: '10px', color: '#605e5c' }} />
  <span style={{ color: '#323130', fontWeight: 500 }}>Current Item</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 10px',
          fontSize: '11px',
        }}
      >
        <a href="#" style={{ color: '#0078d4', textDecoration: 'none' }}>Home</a>
        <Icon iconName="ChevronRight" style={{ fontSize: '8px', color: '#605e5c' }} />
        <span style={{ color: '#605e5c', cursor: 'pointer' }}>...</span>
        <Icon iconName="ChevronRight" style={{ fontSize: '8px', color: '#605e5c' }} />
        <a href="#" style={{ color: '#0078d4', textDecoration: 'none' }}>Parent</a>
        <Icon iconName="ChevronRight" style={{ fontSize: '8px', color: '#605e5c' }} />
        <span style={{ color: '#323130', fontWeight: 500 }}>Current</span>
      </div>
    ),
  },
  {
    id: 'sidebar-navigation',
    title: 'Collapsible Sidebar',
    description: 'Side navigation with collapse functionality (click to try!)',
    category: 'navigation',
    code: `const [isCollapsed, setIsCollapsed] = useState(false);
const [activeItem, setActiveItem] = useState('home');

<div style={{ display: 'flex', height: '400px' }}>
  <div
    style={{
      width: isCollapsed ? '60px' : '200px',
      background: '#f3f2f1',
      borderRight: '1px solid #edebe9',
      transition: 'width 0.2s',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div
      onClick={() => setIsCollapsed(!isCollapsed)}
      style={{ padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end' }}
    >
      <Icon iconName={isCollapsed ? 'DoubleChevronRight' : 'DoubleChevronLeft'} />
    </div>
    {navItems.map(item => (
      <div
        key={item.id}
        onClick={() => setActiveItem(item.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          cursor: 'pointer',
          background: activeItem === item.id ? '#deecf9' : 'transparent',
          color: activeItem === item.id ? '#0078d4' : '#323130',
        }}
      >
        <Icon iconName={item.icon} />
        {!isCollapsed && <span>{item.label}</span>}
      </div>
    ))}
  </div>
  <div style={{ flex: 1, padding: '20px' }}>
    Main content area
  </div>
</div>`,
    preview: <SidebarPreview />,
  },
  {
    id: 'tab-underline',
    title: 'Underline Tabs',
    description: 'Tab navigation with underline indicator',
    category: 'navigation',
    code: `const [activeTab, setActiveTab] = useState('overview');

<div style={{ borderBottom: '1px solid #edebe9' }}>
  <div style={{ display: 'flex', gap: '4px' }}>
    {['Overview', 'Details', 'History', 'Comments'].map((tab) => (
      <div
        key={tab}
        onClick={() => setActiveTab(tab.toLowerCase())}
        style={{
          padding: '12px 20px',
          cursor: 'pointer',
          borderBottom: activeTab === tab.toLowerCase() ? '2px solid #0078d4' : '2px solid transparent',
          color: activeTab === tab.toLowerCase() ? '#0078d4' : '#605e5c',
          fontWeight: activeTab === tab.toLowerCase() ? 600 : 400,
          marginBottom: '-1px',
        }}
      >
        {tab}
      </div>
    ))}
  </div>
</div>`,
    preview: (
      <div style={{ borderBottom: '1px solid #edebe9' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {['Overview', 'Details', 'History'].map((tab, i) => (
            <div
              key={tab}
              style={{
                padding: '8px 12px',
                borderBottom: i === 0 ? '2px solid #0078d4' : '2px solid transparent',
                color: i === 0 ? '#0078d4' : '#605e5c',
                fontWeight: i === 0 ? 600 : 400,
                marginBottom: '-1px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'command-bar',
    title: 'Command Bar',
    description: 'Toolbar with grouped actions and overflow',
    category: 'navigation',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: '#faf9f8',
    borderBottom: '1px solid #edebe9',
  }}
>
  {/* Primary actions */}
  <div style={{ display: 'flex', gap: '4px' }}>
    <IconButton iconProps={{ iconName: 'Add' }} title="New" />
    <IconButton iconProps={{ iconName: 'Upload' }} title="Upload" />
    <IconButton iconProps={{ iconName: 'Share' }} title="Share" />
    <div style={{ width: '1px', background: '#edebe9', margin: '0 8px' }} />
    <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" />
    <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" />
  </div>

  {/* Spacer */}
  <div style={{ flex: 1 }} />

  {/* Secondary actions */}
  <div style={{ display: 'flex', gap: '4px' }}>
    <IconButton iconProps={{ iconName: 'Filter' }} title="Filter" />
    <IconButton iconProps={{ iconName: 'Sort' }} title="Sort" />
    <IconButton iconProps={{ iconName: 'MoreVertical' }} title="More" />
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 10px',
          background: '#faf9f8',
          borderBottom: '1px solid #edebe9',
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', gap: '2px' }}>
          <IconButton iconProps={{ iconName: 'Add' }} title="New" styles={{ root: { width: 26, height: 26 }, icon: { fontSize: 12 } }} />
          <IconButton iconProps={{ iconName: 'Upload' }} title="Upload" styles={{ root: { width: 26, height: 26 }, icon: { fontSize: 12 } }} />
          <div style={{ width: '1px', background: '#edebe9', margin: '0 4px' }} />
          <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" styles={{ root: { width: 26, height: 26 }, icon: { fontSize: 12 } }} />
          <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" styles={{ root: { width: 26, height: 26 }, icon: { fontSize: 12 } }} />
        </div>
        <div style={{ flex: 1 }} />
        <IconButton iconProps={{ iconName: 'MoreVertical' }} title="More" styles={{ root: { width: 26, height: 26 }, icon: { fontSize: 12 } }} />
      </div>
    ),
  },
  {
    id: 'mega-menu',
    title: 'Mega Menu',
    description: 'Multi-column dropdown navigation (click Products!)',
    category: 'navigation',
    code: `const [isOpen, setIsOpen] = useState(false);

<div style={{ position: 'relative' }}>
  {/* Navigation bar */}
  <div style={{ display: 'flex', gap: '24px', padding: '12px 20px', background: '#0078d4' }}>
    <span
      onClick={() => setIsOpen(!isOpen)}
      style={{ color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      Products <Icon iconName={isOpen ? 'ChevronUp' : 'ChevronDown'} />
    </span>
    <span style={{ color: '#fff' }}>Services</span>
    <span style={{ color: '#fff' }}>Support</span>
  </div>

  {/* Mega menu dropdown */}
  {isOpen && (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: '#fff',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      padding: '24px',
      display: 'flex',
      gap: '40px',
      zIndex: 100,
    }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '12px' }}>Software</div>
        <div style={{ color: '#605e5c', marginBottom: '8px' }}>Office Suite</div>
        <div style={{ color: '#605e5c', marginBottom: '8px' }}>Cloud Services</div>
        <div style={{ color: '#605e5c' }}>Developer Tools</div>
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '12px' }}>Hardware</div>
        <div style={{ color: '#605e5c', marginBottom: '8px' }}>Laptops</div>
        <div style={{ color: '#605e5c', marginBottom: '8px' }}>Accessories</div>
        <div style={{ color: '#605e5c' }}>Gaming</div>
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '12px' }}>Solutions</div>
        <div style={{ color: '#605e5c', marginBottom: '8px' }}>Enterprise</div>
        <div style={{ color: '#605e5c', marginBottom: '8px' }}>Small Business</div>
        <div style={{ color: '#605e5c' }}>Education</div>
      </div>
    </div>
  )}
</div>`,
    preview: <MegaMenuPreview />,
  },
];
