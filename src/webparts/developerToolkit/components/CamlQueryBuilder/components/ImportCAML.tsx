// src/webparts/developerToolkit/components/CamlQueryBuilder/components/ImportCAML.tsx

import * as React from 'react';
import { useCallback, useState } from 'react';
import {
  DefaultButton,
  PrimaryButton,
  TextField,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
} from '@fluentui/react';
import { IConditionGroup, IOrderByField, IFieldInfo } from '../types/CamlTypes';
import { parseCAMLXML, matchConditionsWithFields } from '../utils/camlParser';

export interface IImportCAMLProps {
  onImport: (
    group: IConditionGroup,
    orderBy: IOrderByField[],
    viewFields: string[],
    rowLimit: number | null
  ) => void;
  onClose: () => void;
  availableFields: IFieldInfo[];
}

export const ImportCAML: React.FC<IImportCAMLProps> = ({
  onImport,
  onClose,
  availableFields,
}) => {
  const [camlInput, setCamlInput] = useState<string>('');
  const [parseError, setParseError] = useState<string>('');
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [unmatchedFields, setUnmatchedFields] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseSuccess, setParseSuccess] = useState<boolean>(false);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      setCamlInput(newValue || '');
      setParseError('');
      setParseWarnings([]);
      setUnmatchedFields([]);
      setParseSuccess(false);
    },
    []
  );

  // Parse and validate the CAML
  const handleParse = useCallback((): void => {
    if (!camlInput.trim()) {
      setParseError('Please enter CAML XML to import');
      return;
    }

    setIsParsing(true);
    setParseError('');
    setParseWarnings([]);
    setUnmatchedFields([]);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const result = parseCAMLXML(camlInput);

      if (!result.success) {
        setParseError(result.error || 'Failed to parse CAML');
        setIsParsing(false);
        return;
      }

      if (result.warnings) {
        setParseWarnings(result.warnings);
      }

      // Match with available fields
      if (result.query && availableFields.length > 0) {
        const matchResult = matchConditionsWithFields(result.query, availableFields);
        if (matchResult.unmatchedFields.length > 0) {
          setUnmatchedFields(matchResult.unmatchedFields);
        }
      }

      setParseSuccess(true);
      setIsParsing(false);
    }, 100);
  }, [camlInput, availableFields]);

  // Import the parsed CAML
  const handleImport = useCallback((): void => {
    const result = parseCAMLXML(camlInput);

    if (!result.success || !result.query) {
      setParseError('Failed to import CAML');
      return;
    }

    // Match with available fields
    let queryToImport = result.query;
    if (availableFields.length > 0) {
      const matchResult = matchConditionsWithFields(result.query, availableFields);
      queryToImport = matchResult.query;
    }

    onImport(
      queryToImport.where!,
      queryToImport.orderBy,
      queryToImport.viewFields,
      queryToImport.rowLimit
    );
    onClose();
  }, [camlInput, availableFields, onImport, onClose]);

  // Clear input
  const handleClear = useCallback((): void => {
    setCamlInput('');
    setParseError('');
    setParseWarnings([]);
    setUnmatchedFields([]);
    setParseSuccess(false);
  }, []);

  // Load sample CAML
  const loadSample = useCallback((): void => {
    const sampleCAML = `<View>
  <Query>
    <Where>
      <And>
        <Eq>
          <FieldRef Name="Status"/>
          <Value Type="Choice">Active</Value>
        </Eq>
        <Geq>
          <FieldRef Name="Created"/>
          <Value Type="DateTime" IncludeTimeValue="FALSE"><Today OffsetDays="-30"/></Value>
        </Geq>
      </And>
    </Where>
    <OrderBy>
      <FieldRef Name="Modified" Ascending="FALSE"/>
    </OrderBy>
  </Query>
  <ViewFields>
    <FieldRef Name="Title"/>
    <FieldRef Name="Status"/>
    <FieldRef Name="Created"/>
  </ViewFields>
  <RowLimit>100</RowLimit>
</View>`;
    setCamlInput(sampleCAML);
    setParseError('');
    setParseWarnings([]);
    setUnmatchedFields([]);
    setParseSuccess(false);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Import CAML Query</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#605e5c' }}>
              Paste existing CAML XML to load it into the visual builder
            </p>
          </div>
          <DefaultButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClose}
            styles={{ root: { minWidth: 'auto' } }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* CAML Input */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '14px' }}>CAML XML</label>
              <DefaultButton
                text="Load Sample"
                iconProps={{ iconName: 'FileCode' }}
                onClick={loadSample}
                styles={{ root: { padding: '4px 12px', height: '28px' } }}
              />
            </div>
            <TextField
              multiline
              rows={12}
              value={camlInput}
              onChange={handleInputChange}
              placeholder={`Paste your CAML XML here...

Supported formats:
• Full <View> element with Query, ViewFields, RowLimit
• Just <Query> element with Where and OrderBy
• Just <Where> element with conditions

Example:
<View>
  <Query>
    <Where>
      <Eq>
        <FieldRef Name="Status"/>
        <Value Type="Choice">Active</Value>
      </Eq>
    </Where>
  </Query>
</View>`}
              styles={{
                field: {
                  fontFamily: 'Consolas, "Courier New", monospace',
                  fontSize: '12px',
                  lineHeight: '1.5',
                },
                fieldGroup: {
                  borderColor: parseError ? '#a80000' : parseSuccess ? '#107c10' : undefined,
                },
              }}
            />
          </div>

          {/* Parse Button */}
          <div style={{ marginBottom: '16px' }}>
            <DefaultButton
              text="Validate CAML"
              iconProps={{ iconName: 'CheckMark' }}
              onClick={handleParse}
              disabled={!camlInput.trim() || isParsing}
              styles={{ root: { marginRight: '8px' } }}
            />
            <DefaultButton
              text="Clear"
              iconProps={{ iconName: 'Clear' }}
              onClick={handleClear}
              disabled={!camlInput}
            />
            {isParsing && (
              <Spinner size={SpinnerSize.small} style={{ marginLeft: '12px', display: 'inline-block' }} />
            )}
          </div>

          {/* Error Message */}
          {parseError && (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline
              styles={{ root: { marginBottom: '12px' } }}
            >
              <strong>Parse Error:</strong> {parseError}
            </MessageBar>
          )}

          {/* Warnings */}
          {parseWarnings.length > 0 && (
            <MessageBar
              messageBarType={MessageBarType.warning}
              isMultiline
              styles={{ root: { marginBottom: '12px' } }}
            >
              <strong>Warnings:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                {parseWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </MessageBar>
          )}

          {/* Unmatched Fields */}
          {unmatchedFields.length > 0 && (
            <MessageBar
              messageBarType={MessageBarType.warning}
              isMultiline
              styles={{ root: { marginBottom: '12px' } }}
            >
              <strong>Unmatched Fields:</strong> The following fields were not found in the selected list:
              <div style={{ marginTop: '4px' }}>
                {unmatchedFields.map(field => (
                  <span
                    key={field}
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      margin: '2px 4px 2px 0',
                      background: '#fff4ce',
                      border: '1px solid #ffb900',
                      borderRadius: '3px',
                      fontSize: '12px',
                    }}
                  >
                    {field}
                  </span>
                ))}
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                These fields will be imported but may need to be updated manually.
              </p>
            </MessageBar>
          )}

          {/* Success Message */}
          {parseSuccess && !parseError && (
            <MessageBar
              messageBarType={MessageBarType.success}
              styles={{ root: { marginBottom: '12px' } }}
            >
              CAML validated successfully! Click "Import" to load it into the builder.
            </MessageBar>
          )}

          {/* Tips */}
          <div
            style={{
              padding: '12px',
              background: '#f3f2f1',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#323130',
            }}
          >
            <strong>Tips:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>You can paste CAML from SharePoint list views, PnP scripts, or other sources</li>
              <li>The parser supports special tokens like <code>&lt;Today/&gt;</code> and <code>&lt;UserID/&gt;</code></li>
              <li>Complex nested And/Or conditions are fully supported</li>
              <li>ViewFields, OrderBy, and RowLimit will also be imported if present</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #edebe9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <DefaultButton text="Cancel" onClick={onClose} />
          <PrimaryButton
            text="Import"
            iconProps={{ iconName: 'Import' }}
            onClick={handleImport}
            disabled={!parseSuccess || !!parseError}
          />
        </div>
      </div>
    </div>
  );
};
