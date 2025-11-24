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
];
