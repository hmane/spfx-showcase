// src/webparts/showcase/components/CamlQueryBuilder/CamlQueryBuilder.tsx

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  DetailsList,
  DetailsListLayoutMode,
  DefaultButton,
  IColumn,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Toggle,
} from '@fluentui/react';
import { SharePointService } from './services/SharePointService';
import { SiteListSelector } from './components/SiteListSelector';
import { ConditionGroup } from './components/ConditionGroup';
import { AdvancedOptions } from './components/AdvancedOptions';
import { CAMLPreview } from './components/CAMLPreview';
import { ExportPanel } from './components/ExportPanel';
import { QueryTemplates } from './components/QueryTemplates';
import { CodeEditor } from '../../../../components/CodeEditor';
import {
  IFieldInfo,
  IConditionGroup,
  IOrderByField,
  ICAMLQuery,
  ExportFormat,
  ViewScope,
} from './types/CamlTypes';
import { buildCAMLQuery, validateCAMLQuery, createEmptyGroup } from './utils/camlBuilder';
import { ImportCAML } from './components/ImportCAML';
import { QueryHistory, addQueryToHistory } from './components/QueryHistory';
import styles from './CamlQueryBuilder.module.scss';

export interface ICamlQueryBuilderProps {
  context: WebPartContext;
}

