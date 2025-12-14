// List Details Panel - Expandable view of list fields, views, and settings

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Icon,
  DefaultButton,
  SearchBox,
  Pivot,
  PivotItem,
} from '@fluentui/react';
import { IListSchema, IListFieldSchema } from '../types/SchemaTypes';

export interface IListDetailsPanelProps {
  list: IListSchema;
  onClose: () => void;
}

export const ListDetailsPanel: React.FC<IListDetailsPanelProps> = ({
  list,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>('fields');
  const [fieldSearch, setFieldSearch] = useState<string>('');
  const [showSystemFields, setShowSystemFields] = useState<boolean>(false);

  // System field names to filter
  const SYSTEM_FIELDS = [
    'ContentType', 'ID', 'Created', 'Author', 'Modified', 'Editor',
    'Attachments', 'Edit', 'LinkTitleNoMenu', 'LinkTitle', 'DocIcon',
    'ItemChildCount', 'FolderChildCount', 'AppAuthor', 'AppEditor',
    'ContentTypeId', 'SyncClientId', 'ComplianceAssetId', 'GUID',
    'FileDirRef', 'FSObjType', 'PermMask', 'FileRef', 'FileLeafRef',
    'UniqueId', 'File_x0020_Type', 'HTML_x0020_File_x0020_Type',
  ];

  // Filter fields
  const filteredFields = useMemo(() => {
    let fields = list.fields;

    // Filter system fields
    if (!showSystemFields) {
      fields = fields.filter(f =>
        !SYSTEM_FIELDS.includes(f.internalName) &&
        !f.internalName.startsWith('_') &&
        !f.internalName.startsWith('ows_')
      );
    }

    // Search filter
    if (fieldSearch.trim()) {
      const search = fieldSearch.toLowerCase();
      fields = fields.filter(f =>
        f.title.toLowerCase().includes(search) ||
        f.internalName.toLowerCase().includes(search) ||
        f.fieldType.toLowerCase().includes(search)
      );
    }

    return fields;
  }, [list.fields, showSystemFields, fieldSearch]);

  // Group fields by type
  const fieldsByType = useMemo(() => {
    const groups: Record<string, IListFieldSchema[]> = {};
    filteredFields.forEach(f => {
      if (!groups[f.fieldType]) {
        groups[f.fieldType] = [];
      }
      groups[f.fieldType].push(f);
    });
    return groups;
  }, [filteredFields]);

  // Get field type icon
  const getFieldTypeIcon = (fieldType: string): string => {
    const iconMap: Record<string, string> = {
      Text: 'TextField',
      Note: 'TextDocument',
      Number: 'NumberField',
      Currency: 'Money',
      DateTime: 'Calendar',
      Boolean: 'CheckboxComposite',
      Choice: 'BulletedList',
      MultiChoice: 'CheckList',
      Lookup: 'Link',
      User: 'Contact',
      URL: 'Globe',
      Calculated: 'Calculator',
      TaxonomyFieldType: 'Tag',
      TaxonomyFieldTypeMulti: 'Tag',
      Attachments: 'Attach',
      Counter: 'NumberSequence',
      Integer: 'NumberField',
    };
    return iconMap[fieldType] || 'FieldEmpty';
  };

  // Get field type color
  const getFieldTypeColor = (fieldType: string): string => {
    const colorMap: Record<string, string> = {
      Text: '#0078d4',
      Note: '#0078d4',
      Number: '#107c10',
      Currency: '#107c10',
      DateTime: '#8764b8',
      Boolean: '#d83b01',
      Choice: '#00bcf2',
      MultiChoice: '#00bcf2',
      Lookup: '#e3008c',
      User: '#5c2d91',
      URL: '#0078d4',
      Calculated: '#ffb900',
      TaxonomyFieldType: '#00ad56',
      TaxonomyFieldTypeMulti: '#00ad56',
    };
    return colorMap[fieldType] || '#605e5c';
  };

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
          maxWidth: '900px',
          width: '95%',
          maxHeight: '90vh',
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
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon iconName={list.baseTemplate === 101 ? 'DocLibrary' : 'List'} />
              {list.title}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              {list.description || 'No description'}
            </p>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <div style={{ fontSize: '12px' }}>
                <strong>{list.fields.length}</strong> fields
              </div>
              <div style={{ fontSize: '12px' }}>
                <strong>{list.views.length}</strong> views
              </div>
              <div style={{ fontSize: '12px' }}>
                <strong>{list.itemCount}</strong> items
              </div>
              {list.contentTypesEnabled && (
                <div style={{ fontSize: '12px' }}>
                  <strong>{list.contentTypes.length}</strong> content types
                </div>
              )}
            </div>
          </div>
          <DefaultButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClose}
            styles={{ root: { minWidth: 'auto' } }}
          />
        </div>

        {/* Settings summary */}
        <div
          style={{
            padding: '12px 20px',
            background: '#faf9f8',
            borderBottom: '1px solid #edebe9',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {list.enableVersioning && (
            <span style={{ fontSize: '11px', padding: '3px 8px', background: '#dff6dd', borderRadius: '10px', color: '#107c10' }}>
              <Icon iconName="History" style={{ marginRight: '4px' }} />
              Versioning
            </span>
          )}
          {list.enableMinorVersions && (
            <span style={{ fontSize: '11px', padding: '3px 8px', background: '#dff6dd', borderRadius: '10px', color: '#107c10' }}>
              Minor Versions
            </span>
          )}
          {list.enableModeration && (
            <span style={{ fontSize: '11px', padding: '3px 8px', background: '#fff4ce', borderRadius: '10px', color: '#797673' }}>
              <Icon iconName="Shield" style={{ marginRight: '4px' }} />
              Moderation
            </span>
          )}
          {list.forceCheckout && (
            <span style={{ fontSize: '11px', padding: '3px 8px', background: '#fff4ce', borderRadius: '10px', color: '#797673' }}>
              <Icon iconName="CheckOutSingle" style={{ marginRight: '4px' }} />
              Checkout Required
            </span>
          )}
          {list.contentTypesEnabled && (
            <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e1dfdd', borderRadius: '10px', color: '#323130' }}>
              <Icon iconName="DocumentSet" style={{ marginRight: '4px' }} />
              Content Types
            </span>
          )}
          {list.enableFolderCreation && (
            <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e1dfdd', borderRadius: '10px', color: '#323130' }}>
              <Icon iconName="FabricFolder" style={{ marginRight: '4px' }} />
              Folders
            </span>
          )}
        </div>

        {/* Tabs */}
        <Pivot
          selectedKey={activeTab}
          onLinkClick={item => item && setActiveTab(item.props.itemKey || 'fields')}
          styles={{ root: { borderBottom: '1px solid #edebe9', paddingLeft: '20px' } }}
        >
          <PivotItem headerText="Fields" itemKey="fields" itemCount={list.fields.length} itemIcon="FieldFilled" />
          <PivotItem headerText="Views" itemKey="views" itemCount={list.views.length} itemIcon="View" />
          {list.contentTypesEnabled && (
            <PivotItem headerText="Content Types" itemKey="contenttypes" itemCount={list.contentTypes.length} itemIcon="DocumentSet" />
          )}
        </Pivot>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <div style={{ padding: '16px 20px' }}>
              {/* Search and filters */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <SearchBox
                  placeholder="Search fields..."
                  value={fieldSearch}
                  onChange={(_, v) => setFieldSearch(v || '')}
                  styles={{ root: { flex: 1, maxWidth: '300px' } }}
                />
                <DefaultButton
                  text={showSystemFields ? 'Hide System Fields' : 'Show System Fields'}
                  iconProps={{ iconName: showSystemFields ? 'Hide' : 'View' }}
                  onClick={() => setShowSystemFields(!showSystemFields)}
                />
              </div>

              {/* Field type summary */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {Object.entries(fieldsByType).map(([type, fields]) => (
                  <span
                    key={type}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      background: `${getFieldTypeColor(type)}15`,
                      border: `1px solid ${getFieldTypeColor(type)}30`,
                      borderRadius: '4px',
                      color: getFieldTypeColor(type),
                    }}
                  >
                    <Icon iconName={getFieldTypeIcon(type)} style={{ marginRight: '4px' }} />
                    {type}: {fields.length}
                  </span>
                ))}
              </div>

              {/* Fields list */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                {filteredFields.map(field => (
                  <div
                    key={field.id}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #edebe9',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${getFieldTypeColor(field.fieldType)}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon
                        iconName={getFieldTypeIcon(field.fieldType)}
                        style={{ color: getFieldTypeColor(field.fieldType) }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {field.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#605e5c', fontFamily: 'monospace' }}>
                          {field.internalName}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', padding: '1px 6px', background: '#f3f2f1', borderRadius: '3px' }}>
                        {field.fieldType}
                      </span>
                      {field.required && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', background: '#fde7e9', borderRadius: '3px', color: '#a80000' }}>
                          Required
                        </span>
                      )}
                      {field.indexed && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', background: '#dff6dd', borderRadius: '3px', color: '#107c10' }}>
                          Indexed
                        </span>
                      )}
                      {field.hidden && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', background: '#e1dfdd', borderRadius: '3px', color: '#605e5c' }}>
                          Hidden
                        </span>
                      )}
                      {field.customFormatter && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', background: '#e8daef', borderRadius: '3px', color: '#5c2d91' }}>
                          Formatted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Views Tab */}
          {activeTab === 'views' && (
            <div style={{ padding: '16px 20px' }}>
              {list.views.map(view => (
                <div
                  key={view.id}
                  style={{
                    padding: '14px',
                    border: '1px solid #edebe9',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    borderLeft: view.defaultView ? '3px solid #0078d4' : '1px solid #edebe9',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon iconName="View" style={{ color: '#0078d4' }} />
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{view.title}</span>
                        {view.defaultView && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#0078d4', color: '#fff', borderRadius: '3px' }}>
                            Default
                          </span>
                        )}
                        {view.personalView && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e1dfdd', borderRadius: '3px' }}>
                            Personal
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '4px' }}>
                        Row Limit: {view.rowLimit} • {view.viewFields.length} columns
                      </div>
                    </div>
                  </div>

                  {/* View fields */}
                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {view.viewFields.map((fieldName, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          background: '#f3f2f1',
                          borderRadius: '3px',
                        }}
                      >
                        {fieldName}
                      </span>
                    ))}
                  </div>

                  {/* View query */}
                  {view.viewQuery && (
                    <details style={{ marginTop: '10px' }}>
                      <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#0078d4' }}>
                        View Query (CAML)
                      </summary>
                      <pre
                        style={{
                          margin: '8px 0 0 0',
                          padding: '8px',
                          background: '#f3f2f1',
                          borderRadius: '4px',
                          fontSize: '11px',
                          overflow: 'auto',
                          maxHeight: '100px',
                        }}
                      >
                        {view.viewQuery}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Content Types Tab */}
          {activeTab === 'contenttypes' && (
            <div style={{ padding: '16px 20px' }}>
              {list.contentTypes.map((ct, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #edebe9',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Icon iconName="DocumentSet" style={{ color: '#0078d4' }} />
                  <span style={{ fontWeight: 500 }}>{ct}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <DefaultButton text="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};
