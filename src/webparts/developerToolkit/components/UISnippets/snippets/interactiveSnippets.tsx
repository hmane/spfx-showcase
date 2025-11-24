// Interactive Snippets - Collapsible, Action bar, Split panel, List
// These use wrapper components with useState to demonstrate interactivity

import * as React from 'react';
import { useState } from 'react';
import { Icon, IconButton } from '@fluentui/react';
import { ISnippet } from '../types';

// Wrapper components for interactive previews
const CollapsiblePreview: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div style={{ border: '1px solid #edebe9', borderRadius: '4px' }}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px',
          background: '#faf9f8',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '12px' }}>Click to Toggle</span>
        <Icon iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'} style={{ fontSize: '12px' }} />
      </div>
      {isExpanded && (
        <div style={{ padding: '12px', fontSize: '12px' }}>
          This content can be collapsed. Click the header above!
        </div>
      )}
    </div>
  );
};

const SelectableListPreview: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('item-1');
  const items = [
    { id: 'item-1', title: 'Item One', description: 'Click to select' },
    { id: 'item-2', title: 'Item Two', description: 'Click to select' },
    { id: 'item-3', title: 'Item Three', description: 'Click to select' },
  ];
  return (
    <div style={{ border: '1px solid #edebe9', borderRadius: '4px', overflow: 'hidden' }}>
      {items.map((item, index) => (
        <div
          key={item.id}
          onClick={() => setSelectedId(item.id)}
          style={{
            padding: '8px 12px',
            background: selectedId === item.id ? '#deecf9' : '#fff',
            borderBottom: index < items.length - 1 ? '1px solid #edebe9' : 'none',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontWeight: 500, fontSize: '12px' }}>{item.title}</div>
          <div style={{ fontSize: '10px', color: selectedId === item.id ? '#0078d4' : '#605e5c' }}>
            {selectedId === item.id ? 'Selected!' : item.description}
          </div>
        </div>
      ))}
    </div>
  );
};

const TabNavigationPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const tabs = [
    { id: 'tab1', label: 'Overview' },
    { id: 'tab2', label: 'Details' },
    { id: 'tab3', label: 'Settings' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #edebe9' }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 14px',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #0078d4' : '2px solid transparent',
              color: activeTab === tab.id ? '#0078d4' : '#605e5c',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: '12px',
              userSelect: 'none',
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div style={{ padding: '12px', fontSize: '12px', color: '#323130' }}>
        Content for <strong>{tabs.find(t => t.id === activeTab)?.label}</strong> tab
      </div>
    </div>
  );
};

