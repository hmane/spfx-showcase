// src/components/DeveloperUtilities/utilities/QueryStringUtility.tsx

import {
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IconButton,
  Label,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  SelectionMode,
  Stack,
  TextField,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/components/Card';
import {
  buildEncodedQueryString,
  buildJsonObjectFromParams,
  extractQueryStringParts,
  getDuplicateParameterNames,
  IQueryParam,
  isGuid,
  isSharePointParam,
  parseQueryString,
  summarizeQueryParams,
} from '../helpers/queryStringUtils';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { useDebounce } from '../hooks/useDebounce';
import { BaseUtilityProps } from '../types/UtilityTypes';

export const QueryStringUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'Query String Parser',
  shortcut = 'Ctrl+Q',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputText, setInputText] = useState<string>('');
  const [queryParams, setQueryParams] = useState<IQueryParam[]>([]);
  const [encodedOutput, setEncodedOutput] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');

  // Memoized decoded query string
  const decodedQueryString = useMemo(() => {
    if (queryParams.length === 0) return '';
    return queryParams.map(p => `${p.decodedName}=${p.decodedValue}`).join('&');
  }, [queryParams]);

  const duplicateParameterNames = useMemo(() => {
    return getDuplicateParameterNames(queryParams);
  }, [queryParams]);

  const queryStats = useMemo(() => {
    return summarizeQueryParams(queryParams);
  }, [queryParams]);

  // Process input
  const processInput = useCallback(
    (input: string): void => {
      const { baseUrl: extractedBaseUrl, queryString } = extractQueryStringParts(input);
      const params = parseQueryString(queryString);
      const encoded = buildEncodedQueryString(params);

      setBaseUrl(extractedBaseUrl);
      setQueryParams(params);
      setEncodedOutput(encoded);
    },
    []
  );

  // Debounced input processing
  const debouncedProcess = useDebounce((input: string) => {
    processInput(input);
  }, 200);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>, newValue?: string): void => {
      const value = newValue || '';
      setInputText(value);
      debouncedProcess(value);
    },
    [debouncedProcess]
  );

  // Copy result to clipboard
  const copyResult = useCallback(
    async (value: string, label: string): Promise<void> => {
      await copyToClipboard(value, `${label} copied!`);
    },
    [copyToClipboard]
  );

  // Copy full URL
  const copyFullUrl = useCallback(async (): Promise<void> => {
    if (baseUrl && encodedOutput) {
      const fullUrl = `${baseUrl}?${encodedOutput}`;
      await copyResult(fullUrl, 'Full URL');
    } else if (encodedOutput) {
      const fullUrl = `?${encodedOutput}`;
      await copyResult(fullUrl, 'Query string');
    }
  }, [baseUrl, encodedOutput, copyResult]);

  // Copy decoded values
  const copyDecodedValues = useCallback(async (): Promise<void> => {
    if (queryParams.length > 0) {
      const decoded = queryParams
        .map(param => `${param.decodedName}=${param.decodedValue}`)
        .join('&');
      await copyResult(decoded, 'Decoded parameters');
    }
  }, [queryParams, copyResult]);

  // Copy as JSON
  const copyAsJson = useCallback(async (): Promise<void> => {
    if (queryParams.length > 0) {
      const jsonObj = buildJsonObjectFromParams(queryParams);
      const jsonString = JSON.stringify(jsonObj, null, 2);
      await copyResult(jsonString, 'JSON object');
    }
  }, [queryParams, copyResult]);

  // Load sample SharePoint URL
  const loadSample = useCallback((): void => {
    const sample = 'https://contoso.sharepoint.com/sites/IT/_layouts/15/listedit.aspx?List=%7B6A4C8F8D%2D3E91%2D4F28%2DB5C7%2D9E2A1B3C4D5E%7D';
    setInputText(sample);
    processInput(sample);
  }, [processInput]);

  // Clear all
  const clearAll = useCallback((): void => {
    setInputText('');
    setQueryParams([]);
    setEncodedOutput('');
    setBaseUrl('');
  }, []);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+q', () => {
      const textField = document.querySelector(`#${id} textarea`) as HTMLTextAreaElement;
      if (textField) {
        textField.focus();
      }
    });

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [id, utilityService]);

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'copy-encoded',
        label: 'Copy Encoded',
        icon: 'Copy',
        onClick: () => copyResult(encodedOutput, 'Encoded query string'),
        variant: 'primary',
        tooltip: 'Copy encoded query string',
      },
      {
        id: 'sample',
        label: 'Sample',
        icon: 'DocumentSet',
        onClick: loadSample,
        variant: 'secondary',
        tooltip: 'Load SharePoint sample URL',
      },
    ],
    [encodedOutput, copyResult, loadSample]
  );

  // Define columns for the parameters table
  const columns: IColumn[] = useMemo(
    () => [
      {
        key: 'name',
        name: 'Parameter Name',
        fieldName: 'name',
        minWidth: 140,
        maxWidth: 200,
        isResizable: true,
        onRender: (item: IQueryParam) => {
          const isSPParam = isSharePointParam(item.decodedName);
          return (
            <div>
              {isSPParam && (
                <div
                  style={{
                    fontSize: '9px',
                    color: '#0078d4',
                    fontWeight: 600,
                    marginBottom: '2px',
                  }}
                >
                  SharePoint Parameter
                </div>
              )}
              <div
                style={{
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '11px',
                  color: isSPParam ? '#0078d4' : '#107c10',
                  fontWeight: isSPParam ? 600 : 'normal',
                }}
                title={item.decodedName}
              >
                {item.decodedName}
              </div>
            </div>
          );
        },
      },
      {
        key: 'value',
        name: 'Parameter Value',
        fieldName: 'value',
        minWidth: 200,
        isResizable: true,
        onRender: (item: IQueryParam) => {
          const isGuidValue = isGuid(item.decodedValue);
          return (
            <div>
              {isGuidValue && (
                <div
                  style={{
                    fontSize: '9px',
                    color: '#8b5cf6',
                    fontWeight: 600,
                    marginBottom: '2px',
                  }}
                >
                  GUID
                </div>
              )}
              <div
                style={{
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '11px',
                  color: isGuidValue ? '#8b5cf6' : '#323130',
                  fontWeight: isGuidValue ? 600 : 'normal',
                  wordBreak: 'break-all',
                }}
                title={item.decodedValue}
              >
                {item.decodedValue}
              </div>
              {item.value !== item.decodedValue && (
                <div
                  style={{
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '10px',
                    color: '#999',
                    marginTop: '2px',
                    fontStyle: 'italic',
                  }}
                  title={item.value}
                >
                  Encoded: {item.value.length > 40 ? item.value.substring(0, 40) + '...' : item.value}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: 'actions',
        name: 'Actions',
        minWidth: 100,
        maxWidth: 100,
        onRender: (item: IQueryParam) => (
          <div style={{ display: 'flex', gap: '4px' }}>
            <IconButton
              iconProps={{ iconName: 'Copy' }}
              title="Copy decoded value only"
              ariaLabel={`Copy value: ${item.decodedValue}`}
              onClick={() => copyResult(item.decodedValue, 'Value')}
              styles={{ root: { minWidth: '28px', width: '28px', height: '28px' } }}
            />
            <IconButton
              iconProps={{ iconName: 'ClipboardList' }}
              title="Copy parameter pair"
              ariaLabel={`Copy parameter ${item.decodedName}`}
              onClick={() => copyResult(`${item.decodedName}=${item.decodedValue}`, 'Parameter')}
              styles={{ root: { minWidth: '28px', width: '28px', height: '28px' } }}
            />
          </div>
        ),
      },
    ],
    [copyResult, isGuid, isSharePointParam]
  );

  return (
    <Card id={id} size="regular">
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Input Text */}
          <div>
            <Label required>URL or Query String</Label>
            <TextField
              placeholder="Paste URL, partial URL, or query parameters..."
              value={inputText}
              onChange={handleInputChange}
              multiline
              rows={4}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px',
                },
              }}
              ariaLabel="URL or query string input"
            />
            <div
              style={{
                fontSize: '11px',
                color: '#666',
                marginTop: '4px',
                fontStyle: 'italic',
              }}
            >
              Supports: Full URLs, partial URLs (/path?param=value), query strings (?param=value),
              or just parameters (param=value)
            </div>
          </div>

          {/* Base URL Display */}
          {baseUrl && (
            <div>
              <Label>Base URL</Label>
              <TextField
                value={baseUrl}
                readOnly
                styles={{
                  field: {
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '12px',
                    backgroundColor: '#f0f9ff',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => copyResult(baseUrl, 'Base URL')}
                title="Click to copy"
                ariaLabel="Base URL, click to copy"
              />
            </div>
          )}

          {/* Parameters Table */}
          {queryParams.length > 0 && (
            <div>
              <Label>Parsed Parameters ({queryParams.length})</Label>
              <DetailsList
                items={queryParams}
                columns={columns}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
                styles={{
                  root: {
                    border: '1px solid #e1e5e9',
                    borderRadius: '4px',
                  },
                  headerWrapper: {
                    backgroundColor: '#f8f9fa',
                  },
                }}
              />
            </div>
          )}

          {/* Encoded Output */}
          {encodedOutput && (
            <div>
              <Stack horizontal verticalAlign="center" style={{ justifyContent: 'space-between' }}>
                <Label style={{ margin: 0 }}>Encoded Query String</Label>
                <Stack horizontal tokens={{ childrenGap: 6 }}>
                  <IconButton
                    iconProps={{ iconName: 'Copy' }}
                    title="Copy encoded query string"
                    ariaLabel="Copy encoded query string"
                    onClick={() => copyResult(encodedOutput, 'Encoded query string')}
                    disabled={!encodedOutput}
                    styles={{ root: { height: 28, width: 28 } }}
                  />
                  <IconButton
                    iconProps={{ iconName: 'ClipboardList' }}
                    title="Copy decoded query string"
                    ariaLabel="Copy decoded query string"
                    onClick={() => copyResult(decodedQueryString, 'Decoded query string')}
                    disabled={queryParams.length === 0}
                    styles={{ root: { height: 28, width: 28 } }}
                  />
                </Stack>
              </Stack>
              <TextField
                value={encodedOutput}
                readOnly
                multiline
                autoAdjustHeight
                styles={{
                  field: {
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '12px',
                    backgroundColor: '#fff4e6',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => copyResult(encodedOutput, 'Encoded query string')}
                title="Click to copy"
                ariaLabel="Encoded query string, click to copy"
              />
            </div>
          )}

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text="Copy Encoded"
              iconProps={{ iconName: 'Copy' }}
              onClick={() => copyResult(encodedOutput, 'Encoded query string')}
              disabled={!encodedOutput}
              title="Copy encoded query string"
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text="Copy Full URL"
              iconProps={{ iconName: 'Link' }}
              onClick={copyFullUrl}
              disabled={!encodedOutput}
              title="Copy complete URL with query string"
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text="Copy Decoded"
              iconProps={{ iconName: 'EditNote' }}
              onClick={copyDecodedValues}
              disabled={queryParams.length === 0}
              title="Copy decoded parameters"
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text="Copy as JSON"
              iconProps={{ iconName: 'FileCode' }}
              onClick={copyAsJson}
              disabled={queryParams.length === 0}
              title="Copy parameters as JSON object"
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text="Load Sample"
              iconProps={{ iconName: 'DocumentSet' }}
              onClick={loadSample}
              title="Load sample SharePoint URL"
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text="Clear"
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title="Clear all input and results"
              styles={{ root: { padding: '8px 16px' } }}
            />
          </Stack>

          {/* Success/Error Messages */}
          {showMessage && (
            <MessageBar
              messageBarType={
                copyMessage.includes('Failed') ? MessageBarType.error : MessageBarType.success
              }
              isMultiline={false}
              onDismiss={clearMessage}
              dismissButtonAriaLabel="Close"
              role="alert"
              aria-live="polite"
            >
              {copyMessage}
            </MessageBar>
          )}

          {/* Stats */}
          {queryParams.length > 0 && (
            <div
              style={{
                fontSize: '11px',
                color: '#666',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              <strong>Stats:</strong> {queryStats.total} parameters, {queryStats.sharePointParams}{' '}
              SharePoint-specific, {queryStats.guidValues} GUID values, {queryStats.duplicateCount}{' '}
              duplicate keys, {encodedOutput.length} characters in encoded string
            </div>
          )}

          {duplicateParameterNames.length > 0 && (
            <MessageBar messageBarType={MessageBarType.warning}>
              Duplicate parameter names detected: {duplicateParameterNames.map(item => `${item.name} (${item.count})`).join(', ')}. JSON export groups duplicates into arrays.
            </MessageBar>
          )}

          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Auto-processes as you type • Press {shortcut} to focus input • Click table rows to copy
            individual parameters
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
