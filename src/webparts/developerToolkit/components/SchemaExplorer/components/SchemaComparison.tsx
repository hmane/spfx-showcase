// Schema Comparison Component - Compare schemas between two sites

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  DefaultButton,
  PrimaryButton,
  TextField,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Icon,
  Dropdown,
  IDropdownOption,
  Pivot,
  PivotItem,
} from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SchemaService } from '../services/SchemaService';
import {
  SchemaCategory,
  ISiteColumnSchema,
  IContentTypeSchema,
  IListSchema,
} from '../types/SchemaTypes';

export interface ISchemaComparisonProps {
  context: WebPartContext;
  sourceSiteUrl: string;
  onClose: () => void;
}

interface IComparisonResult {
  category: SchemaCategory;
  onlyInSource: string[];
  onlyInTarget: string[];
  inBoth: string[];
  differences: IDifference[];
}

interface IDifference {
  itemName: string;
  field: string;
  sourceValue: string;
  targetValue: string;
}

type CompareMode = 'siteColumns' | 'contentTypes' | 'lists';

// Compare site columns helper function
const compareSiteColumns = (
  source: ISiteColumnSchema[],
  target: ISiteColumnSchema[]
): IComparisonResult => {
  const sourceMap = new Map(source.map(c => [c.internalName, c]));
  const targetMap = new Map(target.map(c => [c.internalName, c]));

  const onlyInSource: string[] = [];
  const onlyInTarget: string[] = [];
  const inBoth: string[] = [];
  const differences: IDifference[] = [];

  // Find items only in source
  source.forEach(col => {
    if (!targetMap.has(col.internalName)) {
      onlyInSource.push(`${col.title} (${col.internalName})`);
    } else {
      inBoth.push(col.internalName || col.title);
      // Check for differences
      const targetCol = targetMap.get(col.internalName)!;
      if (col.fieldType !== targetCol.fieldType) {
        differences.push({
          itemName: col.title,
          field: 'Field Type',
          sourceValue: col.fieldType,
          targetValue: targetCol.fieldType,
        });
      }
      if (col.required !== targetCol.required) {
        differences.push({
          itemName: col.title,
          field: 'Required',
          sourceValue: col.required ? 'Yes' : 'No',
          targetValue: targetCol.required ? 'Yes' : 'No',
        });
      }
      if (col.group !== targetCol.group) {
        differences.push({
          itemName: col.title,
          field: 'Group',
          sourceValue: col.group,
          targetValue: targetCol.group,
        });
      }
    }
  });

  // Find items only in target
  target.forEach(col => {
    if (!sourceMap.has(col.internalName)) {
      onlyInTarget.push(`${col.title} (${col.internalName})`);
    }
  });

  return {
    category: 'siteColumns',
    onlyInSource,
    onlyInTarget,
    inBoth,
    differences,
  };
};

// Compare content types helper function
const compareContentTypes = (
  source: IContentTypeSchema[],
  target: IContentTypeSchema[]
): IComparisonResult => {
  const sourceMap = new Map(source.map(c => [c.contentTypeId, c]));
  const targetMap = new Map(target.map(c => [c.contentTypeId, c]));

  const onlyInSource: string[] = [];
  const onlyInTarget: string[] = [];
  const inBoth: string[] = [];
  const differences: IDifference[] = [];

  source.forEach(ct => {
    if (!targetMap.has(ct.contentTypeId)) {
      onlyInSource.push(`${ct.title} (${ct.contentTypeId})`);
    } else {
      inBoth.push(ct.title);
      const targetCT = targetMap.get(ct.contentTypeId)!;
      if (ct.fieldLinks.length !== targetCT.fieldLinks.length) {
        differences.push({
          itemName: ct.title,
          field: 'Field Count',
          sourceValue: ct.fieldLinks.length.toString(),
          targetValue: targetCT.fieldLinks.length.toString(),
        });
      }
    }
  });

  target.forEach(ct => {
    if (!sourceMap.has(ct.contentTypeId)) {
      onlyInTarget.push(`${ct.title} (${ct.contentTypeId})`);
    }
  });

  return {
    category: 'contentTypes',
    onlyInSource,
    onlyInTarget,
    inBoth,
    differences,
  };
};

