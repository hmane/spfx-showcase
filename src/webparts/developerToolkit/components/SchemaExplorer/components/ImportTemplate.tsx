// Import Template Component - Parse and visualize PnP templates

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  DefaultButton,
  PrimaryButton,
  TextField,
  MessageBar,
  MessageBarType,
  Icon,
  Pivot,
  PivotItem,
} from '@fluentui/react';
export interface IImportTemplateProps {
  onImport?: (template: IParsedTemplate) => void;
  onClose: () => void;
}

export interface IParsedTemplate {
  format: 'pnp-json' | 'pnp-xml' | 'site-script';
  siteColumns: IParsedField[];
  contentTypes: IParsedContentType[];
  lists: IParsedList[];
  navigation: IParsedNavigation | null;
  security: IParsedSecurity | null;
  raw: string;
}

interface IParsedField {
  id?: string;
  name: string;
  displayName: string;
  type: string;
  group?: string;
  required?: boolean;
}

interface IParsedContentType {
  id: string;
  name: string;
  description?: string;
  group?: string;
  fieldRefs: string[];
}

interface IParsedList {
  title: string;
  url?: string;
  templateType: number;
  fields: IParsedField[];
  views: string[];
  contentTypes?: string[];
}

interface IParsedNavigation {
  global?: IParsedNavNode[];
  current?: IParsedNavNode[];
}

interface IParsedNavNode {
  title: string;
  url: string;
  children?: IParsedNavNode[];
}

interface IParsedSecurity {
  groups: string[];
  roleDefinitions: string[];
}

// Map navigation node helper
const mapNavNode = (node: any): IParsedNavNode => ({
  title: node.title,
  url: node.url,
  children: node.children?.map(mapNavNode),
});

// Parse PnP JSON template
const parsePnPJson = (json: any, raw: string): IParsedTemplate => {
  const result: IParsedTemplate = {
    format: 'pnp-json',
    siteColumns: [],
    contentTypes: [],
    lists: [],
    navigation: null,
    security: null,
    raw,
  };

  // Parse site fields
  if (json.siteFields) {
    result.siteColumns = json.siteFields.map((f: any) => {
      if (f.schemaXml) {
        // Parse from schemaXml
        const nameMatch = f.schemaXml.match(/Name="([^"]+)"/);
        const displayMatch = f.schemaXml.match(/DisplayName="([^"]+)"/);
        const typeMatch = f.schemaXml.match(/Type="([^"]+)"/);
        const groupMatch = f.schemaXml.match(/Group="([^"]+)"/);
        const idMatch = f.schemaXml.match(/ID="\{?([^}"]+)\}?"/);

        return {
          id: idMatch?.[1],
          name: nameMatch?.[1] || 'Unknown',
          displayName: displayMatch?.[1] || nameMatch?.[1] || 'Unknown',
          type: typeMatch?.[1] || 'Text',
          group: groupMatch?.[1],
        };
      }
      return {
        name: f.internalName || f.name || 'Unknown',
        displayName: f.displayName || f.title || f.name || 'Unknown',
        type: f.type || f.fieldType || 'Text',
        group: f.group,
      };
    });
  }

  // Parse content types
  if (json.contentTypes) {
    result.contentTypes = json.contentTypes.map((ct: any) => ({
      id: ct.id || ct.contentTypeId,
      name: ct.name,
      description: ct.description,
      group: ct.group,
      fieldRefs: (ct.fieldRefs || []).map((fr: any) => fr.name || fr.id),
    }));
  }

  // Parse lists
  if (json.lists) {
    result.lists = json.lists.map((list: any) => ({
      title: list.title,
      url: list.url,
      templateType: list.templateType || 100,
      fields: (list.fields || []).map((f: any) => ({
        name: f.internalName || f.name,
        displayName: f.displayName || f.title || f.name,
        type: f.type || 'Text',
        required: f.required,
      })),
      views: (list.views || []).map((v: any) => v.title || v.name),
      contentTypes: list.contentTypeBindings?.map((b: any) => b.name),
    }));
  }

  // Parse navigation
  if (json.navigation) {
    result.navigation = {
      global: json.navigation.globalNavigation?.structuralNavigation?.navigationNodes?.map(mapNavNode),
      current: json.navigation.currentNavigation?.structuralNavigation?.navigationNodes?.map(mapNavNode),
    };
  }

  // Parse security
  if (json.security) {
    result.security = {
      groups: (json.security.siteGroups || []).map((g: any) => g.title),
      roleDefinitions: (json.security.permissions?.roleDefinitions || []).map((r: any) => r.name),
    };
  }

  return result;
};

