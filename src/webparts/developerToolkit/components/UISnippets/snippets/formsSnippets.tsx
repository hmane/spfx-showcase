// Forms Snippets - Multi-step, Inline Edit, Search, Filter Panel, Date Range

import * as React from 'react';
import { useState } from 'react';
import { Icon } from '@fluentui/react';
import { ISnippet } from '../types';

// Multi-step form preview
const MultiStepFormPreview: React.FC = () => {
  const [step, setStep] = useState(1);
  const steps = ['Details', 'Review', 'Submit'];
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: i + 1 <= step ? '#0078d4' : '#edebe9',
                  color: i + 1 <= step ? '#fff' : '#605e5c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                {i + 1 < step ? <Icon iconName="CheckMark" style={{ fontSize: '8px' }} /> : i + 1}
              </div>
              <span style={{ fontSize: '10px', color: i + 1 === step ? '#0078d4' : '#605e5c', fontWeight: i + 1 === step ? 600 : 400 }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: '2px', background: i + 1 < step ? '#0078d4' : '#edebe9', margin: '0 6px' }} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{ padding: '10px', background: '#faf9f8', borderRadius: '4px', marginBottom: '10px', fontSize: '10px' }}>
        Step {step} content goes here...
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          style={{ padding: '4px 10px', fontSize: '10px', border: '1px solid #8a8886', borderRadius: '4px', background: '#fff', cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.5 : 1 }}
        >
          Back
        </button>
        <button
          onClick={() => setStep(Math.min(3, step + 1))}
          style={{ padding: '4px 10px', fontSize: '10px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {step === 3 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
};

// Inline edit preview
const InlineEditPreview: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('Click to edit this text');
  return (
    <div style={{ padding: '8px' }}>
      {isEditing ? (
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            style={{ flex: 1, padding: '4px 8px', fontSize: '11px', border: '1px solid #0078d4', borderRadius: '4px', outline: 'none' }}
          />
          <button onClick={() => setIsEditing(false)} style={{ padding: '4px 8px', fontSize: '10px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save
          </button>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', border: '1px solid transparent', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#f3f2f1')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {value}
          <Icon iconName="Edit" style={{ fontSize: '10px', color: '#605e5c' }} />
        </div>
      )}
    </div>
  );
};

// Filter panel preview
const FilterPanelPreview: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState({ active: true, draft: false });
  return (
    <div style={{ border: '1px solid #edebe9', borderRadius: '4px', overflow: 'hidden' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#faf9f8', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600 }}>Filters</span>
        <Icon iconName={isOpen ? 'ChevronUp' : 'ChevronDown'} style={{ fontSize: '10px' }} />
      </div>
      {isOpen && (
        <div style={{ padding: '10px' }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 500, marginBottom: '4px' }}>Status</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.active} onChange={() => setFilters({ ...filters, active: !filters.active })} />
              Active
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', cursor: 'pointer', marginTop: '4px' }}>
              <input type="checkbox" checked={filters.draft} onChange={() => setFilters({ ...filters, draft: !filters.draft })} />
              Draft
            </label>
          </div>
          <button style={{ width: '100%', padding: '4px', fontSize: '10px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export const formsSnippets: ISnippet[] = [
  {
    id: 'multi-step-form',
    title: 'Multi-Step Form',
    description: 'Wizard pattern with progress indicator (click Next!)',
    category: 'forms',
    code: `const [step, setStep] = useState(1);
const steps = ['Details', 'Review', 'Submit'];

<div style={{ padding: '20px' }}>
  {/* Progress indicator */}
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
    {steps.map((s, i) => (
      <React.Fragment key={s}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: i + 1 <= step ? '#0078d4' : '#edebe9',
              color: i + 1 <= step ? '#fff' : '#605e5c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {i + 1 < step ? <Icon iconName="CheckMark" /> : i + 1}
          </div>
          <span style={{ fontWeight: i + 1 === step ? 600 : 400 }}>{s}</span>
        </div>
        {i < steps.length - 1 && (
          <div style={{ flex: 1, height: '2px', background: i + 1 < step ? '#0078d4' : '#edebe9', margin: '0 12px' }} />
        )}
      </React.Fragment>
    ))}
  </div>

  {/* Step content */}
  <div style={{ padding: '20px', background: '#faf9f8', borderRadius: '4px', marginBottom: '20px' }}>
    {step === 1 && <div>Step 1: Enter details...</div>}
    {step === 2 && <div>Step 2: Review information...</div>}
    {step === 3 && <div>Step 3: Confirm and submit...</div>}
  </div>

  {/* Navigation */}
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <DefaultButton text="Back" disabled={step === 1} onClick={() => setStep(step - 1)} />
    <PrimaryButton text={step === 3 ? 'Submit' : 'Next'} onClick={() => setStep(Math.min(3, step + 1))} />
  </div>
</div>`,
    preview: <MultiStepFormPreview />,
  },
  {
    id: 'inline-edit',
    title: 'Inline Edit',
    description: 'Click-to-edit text field (click the text!)',
    category: 'forms',
    code: `const [isEditing, setIsEditing] = useState(false);
const [value, setValue] = useState('Document Title');

{isEditing ? (
  <div style={{ display: 'flex', gap: '8px' }}>
    <TextField
      value={value}
      onChange={(_, v) => setValue(v || '')}
      autoFocus
      styles={{ root: { flex: 1 } }}
    />
    <IconButton
      iconProps={{ iconName: 'Accept' }}
      onClick={() => setIsEditing(false)}
      styles={{ root: { color: '#107c10' } }}
    />
    <IconButton
      iconProps={{ iconName: 'Cancel' }}
      onClick={() => setIsEditing(false)}
    />
  </div>
) : (
  <div
    onClick={() => setIsEditing(true)}
    style={{
      padding: '8px 12px',
      cursor: 'pointer',
      border: '1px solid transparent',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}
    className="hover-highlight" // Add :hover { background: #f3f2f1 }
  >
    <span style={{ fontSize: '16px' }}>{value}</span>
    <Icon iconName="Edit" style={{ color: '#605e5c' }} />
  </div>
)}`,
    preview: <InlineEditPreview />,
  },
  {
    id: 'search-autocomplete',
    title: 'Search with Suggestions',
    description: 'Search input with dropdown suggestions',
    category: 'forms',
    code: `const [query, setQuery] = useState('');
const [showSuggestions, setShowSuggestions] = useState(false);

const suggestions = items.filter(item =>
  item.toLowerCase().includes(query.toLowerCase())
);

<div style={{ position: 'relative' }}>
  <div style={{ position: 'relative' }}>
    <Icon
      iconName="Search"
      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#605e5c' }}
    />
    <input
      value={query}
      onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
      onFocus={() => setShowSuggestions(true)}
      placeholder="Search..."
      style={{
        width: '100%',
        padding: '10px 12px 10px 36px',
        border: '1px solid #8a8886',
        borderRadius: '4px',
        fontSize: '14px',
      }}
    />
  </div>
  {showSuggestions && suggestions.length > 0 && (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: '#fff',
      border: '1px solid #edebe9',
      borderRadius: '0 0 4px 4px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 100,
    }}>
      {suggestions.map((s, i) => (
        <div
          key={i}
          onClick={() => { setQuery(s); setShowSuggestions(false); }}
          style={{ padding: '10px 16px', cursor: 'pointer' }}
          className="hover-highlight"
        >
          {s}
        </div>
      ))}
    </div>
  )}
</div>`,
    preview: (
      <div style={{ position: 'relative', padding: '8px' }}>
        <div style={{ position: 'relative' }}>
          <Icon iconName="Search" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#605e5c', fontSize: '11px' }} />
          <input
            placeholder="Search..."
            style={{ width: '100%', padding: '6px 6px 6px 26px', border: '1px solid #8a8886', borderRadius: '4px', fontSize: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ position: 'absolute', top: 'calc(100% - 8px)', left: '8px', right: '8px', background: '#fff', border: '1px solid #edebe9', borderRadius: '0 0 4px 4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '6px 10px', fontSize: '10px', borderBottom: '1px solid #edebe9' }}>Document A</div>
          <div style={{ padding: '6px 10px', fontSize: '10px', borderBottom: '1px solid #edebe9' }}>Document B</div>
          <div style={{ padding: '6px 10px', fontSize: '10px' }}>Document C</div>
        </div>
      </div>
    ),
  },
  {
    id: 'filter-panel',
    title: 'Filter Panel',
    description: 'Collapsible filter controls (click to toggle!)',
    category: 'forms',
    code: `const [isOpen, setIsOpen] = useState(true);
const [filters, setFilters] = useState({
  status: [],
  type: [],
  dateRange: null,
});

<div style={{ border: '1px solid #edebe9', borderRadius: '4px', overflow: 'hidden' }}>
  {/* Header */}
  <div
    onClick={() => setIsOpen(!isOpen)}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      background: '#faf9f8',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon iconName="Filter" />
      <span style={{ fontWeight: 600 }}>Filters</span>
      {activeCount > 0 && (
        <span style={{ padding: '2px 8px', background: '#0078d4', color: '#fff', borderRadius: '10px', fontSize: '12px' }}>
          {activeCount}
        </span>
      )}
    </div>
    <Icon iconName={isOpen ? 'ChevronUp' : 'ChevronDown'} />
  </div>

  {/* Filter content */}
  {isOpen && (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontWeight: 500, marginBottom: '8px' }}>Status</div>
        <Checkbox label="Active" checked={filters.status.includes('active')} />
        <Checkbox label="Draft" checked={filters.status.includes('draft')} />
        <Checkbox label="Archived" checked={filters.status.includes('archived')} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DefaultButton text="Clear" onClick={() => setFilters({ status: [], type: [], dateRange: null })} />
        <PrimaryButton text="Apply Filters" />
      </div>
    </div>
  )}
</div>`,
    preview: <FilterPanelPreview />,
  },
  {
    id: 'date-range-picker',
    title: 'Date Range Picker',
    description: 'From/To date selection for filtering',
    category: 'forms',
    code: `const [startDate, setStartDate] = useState<Date | null>(null);
const [endDate, setEndDate] = useState<Date | null>(null);

<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
  <div style={{ display: 'flex', gap: '16px' }}>
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>From</label>
      <DatePicker
        value={startDate}
        onSelectDate={setStartDate}
        placeholder="Select start date"
        maxDate={endDate || undefined}
      />
    </div>
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>To</label>
      <DatePicker
        value={endDate}
        onSelectDate={setEndDate}
        placeholder="Select end date"
        minDate={startDate || undefined}
      />
    </div>
  </div>
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    <DefaultButton text="Today" onClick={() => { const d = new Date(); setStartDate(d); setEndDate(d); }} />
    <DefaultButton text="Last 7 days" onClick={() => { ... }} />
    <DefaultButton text="Last 30 days" onClick={() => { ... }} />
    <DefaultButton text="This month" onClick={() => { ... }} />
  </div>
</div>`,
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '2px', fontSize: '10px' }}>From</label>
            <div style={{ padding: '6px 8px', border: '1px solid #8a8886', borderRadius: '4px', fontSize: '10px', color: '#605e5c' }}>
              Select date...
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '2px', fontSize: '10px' }}>To</label>
            <div style={{ padding: '6px 8px', border: '1px solid #8a8886', borderRadius: '4px', fontSize: '10px', color: '#605e5c' }}>
              Select date...
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button style={{ padding: '3px 6px', fontSize: '9px', border: '1px solid #8a8886', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Today</button>
          <button style={{ padding: '3px 6px', fontSize: '9px', border: '1px solid #8a8886', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Last 7 days</button>
          <button style={{ padding: '3px 6px', fontSize: '9px', border: '1px solid #8a8886', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Last 30 days</button>
        </div>
      </div>
    ),
  },
];
