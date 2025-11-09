// src/components/DeveloperUtilities/utilities/LoremIpsumUtility.tsx

import {
  ChoiceGroup,
  IChoiceGroupOption,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  SpinButton,
  Stack,
  TextField,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { BaseUtilityProps } from '../types/UtilityTypes';

type LoremType = 'paragraphs' | 'sentences' | 'characters';

export const LoremIpsumUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'Lorem Ipsum Generator',
  shortcut = 'Ctrl+L',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [generatedText, setGeneratedText] = useState<string>('');
  const [loremType, setLoremType] = useState<LoremType>('paragraphs');
  const [count, setCount] = useState<number>(3);

  // Lorem ipsum base text
  const loremWords = useMemo(
    () => [
      'lorem',
      'ipsum',
      'dolor',
      'sit',
      'amet',
      'consectetur',
      'adipiscing',
      'elit',
      'sed',
      'do',
      'eiusmod',
      'tempor',
      'incididunt',
      'ut',
      'labore',
      'et',
      'dolore',
      'magna',
      'aliqua',
      'enim',
      'ad',
      'minim',
      'veniam',
      'quis',
      'nostrud',
      'exercitation',
      'ullamco',
      'laboris',
      'nisi',
      'aliquip',
      'ex',
      'ea',
      'commodo',
      'consequat',
      'duis',
      'aute',
      'irure',
      'in',
      'reprehenderit',
      'voluptate',
      'velit',
      'esse',
      'cillum',
      'fugiat',
      'nulla',
      'pariatur',
      'excepteur',
      'sint',
      'occaecat',
      'cupidatat',
      'non',
      'proident',
      'sunt',
      'culpa',
      'qui',
      'officia',
      'deserunt',
      'mollit',
      'anim',
      'id',
      'est',
      'laborum',
      'at',
      'vero',
      'eos',
      'accusamus',
      'accusantium',
      'doloremque',
      'laudantium',
      'totam',
      'rem',
      'aperiam',
      'eaque',
      'ipsa',
      'quae',
      'ab',
      'illo',
      'inventore',
      'veritatis',
    ],
    []
  );

  // Load preferences on mount
  useEffect(() => {
    const savedType = utilityService.getPreference('loremIpsum', 'type');
    const savedCount = utilityService.getPreference('loremIpsum', 'count');

    if (
      typeof savedType === 'string' &&
      ['paragraphs', 'sentences', 'characters'].includes(savedType)
    ) {
      setLoremType(savedType as LoremType);
    }

    if (typeof savedCount === 'number') {
        setCount(savedCount);
    }

  }, [utilityService]);

  // Save preferences when they change
  const handleTypeChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, option?: IChoiceGroupOption): void => {
      if (option) {
        const newType = option.key as LoremType;
        setLoremType(newType);
        utilityService.savePreference('loremIpsum', 'type', newType);
      }
    },
    [utilityService]
  );

  const handleCountChange = useCallback(
    (value: string): void => {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
        setCount(numValue);
        utilityService.savePreference('loremIpsum', 'count', numValue);
      }
    },
    [utilityService]
  );

  // Generate random words
  const getRandomWords = useCallback(
    (wordCount: number): string => {
      const words: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      return words.join(' ');
    },
    [loremWords]
  );

  // Generate sentence (8-15 words)
  const generateSentence = useCallback((): string => {
    const wordCount = Math.floor(Math.random() * 8) + 8;
    const sentence = getRandomWords(wordCount);
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  }, [getRandomWords]);

  // Generate paragraph (4-8 sentences)
  const generateParagraph = useCallback((): string => {
    const sentenceCount = Math.floor(Math.random() * 5) + 4;
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  }, [generateSentence]);

  // Main generation function
  const generateLorem = useCallback((): string => {
    switch (loremType) {
      case 'paragraphs': {
        const paragraphs: string[] = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        return paragraphs.join('\n\n');
      }

      case 'sentences': {
        const sentences: string[] = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence());
        }
        return sentences.join(' ');
      }

      case 'characters': {
        let text = '';
        while (text.length < count) {
          text += generateParagraph() + ' ';
        }
        return text.substring(0, count);
      }

      default:
        return '';
    }
  }, [loremType, count, generateParagraph, generateSentence]);

  const generateAndApply = useCallback(
    async (copy: boolean) => {
      const newText = generateLorem();
      setGeneratedText(newText);
      utilityService.savePreference('loremIpsum', 'mostRecent', newText);

      if (copy) {
        await copyToClipboard(newText);
      }
    },
    [generateLorem, copyToClipboard, utilityService]
  );

  const copyExistingText = useCallback(async (): Promise<void> => {
    if (generatedText) {
      await copyToClipboard(generatedText);
    }
  }, [generatedText, copyToClipboard]);

  // Set up keyboard shortcut
  useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+l', () => {
      generateAndApply(true).catch(() => undefined);
    });

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [generateAndApply, utilityService]);

  // Generate initial text on mount or when preferences change
  useEffect(() => {
    generateAndApply(false).catch(() => undefined);
  }, [generateAndApply]);

  const typeOptions: IChoiceGroupOption[] = useMemo(
    () => [
      { key: 'paragraphs', text: 'Paragraphs' },
      { key: 'sentences', text: 'Sentences' },
      { key: 'characters', text: 'Characters' },
    ],
    []
  );

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'generate-and-copy',
        label: 'Generate & Copy',
        icon: 'Refresh',
        onClick: () => {
          generateAndApply(true).catch(() => undefined);
        },
        variant: 'primary',
        tooltip: `Generate and copy (${shortcut ?? 'Ctrl+L'})`,
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyExistingText,
        variant: 'secondary',
        tooltip: 'Copy text to clipboard',
      },
      {
        id: 'regenerate',
        label: 'Reapply Format',
        icon: 'History',
        onClick: () => { generateAndApply(false).catch(() => undefined); },
        variant: 'secondary',
        tooltip: 'Regenerate without copying',
      },
    ],
    [copyExistingText, generateAndApply, shortcut]
  );

  const textStats = useMemo(() => {
    if (!generatedText) return null;
    return {
      characters: generatedText.length,
      words: utilityService.countWords(generatedText),
      lines: utilityService.countLines(generatedText),
    };
  }, [generatedText, utilityService]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Type Selection */}
          <ChoiceGroup
            label='Generate by:'
            selectedKey={loremType}
            options={typeOptions}
            onChange={handleTypeChange}
            styles={{
              flexContainer: { display: 'flex', gap: '16px' },
            }}
          />

          {/* Count Input */}
          <SpinButton
            label={`Number of ${loremType}:`}
            value={count.toString()}
            onValidate={handleCountChange}
            onIncrement={value => handleCountChange((parseInt(value, 10) + 1).toString())}
            onDecrement={value => handleCountChange((parseInt(value, 10) - 1).toString())}
            min={1}
            max={loremType === 'characters' ? 10000 : 100}
            step={1}
            styles={{
              spinButtonWrapper: { maxWidth: '120px' },
            }}
            ariaLabel={`Number of ${loremType} to generate`}
          />

          {/* Generated Text Display */}
          <TextField
            label='Generated Text'
            value={generatedText}
            multiline
            rows={
              loremType === 'characters'
                ? 3
                : Math.min(8, Math.max(3, Math.ceil(generatedText.length / 100)))
            }
            readOnly
            styles={{
              field: {
                fontFamily: 'Segoe UI, sans-serif',
                fontSize: '13px',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
              },
            }}
            onClick={copyExistingText}
            title='Click to copy'
            ariaLabel='Generated lorem ipsum text, click to copy'
          />

          {/* Action Buttons */}
          <PrimaryButton
            text='Generate & Copy'
            iconProps={{ iconName: 'Refresh' }}
            onClick={() => { generateAndApply(true).catch(() => undefined); }}
            title={`Generate and copy lorem ipsum (${shortcut ?? 'Ctrl+L'})`}
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

          {/* Text Stats */}
          {textStats && (
            <div
              style={{
                fontSize: '11px',
                color: '#666',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              <strong>Stats:</strong> {textStats.characters} characters, {textStats.words} words,{' '}
              {textStats.lines} lines
            </div>
          )}

          {/* Shortcut Info */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Press {shortcut ?? 'Ctrl+L'} anywhere to generate and copy new text
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
