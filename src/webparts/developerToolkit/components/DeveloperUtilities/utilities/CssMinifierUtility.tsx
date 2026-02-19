// src/components/DeveloperUtilities/utilities/CssMinifierUtility.tsx

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
import { Card, CardAction, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { useDebounce } from '../hooks/useDebounce';
import { BaseUtilityProps } from '../types/UtilityTypes';

export const CssMinifierUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'CSS Minifier',
  shortcut = 'Ctrl+M',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputCss, setInputCss] = useState<string>('');
  const [outputCss, setOutputCss] = useState<string>('');
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sample CSS for demo
  const loadSampleCss = useCallback((): void => {
    const sample = `.ms-Button {
  display: inline-block;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 2px;
}

/* Primary button styles */
.ms-Button--primary {
  background-color: #0078d4;
  color: white;
  border: 1px solid #0078d4;
}

.ms-Button--primary:hover {
  background-color: #106ebe;
  border-color: #106ebe;
}

/* Secondary button */
.ms-Button--secondary {
  background-color: transparent;
  color: #323130;
  border: 1px solid #8a8886;
}`;
    setInputCss(sample);
  }, []);

  // Enhanced CSS Minification function
  const minifyCss = useCallback(
    (css: string): string => {
      if (!css.trim()) return '';

      try {
        let result = css;

        // Remove comments if option is enabled
        if (removeComments) {
          // Remove multi-line comments /* ... */
          result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        }

        // Normalize whitespace
        result = result
          // Remove leading/trailing whitespace from lines
          .split('\n')
          .map(line => line.trim())
          .join('\n')
          // Replace multiple spaces with single space
          .replace(/\s+/g, ' ')
          // Remove spaces around { } : ; , > + ~
          .replace(/\s*{\s*/g, '{')
          .replace(/\s*}\s*/g, '}')
          .replace(/\s*:\s*/g, ':')
          .replace(/\s*;\s*/g, ';')
          .replace(/\s*,\s*/g, ',')
          .replace(/\s*>\s*/g, '>')
          .replace(/\s*\+\s*/g, '+')
          .replace(/\s*~\s*/g, '~')
          // Remove semicolon before closing brace
          .replace(/;}/g, '}')
          // Remove empty rules
          .replace(/[^{}]+{}/g, '')
          // Trim
          .trim();

        // Remove duplicate rules if option is enabled
        if (removeDuplicates) {
          const rules = new Map<string, string>();
          const ruleRegex = /([^{]+){([^}]*)}/g;
          let match: RegExpExecArray | null;

          while ((match = ruleRegex.exec(result)) !== null) {
            const selector = match[1].trim();
            const declarations = match[2].trim();
            rules.set(selector, declarations);
          }

          result = Array.from(rules.entries())
            .map(([selector, declarations]) => `${selector}{${declarations}}`)
            .join('');
        }

        setErrorMessage('');
        return result;
      } catch (error) {
        const errMsg = `Minification error: ${(error as Error).message}`;
        setErrorMessage(errMsg);
        return css;
      }
    },
    [removeComments, removeDuplicates]
  );

  // Process CSS
  const processCss = useCallback(
    (css: string): void => {
      const minified = minifyCss(css);
      setOutputCss(minified);
    },
    [minifyCss]
  );

  // Debounced input handler
  const debouncedProcess = useDebounce((value: string) => {
    if (value.trim()) {
      processCss(value);
    } else {
      setOutputCss('');
      setErrorMessage('');
    }
  }, 300);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = newValue || '';
      setInputCss(value);
      debouncedProcess(value);
    },
    [debouncedProcess]
  );

  // Manual minify
  const manualMinify = useCallback((): void => {
    if (inputCss.trim()) {
      processCss(inputCss);
    }
  }, [inputCss, processCss]);

  // Copy output to clipboard
  const copyOutput = useCallback(async (): Promise<void> => {
    if (outputCss) {
      await copyToClipboard(outputCss);
    }
  }, [outputCss, copyToClipboard]);

  // Clear all
  const clearAll = useCallback((): void => {
    setInputCss('');
    setOutputCss('');
    setErrorMessage('');
  }, []);

  // Handle option changes
  const handleRemoveCommentsChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      setRemoveComments(!!checked);
    },
    []
  );

  const handleRemoveDuplicatesChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      setRemoveDuplicates(!!checked);
    },
    []
  );

  // Re-process when minification options change
  useEffect(() => {
    if (inputCss.trim()) {
      processCss(inputCss);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processCss]);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+m', manualMinify);

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [manualMinify, utilityService]);

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'minify',
        label: 'Minify',
        icon: 'Compress',
        onClick: manualMinify,
        variant: 'primary',
        tooltip: 'Minify CSS',
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyOutput,
        variant: 'secondary',
        tooltip: 'Copy minified CSS to clipboard',
      },
      {
        id: 'sample',
        label: 'Sample',
        icon: 'DocumentSet',
        onClick: loadSampleCss,
        variant: 'secondary',
        tooltip: 'Load sample CSS',
      },
    ],
    [manualMinify, copyOutput, loadSampleCss]
  );

  // Calculate compression stats
  const compressionStats = useMemo(() => {
    const originalSize = inputCss.length;
    const minifiedSize = outputCss.length;
    const originalBytes = utilityService.getByteSize(inputCss);
    const minifiedBytes = utilityService.getByteSize(outputCss);
    const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;
    const compressionRatio =
      originalSize > 0 ? `${((minifiedSize / originalSize) * 100).toFixed(1)}%` : '0%';

    return {
      originalSize,
      minifiedSize,
      originalBytes,
      minifiedBytes,
      savings: Math.round(savings),
      compressionRatio,
    };
  }, [inputCss, outputCss, utilityService]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>

      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Minification Options */}
          <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
            <Checkbox
              label='Remove comments'
              checked={removeComments}
              onChange={handleRemoveCommentsChange}
              styles={{ root: { marginTop: 0 } }}
            />
            <Checkbox
              label='Remove duplicate rules'
              checked={removeDuplicates}
              onChange={handleRemoveDuplicatesChange}
              styles={{ root: { marginTop: 0 } }}
            />
          </Stack>

          {/* Input CSS */}
          <div>
            <Label required>CSS Input</Label>
            <TextField
              placeholder='Paste or type CSS here...'
              value={inputCss}
              onChange={handleInputChange}
              multiline
              rows={10}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px',
                },
              }}
              ariaLabel='CSS input for minification'
            />
          </div>

          {/* Output CSS */}
          <div>
            <Label>Minified CSS</Label>
            <TextField
              value={outputCss}
              readOnly
              multiline
              rows={5}
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
              ariaLabel='Minified CSS output, click to copy'
            />
          </div>

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text='Minify CSS'
              iconProps={{ iconName: 'Compress' }}
              onClick={manualMinify}
              disabled={!inputCss.trim()}
              title={`Minify CSS (${shortcut})`}
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Copy Minified'
              iconProps={{ iconName: 'Copy' }}
              onClick={copyOutput}
              disabled={!outputCss}
              title='Copy minified CSS to clipboard'
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Load Sample'
              iconProps={{ iconName: 'DocumentSet' }}
              onClick={loadSampleCss}
              title='Load sample CSS'
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Clear'
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title='Clear all input and output'
              styles={{ root: { padding: '8px 16px' } }}
            />
          </Stack>

          {/* Error Messages */}
          {errorMessage && (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline={false}
              onDismiss={() => setErrorMessage('')}
              dismissButtonAriaLabel='Close'
            >
              {errorMessage}
            </MessageBar>
          )}

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

          {/* Compression Stats */}
          {inputCss && outputCss && (
            <div
              style={{
                fontSize: '11px',
                color: '#666',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              <strong>Compression Stats:</strong>
              <br />
              Original: {compressionStats.originalSize} characters ({compressionStats.originalBytes}{' '}
              bytes)
              <br />
              Minified: {compressionStats.minifiedSize} characters ({compressionStats.minifiedBytes}{' '}
              bytes)
              <br />
              <span style={{ color: compressionStats.savings > 0 ? '#107c10' : '#666' }}>
                Savings: {compressionStats.savings}% (Size: {compressionStats.compressionRatio} of
                original)
              </span>
            </div>
          )}

          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Auto-minifies as you type • Press {shortcut} to minify • Click output to copy • Use
            options above to customize minification
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
