// src/components/DeveloperUtilities/utilities/TextEscapeUtility.tsx

import {
  ChoiceGroup,
  DefaultButton,
  Dropdown,
  IChoiceGroupOption,
  IDropdownOption,
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
import { BaseUtilityProps } from '../types/UtilityTypes';

type EscapeType = 'javascript' | 'html' | 'xml' | 'csv' | 'json' | 'regex' | 'url';
type Direction = 'escape' | 'unescape';

export const TextEscapeUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'Text Escape/Unescape',
  shortcut = 'Ctrl+E',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [escapeType, setEscapeType] = useState<EscapeType>('html');
  const [direction, setDirection] = useState<Direction>('escape');

  // JavaScript string escaping/unescaping
  const escapeJavaScript = useCallback((text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\b/g, '\\b')
      .replace(/\f/g, '\\f')
      .replace(/\v/g, '\\v')
      .replace(/\0/g, '\\0');
  }, []);

  const unescapeJavaScript = useCallback((text: string): string => {
    return text
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\b/g, '\b')
      .replace(/\\f/g, '\f')
      .replace(/\\v/g, '\v')
      .replace(/\\0/g, '\0')
      .replace(/\\\\/g, '\\');
  }, []);

  // HTML entity escaping/unescaping
  const escapeHtml = useCallback((text: string): string => {
    const htmlEscapes: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, match => htmlEscapes[match]);
  }, []);

  const unescapeHtml = useCallback((text: string): string => {
    const htmlUnescapes: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#39;': "'",
      '&#x2F;': '/',
      '&#47;': '/',
    };

    return text.replace(/&(?:amp|lt|gt|quot|#x27|#39|#x2F|#47);/g, match => htmlUnescapes[match]);
  }, []);

  // XML escaping/unescaping
  const escapeXml = useCallback((text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }, []);

  const unescapeXml = useCallback((text: string): string => {
    return text
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&');
  }, []);

  // CSV escaping/unescaping
  const escapeCsv = useCallback((text: string): string => {
    if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }, []);

  const unescapeCsv = useCallback((text: string): string => {
    if (text.startsWith('"') && text.endsWith('"')) {
      return text.slice(1, -1).replace(/""/g, '"');
    }
    return text;
  }, []);

  // JSON string escaping/unescaping
  const escapeJson = useCallback((text: string): string => {
    return JSON.stringify(text).slice(1, -1);
  }, []);

  const unescapeJson = useCallback((text: string): string => {
    try {
      return JSON.parse('"' + text + '"');
    } catch {
      return text;
    }
  }, []);

  // Regex escaping/unescaping
  const escapeRegex = useCallback((text: string): string => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }, []);

  const unescapeRegex = useCallback((text: string): string => {
    return text.replace(/\\(.)/g, '$1');
  }, []);

  // URL encoding/decoding
  const escapeUrl = useCallback((text: string): string => {
    return encodeURIComponent(text);
  }, []);

  const unescapeUrl = useCallback((text: string): string => {
    try {
      return decodeURIComponent(text);
    } catch {
      return text;
    }
  }, []);

  // Get escape/unescape functions for selected type
  const getEscapeFunctions = useCallback(
    (
      type: EscapeType
    ): { escape: (text: string) => string; unescape: (text: string) => string } => {
      switch (type) {
        case 'javascript':
          return { escape: escapeJavaScript, unescape: unescapeJavaScript };
        case 'html':
          return { escape: escapeHtml, unescape: unescapeHtml };
        case 'xml':
          return { escape: escapeXml, unescape: unescapeXml };
        case 'csv':
          return { escape: escapeCsv, unescape: unescapeCsv };
        case 'json':
          return { escape: escapeJson, unescape: unescapeJson };
        case 'regex':
          return { escape: escapeRegex, unescape: unescapeRegex };
        case 'url':
          return { escape: escapeUrl, unescape: unescapeUrl };
        default:
          return { escape: text => text, unescape: text => text };
      }
    },
    [
      escapeJavaScript,
      unescapeJavaScript,
      escapeHtml,
      unescapeHtml,
      escapeXml,
      unescapeXml,
      escapeCsv,
      unescapeCsv,
      escapeJson,
      unescapeJson,
      escapeRegex,
      unescapeRegex,
      escapeUrl,
      unescapeUrl,
    ]
  );

  // Sample data for different types
  const getSampleData = useCallback((type: EscapeType, dir: Direction): string => {
    const samples: Record<EscapeType, { raw: string; escaped: string }> = {
      html: {
        raw: '<div class="example">Hello & "World"</div>',
        escaped: '&lt;div class=&quot;example&quot;&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;',
      },
      xml: {
        raw: '<field name="Title">John\'s Project</field>',
        escaped: '&lt;field name=&quot;Title&quot;&gt;John&apos;s Project&lt;/field&gt;',
      },
      javascript: {
        raw: 'Line 1\nLine 2\t"quoted"',
        escaped: 'Line 1\\nLine 2\\t\\"quoted\\"',
      },
      json: {
        raw: 'Hello "World"\nNew Line',
        escaped: 'Hello \\"World\\"\\nNew Line',
      },
      csv: {
        raw: 'Value with, comma and "quotes"',
        escaped: '"Value with, comma and ""quotes"""',
      },
      regex: {
        raw: 'Match $100.50 (USD)',
        escaped: 'Match \\$100\\.50 \\(USD\\)',
      },
      url: {
        raw: 'Hello World! How are you?',
        escaped: 'Hello%20World!%20How%20are%20you%3F',
      },
    };

    return dir === 'escape' ? samples[type].raw : samples[type].escaped;
  }, []);

  // Load sample data
  const loadSample = useCallback((): void => {
    const sample = getSampleData(escapeType, direction);
    setInputText(sample);
  }, [escapeType, direction, getSampleData]);

  // Process text
  const processText = useCallback(
    (text: string): void => {
      if (!text.trim()) {
        setOutputText('');
        return;
      }

      const functions = getEscapeFunctions(escapeType);
      const result = direction === 'escape' ? functions.escape(text) : functions.unescape(text);
      setOutputText(result);
    },
    [escapeType, direction, getEscapeFunctions]
  );

  // Auto-process on changes
  React.useEffect(() => {
    if (inputText.trim()) {
      processText(inputText);
    } else {
      setOutputText('');
    }
  }, [inputText, escapeType, direction, processText]);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      setInputText(newValue || '');
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
    setDirection(direction === 'escape' ? 'unescape' : 'escape');
  }, [inputText, outputText, direction]);

  // Clear all
  const clearAll = useCallback((): void => {
    setInputText('');
    setOutputText('');
  }, []);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+e', () => {
      const textField = document.querySelector(`#${id} textarea`) as HTMLTextAreaElement;
      if (textField) {
        textField.focus();
      }
    });

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [id, utilityService]);

  // Dropdown options
  const escapeTypeOptions: IDropdownOption[] = useMemo(
    () => [
      { key: 'html', text: 'HTML Entities' },
      { key: 'xml', text: 'XML Entities' },
      { key: 'javascript', text: 'JavaScript String' },
      { key: 'json', text: 'JSON String' },
      { key: 'url', text: 'URL Encode' },
      { key: 'csv', text: 'CSV Field' },
      { key: 'regex', text: 'Regular Expression' },
    ],
    []
  );

  const directionOptions: IChoiceGroupOption[] = useMemo(
    () => [
      { key: 'escape', text: 'Escape' },
      { key: 'unescape', text: 'Unescape' },
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
        id: 'sample',
        label: 'Sample',
        icon: 'DocumentSet',
        onClick: loadSample,
        variant: 'secondary',
        tooltip: 'Load sample data',
      },
    ],
    [swapContent, copyOutput, loadSample]
  );

  // Get description for selected type
  const getTypeDescription = useCallback((type: EscapeType): string => {
    const descriptions: Record<EscapeType, string> = {
      html: 'Converts special characters to HTML entities (&lt;, &gt;, &amp;, &quot;, etc.)',
      xml: 'Converts special characters to XML entities including &apos;',
      javascript: 'Escapes quotes, newlines, and special characters for JavaScript strings',
      json: 'Escapes characters for JSON string values',
      url: 'Encodes/decodes text for safe use in URLs (percent encoding)',
      csv: 'Wraps values in quotes and escapes internal quotes for CSV format',
      regex: 'Escapes special regex characters for literal matching in regular expressions',
    };
    return descriptions[type];
  }, []);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Escape Type Selection */}
          <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
            <Dropdown
              label='Escape Type'
              selectedKey={escapeType}
              options={escapeTypeOptions}
              onChange={(ev, option) => setEscapeType((option?.key as EscapeType) || 'html')}
              styles={{ dropdown: { width: 200 } }}
            />
            <ChoiceGroup
              label='Direction'
              selectedKey={direction}
              options={directionOptions}
              onChange={(ev, option) => setDirection((option?.key as Direction) || 'escape')}
              styles={{
                flexContainer: { display: 'flex', gap: '16px' },
              }}
            />
          </Stack>

          {/* Type Description */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e1e5e9',
            }}
          >
            {getTypeDescription(escapeType)}
          </div>

          {/* Input Text */}
          <div>
            <Label required>{direction === 'escape' ? 'Text to Escape' : 'Text to Unescape'}</Label>
            <TextField
              placeholder={`Enter text to ${direction}...`}
              value={inputText}
              onChange={handleInputChange}
              multiline
              rows={8}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px',
                },
              }}
              ariaLabel='Text input for escaping/unescaping'
            />
          </div>

          {/* Output Text */}
          <div>
            <Label>{direction === 'escape' ? 'Escaped Text' : 'Unescaped Text'}</Label>
            <TextField
              value={outputText}
              readOnly
              multiline
              rows={8}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                },
              }}
              onClick={copyOutput}
              title='Click to copy'
              ariaLabel={`${direction === 'escape' ? 'Escaped' : 'Unescaped'} text output, click to copy`}
            />
          </div>

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
              text='Load Sample'
              iconProps={{ iconName: 'DocumentSet' }}
              onClick={loadSample}
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
            Auto-converts as you type • Press {shortcut} to focus input • Select escape type from dropdown •
            Click output to copy
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
