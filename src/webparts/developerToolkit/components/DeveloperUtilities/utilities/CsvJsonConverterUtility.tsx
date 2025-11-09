// src/components/DeveloperUtilities/utilities/CsvJsonConverterUtility.tsx

import {
  ChoiceGroup,
  DefaultButton,
  IChoiceGroupOption,
  Label,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Stack,
  TextField,
  Toggle,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { BaseUtilityProps } from '../types/UtilityTypes';

type ConversionDirection = 'csvToJson' | 'jsonToCsv';
type JsonOutputFormat = 'objects' | 'arrays';

export const CsvJsonConverterUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'CSV ↔ JSON Converter',
  shortcut = 'Ctrl+Shift+V',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [direction, setDirection] = useState<ConversionDirection>('csvToJson');
  const [delimiter, setDelimiter] = useState<string>(',');
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [jsonFormat, setJsonFormat] = useState<JsonOutputFormat>('objects');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load sample data
  const loadSampleData = useCallback((): void => {
    if (direction === 'csvToJson') {
      const sample = `Name,Email,Department,Role
John Doe,john.doe@contoso.com,IT,Developer
Jane Smith,jane.smith@contoso.com,HR,Manager
Bob Johnson,bob.johnson@contoso.com,Sales,Representative
Alice Williams,alice.williams@contoso.com,IT,Designer`;
      setInputText(sample);
    } else {
      const sample = [
        {
          Title: 'Project Alpha',
          Owner: 'John Doe',
          Status: 'In Progress',
          Priority: 'High',
        },
        {
          Title: 'Project Beta',
          Owner: 'Jane Smith',
          Status: 'Completed',
          Priority: 'Medium',
        },
        {
          Title: 'Project Gamma',
          Owner: 'Bob Johnson',
          Status: 'Planning',
          Priority: 'Low',
        },
      ];
      setInputText(JSON.stringify(sample, null, 2));
    }
  }, [direction]);

  // Parse CSV to JSON
  const csvToJson = useCallback(
    (csv: string, delim: string, hasHeaders: boolean, outputFormat: JsonOutputFormat): string => {
      if (!csv.trim()) return '';

      const lines = csv.trim().split(/\r?\n/);
      if (lines.length === 0) return '[]';

      const result: Array<Record<string, string> | string[]> = [];
      let headers: string[] = [];

      // Parse CSV line considering quoted values
      const parseLine = (line: string): string[] => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"';
              i++; // Skip next quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === delim && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        return values;
      };

      // Get headers
      if (hasHeaders) {
        headers = parseLine(lines[0]);
        lines.shift();
      }

      // Process each line
      lines.forEach(line => {
        if (!line.trim()) return;

        const values = parseLine(line);

        if (outputFormat === 'objects' && hasHeaders) {
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          result.push(obj);
        } else {
          result.push(values);
        }
      });

      return prettyPrint ? JSON.stringify(result, null, 2) : JSON.stringify(result);
    },
    [prettyPrint]
  );

  // Parse JSON to CSV
  const jsonToCsv = useCallback((json: string, delim: string, includeHeader: boolean): string => {
    if (!json.trim()) return '';

    try {
      const data = JSON.parse(json);

      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects or arrays');
      }

      if (data.length === 0) return '';

      const lines: string[] = [];

      // Escape CSV value
      const escapeValue = (value: unknown): string => {
        const str = value === null || value === undefined ? '' : String(value);
        if (str.includes(delim) || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Check if array of objects or array of arrays
      const isArrayOfObjects = typeof data[0] === 'object' && !Array.isArray(data[0]);

      if (isArrayOfObjects) {
        // Get all unique keys from all objects
        const allKeys = new Set<string>();
        data.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => allKeys.add(key));
          }
        });
        const keys = Array.from(allKeys);

        // Add header row
        if (includeHeader) {
          lines.push(keys.map(escapeValue).join(delim));
        }

        // Add data rows
        data.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            const values = keys.map(key => escapeValue(item[key]));
            lines.push(values.join(delim));
          }
        });
      } else {
        // Array of arrays
        data.forEach((row: unknown) => {
          if (Array.isArray(row)) {
            const values = row.map(escapeValue);
            lines.push(values.join(delim));
          }
        });
      }

      return lines.join('\n');
    } catch (error) {
      throw new Error(`Invalid JSON: ${(error as Error).message}`);
    }
  }, []);

  // Convert based on direction
  const convert = useCallback((): void => {
    if (!inputText.trim()) {
      setOutputText('');
      setErrorMessage('');
      return;
    }

    try {
      let result: string;
      if (direction === 'csvToJson') {
        result = csvToJson(inputText, delimiter, includeHeaders, jsonFormat);
      } else {
        result = jsonToCsv(inputText, delimiter, includeHeaders);
      }
      setOutputText(result);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage((error as Error).message);
      setOutputText('');
    }
  }, [inputText, direction, delimiter, includeHeaders, jsonFormat, csvToJson, jsonToCsv]);

  // Auto-convert on changes
  React.useEffect(() => {
    if (inputText.trim()) {
      convert();
    } else {
      setOutputText('');
      setErrorMessage('');
    }
  }, [inputText, direction, delimiter, includeHeaders, prettyPrint, jsonFormat, convert]);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      setInputText(newValue || '');
    },
    []
  );

  // Handle direction change
  const handleDirectionChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, option?: IChoiceGroupOption): void => {
      if (option) {
        setDirection(option.key as ConversionDirection);
      }
    },
    []
  );

  // Copy output
  const copyOutput = useCallback(async (): Promise<void> => {
    if (outputText) {
      await copyToClipboard(outputText);
    }
  }, [outputText, copyToClipboard]);

  // Swap input/output
  const swapContent = useCallback((): void => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    setDirection(direction === 'csvToJson' ? 'jsonToCsv' : 'csvToJson');
  }, [inputText, outputText, direction]);

  // Clear all
  const clearAll = useCallback((): void => {
    setInputText('');
    setOutputText('');
    setErrorMessage('');
  }, []);

  // Download output
  const downloadOutput = useCallback((): void => {
    if (!outputText) return;

    const extension = direction === 'csvToJson' ? 'json' : 'csv';
    const mimeType = direction === 'csvToJson' ? 'application/json' : 'text/csv';
    const filename = `converted-${Date.now()}.${extension}`;

    const blob = new Blob([outputText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [outputText, direction]);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+shift+v', () => {
      const textField = document.querySelector(`#${id} textarea`) as HTMLTextAreaElement;
      if (textField) {
        textField.focus();
      }
    });

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [id, utilityService]);

  const directionOptions: IChoiceGroupOption[] = useMemo(
    () => [
      { key: 'csvToJson', text: 'CSV → JSON' },
      { key: 'jsonToCsv', text: 'JSON → CSV' },
    ],
    []
  );

  const delimiterOptions: IChoiceGroupOption[] = useMemo(
    () => [
      { key: ',', text: 'Comma (,)' },
      { key: ';', text: 'Semicolon (;)' },
      { key: '\t', text: 'Tab' },
      { key: '|', text: 'Pipe (|)' },
    ],
    []
  );

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'swap',
        label: 'Swap',
        icon: 'Switch',
        onClick: swapContent,
        variant: 'primary',
        tooltip: 'Swap input and output',
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyOutput,
        variant: 'secondary',
        tooltip: 'Copy output to clipboard',
      },
      {
        id: 'download',
        label: 'Download',
        icon: 'Download',
        onClick: downloadOutput,
        variant: 'secondary',
        tooltip: 'Download output file',
      },
      {
        id: 'sample',
        label: 'Sample',
        icon: 'DocumentSet',
        onClick: loadSampleData,
        variant: 'secondary',
        tooltip: 'Load sample data',
      },
    ],
    [swapContent, copyOutput, downloadOutput, loadSampleData]
  );

  const stats = useMemo(() => {
    if (!outputText) return null;

    if (direction === 'csvToJson') {
      try {
        const data = JSON.parse(outputText);
        return {
          rows: Array.isArray(data) ? data.length : 0,
          columns:
            Array.isArray(data) && data.length > 0
              ? typeof data[0] === 'object'
                ? Object.keys(data[0]).length
                : Array.isArray(data[0])
                ? data[0].length
                : 0
              : 0,
        };
      } catch {
        return null;
      }
    } else {
      const lines = outputText.split('\n').filter(l => l.trim());
      return {
        rows: includeHeaders ? lines.length - 1 : lines.length,
        columns: lines.length > 0 ? lines[0].split(delimiter).length : 0,
      };
    }
  }, [outputText, direction, includeHeaders, delimiter]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Conversion Direction */}
          <ChoiceGroup
            label='Conversion Direction'
            selectedKey={direction}
            options={directionOptions}
            onChange={handleDirectionChange}
            styles={{
              flexContainer: { display: 'flex', gap: '16px' },
            }}
          />

          {/* Options */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e1e5e9',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Options</h4>
            <Stack tokens={{ childrenGap: 8 }}>
              <ChoiceGroup
                label='Delimiter'
                selectedKey={delimiter}
                options={delimiterOptions}
                onChange={(ev, option) => setDelimiter((option?.key as string) || ',')}
                styles={{
                  flexContainer: { display: 'flex', gap: '12px' },
                }}
              />
              <Toggle
                label={direction === 'csvToJson' ? 'First row is header' : 'Include header row'}
                checked={includeHeaders}
                onChange={(ev, checked) => setIncludeHeaders(checked || false)}
                inlineLabel
              />
              {direction === 'csvToJson' && (
                <>
                  <Toggle
                    label='Pretty print JSON'
                    checked={prettyPrint}
                    onChange={(ev, checked) => setPrettyPrint(checked || false)}
                    inlineLabel
                  />
                  <ChoiceGroup
                    label='JSON Output Format'
                    selectedKey={jsonFormat}
                    options={[
                      {
                        key: 'objects',
                        text: 'Array of objects',
                        disabled: !includeHeaders,
                      },
                      { key: 'arrays', text: 'Array of arrays' },
                    ]}
                    onChange={(ev, option) => setJsonFormat((option?.key as JsonOutputFormat) || 'objects')}
                    styles={{
                      flexContainer: { display: 'flex', gap: '12px' },
                    }}
                  />
                </>
              )}
            </Stack>
          </div>

          {/* Input */}
          <div>
            <Label required>{direction === 'csvToJson' ? 'CSV Input' : 'JSON Input'}</Label>
            <TextField
              placeholder={
                direction === 'csvToJson' ? 'Paste CSV data here...' : 'Paste JSON array here...'
              }
              value={inputText}
              onChange={handleInputChange}
              multiline
              rows={10}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '11px',
                },
              }}
              ariaLabel={direction === 'csvToJson' ? 'CSV input' : 'JSON input'}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{ color: '#d13438', fontSize: '11px' }} role='alert'>
              {errorMessage}
            </div>
          )}

          {/* Output */}
          <div>
            <Label>{direction === 'csvToJson' ? 'JSON Output' : 'CSV Output'}</Label>
            <TextField
              value={outputText}
              readOnly
              multiline
              rows={10}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '11px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                },
              }}
              onClick={copyOutput}
              title='Click to copy'
              ariaLabel={`${direction === 'csvToJson' ? 'JSON' : 'CSV'} output, click to copy`}
            />
          </div>

          {/* Stats */}
          {stats && (
            <div
              style={{
                fontSize: '11px',
                color: '#666',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              <strong>Stats:</strong> {stats.rows} rows, {stats.columns} columns
            </div>
          )}

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text='Swap Direction'
              iconProps={{ iconName: 'Switch' }}
              onClick={swapContent}
              disabled={!outputText}
              title='Swap input and output'
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Copy Output'
              iconProps={{ iconName: 'Copy' }}
              onClick={copyOutput}
              disabled={!outputText}
              title='Copy output to clipboard'
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Download'
              iconProps={{ iconName: 'Download' }}
              onClick={downloadOutput}
              disabled={!outputText}
              title={`Download as ${direction === 'csvToJson' ? 'JSON' : 'CSV'} file`}
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Load Sample'
              iconProps={{ iconName: 'DocumentSet' }}
              onClick={loadSampleData}
              title='Load sample data'
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Clear'
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title='Clear all'
              styles={{ root: { padding: '8px 16px' } }}
            />
          </Stack>

          {/* Success Messages */}
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

          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Auto-converts as you type • Press {shortcut} to focus input • Handles quoted values and
            special characters • Click output to copy • Download output file
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
