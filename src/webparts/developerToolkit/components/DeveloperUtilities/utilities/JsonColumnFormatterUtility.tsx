// src/DeveloperUtilities/utilities/JsonColumnFormatterUtility.tsx

import {
  DefaultButton,
  Dropdown,
  Icon,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  SearchBox,
  TextField,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { useClipboard } from '../hooks/useClipboard';
import { BaseUtilityProps } from '../types/UtilityTypes';
import {
  applyParametersToTemplate,
  COLUMN_FORMATTER_TEMPLATES,
  ColumnFormatterTemplate,
  getTemplatesByCategory,
  TemplateCategory,
  TemplateParameter,
} from '../data/columnFormatterTemplates';
import styles from './JsonColumnFormatterUtility.module.scss';

export const JsonColumnFormatterUtility: React.FC<BaseUtilityProps> = ({
  id,
  title,
  description,
}) => {
  const { copyToClipboard, copyMessage, showMessage: showCopyMessage, clearMessage } = useClipboard();
  const [localMessage, setLocalMessage] = useState<string>('');

  // State
  const [selectedTemplate, setSelectedTemplate] = useState<ColumnFormatterTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFieldType, setFilterFieldType] = useState<string>('all');
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const [editableJson, setEditableJson] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);

  // Filter options
  const categoryOptions: IDropdownOption[] = useMemo(
    () => [
      { key: 'all', text: 'All Categories' },
      { key: 'Status Indicators', text: 'Status Indicators' },
      { key: 'Data Visualizations', text: 'Data Visualizations' },
      { key: 'Person Formatting', text: 'Person Formatting' },
      { key: 'Action Buttons', text: 'Action Buttons' },
    ],
    []
  );

  const fieldTypeOptions: IDropdownOption[] = useMemo(
    () => [
      { key: 'all', text: 'All Field Types' },
      { key: 'Text', text: 'Text' },
      { key: 'Number', text: 'Number' },
      { key: 'Date', text: 'Date' },
      { key: 'Person', text: 'Person' },
      { key: 'Choice', text: 'Choice' },
      { key: 'YesNo', text: 'Yes/No' },
      { key: 'Lookup', text: 'Lookup' },
    ],
    []
  );

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    let templates = COLUMN_FORMATTER_TEMPLATES;

    // Filter by category
    if (filterCategory !== 'all') {
      templates = getTemplatesByCategory(filterCategory as TemplateCategory);
    }

    // Filter by field type
    if (filterFieldType !== 'all') {
      templates = templates.filter(t => t.fieldType === filterFieldType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      templates = templates.filter(
        t =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search)
      );
    }

    return templates;
  }, [filterCategory, filterFieldType, searchTerm]);

  // Initialize parameter values when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const defaultValues: Record<string, string> = {};
      selectedTemplate.parameters.forEach(param => {
        defaultValues[param.name] = param.defaultValue;
      });
      setParameterValues(defaultValues);
    }
  }, [selectedTemplate]);

  // Generate JSON when parameters change
  useEffect(() => {
    if (selectedTemplate) {
      const json = applyParametersToTemplate(selectedTemplate, parameterValues);
      setGeneratedJson(json);
      setEditableJson(json);
    }
  }, [selectedTemplate, parameterValues]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: ColumnFormatterTemplate): void => {
    setSelectedTemplate(template);
    setShowEditor(false);
  }, []);

  // Handle parameter change
  const handleParameterChange = useCallback((paramName: string, value: string): void => {
    setParameterValues(prev => ({
      ...prev,
      [paramName]: value,
    }));
  }, []);

  // Copy JSON
  const handleCopyJson = useCallback((): void => {
    const jsonToCopy = showEditor ? editableJson : generatedJson;
    void copyToClipboard(jsonToCopy);
  }, [showEditor, editableJson, generatedJson, copyToClipboard]);

  // Download JSON
  const handleDownloadJson = useCallback((): void => {
    const jsonToDownload = showEditor ? editableJson : generatedJson;
    const blob = new Blob([jsonToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `column-formatter-${selectedTemplate?.id || 'custom'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setLocalMessage('JSON downloaded');
    setTimeout(() => setLocalMessage(''), 3000);
  }, [showEditor, editableJson, generatedJson, selectedTemplate]);

  // Format JSON
  const handleFormatJson = useCallback((): void => {
    try {
      const formatted = JSON.stringify(JSON.parse(editableJson), null, 2);
      setEditableJson(formatted);
      setLocalMessage('JSON formatted');
      setTimeout(() => setLocalMessage(''), 3000);
    } catch (error) {
      setLocalMessage('Invalid JSON - cannot format');
      setTimeout(() => setLocalMessage(''), 3000);
    }
  }, [editableJson]);

  // Validate JSON
  const handleValidateJson = useCallback((): void => {
    try {
      JSON.parse(editableJson);
      setLocalMessage('✓ Valid JSON');
      setTimeout(() => setLocalMessage(''), 3000);
    } catch (error) {
      setLocalMessage(`✗ Invalid JSON: ${(error as Error).message}`);
      setTimeout(() => setLocalMessage(''), 3000);
    }
  }, [editableJson]);

  // Clear selection
  const handleClearSelection = useCallback((): void => {
    setSelectedTemplate(null);
    setParameterValues({});
    setGeneratedJson('');
    setEditableJson('');
    setShowEditor(false);
    clearMessage();
  }, [clearMessage]);

  // Render parameter input based on type
  const renderParameterInput = (param: TemplateParameter): JSX.Element => {
    const value = parameterValues[param.name] || param.defaultValue;

    if (param.type === 'color') {
      return (
        <div key={param.name} className={styles['parameter-input']}>
          <label>{param.label}</label>
          <div className={styles['color-input-group']}>
            <input
              type="color"
              value={value}
              onChange={e => handleParameterChange(param.name, e.target.value)}
              className={styles['color-picker']}
            />
            <TextField
              value={value}
              onChange={(e, newValue) => handleParameterChange(param.name, newValue || '')}
              placeholder={param.defaultValue}
              styles={{ root: { flex: 1 } }}
            />
          </div>
        </div>
      );
    }

    if (param.type === 'number') {
      return (
        <div key={param.name} className={styles['parameter-input']}>
          <label>{param.label}</label>
          <TextField
            type="number"
            value={value}
            onChange={(e, newValue) => handleParameterChange(param.name, newValue || '')}
            placeholder={param.defaultValue}
          />
        </div>
      );
    }

    return (
      <div key={param.name} className={styles['parameter-input']}>
        <label>{param.label}</label>
        <TextField
          value={value}
          onChange={(e, newValue) => handleParameterChange(param.name, newValue || '')}
          placeholder={param.defaultValue}
        />
      </div>
    );
  };

  // Card actions
  const cardActions: CardAction[] = useMemo(() => {
    const actions: CardAction[] = [
      {
        id: 'copy-json',
        label: 'Copy JSON',
        onClick: handleCopyJson,
        icon: 'Copy',
        disabled: !selectedTemplate,
      },
      {
        id: 'download',
        label: 'Download',
        onClick: handleDownloadJson,
        icon: 'Download',
        disabled: !selectedTemplate,
      },
      {
        id: 'clear',
        label: 'Clear',
        onClick: handleClearSelection,
        icon: 'Clear',
        disabled: !selectedTemplate,
      },
    ];
    return actions;
  }, [selectedTemplate, handleCopyJson, handleDownloadJson, handleClearSelection]);

  return (
    <Card id={id}>
      <Header actions={cardActions}>
        {title} {description && `- ${description}`}
      </Header>
      <Content>
        <div className={styles['json-formatter-container']}>
          {showCopyMessage && copyMessage && (
            <MessageBar messageBarType={MessageBarType.success} onDismiss={clearMessage}>
              {copyMessage}
            </MessageBar>
          )}
          {localMessage && (
            <MessageBar
              messageBarType={
                localMessage.startsWith('✗') ? MessageBarType.error : MessageBarType.success
              }
              onDismiss={() => setLocalMessage('')}
            >
              {localMessage}
            </MessageBar>
          )}

          {/* Template Gallery */}
          {!selectedTemplate && (
            <div className={styles['template-gallery']}>
              <div className={styles['gallery-filters']}>
                <SearchBox
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e, newValue) => setSearchTerm(newValue || '')}
                  onClear={() => setSearchTerm('')}
                  styles={{ root: { width: '100%', marginBottom: '12px' } }}
                />

                <div className={styles['filter-row']}>
                  <Dropdown
                    placeholder="Filter by category"
                    options={categoryOptions}
                    selectedKey={filterCategory}
                    onChange={(e, option) => setFilterCategory((option?.key as string) || 'all')}
                    styles={{ root: { flex: 1 } }}
                  />
                  <Dropdown
                    placeholder="Filter by field type"
                    options={fieldTypeOptions}
                    selectedKey={filterFieldType}
                    onChange={(e, option) => setFilterFieldType((option?.key as string) || 'all')}
                    styles={{ root: { flex: 1 } }}
                  />
                </div>
              </div>

              <div className={styles['template-grid']}>
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={styles['template-card']}
                    onClick={() => handleTemplateSelect(template)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleTemplateSelect(template);
                      }
                    }}
                  >
                    <div className={styles['template-header']}>
                      <h4>{template.name}</h4>
                      <span
                        className={
                          template.complexity === 'Beginner'
                            ? styles['complexity-beginner']
                            : template.complexity === 'Intermediate'
                            ? styles['complexity-intermediate']
                            : styles['complexity-advanced']
                        }
                      >
                        {template.complexity}
                      </span>
                    </div>
                    <p className={styles['template-description']}>{template.description}</p>
                    <div className={styles['template-meta']}>
                      <span className={styles['template-category']}>
                        <Icon iconName="Tag" /> {template.category}
                      </span>
                      <span className={styles['template-field-type']}>
                        <Icon iconName="TextField" /> {template.fieldType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className={styles['no-results']}>
                  <Icon iconName="SearchIssue" />
                  <p>No templates found matching your criteria</p>
                  <DefaultButton
                    text="Clear filters"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                      setFilterFieldType('all');
                    }}
                    styles={{ root: { padding: '8px 16px' } }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Template Customization */}
          {selectedTemplate && (
            <div className={styles['template-customization']}>
              <div className={styles['customization-header']}>
                <div>
                  <h4>{selectedTemplate.name}</h4>
                  <p>{selectedTemplate.description}</p>
                </div>
                <DefaultButton
                  text="Change Template"
                  iconProps={{ iconName: 'Back' }}
                  onClick={handleClearSelection}
                  styles={{ root: { padding: '8px 16px' } }}
                />
              </div>

              {/* Parameters Panel */}
              {selectedTemplate.parameters.length > 0 && (
                <div className={styles['parameters-panel']}>
                  <h5>Customize Template</h5>
                  <div className={styles['parameters-grid']}>
                    {selectedTemplate.parameters.map(param => renderParameterInput(param))}
                  </div>
                </div>
              )}

              {/* JSON Editor/Viewer */}
              <div className={styles['json-panel']}>
                <div className={styles['json-panel-header']}>
                  <h5>Column Formatter JSON</h5>
                  <div className={styles['json-panel-actions']}>
                    <DefaultButton
                      text={showEditor ? 'View Generated' : 'Edit JSON'}
                      iconProps={{ iconName: showEditor ? 'View' : 'Edit' }}
                      onClick={() => setShowEditor(!showEditor)}
                      styles={{ root: { padding: '8px 16px' } }}
                    />
                    {showEditor && (
                      <>
                        <DefaultButton
                          text="Format"
                          iconProps={{ iconName: 'AlignLeft' }}
                          onClick={handleFormatJson}
                          styles={{ root: { padding: '8px 16px' } }}
                        />
                        <DefaultButton
                          text="Validate"
                          iconProps={{ iconName: 'CheckMark' }}
                          onClick={handleValidateJson}
                          styles={{ root: { padding: '8px 16px' } }}
                        />
                      </>
                    )}
                  </div>
                </div>

                <textarea
                  className={styles['json-editor']}
                  value={showEditor ? editableJson : generatedJson}
                  onChange={e => showEditor && setEditableJson(e.target.value)}
                  readOnly={!showEditor}
                  spellCheck={false}
                />
              </div>

              {/* Required Fields Info */}
              {selectedTemplate.requiredFields.length > 0 && (
                <div className={styles['required-fields']}>
                  <Icon iconName="Info" />
                  <span>
                    <strong>Required fields in view:</strong>{' '}
                    {selectedTemplate.requiredFields.join(', ')}
                  </span>
                </div>
              )}

              {/* Apply Instructions */}
              <div className={styles['apply-instructions']}>
                <h5>How to Apply</h5>
                <ol>
                  <li>Copy the JSON above</li>
                  <li>Go to your SharePoint list</li>
                  <li>Click on the column header → Column settings → Format this column</li>
                  <li>Select "Advanced mode"</li>
                  <li>Paste the JSON and click "Save"</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </Content>
    </Card>
  );
};
