// src/components/DeveloperUtilities/utilities/GuidGeneratorUtility.tsx

import {
  Checkbox,
  IconButton,
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
import { BaseUtilityProps } from '../types/UtilityTypes';

export const GuidGeneratorUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'GUID Generator',
  shortcut = 'Ctrl+G',
}) => {
  const effectiveShortcut = shortcut ?? 'Ctrl+G';
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [generatedGuid, setGeneratedGuid] = useState<string>('');
  const [includeBrackets, setIncludeBrackets] = useState<boolean>(false);
  const [useUppercase, setUseUppercase] = useState<boolean>(false);
  const [omitHyphens, setOmitHyphens] = useState<boolean>(false);
  const [guidHistory, setGuidHistory] = useState<string[]>([]);
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [lastRawGuid, setLastRawGuid] = useState<string>('');
  const [isBulkResult, setIsBulkResult] = useState<boolean>(false);

  // Load preferences on mount
  useEffect(() => {
    const savedIncludeBrackets = utilityService.getPreference('guid', 'includeBrackets');
    const savedUppercase = utilityService.getPreference('guid', 'uppercase');
    const savedOmitHyphens = utilityService.getPreference('guid', 'omitHyphens');
    setIncludeBrackets(Boolean(savedIncludeBrackets));
    setUseUppercase(Boolean(savedUppercase));
    setOmitHyphens(Boolean(savedOmitHyphens));
  }, [utilityService]);

  const createRawGuid = useCallback((): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  const formatGuid = useCallback(
    (rawGuid: string): string => {
      let formatted = omitHyphens ? rawGuid.replace(/-/g, '') : rawGuid;

      if (includeBrackets) {
        formatted = `{${formatted}}`;
      }

      if (useUppercase) {
        formatted = formatted.toUpperCase();
      }

      return formatted;
    },
    [includeBrackets, omitHyphens, useUppercase]
  );

  const applyGuid = useCallback(
    (
      rawGuid: string,
      options?: {
        addToHistory?: boolean;
        copy?: boolean;
        message?: string;
        isBulk?: boolean;
      }
    ) => {
      const formatted = formatGuid(rawGuid);
      setLastRawGuid(rawGuid);
      setGeneratedGuid(formatted);
      setIsBulkResult(options?.isBulk ?? false);

      if (options?.addToHistory) {
        setGuidHistory(prev => [formatted, ...prev].slice(0, 10));
      }

      if (options?.copy) {
        copyToClipboard(formatted, options?.message ?? 'GUID copied to clipboard!').catch(() => undefined);
      }
    },
    [formatGuid, copyToClipboard]
  );

  const reapplyGuidWithCurrentPreferences = useCallback(() => {
    if (isBulkResult) {
      return;
    }

    if (lastRawGuid) {
      applyGuid(lastRawGuid, { addToHistory: false, copy: false });
    } else {
      const freshRaw = createRawGuid();
      applyGuid(freshRaw, { addToHistory: true, copy: false });
    }
  }, [applyGuid, createRawGuid, isBulkResult, lastRawGuid]);

  const handleBracketsChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      const newValue = checked || false;
      setIncludeBrackets(newValue);
      utilityService.savePreference('guid', 'includeBrackets', newValue);
      reapplyGuidWithCurrentPreferences();
    },
    [utilityService, reapplyGuidWithCurrentPreferences]
  );

  const handleUppercaseChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      const newValue = checked || false;
      setUseUppercase(newValue);
      utilityService.savePreference('guid', 'uppercase', newValue);
      reapplyGuidWithCurrentPreferences();
    },
    [utilityService, reapplyGuidWithCurrentPreferences]
  );

  const handleHyphenChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      const newValue = checked || false;
      setOmitHyphens(newValue);
      utilityService.savePreference('guid', 'omitHyphens', newValue);
      reapplyGuidWithCurrentPreferences();
    },
    [utilityService, reapplyGuidWithCurrentPreferences]
  );

  const generateAndCopy = useCallback((): void => {
    const raw = createRawGuid();
    applyGuid(raw, {
      addToHistory: true,
      copy: true,
      message: 'GUID generated and copied!',
      isBulk: false,
    });
  }, [applyGuid, createRawGuid]);

  const generateBulkGuids = useCallback((): void => {
    const rawGuids = Array.from({ length: bulkCount }, () => createRawGuid());
    const formattedGuids = rawGuids.map(formatGuid);
    const bulkText = formattedGuids.join('\n');

    setLastRawGuid('');
    setIsBulkResult(true);
    setGeneratedGuid(bulkText);

    if (formattedGuids.length) {
      const newestFirst = formattedGuids.slice().reverse();
      setGuidHistory(prev => [...newestFirst, ...prev].slice(0, 10));
    }

    copyToClipboard(
      bulkText,
      `${bulkCount} GUID${bulkCount > 1 ? 's' : ''} generated and copied!`
    ).catch(() => undefined);
  }, [bulkCount, createRawGuid, formatGuid, copyToClipboard]);

  const handleCopyGenerated = useCallback(async (): Promise<void> => {
    if (generatedGuid) {
      await copyToClipboard(generatedGuid, 'Current output copied to clipboard!');
    }
  }, [generatedGuid, copyToClipboard]);

  // Copy from history
  const copyFromHistory = useCallback(
    async (guid: string): Promise<void> => {
      setGeneratedGuid(guid);
      setIsBulkResult(guid.includes('\n'));
      setLastRawGuid('');
      await copyToClipboard(guid, 'GUID from history copied!');
    },
    [copyToClipboard]
  );

  // Clear history
  const clearHistory = useCallback((): void => {
    setGuidHistory([]);
  }, []);

  // Set up keyboard shortcut
  useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+g', generateAndCopy);

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [generateAndCopy, utilityService]);

  // Generate initial GUID on mount
  useEffect(() => {
    const initialRaw = createRawGuid();
    applyGuid(initialRaw, { addToHistory: true, copy: false, isBulk: false });
  }, [applyGuid, createRawGuid]);

  const actions = useMemo<CardAction[]>(
    () => [
      {
        id: 'generate',
        label: 'Generate & Copy',
        icon: 'Refresh',
        onClick: generateAndCopy,
        variant: 'primary',
        tooltip: `Generate and copy (${effectiveShortcut})`,
      },
    ],
    [generateAndCopy, effectiveShortcut]
  );

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Options */}
          <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
            <Checkbox
              label='Include curly brackets {}'
              checked={includeBrackets}
              onChange={handleBracketsChange}
            />
            <Checkbox
              label='Uppercase letters'
              checked={useUppercase}
              onChange={handleUppercaseChange}
            />
            <Checkbox
              label='Remove hyphens'
              checked={omitHyphens}
              onChange={handleHyphenChange}
            />
          </Stack>

          {/* Generated GUID Display */}
          <TextField
            label='Generated GUID'
            value={generatedGuid}
            readOnly
            multiline={generatedGuid.includes('\n')}
            autoAdjustHeight={generatedGuid.includes('\n')}
            styles={{
              field: {
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '13px',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
              },
            }}
            onClick={handleCopyGenerated}
            title='Click to copy'
            ariaLabel='Generated GUID output, click to copy'
          />

          {/* Bulk Generation */}
          <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
            <TextField
              label='Bulk generate'
              type='number'
              value={bulkCount.toString()}
              onChange={(ev, newValue) => {
                const num = parseInt(newValue || '1', 10);
                setBulkCount(Math.max(1, Math.min(100, num)));
              }}
              min={1}
              max={100}
              styles={{ root: { width: '100px' } }}
              ariaLabel='Number of GUIDs to generate'
            />
            <PrimaryButton
              text={`Generate & Copy ${bulkCount}`}
              iconProps={{ iconName: 'Refresh' }}
              onClick={generateBulkGuids}
              title={`Generate ${bulkCount} GUID${bulkCount === 1 ? '' : 's'} at once`}
            />
          </Stack>

          <span
            style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}
            aria-live='polite'
          >
            Use the action menu above or press {effectiveShortcut} to generate and copy instantly.
          </span>

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

          {/* History */}
          {guidHistory.length > 0 && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Stack horizontal horizontalAlign='space-between' verticalAlign='center'>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>
                  Recent GUIDs ({guidHistory.length})
                </label>
                <IconButton
                  iconProps={{ iconName: 'Delete' }}
                  title='Clear history'
                  ariaLabel='Clear GUID history'
                  onClick={clearHistory}
                  styles={{ root: { height: 24 } }}
                />
              </Stack>
              <div
                style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #e1e5e9',
                  borderRadius: '4px',
                  padding: '8px',
                  backgroundColor: '#fafafa',
                }}
              >
                {guidHistory.map((guid, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 8px',
                      marginBottom: index < guidHistory.length - 1 ? '4px' : 0,
                      backgroundColor: '#fff',
                      borderRadius: '2px',
                      fontSize: '11px',
                      fontFamily: 'Consolas, Monaco, monospace',
                    }}
                  >
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {guid}
                    </span>
                    <IconButton
                      iconProps={{ iconName: 'Copy' }}
                      title='Copy this GUID'
                      ariaLabel={`Copy GUID ${guid}`}
                      onClick={() => copyFromHistory(guid)}
                      styles={{ root: { minWidth: 24, width: 24, height: 24 } }}
                    />
                  </div>
                ))}
              </div>
            </Stack>
          )}

          {/* Shortcut Info */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Press {effectiveShortcut} anywhere to generate and copy a new GUID
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
