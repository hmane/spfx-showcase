// UI Snippets - Reusable UI sections and patterns for SPFx development

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { Icon, IconButton, SearchBox, TooltipHost } from '@fluentui/react';
import { CodeEditor } from '../../../../components/CodeEditor';
import { CATEGORIES, SnippetCategory, ISnippet } from './types';
import { allSnippets } from './snippets';

export interface IUISnippetsProps {
  // No context needed for this component
}

export const UISnippets: React.FC<IUISnippetsProps> = () => {
  const [activeCategory, setActiveCategory] = useState<SnippetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Filter snippets by category and search
  const filteredSnippets = useMemo(() => {
    let result = allSnippets;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(s => s.category === activeCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  // Handle copy to clipboard
  const handleCopy = useCallback((snippet: ISnippet) => {
    void navigator.clipboard.writeText(snippet.code).then(() => {
      setCopySuccess(snippet.id);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  }, []);

  // Toggle code expansion
  const toggleExpand = useCallback((snippetId: string) => {
    setExpandedSnippet(prev => (prev === snippetId ? null : snippetId));
  }, []);

  // Get category color
  const getCategoryColor = (category: SnippetCategory): string => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.color || '#0078d4';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #edebe9',
          background: '#faf9f8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>UI Snippets</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              Reusable UI sections and patterns for SPFx development. Copy and customize.
            </p>
          </div>
          <div style={{ fontSize: '12px', color: '#605e5c' }}>
            {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search */}
        <div style={{ marginTop: '12px' }}>
          <SearchBox
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(_, value) => setSearchQuery(value || '')}
            styles={{ root: { maxWidth: '400px' } }}
          />
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Category sidebar */}
        <div
          style={{
            width: '200px',
            borderRight: '1px solid #edebe9',
            background: '#faf9f8',
            padding: '12px 0',
            overflowY: 'auto',
          }}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === 'all'
                ? allSnippets.length
                : allSnippets.filter(s => s.category === cat.id).length;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  background: isActive ? '#deecf9' : 'transparent',
                  borderLeft: isActive ? '3px solid #0078d4' : '3px solid transparent',
                }}
              >
                <Icon
                  iconName={cat.icon}
                  style={{ fontSize: '16px', color: isActive ? '#0078d4' : cat.color }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#0078d4' : '#323130',
                  }}
                >
                  {cat.title}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#605e5c',
                    background: '#e1dfdd',
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Snippets grid */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {filteredSnippets.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                color: '#605e5c',
              }}
            >
              <Icon iconName="SearchIssue" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>No snippets found</div>
              <div style={{ fontSize: '14px' }}>Try a different search or category.</div>
            </div>
          ) : (
            filteredSnippets.map(snippet => {
              const isExpanded = expandedSnippet === snippet.id;
              const isCopied = copySuccess === snippet.id;

              return (
                <div
                  key={snippet.id}
                  style={{
                    border: '1px solid #edebe9',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#fff',
                  }}
                >
                  {/* Snippet header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#faf9f8',
                      borderBottom: '1px solid #edebe9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          background: getCategoryColor(snippet.category),
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {snippet.category}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{snippet.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <TooltipHost content={isExpanded ? 'Hide code' : 'View code'}>
                        <IconButton
                          iconProps={{ iconName: isExpanded ? 'ChevronUp' : 'Code' }}
                          onClick={() => toggleExpand(snippet.id)}
                          styles={{ root: { width: 32, height: 32 } }}
                        />
                      </TooltipHost>
                      <TooltipHost content={isCopied ? 'Copied!' : 'Copy code'}>
                        <IconButton
                          iconProps={{ iconName: isCopied ? 'CheckMark' : 'Copy' }}
                          onClick={() => handleCopy(snippet)}
                          styles={{
                            root: { width: 32, height: 32 },
                            icon: { color: isCopied ? '#107c10' : undefined },
                          }}
                        />
                      </TooltipHost>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ padding: '8px 16px', fontSize: '12px', color: '#605e5c' }}>
                    {snippet.description}
                  </div>

                  {/* Preview */}
                  <div
                    style={{
                      padding: '16px',
                      background: '#f9f9f9',
                      borderTop: '1px solid #edebe9',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#605e5c', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Preview
                    </div>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '4px', border: '1px solid #edebe9' }}>
                      {snippet.preview}
                    </div>
                  </div>

                  {/* Code (expanded) */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: '1px solid #edebe9',
                      }}
                    >
                      <div style={{ padding: '8px 16px', fontSize: '10px', color: '#605e5c', textTransform: 'uppercase', background: '#f3f2f1' }}>
                        Code (JSX + Inline Styles)
                      </div>
                      <CodeEditor
                        value={snippet.code}
                        language="typescript"
                        readOnly={true}
                        showLineNumbers={true}
                        showMiniMap={false}
                        theme="vs-dark"
                        showCopyButton={true}
                        showDownloadButton={false}
                        autoHeight={true}
                        minHeight={100}
                        maxHeight={400}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UISnippets;
