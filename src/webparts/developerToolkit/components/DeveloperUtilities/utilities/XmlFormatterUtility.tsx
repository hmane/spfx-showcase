// src/components/DeveloperUtilities/utilities/XmlFormatterUtility.tsx

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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { useDebounce } from '../hooks/useDebounce';
import { BaseUtilityProps } from '../types/UtilityTypes';

/**
 * Extract original namespace prefix-to-URI mappings from an XML string.
 * Returns a Map of URI -> original prefix (e.g., "http://...PnP..." -> "pnp")
 */
function extractNamespaceMappings(xml: string): Map<string, string> {
  const mappings = new Map<string, string>();
  const nsRegex = /xmlns:([a-zA-Z][a-zA-Z0-9_.-]*)=["']([^"']+)["']/g;
  let match;
  while ((match = nsRegex.exec(xml)) !== null) {
    const prefix = match[1];
    const uri = match[2];
    if (!mappings.has(uri)) {
      mappings.set(uri, prefix);
    }
  }
  return mappings;
}

/**
 * Restore original namespace prefixes after XMLSerializer renames them.
 * XMLSerializer may replace prefixes like "pnp:" with "ns1:", "a0:", etc.
 * This function maps them back using the URI as the key.
 */
function restoreNamespacePrefixes(serialized: string, originalMappings: Map<string, string>): string {
  if (originalMappings.size === 0) return serialized;

  let result = serialized;

  // Find all namespace declarations in the serialized output
  const nsRegex = /xmlns:([a-zA-Z][a-zA-Z0-9_.-]*)=["']([^"']+)["']/g;
  const replacements: Array<[string, string]> = [];
  let match;

  while ((match = nsRegex.exec(serialized)) !== null) {
    const currentPrefix = match[1];
    const uri = match[2];
    const originalPrefix = originalMappings.get(uri);

    if (originalPrefix && originalPrefix !== currentPrefix) {
      replacements.push([currentPrefix, originalPrefix]);
    }
  }

  // Apply replacements (process longer prefixes first to avoid partial matches)
  replacements.sort((a, b) => b[0].length - a[0].length);

  for (const [from, to] of replacements) {
    // Replace xmlns declaration
    result = result.replace(new RegExp(`xmlns:${from}=`, 'g'), `xmlns:${to}=`);
    // Replace opening tags
    result = result.replace(new RegExp(`<${from}:`, 'g'), `<${to}:`);
    // Replace closing tags
    result = result.replace(new RegExp(`</${from}:`, 'g'), `</${to}:`);
    // Replace namespaced attributes (space before prefix)
    result = result.replace(new RegExp(`(\\s)${from}:`, 'g'), `$1${to}:`);
  }

  return result;
}