// Parse Site Script
const parseSiteScript = (json: any, raw: string): IParsedTemplate => {
  const result: IParsedTemplate = {
    format: 'site-script',
    siteColumns: [],
    contentTypes: [],
    lists: [],
    navigation: null,
    security: null,
    raw,
  };

  if (json.actions) {
    json.actions.forEach((action: any) => {
      switch (action.verb) {
        case 'createSiteColumn':
        case 'addSiteColumn':
          result.siteColumns.push({
            name: action.internalName || action.name,
            displayName: action.displayName || action.name,
            type: action.fieldType || 'Text',
            group: action.group,
            required: action.isRequired,
          });
          break;
        case 'createContentType':
          result.contentTypes.push({
            id: action.id || '',
            name: action.name,
            description: action.description,
            fieldRefs: [],
          });
          break;
        case 'createSPList':
          result.lists.push({
            title: action.listName,
            templateType: action.templateType || 100,
            fields: (action.subactions || [])
              .filter((s: any) => s.verb === 'addSPField')
              .map((s: any) => ({
                name: s.internalName || s.displayName,
                displayName: s.displayName,
                type: s.fieldType || 'Text',
                required: s.isRequired,
              })),
            views: (action.subactions || [])
              .filter((s: any) => s.verb === 'addSPView')
              .map((s: any) => s.name),
          });
          break;
      }
    });
  }

  return result;
};

// Parse PnP XML template
const parsePnPXml = (xml: string): IParsedTemplate => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const result: IParsedTemplate = {
    format: 'pnp-xml',
    siteColumns: [],
    contentTypes: [],
    lists: [],
    navigation: null,
    security: null,
    raw: xml,
  };

  // Parse site fields
  const siteFields = doc.querySelectorAll('SiteFields Field, pnp\\:SiteFields Field');
  siteFields.forEach(field => {
    result.siteColumns.push({
      id: field.getAttribute('ID') || undefined,
      name: field.getAttribute('Name') || field.getAttribute('StaticName') || 'Unknown',
      displayName: field.getAttribute('DisplayName') || field.getAttribute('Name') || 'Unknown',
      type: field.getAttribute('Type') || 'Text',
      group: field.getAttribute('Group') || undefined,
      required: field.getAttribute('Required') === 'TRUE',
    });
  });

  // Parse content types
  const contentTypes = doc.querySelectorAll('ContentType, pnp\\:ContentType');
  contentTypes.forEach(ct => {
    const fieldRefs: string[] = [];
    ct.querySelectorAll('FieldRef, pnp\\:FieldRef').forEach(fr => {
      fieldRefs.push(fr.getAttribute('Name') || fr.getAttribute('ID') || '');
    });

    result.contentTypes.push({
      id: ct.getAttribute('ID') || '',
      name: ct.getAttribute('Name') || 'Unknown',
      description: ct.getAttribute('Description') || undefined,
      group: ct.getAttribute('Group') || undefined,
      fieldRefs,
    });
  });

  // Parse lists
  const lists = doc.querySelectorAll('ListInstance, pnp\\:ListInstance');
  lists.forEach(list => {
    const fields: IParsedField[] = [];
    list.querySelectorAll('Field').forEach(f => {
      fields.push({
        name: f.getAttribute('Name') || 'Unknown',
        displayName: f.getAttribute('DisplayName') || f.getAttribute('Name') || 'Unknown',
        type: f.getAttribute('Type') || 'Text',
        required: f.getAttribute('Required') === 'TRUE',
      });
    });

    const views: string[] = [];
    list.querySelectorAll('View, pnp\\:View').forEach(v => {
      views.push(v.getAttribute('DisplayName') || v.getAttribute('Title') || 'Unknown');
    });

    result.lists.push({
      title: list.getAttribute('Title') || 'Unknown',
      url: list.getAttribute('Url') || undefined,
      templateType: parseInt(list.getAttribute('TemplateType') || '100', 10),
      fields,
      views,
    });
  });

  return result;
};

