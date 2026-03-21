// src/components/DeveloperUtilities/utilities/UrlEncoderUtility.tsx

import {
  DefaultButton,
  IconButton,
  Label,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Stack,
  TextField,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { useDebounce } from '../hooks/useDebounce';
import { BaseUtilityProps } from '../types/UtilityTypes';

type EncodingType = 'standard' | 'component' | 'form';

interface UrlResult {
  type: EncodingType;
  label: string;
  encoded: string;
  decoded: string;
  description: string;
}

interface UrlInfo {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  host: string;
}

export const UrlEncoderUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'URL Encode/Decode',
  shortcut = 'Ctrl+U',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputText, setInputText] = useState<string>('');
  const [results, setResults] = useState<UrlResult[]>([]);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(true);
  const [urlInfo, setUrlInfo] = useState<UrlInfo | null>(null);

  // Standard URL encoding (encodeURI)
  const encodeStandard = useCallback((text: string): string => {
    try {
      return encodeURI(text);
    } catch {
      return text;
    }
  }, []);

  const decodeStandard = useCallback((text: string): string => {
    try {
      return decodeURI(text);
    } catch {
      return text;
    }
  }, []);

  // Component encoding (encodeURIComponent)
  const encodeComponent = useCallback((text: string): string => {
    try {
      return encodeURIComponent(text);
    } catch {
      return text;
    }
  }, []);

  const decodeComponent = useCallback((text: string): string => {
    try {
      return decodeURIComponent(text);
    } catch {
      return text;
    }
  }, []);

  // Form encoding (application/x-www-form-urlencoded)
  const encodeForm = useCallback((text: string): string => {
    try {
      return encodeURIComponent(text).replace(/%20/g, '+');
    } catch {
      return text;
    }
  }, []);

  const decodeForm = useCallback((text: string): string => {
    try {
      return decodeURIComponent(text.replace(/\+/g, '%20'));
    } catch {
      return text;
    }
  }, []);

  // Parse URL to extract components
  const parseUrl = useCallback((url: string): UrlInfo | null => {
    if (!url.trim()) return null;

    try {
      const parsed = new URL(url);
      return {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        origin: parsed.origin,
        host: parsed.host,
      };
    } catch {
      try {
        const parsed = new URL('http://' + url);
        return {
          protocol: '(auto-added http:)',
          hostname: parsed.hostname,
          port: parsed.port,
          pathname: parsed.pathname,
          search: parsed.search,
          hash: parsed.hash,
          origin: '(auto-added http:)//' + parsed.host,
          host: parsed.host,
        };
      } catch {
        return null;
      }
    }
  }, []);

  // Process URL encoding
  const processEncoding = useCallback(
    (text: string): UrlResult[] => {
      if (!text) return [];

      const encodingTypes: Array<{ type: EncodingType; label: string; description: string }> = [
        {
          type: 'standard',
          label: 'URL Encode (encodeURI)',
          description: 'Encodes special characters but preserves URL structure (/, ?, #, etc.)',
        },
        {
          type: 'component',
          label: 'Component Encode (encodeURIComponent)',
          description:
            'Encodes all special characters including URL delimiters - use for query parameters',
        },
        {
          type: 'form',
          label: 'Form Encode (application/x-www-form-urlencoded)',
          description: 'Like component encode but spaces become + instead of %20',
        },
      ];

      return encodingTypes.map(({ type, label, description }) => {
        let encoded: string;
        let decoded: string;

        switch (type) {
          case 'standard':
            encoded = encodeStandard(text);
            decoded = decodeStandard(text);
            break;
          case 'component':
            encoded = encodeComponent(text);
            decoded = decodeComponent(text);
            break;
          case 'form':
            encoded = encodeForm(text);
            decoded = decodeForm(text);
            break;
          default:
            encoded = text;
            decoded = text;
        }

        return {
          type,
          label,
          encoded,
          decoded,
          description,
        };
      });
    },
    [encodeStandard, decodeStandard, encodeComponent, decodeComponent, encodeForm, decodeForm]
  );

  // Debounced text processing
  const debouncedProcess = useDebounce((text: string) => {
    const results = processEncoding(text);
    setResults(results);

    const info = parseUrl(text);
    setUrlInfo(info);
    setIsValidUrl(info !== null);
  }, 200);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = newValue || '';
      setInputText(value);
      debouncedProcess(value);
    },
    [debouncedProcess]
  );

  // Copy result to clipboard
  const copyResult = useCallback(
    async (value: string, label: string, isEncoded: boolean): Promise<void> => {
      await copyToClipboard(value, `${label} ${isEncoded ? 'encoded' : 'decoded'} text copied!`);
    },
    [copyToClipboard]
  );

  // Clear all
  const clearAll = useCallback((): void => {
    setInputText('');
    setResults([]);
    setUrlInfo(null);
    setIsValidUrl(true);
  }, []);

  // Quick encode/decode with most common method
  const quickEncode = useCallback((): void => {
    if (inputText) {
      const encoded = encodeComponent(inputText);
      setInputText(encoded);
      debouncedProcess(encoded);
    }
  }, [inputText, encodeComponent, debouncedProcess]);

  const quickDecode = useCallback((): void => {
    if (inputText) {
      const decoded = decodeComponent(inputText);
      setInputText(decoded);
      debouncedProcess(decoded);
    }
  }, [inputText, decodeComponent, debouncedProcess]);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+u', () => {
      const textField = document.querySelector(`#${id} input`) as HTMLInputElement;
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
        id: 'quick-encode',
        label: 'Quick Encode',
        icon: 'Forward',
        onClick: quickEncode,
        variant: 'primary',
        tooltip: 'Quick encode using encodeURIComponent',
      },
      {
        id: 'quick-decode',
        label: 'Quick Decode',
        icon: 'Back',
        onClick: quickDecode,
        variant: 'secondary',
        tooltip: 'Quick decode using decodeURIComponent',
      },
    ],
    [quickEncode, quickDecode]
  );

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Input Text */}
          <div>
            <Label required>URL or Text to Encode/Decode</Label>
            <TextField
              placeholder='Enter URL or text to encode/decode...'
              value={inputText}
              onChange={handleInputChange}
              multiline
              rows={3}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px',
                },
                fieldGroup: {
                  borderColor: inputText && !isValidUrl ? '#ff8c00' : undefined,
                },
              }}
              ariaLabel='URL or text input for encoding/decoding'
            />
            {inputText && !isValidUrl && (
              <div
                style={{ color: '#ff8c00', fontSize: '11px', marginTop: '4px' }}
                role='status'
                aria-live='polite'
              >
                Not a valid URL format, but encoding/decoding will still work
              </div>
            )}
          </div>

          {/* URL Info */}
          {urlInfo && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#e8f4fd',
                borderRadius: '4px',
                border: '1px solid #b3d6fc',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#003a6b' }}>
                URL Components
              </h4>
              <div style={{ fontSize: '11px', color: '#003a6b' }}>
                <div>
                  <strong>Protocol:</strong> {urlInfo.protocol}
                </div>
                <div>
                  <strong>Host:</strong> {urlInfo.host}
                </div>
                <div>
                  <strong>Path:</strong> {urlInfo.pathname || '/'}
                </div>
                {urlInfo.search && (
                  <div>
                    <strong>Query:</strong> {urlInfo.search}
                  </div>
                )}
                {urlInfo.hash && (
                  <div>
                    <strong>Fragment:</strong> {urlInfo.hash}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text='Quick Encode'
              iconProps={{ iconName: 'Forward' }}
              onClick={quickEncode}
              disabled={!inputText.trim()}
              title='Encode using encodeURIComponent'
            />
            <DefaultButton
              text='Quick Decode'
              iconProps={{ iconName: 'Back' }}
              onClick={quickDecode}
              disabled={!inputText.trim()}
              title='Decode using decodeURIComponent'
            />
            <DefaultButton
              text='Clear'
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title='Clear all input and results'
            />
          </Stack>

          {/* Encoding Results */}
          {results.length > 0 && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e1e5e9',
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Encoding Results</h4>
              <Stack tokens={{ childrenGap: 12 }}>
                {results.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      border: '1px solid #e1e5e9',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <strong style={{ fontSize: '13px', color: '#323130' }}>{result.label}</strong>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#666',
                        fontStyle: 'italic',
                        marginBottom: '8px',
                      }}
                    >
                      {result.description}
                    </div>

                    {/* Encoded Version */}
                    <div style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}
                      >
                        <Label
                          styles={{ root: { fontSize: '11px', fontWeight: '600', margin: 0 } }}
                        >
                          Encoded:
                        </Label>
                        <IconButton
                          iconProps={{ iconName: 'Copy' }}
                          title='Copy encoded text'
                          ariaLabel={`Copy encoded ${result.label}`}
                          onClick={() => copyResult(result.encoded, result.label, true)}
                          styles={{
                            root: { minWidth: '20px', width: '20px', height: '20px' },
                          }}
                        />
                      </div>
                      <TextField
                        value={result.encoded}
                        readOnly
                        multiline
                        autoAdjustHeight
                        styles={{
                          field: {
                            fontFamily: 'Consolas, Monaco, monospace',
                            fontSize: '11px',
                            backgroundColor: '#fff4e6',
                            padding: '6px',
                            wordBreak: 'break-all',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() => copyResult(result.encoded, result.label, true)}
                        title='Click to copy'
                      />
                    </div>

                    {/* Decoded Version */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}
                      >
                        <Label
                          styles={{ root: { fontSize: '11px', fontWeight: '600', margin: 0 } }}
                        >
                          Decoded:
                        </Label>
                        <IconButton
                          iconProps={{ iconName: 'Copy' }}
                          title='Copy decoded text'
                          ariaLabel={`Copy decoded ${result.label}`}
                          onClick={() => copyResult(result.decoded, result.label, false)}
                          styles={{
                            root: { minWidth: '20px', width: '20px', height: '20px' },
                          }}
                        />
                      </div>
                      <TextField
                        value={result.decoded}
                        readOnly
                        multiline
                        autoAdjustHeight
                        styles={{
                          field: {
                            fontFamily: 'Consolas, Monaco, monospace',
                            fontSize: '11px',
                            backgroundColor: '#f0f9ff',
                            padding: '6px',
                            wordBreak: 'break-all',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() => copyResult(result.decoded, result.label, false)}
                        title='Click to copy'
                      />
                    </div>
                  </div>
                ))}
              </Stack>
            </div>
          )}

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

          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Shows all URL encoding types • Press {shortcut} to focus input • Use Component Encode
            for query parameters
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
