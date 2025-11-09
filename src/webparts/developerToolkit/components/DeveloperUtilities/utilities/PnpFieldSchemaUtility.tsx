// src/components/DeveloperUtilities/utilities/PnpFieldSchemaUtility.tsx

import {
  Checkbox,
  DefaultButton,
  Dropdown,
  IDropdownOption,
  IconButton,
  Label,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Stack,
  TextField,
  Toggle,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { useClipboard } from '../hooks/useClipboard';
import { BaseUtilityProps } from '../types/UtilityTypes';

type FieldMode = 'custom' | 'oob' | 'fieldref';
type OutputFormat = 'xml' | 'fieldref' | 'powershell' | 'json';

interface ParameterConfig {
  isParameter: boolean;
  parameterName: string;
}

interface FieldProperties {
  // Essential
  internalName: string;
  displayName: string;
  fieldType: string;
  id: string;
  required: boolean;

  // Common
  description: string;
  group: string;
  hidden: boolean;
  readOnly: boolean;
  indexed: boolean;
  enforceUniqueValues: boolean;

  // Text-specific
  maxLength: string;
  richText: boolean;
  numberOfLines: string;

  // Choice-specific
  choices: string;
  format: string;
  fillInChoice: boolean;

  // Number-specific
  min: string;
  max: string;
  decimals: string;
  percentage: boolean;

  // DateTime-specific
  displayFormat: string;
  friendlyDisplayFormat: string;

  // User-specific
  selectionMode: string;
  allowMultiple: boolean;

  // Lookup-specific
  list: string;
  showField: string;

  // URL-specific
  urlFormat: string;

  // Calculated-specific
  formula: string;
  resultType: string;

  // Taxonomy-specific
  termSetId: string;
  sspId: string;
  anchorId: string;
}

interface OOBField {
  id: string;
  internalName: string;
  displayName: string;
  type: string;
  description: string;
}

export const PnpFieldSchemaUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'PnP Field Schema Generator',
  shortcut = 'Ctrl+Shift+F',
}) => {
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();

  const [fieldMode, setFieldMode] = useState<FieldMode>('custom');
  const [selectedOOBField, setSelectedOOBField] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('xml');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [generatedSchema, setGeneratedSchema] = useState<string>('');
  const [parameters, setParameters] = useState<Map<string, ParameterConfig>>(new Map());

  const [fieldProps, setFieldProps] = useState<FieldProperties>({
    internalName: '',
    displayName: '',
    fieldType: 'Text',
    id: '',
    required: false,
    description: '',
    group: 'Custom Columns',
    hidden: false,
    readOnly: false,
    indexed: false,
    enforceUniqueValues: false,
    maxLength: '255',
    richText: false,
    numberOfLines: '6',
    choices: '',
    format: 'Dropdown',
    fillInChoice: false,
    min: '',
    max: '',
    decimals: '0',
    percentage: false,
    displayFormat: 'DateOnly',
    friendlyDisplayFormat: 'Disabled',
    selectionMode: 'PeopleOnly',
    allowMultiple: false,
    list: '',
    showField: 'Title',
    urlFormat: 'Hyperlink',
    formula: '',
    resultType: 'Text',
    termSetId: '',
    sspId: '',
    anchorId: '',
  });

  // OOB Fields library
  const oobFields: OOBField[] = useMemo(
    () => [
      {
        id: 'fa564e0f-0c70-4ab9-b863-0177e6ddd247',
        internalName: 'Title',
        displayName: 'Title',
        type: 'Text',
        description: 'Title field (single line of text)',
      },
      {
        id: '1d22ea11-1e32-424e-89ab-9fedbadb6ce1',
        internalName: 'ID',
        displayName: 'ID',
        type: 'Counter',
        description: 'Item ID',
      },
      {
        id: '8c06beca-0777-48f7-91c7-6da68bc07b69',
        internalName: 'Created',
        displayName: 'Created',
        type: 'DateTime',
        description: 'Date and time the item was created',
      },
      {
        id: '28cf69c5-fa48-462a-b5cd-27b6f9d2bd5f',
        internalName: 'Modified',
        displayName: 'Modified',
        type: 'DateTime',
        description: 'Date and time the item was last modified',
      },
      {
        id: '1df5e554-ec7e-46a6-901d-d85a3881cb18',
        internalName: 'Author',
        displayName: 'Created By',
        type: 'User',
        description: 'Person who created the item',
      },
      {
        id: 'd31655d1-1d5b-4511-95a1-7a09e9b75bf2',
        internalName: 'Editor',
        displayName: 'Modified By',
        type: 'User',
        description: 'Person who last modified the item',
      },
      {
        id: '8553196d-ec8d-4564-9861-3dbe931050c8',
        internalName: 'FileLeafRef',
        displayName: 'Name',
        type: 'File',
        description: 'Name of the file or folder',
      },
      {
        id: '94f89715-e097-4e8b-ba79-ea02aa8b7adb',
        internalName: 'FileDirRef',
        displayName: 'Path',
        type: 'Lookup',
        description: 'Path to the folder',
      },
      {
        id: '8de41611-2ca2-4a0d-ba9e-094c4e1c9c1f',
        internalName: 'File_x0020_Type',
        displayName: 'Type',
        type: 'Text',
        description: 'File type/extension',
      },
      {
        id: '8fca95c0-9b7d-456f-8dae-b41ee2728b85',
        internalName: 'File_x0020_Size',
        displayName: 'File Size',
        type: 'Lookup',
        description: 'Size of the file',
      },
      {
        id: '03e45e84-1992-4d42-9116-26f756012634',
        internalName: 'ContentType',
        displayName: 'Content Type',
        type: 'Computed',
        description: 'Content Type of the item',
      },
      {
        id: 'cbb92da4-fd46-4c7d-af6c-3128c2a5576e',
        internalName: '_ModerationStatus',
        displayName: 'Approval Status',
        type: 'ModStat',
        description: 'Content approval status',
      },
      {
        id: '5c6f16e7-593f-4345-8cc4-6a5ff004d2e5',
        internalName: '_CheckinComment',
        displayName: 'Check In Comment',
        type: 'Note',
        description: 'Check-in comment for the item',
      },
      {
        id: '503f1caa-358e-4918-9094-4a2cdc4bc034',
        internalName: '_Level',
        displayName: 'Version Level',
        type: 'Integer',
        description: 'Version level (1=Draft, 2=Published)',
      },
      {
        id: 'f1e020bc-ba26-443f-bf2f-b68715017bbc',
        internalName: 'FileRef',
        displayName: 'URL Path',
        type: 'Lookup',
        description: 'Full URL path to the file',
      },
      {
        id: 'f39d44af-d3f3-4ae6-b43f-ac7330b5e9bd',
        internalName: 'EncodedAbsUrl',
        displayName: 'Encoded Absolute URL',
        type: 'Computed',
        description: 'Encoded absolute URL of the item',
      },
      {
        id: '0c5e0085-eb30-494b-9cdd-ece1d3c649a2',
        internalName: '_UIVersionString',
        displayName: 'Version',
        type: 'Text',
        description: 'Version number as text',
      },
      {
        id: '3881510a-4e4a-4ee8-b102-8ee8e2d0dd4b',
        internalName: 'CheckoutUser',
        displayName: 'Checked Out To',
        type: 'Lookup',
        description: 'User who has the item checked out',
      },
    ],
    []
  );

  // Field type options
  const fieldTypeOptions: IDropdownOption[] = useMemo(
    () => [
      { key: 'Text', text: 'Single Line of Text' },
      { key: 'Note', text: 'Multiple Lines of Text' },
      { key: 'Choice', text: 'Choice (Dropdown/Radio/Checkboxes)' },
      { key: 'Number', text: 'Number' },
      { key: 'Currency', text: 'Currency' },
      { key: 'DateTime', text: 'Date and Time' },
      { key: 'Boolean', text: 'Yes/No (Boolean)' },
      { key: 'User', text: 'Person or Group' },
      { key: 'Lookup', text: 'Lookup' },
      { key: 'URL', text: 'Hyperlink or Picture' },
      { key: 'Calculated', text: 'Calculated' },
      { key: 'TaxonomyFieldType', text: 'Managed Metadata' },
      { key: 'MultiChoice', text: 'Multiple Choice' },
      { key: 'Location', text: 'Location' },
      { key: 'Thumbnail', text: 'Thumbnail' },
    ],
    []
  );

  // OOB field dropdown options
  const oobFieldOptions: IDropdownOption[] = useMemo(
    () =>
      oobFields.map(field => ({
        key: field.id,
        text: `${field.displayName} (${field.internalName})`,
        title: field.description,
      })),
    [oobFields]
  );

  // Generate new GUID
  const generateGuid = useCallback((): void => {
    const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setFieldProps(prev => ({ ...prev, id: guid }));
  }, []);

  // Handle OOB field selection
  const handleOOBFieldSelect = useCallback(
    (fieldId: string): void => {
      const selected = oobFields.find(f => f.id === fieldId);
      if (selected) {
        setFieldProps(prev => ({
          ...prev,
          id: selected.id,
          internalName: selected.internalName,
          displayName: selected.displayName,
          fieldType: selected.type,
        }));
        setSelectedOOBField(fieldId);
      }
    },
    [oobFields]
  );

  // Toggle parameter
  const toggleParameter = useCallback((propName: string, currentValue: string): void => {
    setParameters(prev => {
      const newParams = new Map(prev);
      const existing = newParams.get(propName);

      if (existing?.isParameter) {
        // Remove parameter
        newParams.delete(propName);
      } else {
        // Add parameter - generate default name from property
        const defaultName = propName
          .replace(/([A-Z])/g, '_$1')
          .toUpperCase()
          .replace(/^_/, '');
        newParams.set(propName, {
          isParameter: true,
          parameterName: defaultName,
        });
      }

      return newParams;
    });
  }, []);

  // Update parameter name
  const updateParameterName = useCallback((propName: string, newName: string): void => {
    setParameters(prev => {
      const newParams = new Map(prev);
      const existing = newParams.get(propName);
      if (existing) {
        newParams.set(propName, {
          ...existing,
          parameterName: newName.toUpperCase().replace(/\s/g, '_'),
        });
      }
      return newParams;
    });
  }, []);

  // Replace value with parameter if configured
  const getValueOrParameter = useCallback(
    (propName: string, value: string): string => {
      const param = parameters.get(propName);
      if (param?.isParameter && param.parameterName) {
        return `{parameter:${param.parameterName}}`;
      }
      return value;
    },
    [parameters]
  );

  // Generate Field XML
  const generateFieldXml = useCallback((): string => {
    const attrs: string[] = [];

    attrs.push(`Type="${fieldProps.fieldType}"`);
    attrs.push(`ID="{${fieldProps.id}}"`);
    attrs.push(`Name="${getValueOrParameter('internalName', fieldProps.internalName)}"`);
    attrs.push(`DisplayName="${getValueOrParameter('displayName', fieldProps.displayName)}"`);

    if (fieldProps.description) {
      attrs.push(`Description="${getValueOrParameter('description', fieldProps.description)}"`);
    }

    attrs.push(`Required="${fieldProps.required ? 'TRUE' : 'FALSE'}"`);

    if (fieldProps.group) {
      attrs.push(`Group="${getValueOrParameter('group', fieldProps.group)}"`);
    }

    if (fieldProps.hidden) attrs.push('Hidden="TRUE"');
    if (fieldProps.readOnly) attrs.push('ReadOnly="TRUE"');
    if (fieldProps.indexed) attrs.push('Indexed="TRUE"');
    if (fieldProps.enforceUniqueValues) attrs.push('EnforceUniqueValues="TRUE"');

    // Type-specific attributes
    if (fieldProps.fieldType === 'Text') {
      attrs.push(`MaxLength="${fieldProps.maxLength}"`);
    }

    if (fieldProps.fieldType === 'Note') {
      attrs.push(`NumLines="${fieldProps.numberOfLines}"`);
      if (fieldProps.richText) {
        attrs.push('RichText="TRUE"');
        attrs.push('RichTextMode="FullHtml"');
      }
    }

    if (fieldProps.fieldType === 'Choice' || fieldProps.fieldType === 'MultiChoice') {
      attrs.push(`Format="${fieldProps.format}"`);
      if (fieldProps.fillInChoice) attrs.push('FillInChoice="TRUE"');
    }

    if (fieldProps.fieldType === 'Number' || fieldProps.fieldType === 'Currency') {
      if (fieldProps.min) attrs.push(`Min="${fieldProps.min}"`);
      if (fieldProps.max) attrs.push(`Max="${fieldProps.max}"`);
      attrs.push(`Decimals="${fieldProps.decimals}"`);
      if (fieldProps.percentage) attrs.push('Percentage="TRUE"');
    }

    if (fieldProps.fieldType === 'DateTime') {
      attrs.push(`Format="${fieldProps.displayFormat}"`);
      attrs.push(`FriendlyDisplayFormat="${fieldProps.friendlyDisplayFormat}"`);
    }

    if (fieldProps.fieldType === 'User') {
      attrs.push(`UserSelectionMode="${fieldProps.selectionMode}"`);
      if (fieldProps.allowMultiple) attrs.push('Mult="TRUE"');
    }

    if (fieldProps.fieldType === 'Lookup') {
      if (fieldProps.list) {
        attrs.push(`List="${getValueOrParameter('list', fieldProps.list)}"`);
      }
      attrs.push(`ShowField="${fieldProps.showField}"`);
      if (fieldProps.allowMultiple) attrs.push('Mult="TRUE"');
    }

    if (fieldProps.fieldType === 'URL') {
      attrs.push(`Format="${fieldProps.urlFormat}"`);
    }

    if (fieldProps.fieldType === 'TaxonomyFieldType') {
      if (fieldProps.termSetId) {
        attrs.push(`TermSetId="${getValueOrParameter('termSetId', fieldProps.termSetId)}"`);
      }
      if (fieldProps.sspId) {
        attrs.push(`SspId="${getValueOrParameter('sspId', fieldProps.sspId)}"`);
      }
      if (fieldProps.anchorId) {
        attrs.push(`AnchorId="${getValueOrParameter('anchorId', fieldProps.anchorId)}"`);
      }
    }

    let xml = `<Field ${attrs.join(' ')}`;

    // Add choices for Choice fields
    if (
      (fieldProps.fieldType === 'Choice' || fieldProps.fieldType === 'MultiChoice') &&
      fieldProps.choices
    ) {
      xml += '>\n';
      xml += '  <CHOICES>\n';
      fieldProps.choices.split(',').forEach(choice => {
        xml += `    <CHOICE>${choice.trim()}</CHOICE>\n`;
      });
      xml += '  </CHOICES>\n';
      xml += '</Field>';
    } else if (fieldProps.fieldType === 'Calculated' && fieldProps.formula) {
      xml += '>\n';
      xml += `  <Formula>${getValueOrParameter('formula', fieldProps.formula)}</Formula>\n`;
      xml += '</Field>';
    } else {
      xml += ' />';
    }

    return xml;
  }, [fieldProps, getValueOrParameter]);

  // Generate FieldRef XML
  const generateFieldRefXml = useCallback((): string => {
    const attrs: string[] = [];

    attrs.push(`ID="{${fieldProps.id}}"`);
    attrs.push(`Name="${fieldProps.internalName}"`);

    if (fieldMode === 'fieldref') {
      // Override properties for FieldRef
      if (fieldProps.displayName) attrs.push(`DisplayName="${fieldProps.displayName}"`);
      if (fieldProps.required) attrs.push('Required="TRUE"');
      if (fieldProps.hidden) attrs.push('Hidden="TRUE"');
      if (fieldProps.readOnly) attrs.push('ReadOnly="TRUE"');
    }

    return `<FieldRef ${attrs.join(' ')} />`;
  }, [fieldProps, fieldMode]);

  // Generate PowerShell command
  const generatePowerShell = useCallback((): string => {
    const lines: string[] = [];

    // Generate param block if parameters exist
    if (parameters.size > 0) {
      lines.push('param(');
      const paramLines: string[] = [];
      parameters.forEach((config, propName) => {
        const propValue = (fieldProps as any)[propName];
        if (propValue) {
          paramLines.push(`    [string]$${config.parameterName}`);
        }
      });
      lines.push(paramLines.join(',\n'));
      lines.push(')');
      lines.push('');
    }

    const backtick = '`';
    lines.push(`Add-PnPField ${backtick}`);
    lines.push(`    -Type "${fieldProps.fieldType}" ${backtick}`);
    lines.push(`    -InternalName "${fieldProps.internalName}" ${backtick}`);

    const displayValue = getValueOrParameter('displayName', fieldProps.displayName);
    if (displayValue.startsWith('{parameter:')) {
      const paramName = displayValue.match(/\{parameter:([^}]+)\}/)?.[1];
      lines.push(`    -DisplayName $${paramName} ${backtick}`);
    } else {
      lines.push(`    -DisplayName "${displayValue}" ${backtick}`);
    }

    lines.push(`    -Id "{${fieldProps.id}}" ${backtick}`);

    if (fieldProps.required) lines.push(`    -Required ${backtick}`);
    if (fieldProps.group) {
      const groupValue = getValueOrParameter('group', fieldProps.group);
      if (groupValue.startsWith('{parameter:')) {
        const paramName = groupValue.match(/\{parameter:([^}]+)\}/)?.[1];
        lines.push(`    -Group $${paramName} ${backtick}`);
      } else {
        lines.push(`    -Group "${groupValue}" ${backtick}`);
      }
    }

    // Type-specific parameters
    if (fieldProps.fieldType === 'Choice' && fieldProps.choices) {
      const choicesArray = fieldProps.choices.split(',').map(c => `"${c.trim()}"`);
      lines.push(`    -Choices @(${choicesArray.join(', ')}) ${backtick}`);
    }

    if (fieldProps.fieldType === 'TaxonomyFieldType' && fieldProps.termSetId) {
      const termSetValue = getValueOrParameter('termSetId', fieldProps.termSetId);
      if (termSetValue.startsWith('{parameter:')) {
        const paramName = termSetValue.match(/\{parameter:([^}]+)\}/)?.[1];
        lines.push(`    -TermSetId $${paramName} ${backtick}`);
      } else {
        lines.push(`    -TermSetId "${termSetValue}" ${backtick}`);
      }
    }

    // Remove last backtick
    const lastLine = lines[lines.length - 1];
    lines[lines.length - 1] = lastLine.replace(new RegExp(` ${backtick}$`), '');

    return lines.join('\n');
  }, [fieldProps, parameters, getValueOrParameter]);

  // Generate JSON template
  const generateJsonTemplate = useCallback((): string => {
    const template: any = {};

    if (parameters.size > 0) {
      template.parameters = {};
      parameters.forEach((config, propName) => {
        const propValue = (fieldProps as any)[propName];
        if (propValue) {
          template.parameters[config.parameterName] = {
            type: 'string',
            defaultValue: propValue,
          };
        }
      });
    }

    const fieldDef: any = {
      Type: fieldProps.fieldType,
      ID: `{${fieldProps.id}}`,
      Name: getValueOrParameter('internalName', fieldProps.internalName),
      DisplayName: getValueOrParameter('displayName', fieldProps.displayName),
      Required: fieldProps.required,
    };

    if (fieldProps.description) fieldDef.Description = getValueOrParameter('description', fieldProps.description);
    if (fieldProps.group) fieldDef.Group = getValueOrParameter('group', fieldProps.group);
    if (fieldProps.hidden) fieldDef.Hidden = true;
    if (fieldProps.readOnly) fieldDef.ReadOnly = true;

    // Type-specific
    if (fieldProps.fieldType === 'Choice' && fieldProps.choices) {
      fieldDef.Choices = fieldProps.choices.split(',').map(c => c.trim());
    }

    if (fieldProps.fieldType === 'TaxonomyFieldType' && fieldProps.termSetId) {
      fieldDef.TermSetId = getValueOrParameter('termSetId', fieldProps.termSetId);
    }

    template.field = fieldDef;

    return JSON.stringify(template, null, 2);
  }, [fieldProps, parameters, getValueOrParameter]);

  // Generate schema based on output format
  useEffect(() => {
    if (!fieldProps.internalName) {
      setGeneratedSchema('');
      return;
    }

    let schema = '';
    switch (outputFormat) {
      case 'xml':
        schema = generateFieldXml();
        break;
      case 'fieldref':
        schema = generateFieldRefXml();
        break;
      case 'powershell':
        schema = generatePowerShell();
        break;
      case 'json':
        schema = generateJsonTemplate();
        break;
    }

    setGeneratedSchema(schema);
  }, [
    fieldProps,
    outputFormat,
    parameters,
    generateFieldXml,
    generateFieldRefXml,
    generatePowerShell,
    generateJsonTemplate,
  ]);

  // Copy output
  const copyOutput = useCallback(async (): Promise<void> => {
    if (generatedSchema) {
      await copyToClipboard(generatedSchema);
    }
  }, [generatedSchema, copyToClipboard]);

  // Clear all
  const clearAll = useCallback((): void => {
    setFieldProps({
      internalName: '',
      displayName: '',
      fieldType: 'Text',
      id: '',
      required: false,
      description: '',
      group: 'Custom Columns',
      hidden: false,
      readOnly: false,
      indexed: false,
      enforceUniqueValues: false,
      maxLength: '255',
      richText: false,
      numberOfLines: '6',
      choices: '',
      format: 'Dropdown',
      fillInChoice: false,
      min: '',
      max: '',
      decimals: '0',
      percentage: false,
      displayFormat: 'DateOnly',
      friendlyDisplayFormat: 'Disabled',
      selectionMode: 'PeopleOnly',
      allowMultiple: false,
      list: '',
      showField: 'Title',
      urlFormat: 'Hyperlink',
      formula: '',
      resultType: 'Text',
      termSetId: '',
      sspId: '',
      anchorId: '',
    });
    setParameters(new Map());
    setSelectedOOBField('');
    setGeneratedSchema('');
  }, []);

  // Load sample
  const loadSample = useCallback((): void => {
    setFieldMode('custom');
    setFieldProps({
      ...fieldProps,
      internalName: 'Department',
      displayName: 'Department',
      fieldType: 'TaxonomyFieldType',
      id: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d',
      required: false,
      description: 'Department from managed metadata',
      group: 'Custom Columns',
      termSetId: 'YOUR-TERMSET-GUID-HERE',
    });

    // Set termSetId as parameter
    setParameters(
      new Map([
        [
          'termSetId',
          {
            isParameter: true,
            parameterName: 'TERMSET_ID',
          },
        ],
      ])
    );
  }, [fieldProps]);

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyOutput,
        variant: 'primary',
        tooltip: 'Copy generated schema',
      },
    ],
    [copyOutput]
  );

  // Parameter summary
  const parameterList = useMemo(() => {
    const list: Array<{ name: string; property: string; value: string }> = [];
    parameters.forEach((config, propName) => {
      const value = (fieldProps as any)[propName];
      if (value) {
        list.push({
          name: config.parameterName,
          property: propName,
          value: value,
        });
      }
    });
    return list;
  }, [parameters, fieldProps]);

  return (
    <Card id={id} size='large'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 14 }}>
          {/* Mode Selector */}
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton
              text='New Custom Field'
              onClick={() => setFieldMode('custom')}
              primary={fieldMode === 'custom'}
              iconProps={{ iconName: 'AddField' }}
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='OOB Field Override'
              onClick={() => setFieldMode('oob')}
              primary={fieldMode === 'oob'}
              iconProps={{ iconName: 'Edit' }}
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Field Reference'
              onClick={() => setFieldMode('fieldref')}
              primary={fieldMode === 'fieldref'}
              iconProps={{ iconName: 'Link' }}
              styles={{ root: { padding: '8px 16px' } }}
            />
          </Stack>

          {/* OOB Field Selection */}
          {fieldMode === 'oob' && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Dropdown
                label='Select OOB Field'
                placeholder='Choose a SharePoint out-of-the-box field'
                options={oobFieldOptions}
                selectedKey={selectedOOBField}
                onChange={(ev, option) => option && handleOOBFieldSelect(option.key as string)}
              />
              <div
                style={{
                  fontSize: '11px',
                  color: '#003a6b',
                  padding: '10px 12px',
                  backgroundColor: '#fff4e6',
                  borderRadius: '4px',
                  border: '1px solid #ffd591',
                }}
              >
                <strong>Note:</strong> For OOB fields, Type, Internal Name, and ID cannot be changed.
                You can override: DisplayName, Required, Hidden, ReadOnly, Description, and Group.
              </div>
            </Stack>
          )}

          {/* Essential Properties */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
              border: '1px solid #b3d6fc',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#003a6b' }}>
              Essential Properties
            </h4>
            <Stack tokens={{ childrenGap: 10 }}>
              <Dropdown
                label='Field Type'
                options={fieldTypeOptions}
                selectedKey={fieldProps.fieldType}
                onChange={(ev, option) =>
                  option && setFieldProps({ ...fieldProps, fieldType: option.key as string })
                }
                required
                disabled={fieldMode === 'oob'}
              />

              <TextField
                label='Internal Name'
                value={fieldProps.internalName}
                onChange={(ev, value) => setFieldProps({ ...fieldProps, internalName: value || '' })}
                required
                maxLength={32}
                description={fieldMode === 'oob' ? 'Cannot be changed for OOB fields' : 'Max 32 characters, no spaces'}
                disabled={fieldMode === 'oob'}
              />

              <TextField
                label='Display Name'
                value={fieldProps.displayName}
                onChange={(ev, value) => setFieldProps({ ...fieldProps, displayName: value || '' })}
                required
                maxLength={255}
                description={fieldMode === 'oob' ? 'Override the display name' : undefined}
              />

              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
                <TextField
                  label='Field ID (GUID)'
                  value={fieldProps.id}
                  onChange={(ev, value) => setFieldProps({ ...fieldProps, id: value || '' })}
                  styles={{ root: { flex: 1 } }}
                  required
                  disabled={fieldMode === 'oob'}
                />
                <DefaultButton
                  text='Generate'
                  iconProps={{ iconName: 'Refresh' }}
                  onClick={generateGuid}
                  disabled={fieldMode === 'oob'}
                  title='Generate new GUID'
                />
              </Stack>

              <Checkbox
                label='Required field'
                checked={fieldProps.required}
                onChange={(ev, checked) => setFieldProps({ ...fieldProps, required: !!checked })}
              />
            </Stack>
          </div>

          {/* Type-Specific Properties */}
          {fieldProps.fieldType === 'Text' && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Label>Text Field Properties</Label>
              <TextField
                label='Maximum Length'
                type='number'
                value={fieldProps.maxLength}
                onChange={(ev, value) => setFieldProps({ ...fieldProps, maxLength: value || '255' })}
                min='1'
                max='255'
              />
            </Stack>
          )}

          {fieldProps.fieldType === 'Note' && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Label>Multi-line Text Properties</Label>
              <TextField
                label='Number of Lines'
                type='number'
                value={fieldProps.numberOfLines}
                onChange={(ev, value) =>
                  setFieldProps({ ...fieldProps, numberOfLines: value || '6' })
                }
              />
              <Checkbox
                label='Use rich text (HTML)'
                checked={fieldProps.richText}
                onChange={(ev, checked) => setFieldProps({ ...fieldProps, richText: !!checked })}
              />
            </Stack>
          )}

          {(fieldProps.fieldType === 'Choice' || fieldProps.fieldType === 'MultiChoice') && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Label>Choice Field Properties</Label>
              <TextField
                label='Choices (comma-separated)'
                value={fieldProps.choices}
                onChange={(ev, value) => setFieldProps({ ...fieldProps, choices: value || '' })}
                multiline
                rows={3}
                placeholder='Option 1, Option 2, Option 3'
              />
              <Dropdown
                label='Display Format'
                options={[
                  { key: 'Dropdown', text: 'Dropdown' },
                  { key: 'RadioButtons', text: 'Radio Buttons' },
                  { key: 'Checkboxes', text: 'Checkboxes (Multi-Choice only)' },
                ]}
                selectedKey={fieldProps.format}
                onChange={(ev, option) =>
                  option && setFieldProps({ ...fieldProps, format: option.key as string })
                }
              />
              <Checkbox
                label='Allow fill-in choices'
                checked={fieldProps.fillInChoice}
                onChange={(ev, checked) =>
                  setFieldProps({ ...fieldProps, fillInChoice: !!checked })
                }
              />
            </Stack>
          )}

          {(fieldProps.fieldType === 'Number' || fieldProps.fieldType === 'Currency') && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Label>{fieldProps.fieldType} Field Properties</Label>
              <Stack horizontal tokens={{ childrenGap: 8 }}>
                <TextField
                  label='Minimum Value'
                  type='number'
                  value={fieldProps.min}
                  onChange={(ev, value) => setFieldProps({ ...fieldProps, min: value || '' })}
                  styles={{ root: { flex: 1 } }}
                />
                <TextField
                  label='Maximum Value'
                  type='number'
                  value={fieldProps.max}
                  onChange={(ev, value) => setFieldProps({ ...fieldProps, max: value || '' })}
                  styles={{ root: { flex: 1 } }}
                />
              </Stack>
              <TextField
                label='Decimal Places'
                type='number'
                value={fieldProps.decimals}
                onChange={(ev, value) => setFieldProps({ ...fieldProps, decimals: value || '0' })}
                min='0'
                max='5'
              />
              {fieldProps.fieldType === 'Number' && (
                <Checkbox
                  label='Show as percentage'
                  checked={fieldProps.percentage}
                  onChange={(ev, checked) =>
                    setFieldProps({ ...fieldProps, percentage: !!checked })
                  }
                />
              )}
            </Stack>
          )}

          {fieldProps.fieldType === 'DateTime' && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Label>Date/Time Field Properties</Label>
              <Dropdown
                label='Display Format'
                options={[
                  { key: 'DateOnly', text: 'Date Only' },
                  { key: 'DateTime', text: 'Date & Time' },
                ]}
                selectedKey={fieldProps.displayFormat}
                onChange={(ev, option) =>
                  option && setFieldProps({ ...fieldProps, displayFormat: option.key as string })
                }
              />
              <Dropdown
                label='Friendly Display'
                options={[
                  { key: 'Disabled', text: 'Standard' },
                  { key: 'Relative', text: 'Friendly (e.g., "Today", "Yesterday")' },
                ]}
                selectedKey={fieldProps.friendlyDisplayFormat}
                onChange={(ev, option) =>
                  option &&
                  setFieldProps({ ...fieldProps, friendlyDisplayFormat: option.key as string })
                }
              />
            </Stack>
          )}

          {fieldProps.fieldType === 'User' && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Label>Person/Group Field Properties</Label>
              <Dropdown
                label='Selection Mode'
                options={[
                  { key: 'PeopleOnly', text: 'People Only' },
                  { key: 'PeopleAndGroups', text: 'People and Groups' },
                ]}
                selectedKey={fieldProps.selectionMode}
                onChange={(ev, option) =>
                  option && setFieldProps({ ...fieldProps, selectionMode: option.key as string })
                }
              />
              <Checkbox
                label='Allow multiple selections'
                checked={fieldProps.allowMultiple}
                onChange={(ev, checked) =>
                  setFieldProps({ ...fieldProps, allowMultiple: !!checked })
                }
              />
            </Stack>
          )}

          {fieldProps.fieldType === 'Lookup' && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Label>Lookup Field Properties</Label>
              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
                <TextField
                  label='Source List (Name or GUID)'
                  value={fieldProps.list}
                  onChange={(ev, value) => setFieldProps({ ...fieldProps, list: value || '' })}
                  styles={{ root: { flex: 1 } }}
                  placeholder='List name or {GUID}'
                />
                <IconButton
                  iconProps={{ iconName: parameters.has('list') ? 'PlugDisconnected' : 'PlugConnected' }}
                  title={parameters.has('list') ? 'Remove parameter' : 'Use as parameter'}
                  onClick={() => toggleParameter('list', fieldProps.list)}
                />
              </Stack>
              {parameters.has('list') && (
                <TextField
                  label='Parameter Name'
                  value={parameters.get('list')?.parameterName || ''}
                  onChange={(ev, value) => value && updateParameterName('list', value)}
                  prefix='$'
                />
              )}
              <TextField
                label='Show Field'
                value={fieldProps.showField}
                onChange={(ev, value) => setFieldProps({ ...fieldProps, showField: value || 'Title' })}
                placeholder='Title'
              />
              <Checkbox
                label='Allow multiple values'
                checked={fieldProps.allowMultiple}
                onChange={(ev, checked) =>
                  setFieldProps({ ...fieldProps, allowMultiple: !!checked })
                }
              />
            </Stack>
          )}

          {fieldProps.fieldType === 'TaxonomyFieldType' && (
            <Stack tokens={{ childrenGap: 8 }}>
              <Label>Managed Metadata Properties</Label>
              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
                <TextField
                  label='Term Set ID'
                  value={fieldProps.termSetId}
                  onChange={(ev, value) => setFieldProps({ ...fieldProps, termSetId: value || '' })}
                  styles={{ root: { flex: 1 } }}
                  placeholder='{GUID}'
                />
                <IconButton
                  iconProps={{
                    iconName: parameters.has('termSetId') ? 'PlugDisconnected' : 'PlugConnected',
                  }}
                  title={parameters.has('termSetId') ? 'Remove parameter' : 'Use as parameter'}
                  onClick={() => toggleParameter('termSetId', fieldProps.termSetId)}
                />
              </Stack>
              {parameters.has('termSetId') && (
                <TextField
                  label='Parameter Name'
                  value={parameters.get('termSetId')?.parameterName || ''}
                  onChange={(ev, value) => value && updateParameterName('termSetId', value)}
                  prefix='$'
                />
              )}
              <TextField
                label='SSP ID (Optional)'
                value={fieldProps.sspId}
                onChange={(ev, value) => setFieldProps({ ...fieldProps, sspId: value || '' })}
                placeholder='{GUID}'
              />
              <TextField
                label='Anchor ID (Optional)'
                value={fieldProps.anchorId}
                onChange={(ev, value) => setFieldProps({ ...fieldProps, anchorId: value || '' })}
                placeholder='{GUID}'
              />
            </Stack>
          )}

          {/* Advanced Properties Toggle */}
          <Toggle
            label='Show Advanced Properties'
            checked={showAdvanced}
            onChange={(ev, checked) => setShowAdvanced(!!checked)}
            onText='Hide'
            offText='Show'
          />

          {/* Advanced Properties */}
          {showAdvanced && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e1e5e9',
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>Advanced Properties</h4>
              <Stack tokens={{ childrenGap: 10 }}>
                <TextField
                  label='Description'
                  value={fieldProps.description}
                  onChange={(ev, value) => setFieldProps({ ...fieldProps, description: value || '' })}
                  multiline
                  rows={2}
                />

                <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
                  <TextField
                    label='Group'
                    value={fieldProps.group}
                    onChange={(ev, value) => setFieldProps({ ...fieldProps, group: value || '' })}
                    styles={{ root: { flex: 1 } }}
                  />
                  <IconButton
                    iconProps={{
                      iconName: parameters.has('group') ? 'PlugDisconnected' : 'PlugConnected',
                    }}
                    title={parameters.has('group') ? 'Remove parameter' : 'Use as parameter'}
                    onClick={() => toggleParameter('group', fieldProps.group)}
                  />
                </Stack>
                {parameters.has('group') && (
                  <TextField
                    label='Parameter Name'
                    value={parameters.get('group')?.parameterName || ''}
                    onChange={(ev, value) => value && updateParameterName('group', value)}
                    prefix='$'
                  />
                )}

                <Stack horizontal tokens={{ childrenGap: 12 }} wrap>
                  <Checkbox
                    label='Hidden'
                    checked={fieldProps.hidden}
                    onChange={(ev, checked) => setFieldProps({ ...fieldProps, hidden: !!checked })}
                  />
                  <Checkbox
                    label='Read-only'
                    checked={fieldProps.readOnly}
                    onChange={(ev, checked) =>
                      setFieldProps({ ...fieldProps, readOnly: !!checked })
                    }
                  />
                  <Checkbox
                    label='Indexed'
                    checked={fieldProps.indexed}
                    onChange={(ev, checked) => setFieldProps({ ...fieldProps, indexed: !!checked })}
                  />
                  <Checkbox
                    label='Enforce unique values'
                    checked={fieldProps.enforceUniqueValues}
                    onChange={(ev, checked) =>
                      setFieldProps({ ...fieldProps, enforceUniqueValues: !!checked })
                    }
                  />
                </Stack>
              </Stack>
            </div>
          )}

          {/* Parameters Summary */}
          {parameterList.length > 0 && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fff7e6',
                borderRadius: '6px',
                border: '1px solid #ffd591',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#7a4e00' }}>
                📋 Parameters Defined ({parameterList.length})
              </h4>
              <Stack tokens={{ childrenGap: 4 }}>
                {parameterList.map(param => (
                  <div key={param.name} style={{ fontSize: '11px', color: '#7a4e00' }}>
                    <strong>${param.name}</strong> → {param.property}
                    {param.value && ` (default: "${param.value}")`}
                  </div>
                ))}
              </Stack>
            </div>
          )}

          {/* Output Format Selector */}
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton
              text='Field XML'
              onClick={() => setOutputFormat('xml')}
              primary={outputFormat === 'xml'}
              iconProps={{ iconName: 'Code' }}
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='FieldRef XML'
              onClick={() => setOutputFormat('fieldref')}
              primary={outputFormat === 'fieldref'}
              iconProps={{ iconName: 'Link' }}
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='PowerShell'
              onClick={() => setOutputFormat('powershell')}
              primary={outputFormat === 'powershell'}
              iconProps={{ iconName: 'DeveloperTools' }}
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='JSON Template'
              onClick={() => setOutputFormat('json')}
              primary={outputFormat === 'json'}
              iconProps={{ iconName: 'FileCode' }}
              styles={{ root: { padding: '8px 16px' } }}
            />
          </Stack>

          {/* Generated Schema Output */}
          <div>
            <Label>Generated Schema</Label>
            <TextField
              value={generatedSchema}
              readOnly
              multiline
              rows={12}
              placeholder='Configure field properties above to generate schema...'
              styles={{
                field: {
                  fontFamily: 'Consolas, "Courier New", monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  backgroundColor: '#f8f9fa',
                  cursor: generatedSchema ? 'pointer' : 'default',
                },
              }}
              onClick={generatedSchema ? copyOutput : undefined}
              title={generatedSchema ? 'Click to copy' : ''}
            />
          </div>

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text='Copy Schema'
              iconProps={{ iconName: 'Copy' }}
              onClick={copyOutput}
              disabled={!generatedSchema}
            />
            <DefaultButton
              text='Load Sample'
              iconProps={{ iconName: 'FileCode' }}
              onClick={loadSample}
            />
            <DefaultButton text='Clear All' iconProps={{ iconName: 'Clear' }} onClick={clearAll} />
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
            >
              {copyMessage}
            </MessageBar>
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
            <strong>Tips:</strong> Use "🔗" icon to parameterize values for reusable templates • Click
            output to copy • Supports all major SharePoint field types • Perfect for PnP provisioning
            templates
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