export const ImportTemplate: React.FC<IImportTemplateProps> = ({
  onImport,
  onClose,
}) => {
  const [templateContent, setTemplateContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<IParsedTemplate | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('input');

  // Parse template
  const handleParse = useCallback(() => {
    if (!templateContent.trim()) {
      setError('Please paste a template');
      return;
    }

    setError('');

    try {
      const trimmed = templateContent.trim();

      // Detect format
      if (trimmed.startsWith('{')) {
        // JSON format - could be PnP JSON or Site Script
        const json = JSON.parse(trimmed);

        if (json.$schema?.includes('site-design-script')) {
          // Site Script
          setParseResult(parseSiteScript(json, trimmed));
        } else {
          // PnP JSON
          setParseResult(parsePnPJson(json, trimmed));
        }
      } else if (trimmed.startsWith('<?xml') || trimmed.startsWith('<pnp:')) {
        // PnP XML
        setParseResult(parsePnPXml(trimmed));
      } else {
        throw new Error('Unrecognized template format. Supported formats: PnP JSON, PnP XML, Site Script');
      }

      setActiveTab('preview');
    } catch (err: any) {
      setError(`Parse error: ${err.message}`);
      setParseResult(null);
    }
  }, [templateContent]);

  // Handle import
  const handleImport = useCallback(() => {
    if (parseResult && onImport) {
      onImport(parseResult);
      onClose();
    }
  }, [parseResult, onImport, onClose]);

  // Stats for parsed template
  const stats = useMemo(() => {
    if (!parseResult) return null;
    return {
      siteColumns: parseResult.siteColumns.length,
      contentTypes: parseResult.contentTypes.length,
      lists: parseResult.lists.length,
      hasNavigation: parseResult.navigation !== null,
      hasSecurity: parseResult.security !== null,
    };
  }, [parseResult]);

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
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              <Icon iconName="Import" style={{ marginRight: '8px' }} />
              Import Template
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              Paste a PnP template (JSON/XML) or Site Script to visualize its contents
            </p>
          </div>
          <DefaultButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClose}
            styles={{ root: { minWidth: 'auto' } }}
          />
        </div>

        {/* Error */}
        {error && (
          <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError('')}>
            {error}
          </MessageBar>
        )}

        {/* Tabs */}
        <Pivot
          selectedKey={activeTab}
          onLinkClick={item => item && setActiveTab(item.props.itemKey || 'input')}
          styles={{ root: { borderBottom: '1px solid #edebe9', paddingLeft: '20px' } }}
        >
          <PivotItem headerText="Input" itemKey="input" itemIcon="Edit" />
          <PivotItem
            headerText="Preview"
            itemKey="preview"
            itemIcon="View"
            headerButtonProps={{ disabled: !parseResult }}
          />
        </Pivot>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'input' && (
            <div style={{ padding: '16px 20px', height: '400px' }}>
              <TextField
                multiline
                rows={20}
                placeholder="Paste your PnP template JSON, XML, or Site Script here..."
                value={templateContent}
                onChange={(_, v) => setTemplateContent(v || '')}
                styles={{
                  root: { height: '100%' },
                  wrapper: { height: '100%' },
                  fieldGroup: { height: '100%' },
                  field: { height: '100%', fontFamily: 'monospace', fontSize: '12px' },
                }}
              />
            </div>
          )}

          {activeTab === 'preview' && parseResult && (
            <div style={{ padding: '16px 20px' }}>
              {/* Format badge */}
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    background: '#0078d4',
                    color: '#fff',
                    borderRadius: '16px',
                    fontSize: '12px',
                  }}
                >
                  {parseResult.format.toUpperCase()}
                </span>
              </div>

              {/* Stats */}
              {stats && (
                <div
                  style={{
                    display: 'flex',
                    gap: '24px',
                    padding: '16px',
                    background: '#faf9f8',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.siteColumns}</div>
                    <div style={{ fontSize: '12px', color: '#605e5c' }}>Site Columns</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.contentTypes}</div>
                    <div style={{ fontSize: '12px', color: '#605e5c' }}>Content Types</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.lists}</div>
                    <div style={{ fontSize: '12px', color: '#605e5c' }}>Lists</div>
                  </div>
                </div>
              )}

              {/* Site Columns */}
              {parseResult.siteColumns.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Site Columns ({parseResult.siteColumns.length})</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {parseResult.siteColumns.map((col, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 12px',
                          background: '#f3f2f1',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <strong>{col.displayName}</strong>
                        <span style={{ color: '#605e5c', marginLeft: '8px' }}>{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Types */}
              {parseResult.contentTypes.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Content Types ({parseResult.contentTypes.length})</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {parseResult.contentTypes.map((ct, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 12px',
                          background: '#e1dfdd',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <strong>{ct.name}</strong>
                        {ct.fieldRefs.length > 0 && (
                          <span style={{ color: '#605e5c', marginLeft: '8px' }}>
                            {ct.fieldRefs.length} fields
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lists */}
              {parseResult.lists.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Lists ({parseResult.lists.length})</h4>
                  {parseResult.lists.map((list, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        background: '#faf9f8',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        border: '1px solid #edebe9',
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{list.title}</div>
                      <div style={{ fontSize: '12px', color: '#605e5c' }}>
                        Template: {list.templateType} • {list.fields.length} fields • {list.views.length} views
                      </div>
                      {list.fields.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {list.fields.slice(0, 10).map((f, j) => (
                            <span
                              key={j}
                              style={{
                                padding: '2px 8px',
                                background: '#fff',
                                border: '1px solid #edebe9',
                                borderRadius: '3px',
                                fontSize: '11px',
                              }}
                            >
                              {f.displayName}
                            </span>
                          ))}
                          {list.fields.length > 10 && (
                            <span style={{ fontSize: '11px', color: '#605e5c' }}>
                              +{list.fields.length - 10} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <DefaultButton
            text="Parse Template"
            iconProps={{ iconName: 'Processing' }}
            onClick={handleParse}
            disabled={!templateContent.trim()}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <DefaultButton text="Cancel" onClick={onClose} />
            <PrimaryButton
              text="Import"
              iconProps={{ iconName: 'Import' }}
              onClick={handleImport}
              disabled={!parseResult}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
