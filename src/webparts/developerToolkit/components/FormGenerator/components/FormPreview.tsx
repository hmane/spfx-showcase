import { PrimaryButton, Stack } from '@fluentui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  FormContainer,
  FormError,
  FormErrorSummary,
  FormItem,
  FormLabel,
  FormProvider,
  FormValue,
} from 'spfx-toolkit/components/spForm';
import {
  SPBooleanDisplayType,
  SPBooleanField,
  SPChoiceField,
  SPDateField,
  SPNumberField,
  SPTextField,
  SPTextFieldMode,
} from 'spfx-toolkit/components/spFields';
import { z } from 'zod';
import { FieldConfiguration } from '../types/FormGeneratorTypes';

export interface IFormPreviewProps {
  fields: FieldConfiguration[];
  interfaceName: string;
}

export const FormPreview: React.FC<IFormPreviewProps> = ({ fields, interfaceName }) => {
  // Build Zod schema dynamically
  const schema = React.useMemo(() => {
    const schemaFields: Record<string, any> = {};

    fields.forEach(field => {
      let fieldSchema: any;

      switch (field.componentType) {
        case 'SPTextField':
          fieldSchema = z.string();
          if (field.minLength) fieldSchema = fieldSchema.min(field.minLength);
          if (field.maxLength) fieldSchema = fieldSchema.max(field.maxLength);
          if (field.isEmail) fieldSchema = fieldSchema.email();
          if (field.isUrl) fieldSchema = fieldSchema.url();
          break;

        case 'SPNumberField':
          fieldSchema = z.preprocess(
            (arg) => arg === null || arg === undefined || arg === '' ? null : Number(arg),
            z.number().nullable()
          );
          if (!field.isOptional) {
            fieldSchema = fieldSchema.refine((val: any) => val !== null, `${field.label} is required`);
          }
          if (field.isInteger) {
            fieldSchema = fieldSchema.refine((val: any) => val === null || Number.isInteger(val), 'Must be an integer');
          }
          if (field.min !== undefined) {
            fieldSchema = fieldSchema.refine((val: any) => val === null || val >= field.min!, `${field.label} must be at least ${field.min}`);
          }
          if (field.max !== undefined) {
            fieldSchema = fieldSchema.refine((val: any) => val === null || val <= field.max!, `${field.label} must be at most ${field.max}`);
          }
          if (field.isPositive) {
            fieldSchema = fieldSchema.refine((val: any) => val === null || val > 0, `${field.label} must be positive`);
          }
          break;

        case 'SPBooleanField':
          fieldSchema = z.boolean();
          break;

        case 'SPDateField':
          fieldSchema = z.preprocess(
            (arg) => {
              if (typeof arg === 'string' || arg instanceof Date) {
                return new Date(arg);
              }
              return arg;
            },
            z.date()
          ).nullable();
          if (!field.isOptional) {
            fieldSchema = fieldSchema.refine((val: any) => val !== null, `${field.label} is required`);
          }
          break;

        case 'SPChoiceField':
          if (field.choices && field.choices.length > 0) {
            fieldSchema = field.allowMultiple
              ? z.array(z.enum(field.choices as [string, ...string[]]))
              : z.enum(field.choices as [string, ...string[]]);
          } else {
            fieldSchema = z.string();
          }
          break;

        default:
          fieldSchema = z.string();
      }

      if (field.isOptional && field.componentType !== 'SPDateField') {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[field.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [fields]);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: fields.reduce((acc, field) => {
      if (field.componentType === 'SPTextField') acc[field.name] = '';
      else if (field.componentType === 'SPNumberField') acc[field.name] = null;
      else if (field.componentType === 'SPBooleanField') acc[field.name] = false;
      else if (field.componentType === 'SPDateField') acc[field.name] = null;
      else if (field.componentType === 'SPChoiceField') {
        acc[field.name] = field.allowMultiple ? [] : '';
      }
      else acc[field.name] = null; // For custom components like SPUserField
      return acc;
    }, {} as Record<string, any>),
  });

  const onSubmit = (data: any) => {
    console.log('Form Preview Submission:', data);
    alert(`Form submitted successfully!\n\nCheck console for details.`);
  };

  if (fields.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '32px',
          textAlign: 'center',
          color: '#605e5c',
        }}
      >
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👁️</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            No Fields to Preview
          </div>
          <div style={{ fontSize: '14px' }}>
            Parse a TypeScript type to see the form preview
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#faf9f8', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '6px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600 }}>
            {interfaceName || 'Form'} Preview
          </h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#605e5c' }}>
            Live form with working validation - try submitting!
          </p>

          <FormProvider control={form.control as any}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormContainer labelWidth="150px">
                <Stack tokens={{ childrenGap: 12 }}>
                  {fields.map(field => (
                    <FormItem key={field.name} fieldName={field.name}>
                      <FormLabel isRequired={!field.isOptional} htmlFor={field.name}>
                        {field.label}
                      </FormLabel>
                      <FormValue>
                        {field.componentType === 'SPTextField' && (
                          <SPTextField
                            name={field.name}
                            placeholder={field.placeholder}
                            mode={field.isMultiline ? SPTextFieldMode.MultiLine : SPTextFieldMode.SingleLine}
                            rows={field.rows}
                            maxLength={field.maxLength}
                            showCharacterCount={field.showCharacterCount}
                            required={!field.isOptional}
                          />
                        )}

                        {field.componentType === 'SPNumberField' && (
                          <SPNumberField
                            name={field.name}
                            placeholder={field.placeholder}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            format={{ decimals: field.decimals }}
                            required={!field.isOptional}
                          />
                        )}

                        {field.componentType === 'SPBooleanField' && (
                          <SPBooleanField
                            name={field.name}
                            label={field.label}
                            displayType={
                              field.displayType === 'toggle'
                                ? SPBooleanDisplayType.Toggle
                                : SPBooleanDisplayType.Checkbox
                            }
                            checkedText={field.checkedText}
                            uncheckedText={field.uncheckedText}
                          />
                        )}

                        {field.componentType === 'SPDateField' && (
                          <SPDateField
                            name={field.name}
                            placeholder={field.placeholder}
                            showTimePicker={field.includeTime}
                            required={!field.isOptional}
                          />
                        )}

                        {field.componentType === 'SPChoiceField' && (
                          <SPChoiceField
                            name={field.name}
                            dataSource={{
                              type: 'static',
                              choices: field.choices || [],
                            }}
                            allowMultiple={field.allowMultiple}
                            required={!field.isOptional}
                          />
                        )}

                        {!['SPTextField', 'SPNumberField', 'SPBooleanField', 'SPDateField', 'SPChoiceField'].includes(field.componentType) && (
                          <div style={{ padding: '8px 12px', backgroundColor: '#f3f2f1', borderRadius: '4px', fontSize: '13px', color: '#605e5c' }}>
                            Custom component placeholder: {field.componentType}
                          </div>
                        )}

                        <FormError error={form.formState.errors[field.name]?.message as string} showIcon />
                      </FormValue>
                    </FormItem>
                  ))}
                </Stack>
              </FormContainer>

              <div style={{ marginTop: '24px' }}>
                <FormErrorSummary position="top" clickToScroll showFieldLabels maxErrors={10} />
              </div>

              <div style={{ marginTop: '16px' }}>
                <PrimaryButton
                  type="submit"
                  text={form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
                  disabled={form.formState.isSubmitting}
                />
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};
