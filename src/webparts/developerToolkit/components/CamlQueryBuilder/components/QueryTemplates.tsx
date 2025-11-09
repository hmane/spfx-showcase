// src/webparts/showcase/components/CamlQueryBuilder/components/QueryTemplates.tsx

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  DefaultButton,
  SearchBox,
  Icon,
  MessageBar,
} from '@fluentui/react';
import { QUERY_TEMPLATES } from '../data/queryTemplates';
import { IQueryTemplate, IConditionGroup, IOrderByField } from '../types/CamlTypes';

export interface IQueryTemplatesProps {
  onApplyTemplate: (
    group: IConditionGroup,
    orderBy: IOrderByField[],
    rowLimit: number
  ) => void;
  onClose: () => void;
  listBaseTemplate?: number;
  availableFields?: string[];
}

export const QueryTemplates: React.FC<IQueryTemplatesProps> = ({
  onApplyTemplate,
  onClose,
  listBaseTemplate,
  availableFields = [],
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = QUERY_TEMPLATES;

    // Filter by list type if specified
    if (listBaseTemplate !== undefined) {
      templates = templates.filter(
        t =>
          !t.listTypes || // Include templates that work with all list types
          t.listTypes.length === 0 ||
          t.listTypes.includes(listBaseTemplate)
      );
    }

    // Filter by available fields
    if (availableFields.length > 0) {
      templates = templates.filter(t => {
        if (!t.requiredFields || t.requiredFields.length === 0) {
          return true; // Template doesn't require specific fields
        }
        // Check if all required fields are available
        return t.requiredFields.every(reqField =>
          availableFields.some(availField => availField.toLowerCase() === reqField.toLowerCase())
        );
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    // Filter by search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      templates = templates.filter(
        t =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search)
      );
    }

    return templates;
  }, [searchTerm, selectedCategory, listBaseTemplate, availableFields]);

  // Group templates by category
  const categorizedTemplates = useMemo(() => {
    const grouped: Record<string, IQueryTemplate[]> = {};

    filteredTemplates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    });

    return grouped;
  }, [filteredTemplates]);

  // Categories for filter
  const categories = useMemo(() => {
    const cats = new Set(QUERY_TEMPLATES.map(t => t.category));
    return Array.from(cats);
  }, []);

  // Apply template
  const handleApplyTemplate = useCallback(
    (template: IQueryTemplate): void => {
      onApplyTemplate(
        template.query,
        template.orderBy || [],
        template.rowLimit || 100
      );
      onClose();
    },
    [onApplyTemplate, onClose]
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Query Templates</h2>
          <DefaultButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClose}
            styles={{ root: { minWidth: 'auto' } }}
          />
        </div>

        {/* Search and Filter */}
        <div style={{ padding: '16px', borderBottom: '1px solid #edebe9' }}>
          <SearchBox
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e, newValue) => setSearchTerm(newValue || '')}
            onClear={() => setSearchTerm('')}
            styles={{ root: { marginBottom: '12px' } }}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '6px 12px',
                border: '1px solid #edebe9',
                borderRadius: '16px',
                background: selectedCategory === 'all' ? '#0078d4' : '#fff',
                color: selectedCategory === 'all' ? '#fff' : '#323130',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: selectedCategory === 'all' ? 600 : 400,
              }}
            >
              All ({QUERY_TEMPLATES.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #edebe9',
                  borderRadius: '16px',
                  background: selectedCategory === category ? '#0078d4' : '#fff',
                  color: selectedCategory === category ? '#fff' : '#323130',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: selectedCategory === category ? 600 : 400,
                }}
              >
                {category} (
                {QUERY_TEMPLATES.filter(t => t.category === category).length})
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {filteredTemplates.length === 0 && (
            <MessageBar>
              No templates found. Try adjusting your search or filter.
            </MessageBar>
          )}

          {Object.keys(categorizedTemplates).map(category => (
            <div key={category} style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0078d4',
                }}
              >
                {category}
              </h3>

              <div style={{ display: 'grid', gap: '12px' }}>
                {categorizedTemplates[category].map(template => (
                  <div
                    key={template.id}
                    style={{
                      border: '1px solid #edebe9',
                      borderRadius: '4px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#0078d4';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#edebe9';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
                          {template.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#605e5c' }}>
                          {template.description}
                        </p>
                      </div>
                      <Icon
                        iconName="ChevronRight"
                        styles={{ root: { fontSize: '16px', color: '#0078d4' } }}
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '8px',
                        fontSize: '11px',
                        color: '#8a8886',
                      }}
                    >
                      <span>
                        <Icon iconName="Filter" /> {template.query.conditions.length} condition
                        {template.query.conditions.length !== 1 ? 's' : ''}
                      </span>
                      {template.orderBy && template.orderBy.length > 0 && (
                        <span>
                          <Icon iconName="Sort" /> Sorted
                        </span>
                      )}
                      {template.rowLimit && (
                        <span>
                          <Icon iconName="NumberField" /> Limit: {template.rowLimit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <DefaultButton text="Close" onClick={onClose} styles={{ root: { padding: '8px 16px' } }} />
        </div>
      </div>
    </div>
  );
};