export const CamlQueryBuilder: React.FC<ICamlQueryBuilderProps> = ({ context }) => {
  // Services
  const spService = useMemo(() => new SharePointService(context), [context]);

  // State
  const [siteUrl, setSiteUrl] = useState<string>(context.pageContext.web.absoluteUrl);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedListTitle, setSelectedListTitle] = useState<string>('');
  const [selectedListBaseTemplate, setSelectedListBaseTemplate] = useState<number | undefined>();
  const [fields, setFields] = useState<IFieldInfo[]>([]);

  // Query state
  const [rootGroup, setRootGroup] = useState<IConditionGroup>(createEmptyGroup());
  const [orderBy, setOrderBy] = useState<IOrderByField[]>([]);
  const [viewFields, setViewFields] = useState<string[]>([]);
  const [rowLimit, setRowLimit] = useState<number | null>(null);
  const [scope, setScope] = useState<ViewScope>('Default');
  const [contentTypeId, setContentTypeId] = useState<string>('');

  // UI state
  const [generatedCAML, setGeneratedCAML] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('caml');
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [isTestingQuery, setIsTestingQuery] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<{ count: number; items: any[] } | null>(null);
  const [showRawResults, setShowRawResults] = useState<boolean>(false);

  // Generate CAML whenever query changes
  useEffect(() => {
    const query: ICAMLQuery = {
      where: rootGroup,
      orderBy,
      viewFields,
      rowLimit,
      scope,
      contentTypeId,
    };

    // Validate
    const errors = validateCAMLQuery(query);
    setValidationErrors(errors);

    // Generate CAML XML
    const caml = buildCAMLQuery(query);
    setGeneratedCAML(caml);
  }, [rootGroup, orderBy, viewFields, rowLimit, scope, contentTypeId]);

  // Handle list selection
  const handleListSelected = useCallback(
    (listId: string, listTitle: string, listFields: IFieldInfo[], baseTemplate?: number): void => {
      setSelectedListId(listId);
      setSelectedListTitle(listTitle);
      setSelectedListBaseTemplate(baseTemplate);
      setFields(listFields);

      // Reset query
      setRootGroup(createEmptyGroup());
      setOrderBy([]);
      setViewFields([]);
      setRowLimit(null);
      setScope('Default');
      setContentTypeId('');
      setTestResults(null);
    },
    []
  );

  // Handle site URL change
  const handleSiteUrlChange = useCallback((newSiteUrl: string): void => {
    setSiteUrl(newSiteUrl);
    setSelectedListId('');
    setSelectedListTitle('');
    setFields([]);
  }, []);

  // Handle template application
  const handleApplyTemplate = useCallback(
    (group: IConditionGroup, templateOrderBy: IOrderByField[], templateRowLimit: number): void => {
      setRootGroup(group);
      setOrderBy(templateOrderBy);
      setRowLimit(templateRowLimit);
      setMessage('Template applied successfully');
      setTimeout(() => setMessage(''), 3000);
    },
    []
  );

  // Clear all
  const handleClearAll = useCallback((): void => {
    setRootGroup(createEmptyGroup());
    setOrderBy([]);
    setViewFields([]);
    setRowLimit(null);
    setScope('Default');
    setContentTypeId('');
    setTestResults(null);
    setMessage('Query cleared');
    setTimeout(() => setMessage(''), 3000);
  }, []);

  // Handle import
  const handleImport = useCallback(
    (
      group: IConditionGroup,
      importOrderBy: IOrderByField[],
      importViewFields: string[],
      importRowLimit: number | null
    ): void => {
      setRootGroup(group);
      setOrderBy(importOrderBy);
      setViewFields(importViewFields);
      setRowLimit(importRowLimit);
      setMessage('CAML imported successfully');
      setTimeout(() => setMessage(''), 3000);
    },
    []
  );

  // Count conditions for history
  const countConditions = useCallback((group: IConditionGroup): number => {
    let count = group.conditions.filter(c => c.fieldInternalName).length;
    group.nestedGroups.forEach(ng => {
      count += countConditions(ng);
    });
    return count;
  }, []);

  // Test query
  const handleTestQuery = useCallback(async (): Promise<void> => {
    if (!selectedListId) {
      setMessage('Please select a list first');
      return;
    }

    setIsTestingQuery(true);
    setMessage('');

    try {
      const results = await spService.executeQuery(selectedListId, generatedCAML);
      setTestResults(results);
      setMessage(`Query executed successfully! Found ${results.count} item(s).`);

      // Add to history
      addQueryToHistory(
        generatedCAML,
        selectedListTitle,
        siteUrl,
        countConditions(rootGroup)
      );
    } catch (error) {
      setMessage(`Query execution failed: ${error.message}`);
      setTestResults(null);
    } finally {
      setIsTestingQuery(false);
    }
  }, [selectedListId, selectedListTitle, siteUrl, generatedCAML, rootGroup, spService, countConditions]);

  // Show message handlers
  const handleCopyMessage = useCallback((msg: string): void => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const formatResultValue = useCallback((value: unknown): string => {
    if (value === null || value === undefined) {
      return '—';
    }

    if (typeof value === 'string') {
      return value.trim() ? value : '—';
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '—';
      }

      return value
        .map(item => {
          if (item && typeof item === 'object') {
            const record = item as Record<string, unknown>;
            return String(record.Title ?? record.title ?? record.Label ?? record.Name ?? JSON.stringify(item));
          }
          return String(item);
        })
        .join(', ');
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (typeof record.Url === 'string') {
        return typeof record.Description === 'string' && record.Description
          ? `${record.Description} (${record.Url})`
          : record.Url;
      }

      return String(
        record.Title ??
          record.title ??
          record.Label ??
          record.Name ??
          record.LookupValue ??
          JSON.stringify(value)
      );
    }

    return String(value);
  }, []);

  const resultColumns = useMemo<IColumn[]>(() => {
    if (!testResults?.items?.length) {
      return [];
    }

    const preferredKeys = ['ID', 'Id', 'Title', 'FileLeafRef', 'Modified', 'Created', 'Author', 'Editor'];
    const discoveredKeys = new Set<string>();

    testResults.items.slice(0, 10).forEach(item => {
      Object.keys(item).forEach(key => {
        if (!key.startsWith('_')) {
          discoveredKeys.add(key);
        }
      });
    });

    const orderedKeys = [
      ...preferredKeys.filter(key => discoveredKeys.has(key)),
      ...Array.from(discoveredKeys)
        .filter(key => !preferredKeys.includes(key))
        .sort((left, right) => left.localeCompare(right)),
    ].slice(0, 8);

    return orderedKeys.map(key => ({
      key,
      name: key,
      fieldName: key,
      minWidth: key.length > 18 ? 180 : 120,
      maxWidth: 260,
      isResizable: true,
      onRender: (item?: Record<string, unknown>) => (
        <span className={styles.resultCell} title={formatResultValue(item?.[key])}>
          {formatResultValue(item?.[key])}
        </span>
      ),
    }));
  }, [formatResultValue, testResults]);

  const previewItems = useMemo(() => testResults?.items.slice(0, 25) ?? [], [testResults]);

  const resultStats = useMemo(() => {
    if (!testResults) {
      return null;
    }

    const ids = testResults.items
      .map(item => item.ID ?? item.Id)
      .filter((value): value is string | number => value !== null && value !== undefined);

    return {
      previewCount: previewItems.length,
      totalCount: testResults.count,
      columnCount: resultColumns.length,
      ids,
    };
  }, [previewItems.length, resultColumns.length, testResults]);

  const copyResultsAsJson = useCallback(async (): Promise<void> => {
    if (!testResults) {
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(testResults.items, null, 2));
      handleCopyMessage('Query results copied as formatted JSON');
    } catch (error) {
      setMessage(`Failed to copy results: ${(error as Error).message}`);
    }
  }, [handleCopyMessage, testResults]);

  const copyResultIds = useCallback(async (): Promise<void> => {
    if (!resultStats?.ids.length) {
      setMessage('No item IDs were returned in this result set');
      return;
    }

    try {
      await navigator.clipboard.writeText(resultStats.ids.join(', '));
      handleCopyMessage(`Copied ${resultStats.ids.length} item ID(s)`);
    } catch (error) {
      setMessage(`Failed to copy item IDs: ${(error as Error).message}`);
    }
  }, [handleCopyMessage, resultStats]);


  const hasQuery =
    rootGroup.conditions.length > 0 ||
    rootGroup.nestedGroups.length > 0 ||
    orderBy.length > 0 ||
    viewFields.length > 0;

  return (
    <div className={styles.camlBuilder}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>CAML Query Builder</h2>
          <p>Build SharePoint CAML queries visually with real-time preview</p>
        </div>

        <div className={styles.headerActions}>
          <DefaultButton
            text="Import"
            iconProps={{ iconName: 'Import' }}
            onClick={() => setShowImport(true)}
            styles={{ root: { padding: '8px 16px' } }}
          />
          <DefaultButton
            text="History"
            iconProps={{ iconName: 'History' }}
            onClick={() => setShowHistory(true)}
            styles={{ root: { padding: '8px 16px' } }}
          />
          <DefaultButton
            text="Templates"
            iconProps={{ iconName: 'Documentation' }}
            onClick={() => setShowTemplates(true)}
            styles={{ root: { padding: '8px 16px' } }}
          />
          <DefaultButton
            text="Clear All"
            iconProps={{ iconName: 'Clear' }}
            onClick={handleClearAll}
            disabled={!hasQuery}
            styles={{ root: { padding: '8px 16px' } }}
          />
        </div>
      </div>

      {/* Message Bar */}
      {message && (
        <MessageBar
          messageBarType={
            message.includes('fail') || message.includes('error')
              ? MessageBarType.error
              : MessageBarType.success
          }
          onDismiss={() => setMessage('')}
        >
          {message}
        </MessageBar>
      )}

      {/* Site & List Selection */}
      <SiteListSelector
        initialSiteUrl={siteUrl}
        spService={spService}
        onListSelected={handleListSelected}
        onSiteUrlChange={handleSiteUrlChange}
      />

      {/* Main Content - Only show if list is selected */}
      {selectedListId && fields.length > 0 && (
        <>
          {/* Query Builder */}
          <div className={styles.section}>
            <h3>Query Conditions</h3>
            <ConditionGroup group={rootGroup} fields={fields} onUpdate={setRootGroup} />
          </div>

          {/* Advanced Options */}
          <div className={styles.section}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0 }}>Advanced Options</h3>
              <DefaultButton
                text={showAdvancedOptions ? 'Hide' : 'Show'}
                iconProps={{ iconName: showAdvancedOptions ? 'ChevronUp' : 'ChevronDown' }}
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                styles={{ root: { padding: '4px 12px' } }}
              />
            </div>

            {showAdvancedOptions && (
              <AdvancedOptions
                fields={fields}
                orderBy={orderBy}
                viewFields={viewFields}
                rowLimit={rowLimit}
                scope={scope}
                contentTypeId={contentTypeId}
                onOrderByChange={setOrderBy}
                onViewFieldsChange={setViewFields}
                onRowLimitChange={setRowLimit}
                onScopeChange={setScope}
                onContentTypeIdChange={setContentTypeId}
              />
            )}
          </div>

          {/* CAML Preview */}
          <div className={styles.section}>
            <CAMLPreview
              camlXML={generatedCAML}
              validationErrors={validationErrors}
              onCopy={() => handleCopyMessage('CAML query copied to clipboard')}
            />
          </div>

          {/* Export Panel */}
          <div className={styles.section}>
            <ExportPanel
              camlXML={generatedCAML}
              listTitle={selectedListTitle}
              siteUrl={siteUrl}
              exportFormat={exportFormat}
              onFormatChange={setExportFormat}
              onCopy={(msg: string) => handleCopyMessage(msg)}
            />
          </div>

          {/* Test Query Section */}
          <div className={styles.section}>
            <div
              style={{
                padding: '16px',
                border: '1px solid #edebe9',
                borderRadius: '4px',
                background: '#f9f9f9',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
                Test Query
              </h3>

              <PrimaryButton
                text="Execute Query"
                iconProps={{ iconName: 'Play' }}
                onClick={handleTestQuery}
                disabled={isTestingQuery || validationErrors.length > 0}
                styles={{ root: { padding: '8px 16px', marginBottom: '12px' } }}
              />

              {isTestingQuery && (
                <Spinner size={SpinnerSize.small} label="Executing query..." />
              )}

              {testResults && (
                <div className={styles.resultsPanel}>
                  <MessageBar messageBarType={MessageBarType.success}>
                    Query returned {testResults.count} item(s)
                  </MessageBar>

                  <div className={styles.resultsToolbar}>
                    <div className={styles.resultStatGrid}>
                      <div className={styles.resultStatCard}>
                        <span className={styles.resultStatLabel}>Returned</span>
                        <strong>{resultStats?.totalCount ?? 0}</strong>
                      </div>
                      <div className={styles.resultStatCard}>
                        <span className={styles.resultStatLabel}>Preview Rows</span>
                        <strong>{resultStats?.previewCount ?? 0}</strong>
                      </div>
                      <div className={styles.resultStatCard}>
                        <span className={styles.resultStatLabel}>Visible Columns</span>
                        <strong>{resultStats?.columnCount ?? 0}</strong>
                      </div>
                    </div>

                    <div className={styles.resultsActions}>
                      <Toggle
                        inlineLabel
                        label="Raw JSON"
                        checked={showRawResults}
                        onChange={(_, checked) => setShowRawResults(!!checked)}
                      />
                      <DefaultButton
                        text="Copy JSON"
                        iconProps={{ iconName: 'Copy' }}
                        onClick={() => {
                          copyResultsAsJson().catch(() => undefined);
                        }}
                        disabled={!testResults.items.length}
                      />
                      <DefaultButton
                        text="Copy IDs"
                        iconProps={{ iconName: 'NumberedListText' }}
                        onClick={() => {
                          copyResultIds().catch(() => undefined);
                        }}
                        disabled={!resultStats?.ids.length}
                      />
                    </div>
                  </div>

                  {testResults.items.length === 0 ? (
                    <div className={styles.emptyResultsState}>
                      <strong>No items matched this query.</strong>
                      <span>Try relaxing a filter, changing scope, or increasing row limit.</span>
                    </div>
                  ) : showRawResults ? (
                    <div className={styles.rawResultsWrapper}>
                      <CodeEditor
                        value={JSON.stringify(testResults.items, null, 2)}
                        language="json"
                        readOnly={true}
                        showLineNumbers={true}
                        showMiniMap={false}
                        showCopyButton={false}
                        showDownloadButton={false}
                        theme="vs"
                        autoHeight={true}
                        minHeight={180}
                        maxHeight={420}
                      />
                    </div>
                  ) : (
                    <>
                      <div className={styles.resultsMeta}>
                        Showing the first {previewItems.length} row{previewItems.length !== 1 ? 's' : ''} in a table preview.
                        {testResults.count > previewItems.length ? ` ${testResults.count - previewItems.length} more item(s) returned.` : ''}
                      </div>
                      <div className={styles.resultTableWrapper}>
                        <DetailsList
                          items={previewItems}
                          columns={resultColumns}
                          compact={true}
                          selectionMode={0}
                          layoutMode={DetailsListLayoutMode.justified}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedListId && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <div className={styles.emptyStateIcon}>📋</div>
            <h3>Select a List to Get Started</h3>
            <p>
              Choose a SharePoint list from the dropdown above to start building your CAML query.
              You'll be able to visually construct complex queries with conditions, sorting, and
              field selection.
            </p>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <QueryTemplates
          onApplyTemplate={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
          listBaseTemplate={selectedListBaseTemplate}
          availableFields={fields.map(f => f.internalName)}
        />
      )}

      {/* Import CAML Modal */}
      {showImport && (
        <ImportCAML
          onImport={handleImport}
          onClose={() => setShowImport(false)}
          availableFields={fields}
        />
      )}

      {/* Query History Modal */}
      {showHistory && (
        <QueryHistory
          onApply={handleImport}
          onClose={() => setShowHistory(false)}
          currentListTitle={selectedListTitle}
        />
      )}
    </div>
  );
};
