// src/components/DeveloperUtilities/utilities/ContentTypeIdUtility.tsx

import {
  Checkbox,
  DefaultButton,
  Dropdown,
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
import { Card, CardAction, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { BaseUtilityProps } from '../types/UtilityTypes';

interface BaseContentType {
  id: string;
  name: string;
  description: string;
}

export const ContentTypeIdUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'Content Type ID Generator',
  shortcut = 'Ctrl+Shift+C',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [parentId, setParentId] = useState<string>('0x01');
  const [customParentId, setCustomParentId] = useState<string>('');
  const [useCustomParent, setUseCustomParent] = useState<boolean>(false);
  const [generatedId, setGeneratedId] = useState<string>('');
  const [parsedInfo, setParsedInfo] = useState<{
    isValid: boolean;
    depth: number;
    parent: string;
    segments: string[];
  } | null>(null);

  // Common SharePoint base content types
  const baseContentTypes: BaseContentType[] = useMemo(
    () => [
      { id: '0x01', name: 'Item', description: 'Base content type for list items' },
      { id: '0x0101', name: 'Document', description: 'Base content type for documents' },
      { id: '0x0120', name: 'Folder', description: 'Base content type for folders' },
      {
        id: '0x0101001F',
        name: 'Dublin Core Columns',
        description: 'Document with Dublin Core metadata',
      },
      {
        id: '0x010100629D00608F814DD6AC8A86903AEE72AA',
        name: 'Master Page',
        description: 'Master page content type',
      },
      {
        id: '0x010100C568DB52D9D0A14D9B2FDCC96666E9F2007948130EC3DB064584E219954237AF39',
        name: 'Page',
        description: 'Publishing page content type',
      },
      { id: '0x0102', name: 'Event', description: 'Calendar event content type' },
      { id: '0x0103', name: 'Issue', description: 'Issue tracking content type' },
      { id: '0x0104', name: 'Announcement', description: 'Announcement content type' },
      { id: '0x0105', name: 'Contact', description: 'Contact content type' },
      { id: '0x0106', name: 'Task', description: 'Task content type' },
      { id: '0x0107', name: 'Link', description: 'Link content type' },
      { id: '0x0108', name: 'Discussion', description: 'Discussion content type' },
      { id: '0x010801', name: 'Message', description: 'Discussion message content type' },
    ],
    []
  );

  // Generate new GUID segment for content type ID
  const generateSegment = useCallback((): string => {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      .replace(/x/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
      })
      .toUpperCase();
  }, []);

  // Generate new content type ID
  const generateContentTypeId = useCallback((): void => {
    const baseId = useCustomParent ? customParentId : parentId;

    if (!baseId) {
      return;
    }

    // Validate base ID format
    if (!/^0x[0-9A-Fa-f]+$/.test(baseId)) {
      return;
    }

    const segment = generateSegment();
    const newId = `${baseId}00${segment}`;
    setGeneratedId(newId);
  }, [parentId, customParentId, useCustomParent, generateSegment]);

  // Parse and validate content type ID
  const parseContentTypeId = useCallback((ctId: string): void => {
    if (!ctId || ctId.length < 4) {
      setParsedInfo(null);
      return;
    }

    // Basic validation
    const isValid = /^0x[0-9A-Fa-f]+$/.test(ctId);

    if (!isValid) {
      setParsedInfo({
        isValid: false,
        depth: 0,
        parent: '',
        segments: [],
      });
      return;
    }

    // Parse segments
    const withoutPrefix = ctId.substring(2); // Remove 0x
    const segments: string[] = [];

    // First segment is always 2 chars
    if (withoutPrefix.length >= 2) {
      segments.push('0x' + withoutPrefix.substring(0, 2));

      let remaining = withoutPrefix.substring(2);

      // Subsequent segments are 32 chars preceded by 00
      while (remaining.length >= 34) {
        if (remaining.substring(0, 2) === '00') {
          segments.push(remaining.substring(2, 34));
          remaining = remaining.substring(34);
        } else {
          break;
        }
      }
    }

    const depth = segments.length - 1;
    const parent = depth > 0 ? segments.slice(0, -1).join('00') : '';

    setParsedInfo({
      isValid: true,
      depth,
      parent: parent || segments[0] || '',
      segments,
    });
  }, []);

  // Handle parent dropdown change
  const handleParentChange = useCallback(
    (ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
      if (option) {
        setParentId(option.key as string);
        setUseCustomParent(false);
      }
    },
    []
  );

  // Handle custom parent input
  const handleCustomParentChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = (newValue || '').toUpperCase();
      setCustomParentId(value);
      if (value) {
        setUseCustomParent(true);
      }
    },
    []
  );

  // Handle generated ID change for parsing
  const handleGeneratedIdChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = (newValue || '').toUpperCase();
      setGeneratedId(value);
      parseContentTypeId(value);
    },
    [parseContentTypeId]
  );

  // Copy to clipboard
  const copyId = useCallback(async (): Promise<void> => {
    if (generatedId) {
      await copyToClipboard(generatedId);
    }
  }, [generatedId, copyToClipboard]);

  // Clear all
  const clearAll = useCallback((): void => {
    setParentId('0x01');
    setCustomParentId('');
    setUseCustomParent(false);
    setGeneratedId('');
    setParsedInfo(null);
  }, []);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+shift+c', generateContentTypeId);

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [generateContentTypeId, utilityService]);

  const parentOptions: IDropdownOption[] = useMemo(
    () =>
      baseContentTypes.map(ct => ({
        key: ct.id,
        text: `${ct.name} (${ct.id})`,
        title: ct.description,
      })),
    [baseContentTypes]
  );

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'generate',
        label: 'Generate',
        icon: 'Refresh',
        onClick: generateContentTypeId,
        variant: 'primary',
        tooltip: 'Generate new Content Type ID',
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyId,
        variant: 'secondary',
        tooltip: 'Copy Content Type ID',
      },
    ],
    [generateContentTypeId, copyId]
  );

  const selectedBaseType = useMemo(() => {
    return baseContentTypes.find(ct => ct.id === parentId);
  }, [baseContentTypes, parentId]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Parent Content Type Selection */}
          <div>
            <Label required>Parent Content Type</Label>
            <Dropdown
              placeholder='Select parent content type'
              options={parentOptions}
              selectedKey={parentId}
              onChange={handleParentChange}
              disabled={useCustomParent}
              styles={{ dropdown: { width: '100%' } }}
            />
            {selectedBaseType && !useCustomParent && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {selectedBaseType.description}
              </div>
            )}
          </div>

          {/* Custom Parent ID */}
          <div>
            <Checkbox
              label='Use custom parent ID'
              checked={useCustomParent}
              onChange={(ev, checked) => setUseCustomParent(checked || false)}
            />
            {useCustomParent && (
              <TextField
                placeholder='Enter custom parent ID (e.g., 0x0101...)'
                value={customParentId}
                onChange={handleCustomParentChange}
                styles={{
                  root: { marginTop: '8px' },
                  field: {
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '12px',
                  },
                }}
                ariaLabel='Custom parent content type ID'
              />
            )}
          </div>

          {/* Generated Content Type ID */}
          <div>
            <Label>Generated Content Type ID</Label>
            <TextField
              value={generatedId}
              onChange={handleGeneratedIdChange}
              placeholder="Click 'Generate' to create new ID or paste existing ID to parse"
              multiline
              autoAdjustHeight
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px',
                  backgroundColor: '#f8f9fa',
                },
              }}
              ariaLabel='Generated content type ID'
            />
          </div>

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text='Generate New ID'
              iconProps={{ iconName: 'Refresh' }}
              onClick={generateContentTypeId}
              title={`Generate new content type ID (${shortcut})`}
            />
            <DefaultButton
              text='Copy ID'
              iconProps={{ iconName: 'Copy' }}
              onClick={copyId}
              disabled={!generatedId}
              title='Copy content type ID to clipboard'
            />
            <DefaultButton
              text='Clear'
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title='Clear all fields'
            />
          </Stack>

          {/* Parsed Information */}
          {parsedInfo && generatedId && (
            <div
              style={{
                padding: '12px',
                backgroundColor: parsedInfo.isValid ? '#f0f9ff' : '#fff8f0',
                borderRadius: '4px',
                border: `1px solid ${parsedInfo.isValid ? '#b3d6fc' : '#ffcc80'}`,
              }}
            >
              <h4
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '13px',
                  color: parsedInfo.isValid ? '#003a6b' : '#ff8c00',
                }}
              >
                {parsedInfo.isValid ? 'Content Type ID Structure' : 'Invalid Content Type ID'}
              </h4>
              {parsedInfo.isValid ? (
                <div style={{ fontSize: '11px', color: '#003a6b' }}>
                  <div>
                    <strong>Inheritance Depth:</strong> {parsedInfo.depth}
                  </div>
                  <div>
                    <strong>Parent ID:</strong>{' '}
                    <code style={{ fontSize: '11px' }}>{parsedInfo.parent}</code>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <strong>Segments:</strong>
                  </div>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    {parsedInfo.segments.map((segment, index) => (
                      <li key={index}>
                        <code style={{ fontSize: '10px' }}>
                          {index === 0 ? `${segment} (Base)` : `${segment} (Level ${index})`}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#ff8c00' }}>
                  Content Type IDs must start with &quot;0x&quot; followed by hexadecimal characters
                </div>
              )}
            </div>
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

          {/* Information Box */}
          <div
            style={{
              fontSize: '11px',
              color: '#003a6b',
              padding: '8px',
              backgroundColor: '#f0f9ff',
              borderRadius: '4px',
              border: '1px solid #b3d6fc',
            }}
          >
            <strong>Content Type ID Format:</strong>
            <br />
            Format: 0x[BaseType]00[32-char-GUID]00[32-char-GUID]...
            <br />
            <br />
            <strong>Examples:</strong>
            <br />
            0x01 = Item (base)
            <br />
            0x0101 = Document (inherits from Item)
            <br />
            0x010100... = Custom document (inherits from Document)
          </div>

          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Press {shortcut} to generate • Paste existing IDs to parse structure • Each inheritance
            level adds 34 characters (00 + 32-char GUID)
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
