// Layout Snippets - Card, Border, Centered, Scrollable, Section

import * as React from 'react';
import { ISnippet } from '../types';

export const layoutSnippets: ISnippet[] = [
  {
    id: 'card-elevation',
    title: 'Card with Elevation',
    description: 'Card with box shadow for depth effect',
    category: 'layout',
    code: `<div
  style={{
    padding: '20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }}
>
  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Card Title</h3>
  <p style={{ margin: 0, color: '#605e5c', fontSize: '14px' }}>
    This is a card with elevation shadow effect.
  </p>
</div>`,
    preview: (
      <div
        style={{
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Card Title</h3>
        <p style={{ margin: 0, color: '#605e5c', fontSize: '14px' }}>
          This is a card with elevation shadow effect.
        </p>
      </div>
    ),
  },
  {
    id: 'card-border',
    title: 'Card with Border',
    description: 'Simple bordered container',
    category: 'layout',
    code: `<div
  style={{
    padding: '16px',
    background: '#fff',
    border: '1px solid #edebe9',
    borderRadius: '4px',
  }}
>
  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Bordered Card</h3>
  <p style={{ margin: 0, color: '#605e5c', fontSize: '14px' }}>
    Simple card with border styling.
  </p>
</div>`,
    preview: (
      <div
        style={{
          padding: '16px',
          background: '#fff',
          border: '1px solid #edebe9',
          borderRadius: '4px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Bordered Card</h3>
        <p style={{ margin: 0, color: '#605e5c', fontSize: '14px' }}>
          Simple card with border styling.
        </p>
      </div>
    ),
  },
  {
    id: 'centered-content',
    title: 'Centered Content',
    description: 'Horizontally and vertically centered container',
    category: 'layout',
    code: `<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    background: '#f3f2f1',
    borderRadius: '4px',
  }}
>
  <div style={{ textAlign: 'center' }}>
    <h3 style={{ margin: '0 0 8px 0' }}>Centered Content</h3>
    <p style={{ margin: 0, color: '#605e5c' }}>This content is perfectly centered.</p>
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120px',
          background: '#f3f2f1',
          borderRadius: '4px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Centered Content</h3>
          <p style={{ margin: 0, color: '#605e5c', fontSize: '12px' }}>This content is perfectly centered.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'scrollable-container',
    title: 'Scrollable Container',
    description: 'Fixed height container with scroll overflow',
    category: 'layout',
    code: `<div
  style={{
    height: '200px',
    overflow: 'auto',
    padding: '16px',
    border: '1px solid #edebe9',
    borderRadius: '4px',
  }}
>
  {/* Your scrollable content here */}
  <div style={{ height: '400px', background: 'linear-gradient(to bottom, #deecf9, #fff)' }}>
    Scroll me...
  </div>
</div>`,
    preview: (
      <div
        style={{
          height: '100px',
          overflow: 'auto',
          padding: '12px',
          border: '1px solid #edebe9',
          borderRadius: '4px',
        }}
      >
        <div style={{ height: '200px', background: 'linear-gradient(to bottom, #deecf9, #fff)', padding: '8px', fontSize: '12px' }}>
          Scroll me... (content extends below)
        </div>
      </div>
    ),
  },
  {
    id: 'section-header',
    title: 'Section with Header',
    description: 'Section container with title and description',
    category: 'layout',
    code: `<div
  style={{
    padding: '20px',
    background: '#faf9f8',
    borderRadius: '4px',
  }}
>
  <div style={{ marginBottom: '16px' }}>
    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Section Title</h2>
    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
      A brief description of this section.
    </p>
  </div>
  <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
    Section content goes here...
  </div>
</div>`,
    preview: (
      <div
        style={{
          padding: '16px',
          background: '#faf9f8',
          borderRadius: '4px',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Section Title</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#605e5c' }}>
            A brief description of this section.
          </p>
        </div>
        <div style={{ padding: '12px', background: '#fff', borderRadius: '4px', fontSize: '12px' }}>
          Section content goes here...
        </div>
      </div>
    ),
  },
  {
    id: 'sticky-header',
    title: 'Sticky Header',
    description: 'Header that sticks to top on scroll',
    category: 'layout',
    code: `<div style={{ height: '300px', overflow: 'auto', border: '1px solid #edebe9', borderRadius: '4px' }}>
  {/* Sticky header */}
  <div
    style={{
      position: 'sticky',
      top: 0,
      padding: '12px 16px',
      background: '#fff',
      borderBottom: '1px solid #edebe9',
      zIndex: 10,
    }}
  >
    <h3 style={{ margin: 0, fontSize: '16px' }}>Sticky Header</h3>
  </div>

  {/* Scrollable content */}
  <div style={{ padding: '16px' }}>
    {/* Long content here */}
  </div>
</div>`,
    preview: (
      <div style={{ height: '100px', overflow: 'auto', border: '1px solid #edebe9', borderRadius: '4px' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            padding: '8px 10px',
            background: '#fff',
            borderBottom: '1px solid #edebe9',
            zIndex: 10,
          }}
        >
          <h3 style={{ margin: 0, fontSize: '11px' }}>Sticky Header</h3>
        </div>
        <div style={{ padding: '10px', fontSize: '10px' }}>
          <p style={{ margin: '0 0 8px 0' }}>Scroll to see sticky effect...</p>
          <p style={{ margin: '0 0 8px 0' }}>More content...</p>
          <p style={{ margin: '0 0 8px 0' }}>More content...</p>
          <p style={{ margin: '0 0 8px 0' }}>More content...</p>
          <p style={{ margin: 0 }}>End of content</p>
        </div>
      </div>
    ),
  },
  {
    id: 'split-view',
    title: 'Split View',
    description: 'Resizable left/right panels',
    category: 'layout',
    code: `<div
  style={{
    display: 'flex',
    height: '400px',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    overflow: 'hidden',
  }}
>
  {/* Left panel */}
  <div style={{ width: '250px', borderRight: '1px solid #edebe9', overflow: 'auto' }}>
    <div style={{ padding: '16px' }}>
      Left Panel - Navigation or list
    </div>
  </div>

  {/* Divider / resize handle */}
  <div
    style={{
      width: '4px',
      background: '#f3f2f1',
      cursor: 'col-resize',
    }}
    onMouseDown={(e) => { /* Drag resize logic */ }}
  />

  {/* Right panel */}
  <div style={{ flex: 1, overflow: 'auto' }}>
    <div style={{ padding: '16px' }}>
      Right Panel - Main content
    </div>
  </div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          height: '80px',
          border: '1px solid #edebe9',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: '80px', borderRight: '1px solid #edebe9', padding: '8px', fontSize: '10px', background: '#faf9f8' }}>
          Left Panel
        </div>
        <div style={{ width: '3px', background: '#edebe9', cursor: 'col-resize' }} />
        <div style={{ flex: 1, padding: '8px', fontSize: '10px' }}>
          Right Panel - Main content area
        </div>
      </div>
    ),
  },
  {
    id: 'masonry-grid',
    title: 'Masonry Grid',
    description: 'Pinterest-style staggered grid layout',
    category: 'layout',
    code: `<div
  style={{
    columnCount: 3,
    columnGap: '16px',
  }}
>
  {items.map((item, i) => (
    <div
      key={i}
      style={{
        breakInside: 'avoid',
        marginBottom: '16px',
        padding: '16px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Variable height content */}
      <div style={{ height: item.height }}>
        Card {i + 1}
      </div>
    </div>
  ))}
</div>`,
    preview: (
      <div style={{ columnCount: 3, columnGap: '6px' }}>
        {[40, 60, 35, 50, 45, 55].map((h, i) => (
          <div
            key={i}
            style={{
              breakInside: 'avoid',
              marginBottom: '6px',
              padding: '6px',
              background: '#deecf9',
              borderRadius: '4px',
              height: `${h}px`,
              fontSize: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Card {i + 1}
          </div>
        ))}
      </div>
    ),
  },
];
