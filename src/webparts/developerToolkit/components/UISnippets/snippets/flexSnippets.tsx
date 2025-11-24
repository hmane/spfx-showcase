// Flex Snippets - Row, Column, Space-between, Align-right, Center

import * as React from 'react';
import { ISnippet } from '../types';

export const flexSnippets: ISnippet[] = [
  {
    id: 'flex-row',
    title: 'Flex Row',
    description: 'Items arranged horizontally with gap',
    category: 'flex',
    code: `<div
  style={{
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    alignItems: 'center',
  }}
>
  <div style={{ padding: '8px 16px', background: '#deecf9', borderRadius: '4px' }}>Item 1</div>
  <div style={{ padding: '8px 16px', background: '#deecf9', borderRadius: '4px' }}>Item 2</div>
  <div style={{ padding: '8px 16px', background: '#deecf9', borderRadius: '4px' }}>Item 3</div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <div style={{ padding: '6px 12px', background: '#deecf9', borderRadius: '4px', fontSize: '12px' }}>Item 1</div>
        <div style={{ padding: '6px 12px', background: '#deecf9', borderRadius: '4px', fontSize: '12px' }}>Item 2</div>
        <div style={{ padding: '6px 12px', background: '#deecf9', borderRadius: '4px', fontSize: '12px' }}>Item 3</div>
      </div>
    ),
  },
  {
    id: 'flex-column',
    title: 'Flex Column',
    description: 'Items stacked vertically with gap',
    category: 'flex',
    code: `<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }}
>
  <div style={{ padding: '12px', background: '#dff6dd', borderRadius: '4px' }}>Row 1</div>
  <div style={{ padding: '12px', background: '#dff6dd', borderRadius: '4px' }}>Row 2</div>
  <div style={{ padding: '12px', background: '#dff6dd', borderRadius: '4px' }}>Row 3</div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ padding: '8px', background: '#dff6dd', borderRadius: '4px', fontSize: '12px' }}>Row 1</div>
        <div style={{ padding: '8px', background: '#dff6dd', borderRadius: '4px', fontSize: '12px' }}>Row 2</div>
        <div style={{ padding: '8px', background: '#dff6dd', borderRadius: '4px', fontSize: '12px' }}>Row 3</div>
      </div>
    ),
  },
  {
    id: 'flex-space-between',
    title: 'Space Between',
    description: 'Items pushed to opposite edges',
    category: 'flex',
    code: `<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f3f2f1',
    borderRadius: '4px',
  }}
>
  <span>Left content</span>
  <span>Right content</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          background: '#f3f2f1',
          borderRadius: '4px',
          fontSize: '12px',
        }}
      >
        <span>Left content</span>
        <span>Right content</span>
      </div>
    ),
  },
  {
    id: 'flex-align-right',
    title: 'Align Right',
    description: 'Content aligned to the right (buttons, actions)',
    category: 'flex',
    code: `<div
  style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  }}
>
  <button style={{ padding: '8px 16px', background: '#fff', border: '1px solid #8a8886', borderRadius: '4px', cursor: 'pointer' }}>
    Cancel
  </button>
  <button style={{ padding: '8px 16px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
    Save
  </button>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
        }}
      >
        <button style={{ padding: '6px 12px', background: '#fff', border: '1px solid #8a8886', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          Cancel
        </button>
        <button style={{ padding: '6px 12px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          Save
        </button>
      </div>
    ),
  },
  {
    id: 'flex-center',
    title: 'Flex Center',
    description: 'Content centered horizontally',
    category: 'flex',
    code: `<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#fff4ce',
    borderRadius: '4px',
  }}
>
  <span>Centered content with icon</span>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          background: '#fff4ce',
          borderRadius: '4px',
          fontSize: '12px',
        }}
      >
        <span>Centered content with icon</span>
      </div>
    ),
  },
  {
    id: 'flex-wrap',
    title: 'Flex Wrap',
    description: 'Items wrap to next line when container is narrow',
    category: 'flex',
    code: `<div
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  }}
>
  <div style={{ padding: '8px 16px', background: '#e1dfdd', borderRadius: '4px' }}>Tag 1</div>
  <div style={{ padding: '8px 16px', background: '#e1dfdd', borderRadius: '4px' }}>Tag 2</div>
  <div style={{ padding: '8px 16px', background: '#e1dfdd', borderRadius: '4px' }}>Tag 3</div>
  <div style={{ padding: '8px 16px', background: '#e1dfdd', borderRadius: '4px' }}>Tag 4</div>
  <div style={{ padding: '8px 16px', background: '#e1dfdd', borderRadius: '4px' }}>Tag 5</div>
</div>`,
    preview: (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        <div style={{ padding: '4px 10px', background: '#e1dfdd', borderRadius: '4px', fontSize: '11px' }}>Tag 1</div>
        <div style={{ padding: '4px 10px', background: '#e1dfdd', borderRadius: '4px', fontSize: '11px' }}>Tag 2</div>
        <div style={{ padding: '4px 10px', background: '#e1dfdd', borderRadius: '4px', fontSize: '11px' }}>Tag 3</div>
        <div style={{ padding: '4px 10px', background: '#e1dfdd', borderRadius: '4px', fontSize: '11px' }}>Tag 4</div>
        <div style={{ padding: '4px 10px', background: '#e1dfdd', borderRadius: '4px', fontSize: '11px' }}>Tag 5</div>
      </div>
    ),
  },
];
