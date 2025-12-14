// src/webparts/showcase/components/CamlQueryBuilder/CamlQueryBuilder.tsx

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  DefaultButton,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
} from '@fluentui/react';
import { SharePointService } from './services/SharePointService';
import { SiteListSelector } from './components/SiteListSelector';
import { ConditionGroup } from './components/ConditionGroup';
import { AdvancedOptions } from './components/AdvancedOptions';
import { CAMLPreview } from './components/CAMLPreview';
import { ExportPanel } from './components/ExportPanel';
import { QueryTemplates } from './components/QueryTemplates';
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
                <div>
                  <MessageBar messageBarType={MessageBarType.success}>
                    Query returned {testResults.count} item(s)
                  </MessageBar>

                  {testResults.items.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>First {testResults.items.length} items:</strong>
                      <div
                        style={{
                          marginTop: '8px',
                          background: '#fff',
                          border: '1px solid #edebe9',
                          borderRadius: '4px',
                          padding: '12px',
                          maxHeight: '200px',
                          overflow: 'auto',
                        }}
                      >
                        <pre style={{ margin: 0, fontSize: '11px' }}>
                          {JSON.stringify(testResults.items, null, 2)}
                        </pre>
                      </div>
                    </div>
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
