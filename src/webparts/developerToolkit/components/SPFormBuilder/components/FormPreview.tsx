import { PrimaryButton, Stack } from '@fluentui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  FormContainer,
  FormDescription,
  FormError,
  FormErrorSummary,
  FormItem,
  FormLabel,
  FormProvider,
  FormValue,
} from 'spfx-toolkit/lib/components/spForm';
import {
  SPBooleanField,
  SPChoiceField,
  SPDateField,
  SPNumberField,
  SPTextField,
  SPUrlField,
  SPUserField,
} from 'spfx-toolkit/lib/components/spFields';
import { SPBooleanDisplayType } from 'spfx-toolkit/lib/components/spFields/SPBooleanField';
import { SPTextFieldMode } from 'spfx-toolkit/lib/components/spFields/SPTextField';
import { SPChoiceDisplayType } from 'spfx-toolkit/lib/components/spFields/types';
import { z } from 'zod';
import { IConfiguredField } from '../types/SPFormBuilderTypes';

export interface IFormPreviewProps {
  fields: IConfiguredField[];
  listTitle: string;
}

export const FormPreview: React.FC<IFormPreviewProps> = ({ fields, listTitle }) => {
  const includedFields = fields.filter(f => f.isIncluded);

  // Build Zod schema dynamically from field configurations
  const schema = React.useMemo(() => {
    const schemaFields: Record<string, any> = {};

    includedFields.forEach(field => {
      let fieldSchema: any;
      const overrides = field.validationOverrides;
      const isRequired = overrides?.overrideRequired
        ? overrides.isRequiredOverride
        : field.Required;

      switch (field.TypeAsString) {
        case 'Text':
        case 'Note': {
          fieldSchema = z.string();

          const minLength = overrides?.overrideMinLength ? overrides.minLengthOverride : undefined;
          if (minLength && minLength > 0) {
            fieldSchema = fieldSchema.min(minLength, `${field.Title} must be at least ${minLength} characters`);
          } else if (isRequired) {
            fieldSchema = fieldSchema.min(1, `${field.Title} is required`);
          }

          const maxLength = overrides?.overrideMaxLength ? overrides.maxLengthOverride : field.MaxLength;
          if (maxLength) {
            fieldSchema = fieldSchema.max(maxLength, `${field.Title} must be at most ${maxLength} characters`);
          }
          break;
        }

        case 'Number':
        case 'Currency': {
          fieldSchema = z.preprocess(
            (arg) => arg === null || arg === undefined || arg === '' ? null : Number(arg),
            z.number().nullable()
          );
          if (isRequired) {
            fieldSchema = fieldSchema.refine((val: any) => val !== null, `${field.Title} is required`);
          }

          const minValue = overrides?.overrideMin ? overrides.minOverride : field.Min;
          if (minValue !== undefined && minValue !== null) {
            fieldSchema = fieldSchema.refine((val: any) => val === null || val >= minValue, `${field.Title} must be at least ${minValue}`);
          }

          const maxValue = overrides?.overrideMax ? overrides.maxOverride : field.Max;
          if (maxValue !== undefined && maxValue !== null) {
            fieldSchema = fieldSchema.refine((val: any) => val === null || val <= maxValue, `${field.Title} must be at most ${maxValue}`);
          }
          break;
        }

        case 'Boolean':
          fieldSchema = z.boolean();
          break;

        case 'DateTime':
          fieldSchema = z.preprocess(
            (arg) => {
              if (typeof arg === 'string' || arg instanceof Date) {
                return new Date(arg);
              }
              return arg;
            },
            z.date()
          ).nullable();
          if (isRequired) {
            fieldSchema = fieldSchema.refine((val: any) => val !== null, `${field.Title} is required`);
          }
          break;

        case 'User':
          fieldSchema = z.object({ id: z.string(), email: z.string().optional(), title: z.string().optional() }).nullable();
          if (isRequired) {
            fieldSchema = fieldSchema.refine((val: any) => val !== null, `${field.Title} is required`);
          }
          break;

        case 'UserMulti':
          fieldSchema = z.array(z.object({ id: z.string(), title: z.string().optional() }));
          if (isRequired) {
            fieldSchema = fieldSchema.min(1, `${field.Title} is required`);
          }
          break;

        case 'Lookup':
          fieldSchema = z.object({ id: z.number(), title: z.string().optional() }).nullable();
          if (isRequired) {
            fieldSchema = fieldSchema.refine((val: any) => val !== null, `${field.Title} is required`);
          }
          break;

        case 'LookupMulti':
          fieldSchema = z.array(z.object({ id: z.number(), title: z.string().optional() }));
          if (isRequired) {
            fieldSchema = fieldSchema.min(1, `${field.Title} is required`);
          }
          break;

        case 'Choice':
          if (field.Choices && field.Choices.length > 0) {
            fieldSchema = z.enum(field.Choices as [string, ...string[]]);
          } else {
            fieldSchema = z.string();
          }
          break;

        case 'MultiChoice':
          if (field.Choices && field.Choices.length > 0) {
            fieldSchema = z.array(z.enum(field.Choices as [string, ...string[]]));
          } else {
            fieldSchema = z.array(z.string());
          }
          if (isRequired) {
            fieldSchema = fieldSchema.min(1, `${field.Title} is required`);
          }
          break;

        case 'URL':
          fieldSchema = z.object({ url: z.string().url(), description: z.string().optional() }).nullable();
          if (isRequired) {
            fieldSchema = fieldSchema.refine((val: any) => val !== null, `${field.Title} is required`);
          }
          break;

        case 'TaxonomyFieldType':
          fieldSchema = z.object({ label: z.string().optional(), termId: z.string().optional() }).nullable();
          if (isRequired) {
            fieldSchema = fieldSchema.refine((val: any) => val !== null, `${field.Title} is required`);
          }
          break;

        case 'TaxonomyFieldTypeMulti':
          fieldSchema = z.array(z.object({ label: z.string().optional(), termId: z.string().optional() }));
          if (isRequired) {
            fieldSchema = fieldSchema.min(1, `${field.Title} is required`);
          }
          break;

        default:
          fieldSchema = z.string();
      }

      if (!isRequired && !['UserMulti', 'LookupMulti', 'MultiChoice', 'TaxonomyFieldTypeMulti'].includes(field.TypeAsString)) {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[field.camelCaseName] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [includedFields]);

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: includedFields.reduce((acc, field) => {
      acc[field.camelCaseName] = field.defaultValue;
      return acc;
    }, {} as Record<string, any>),
  });

  const onSubmit = (data: any) => {
    console.log('SPForm Builder Preview Submission:', data);
    alert(`Form submitted successfully!\n\nCheck console for details.`);
  };

  if (includedFields.length === 0) {
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
            Load SharePoint fields to see the form preview
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
            {listTitle || 'Form'} Preview
          </h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#605e5c' }}>
            Live form with working validation - try submitting!
          </p>

          <FormProvider control={form.control as any}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormContainer labelWidth="200px">
                <Stack tokens={{ childrenGap: 12 }}>
                  {includedFields.map(field => {
                    const isRequired = field.validationOverrides?.overrideRequired
                      ? field.validationOverrides.isRequiredOverride
                      : field.Required;

                    return (
                      <FormItem key={field.InternalName} fieldName={field.camelCaseName}>
                        <FormLabel isRequired={isRequired} htmlFor={field.camelCaseName}>
                          {field.Title}
                        </FormLabel>
                        <FormValue>
                          {(field.TypeAsString === 'Text' || field.TypeAsString === 'Note') && (
                            <SPTextField
                              name={field.camelCaseName}
                              placeholder={`Enter ${field.Title}`}
                              mode={field.TypeAsString === 'Note' ? SPTextFieldMode.MultiLine : SPTextFieldMode.SingleLine}
                              rows={field.TypeAsString === 'Note' ? 4 : undefined}
                              maxLength={field.validationOverrides?.overrideMaxLength ? field.validationOverrides.maxLengthOverride : field.MaxLength || undefined}
                              showCharacterCount={field.TypeAsString === 'Text' && field.MaxLength ? true : false}
                              required={isRequired}
                            />
                          )}

                          {(field.TypeAsString === 'Number' || field.TypeAsString === 'Currency') && (
                            <SPNumberField
                              name={field.camelCaseName}
                              placeholder={`Enter ${field.Title}`}
                              min={field.validationOverrides?.overrideMin ? field.validationOverrides.minOverride : field.Min || undefined}
                              max={field.validationOverrides?.overrideMax ? field.validationOverrides.maxOverride : field.Max || undefined}
                              format={field.TypeAsString === 'Currency' ? { decimals: 2, currencyCode: 'USD' } : undefined}
                              required={isRequired}
                            />
                          )}

                          {field.TypeAsString === 'Boolean' && (
                            <SPBooleanField
                              name={field.camelCaseName}
                              label={field.Title}
                              displayType={SPBooleanDisplayType.Toggle}
                            />
                          )}

                          {field.TypeAsString === 'DateTime' && (
                            <SPDateField
                              name={field.camelCaseName}
                              placeholder={`Select ${field.Title}`}
                              required={isRequired}
                            />
                          )}

                          {field.TypeAsString === 'User' && (
                            <SPUserField
                              name={field.camelCaseName}
                              allowMultiple={false}
                              required={isRequired}
                            />
                          )}

                          {field.TypeAsString === 'UserMulti' && (
                            <SPUserField
                              name={field.camelCaseName}
                              allowMultiple={true}
                              required={isRequired}
                            />
                          )}

                          {(field.TypeAsString === 'Choice' || field.TypeAsString === 'MultiChoice') && (
                            <SPChoiceField
                              name={field.camelCaseName}
                              dataSource={{
                                type: 'static',
                                choices: field.Choices || [],
                              }}
                              allowMultiple={field.TypeAsString === 'MultiChoice'}
                              displayType={field.TypeAsString === 'MultiChoice' ? SPChoiceDisplayType.Checkboxes : SPChoiceDisplayType.Dropdown}
                              required={isRequired}
                            />
                          )}

                          {field.TypeAsString === 'Lookup' && (
                            <div style={{ padding: '8px 12px', backgroundColor: '#fff4ce', borderRadius: '4px', fontSize: '13px', color: '#605e5c' }}>
                              <strong>SPLookupField</strong> - Requires listNameOrId: "{field.LookupList || 'Not configured'}"
                            </div>
                          )}

                          {field.TypeAsString === 'LookupMulti' && (
                            <div style={{ padding: '8px 12px', backgroundColor: '#fff4ce', borderRadius: '4px', fontSize: '13px', color: '#605e5c' }}>
                              <strong>SPLookupField</strong> - Requires listNameOrId: "{field.LookupList || 'Not configured'}", allowMultiple: true
                            </div>
                          )}

                          {field.TypeAsString === 'TaxonomyFieldType' && (
                            <div style={{ padding: '8px 12px', backgroundColor: '#fff4ce', borderRadius: '4px', fontSize: '13px', color: '#605e5c' }}>
                              <strong>SPTaxonomyField</strong> - Requires termSetId: "{field.TermSetId || 'Not configured'}"
                            </div>
                          )}

                          {field.TypeAsString === 'TaxonomyFieldTypeMulti' && (
                            <div style={{ padding: '8px 12px', backgroundColor: '#fff4ce', borderRadius: '4px', fontSize: '13px', color: '#605e5c' }}>
                              <strong>SPTaxonomyField</strong> - Requires termSetId: "{field.TermSetId || 'Not configured'}", allowMultiple: true
                            </div>
                          )}

                          {field.TypeAsString === 'URL' && (
                            <SPUrlField
                              name={field.camelCaseName}
                              required={isRequired}
                            />
                          )}

                          {field.Description && (
                            <FormDescription>
                              {field.Description}
                            </FormDescription>
                          )}

                          <FormError error={form.formState.errors[field.camelCaseName]?.message as string} showIcon />
                        </FormValue>
                      </FormItem>
                    );
                  })}
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
