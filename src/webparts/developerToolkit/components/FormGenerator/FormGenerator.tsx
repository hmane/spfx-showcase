import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { FieldMapper } from './services/FieldMapper';
import { FormCodeGenerator } from './services/FormCodeGenerator';
import { TypeScriptParser } from './services/TypeScriptParser';
import { ZodSchemaGenerator } from './services/ZodSchemaGenerator';
import { FieldConfiguration, FormConfiguration } from './types/FormGeneratorTypes';

export const FormGenerator: React.FC = () => {
  // State
  const [code, setCode] = useState<string>('');
  const [fields, setFields] = useState<FieldConfiguration[]>([]);
  const [interfaceName, setInterfaceName] = useState<string>('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [isParsing, setIsParsing] = useState(false);

  // Form configuration with defaults
  const formConfig: FormConfiguration = useMemo(() => ({
    name: interfaceName || 'MyForm',
    description: '',
    showErrorSummary: true,
    errorSummaryPosition: 'sticky',
    generateDefaultValues: true,
    submitHandlerType: 'console',
    validationMode: 'onSubmit',
    includeLoadingStates: true,
    includeScrollToError: true,
    includeAutoSave: false,
    layout: 'stack',
  }), [interfaceName]);

  // Parse TypeScript code
  const handleParse = useCallback(() => {
    setIsParsing(true);
    setValidationError(undefined);

    try {
      // Validate code
      const validation = TypeScriptParser.validate(code);
      if (!validation.valid) {
        setValidationError(validation.error);
        setIsParsing(false);
        return;
      }

      // Parse code
      const parsed = TypeScriptParser.parse(code);
      if (!parsed) {
        setValidationError('Failed to parse TypeScript code');
        setIsParsing(false);
        return;
      }

      // Map to field configurations
      const mappedFields = parsed.fields.map(field =>
        FieldMapper.mapFieldToConfiguration(field)
      );

      setInterfaceName(parsed.name);
      setFields(mappedFields);
      setValidationError(undefined);
    } catch (error) {
      setValidationError(error.message || 'An error occurred while parsing');
    } finally {
      setIsParsing(false);
    }
  }, [code]);

  // Update field configuration
  const handleFieldChange = useCallback((index: number, updated: FieldConfiguration) => {
    setFields(prev => {
      const newFields = [...prev];
      newFields[index] = updated;
      return newFields;
    });
  }, []);

  // Generate code
  const { zodSchema, formComponent, completeExample } = useMemo(() => {
    if (fields.length === 0 || !interfaceName) {
      return {
        zodSchema: '',
        formComponent: '',
        completeExample: '',
      };
    }

    try {
      const schema = ZodSchemaGenerator.generate(interfaceName, fields, formConfig);
      const formCode = FormCodeGenerator.generateFormOnly(interfaceName, fields, formConfig);
      const complete = FormCodeGenerator.generateComplete(interfaceName, fields, formConfig);

      return {
        zodSchema: ZodSchemaGenerator.formatCode(schema),
        formComponent: formCode,
        completeExample: complete,
      };
    } catch (error) {
      console.error('Error generating code:', error);
      return {
        zodSchema: '',
        formComponent: '',
        completeExample: '',
      };
    }
  }, [fields, interfaceName, formConfig]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#faf9f8' }}>
      {/* Header */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #edebe9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}>
          Form Generator
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#605e5c' }}>
          Generate complete forms with Zod schemas and SPForm components from TypeScript types
        </p>
      </div>

      {/* Main content - 2 rows layout with page-level scroll only */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Top row: Input and Configuration (2 columns) - no individual scrolling */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
            borderBottom: '1px solid #edebe9',
            minHeight: 'fit-content',
          }}
        >
          {/* Left: Input */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRight: '1px solid #edebe9',
              padding: '16px',
            }}
          >
            <InputPanel
              code={code}
              onChange={setCode}
              onParse={handleParse}
              validationError={validationError}
              isParsing={isParsing}
            />
          </div>

          {/* Right: Configuration */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '16px',
            }}
          >
            <ConfigurationPanel
              fields={fields}
              onFieldChange={handleFieldChange}
            />
          </div>
        </div>

        {/* Bottom row: Output (full width) - no individual scrolling */}
        <div
          style={{
            backgroundColor: '#ffffff',
            minHeight: 'fit-content',
          }}
        >
          <OutputPanel
            zodSchema={zodSchema}
            formComponent={formComponent}
            completeExample={completeExample}
            fields={fields}
            interfaceName={interfaceName}
          />
        </div>
      </div>
    </div>
  );
};

export default FormGenerator;
