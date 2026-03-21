// src/components/DeveloperUtilities/utilities/TypeScriptStringUtility.tsx

import {
  Checkbox,
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
import { BaseUtilityProps } from '../types/UtilityTypes';

export const TypeScriptStringUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'TypeScript String Generator',
  shortcut = 'Ctrl+S',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [variableName, setVariableName] = useState<string>('myVar');
  const [useConst, setUseConst] = useState<boolean>(true);
  const [addTypeAnnotation, setAddTypeAnnotation] = useState<boolean>(false);

  // Load preferences on mount
  useEffect(() => {
    const savedVariableName = utilityService.getPreference('typescript', 'variableName');
    if (typeof savedVariableName === 'string' && savedVariableName) {
      setVariableName(savedVariableName);
    }
  }, [utilityService]);

  // Save variable name preference
  const handleVariableNameChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
      const sanitized = utilityService.sanitizeVariableName(value || '');
      setVariableName(sanitized);
      utilityService.savePreference('typescript', 'variableName', sanitized);
    },
    [utilityService]
  );

  // Escape special characters for template literals
  const escapeTemplateString = useCallback((text: string): string => {
    return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  }, []);

  // Generate TypeScript template literal
  const generateTypeScriptString = useCallback(
    (text: string): string => {
      if (!text) return '';

      const escaped = escapeTemplateString(text);
      const declaration = useConst ? 'const' : 'let';
      const typeAnnotation = addTypeAnnotation ? ': string' : '';

      return `${declaration} ${variableName}${typeAnnotation} = \`${escaped}\`;`;
    },
    [variableName, useConst, addTypeAnnotation, escapeTemplateString]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = newValue || '';
      setInputText(value);
      const output = generateTypeScriptString(value);
      setOutputText(output);
    },
    [generateTypeScriptString]
  );

  // Handle option changes
  const handleConstChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      setUseConst(checked || false);
    },
    []
  );

  const handleTypeAnnotationChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      setAddTypeAnnotation(checked || false);
    },
    []
  );

  // Regenerate when options change
  useEffect(() => {
    if (inputText) {
      const output = generateTypeScriptString(inputText);
      setOutputText(output);
    }
  }, [useConst, addTypeAnnotation, variableName, inputText, generateTypeScriptString]);

  // Copy output to clipboard
  const copyOutput = useCallback(async (): Promise<void> => {
    if (outputText) {
      await copyToClipboard(outputText);
    }
  }, [outputText, copyToClipboard]);

  // Copy just the template literal content
  const copyTemplateOnly = useCallback(async (): Promise<void> => {
    if (inputText) {
      const escaped = escapeTemplateString(inputText);
      const templateLiteral = `\`${escaped}\``;
      await copyToClipboard(templateLiteral, 'Template literal copied!');
    }
  }, [inputText, escapeTemplateString, copyToClipboard]);

  // Set up keyboard shortcut
  useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+s', copyOutput);

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [copyOutput, utilityService]);

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyOutput,
        variant: 'secondary',
        tooltip: 'Copy TypeScript code to clipboard',
      },
    ],
    [copyOutput]
  );

  // Calculate text stats
  const textStats = useMemo(() => {
    if (!inputText) return null;

    const lines = utilityService.countLines(inputText);
    const chars = inputText.length;
    const escaped = escapeTemplateString(inputText);
    const escapedChars = escaped.length;
    const hasSpecialChars =
      inputText.includes('`') || inputText.includes('${') || inputText.includes('\\');

    return {
      lines,
      chars,
      escapedChars,
      hasSpecialChars,
    };
  }, [inputText, escapeTemplateString, utilityService]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Configuration Options */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e1e5e9',
            }}
          >
            <div>
              <Label>Variable Name:</Label>
              <TextField
                value={variableName}
                onChange={handleVariableNameChange}
                placeholder='myVar'
                styles={{
                  fieldGroup: { minWidth: '120px' },
                  field: { fontFamily: 'Consolas, Monaco, monospace' },
                }}
                ariaLabel='Variable name'
              />
            </div>

            <Checkbox label='Use const (vs let)' checked={useConst} onChange={handleConstChange} />

            <Checkbox
              label='Add type annotation'
              checked={addTypeAnnotation}
              onChange={handleTypeAnnotationChange}
            />
          </div>

          {/* Preview of special characters */}
          {textStats?.hasSpecialChars && (
            <div
              style={{
                fontSize: '11px',
                color: '#ff8c00',
                padding: '8px',
                backgroundColor: '#fff8f0',
                borderRadius: '4px',
                border: '1px solid #ffcc80',
              }}
              role='status'
              aria-live='polite'
            >
              <strong>Special characters detected:</strong> Backticks (`), template expressions ($
              {'{}'}), and backslashes (\) will be escaped.
            </div>
          )}

          {/* Input Text */}
          <div>
            <Label required>Multiline Text</Label>
            <TextField
              placeholder='Paste or type multiline text here...'
              value={inputText}
              onChange={handleInputChange}
              multiline
              rows={8}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '13px',
                },
              }}
              ariaLabel='Multiline text input'
            />
          </div>

          {/* Generated TypeScript Code */}
          <div>
            <Label>Generated TypeScript Code</Label>
            <TextField
              value={outputText}
              readOnly
              multiline
              autoAdjustHeight
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
              ariaLabel='Generated TypeScript code, click to copy'
            />
          </div>

          <PrimaryButton
            text='Copy Template Only'
            iconProps={{ iconName: 'FileTemplate' }}
            onClick={copyTemplateOnly}
            disabled={!inputText.trim()}
            title='Copy just the template literal part'
          />

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

          {/* Text Statistics */}
          {textStats && (
            <div
              style={{
                fontSize: '11px',
                color: '#666',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}
            >
              <div>
                <strong>Lines:</strong> {textStats.lines}
              </div>
              <div>
                <strong>Characters:</strong> {textStats.chars}
              </div>
              <div>
                <strong>After Escaping:</strong> {textStats.escapedChars}
              </div>
              <div>
                <strong>Special Chars:</strong> {textStats.hasSpecialChars ? 'Yes' : 'No'}
              </div>
            </div>
          )}

          {/* Example */}
          <div
            style={{
              fontSize: '11px',
              color: '#003a6b',
              fontStyle: 'italic',
              padding: '8px',
              backgroundColor: '#f0f9ff',
              borderRadius: '4px',
              border: '1px solid #b3d6fc',
            }}
          >
            <strong>Example:</strong>
            <br />
            Input:{' '}
            <code>
              Hello &quot;World&quot;{'\n'}This has `backticks` and ${'{'}variables{'}'}
            </code>
            <br />
            Output:{' '}
            <code>
              const myVar = `Hello &quot;World&quot;{'\n'}This has \`backticks\` and \${'{'}variables{'}'}`;
            </code>
          </div>

          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Auto-generates as you type • Press {shortcut} to generate • Escapes `, ${'{}'}, and \
            characters • Variable name is saved
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