const CheckboxListPreview: React.FC = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set(['option-1']));
  const options = [
    { id: 'option-1', label: 'Email notifications' },
    { id: 'option-2', label: 'Push notifications' },
    { id: 'option-3', label: 'SMS alerts' },
  ];
  const toggle = (id: string): void => {
    const newSet = new Set(selected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {options.map(opt => (
        <div
          key={opt.id}
          onClick={() => toggle(opt.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: selected.has(opt.id) ? '#deecf9' : '#f3f2f1',
            borderRadius: '4px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <Icon
            iconName={selected.has(opt.id) ? 'CheckboxComposite' : 'Checkbox'}
            style={{ color: selected.has(opt.id) ? '#0078d4' : '#605e5c', fontSize: '14px' }}
          />
          <span style={{ fontSize: '12px' }}>{opt.label}</span>
        </div>
      ))}
    </div>
  );
};

const ToggleSwitchPreview: React.FC = () => {
  const [isOn, setIsOn] = useState(true);
  return (
    <div
      onClick={() => setIsOn(!isOn)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '20px',
          background: isOn ? '#0078d4' : '#c8c6c4',
          borderRadius: '10px',
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: isOn ? '22px' : '2px',
            width: '16px',
            height: '16px',
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </div>
      <span style={{ fontSize: '12px' }}>{isOn ? 'Enabled' : 'Disabled'}</span>
    </div>
  );
};

export const interactiveSnippets: ISnippet[] = [
  {
    id: 'collapsible-section',
    title: 'Collapsible Section',
    description: 'Expandable/collapsible content area (click to try!)',
    category: 'interactive',
    code: `const [isExpanded, setIsExpanded] = useState(true);

<div style={{ border: '1px solid #edebe9', borderRadius: '4px' }}>
  <div
    onClick={() => setIsExpanded(!isExpanded)}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      background: '#faf9f8',
      cursor: 'pointer',
    }}
  >
    <span style={{ fontWeight: 600 }}>Section Title</span>
    <Icon iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'} />
  </div>
  {isExpanded && (
    <div style={{ padding: '16px' }}>
      Collapsible content goes here...
    </div>
  )}
</div>`,
    preview: <CollapsiblePreview />,
  },
  {
    id: 'action-bar',
    title: 'Action Bar',
    description: 'Toolbar with icon buttons',
    category: 'interactive',
    code: `<div
  style={{
    display: 'flex',
    gap: '4px',
    padding: '8px',
    background: '#faf9f8',
    borderRadius: '4px',
  }}
>
  <IconButton iconProps={{ iconName: 'Add' }} title="Add" />
  <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" />
  <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" />
  <div style={{ width: '1px', background: '#edebe9', margin: '0 8px' }} />
  <IconButton iconProps={{ iconName: 'Refresh' }} title="Refresh" />
  <IconButton iconProps={{ iconName: 'Filter' }} title="Filter" />
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          gap: '2px',
          padding: '6px',
          background: '#faf9f8',
          borderRadius: '4px',
        }}
      >
        <IconButton iconProps={{ iconName: 'Add' }} title="Add" styles={{ root: { width: 28, height: 28 }, icon: { fontSize: 14 } }} />
        <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" styles={{ root: { width: 28, height: 28 }, icon: { fontSize: 14 } }} />
        <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" styles={{ root: { width: 28, height: 28 }, icon: { fontSize: 14 } }} />
        <div style={{ width: '1px', background: '#edebe9', margin: '0 4px' }} />
        <IconButton iconProps={{ iconName: 'Refresh' }} title="Refresh" styles={{ root: { width: 28, height: 28 }, icon: { fontSize: 14 } }} />
        <IconButton iconProps={{ iconName: 'Filter' }} title="Filter" styles={{ root: { width: 28, height: 28 }, icon: { fontSize: 14 } }} />
      </div>
    ),
  },
  {
    id: 'split-panel',
    title: 'Split Panel',
    description: 'Two-column layout with configurable ratio',
    category: 'interactive',
    code: `<div
  style={{
    display: 'flex',
    gap: '16px',
  }}
>
  {/* Left panel - 30% */}
  <div style={{ flex: '0 0 30%', padding: '16px', background: '#faf9f8', borderRadius: '4px' }}>
    Left Panel (30%)
  </div>
  {/* Right panel - 70% */}
  <div style={{ flex: 1, padding: '16px', background: '#f3f2f1', borderRadius: '4px' }}>
    Right Panel (70%)
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        <div style={{ flex: '0 0 30%', padding: '10px', background: '#faf9f8', borderRadius: '4px', fontSize: '11px' }}>
          Left (30%)
        </div>
        <div style={{ flex: 1, padding: '10px', background: '#f3f2f1', borderRadius: '4px', fontSize: '11px' }}>
          Right (70%)
        </div>
      </div>
    ),
  },
  {
    id: 'selectable-list',
    title: 'Selectable List',
    description: 'Clickable list items with selection state (click to try!)',
    category: 'interactive',
    code: `const [selectedId, setSelectedId] = useState<string | null>('item-1');

<div style={{ border: '1px solid #edebe9', borderRadius: '4px', overflow: 'hidden' }}>
  {items.map(item => (
    <div
      key={item.id}
      onClick={() => setSelectedId(item.id)}
      style={{
        padding: '12px 16px',
        background: selectedId === item.id ? '#deecf9' : '#fff',
        borderBottom: '1px solid #edebe9',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontWeight: 500 }}>{item.title}</div>
      <div style={{ fontSize: '12px', color: '#605e5c' }}>{item.description}</div>
    </div>
  ))}
</div>`,
    preview: <SelectableListPreview />,
  },
  {
    id: 'tab-navigation',
    title: 'Tab Navigation',
    description: 'Horizontal tabs for switching views (click to try!)',
    category: 'interactive',
    code: `const [activeTab, setActiveTab] = useState('tab1');

<div>
  <div style={{ display: 'flex', borderBottom: '1px solid #edebe9' }}>
    {['Overview', 'Details', 'Settings'].map((tab, index) => (
      <div
        key={index}
        onClick={() => setActiveTab(\`tab\${index + 1}\`)}
        style={{
          padding: '12px 20px',
          cursor: 'pointer',
          borderBottom: activeTab === \`tab\${index + 1}\` ? '2px solid #0078d4' : '2px solid transparent',
          color: activeTab === \`tab\${index + 1}\` ? '#0078d4' : '#605e5c',
          fontWeight: activeTab === \`tab\${index + 1}\` ? 600 : 400,
        }}
      >
        {tab}
      </div>
    ))}
  </div>
  <div style={{ padding: '16px' }}>
    Tab content for {activeTab}
  </div>
</div>`,
    preview: <TabNavigationPreview />,
  },
  {
    id: 'checkbox-list',
    title: 'Checkbox List',
    description: 'Multi-select list with checkboxes (click to try!)',
    category: 'interactive',
    code: `const [selected, setSelected] = useState<Set<string>>(new Set(['option-1']));

const toggle = (id: string) => {
  const newSet = new Set(selected);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  setSelected(newSet);
};

<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
  {options.map(opt => (
    <div
      key={opt.id}
      onClick={() => toggle(opt.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: selected.has(opt.id) ? '#deecf9' : '#f3f2f1',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      <Icon
        iconName={selected.has(opt.id) ? 'CheckboxComposite' : 'Checkbox'}
        style={{ color: selected.has(opt.id) ? '#0078d4' : '#605e5c' }}
      />
      <span>{opt.label}</span>
    </div>
  ))}
</div>`,
    preview: <CheckboxListPreview />,
  },
  {
    id: 'toggle-switch',
    title: 'Toggle Switch',
    description: 'Custom toggle switch without Toggle component (click to try!)',
    category: 'interactive',
    code: `const [isOn, setIsOn] = useState(false);

<div
  onClick={() => setIsOn(!isOn)}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  }}
>
  <div
    style={{
      width: '40px',
      height: '20px',
      background: isOn ? '#0078d4' : '#c8c6c4',
      borderRadius: '10px',
      position: 'relative',
      transition: 'background 0.2s',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '2px',
        left: isOn ? '22px' : '2px',
        width: '16px',
        height: '16px',
        background: '#fff',
        borderRadius: '50%',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    />
  </div>
  <span>{isOn ? 'Enabled' : 'Disabled'}</span>
</div>`,
    preview: <ToggleSwitchPreview />,
  },
];
