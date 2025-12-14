// Schema Validation Component - Validate schema and check dependencies

import * as React from 'react';
import { useMemo } from 'react';
import {
  MessageBar,
  MessageBarType,
  Icon,
  DefaultButton,
} from '@fluentui/react';
import {
  ISiteColumnSchema,
  IContentTypeSchema,
  IListSchema,
} from '../types/SchemaTypes';

export interface ISchemaValidationProps {
  selectedSiteColumns: ISiteColumnSchema[];
  selectedContentTypes: IContentTypeSchema[];
  selectedLists: IListSchema[];
  allSiteColumns: ISiteColumnSchema[];
  allContentTypes: IContentTypeSchema[];
  onSelectMissing: (category: 'siteColumns' | 'contentTypes', ids: string[]) => void;
}

interface IValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    itemIds: string[];
    category: 'siteColumns' | 'contentTypes';
  };
}

export const SchemaValidation: React.FC<ISchemaValidationProps> = ({
  selectedSiteColumns,
  selectedContentTypes,
  selectedLists,
  allSiteColumns,
  allContentTypes,
  onSelectMissing,
}) => {
  // Validate schema and find issues
  const issues = useMemo((): IValidationIssue[] => {
    const result: IValidationIssue[] = [];
    const selectedColumnIds = new Set(selectedSiteColumns.map(c => c.id));

    // Check content type dependencies
    selectedContentTypes.forEach(ct => {
      const missingFields: string[] = [];
      const missingFieldIds: string[] = [];

      ct.fieldLinks.forEach(fl => {
        // Check if field is selected
        if (!selectedColumnIds.has(fl.id)) {
          // Check if field exists in available columns
          const field = allSiteColumns.find(c => c.id === fl.id);
          if (field) {
            missingFields.push(fl.name);
            missingFieldIds.push(field.id);
          }
        }
      });

      if (missingFields.length > 0) {
        result.push({
          type: 'warning',
          category: 'Content Type',
          message: `"${ct.title}" references ${missingFields.length} site column(s) not in selection`,
          details: missingFields.join(', '),
          action: {
            label: 'Add Missing Columns',
            itemIds: missingFieldIds,
            category: 'siteColumns',
          },
        });
      }
    });

    // Check list field dependencies
    selectedLists.forEach(list => {
      // Check for lookup fields referencing other lists
      list.fields.forEach(field => {
        if (field.fieldType === 'Lookup') {
          result.push({
            type: 'info',
            category: 'List',
            message: `"${list.title}" has lookup field "${field.title}"`,
            details: 'Ensure the lookup target list is also provisioned',
          });
        }
      });

      // Check for calculated fields
      const calculatedFields = list.fields.filter(f => f.fieldType === 'Calculated');
      if (calculatedFields.length > 0) {
        result.push({
          type: 'info',
          category: 'List',
          message: `"${list.title}" has ${calculatedFields.length} calculated field(s)`,
          details: 'Calculated fields may need formula updates after provisioning',
        });
      }

      // Check for content type bindings
      if (list.contentTypesEnabled && list.contentTypes.length > 0) {
        const missingCTs = list.contentTypes.filter(ctName =>
          !selectedContentTypes.some(ct => ct.title === ctName)
        );
        if (missingCTs.length > 0) {
          const ctIds = missingCTs
            .map(name => allContentTypes.find(ct => ct.title === name)?.id)
            .filter(Boolean) as string[];

          if (ctIds.length > 0) {
            result.push({
              type: 'warning',
              category: 'List',
              message: `"${list.title}" uses content types not in selection`,
              details: missingCTs.join(', '),
              action: {
                label: 'Add Missing Content Types',
                itemIds: ctIds,
                category: 'contentTypes',
              },
            });
          }
        }
      }
    });

    // Check for circular dependencies (content types referencing each other)
    selectedContentTypes.forEach(ct => {
      if (ct.parentId) {
        const parent = allContentTypes.find(p => p.contentTypeId === ct.parentId);
        if (parent && !selectedContentTypes.some(s => s.contentTypeId === ct.parentId)) {
          result.push({
            type: 'info',
            category: 'Content Type',
            message: `"${ct.title}" has parent content type not in selection`,
            details: `Parent: ${parent.title}`,
          });
        }
      }
    });

    // Check for common issues
    selectedSiteColumns.forEach(col => {
      // Taxonomy fields need term store configuration
      if (col.fieldType === 'TaxonomyFieldType' || col.fieldType === 'TaxonomyFieldTypeMulti') {
        if (!col.termSetId) {
          result.push({
            type: 'warning',
            category: 'Site Column',
            message: `Taxonomy field "${col.title}" may need term store configuration`,
            details: 'Ensure the term set exists in the target environment',
          });
        }
      }

      // Choice fields should have choices defined
      if (col.fieldType === 'Choice' || col.fieldType === 'MultiChoice') {
        if (!col.choices || col.choices.length === 0) {
          result.push({
            type: 'info',
            category: 'Site Column',
            message: `Choice field "${col.title}" has no choices defined`,
          });
        }
      }
    });

    // Provisioning order recommendations
    if (selectedSiteColumns.length > 0 && selectedContentTypes.length > 0) {
      result.push({
        type: 'info',
        category: 'Order',
        message: 'Recommended provisioning order',
        details: 'Site Columns → Content Types → Lists',
      });
    }

    return result;
  }, [selectedSiteColumns, selectedContentTypes, selectedLists, allSiteColumns, allContentTypes]);

  // Group issues by type
  const groupedIssues = useMemo(() => {
    return {
      errors: issues.filter(i => i.type === 'error'),
      warnings: issues.filter(i => i.type === 'warning'),
      info: issues.filter(i => i.type === 'info'),
    };
  }, [issues]);

  // No issues
  if (issues.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          background: '#dff6dd',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Icon iconName="CheckMark" style={{ fontSize: '20px', color: '#107c10' }} />
        <div>
          <div style={{ fontWeight: 600, color: '#107c10' }}>Schema Valid</div>
          <div style={{ fontSize: '12px', color: '#107c10' }}>
            No dependency issues found. Ready for export.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Summary */}
      <div
        style={{
          padding: '12px 16px',
          background: '#faf9f8',
          borderRadius: '8px',
          display: 'flex',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon iconName="ErrorBadge" style={{ color: '#a80000' }} />
          <span>{groupedIssues.errors.length} Errors</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon iconName="Warning" style={{ color: '#d83b01' }} />
          <span>{groupedIssues.warnings.length} Warnings</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon iconName="Info" style={{ color: '#0078d4' }} />
          <span>{groupedIssues.info.length} Info</span>
        </div>
      </div>

      {/* Errors */}
      {groupedIssues.errors.map((issue, i) => (
        <MessageBar
          key={`error-${i}`}
          messageBarType={MessageBarType.error}
          isMultiline
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong>[{issue.category}] {issue.message}</strong>
            {issue.details && <div style={{ fontSize: '12px' }}>{issue.details}</div>}
            {issue.action && (
              <DefaultButton
                text={issue.action.label}
                iconProps={{ iconName: 'Add' }}
                onClick={() => onSelectMissing(issue.action!.category, issue.action!.itemIds)}
                styles={{ root: { marginTop: '8px', alignSelf: 'flex-start' } }}
              />
            )}
          </div>
        </MessageBar>
      ))}

      {/* Warnings */}
      {groupedIssues.warnings.map((issue, i) => (
        <MessageBar
          key={`warning-${i}`}
          messageBarType={MessageBarType.warning}
          isMultiline
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong>[{issue.category}] {issue.message}</strong>
            {issue.details && <div style={{ fontSize: '12px' }}>{issue.details}</div>}
            {issue.action && (
              <DefaultButton
                text={issue.action.label}
                iconProps={{ iconName: 'Add' }}
                onClick={() => onSelectMissing(issue.action!.category, issue.action!.itemIds)}
                styles={{ root: { marginTop: '8px', alignSelf: 'flex-start' } }}
              />
            )}
          </div>
        </MessageBar>
      ))}

      {/* Info */}
      {groupedIssues.info.map((issue, i) => (
        <MessageBar
          key={`info-${i}`}
          messageBarType={MessageBarType.info}
          isMultiline
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong>[{issue.category}] {issue.message}</strong>
            {issue.details && <div style={{ fontSize: '12px' }}>{issue.details}</div>}
          </div>
        </MessageBar>
      ))}
    </div>
  );
};