// Compare lists helper function
const compareLists = (
  source: IListSchema[],
  target: IListSchema[]
): IComparisonResult => {
  const sourceMap = new Map(source.map(l => [l.title.toLowerCase(), l]));
  const targetMap = new Map(target.map(l => [l.title.toLowerCase(), l]));

  const onlyInSource: string[] = [];
  const onlyInTarget: string[] = [];
  const inBoth: string[] = [];
  const differences: IDifference[] = [];

  source.forEach(list => {
    const key = list.title.toLowerCase();
    if (!targetMap.has(key)) {
      onlyInSource.push(list.title);
    } else {
      inBoth.push(list.title);
      const targetList = targetMap.get(key)!;

      // Compare field counts
      if (list.fields.length !== targetList.fields.length) {
        differences.push({
          itemName: list.title,
          field: 'Field Count',
          sourceValue: list.fields.length.toString(),
          targetValue: targetList.fields.length.toString(),
        });
      }

      // Compare view counts
      if (list.views.length !== targetList.views.length) {
        differences.push({
          itemName: list.title,
          field: 'View Count',
          sourceValue: list.views.length.toString(),
          targetValue: targetList.views.length.toString(),
        });
      }

      // Compare settings
      if (list.enableVersioning !== targetList.enableVersioning) {
        differences.push({
          itemName: list.title,
          field: 'Versioning',
          sourceValue: list.enableVersioning ? 'Enabled' : 'Disabled',
          targetValue: targetList.enableVersioning ? 'Enabled' : 'Disabled',
        });
      }
    }
  });

  target.forEach(list => {
    if (!sourceMap.has(list.title.toLowerCase())) {
      onlyInTarget.push(list.title);
    }
  });

  return {
    category: 'lists',
    onlyInSource,
    onlyInTarget,
    inBoth,
    differences,
  };
};