export const XmlFormatterUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'XML Formatter (PnP Provisioning)',
  shortcut = 'Ctrl+X',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputXml, setInputXml] = useState<string>('');
  const [outputXml, setOutputXml] = useState<string>('');
  const [autoReorder, setAutoReorder] = useState<boolean>(true);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [customPropertyOrder, setCustomPropertyOrder] = useState<string[]>([]);
  const [minifyMode, setMinifyMode] = useState<boolean>(false);

  // SharePoint PnP default property order
  const defaultPropertyOrder = useMemo(
    () => [
      'ID',
      'Type',
      'InternalName',
      'DisplayName',
      'Name',
      'Description',
      'Required',
      'Hidden',
      'ReadOnly',
      'Group',
      'StaticName',
      'SourceID',
      'Version',
      'List',
      'Title',
      'Url',
      'ServerRelativeUrl',
      'ContentTypeId',
      'Inherits',
      'Overwrite',
      'ReplaceContent',
      'Level',
      'Sequence',
      'Rights',
      'Scope',
    ],
    []
  );

  // Load preferences on mount
  useEffect(() => {
    const savedAutoReorder = utilityService.getPreference('xml', 'autoReorder');
    const savedPropertyOrder = utilityService.getPreference('xml', 'propertyOrder');
    const savedIndentSize = utilityService.getPreference('json', 'indentSize');
    setAutoReorder(typeof savedAutoReorder === 'boolean' ? savedAutoReorder : true);
    setCustomPropertyOrder(Array.isArray(savedPropertyOrder) ? savedPropertyOrder : []);
    if (savedIndentSize === 2 || savedIndentSize === 4) {
      setIndentSize(savedIndentSize);
    }
  }, [utilityService]);

  // Save preferences
  const handleAutoReorderChange = useCallback(
    (ev?: React.FormEvent<HTMLElement>, checked?: boolean): void => {
      const newValue = checked || false;
      setAutoReorder(newValue);
      utilityService.savePreference('xml', 'autoReorder', newValue);
    },
    [utilityService]
  );

  // Reorder attributes based on preference (caller decides whether to invoke)
  const reorderAttributes = useCallback(
    (element: Element): void => {
      const attributes = Array.from(element.attributes);
      if (attributes.length <= 1) return;

      const propertyOrder =
        customPropertyOrder.length > 0 ? customPropertyOrder : defaultPropertyOrder;

      // Sort attributes based on the preferred order
      attributes.sort((a, b) => {
        const aIndex = propertyOrder.indexOf(a.name);
        const bIndex = propertyOrder.indexOf(b.name);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      // Remove all attributes
      attributes.forEach(attr => {
        element.removeAttribute(attr.name);
      });

      // Add them back in the correct order
      attributes.forEach(attr => {
        element.setAttribute(attr.name, attr.value);
      });
    },
    [customPropertyOrder, defaultPropertyOrder]
  );

  // Minify XML
  const minifyXml = useCallback((xml: string): string => {
    return xml
      .replace(/>\s+</g, '><')  // Remove whitespace between tags
      .replace(/\n/g, '')        // Remove newlines
      .replace(/\s{2,}/g, ' ')   // Collapse multiple spaces
      .trim();
  }, []);

  // Format XML string with proper indentation
  const formatXmlString = useCallback((xml: string, indent: number, shouldMinify: boolean): string => {
    if (shouldMinify) {
      return minifyXml(xml);
    }

    const reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\n$2$3');

    const INDENT = ' '.repeat(Math.max(indent, 0));
    let formatted = '';
    let level = 0;

    const isProcessingInstruction = (s: string): boolean => /^<\?/.test(s);
    const isDoctypeOrBang = (s: string): boolean => /^<!/.test(s);
    const isComment = (s: string): boolean => /^<!--/.test(s) || /-->$/.test(s);
    const isClosingTag = (s: string): boolean => /^<\//.test(s);
    const isSelfClosing = (s: string): boolean => /\/>$/.test(s);
    const isInlineOpenClose = (s: string): boolean => /^<[^/!?][^>]*>.*<\/[^>]+>$/.test(s);
    const isPureOpeningTag = (s: string): boolean => /^<[^/!?][^>]*>$/.test(s);

    xml.split('\n').forEach(raw => {
      const line = raw.trim();
      if (!line) return;

      if (isClosingTag(line)) {
        level = Math.max(level - 1, 0);
      }

      const safeLevel = Math.max(level, 0);
      formatted += INDENT.repeat(safeLevel) + line + '\n';

      if (
        !isClosingTag(line) &&
        !isSelfClosing(line) &&
        !isInlineOpenClose(line) &&
        !isProcessingInstruction(line) &&
        !isDoctypeOrBang(line) &&
        !isComment(line) &&
        isPureOpeningTag(line)
      ) {
        level += 1;
      }
    });

    return formatted.trim();
  }, [minifyXml]);

  // Format XML with proper indentation
  const formatXml = useCallback(
    (xmlString: string, reorder: boolean = autoReorder, shouldMinify: boolean = minifyMode): string => {
      if (!xmlString.trim()) return '';

      try {
        // Capture original namespace prefix mappings before DOMParser/XMLSerializer
        // can rename them (e.g., pnp: -> ns1:)
        const originalNamespaces = extractNamespaceMappings(xmlString);

        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'application/xml');

        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          throw new Error(parseError.textContent || 'XML parsing error');
        }

        if (reorder && !shouldMinify) {
          const allElements = doc.querySelectorAll('*');
          allElements.forEach(element => reorderAttributes(element));
        }

        const serializer = new XMLSerializer();
        let serialized = serializer.serializeToString(doc);

        // Restore original namespace prefixes that XMLSerializer may have renamed
        serialized = restoreNamespacePrefixes(serialized, originalNamespaces);

        return formatXmlString(serialized, indentSize, shouldMinify);
      } catch (error) {
        throw new Error(`XML formatting error: ${(error as Error).message}`);
      }
    },
    [autoReorder, reorderAttributes, indentSize, formatXmlString, minifyMode]
  );

  // Process XML
  const processXml = useCallback(
    (xmlText: string, shouldReorder: boolean = autoReorder): void => {
      if (!xmlText.trim()) {
        setOutputXml('');
        setIsValid(true);
        setErrorMessage('');
        return;
      }

      try {
        const formatted = formatXml(xmlText, shouldReorder);
        setOutputXml(formatted);
        setIsValid(true);
        setErrorMessage('');
      } catch (error) {
        setIsValid(false);
        setErrorMessage((error as Error).message);
        setOutputXml('');
      }
    },
    [formatXml, autoReorder]
  );

  // Re-process when auto-reorder option changes
  useEffect(() => {
    if (inputXml.trim()) {
      processXml(inputXml);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoReorder]);

  // Debounced input handler
  const debouncedProcess = useDebounce((value: string) => {
    processXml(value);
  }, 300);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = newValue || '';
      setInputXml(value);
      debouncedProcess(value);
    },
    [debouncedProcess]
  );

  // Manual format
  const manualFormat = useCallback((): void => {
    if (inputXml.trim()) {
      processXml(inputXml, autoReorder);
    }
  }, [inputXml, processXml, autoReorder]);

  // Toggle minify
  const toggleMinify = useCallback((): void => {
    const newMinifyMode = !minifyMode;
    setMinifyMode(newMinifyMode);
    if (inputXml.trim()) {
      try {
        const formatted = formatXml(inputXml, autoReorder, newMinifyMode);
        setOutputXml(formatted);
      } catch (error) {
        // Keep current output
      }
    }
  }, [minifyMode, inputXml, formatXml, autoReorder]);

  // Load PnP sample
  const loadPnPSample = useCallback((): void => {
    const sample = `<?xml version="1.0"?>
<pnp:Provisioning xmlns:pnp="http://schemas.dev.office.com/PnP/2023/05/ProvisioningSchema">
  <pnp:Preferences Generator="PnP.Framework, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null" />
  <pnp:Templates ID="CONTAINER-TEMPLATE">
    <pnp:ProvisioningTemplate ID="TEMPLATE-DEMO" Version="1" BaseSiteTemplate="STS#3" Scope="RootSite">
      <pnp:SiteFields><Field Type="Text" DisplayName="Department" Required="FALSE" EnforceUniqueValues="FALSE" Indexed="FALSE" MaxLength="255" Group="Custom Columns" ID="{GUID-HERE}" StaticName="Department" Name="Department" /></pnp:SiteFields>
      <pnp:ContentTypes><pnp:ContentType ID="0x0100..." Name="Custom Doc" Description="Custom document type" Group="Custom Content Types"><pnp:FieldRefs><pnp:FieldRef ID="{GUID-HERE}" Name="Department" DisplayName="Department" Required="false" /></pnp:FieldRefs></pnp:ContentType></pnp:ContentTypes>
      <pnp:Lists><pnp:ListInstance Title="Documents" Description="Document library" TemplateType="101" Url="Shared Documents" EnableVersioning="true" MinorVersionLimit="0" MaxVersionLimit="50"><pnp:ContentTypeBindings><pnp:ContentTypeBinding ContentTypeID="0x0100..." Default="true" /></pnp:ContentTypeBindings></pnp:ListInstance></pnp:Lists>
    </pnp:ProvisioningTemplate>
  </pnp:Templates>
</pnp:Provisioning>`;
    setInputXml(sample);
    processXml(sample);
  }, [processXml]);

  // Copy output to clipboard
  const copyOutput = useCallback(async (): Promise<void> => {
    if (outputXml) {
      await copyToClipboard(outputXml);
    }
  }, [outputXml, copyToClipboard]);

  // Clear all
  const clearAll = useCallback((): void => {
    setInputXml('');
    setOutputXml('');
    setIsValid(true);
    setErrorMessage('');
  }, []);

  // Set up keyboard shortcut
  useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+x', manualFormat);

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [manualFormat, utilityService]);

  const indentOptions: IDropdownOption[] = useMemo(
    () => [
      { key: 2, text: '2 spaces' },
      { key: 4, text: '4 spaces' },
      { key: 1, text: '1 tab' },
    ],
    []
  );

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'format',
        label: 'Format',
        icon: 'Code',
        onClick: manualFormat,
        variant: 'primary',
        tooltip: 'Format XML with proper indentation',
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyOutput,
        variant: 'secondary',
        tooltip: 'Copy formatted XML to clipboard',
      },
    ],
    [manualFormat, copyOutput]
  );

  // Calculate XML stats
  const getMaxDepth = useCallback((element: Element | null, currentDepth: number = 0): number => {
    if (!element) return currentDepth;

    let maxChildDepth = currentDepth;
    for (const child of Array.from(element.children)) {
      maxChildDepth = Math.max(maxChildDepth, getMaxDepth(child, currentDepth + 1));
    }

    return maxChildDepth;
  }, []);

  const xmlStats = useMemo(() => {
    if (!outputXml || !isValid) {
      return { elements: 0, attributes: 0, size: 0, depth: 0, lines: 0, rootElement: '' };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(outputXml, 'application/xml');
      const elements = doc.querySelectorAll('*').length;
      const attributes = Array.from(doc.querySelectorAll('*')).reduce(
        (count, el) => count + el.attributes.length,
        0
      );
      const depth = getMaxDepth(doc.documentElement);
      const lines = outputXml.split('\n').length;
      const rootElement = doc.documentElement?.tagName || '';

      return {
        elements,
        attributes,
        size: outputXml.length,
        depth,
        lines,
        rootElement,
      };
    } catch {
      return { elements: 0, attributes: 0, size: 0, depth: 0, lines: 0, rootElement: '' };
    }
  }, [outputXml, isValid, getMaxDepth]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 14 }}>
          {/* Settings and Quick Actions */}
          <Stack tokens={{ childrenGap: 12 }}>
            <Stack horizontal tokens={{ childrenGap: 12 }} wrap verticalAlign='center'>
              <Checkbox
                label='PnP attribute reordering'
                checked={autoReorder}
                onChange={handleAutoReorderChange}
                title='Reorder attributes for SharePoint PnP provisioning best practices'
              />

              <Dropdown
                label='Indent size'
                options={indentOptions}
                selectedKey={indentSize}
                onChange={(ev, option) => {
                  if (option) {
                    const nextIndent = option.key as number;
                    setIndentSize(nextIndent);
                    utilityService.savePreference('json', 'indentSize', nextIndent);
                  }
                }}
                styles={{ dropdown: { minWidth: '100px' } }}
              />

              <DefaultButton
                text='Load PnP Sample'
                iconProps={{ iconName: 'FileCode' }}
                onClick={loadPnPSample}
                title='Load sample PnP provisioning template'
                styles={{ root: { minWidth: 'auto' } }}
              />
            </Stack>

            {/* Property Order Info */}
            {autoReorder && !minifyMode && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#003a6b',
                  padding: '10px 12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '4px',
                  border: '1px solid #b3d6fc',
                }}
              >
                <strong>PnP Attribute Order:</strong> ID, Type, InternalName, DisplayName, Name, Description, Required, Hidden, ReadOnly, Group, StaticName...
                <br />
                Ensures consistent, readable XML for SharePoint provisioning templates.
              </div>
            )}
          </Stack>

          {/* Input XML */}
          <div>
            <Label required>XML Input</Label>
            <TextField
              placeholder='Paste or type XML here... (auto-validates as you type)'
              value={inputXml}
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
                  borderColor: !isValid && inputXml ? '#d13438' : undefined,
                  borderWidth: !isValid && inputXml ? '2px' : undefined,
                },
              }}
              ariaLabel='XML input'
              aria-invalid={!isValid}
            />
            {!isValid && inputXml && (
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
          {outputXml && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: minifyMode ? '#fff7e6' : '#e6f7ff',
              borderRadius: '4px',
              border: `1px solid ${minifyMode ? '#ffd591' : '#91d5ff'}`,
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>
                <strong>Format:</strong> {minifyMode ? 'Minified' : `Pretty-printed (${indentSize} spaces)`}
                {!minifyMode && autoReorder && ' • PnP attribute ordering applied'}
              </span>
              {isValid && (
                <span style={{ color: '#52c41a', fontWeight: 600 }}>Valid XML ✓</span>
              )}
            </div>
          )}

          {/* Output XML */}
          <div>
            <Label>Formatted Output</Label>
            <TextField
              value={outputXml}
              readOnly
              multiline
              rows={minifyMode ? 4 : 10}
              placeholder='Formatted XML will appear here...'
              styles={{
                field: {
                  fontFamily: 'Consolas, "Courier New", monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  backgroundColor: '#f8f9fa',
                  cursor: outputXml ? 'pointer' : 'default',
                },
              }}
              onClick={outputXml ? copyOutput : undefined}
              title={outputXml ? 'Click to copy' : ''}
              ariaLabel='Formatted XML output, click to copy'
            />
          </div>

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text={minifyMode ? 'Pretty Print' : 'Format'}
              iconProps={{ iconName: 'Code' }}
              onClick={manualFormat}
              disabled={!inputXml.trim()}
              title={`Format XML with indentation (${shortcut})`}
            />
            <DefaultButton
              text={minifyMode ? 'Switch to Pretty' : 'Minify'}
              iconProps={{ iconName: minifyMode ? 'TextDocument' : 'Compress' }}
              onClick={toggleMinify}
              disabled={!inputXml.trim()}
              title={minifyMode ? 'Switch to pretty-printed format' : 'Minify XML to single line'}
            />
            <DefaultButton
              text='Copy Output'
              iconProps={{ iconName: 'Copy' }}
              onClick={copyOutput}
              disabled={!outputXml}
              title='Copy formatted XML to clipboard'
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

          {/* XML Stats */}
          {isValid && outputXml && (
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
              <div style={{ fontWeight: 600, marginBottom: '6px', color: '#003a6b' }}>XML Statistics:</div>
              <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
                {xmlStats.rootElement && <div><strong>Root:</strong> {xmlStats.rootElement}</div>}
                <div><strong>Elements:</strong> {xmlStats.elements}</div>
                <div><strong>Attributes:</strong> {xmlStats.attributes}</div>
                <div><strong>Depth:</strong> {xmlStats.depth}</div>
                <div><strong>Lines:</strong> {xmlStats.lines}</div>
                <div><strong>Size:</strong> {xmlStats.size.toLocaleString()} chars</div>
              </Stack>
            </div>
          )}

          {/* PnP Tips */}
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
            <strong>Tips:</strong> Auto-validates as you type • Press {shortcut} to format • Click "Load PnP Sample" for template example • PnP attribute ordering for consistent provisioning schemas • Click output to copy
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
