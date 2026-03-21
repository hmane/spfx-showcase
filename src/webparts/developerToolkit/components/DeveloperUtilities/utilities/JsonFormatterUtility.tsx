// src/components/DeveloperUtilities/utilities/JsonFormatterUtility.tsx

import {
  Checkbox,
  DefaultButton,
  Label,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Stack,
  TextField,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { useDebounce } from '../hooks/useDebounce';
import { BaseUtilityProps } from '../types/UtilityTypes';

export const JsonFormatterUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'JSON Formatter',
  shortcut = 'Ctrl+J',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [formatMode, setFormatMode] = useState<'pretty' | 'minified'>('pretty');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load preferences on mount
  useEffect(() => {
    const savedFormatMode = utilityService.getPreference('json', 'formatMode');
    const savedIndentSize = utilityService.getPreference('json', 'indentSize');
    if (savedFormatMode === 'pretty' || savedFormatMode === 'minified') {
      setFormatMode(savedFormatMode);
    }
    if (typeof savedIndentSize === 'number') {
      setIndentSize(savedIndentSize);
    }
  }, [utilityService]);

  // Validate and process JSON
  const processJson = useCallback(
    (jsonText: string, mode: 'pretty' | 'minified' = formatMode, spaces: number = indentSize): void => {
      if (!jsonText.trim()) {
        setOutputJson('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      try {
        const parsed = JSON.parse(jsonText);
        const formatted = mode === 'minified' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, spaces);

        setOutputJson(formatted);
        setIsValid(true);
        setErrorMessage('');
      } catch (error) {
        setIsValid(false);
        const errorMsg = (error as Error).message;
        // Try to provide helpful error message with line/column if available
        const match = errorMsg.match(/position (\d+)/);
        if (match) {
          const position = parseInt(match[1], 10);
          const lines = jsonText.substring(0, position).split('\n');
          const line = lines.length;
          const column = lines[lines.length - 1].length + 1;
          setErrorMessage(`Invalid JSON at line ${line}, column ${column}: ${errorMsg}`);
        } else {
          setErrorMessage(`Invalid JSON: ${errorMsg}`);
        }
        setOutputJson('');
      }
    },
    [formatMode, indentSize]
  );

  // Debounced input handler
  const debouncedProcess = useDebounce((value: string) => {
    processJson(value);
  }, 200);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = newValue || '';
      setInputJson(value);
      debouncedProcess(value);
    },
    [debouncedProcess]
  );

  // Format JSON (pretty print)
  const formatJson = useCallback((): void => {
    if (inputJson.trim()) {
      setFormatMode('pretty');
      utilityService.savePreference('json', 'formatMode', 'pretty');
      processJson(inputJson, 'pretty', indentSize);
    }
  }, [inputJson, indentSize, processJson, utilityService]);

  // Minify JSON
  const minifyJson = useCallback((): void => {
    if (inputJson.trim()) {
      setFormatMode('minified');
      utilityService.savePreference('json', 'formatMode', 'minified');
      processJson(inputJson, 'minified', indentSize);
    }
  }, [inputJson, indentSize, processJson, utilityService]);

  // Handle indent size change
  const handleIndentChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      const newSize = checked ? 4 : 2;
      setIndentSize(newSize);
      utilityService.savePreference('json', 'indentSize', newSize);
      if (inputJson.trim() && formatMode === 'pretty') {
        processJson(inputJson, 'pretty', newSize);
      }
    },
    [inputJson, formatMode, processJson, utilityService]
  );

  // Load sample JSON
  const loadSample = useCallback((): void => {
    const sample = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      },
      hobbies: ['reading', 'gaming', 'coding'],
      isActive: true,
    };
    const sampleJson = JSON.stringify(sample);
    setInputJson(sampleJson);
    processJson(sampleJson);
  }, [processJson]);

  // Copy output to clipboard
  const copyOutput = useCallback(async (): Promise<void> => {
    if (outputJson) {
      await copyToClipboard(outputJson);
    }
  }, [outputJson, copyToClipboard]);

  // Clear all
  const clearAll = useCallback((): void => {
    setInputJson('');
    setOutputJson('');
    setIsValid(true);
    setErrorMessage('');
  }, []);

  // Set up keyboard shortcut
  useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+j', formatJson);

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [formatJson, utilityService]);

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'format',
        label: 'Format',
        icon: 'Code',
        onClick: formatJson,
        variant: 'primary',
        tooltip: 'Format JSON with proper indentation',
      },
      {
        id: 'minify',
        label: 'Minify',
        icon: 'Compress',
        onClick: minifyJson,
        variant: 'secondary',
        tooltip: 'Minify JSON to single line',
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyOutput,
        variant: 'secondary',
        tooltip: 'Copy formatted JSON to clipboard',
      },
    ],
    [formatJson, minifyJson, copyOutput]
  );

  // Calculate JSON stats and depth
  const jsonStats = useMemo(() => {
    if (!outputJson || !isValid) {
      return { size: 0, keys: 0, type: 'none', lines: 0, depth: 0 };
    }

    try {
      const parsed = JSON.parse(outputJson);
      const type = Array.isArray(parsed) ? 'array' : typeof parsed;
      const keys = type === 'object' && parsed !== null ? Object.keys(parsed).length : 0;
      const lines = outputJson.split('\n').length;

      // Calculate depth
      const getDepth = (obj: any): number => {
        if (obj === null || typeof obj !== 'object') return 0;
        const depths = Object.values(obj).map(v => getDepth(v));
        return depths.length ? 1 + Math.max(...depths) : 1;
      };
      const depth = getDepth(parsed);

      return {
        size: outputJson.length,
        keys,
        type,
        lines,
        depth,
        arrayLength: Array.isArray(parsed) ? parsed.length : 0,
      };
    } catch {
      return { size: 0, keys: 0, type: 'none', lines: 0, depth: 0, arrayLength: 0 };
    }
  }, [outputJson, isValid]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 14 }}>
          {/* Settings and Quick Actions */}
          <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center" wrap>
            <Checkbox
              label='Use 4 spaces for indent (default: 2)'
              checked={indentSize === 4}
              onChange={handleIndentChange}
            />
            <DefaultButton
              text='Load Sample'
              iconProps={{ iconName: 'FileCode' }}
              onClick={loadSample}
              title='Load sample JSON data'
              styles={{ root: { minWidth: 'auto' } }}
            />
          </Stack>

          {/* Input JSON */}
          <div>
            <Label required>Input JSON</Label>
            <TextField
              placeholder='Paste or type JSON here... (auto-validates as you type)'
              value={inputJson}
              onChange={handleInputChange}
              multiline
              rows={8}
              styles={{
                field: {
                  fontFamily: 'Consolas, "Courier New", monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  backgroundColor: '#ffffff',
                },
                fieldGroup: {
                  borderColor: !isValid && inputJson ? '#d13438' : undefined,
                  borderWidth: !isValid && inputJson ? '2px' : undefined,
                },
              }}
              ariaLabel='JSON input'
              aria-invalid={!isValid}
            />
            {!isValid && inputJson && (
              <div
                style={{
                  color: '#d13438',
                  fontSize: '12px',
                  marginTop: '6px',
                  padding: '8px',
                  backgroundColor: '#fef0f0',
                  borderRadius: '4px',
                  border: '1px solid #f8d7da',
                }}
                role='alert'
                aria-live='polite'
              >
                <strong>Error:</strong> {errorMessage}
              </div>
            )}
          </div>

          {/* Format Mode Indicator */}
          {outputJson && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: formatMode === 'pretty' ? '#e6f7ff' : '#fff7e6',
              borderRadius: '4px',
              border: `1px solid ${formatMode === 'pretty' ? '#91d5ff' : '#ffd591'}`,
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>
                <strong>Current Format:</strong> {formatMode === 'pretty' ? 'Pretty-printed' : 'Minified'}
                {formatMode === 'pretty' && ` (${indentSize} spaces)`}
              </span>
              {isValid && (
                <span style={{ color: '#52c41a', fontWeight: 600 }}>Valid JSON</span>
              )}
            </div>
          )}

          {/* Output JSON */}
          <div>
            <Label>Formatted Output</Label>
            <TextField
              value={outputJson}
              readOnly
              multiline
              rows={10}
              placeholder='Formatted JSON will appear here...'
              styles={{
                field: {
                  fontFamily: 'Consolas, "Courier New", monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  backgroundColor: '#f8f9fa',
                  cursor: outputJson ? 'pointer' : 'default',
                },
              }}
              onClick={outputJson ? copyOutput : undefined}
              title={outputJson ? 'Click to copy' : ''}
              ariaLabel='Formatted JSON output, click to copy'
            />
          </div>

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text='Format (Pretty)'
              iconProps={{ iconName: 'Code' }}
              onClick={formatJson}
              disabled={!inputJson.trim()}
              title={`Format JSON with indentation (${shortcut})`}
            />
            <DefaultButton
              text='Minify'
              iconProps={{ iconName: 'Compress' }}
              onClick={minifyJson}
              disabled={!inputJson.trim()}
              title='Minify JSON to single line'
            />
            <DefaultButton
              text='Copy Output'
              iconProps={{ iconName: 'Copy' }}
              onClick={copyOutput}
              disabled={!outputJson}
              title='Copy formatted JSON to clipboard'
            />
            <DefaultButton
              text='Clear All'
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title='Clear all input and output'
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
              dismissButtonAriaLabel='Close'
              role='alert'
              aria-live='polite'
            >
              {copyMessage}
            </MessageBar>
          )}

          {/* JSON Stats */}
          {isValid && outputJson && (
            <div
              style={{
                fontSize: '12px',
                color: '#333',
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                border: '1px solid #b3d6fc',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '6px', color: '#003a6b' }}>JSON Statistics:</div>
              <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
                <div><strong>Type:</strong> {jsonStats.type}</div>
                <div><strong>Size:</strong> {jsonStats.size.toLocaleString()} chars</div>
                <div><strong>Lines:</strong> {jsonStats.lines}</div>
                <div><strong>Depth:</strong> {jsonStats.depth}</div>
                {jsonStats.type === 'object' && <div><strong>Keys:</strong> {jsonStats.keys}</div>}
                {jsonStats.type === 'array' && <div><strong>Items:</strong> {jsonStats.arrayLength}</div>}
              </Stack>
            </div>
          )}

          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e1e5e9',
            }}
          >
            <strong>Tips:</strong> Paste JSON to auto-validate • Press {shortcut} to format • Click output to copy • Supports nested objects and arrays
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