export const SchemaComparison: React.FC<ISchemaComparisonProps> = ({
  context,
  sourceSiteUrl,
  onClose,
}) => {
  const [targetSiteUrl, setTargetSiteUrl] = useState<string>('');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [compareMode, setCompareMode] = useState<CompareMode>('lists');
  const [results, setResults] = useState<IComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Compare schemas
  const handleCompare = useCallback(async () => {
    if (!targetSiteUrl.trim()) {
      setError('Please enter a target site URL');
      return;
    }

    setIsComparing(true);
    setError('');
    setResults(null);

    try {
      const sourceService = new SchemaService(context, sourceSiteUrl || undefined);
      const targetService = new SchemaService(context, targetSiteUrl);

      let result: IComparisonResult;

      switch (compareMode) {
        case 'siteColumns': {
          const [sourceCols, targetCols] = await Promise.all([
            sourceService.getSiteColumns(),
            targetService.getSiteColumns(),
          ]);
          result = compareSiteColumns(sourceCols, targetCols);
          break;
        }
        case 'contentTypes': {
          const [sourceCTs, targetCTs] = await Promise.all([
            sourceService.getContentTypes(),
            targetService.getContentTypes(),
          ]);
          result = compareContentTypes(sourceCTs, targetCTs);
          break;
        }
        case 'lists': {
          const [sourceLists, targetLists] = await Promise.all([
            sourceService.getLists(),
            targetService.getLists(),
          ]);
          result = compareLists(sourceLists, targetLists);
          break;
        }
        default:
          throw new Error('Invalid compare mode');
      }

      setResults(result);
    } catch (err: any) {
      setError(`Comparison failed: ${err.message}`);
    } finally {
      setIsComparing(false);
    }
  }, [context, sourceSiteUrl, targetSiteUrl, compareMode]);

  // Mode options
  const modeOptions: IDropdownOption[] = [
    { key: 'lists', text: 'Lists & Libraries' },
    { key: 'siteColumns', text: 'Site Columns' },
    { key: 'contentTypes', text: 'Content Types' },
  ];

  // Stats
  const stats = useMemo(() => {
    if (!results) return null;
    return {
      total: results.onlyInSource.length + results.onlyInTarget.length + results.inBoth.length,
      matching: results.inBoth.length,
      onlySource: results.onlyInSource.length,
      onlyTarget: results.onlyInTarget.length,
      differences: results.differences.length,
    };
  }, [results]);

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
              <Icon iconName="BranchCompare" style={{ marginRight: '8px' }} />
              Schema Comparison
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              Compare schemas between two SharePoint sites
            </p>
          </div>
          <DefaultButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClose}
            styles={{ root: { minWidth: 'auto' } }}
          />
        </div>

        {/* Configuration */}
        <div style={{ padding: '20px', borderBottom: '1px solid #edebe9' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              label="Source Site"
              value={sourceSiteUrl || context.pageContext.web.absoluteUrl}
              disabled
              styles={{ root: { flex: 1, minWidth: '250px' } }}
            />
            <Icon iconName="Forward" style={{ marginBottom: '8px', color: '#0078d4' }} />
            <TextField
              label="Target Site URL"
              placeholder="https://tenant.sharepoint.com/sites/target"
              value={targetSiteUrl}
              onChange={(_, v) => setTargetSiteUrl(v || '')}
              styles={{ root: { flex: 1, minWidth: '250px' } }}
            />
            <Dropdown
              label="Compare"
              selectedKey={compareMode}
              options={modeOptions}
              onChange={(_, opt) => opt && setCompareMode(opt.key as CompareMode)}
              styles={{ root: { width: '180px' } }}
            />
            <PrimaryButton
              text={isComparing ? 'Comparing...' : 'Compare'}
              iconProps={{ iconName: 'Compare' }}
              onClick={handleCompare}
              disabled={isComparing || !targetSiteUrl.trim()}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError('')}>
            {error}
          </MessageBar>
        )}

        {/* Loading */}
        {isComparing && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spinner size={SpinnerSize.large} label="Comparing schemas..." />
          </div>
        )}

        {/* Results */}
        {results && !isComparing && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Stats Summary */}
            {stats && (
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px 20px',
                  background: '#faf9f8',
                  borderBottom: '1px solid #edebe9',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ textAlign: 'center', padding: '8px 16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#107c10' }}>
                    {stats.matching}
                  </div>
                  <div style={{ fontSize: '11px', color: '#605e5c' }}>Matching</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#0078d4' }}>
                    {stats.onlySource}
                  </div>
                  <div style={{ fontSize: '11px', color: '#605e5c' }}>Only in Source</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#8764b8' }}>
                    {stats.onlyTarget}
                  </div>
                  <div style={{ fontSize: '11px', color: '#605e5c' }}>Only in Target</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#d83b01' }}>
                    {stats.differences}
                  </div>
                  <div style={{ fontSize: '11px', color: '#605e5c' }}>Differences</div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <Pivot
              selectedKey={activeTab}
              onLinkClick={item => item && setActiveTab(item.props.itemKey || 'summary')}
              styles={{ root: { borderBottom: '1px solid #edebe9', paddingLeft: '20px' } }}
            >
              <PivotItem headerText="Only in Source" itemKey="source" itemCount={results.onlyInSource.length} />
              <PivotItem headerText="Only in Target" itemKey="target" itemCount={results.onlyInTarget.length} />
              <PivotItem headerText="Differences" itemKey="diff" itemCount={results.differences.length} />
              <PivotItem headerText="Matching" itemKey="match" itemCount={results.inBoth.length} />
            </Pivot>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
              {activeTab === 'source' && (
                <div>
                  {results.onlyInSource.length === 0 ? (
                    <div style={{ color: '#605e5c', textAlign: 'center', padding: '20px' }}>
                      No items found only in source
                    </div>
                  ) : (
                    results.onlyInSource.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          background: '#deecf9',
                          borderRadius: '4px',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Icon iconName="Add" style={{ color: '#0078d4' }} />
                        {item}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'target' && (
                <div>
                  {results.onlyInTarget.length === 0 ? (
                    <div style={{ color: '#605e5c', textAlign: 'center', padding: '20px' }}>
                      No items found only in target
                    </div>
                  ) : (
                    results.onlyInTarget.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          background: '#e8daef',
                          borderRadius: '4px',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Icon iconName="Remove" style={{ color: '#8764b8' }} />
                        {item}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'diff' && (
                <div>
                  {results.differences.length === 0 ? (
                    <div style={{ color: '#605e5c', textAlign: 'center', padding: '20px' }}>
                      No differences found in matching items
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f3f2f1' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #edebe9' }}>Item</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #edebe9' }}>Property</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #edebe9' }}>Source</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #edebe9' }}>Target</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.differences.map((diff, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #edebe9' }}>{diff.itemName}</td>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #edebe9' }}>{diff.field}</td>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #edebe9', color: '#0078d4' }}>{diff.sourceValue}</td>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #edebe9', color: '#8764b8' }}>{diff.targetValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'match' && (
                <div>
                  {results.inBoth.length === 0 ? (
                    <div style={{ color: '#605e5c', textAlign: 'center', padding: '20px' }}>
                      No matching items found
                    </div>
                  ) : (
                    results.inBoth.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          background: '#dff6dd',
                          borderRadius: '4px',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Icon iconName="CheckMark" style={{ color: '#107c10' }} />
                        {item}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!results && !isComparing && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#605e5c' }}>
            <Icon iconName="BranchCompare" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
            <div style={{ fontSize: '14px' }}>Enter a target site URL and click Compare</div>
          </div>
        )}

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
